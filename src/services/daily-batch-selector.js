const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');

class DailyBatchSelector {
    constructor(googleSheetsService) {
        this.googleSheetsService = googleSheetsService;
        this.historico = [];
        this.historicoFile = path.join(__dirname, '../../data/historico-abordagens.json');
        this.blacklistFile = path.join(__dirname, '../../data/blacklist.json');
        this.blacklist = [];

        this.config = {
            minPorDia: 30,
            maxPorDia: 40,
            diasCooldown: 7,  // Não abordar novamente em 7 dias
            scoreMinimo: 20   // Score mínimo para considerar
        };

        this.loadHistorico();
        this.loadBlacklist();
    }

    async loadHistorico() {
        try {
            const data = await fs.readFile(this.historicoFile, 'utf-8');
            this.historico = JSON.parse(data);
        } catch (error) {
            this.historico = [];
            await this.saveHistorico();
        }
    }

    async saveHistorico() {
        try {
            await fs.mkdir(path.dirname(this.historicoFile), { recursive: true });
            await fs.writeFile(this.historicoFile, JSON.stringify(this.historico, null, 2));
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
        }
    }

    async loadBlacklist() {
        try {
            const data = await fs.readFile(this.blacklistFile, 'utf-8');
            this.blacklist = JSON.parse(data);
        } catch (error) {
            this.blacklist = [];
            await this.saveBlacklist();
        }
    }

    async saveBlacklist() {
        try {
            await fs.mkdir(path.dirname(this.blacklistFile), { recursive: true });
            await fs.writeFile(this.blacklistFile, JSON.stringify(this.blacklist, null, 2));
        } catch (error) {
            console.error('Erro ao salvar blacklist:', error);
        }
    }

