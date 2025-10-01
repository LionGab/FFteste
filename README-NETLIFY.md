# Full Force Academia - Deploy no Netlify

## 🚀 Como fazer deploy no Netlify

### Opção 1: Deploy via Interface Web (Recomendado)

1. **Acesse o Netlify:**
   - Vá para [netlify.com](https://netlify.com)
   - Faça login ou crie uma conta gratuita

2. **Faça upload do projeto:**
   - Clique em "Add new site" → "Deploy manually"
   - Arraste e solte a pasta `dist` (que está dentro do projeto)
   - Aguarde o deploy automático

3. **Configure domínio personalizado (opcional):**
   - Vá em "Domain settings"
   - Adicione seu domínio personalizado

### Opção 2: Deploy via Git (Automático)

1. **Conecte ao repositório:**
   - No Netlify, clique em "Add new site" → "Import an existing project"
   - Conecte ao GitHub/GitLab onde está o código
   - Selecione o repositório

2. **Configurações de build:**
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: `18`

### Opção 3: Deploy via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

## 📁 Estrutura para Deploy

- **Pasta para upload:** `dist/` (arquivos já compilados)
- **Configurações:** `netlify.toml` (já incluído)
- **Redirects:** `public/_redirects` (já incluído)

## ⚙️ Configurações Incluídas

- ✅ Cache otimizado para assets
- ✅ Redirects para SPA
- ✅ Headers de performance
- ✅ Configuração de build automático

## 🎯 Domínio Sugerido

- `fullforceacademia.netlify.app` (gratuito)
- `fullforceacademia.com.br` (personalizado)

## 📞 Suporte

Em caso de dúvidas, consulte a [documentação do Netlify](https://docs.netlify.com/).

---

**Projeto:** Landing Page Full Force Academia  
**Tecnologia:** React + Vite  
**Status:** Pronto para produção ✅
