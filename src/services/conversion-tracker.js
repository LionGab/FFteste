const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');

class ConversionTracker {
    constructor(googleSheetsService) {
        this.googleSheetsService = googleSheetsService;
        this.conversionsFile = path.join(__dirname, '../../data/conversions.json');
        this.abTestsFile = path.join(__dirname, '../../data/ab-tests.json');

        this.conversions = [];
        this.abTests = [];
        this.testesAtivos = new Map();

        this.loadData();
    }

    async loadData() {
        try {
            const convData = await fs.readFile(this.conversionsFile, 'utf-8');
            this.conversions = JSON.parse(convData);
        } catch {
            this.conversions = [];
        }

        try {
            const abData = await fs.readFile(this.abTestsFile, 'utf-8');
            this.abTests = JSON.parse(abData);
        } catch {
            this.abTests = [];
        }
    }

    async saveData() {
        await fs.mkdir(path.dirname(this.conversionsFile), { recursive: true });
        await fs.writeFile(this.conversionsFile, JSON.stringify(this.conversions, null, 2));
        await fs.writeFile(this.abTestsFile, JSON.stringify(this.abTests, null, 2));
    }

    /**
     * Registra conversão
     */
    async registrarConversao(dados) {
        const conversao = {
            id: this.gerarId(),
            telefone: dados.telefone,
            nome: dados.nome,
            planoVendido: dados.plano,
            valorConversao: parseFloat(dados.valor),
            dataConversao: moment().format('YYYY-MM-DD HH:mm:ss'),
            diasParaConversao: dados.diasParaConversao || 0,
            fonte: dados.fonte || 'REATIVACAO',
            scoringOriginal: dados.scoring || null,
            templateUsado: dados.template || null,
            ofertaUsada: dados.oferta || null,
            varianteAB: dados.varianteAB || null,
            metadados: dados.metadados || {}
        };

        this.conversions.push(conversao);
        await this.saveData();

        // Atualizar Google Sheets
        if (this.googleSheetsService) {
            await this.registrarConversaoSheets(conversao);
        }

        // Atualizar teste A/B se houver
        if (conversao.varianteAB) {
            await this.atualizarTesteAB(conversao.varianteAB, 'conversao');
        }

        console.log(`💰 CONVERSÃO: ${conversao.nome} - ${conversao.planoVendido} - R$ ${conversao.valorConversao}`);

        return conversao;
    }

    /**
     * Registra lead contatado (para cálculo de taxa)
     */
    async registrarContatado(telefone, dados = {}) {
        const registro = {
            telefone,
            dataContato: moment().format('YYYY-MM-DD HH:mm:ss'),
            templateUsado: dados.template,
            ofertaUsada: dados.oferta,
            varianteAB: dados.varianteAB,
            scoring: dados.scoring
        };

        // Atualizar teste A/B se houver
        if (registro.varianteAB) {
            await this.atualizarTesteAB(registro.varianteAB, 'envio');
        }

        return registro;
    }

    /**
     * Cria teste A/B
     */
    criarTesteAB(config) {
        const teste = {
            id: this.gerarId(),
            nome: config.nome,
            descricao: config.descricao,
            dataInicio: moment().format('YYYY-MM-DD'),
            dataFim: config.dataFim || moment().add(30, 'days').format('YYYY-MM-DD'),
            variantes: config.variantes.map((v, i) => ({
                id: `${config.nome}_V${i + 1}`,
                nome: v.nome,
                template: v.template,
                oferta: v.oferta,
                mensagem: v.mensagem,
                envios: 0,
                conversoes: 0,
                taxaConversao: 0,
                receitaGerada: 0
            })),
            status: 'ATIVO',
            vencedor: null
        };

        this.abTests.push(teste);
        this.testesAtivos.set(teste.id, teste);

        console.log(`🧪 Teste A/B criado: ${teste.nome}`);

        return teste;
    }

    /**
     * Seleciona variante para lead (distribuição 50/50 ou customizada)
     */
    selecionarVariante(testeId, distribuicao = [50, 50]) {
        const teste = this.testesAtivos.get(testeId) || this.abTests.find(t => t.id === testeId);

        if (!teste || teste.status !== 'ATIVO') {
            return null;
        }

        // Distribuição aleatória baseada nos pesos
        const total = distribuicao.reduce((a, b) => a + b, 0);
        const random = Math.random() * total;

        let acumulado = 0;
        for (let i = 0; i < teste.variantes.length; i++) {
            acumulado += distribuicao[i];
            if (random <= acumulado) {
                return teste.variantes[i];
            }
        }

        return teste.variantes[0];
    }

