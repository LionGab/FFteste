const express = require('express');
const router = express.Router();
const SmartScoringEngine = require('../services/smart-scoring-engine');
const DailyBatchSelector = require('../services/daily-batch-selector');
const HyperPersonalizer = require('../services/hyper-personalizer');

class ReactivationAPI {
    constructor(googleSheetsService, wahaService) {
        this.googleSheetsService = googleSheetsService;
        this.wahaService = wahaService;

        this.scoringEngine = new SmartScoringEngine();
        this.batchSelector = new DailyBatchSelector(googleSheetsService);
        this.personalizer = new HyperPersonalizer();

        this.setupRoutes();
    }

    setupRoutes() {
        // Dashboard HTML
        router.get('/dashboard', (req, res) => {
            res.sendFile('dashboard-approval.html', { root: __dirname + '/..' });
        });

        // Carregar lote diário
        router.get('/daily-batch', async (req, res) => {
            try {
                // 1. Buscar inativos do Google Sheets
                const inativos = await this.buscarInativosGoogleSheets();

                // 2. Calcular scoring
                const comScoring = this.scoringEngine.processarLista(inativos);

                // 3. Selecionar lote diário
                const resultado = await this.batchSelector.selecionarLoteDiario(comScoring);

                // 4. Gerar mensagens personalizadas
                const loteComMensagens = resultado.lote.map(aluno => ({
                    ...aluno,
                    mensagemData: this.personalizer.gerarMensagem(aluno)
                }));

                res.json({
                    lote: loteComMensagens,
                    estatisticas: resultado.estatisticas,
                    meta: resultado.meta,
                    data: resultado.data
                });

            } catch (error) {
                console.error('Erro ao gerar lote diário:', error);
                res.status(500).json({
                    error: 'Erro ao gerar lote diário',
                    details: error.message
                });
            }
        });

        // Enviar mensagens aprovadas
        router.post('/send-approved', async (req, res) => {
            try {
                const { leads } = req.body;

                if (!leads || !Array.isArray(leads)) {
                    return res.status(400).json({ error: 'Leads inválidos' });
                }

                const resultados = [];

                for (const lead of leads) {
                    try {
                        // Enviar via WAHA
                        await this.wahaService.sendMessage(
                            lead.telefone,
                            lead.mensagemData.mensagem
                        );

                        // Registrar abordagem
                        await this.batchSelector.registrarAbordagem(
                            lead,
                            lead.mensagemData.mensagem
                        );

                        resultados.push({
                            telefone: lead.telefone,
                            status: 'ENVIADO',
                            timestamp: new Date().toISOString()
                        });

                        // Delay entre mensagens (evitar spam)
                        await this.delay(2000);

                    } catch (error) {
                        console.error(`Erro ao enviar para ${lead.telefone}:`, error);
                        resultados.push({
                            telefone: lead.telefone,
                            status: 'ERRO',
                            erro: error.message
                        });
                    }
                }

                const enviados = resultados.filter(r => r.status === 'ENVIADO').length;
                const falhas = resultados.filter(r => r.status === 'ERRO').length;

                res.json({
                    success: true,
                    enviados,
                    falhas,
                    resultados
                });

            } catch (error) {
                console.error('Erro ao enviar aprovados:', error);
                res.status(500).json({
                    error: 'Erro ao enviar mensagens',
                    details: error.message
                });
            }
        });

        // Adicionar à blacklist
        router.post('/blacklist', async (req, res) => {
            try {
                const { telefone, motivo } = req.body;

                await this.batchSelector.adicionarBlacklist(telefone, motivo);

                res.json({
                    success: true,
                    message: `${telefone} adicionado à blacklist`
                });

            } catch (error) {
                res.status(500).json({
                    error: 'Erro ao adicionar blacklist',
                    details: error.message
                });
            }
        });

        // Remover da blacklist
        router.delete('/blacklist/:telefone', async (req, res) => {
            try {
                const { telefone } = req.params;

                await this.batchSelector.removerBlacklist(telefone);

                res.json({
                    success: true,
                    message: `${telefone} removido da blacklist`
                });

            } catch (error) {
                res.status(500).json({
                    error: 'Erro ao remover blacklist',
                    details: error.message
                });
            }
        });

        // Relatório de histórico
        router.get('/historico', async (req, res) => {
            try {
                const { dias = 30 } = req.query;

                const relatorio = await this.batchSelector.getRelatorioHistorico(parseInt(dias));

                res.json(relatorio);

            } catch (error) {
                res.status(500).json({
                    error: 'Erro ao gerar relatório',
                    details: error.message
                });
            }
        });

        // Estatísticas de scoring
        router.get('/stats/scoring', async (req, res) => {
            try {
                const inativos = await this.buscarInativosGoogleSheets();
                const comScoring = this.scoringEngine.processarLista(inativos);
                const stats = this.scoringEngine.getEstatisticas(comScoring);

                res.json(stats);

            } catch (error) {
                res.status(500).json({
                    error: 'Erro ao gerar estatísticas',
                    details: error.message
                });
            }
        });

        // Testar template
        router.post('/test-template', async (req, res) => {
            try {
                const { tipo, alunoTeste } = req.body;

                const resultado = this.personalizer.testarTemplate(tipo, alunoTeste);

                res.json(resultado);

            } catch (error) {
                res.status(500).json({
                    error: 'Erro ao testar template',
                    details: error.message
                });
            }
        });
    }

    async buscarInativosGoogleSheets() {
        try {
            // Buscar da aba "Inativos" do Google Sheets
            const range = 'Inativos!A2:K1000'; // Ajustar range conforme necessário

            const response = await this.googleSheetsService.sheets.spreadsheets.values.get({
                spreadsheetId: this.googleSheetsService.spreadsheetId,
                range
            });

            const rows = response.data.values || [];

            // Mapear colunas para objeto
            const inativos = rows.map(row => ({
                nome: row[0] || '',
                telefone: row[1] || '',
                planoAnterior: row[2] || '',
                dataInicio: row[3] || '',
                dataSaida: row[4] || '',
                dataUltimaAtividade: row[5] || row[4],
                motivoSaida: row[6] || '',
                idade: row[7] || '',
                dataNascimento: row[8] || '',
                email: row[9] || '',
                observacoes: row[10] || ''
            })).filter(a => a.telefone && a.telefone.length >= 10);

            console.log(`📊 ${inativos.length} inativos carregados do Google Sheets`);

            return inativos;

        } catch (error) {
            console.error('Erro ao buscar inativos:', error);

            // Fallback: retornar dados de exemplo se Google Sheets não estiver configurado
            return this.getDadosExemplo();
        }
    }

    getDadosExemplo() {
        return [
            {
                nome: 'João Silva',
                telefone: '66999991111',
                planoAnterior: 'Prata',
                dataInicio: '2023-06-15',
                dataSaida: '2024-11-20',
                motivoSaida: 'financeiro',
                idade: 32
            },
            {
                nome: 'Maria Santos',
                telefone: '66999992222',
                planoAnterior: 'Clube+Full',
                dataInicio: '2023-01-10',
                dataSaida: '2024-11-25',
                motivoSaida: 'falta de tempo',
                idade: 28
            },
            {
                nome: 'Pedro Oliveira',
                telefone: '66999993333',
                planoAnterior: 'Passaporte',
                dataInicio: '2022-08-20',
                dataSaida: '2024-10-30',
                motivoSaida: 'lesão',
                idade: 45
            }
        ];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = (googleSheetsService, wahaService) => {
    const api = new ReactivationAPI(googleSheetsService, wahaService);
    return router;
};
