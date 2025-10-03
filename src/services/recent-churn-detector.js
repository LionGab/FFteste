const moment = require('moment');

class RecentChurnDetector {
    constructor(googleSheetsService) {
        this.googleSheetsService = googleSheetsService;

        // Configuração de janelas temporais
        this.windows = {
            ULTRA_URGENTE: { dias: 7, prioridade: 'CRÍTICA', conversaoEsperada: 35 },
            MUITO_URGENTE: { dias: 15, prioridade: 'MUITO_ALTA', conversaoEsperada: 30 },
            URGENTE: { dias: 30, prioridade: 'ALTA', conversaoEsperada: 25 }
        };
    }

    /**
     * Detecta saídas recentes (<30 dias) com priorização
     */
    async detectarSaidasRecentes(diasLimite = 30) {
        console.log(`🔍 Detectando saídas dos últimos ${diasLimite} dias...`);

        // Buscar inativos
        const inativos = await this.buscarInativosGoogleSheets();

        // Filtrar apenas saídas recentes
        const dataLimite = moment().subtract(diasLimite, 'days');

        const saidasRecentes = inativos.filter(aluno => {
            const dataSaida = moment(aluno.dataSaida || aluno.dataUltimaAtividade);
            return dataSaida.isAfter(dataLimite);
        });

        // Classificar por urgência
        const classificados = saidasRecentes.map(aluno => {
            const dataSaida = moment(aluno.dataSaida);
            const diasDesde = moment().diff(dataSaida, 'days');

            const urgencia = this.classificarUrgencia(diasDesde);

            return {
                ...aluno,
                diasDesde,
                dataSaida: dataSaida.format('YYYY-MM-DD'),
                urgencia: urgencia.nome,
                prioridade: urgencia.prioridade,
                conversaoEsperada: urgencia.conversaoEsperada,
                prazoAcao: urgencia.prazoAcao,
                motivoDetalhado: this.analisarMotivo(aluno.motivoSaida)
            };
        });

        // Ordenar por urgência (mais urgente primeiro)
        const ordenados = classificados.sort((a, b) => a.diasDesde - b.diasDesde);

        console.log(`✅ ${ordenados.length} saídas recentes detectadas`);

        return {
            total: ordenados.length,
            saidas: ordenados,
            estatisticas: this.calcularEstatisticas(ordenados),
            recomendacao: this.gerarRecomendacao(ordenados)
        };
    }

    /**
     * Classifica urgência baseado nos dias desde a saída
     */
    classificarUrgencia(diasDesde) {
        if (diasDesde <= 7) {
            return {
                nome: 'ULTRA_URGENTE',
                prioridade: 'CRÍTICA',
                conversaoEsperada: 35,
                prazoAcao: '24 horas',
                cor: '#dc2626'
            };
        } else if (diasDesde <= 15) {
            return {
                nome: 'MUITO_URGENTE',
                prioridade: 'MUITO_ALTA',
                conversaoEsperada: 30,
                prazoAcao: '48 horas',
                cor: '#ea580c'
            };
        } else if (diasDesde <= 30) {
            return {
                nome: 'URGENTE',
                prioridade: 'ALTA',
                conversaoEsperada: 25,
                prazoAcao: '72 horas',
                cor: '#f59e0b'
            };
        }

        return {
            nome: 'MODERADA',
            prioridade: 'MÉDIA',
            conversaoEsperada: 20,
            prazoAcao: '1 semana',
            cor: '#10b981'
        };
    }

