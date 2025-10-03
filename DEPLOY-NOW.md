# 🚀 DEPLOY AGORA - 3 Comandos

Sistema pronto para deploy! Execute os comandos abaixo:

---

## ✅ Opção 1: Railway (MAIS RÁPIDO - Recomendado)

```bash
# 1. Login no Railway (abre navegador)
railway login

# 2. Criar projeto e fazer deploy
railway init
railway up

# 3. Abrir app
railway open
```

**Pronto! Sistema no ar em 2 minutos!**

---

## ✅ Opção 2: Script Automatizado (Windows)

```powershell
# Execute o script de deploy
.\deploy.ps1

# Escolha opção 1 (Railway)
```

---

## ✅ Opção 3: Script Automatizado (Linux/Mac)

```bash
# Torne executável
chmod +x deploy.sh

# Execute
./deploy.sh

# Escolha opção 1 (Railway)
```

---

## ✅ Opção 4: Docker Local (Teste Rápido)

```bash
# 1. Copiar .env
cp .env.production.example .env

# 2. EDITAR .env com suas credenciais

# 3. Rodar com Docker Compose
docker-compose up -d

# 4. Acessar
http://localhost:4002
```

---

## ⚙️ Configurar Variáveis de Ambiente

### Antes do deploy, você precisa:

1. **Google Sheets ID**
   - Abra seu spreadsheet
   - URL: `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`
   - Copie o ID

2. **WAHA Railway URL**
   - Se já tem WAHA no Railway: `https://seu-waha.railway.app`
   - Se não tem, deploy WAHA primeiro

3. **Credentials Google**
   - Criar projeto no Google Cloud Console
   - Ativar Google Sheets API
   - Criar credenciais OAuth 2.0

### No Railway:

```bash
# Após railway init, configure as variáveis:
railway variables set GOOGLE_SHEETS_ID="seu_id"
railway variables set WAHA_API_URL="https://seu-waha.railway.app"
railway variables set WAHA_API_KEY="sua_key"
railway variables set GOOGLE_CLIENT_ID="seu_client_id"
railway variables set GOOGLE_CLIENT_SECRET="seu_secret"
railway variables set GOOGLE_ACCESS_TOKEN="seu_token"
railway variables set GOOGLE_REFRESH_TOKEN="seu_refresh"

# Depois:
railway up
```

---

## 🧪 Testar Antes do Deploy

```bash
# 1. Instalar deps
npm install

# 2. Copiar .env
cp .env.production.example .env

# 3. EDITAR .env

# 4. Testar
node quick-start.js
# Escolha opção 3 (Teste do Sistema)

# 5. Rodar local
node reactivation-system.js
```

---

## 📱 Após o Deploy

1. **Acesse o Dashboard**
   ```
   https://seu-app.railway.app/
   ```

2. **Configure WAHA Webhook**
   ```
   Webhook URL: https://seu-app.railway.app/webhook/waha
   Events: message, session.status
   ```

3. **Teste a API**
   ```bash
   curl https://seu-app.railway.app/api/test
   ```

4. **Dashboard de Aprovação**
   ```
   https://seu-app.railway.app/api/reactivation/dashboard
   ```

---

## 🆘 Troubleshooting

### Erro: Railway CLI não instalado
```bash
npm install -g @railway/cli
```

### Erro: Variáveis não configuradas
```bash
railway variables
# Configure todas as variáveis listadas em .env.production.example
```

### Erro: WAHA não conecta
- Verifique se WAHA_API_URL está correto
- Teste: `curl https://seu-waha.railway.app/api/sessions`

---

## 📊 Arquivos de Deploy Criados

- ✅ `Procfile` - Heroku
- ✅ `railway.json` - Railway config
- ✅ `Dockerfile.reactivation` - Docker
- ✅ `docker-compose.yml` - Docker Compose
- ✅ `deploy.sh` - Script Linux/Mac
- ✅ `deploy.ps1` - Script Windows
- ✅ `.env.production.example` - Template vars

---

## ⚡ Deploy em 60 Segundos

```bash
# Literalmente 3 comandos:
railway login
railway init
railway up

# Pronto! 🚀
```

**Escolha o método que preferir e faça o deploy agora!**
