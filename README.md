# 🎯 FullForce Academia - Sistema de Reativação

Sistema completo de reativação de alunos inativos com **3 ETAPAS** integradas.

[![Deploy](https://img.shields.io/badge/Deploy-Railway-blueviolet)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**META**: 650 inativos → 130-195 conversões @ R$119
**ROI ESPERADO**: 376-614%

---

## 🚀 DEPLOY RÁPIDO (60 segundos)

```bash
# 1. Clone
git clone https://github.com/LionGab/FFteste.git
cd FFteste

# 2. Deploy Railway (MAIS RÁPIDO)
railway login
railway init
railway up

# ✅ Pronto! Sistema no ar!
```

**[📖 Guia Completo de Deploy](DEPLOY-NOW.md)**

---

## 📊 VISÃO GERAL

### Sistema de 3 Etapas

```
📥 GOOGLE SHEETS (650 Inativos)
           ↓
🎯 ETAPA 1: Scoring & Aprovação
   • SmartScoringEngine (0-100 pts)
   • DailyBatchSelector (Top 30-40)
   • ManualApprovalDashboard
           ↓
🤖 ETAPA 2: Automação & IA
   • InactivityDetector (Segmentação)
   • SmartOfferGenerator
   • A/B Testing Engine
           ↓
🧠 ETAPA 3: Gatilhos Psicológicos
   • RecentChurnDetector (<30d)
   • PsychologicalTriggers (6 tipos)
   • N8N Workflow (3 mensagens)
           ↓
📱 WAHA (WhatsApp) → Envio
           ↓
💰 Conversão + ROI Dashboard
```

---

## 💰 RESULTADOS ESPERADOS

| Cenário | Conversões | Receita | ROI |
|---------|------------|---------|-----|
| **Conservador** | 130 (20%) | R$ 15.470 | **376%** |
| **Otimista** | 195 (30%) | R$ 23.205 | **614%** |
| **Agressivo (<30d)** | 78 (40%) | R$ 9.282 | **852%** |

**Tempo**: 2-3 meses para completar 650 inativos

---

## 🎬 QUICK START

### 1. Instalar

```bash
npm install
```

### 2. Configurar

```bash
# Copiar .env
cp .env.production.example .env

# EDITAR .env com suas credenciais:
# - Google Sheets ID
# - WAHA API URL/Key
# - Google OAuth credentials
```

### 3. Rodar

```bash
# Quick Start Menu
node quick-start.js

# Ou direto
node reactivation-system.js
```

### 4. Acessar

- **Dashboard Winback**: http://localhost:4002
- **Dashboard Aprovação**: http://localhost:4002/api/reactivation/dashboard

---

## 📦 COMPONENTES

### ETAPA 1 - Scoring & Aprovação
- ✅ **SmartScoringEngine**: Pontua inativos 0-100 (5 critérios)
- ✅ **DailyBatchSelector**: Top 30-40/dia + Blacklist
- ✅ **HyperPersonalizer**: 3 templates rotativos
- ✅ **ManualApprovalDashboard**: Interface web
- ✅ **ResponseTracker**: Classificação automática

### ETAPA 2 - Automação
- ✅ **InactivityDetector**: Segmentação 7/15/30/45/60+ dias
- ✅ **SmartOfferGenerator**: Ofertas por perfil
- ✅ **WhatsAppCampaignAutomation**: Sequências 3 dias
- ✅ **ConversionTracker**: ROI real-time + A/B Testing

### ETAPA 3 - Gatilhos
- ✅ **RecentChurnDetector**: Saídas <30d prioritárias
- ✅ **PsychologicalTriggerEngine**: 6 gatilhos (15-35% ↑)
- ✅ **N8N Workflow**: Automação 3 mensagens
- ✅ **WinbackDashboard**: Monitoramento completo

---

## 🌐 DEPLOY EM PRODUÇÃO

### Opção 1: Railway (Recomendado)

```bash
railway login
railway init
railway up
```

### Opção 2: Heroku

```bash
heroku create fullforce-reativacao
git push heroku master
```

### Opção 3: Docker

```bash
docker-compose up -d
```

### Opção 4: Scripts Automatizados

```bash
# Windows
.\deploy.ps1

# Linux/Mac
./deploy.sh
```

**[📖 Guia Completo](DEPLOY-NOW.md)**

---

## 📚 DOCUMENTAÇÃO

- **[REACTIVATION-README.md](REACTIVATION-README.md)** - Documentação completa
- **[SUMARIO-EXECUTIVO.md](SUMARIO-EXECUTIVO.md)** - Visão executiva
- **[DEPLOY-NOW.md](DEPLOY-NOW.md)** - Guia de deploy
- **[DEPLOY.md](DEPLOY.md)** - Deploy detalhado

---

## 🔧 API ENDPOINTS

```
GET  /                                    # Dashboard Winback
GET  /api/reactivation/dashboard          # Dashboard Aprovação
GET  /api/reactivation/daily-batch        # Lote diário
POST /api/reactivation/send-approved      # Enviar aprovados
POST /api/reactivation/conversion         # Registrar conversão
GET  /api/reactivation/stats              # Estatísticas
POST /webhook/waha                        # Webhook WhatsApp
GET  /api/test                            # Health check
```

---

## 🎯 SISTEMA DE SCORING

| Critério | Peso | Exemplo |
|----------|------|---------|
| Dias Inativo | 3 | 0-7 dias = 10/10 |
| Motivo Saída | 4 | Financeiro = 10/10 |
| Plano Anterior | 2 | Clube+Full = 10/10 |
| Tempo Permanência | 2 | 12+ meses = 10/10 |
| Idade | 1 | 26-35 anos = 10/10 |

**Score Final**: 0-100 (ponderado)

---

## 🧠 GATILHOS PSICOLÓGICOS

1. **ESCASSEZ** → 15-25% ↑ conversão
2. **PROVA SOCIAL** → 20-30% ↑
3. **ANCORAGEM** → 18-28% ↑
4. **BÔNUS EXCLUSIVO** → 25-35% ↑
5. **PERDA AVERSÃO** → 20-30% ↑
6. **RECIPROCIDADE** → 15-25% ↑

---

## 📊 DASHBOARDS

### Dashboard Winback (Principal)
- Métricas em tempo real
- Funil de conversão
- ROI atualizado
- Conversões recentes

### Dashboard Aprovação (Operadora)
- Lista diária 30-40 leads
- Preview mensagens
- Aprovação individual/lote
- Gestão blacklist

---

## 🧪 TESTAR

```bash
# Teste completo
node quick-start.js
# Escolha opção 3

# Teste scoring
node -e "
const S = require('./src/services/smart-scoring-engine');
const s = new S();
console.log(s.calculateScore({
  nome: 'João',
  planoAnterior: 'Prata',
  motivoSaida: 'financeiro',
  diasInativo: 15
}));
"

# Teste gatilhos
node -e "
const T = require('./src/services/psychological-trigger-engine');
const t = new T();
t.testarGatilhos();
"
```

---

## 📈 ARQUIVOS

```
FullForceAcademia/
├── reactivation-system.js          # Servidor principal
├── quick-start.js                  # Menu inicial
├── winback-dashboard.html          # Dashboard principal
├── REACTIVATION-README.md          # Docs completa
├── SUMARIO-EXECUTIVO.md           # Visão executiva
├── DEPLOY-NOW.md                  # Deploy rápido
│
├── src/
│   ├── dashboard-approval.html     # Dashboard aprovação
│   ├── services/ (11 arquivos)     # Core services
│   └── routes/                     # API routes
│
├── n8n-workflows/
│   └── reactivation-sequence-3-messages.json
│
└── Deploy configs:
    ├── Procfile                    # Heroku
    ├── railway.json                # Railway
    ├── Dockerfile.reactivation     # Docker
    ├── docker-compose.yml          # Docker Compose
    ├── deploy.sh                   # Script Linux/Mac
    └── deploy.ps1                  # Script Windows
```

---

## 🚀 COMEÇAR AGORA

```bash
# Clone
git clone https://github.com/LionGab/FFteste.git
cd FFteste

# Deploy em 60 segundos
railway login && railway init && railway up

# Ou rodar local
npm install
cp .env.production.example .env
# EDITAR .env
node quick-start.js
```

**Sistema pronto para ativar! 🎯**

---

## 🤝 SUPORTE

- **Repo**: https://github.com/LionGab/FFteste
- **Issues**: https://github.com/LionGab/FFteste/issues

---

## 📄 LICENÇA

MIT License

---

**Desenvolvido para FullForce Academia - Matupá-MT**
**Meta: 650 inativos → R$ 15.470 - R$ 23.205 em receita**