    /**
     * Atualiza métricas do teste A/B
     */
    async atualizarTesteAB(varianteId, tipo) {
        const teste = this.abTests.find(t =>
            t.variantes.some(v => v.id === varianteId)
        );

        if (!teste) return;

        const variante = teste.variantes.find(v => v.id === varianteId);

        if (tipo === 'envio') {
            variante.envios++;
        } else if (tipo === 'conversao') {
            variante.conversoes++;

            // Buscar valor da conversão
            const conversao = this.conversions.find(c => c.varianteAB === varianteId);
            if (conversao) {
                variante.receitaGerada += conversao.valorConversao;
            }
        }

        // Recalcular taxa de conversão
        variante.taxaConversao = variante.envios > 0
            ? ((variante.conversoes / variante.envios) * 100).toFixed(2)
            : 0;

        await this.saveData();
    }

    /**
     * Finaliza teste A/B e declara vencedor
     */
    async finalizarTesteAB(testeId) {
        const index = this.abTests.findIndex(t => t.id === testeId);

        if (index === -1) {
            throw new Error('Teste não encontrado');
        }

        const teste = this.abTests[index];

        // Determinar vencedor (maior taxa de conversão)
        const vencedor = teste.variantes.reduce((prev, current) =>
            parseFloat(current.taxaConversao) > parseFloat(prev.taxaConversao) ? current : prev
        );

        teste.status = 'FINALIZADO';
        teste.vencedor = vencedor.id;
        teste.dataFinalizacao = moment().format('YYYY-MM-DD HH:mm:ss');

        await this.saveData();

        console.log(`🏆 Teste A/B finalizado: ${teste.nome}`);
        console.log(`   Vencedor: ${vencedor.nome} (${vencedor.taxaConversao}% conversão)`);

        return {
            teste,
            vencedor,
            relatorio: this.gerarRelatorioAB(teste)
        };
    }

    /**
     * Gera relatório do teste A/B
     */
    gerarRelatorioAB(teste) {
        const totalEnvios = teste.variantes.reduce((sum, v) => sum + v.envios, 0);
        const totalConversoes = teste.variantes.reduce((sum, v) => sum + v.conversoes, 0);
        const totalReceita = teste.variantes.reduce((sum, v) => sum + v.receitaGerada, 0);

        const taxaGeralConversao = totalEnvios > 0
            ? ((totalConversoes / totalEnvios) * 100).toFixed(2)
            : 0;

        return {
            teste: teste.nome,
            periodo: `${teste.dataInicio} - ${teste.dataFim}`,
            status: teste.status,
            resultados: {
                totalEnvios,
                totalConversoes,
                taxaGeralConversao: `${taxaGeralConversao}%`,
                receitaTotal: `R$ ${totalReceita.toFixed(2)}`
            },
            variantes: teste.variantes.map(v => ({
                nome: v.nome,
                envios: v.envios,
                conversoes: v.conversoes,
                taxaConversao: `${v.taxaConversao}%`,
                receitaGerada: `R$ ${v.receitaGerada.toFixed(2)}`,
                roiPorLead: v.envios > 0
                    ? `R$ ${(v.receitaGerada / v.envios).toFixed(2)}`
                    : 'R$ 0',
                vencedor: v.id === teste.vencedor
            })),
            recomendacao: this.gerarRecomendacaoAB(teste)
        };
    }

    /**
     * Gera recomendação baseada no teste A/B
     */
    gerarRecomendacaoAB(teste) {
        if (!teste.vencedor) {
            return 'Teste ainda em andamento. Aguardar mais dados.';
        }

        const vencedor = teste.variantes.find(v => v.id === teste.vencedor);
        const perdedor = teste.variantes.find(v => v.id !== teste.vencedor);

        const diferencaTaxa = parseFloat(vencedor.taxaConversao) - parseFloat(perdedor.taxaConversao);

        if (diferencaTaxa > 10) {
            return `IMPLEMENTAR ${vencedor.nome} IMEDIATAMENTE. Diferença significativa de ${diferencaTaxa.toFixed(1)}% na conversão.`;
        } else if (diferencaTaxa > 5) {
            return `Usar ${vencedor.nome} preferencialmente. Melhoria moderada de ${diferencaTaxa.toFixed(1)}%.`;
        } else {
            return `Resultados similares. Continuar testando ou usar ${vencedor.nome} ligeiramente melhor.`;
        }
    }

