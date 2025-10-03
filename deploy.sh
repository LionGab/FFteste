#!/bin/bash

echo "🚀 FullForce Academia - Deploy Automatizado"
echo "==========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se tem .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "Copiando .env.production.example para .env..."
    cp .env.production.example .env
    echo -e "${RED}❌ EDITE o arquivo .env com suas credenciais antes de continuar!${NC}"
    exit 1
fi

echo "Escolha a plataforma de deploy:"
echo ""
echo "1. 🚂 Railway (Recomendado)"
echo "2. 🟣 Heroku"
echo "3. 🐳 Docker Local"
echo "4. 🐳 Docker Compose"
echo "5. 📦 Build e Test Local"
echo ""
read -p "Digite o número da opção: " opcao

case $opcao in
    1)
        echo -e "${GREEN}🚂 Deploying para Railway...${NC}"

        # Verificar se Railway CLI está instalado
        if ! command -v railway &> /dev/null; then
            echo "Instalando Railway CLI..."
            npm install -g @railway/cli
        fi

        echo "Fazendo login no Railway..."
        railway login

        echo "Criando projeto..."
        railway init

        echo "Fazendo deploy..."
        railway up

        echo -e "${GREEN}✅ Deploy concluído!${NC}"
        echo "Acesse: railway open"
        ;;

    2)
        echo -e "${GREEN}🟣 Deploying para Heroku...${NC}"

        # Verificar se Heroku CLI está instalado
        if ! command -v heroku &> /dev/null; then
            echo "Instalando Heroku CLI..."
            curl https://cli-assets.heroku.com/install.sh | sh
        fi

        echo "Fazendo login no Heroku..."
        heroku login

        echo "Criando app..."
        read -p "Nome do app (ex: fullforce-reativacao): " appname
        heroku create $appname

        echo "Configurando variáveis de ambiente..."
        source .env
        heroku config:set GOOGLE_SHEETS_ID=$GOOGLE_SHEETS_ID
        heroku config:set WAHA_API_URL=$WAHA_API_URL
        heroku config:set WAHA_API_KEY=$WAHA_API_KEY
        heroku config:set NODE_ENV=production

        echo "Fazendo deploy..."
        git push heroku master

        echo -e "${GREEN}✅ Deploy concluído!${NC}"
        echo "Acesse: heroku open"
        ;;

    3)
        echo -e "${GREEN}🐳 Build Docker Local...${NC}"

        docker build -f Dockerfile.reactivation -t fullforce-reativacao .

        echo "Rodando container..."
        docker run -d \
            --name fullforce-reativacao \
            -p 4002:4002 \
            --env-file .env \
            fullforce-reativacao

        echo -e "${GREEN}✅ Container rodando!${NC}"
        echo "Acesse: http://localhost:4002"
        echo "Logs: docker logs -f fullforce-reativacao"
        ;;

    4)
        echo -e "${GREEN}🐳 Docker Compose...${NC}"

        docker-compose up -d

        echo -e "${GREEN}✅ Serviços iniciados!${NC}"
        echo "Acesse: http://localhost:4002"
        echo "Logs: docker-compose logs -f"
        ;;

    5)
        echo -e "${GREEN}📦 Build e Test Local...${NC}"

        echo "Instalando dependências..."
        npm install

        echo "Testando sistema..."
        node -e "
        const ReactivationSystem = require('./reactivation-system');
        const system = new ReactivationSystem();
        system.campaignAutomation.testarSistema().then(() => {
            console.log('✅ Testes passaram!');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Erro nos testes:', err);
            process.exit(1);
        });
        "

        echo "Iniciando servidor..."
        node reactivation-system.js
        ;;

    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac
