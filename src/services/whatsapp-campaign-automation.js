const moment = require('moment');
const cron = require('node-cron');

class WhatsAppCampaignAutomation {
    constructor(wahaService, googleSheetsService) {
        this.wahaService = wahaService;
        this.googleSheetsService = googleSheetsService;

        // Importar serviços necessários
        const SmartScoringEngine = require('./smart-scoring-engine');
        const DailyBatchSelector = require('./daily-batch-selector');
        const HyperPersonalizer = require('./hyper-personalizer');
        const SmartOfferGenerator = require('./smart-offer-generator');
        const InactivityDetector = require('./inactivity-detector');

        this.scoringEngine = new SmartScoringEngine();
        this.batchSelector = new DailyBatchSelector(googleSheetsService);
        this.personalizer = new HyperPersonalizer();
        this.offerGenerator = new SmartOfferGenerator();
        this.inactivityDetector = new InactivityDetector(googleSheetsService);

        this.campanhaAtiva = false;
        this.cronJobs = [];
    }

    /**
     * Inicia campanha automática diária
     */
    async iniciarCampanhaAutomatica(horario = '09:00') {
        console.log(`🚀 Iniciando campanha automática diária às ${horario}`);

        // Agendar execução diária
        const job = cron.schedule(`0 ${horario.split(':')[1]} ${horario.split(':')[0]} * * *`, async () => {
            await this.executarCampanhaDiaria();
        });

        this.cronJobs.push(job);
        this.campanhaAtiva = true;

        console.log(`✅ Campanha agendada para ${horario} todos os dias`);
    }

    /**
     * Executa campanha diária completa
     */
    async executarCampanhaDiaria() {
        console.log('\n🎯 ======= INÍCIO CAMPANHA DIÁRIA =======\n');

        try {
            // 1. Detectar e segmentar inativos
            const deteccao = await this.inactivityDetector.detectarInativos();
            console.log(`📊 ${deteccao.total} inativos detectados`);

            // 2. Calcular scoring
            const comScoring = this.scoringEngine.processarLista(deteccao.inativos);
            console.log(`🎯 Scoring calculado para ${comScoring.length} alunos`);

            // 3. Selecionar lote diário (30-40)
            const lote = await this.batchSelector.selecionarLoteDiario(comScoring, 40);
            console.log(`✅ Lote selecionado: ${lote.lote.length} leads`);

            // 4. Gerar ofertas personalizadas
            const comOfertas = this.offerGenerator.gerarOfertasLote(lote.lote);
            console.log(`💰 Ofertas geradas para ${comOfertas.length} leads`);

            // 5. Gerar mensagens personalizadas
            const comMensagens = comOfertas.map(aluno => ({
                ...aluno,
                mensagem: this.personalizer.gerarMensagem(aluno)
            }));

            console.log(`📱 Mensagens personalizadas geradas`);

            // 6. Criar relatório para aprovação
            const relatorio = this.gerarRelatorioAprovacao(comMensagens, lote.estatisticas);

            console.log('\n📋 RELATÓRIO GERADO - Aguardando aprovação manual');
            console.log(`   Acesse: http://localhost:${process.env.PORT || 4002}/api/reactivation/dashboard`);

            // Salvar lote para aprovação
            await this.salvarLoteParaAprovacao(comMensagens, relatorio);

            console.log('\n✅ ======= CAMPANHA PREPARADA =======\n');

            return {
                success: true,
                lote: comMensagens,
                estatisticas: lote.estatisticas,
                relatorio
            };

        } catch (error) {
            console.error('❌ Erro na execução da campanha:', error);
            throw error;
        }
    }

    /**
     * Executa sequência de follow-up (3 mensagens)
     */
    async executarSequenciaFollowup(aluno) {
        console.log(`📨 Iniciando sequência follow-up: ${aluno.nome} (${aluno.telefone})`);

        const sequencia = [
            {
                dia: 0,
                tipo: 'ABERTURA',
                delay: 0
            },
            {
                dia: 2,
                tipo: 'REFORCO',
                delay: 2 * 24 * 60 * 60 * 1000 // 2 dias em ms
            },
            {
                dia: 5,
                tipo: 'URGENCIA',
                delay: 5 * 24 * 60 * 60 * 1000 // 5 dias em ms
            }
        ];

        for (const etapa of sequencia) {
            try {
                // Aguardar delay
                if (etapa.delay > 0) {
                    await this.aguardar(etapa.delay);
                }

                // Gerar mensagem para a etapa
                const mensagem = this.gerarMensagemSequencia(aluno, etapa.tipo);

                // Enviar via WAHA
                await this.wahaService.sendMessage(aluno.telefone, mensagem);

                // Registrar envio
                await this.batchSelector.registrarAbordagem(aluno, mensagem, `followup_${etapa.tipo}`);

                console.log(`✅ Dia ${etapa.dia} - ${etapa.tipo} enviado: ${aluno.telefone}`);

                // Delay entre mensagens (evitar spam)
                await this.aguardar(3000);

            } catch (error) {
                console.error(`❌ Erro no dia ${etapa.dia}:`, error);
            }
        }

        console.log(`✅ Sequência completa para ${aluno.telefone}`);
    }

    /**
     * Gera mensagem para cada etapa da sequência
     */
    gerarMensagemSequencia(aluno, tipo) {
        const nome = aluno.nome.split(' ')[0];

        switch (tipo) {
            case 'ABERTURA':
                return this.personalizer.gerarMensagem(aluno).mensagem;

            case 'REFORCO':
                return `
${nome}, tudo bem? 👋

Sei que você viu minha mensagem sobre o Plano Anual R$ 119...

Só passando pra reforçar que são POUCAS VAGAS nessa condição especial!

Já temos ${Math.floor(Math.random() * 8) + 3} ex-alunos confirmados. 🔥

Posso garantir a sua vaga agora?
                `.trim();

            case 'URGENCIA':
                return `
${nome}! ⏰

ÚLTIMA CHANCE - condição especial acaba HOJE!

R$ 119 ANUAL
(menos de R$ 10/mês)

Amanhã volta ao preço normal (R$ 179/mês).

Confirma pra mim AGORA? Só dizer SIM! 💪
                `.trim();

            default:
                return this.personalizer.gerarMensagem(aluno).mensagem;
        }
    }

    /**
     * Envia mensagens para lote aprovado
     */
    async enviarLoteAprovado(leads) {
        console.log(`\n📤 Enviando ${leads.length} mensagens aprovadas...\n`);

        const resultados = [];
        let enviados = 0;
        let falhas = 0;

        for (const lead of leads) {
            try {
                // Enviar mensagem
                const mensagem = lead.mensagem?.mensagem || lead.mensagemData?.mensagem;

                await this.wahaService.sendMessage(lead.telefone, mensagem);

                // Registrar
                await this.batchSelector.registrarAbordagem(lead, mensagem);

                resultados.push({
                    telefone: lead.telefone,
                    nome: lead.nome,
                    status: 'ENVIADO',
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
                });

                enviados++;
                console.log(`✅ ${enviados}/${leads.length} - ${lead.nome} (${lead.telefone})`);

                // Delay entre mensagens (2-5 segundos aleatório)
                const delay = Math.random() * 3000 + 2000;
                await this.aguardar(delay);

            } catch (error) {
                console.error(`❌ Erro ao enviar para ${lead.telefone}:`, error.message);

                resultados.push({
                    telefone: lead.telefone,
                    nome: lead.nome,
                    status: 'ERRO',
                    erro: error.message
                });

                falhas++;
            }
        }

        console.log(`\n✅ Envio concluído: ${enviados} enviados, ${falhas} falhas\n`);

        // Registrar no Google Sheets
        await this.registrarCampanhaSheets(resultados);

        return {
            total: leads.length,
            enviados,
            falhas,
            resultados
        };
    }