    /**
     * Estatísticas gerais de conversão
     */
    async getEstatisticas(diasAtras = 30) {
        const dataLimite = moment().subtract(diasAtras, 'days');

        const conversoesRecentes = this.conversions.filter(c =>
            moment(c.dataConversao).isAfter(dataLimite)
        );

        const totalConversoes = conversoesRecentes.length;
        const receitaTotal = conversoesRecentes.reduce((sum, c) => sum + c.valorConversao, 0);
        const ticketMedio = totalConversoes > 0 ? receitaTotal / totalConversoes : 0;

        // Conversões por plano
        const porPlano = {};
        conversoesRecentes.forEach(c => {
            porPlano[c.planoVendido] = (porPlano[c.planoVendido] || 0) + 1;
        });

        // Tempo médio para conversão
        const conversoesCo mTempo = conversoesRecentes.filter(c => c.diasParaConversao > 0);
        const tempoMedio = conversoesCo mTempo.length > 0
            ? conversoesCo mTempo.reduce((sum, c) => sum + c.diasParaConversao, 0) / conversoesCo mTempo.length
            : 0;

        return {
            periodo: `${diasAtras} dias`,
            totalConversoes,
            receitaTotal: `R$ ${receitaTotal.toFixed(2)}`,
            ticketMedio: `R$ ${ticketMedio.toFixed(2)}`,
            conversoesPorPlano: porPlano,
            tempoMedioConversao: `${tempoMedio.toFixed(1)} dias`,
            melhorDia: this.getMelhorDia(conversoesRecentes),
            melhorTemplate: this.getMelhorTemplate(conversoesRecentes)
        };
    }

    getMelhorDia(conversoes) {
        const porDia = {};
        conversoes.forEach(c => {
            const dia = moment(c.dataConversao).format('dddd');
            porDia[dia] = (porDia[dia] || 0) + 1;
        });

        const melhor = Object.entries(porDia).sort((a, b) => b[1] - a[1])[0];
        return melhor ? `${melhor[0]} (${melhor[1]} conversões)` : 'N/A';
    }

    getMelhorTemplate(conversoes) {
        const porTemplate = {};
        conversoes.forEach(c => {
            if (c.templateUsado) {
                porTemplate[c.templateUsado] = (porTemplate[c.templateUsado] || 0) + 1;
            }
        });

        const melhor = Object.entries(porTemplate).sort((a, b) => b[1] - a[1])[0];
        return melhor ? `${melhor[0]} (${melhor[1]} conversões)` : 'N/A';
    }

    async registrarConversaoSheets(conversao) {
        try {
            const values = [[
                conversao.dataConversao,
                conversao.telefone,
                conversao.nome,
                conversao.planoVendido,
                conversao.valorConversao,
                conversao.fonte,
                conversao.templateUsado || '',
                conversao.diasParaConversao || 0
            ]];

            await this.googleSheetsService.sheets.spreadsheets.values.append({
                spreadsheetId: this.googleSheetsService.spreadsheetId,
                range: 'Conversoes!A:H',
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

        } catch (error) {
            console.error('Erro ao registrar conversão no Sheets:', error);
        }
    }

    gerarId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Dashboard de ROI em tempo real
     */
    async getDashboardROI() {
        const stats = await this.getEstatisticas(30);
        const receitaTotal = parseFloat(stats.receitaTotal.replace('R$ ', '').replace(',', ''));
        const custoEstimado = this.conversions.length * 5; // R$5 por lead
        const roi = custoEstimado > 0 ? ((receitaTotal / custoEstimado) * 100).toFixed(0) : 0;

        return {
            periodo: '30 dias',
            receita: stats.receitaTotal,
            custoEstimado: `R$ ${custoEstimado.toFixed(2)}`,
            roi: `${roi}%`,
            conversoes: stats.totalConversoes,
            ticketMedio: stats.ticketMedio,
            melhorDia: stats.melhorDia,
            melhorTemplate: stats.melhorTemplate,
            testesAtivos: this.abTests.filter(t => t.status === 'ATIVO').length
        };
    }
}

module.exports = ConversionTracker;
