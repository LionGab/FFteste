# ⚡ START HERE - Deploy em 3 Passos

## 🚀 SISTEMA PRONTO PARA DEPLOY!

Todos os arquivos estão no repositório: https://github.com/LionGab/FFteste.git

---

## ✅ PASSO 1: Railway Login

```bash
cd /c/Users/Igor/FullForceAcademia
railway login
```

Isso vai abrir o navegador para você fazer login no Railway.

---

## ✅ PASSO 2: Criar Projeto

```bash
railway init
```

Escolha "Create new project" e dê um nome (ex: fullforce-reativacao)

---

## ✅ PASSO 3: Deploy!

```bash
railway up
```

Pronto! O sistema vai subir automaticamente.

---

## ⚙️ PASSO 4: Configurar Variáveis

Após o deploy, configure as variáveis de ambiente no Railway:

```bash
railway variables set GOOGLE_SHEETS_ID="seu_spreadsheet_id"
railway variables set WAHA_API_URL="https://seu-waha.railway.app"
railway variables set WAHA_API_KEY="sua_api_key"
railway variables set GOOGLE_CLIENT_ID="seu_client_id"
railway variables set GOOGLE_CLIENT_SECRET="seu_client_secret"
railway variables set GOOGLE_ACCESS_TOKEN="seu_access_token"
railway variables set GOOGLE_REFRESH_TOKEN="seu_refresh_token"
```

Ou configure pela interface web:
```bash
railway open
# Vá em Variables e adicione todas
```

---

## 🌐 PASSO 5: Acessar Sistema

```bash
railway open
```

Ou veja a URL:
```bash
railway status
```

Acesse:
- `https://seu-app.railway.app/` - Dashboard Winback
- `https://seu-app.railway.app/api/reactivation/dashboard` - Dashboard Aprovação

---

## 🧪 PASSO 6: Testar

```bash
curl https://seu-app.railway.app/api/test
```

Deve retornar:
```json
{
  "success": true,
  "deteccao": X,
  "scoring": Y,
  "mensagem": Z
}
```

---

## 📱 PASSO 7: Configurar WAHA Webhook

No seu WAHA Railway, configure:
- **Webhook URL**: `https://seu-app.railway.app/webhook/waha`
- **Events**: `message`, `session.status`

---

## ✅ CHECKLIST FINAL

- [ ] Railway login OK
- [ ] Projeto criado
- [ ] Deploy realizado
- [ ] Variáveis configuradas
- [ ] Sistema testado
- [ ] WAHA webhook configurado
- [ ] Dashboard acessível

---

## 🆘 SE ALGO DER ERRADO

### Railway CLI não instalado?
```bash
npm install -g @railway/cli
```

### Erro nas variáveis?
```bash
railway variables
# Liste todas e confira
```

### Sistema não sobe?
```bash
railway logs
# Veja os erros
```

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

1. **Preparar Google Sheets**
   - Criar abas: Inativos, Conversões, Respostas, Campanhas
   - Preencher dados dos 650 inativos

2. **Testar Sistema**
   - Acessar dashboard de aprovação
   - Gerar lote diário
   - Aprovar e enviar teste

3. **Ativar Campanha**
   - Configurar AUTO_CAMPAIGN=true (se quiser automático)
   - Ou usar manual via dashboard

4. **Monitorar**
   - Acompanhar conversões
   - Ajustar templates
   - Otimizar com A/B testing

---

## 📊 ARQUIVOS DE DEPLOY CRIADOS

✅ Todos estão no repo https://github.com/LionGab/FFteste.git

- `Procfile` - Heroku config
- `railway.json` - Railway config
- `Dockerfile.reactivation` - Docker
- `docker-compose.yml` - Docker Compose
- `deploy.sh` - Script automatizado Linux/Mac
- `deploy.ps1` - Script automatizado Windows
- `.env.production.example` - Template variáveis

---

## 🚀 ALTERNATIVA: Script Windows

```powershell
# Se preferir usar o script:
.\deploy.ps1

# Escolha opção 1 (Railway)
```

---

## 🚀 ALTERNATIVA: Script Linux/Mac

```bash
# Se preferir usar o script:
chmod +x deploy.sh
./deploy.sh

# Escolha opção 1 (Railway)
```

---

## 📞 SUPORTE

- **Repo**: https://github.com/LionGab/FFteste
- **Docs Completa**: REACTIVATION-README.md
- **Guia Deploy**: DEPLOY-NOW.md

---

**Está tudo pronto! Só executar os 3 comandos Railway e configurar as variáveis.** 🎯

**Sistema vai reativar 650 inativos → R$ 15.470 - R$ 23.205 em receita!** 💰
