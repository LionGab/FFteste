#!/usr/bin/env node

/**
 * FullForce Academia - Sistema Completo de Reativação
 *
 * Sistema de 3 etapas para reativação de alunos inativos:
 * ETAPA 1: Scoring + Seleção Diária + Aprovação Manual
 * ETAPA 2: Detector Inatividade + Ofertas Automáticas + A/B Testing
 * ETAPA 3: Churn Detector + Gatilhos Psicológicos + N8N Workflow
 *
 * META: 100% conversão anual @ R$119 dos 650 inativos
 * ROI ESPERADO: 3800%
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

// Importar serviços
const GoogleSheetsService = require('./src/services/google-sheets');
const WAHAService = require('./src/services/waha-service');

// ETAPA 1
const SmartScoringEngine = require('./src/services/smart-scoring-engine');
const DailyBatchSelector = require('./src/services/daily-batch-selector');
const HyperPersonalizer = require('./src/services/hyper-personalizer');
const ResponseTracker = require('./src/services/response-tracker');

// ETAPA 2
const InactivityDetector = require('./src/services/inactivity-detector');
const SmartOfferGenerator = require('./src/services/smart-offer-generator');
const WhatsAppCampaignAutomation = require('./src/services/whatsapp-campaign-automation');
const ConversionTracker = require('./src/services/conversion-tracker');

// ETAPA 3
const RecentChurnDetector = require('./src/services/recent-churn-detector');
const PsychologicalTriggerEngine = require('./src/services/psychological-trigger-engine');

class ReactivationSystem {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4002;

        // Inicializar serviços base
        this.googleSheets = new GoogleSheetsService();
        this.wahaService = new WAHAService();

        // ETAPA 1 - Componentes
        this.scoringEngine = new SmartScoringEngine();
        this.batchSelector = new DailyBatchSelector(this.googleSheets);
        this.personalizer = new HyperPersonalizer();
        this.responseTracker = new ResponseTracker(this.googleSheets);

        // ETAPA 2 - Componentes
        this.inactivityDetector = new InactivityDetector(this.googleSheets);
        this.offerGenerator = new SmartOfferGenerator();
        this.campaignAutomation = new WhatsAppCampaignAutomation(
            this.wahaService,
            this.googleSheets
        );
        this.conversionTracker = new ConversionTracker(this.googleSheets);

        // ETAPA 3 - Componentes
        this.churnDetector = new RecentChurnDetector(this.googleSheets);
        this.triggerEngine = new PsychologicalTriggerEngine();

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));

        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        // Logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Dashboard HTML
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'winback-dashboard.html'));
        });

        this.app.get('/api/reactivation/dashboard', (req, res) => {
            res.sendFile(path.join(__dirname, 'src/dashboard-approval.html'));
        });

        // API Endpoints - ETAPA 1
        this.app.get('/api/reactivation/daily-batch', async (req, res) => {
            try {
                const inativos = await this.inactivityDetector.detectarInativos();
                const comScoring = this.scoringEngine.processarLista(inativos.inativos);
                const lote = await this.batchSelector.selecionarLoteDiario(comScoring, 40);

                const comMensagens = lote.lote.map(aluno => ({
                    ...aluno,
                    mensagemData: this.personalizer.gerarMensagem(aluno)
                }));

                res.json({
                    lote: comMensagens,
                    estatisticas: lote.estatisticas,
                    meta: lote.meta
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/reactivation/send-approved', async (req, res) => {
            try {
                const { leads } = req.body;
                const resultado = await this.campaignAutomation.enviarLoteAprovado(leads);
                res.json(resultado);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // API Endpoints - ETAPA 2
        this.app.get('/api/reactivation/stats', async (req, res) => {
            try {
                const stats = await this.conversionTracker.getEstatisticas(30);
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/reactivation/conversion', async (req, res) => {
            try {
                const conversao = await this.conversionTracker.registrarConversao(req.body);
                res.json(conversao);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // API Endpoints - ETAPA 3
        this.app.get('/api/reactivation/recent-churn', async (req, res) => {
            try {
                const resultado = await this.churnDetector.detectarSaidasRecentes(30);
                res.json(resultado);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/reactivation/blacklist', async (req, res) => {
            try {
                const { telefone, motivo } = req.body;
                await this.batchSelector.adicionarBlacklist(telefone, motivo);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Webhook WAHA - processar respostas
        this.app.post('/webhook/waha', async (req, res) => {
            try {
                await this.responseTracker.processarResposta(req.body);
                res.json({ success: true });
            } catch (error) {
                console.error('Erro webhook:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Dashboard Data
        this.app.get('/api/reactivation/dashboard-data', async (req, res) => {
            try {
                const roi = await this.conversionTracker.getDashboardROI();
                const churn = await this.churnDetector.detectarSaidasRecentes(30);
                const interessados = this.responseTracker.getInteressadosPendentes();

                res.json({
                    totalInativos: churn.total,
                    enviadosMes: roi.conversoes * 5, // Estimativa
                    conversoesMes: parseInt(roi.conversoes),
                    taxaConversao: parseFloat(roi.roi),
                    receitaMes: parseFloat(roi.receita.replace('R$ ', '').replace(',', '')),
                    roi: parseFloat(roi.roi.replace('%', '')),
                    contatados: churn.total,
                    interessados: interessados.length,
                    conversoesRecentes: [] // TODO: implementar
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Teste do sistema
        this.app.get('/api/test', async (req, res) => {
            try {
                const resultado = await this.campaignAutomation.testarSistema();
                res.json(resultado);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    async start() {
        this.app.listen(this.port, () => {
            console.log('\n🚀 ===== SISTEMA DE REATIVAÇÃO INICIADO =====\n');
            console.log(`📍 Servidor: http://localhost:${this.port}`);
            console.log(`📊 Dashboard: http://localhost:${this.port}`);
            console.log(`✅ Aprovação: http://localhost:${this.port}/api/reactivation/dashboard`);
            console.log(`🧪 Teste: http://localhost:${this.port}/api/test`);
            console.log('\n💪 FullForce Academia - Matupá-MT');
            console.log('🎯 Meta: 100% conversão anual @ R$119');
            console.log('📈 ROI Esperado: 3800%\n');
            console.log('============================================\n');
        });
    }

    async iniciarCampanhaAutomatica() {
        console.log('🔄 Iniciando campanha automática diária...');
        await this.campaignAutomation.iniciarCampanhaAutomatica('09:00');
    }
}

// Inicialização
if (require.main === module) {
    const system = new ReactivationSystem();
    system.start();

    // Opcional: iniciar campanha automática
    if (process.env.AUTO_CAMPAIGN === 'true') {
        system.iniciarCampanhaAutomatica();
    }
}

module.exports = ReactivationSystem;