    /**
     * Adiciona aluno à blacklist permanente
     */
    async adicionarBlacklist(telefone, motivo = 'Solicitação do aluno') {
        const entrada = {
            telefone,
            motivo,
            dataInclusao: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        this.blacklist.push(entrada);
        await this.saveBlacklist();

        // Atualizar Google Sheets com status
        if (this.googleSheetsService) {
            await this.googleSheetsService.atualizarStatus(telefone, 'BLACKLIST', motivo);
        }

        console.log(`❌ ${telefone} adicionado à blacklist: ${motivo}`);
    }

    /**
     * Remove da blacklist
     */
    async removerBlacklist(telefone) {
        this.blacklist = this.blacklist.filter(b => b.telefone !== telefone);
        await this.saveBlacklist();
        console.log(`✅ ${telefone} removido da blacklist`);
    }

    /**
     * Verifica se está na blacklist
     */
    estaBlacklist(telefone) {
        return this.blacklist.some(b => b.telefone === telefone);
    }

    /**
     * Verifica se aluno foi abordado recentemente
     */
    foiAbordadoRecentemente(telefone) {
        const dataLimite = moment().subtract(this.config.diasCooldown, 'days');

        return this.historico.some(h =>
            h.telefone === telefone &&
            moment(h.dataAbordagem).isAfter(dataLimite)
        );
    }

    /**
     * Registra abordagem no histórico
     */
    async registrarAbordagem(aluno, mensagem, metodo = 'whatsapp') {
        const registro = {
            telefone: aluno.telefone,
            nome: aluno.nome,
            dataAbordagem: moment().format('YYYY-MM-DD HH:mm:ss'),
            score: aluno.scoring?.scoreTotal || 0,
            mensagem,
            metodo,
            status: 'ENVIADO'
        };

        this.historico.push(registro);
        await this.saveHistorico();

        // Atualizar Google Sheets
        if (this.googleSheetsService) {
            await this.googleSheetsService.registrarAbordagem({
                telefone: aluno.telefone,
                data: registro.dataAbordagem,
                tipo: 'REATIVACAO',
                mensagem: mensagem.substring(0, 100) + '...',
                status: 'ENVIADO'
            });
        }
    }

    /**
     * Seleciona lote diário de leads
     * @param {Array} listaCompleta - Lista com scoring já calculado
     * @param {Number} quantidade - Quantidade desejada (30-40)
     * @returns {Object} Lote selecionado + estatísticas
     */
    async selecionarLoteDiario(listaCompleta, quantidade = null) {
        const qtd = quantidade || this.config.maxPorDia;

        console.log(`\n🎯 Selecionando lote diário de ${qtd} leads...`);
        console.log(`📊 Total de inativos: ${listaCompleta.length}`);

        // Filtrar candidatos válidos
        const candidatos = listaCompleta.filter(aluno => {
            // 1. Não pode estar na blacklist
            if (this.estaBlacklist(aluno.telefone)) {
                return false;
            }

            // 2. Não pode ter sido abordado nos últimos 7 dias
            if (this.foiAbordadoRecentemente(aluno.telefone)) {
                return false;
            }

            // 3. Score mínimo
            if ((aluno.scoring?.scoreTotal || 0) < this.config.scoreMinimo) {
                return false;
            }

            // 4. Precisa ter telefone válido
            if (!aluno.telefone || aluno.telefone.length < 10) {
                return false;
            }

            return true;
        });

        console.log(`✅ Candidatos elegíveis: ${candidatos.length}`);

        // Já vem ordenado por score, pegar top N
        const loteSelecionado = candidatos.slice(0, qtd);

        // Estatísticas
        const stats = {
            total: listaCompleta.length,
            candidatosElegiveis: candidatos.length,
            selecionados: loteSelecionado.length,
            blacklist: listaCompleta.filter(a => this.estaBlacklist(a.telefone)).length,
            cooldown: listaCompleta.filter(a => this.foiAbordadoRecentemente(a.telefone)).length,
            scoreBaixo: listaCompleta.filter(a => (a.scoring?.scoreTotal || 0) < this.config.scoreMinimo).length,
            distribuicaoPrioridade: {
                MUITO_ALTA: loteSelecionado.filter(a => a.scoring.prioridade === 'MUITO_ALTA').length,
                ALTA: loteSelecionado.filter(a => a.scoring.prioridade === 'ALTA').length,
                MEDIA: loteSelecionado.filter(a => a.scoring.prioridade === 'MEDIA').length,
                BAIXA: loteSelecionado.filter(a => a.scoring.prioridade === 'BAIXA').length
            },
            scoreMedio: Math.round(
                loteSelecionado.reduce((sum, a) => sum + (a.scoring?.scoreTotal || 0), 0) /
                (loteSelecionado.length || 1)
            )
        };

        return {
            lote: loteSelecionado,
            estatisticas: stats,
            data: moment().format('YYYY-MM-DD'),
            meta: {
                conversaoEsperada: Math.round(loteSelecionado.length * 0.20), // 20% conversão
                receitaEsperada: Math.round(loteSelecionado.length * 0.20 * 119) // R$119 cada
            }
        };
    }

    /**
     * Ajusta quantidade baseado em performance
     */
    async ajustarQuantidade(taxaConversaoRecente) {
        if (taxaConversaoRecente > 0.25) {
            // Performance boa - aumentar para 40
            this.config.maxPorDia = 40;
        } else if (taxaConversaoRecente < 0.15) {
            // Performance ruim - reduzir para 30 e focar em qualidade
            this.config.maxPorDia = 30;
            this.config.scoreMinimo = 30; // Score mínimo mais alto
        } else {
            // Performance ok - manter padrão
            this.config.maxPorDia = 35;
            this.config.scoreMinimo = 20;
        }

        console.log(`⚙️ Config ajustada - Max/dia: ${this.config.maxPorDia}, Score mínimo: ${this.config.scoreMinimo}`);
    }

    /**
     * Relatório de histórico
     */
    async getRelatorioHistorico(diasAtras = 30) {
        const dataLimite = moment().subtract(diasAtras, 'days');
        const registrosRecentes = this.historico.filter(h =>
            moment(h.dataAbordagem).isAfter(dataLimite)
        );

        const totalAbordagens = registrosRecentes.length;
        const alunosUnicos = new Set(registrosRecentes.map(r => r.telefone)).size;
        const scoreMedio = Math.round(
            registrosRecentes.reduce((sum, r) => sum + (r.score || 0), 0) /
            (totalAbordagens || 1)
        );

        // Agrupar por dia
        const porDia = {};
        registrosRecentes.forEach(r => {
            const dia = moment(r.dataAbordagem).format('YYYY-MM-DD');
            porDia[dia] = (porDia[dia] || 0) + 1;
        });

        return {
            periodo: `${diasAtras} dias`,
            totalAbordagens,
            alunosUnicos,
            scoreMedio,
            mediaPorDia: Math.round(totalAbordagens / diasAtras),
            distribuicaoDiaria: porDia,
            blacklistSize: this.blacklist.length
        };
    }

    /**
     * Limpar histórico antigo (> 90 dias)
     */
    async limparHistoricoAntigo() {
        const dataLimite = moment().subtract(90, 'days');
        const tamanhoAnterior = this.historico.length;

        this.historico = this.historico.filter(h =>
            moment(h.dataAbordagem).isAfter(dataLimite)
        );

        await this.saveHistorico();

        const removidos = tamanhoAnterior - this.historico.length;
        console.log(`🧹 Histórico limpo: ${removidos} registros antigos removidos`);
    }
}

module.exports = DailyBatchSelector;