    /**
     * Analisa motivo de saída em detalhes
     */
    analisarMotivo(motivoSaida) {
        const motivo = (motivoSaida || '').toLowerCase();

        const analises = {
            financeiro: {
                categoria: 'FINANCEIRO',
                recuperabilidade: 'ALTA',
                abordagem: 'Oferta anual R$119 - ênfase em economia',
                argumento: 'Mostrar ROI - menos que almoço, resultado permanente',
                conversaoEsperada: '40-45%'
            },
            tempo: {
                categoria: 'TEMPO',
                recuperabilidade: 'ALTA',
                abordagem: 'Horários flexíveis + treino 30min',
                argumento: 'Academia quando VOCÊ pode + eficiência máxima',
                conversaoEsperada: '30-35%'
            },
            lesao: {
                categoria: 'SAÚDE',
                recuperabilidade: 'MÉDIA',
                abordagem: 'Retorno progressivo + acompanhamento',
                argumento: 'Segurança + treino adaptado à recuperação',
                conversaoEsperada: '25-30%'
            },
            insatisfacao: {
                categoria: 'QUALIDADE',
                recuperabilidade: 'BAIXA',
                abordagem: 'Novidades + melhorias implementadas',
                argumento: 'Mudanças realizadas + feedback valorizado',
                conversaoEsperada: '15-20%'
            },
            mudanca: {
                categoria: 'GEOGRÁFICO',
                recuperabilidade: 'MUITO_BAIXA',
                abordagem: 'Descontinuar abordagem',
                argumento: 'Impossível reverter',
                conversaoEsperada: '0-5%'
            }
        };

        // Detectar categoria
        if (motivo.includes('financeiro') || motivo.includes('dinheiro') || motivo.includes('caro')) {
            return analises.financeiro;
        }
        if (motivo.includes('tempo') || motivo.includes('horario') || motivo.includes('rotina')) {
            return analises.tempo;
        }
        if (motivo.includes('lesao') || motivo.includes('lesão') || motivo.includes('saude') || motivo.includes('saúde')) {
            return analises.lesao;
        }
        if (motivo.includes('insatisf') || motivo.includes('qualidade') || motivo.includes('atendimento')) {
            return analises.insatisfacao;
        }
        if (motivo.includes('mudanca') || motivo.includes('mudança') || motivo.includes('viagem')) {
            return analises.mudanca;
        }

        return {
            categoria: 'DESCONHECIDO',
            recuperabilidade: 'MÉDIA',
            abordagem: 'Oferta padrão + investigação',
            argumento: 'Descobrir real motivo durante conversa',
            conversaoEsperada: '20-25%'
        };
    }

    /**
     * Calcula estatísticas das saídas recentes
     */
    calcularEstatisticas(saidas) {
        const total = saidas.length;

        if (total === 0) {
            return {
                total: 0,
                porUrgencia: {},
                porMotivo: {},
                conversaoEsperadaTotal: 0,
                receitaPotencial: 0
            };
        }

        // Distribuição por urgência
        const porUrgencia = {
            ULTRA_URGENTE: saidas.filter(s => s.urgencia === 'ULTRA_URGENTE').length,
            MUITO_URGENTE: saidas.filter(s => s.urgencia === 'MUITO_URGENTE').length,
            URGENTE: saidas.filter(s => s.urgencia === 'URGENTE').length
        };

        // Distribuição por motivo
        const porMotivo = {};
        saidas.forEach(s => {
            const cat = s.motivoDetalhado.categoria;
            porMotivo[cat] = (porMotivo[cat] || 0) + 1;
        });

        // Conversão esperada total
        const conversaoEsperadaTotal = Math.round(
            saidas.reduce((sum, s) => sum + s.conversaoEsperada, 0) / total
        );

        // Receita potencial (assumindo R$119 por conversão)
        const convEsperadas = Math.round((conversaoEsperadaTotal / 100) * total);
        const receitaPotencial = convEsperadas * 119;

        return {
            total,
            porUrgencia,
            porMotivo,
            conversaoEsperadaMedia: `${conversaoEsperadaTotal}%`,
            conversoesEsperadas: convEsperadas,
            receitaPotencial: `R$ ${receitaPotencial.toLocaleString('pt-BR')}`,
            altaRecuperabilidade: saidas.filter(s =>
                s.motivoDetalhado.recuperabilidade === 'ALTA'
            ).length
        };
    }

    /**
     * Gera recomendação estratégica
     */
    gerarRecomendacao(saidas) {
        const stats = this.calcularEstatisticas(saidas);

        const ultraUrgentes = stats.porUrgencia.ULTRA_URGENTE || 0;
        const financeiros = stats.porMotivo.FINANCEIRO || 0;

        if (ultraUrgentes >= 10) {
            return {
                tipo: 'CRÍTICO',
                acao: 'CAMPANHA_EMERGENCIAL',
                prioridade: 'MÁXIMA',
                mensagem: `${ultraUrgentes} saídas nos últimos 7 dias! AÇÃO IMEDIATA necessária.`,
                passos: [
                    '1. Contatar TODOS nos próximos dias',
                    '2. Oferta máxima: R$119 anual',
                    '3. Follow-up pessoal do gerente',
                    '4. Investigar causa raiz do churn'
                ],
                metaConversao: '35%',
                prazo: '24-48 horas'
            };
        }

        if (financeiros >= total * 0.5) {
            return {
                tipo: 'OPORTUNIDADE',
                acao: 'CAMPANHA_FINANCEIRA_AGRESSIVA',
                prioridade: 'ALTA',
                mensagem: `${financeiros} saídas por motivo financeiro. Alta taxa de recuperação possível!`,
                passos: [
                    '1. Oferta anual R$119 com ênfase em economia',
                    '2. Comparar com gastos mensais (almoço, streaming)',
                    '3. Destacar ROI de saúde',
                    '4. Parcelamento se necessário'
                ],
                metaConversao: '40%',
                prazo: '72 horas'
            };
        }

        return {
            tipo: 'PADRÃO',
            acao: 'CAMPANHA_REGULAR',
            prioridade: 'NORMAL',
            mensagem: 'Saídas recentes em nível normal. Manter campanha padrão.',
            passos: [
                '1. Contatar por ordem de prioridade',
                '2. Ofertas personalizadas por motivo',
                '3. Acompanhar taxa de conversão',
                '4. Ajustar abordagem conforme resultado'
            ],
            metaConversao: '25%',
            prazo: '1 semana'
        };
    }

    /**
     * Filtra apenas os ULTRA URGENTES (7 dias)
     */
    async getUltraUrgentes() {
        const resultado = await this.detectarSaidasRecentes(30);

        const ultraUrgentes = resultado.saidas.filter(s => s.urgencia === 'ULTRA_URGENTE');

        return {
            total: ultraUrgentes.length,
            saidas: ultraUrgentes,
            prazoAcao: '24 horas',
            conversaoEsperada: '35%',
            receitaPotencial: `R$ ${Math.round(ultraUrgentes.length * 0.35 * 119)}`
        };
    }

    /**
     * Relatório de churn trend (últimos 90 dias)
     */
    async getChurnTrend() {
        const inativos = await this.buscarInativosGoogleSheets();

        const ultimos90 = inativos.filter(a => {
            const dataSaida = moment(a.dataSaida);
            return dataSaida.isAfter(moment().subtract(90, 'days'));
        });

        // Agrupar por mês
        const porMes = {};
        ultimos90.forEach(a => {
            const mes = moment(a.dataSaida).format('YYYY-MM');
            porMes[mes] = (porMes[mes] || 0) + 1;
        });

        // Calcular tendência (crescente/decrescente)
        const meses = Object.keys(porMes).sort();
        const tendencia = meses.length >= 2
            ? porMes[meses[meses.length - 1]] > porMes[meses[meses.length - 2]]
                ? 'CRESCENTE ⚠️'
                : 'DECRESCENTE ✅'
            : 'ESTÁVEL';

        return {
            periodo: '90 dias',
            totalSaidas: ultimos90.length,
            porMes,
            tendencia,
            mediaMensal: Math.round(ultimos90.length / 3),
            alertas: this.gerarAlertasChurn(porMes, ultimos90)
        };
    }

    /**
     * Gera alertas baseados no churn
     */
    gerarAlertasChurn(porMes, saidas) {
        const alertas = [];

        const meses = Object.keys(porMes).sort();
        const ultimoMes = meses[meses.length - 1];
        const saidasUltimoMes = porMes[ultimoMes];

        if (saidasUltimoMes > 30) {
            alertas.push({
                tipo: 'CRÍTICO',
                mensagem: `${saidasUltimoMes} saídas no último mês - ACIMA DO NORMAL!`,
                acao: 'Investigar causa raiz imediatamente'
            });
        }

        const motivosFrequentes = {};
        saidas.forEach(s => {
            const motivo = s.motivoSaida || 'Desconhecido';
            motivosFrequentes[motivo] = (motivosFrequentes[motivo] || 0) + 1;
        });

        const motivoPrincipal = Object.entries(motivosFrequentes)
            .sort((a, b) => b[1] - a[1])[0];

        if (motivoPrincipal && motivoPrincipal[1] > saidas.length * 0.4) {
            alertas.push({
                tipo: 'IMPORTANTE',
                mensagem: `${motivoPrincipal[1]} saídas por "${motivoPrincipal[0]}" (${((motivoPrincipal[1] / saidas.length) * 100).toFixed(0)}%)`,
                acao: 'Ação específica para este motivo'
            });
        }

        return alertas;
    }

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
            })).filter(a => a.telefone && a.dataSaida);

        } catch (error) {
            console.error('Erro ao buscar inativos:', error);
            return [];
        }
    }
}

module.exports = RecentChurnDetector;
