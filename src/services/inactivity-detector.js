const moment = require('moment');

class InactivityDetector {
    constructor(googleSheetsService) {
        this.googleSheetsService = googleSheetsService;

        // Segmentos de inatividade
        this.segmentos = {
            ULTRA_RECENTE: {
                diasMin: 0,
                diasMax: 7,
                peso: 10,
                descricao: 'Saiu essa semana',
                urgencia: 'ALTÍSSIMA',
                cor: '#ef4444'
            },
            MUITO_RECENTE: {
                diasMin: 8,
                diasMax: 15,
                peso: 9,
                descricao: 'Saiu semana passada',
                urgencia: 'MUITO_ALTA',
                cor: '#f59e0b'
            },
            RECENTE: {
                diasMin: 16,
                diasMax: 30,
                peso: 8,
                descricao: 'Saiu no mês',
                urgencia: 'ALTA',
                cor: '#fbbf24'
            },
            MODERADO: {
                diasMin: 31,
                diasMax: 45,
                peso: 6,
                descricao: '1-1.5 meses inativo',
                urgencia: 'MÉDIA',
                cor: '#10b981'
            },
            MEDIO: {
                diasMin: 46,
                diasMax: 60,
                peso: 4,
                descricao: '1.5-2 meses inativo',
                urgencia: 'MÉDIA_BAIXA',
                cor: '#3b82f6'
            },
            ANTIGO: {
                diasMin: 61,
                diasMax: 90,
                peso: 2,
                descricao: '2-3 meses inativo',
                urgencia: 'BAIXA',
                cor: '#6366f1'
            },
            MUITO_ANTIGO: {
                diasMin: 91,
                diasMax: 999999,
                peso: 1,
                descricao: '3+ meses inativo',
                urgencia: 'MUITO_BAIXA',
                cor: '#8b5cf6'
            }
        };
    }

    /**
     * Detecta e segmenta inativos por período
     */
    async detectarInativos(dataReferencia = null) {
        const agora = dataReferencia ? moment(dataReferencia) : moment();

        // Buscar inativos do Google Sheets
        const inativos = await this.buscarInativosGoogleSheets();

        // Calcular dias de inatividade e segmentar
        const segmentados = inativos.map(aluno => {
            const dataSaida = moment(aluno.dataSaida || aluno.dataUltimaAtividade);
            const diasInativo = agora.diff(dataSaida, 'days');

            const segmento = this.classificarSegmento(diasInativo);

            return {
                ...aluno,
                diasInativo,
                dataSaida: dataSaida.format('YYYY-MM-DD'),
                segmento: segmento.nome,
                segmentoDetalhes: segmento
            };
        });

        // Agrupar por segmento
        const porSegmento = this.agruparPorSegmento(segmentados);

        return {
            total: segmentados.length,
            inativos: segmentados,
            porSegmento,
            dataAnalise: agora.format('YYYY-MM-DD HH:mm:ss'),
            estatisticas: this.calcularEstatisticas(segmentados)
        };
    }

    /**
     * Classifica em qual segmento o aluno se enquadra
     */
    classificarSegmento(diasInativo) {
        for (const [nome, config] of Object.entries(this.segmentos)) {
            if (diasInativo >= config.diasMin && diasInativo <= config.diasMax) {
                return {
                    nome,
                    ...config,
                    diasInativo
                };
            }
        }

        return {
            nome: 'MUITO_ANTIGO',
            ...this.segmentos.MUITO_ANTIGO,
            diasInativo
        };
    }

    /**
     * Agrupa inativos por segmento
     */
    agruparPorSegmento(inativos) {
        const grupos = {};

        Object.keys(this.segmentos).forEach(segmento => {
            grupos[segmento] = {
                count: 0,
                alunos: [],
                config: this.segmentos[segmento]
            };
        });

        inativos.forEach(aluno => {
            const segmento = aluno.segmento;
            if (grupos[segmento]) {
                grupos[segmento].count++;
                grupos[segmento].alunos.push(aluno);
            }
        });

        return grupos;
    }

