const moment = require('moment');

class SmartScoringEngine {
    constructor() {
        // Pesos dos critérios (total = 12)
        this.weights = {
            diasInativo: 3,      // 25% do score
            planoAnterior: 2,    // 16.67% do score
            tempoPermanencia: 2, // 16.67% do score
            motivoSaida: 4,      // 33.33% do score
            idade: 1             // 8.33% do score
        };

        // Tabelas de pontuação (0-10 para cada critério)
        this.scoringTables = {
            // Quanto mais dias inativo, MAIOR a prioridade (recente = mais quente)
            diasInativo: {
                '0-7': 10,      // Saiu essa semana - PRIORIDADE MÁXIMA
                '8-15': 9,      // Saiu semana passada - muito quente
                '16-30': 8,     // Saiu no mês - quente
                '31-45': 6,     // 1-1.5 meses - morno
                '46-60': 4,     // 1.5-2 meses - frio
                '61-90': 2,     // 2-3 meses - muito frio
                '90+': 1        // 3+ meses - congelado
            },

            // Planos mais caros = maior valor de conversão
            planoAnterior: {
                'Clube+Full': 10,      // R$119 anual - meta principal
                'Passaporte': 8,       // R$129-189 - alto valor
                'Prata': 6,            // R$119-179 - médio valor
                'Bronze': 4,           // Plano básico
                'Experimental': 2,     // Nunca pagou
                'Desconhecido': 3      // Sem informação
            },

            // Tempo de permanência = fidelidade/engajamento anterior
            tempoPermanencia: {
                '12+': 10,      // 1+ ano - super fiel
                '6-12': 8,      // 6-12 meses - fiel
                '3-6': 6,       // 3-6 meses - médio
                '1-3': 4,       // 1-3 meses - iniciante
                '0-1': 2        // Menos de 1 mês - teste
            },

            // Motivo de saída = probabilidade de retorno
            motivoSaida: {
                'financeiro': 10,           // Pode pagar agora - ALTÍSSIMA conversão
                'mudanca_cidade': 1,        // Impossível converter
                'insatisfacao_servico': 3,  // Difícil converter
                'falta_tempo': 7,           // Pode ter tempo agora - alta conversão
                'lesao_saude': 5,           // Se recuperou - média conversão
                'objetivo_atingido': 4,     // Novos objetivos - média conversão
                'preferencia_outra': 2,     // Muito difícil
                'desconhecido': 6           // Sem informação - testar
            },

            // Idade = perfil demográfico
            idade: {
                '18-25': 8,     // Alta energia, social proof
                '26-35': 10,    // Sweet spot - renda + motivação
                '36-45': 9,     // Renda alta, saúde importante
                '46-55': 7,     // Saúde crítica
                '56-65': 5,     // Limitações físicas
                '65+': 3        // Muito limitado
            }
        };
    }

    /**
     * Calcula score de 0-100 para um aluno inativo
     * @param {Object} aluno - Dados do aluno
     * @returns {Object} Score e detalhes
     */
    calculateScore(aluno) {
        const scores = {
            diasInativo: this.scoreDiasInativo(aluno.dataUltimaAtividade || aluno.dataSaida),
            planoAnterior: this.scorePlanoAnterior(aluno.planoAnterior),
            tempoPermanencia: this.scoreTempoPermanencia(aluno.dataInicio, aluno.dataSaida),
            motivoSaida: this.scoreMotivoSaida(aluno.motivoSaida),
            idade: this.scoreIdade(aluno.idade || aluno.dataNascimento)
        };

        // Score ponderado (0-100)
        const totalPeso = Object.values(this.weights).reduce((a, b) => a + b, 0);
        const scoreTotal = Math.round(
            (scores.diasInativo * this.weights.diasInativo +
             scores.planoAnterior * this.weights.planoAnterior +
             scores.tempoPermanencia * this.weights.tempoPermanencia +
             scores.motivoSaida * this.weights.motivoSaida +
             scores.idade * this.weights.idade) / totalPeso * 10
        );

        return {
            scoreTotal,
            scores,
            prioridade: this.getPrioridade(scoreTotal),
            detalhes: this.getDetalhes(aluno, scores),
            recomendacao: this.getRecomendacao(scoreTotal, aluno)
        };
    }

    scoreDiasInativo(dataReferencia) {
        if (!dataReferencia) return 5; // Média se não tem data

        const dias = moment().diff(moment(dataReferencia), 'days');

        if (dias <= 7) return 10;
        if (dias <= 15) return 9;
        if (dias <= 30) return 8;
        if (dias <= 45) return 6;
        if (dias <= 60) return 4;
        if (dias <= 90) return 2;
        return 1;
    }

    scorePlanoAnterior(plano) {
        const planoNorm = (plano || '').toLowerCase().trim();

        if (planoNorm.includes('clube') || planoNorm.includes('full')) return 10;
        if (planoNorm.includes('passaporte')) return 8;
        if (planoNorm.includes('prata')) return 6;
        if (planoNorm.includes('bronze')) return 4;
        if (planoNorm.includes('experimental') || planoNorm.includes('teste')) return 2;
        return 3;
    }

    scoreTempoPermanencia(dataInicio, dataSaida) {
        if (!dataInicio || !dataSaida) return 5;

        const meses = moment(dataSaida).diff(moment(dataInicio), 'months');

        if (meses >= 12) return 10;
        if (meses >= 6) return 8;
        if (meses >= 3) return 6;
        if (meses >= 1) return 4;
        return 2;
    }

