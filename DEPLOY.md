# 🚀 Deploy - Sistema de Reativação FullForce

## ✅ Deploy Realizado

**Repositório**: https://github.com/LionGab/FFteste.git
**Branch**: master
**Commit**: Sistema completo de reativação (18 arquivos)

---

## 📦 Arquivos Enviados

### Core System
- ✅ reactivation-system.js (Servidor principal)
- ✅ quick-start.js (Inicialização rápida)
- ✅ winback-dashboard.html (Dashboard monitoramento)

### Services (11 arquivos)
- ✅ smart-scoring-engine.js
- ✅ daily-batch-selector.js
- ✅ hyper-personalizer.js
- ✅ response-tracker.js
- ✅ inactivity-detector.js
- ✅ smart-offer-generator.js
- ✅ whatsapp-campaign-automation.js
- ✅ conversion-tracker.js
- ✅ recent-churn-detector.js
- ✅ psychological-trigger-engine.js

### UI & Config
- ✅ dashboard-approval.html
- ✅ reactivation-routes.js
- ✅ n8n-workflows/reactivation-sequence-3-messages.json

### Documentação
- ✅ REACTIVATION-README.md (Docs completa)
- ✅ SUMARIO-EXECUTIVO.md (Visão executiva)

---

## 🔧 Setup em Produção

### 1. Clone o Repositório

```bash
git clone https://github.com/LionGab/FFteste.git
cd FFteste
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Criar .env
cat > .env << 'EOF'
# Google Sheets
GOOGLE_SHEETS_ID=seu_spreadsheet_id
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_ACCESS_TOKEN=seu_access_token
GOOGLE_REFRESH_TOKEN=seu_refresh_token

# WAHA (WhatsApp)
WAHA_API_URL=https://seu-waha.railway.app
WAHA_API_KEY=seu_api_key
WAHA_SESSION=fullforce-session

# Sistema
PORT=4002
NODE_ENV=production
AUTO_CAMPAIGN=false
EOF
```

### 4. Iniciar Sistema

```bash
# Modo Manual (com aprovação)
node reactivation-system.js

# Ou usar Quick Start
node quick-start.js
```

---

## 🌐 Deploy em Cloud

### Opção 1: Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar variáveis de ambiente
railway variables set GOOGLE_SHEETS_ID=...
railway variables set WAHA_API_URL=...
# ... (adicionar todas)

# 5. Deploy
railway up
```

### Opção 2: Heroku

```bash
# 1. Login Heroku
heroku login

# 2. Criar app
heroku create fullforce-reativacao

# 3. Adicionar variáveis
heroku config:set GOOGLE_SHEETS_ID=...
heroku config:set WAHA_API_URL=...
# ... (adicionar todas)

# 4. Deploy
git push heroku master
```

### Opção 3: VPS (DigitalOcean/AWS)

```bash
# 1. SSH no servidor
ssh user@seu-servidor

# 2. Clonar repo
git clone https://github.com/LionGab/FFteste.git
cd FFteste

# 3. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Instalar PM2
sudo npm install -g pm2

# 5. Configurar .env
nano .env

# 6. Iniciar com PM2
pm2 start reactivation-system.js --name fullforce-reativacao
pm2 save
pm2 startup
```

---

## 🔄 Atualizações Futuras

```bash
# No servidor
cd FFteste
git pull ffteste master
npm install
pm2 restart fullforce-reativacao
```

---

## 📊 Endpoints de Produção

```
GET  https://seu-dominio.com/
GET  https://seu-dominio.com/api/reactivation/dashboard
GET  https://seu-dominio.com/api/reactivation/daily-batch
POST https://seu-dominio.com/api/reactivation/send-approved
GET  https://seu-dominio.com/api/reactivation/stats
POST https://seu-dominio.com/webhook/waha
```

---

## 🧪 Testar Deploy

```bash
# Health check
curl https://seu-dominio.com/api/test

# Deve retornar:
# {
#   "success": true,
#   "deteccao": X,
#   "scoring": Y,
#   "mensagem": Z
# }
```

---

## 📱 Configurar WAHA Webhook

No Railway/WAHA:
1. Acessar painel WAHA
2. Configurar webhook: `https://seu-dominio.com/webhook/waha`
3. Eventos: `message`, `session.status`

---

## 🔐 Segurança

- ✅ Nunca commitar .env
- ✅ Usar HTTPS em produção
- ✅ Configurar CORS apropriado
- ✅ Rate limiting ativado
- ✅ Validação de inputs

---

## 📈 Monitoramento

### Logs

```bash
# PM2
pm2 logs fullforce-reativacao

# Railway
railway logs

# Heroku
heroku logs --tail
```

### Métricas

Acessar dashboards:
- Winback: https://seu-dominio.com/
- Aprovação: https://seu-dominio.com/api/reactivation/dashboard

---

## 🆘 Suporte

**Repositório**: https://github.com/LionGab/FFteste.git
**Documentação**: REACTIVATION-README.md
**Executivo**: SUMARIO-EXECUTIVO.md

**Sistema pronto para produção!** 🚀