    /**
     * Calcula estatísticas gerais
     */
    calcularEstatisticas(inativos) {
        const total = inativos.length;

        if (total === 0) {
            return {
                total: 0,
                mediaInatividade: 0,
                medianaInatividade: 0,
                distribuicao: {}
            };
        }

        // Média de dias inativo
        const somaDias = inativos.reduce((sum, a) => sum + a.diasInativo, 0);
        const mediaInatividade = Math.round(somaDias / total);

        // Mediana
        const diasOrdenados = inativos.map(a => a.diasInativo).sort((a, b) => a - b);
        const meio = Math.floor(diasOrdenados.length / 2);
        const medianaInatividade = diasOrdenados.length % 2 === 0
            ? Math.round((diasOrdenados[meio - 1] + diasOrdenados[meio]) / 2)
            : diasOrdenados[meio];

        // Distribuição por urgência
        const distribuicao = {
            ALTÍSSIMA: inativos.filter(a => a.segmentoDetalhes.urgencia === 'ALTÍSSIMA').length,
            MUITO_ALTA: inativos.filter(a => a.segmentoDetalhes.urgencia === 'MUITO_ALTA').length,
            ALTA: inativos.filter(a => a.segmentoDetalhes.urgencia === 'ALTA').length,
            MÉDIA: inativos.filter(a => a.segmentoDetalhes.urgencia === 'MÉDIA').length,
            MÉDIA_BAIXA: inativos.filter(a => a.segmentoDetalhes.urgencia === 'MÉDIA_BAIXA').length,
            BAIXA: inativos.filter(a => a.segmentoDetalhes.urgencia === 'BAIXA').length,
            MUITO_BAIXA: inativos.filter(a => a.segmentoDetalhes.urgencia === 'MUITO_BAIXA').length
        };

        // Prioridades (top 100 = alta prioridade)
        const altaPrioridade = inativos.filter(a => a.diasInativo <= 30).length;
        const percentualAlta = ((altaPrioridade / total) * 100).toFixed(1);

        return {
            total,
            mediaInatividade,
            medianaInatividade,
            distribuicao,
            altaPrioridade,
            percentualAlta: `${percentualAlta}%`,
            recomendacao: this.gerarRecomendacao(altaPrioridade, total)
        };
    }

    /**
     * Gera recomendação baseada na análise
     */
    gerarRecomendacao(altaPrioridade, total) {
        const percentual = (altaPrioridade / total) * 100;

        if (percentual > 30) {
            return {
                tipo: 'URGENTE',
                acao: 'CAMPANHA_INTENSIVA',
                mensagem: `${altaPrioridade} alunos saíram recentemente (${percentual.toFixed(0)}%). AÇÃO IMEDIATA necessária para recuperação máxima!`,
                diasParaAcao: 1
            };
        } else if (percentual > 15) {
            return {
                tipo: 'IMPORTANTE',
                acao: 'CAMPANHA_REGULAR',
                mensagem: `${altaPrioridade} leads quentes disponíveis. Iniciar campanha de reativação em 2-3 dias.`,
                diasParaAcao: 3
            };
        } else {
            return {
                tipo: 'ROTINA',
                acao: 'CAMPANHA_PADRÃO',
                mensagem: 'Base estável. Manter campanha de reativação padrão.',
                diasParaAcao: 7
            };
        }
    }

    /**
     * Filtra inativos por segmento específico
     */
    filtrarPorSegmento(segmentoNome) {
        return this.detectarInativos().then(resultado => {
            const segmento = resultado.porSegmento[segmentoNome];

            if (!segmento) {
                throw new Error(`Segmento ${segmentoNome} não encontrado`);
            }

            return {
                segmento: segmentoNome,
                config: segmento.config,
                count: segmento.count,
                alunos: segmento.alunos
            };
        });
    }

    /**
     * Inativos recentes (0-30 dias) - PRIORIDADE MÁXIMA
     */
    async getInativosRecentes() {
        const resultado = await this.detectarInativos();

        const recentes = resultado.inativos.filter(a => a.diasInativo <= 30);

        return {
            total: recentes.length,
            inativos: recentes,
            urgencia: 'ALTÍSSIMA',
            prazoAcao: '24-48 horas',
            conversaoEsperada: '25-35%'
        };
    }

    /**
     * Busca inativos do Google Sheets
     */
    async buscarInativosGoogleSheets() {
        try {
            const range = 'Inativos!A2:K1000';

            const response = await this.googleSheetsService.sheets.spreadsheets.values.get({
                spreadsheetId: this.googleSheetsService.spreadsheetId,
                range
            });

            const rows = response.data.values || [];

            return rows.map(row => ({
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
            })).filter(a => a.telefone && a.telefone.length >= 10 && a.dataSaida);

        } catch (error) {
            console.error('Erro ao buscar inativos:', error);
            return [];
        }
    }

    /**
     * Exporta segmentação para CSV
     */
    async exportarSegmentacaoCSV() {
        const resultado = await this.detectarInativos();

        let csv = 'Nome,Telefone,Dias Inativo,Segmento,Urgência,Plano Anterior,Motivo Saída\n';

        resultado.inativos.forEach(aluno => {
            csv += `"${aluno.nome}","${aluno.telefone}",${aluno.diasInativo},"${aluno.segmento}","${aluno.segmentoDetalhes.urgencia}","${aluno.planoAnterior}","${aluno.motivoSaida}"\n`;
        });

        return csv;
    }

    /**
     * Dashboard visual (dados para frontend)
     */
    async getDashboardData() {
        const resultado = await this.detectarInativos();

        const chartData = Object.entries(resultado.porSegmento).map(([nome, dados]) => ({
            label: dados.config.descricao,
            value: dados.count,
            color: dados.config.cor,
            urgencia: dados.config.urgencia,
            peso: dados.config.peso
        }));

        return {
            resumo: resultado.estatisticas,
            chartSegmentos: chartData,
            topPrioridades: resultado.inativos
                .filter(a => a.diasInativo <= 30)
                .slice(0, 20),
            recomendacao: resultado.estatisticas.recomendacao
        };
    }
}

module.exports = InactivityDetector;