    scoreMotivoSaida(motivo) {
        const motivoNorm = (motivo || '').toLowerCase().trim();

        if (motivoNorm.includes('financeiro') || motivoNorm.includes('dinheiro') || motivoNorm.includes('caro')) return 10;
        if (motivoNorm.includes('tempo') || motivoNorm.includes('horario')) return 7;
        if (motivoNorm.includes('saude') || motivoNorm.includes('lesao') || motivoNorm.includes('lesão')) return 5;
        if (motivoNorm.includes('objetivo') || motivoNorm.includes('meta')) return 4;
        if (motivoNorm.includes('insatisf') || motivoNorm.includes('qualidade')) return 3;
        if (motivoNorm.includes('outra') || motivoNorm.includes('concorr')) return 2;
        if (motivoNorm.includes('mudanca') || motivoNorm.includes('mudança') || motivoNorm.includes('viagem')) return 1;
        return 6; // Desconhecido - vale testar
    }

    scoreIdade(idadeOuData) {
        let idade = idadeOuData;

        if (!idade) return 5;

        // Se for data de nascimento
        if (typeof idadeOuData === 'string' && idadeOuData.includes('-')) {
            idade = moment().diff(moment(idadeOuData), 'years');
        }

        if (idade >= 26 && idade <= 35) return 10;
        if (idade >= 36 && idade <= 45) return 9;
        if (idade >= 18 && idade <= 25) return 8;
        if (idade >= 46 && idade <= 55) return 7;
        if (idade >= 56 && idade <= 65) return 5;
        return 3;
    }

    getPrioridade(score) {
        if (score >= 80) return 'MUITO_ALTA';
        if (score >= 65) return 'ALTA';
        if (score >= 50) return 'MEDIA';
        if (score >= 35) return 'BAIXA';
        return 'MUITO_BAIXA';
    }

    getDetalhes(aluno, scores) {
        const diasInativo = aluno.dataUltimaAtividade || aluno.dataSaida
            ? moment().diff(moment(aluno.dataUltimaAtividade || aluno.dataSaida), 'days')
            : 'N/A';

        return {
            nome: aluno.nome,
            diasInativo,
            planoAnterior: aluno.planoAnterior || 'Desconhecido',
            motivoSaida: aluno.motivoSaida || 'Desconhecido',
            scoreBreakdown: {
                diasInativo: `${scores.diasInativo}/10 (peso 3)`,
                planoAnterior: `${scores.planoAnterior}/10 (peso 2)`,
                tempoPermanencia: `${scores.tempoPermanencia}/10 (peso 2)`,
                motivoSaida: `${scores.motivoSaida}/10 (peso 4)`,
                idade: `${scores.idade}/10 (peso 1)`
            }
        };
    }

    getRecomendacao(score, aluno) {
        const diasInativo = aluno.dataUltimaAtividade || aluno.dataSaida
            ? moment().diff(moment(aluno.dataUltimaAtividade || aluno.dataSaida), 'days')
            : null;

        // PRIORIDADE MÁXIMA: Saiu recente + motivo financeiro
        if (diasInativo <= 30 && (aluno.motivoSaida || '').toLowerCase().includes('financeiro')) {
            return {
                template: 'urgente_financeiro',
                oferta: 'desconto_20_anual',
                timing: 'IMEDIATO',
                mensagem: 'Saída recente por motivo financeiro - CONVERTER HOJE'
            };
        }

        // ALTA: Saiu recente + falta de tempo
        if (diasInativo <= 30 && (aluno.motivoSaida || '').toLowerCase().includes('tempo')) {
            return {
                template: 'flexibilidade_horarios',
                oferta: 'primeira_semana_gratis',
                timing: 'HOJE/AMANHÃ',
                mensagem: 'Destacar horários flexíveis e conveniência'
            };
        }

        // MÉDIA: Cliente fiel que saiu
        if (score >= 50) {
            return {
                template: 'reconquista_vip',
                oferta: 'plano_anual_119',
                timing: '24-48h',
                mensagem: 'Cliente de valor - oferta exclusiva'
            };
        }

        // BAIXA: Testar com oferta genérica
        return {
            template: 'retorno_padrao',
            oferta: 'avaliacao_gratis',
            timing: '72h',
            mensagem: 'Oferta de reengajamento padrão'
        };
    }

    /**
     * Processa lista completa de inativos
     * @param {Array} inativos - Lista de alunos inativos
     * @returns {Array} Lista ordenada por score
     */
    processarLista(inativos) {
        const resultados = inativos.map(aluno => ({
            ...aluno,
            scoring: this.calculateScore(aluno)
        }));

        // Ordenar por score (maior primeiro)
        return resultados.sort((a, b) => b.scoring.scoreTotal - a.scoring.scoreTotal);
    }

    /**
     * Estatísticas da lista
     */
    getEstatisticas(resultados) {
        const total = resultados.length;
        const distribuicao = {
            MUITO_ALTA: resultados.filter(r => r.scoring.prioridade === 'MUITO_ALTA').length,
            ALTA: resultados.filter(r => r.scoring.prioridade === 'ALTA').length,
            MEDIA: resultados.filter(r => r.scoring.prioridade === 'MEDIA').length,
            BAIXA: resultados.filter(r => r.scoring.prioridade === 'BAIXA').length,
            MUITO_BAIXA: resultados.filter(r => r.scoring.prioridade === 'MUITO_BAIXA').length
        };

        const scoreMedia = Math.round(
            resultados.reduce((sum, r) => sum + r.scoring.scoreTotal, 0) / total
        );

        return {
            total,
            distribuicao,
            scoreMedia,
            top10: resultados.slice(0, 10).map(r => ({
                nome: r.nome,
                score: r.scoring.scoreTotal,
                prioridade: r.scoring.prioridade
            }))
        };
    }
}

module.exports = SmartScoringEngine;