    /**
     * Gera relatório de aprovação
     */
    gerarRelatorioAprovacao(leads, estatisticas) {
        const conversaoEsperada = Math.round(leads.length * 0.20);
        const receitaEsperada = conversaoEsperada * 119;

        return {
            data: moment().format('YYYY-MM-DD'),
            totalLeads: leads.length,
            distribuicao: estatisticas.distribuicaoPrioridade,
            scoreMedio: estatisticas.scoreMedio,
            conversaoEsperada,
            receitaEsperada,
            roi: ((receitaEsperada / (leads.length * 5)) * 100).toFixed(0) + '%', // Custo médio R$5/lead
            status: 'AGUARDANDO_APROVACAO'
        };
    }

    /**
     * Salva lote para aprovação manual
     */
    async salvarLoteParaAprovacao(lote, relatorio) {
        const fs = require('fs').promises;
        const path = require('path');

        const arquivo = path.join(__dirname, '../../data/lote-aprovacao.json');

        await fs.mkdir(path.dirname(arquivo), { recursive: true });
        await fs.writeFile(arquivo, JSON.stringify({
            lote,
            relatorio,
            dataGeracao: moment().format('YYYY-MM-DD HH:mm:ss')
        }, null, 2));

        console.log(`💾 Lote salvo para aprovação: ${arquivo}`);
    }

    /**
     * Registra campanha no Google Sheets
     */
    async registrarCampanhaSheets(resultados) {
        try {
            const values = resultados.map(r => [
                r.timestamp || moment().format('YYYY-MM-DD HH:mm:ss'),
                r.telefone,
                r.nome,
                r.status,
                r.erro || '',
                'REATIVACAO_DIARIA'
            ]);

            await this.googleSheetsService.sheets.spreadsheets.values.append({
                spreadsheetId: this.googleSheetsService.spreadsheetId,
                range: 'Campanhas!A:F',
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            console.log('✅ Campanha registrada no Google Sheets');

        } catch (error) {
            console.error('❌ Erro ao registrar no Sheets:', error);
        }
    }

    /**
     * Para campanha automática
     */
    pararCampanha() {
        this.cronJobs.forEach(job => job.stop());
        this.campanhaAtiva = false;
        console.log('⏸️ Campanha automática pausada');
    }

    /**
     * Status da campanha
     */
    getStatus() {
        return {
            campanhaAtiva: this.campanhaAtiva,
            jobsAtivos: this.cronJobs.length,
            ultimaExecucao: this.ultimaExecucao || 'Nunca executada'
        };
    }

    /**
     * Aguardar delay
     */
    aguardar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Teste completo do sistema
     */
    async testarSistema() {
        console.log('\n🧪 ===== TESTE DO SISTEMA =====\n');

        try {
            // 1. Testar detecção
            const deteccao = await this.inactivityDetector.detectarInativos();
            console.log(`✅ Detecção: ${deteccao.total} inativos`);

            // 2. Testar scoring
            const comScoring = this.scoringEngine.processarLista(deteccao.inativos.slice(0, 5));
            console.log(`✅ Scoring: ${comScoring.length} processados`);

            // 3. Testar personalização
            const mensagem = this.personalizer.gerarMensagem(comScoring[0]);
            console.log(`✅ Mensagem gerada: ${mensagem.mensagem.substring(0, 50)}...`);

            // 4. Testar oferta
            const oferta = this.offerGenerator.gerarOferta(comScoring[0]);
            console.log(`✅ Oferta: ${oferta.nome}`);

            console.log('\n✅ Sistema funcionando corretamente!\n');

            return {
                success: true,
                deteccao: deteccao.total,
                scoring: comScoring.length,
                mensagem: mensagem.mensagem.length,
                oferta: oferta.nome
            };

        } catch (error) {
            console.error('❌ Erro no teste:', error);
            throw error;
        }
    }
}

module.exports = WhatsAppCampaignAutomation;
