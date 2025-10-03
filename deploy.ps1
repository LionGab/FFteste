# FullForce Academia - Deploy Automatizado (PowerShell)

Write-Host "🚀 FullForce Academia - Deploy Automatizado" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se tem .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Arquivo .env não encontrado" -ForegroundColor Yellow
    Write-Host "Copiando .env.production.example para .env..."
    Copy-Item .env.production.example .env
    Write-Host "❌ EDITE o arquivo .env com suas credenciais antes de continuar!" -ForegroundColor Red
    exit 1
}

Write-Host "Escolha a plataforma de deploy:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🚂 Railway (Recomendado)"
Write-Host "2. 🟣 Heroku"
Write-Host "3. 🐳 Docker Local"
Write-Host "4. 🐳 Docker Compose"
Write-Host "5. 📦 Build e Test Local"
Write-Host ""

$opcao = Read-Host "Digite o número da opção"

switch ($opcao) {
    "1" {
        Write-Host "🚂 Deploying para Railway..." -ForegroundColor Green

        # Verificar Railway CLI
        if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
            Write-Host "Instalando Railway CLI..."
            npm install -g @railway/cli
        }

        Write-Host "Fazendo login no Railway..."
        railway login

        Write-Host "Criando projeto..."
        railway init

        Write-Host "Fazendo deploy..."
        railway up

        Write-Host "✅ Deploy concluído!" -ForegroundColor Green
        Write-Host "Acesse: railway open"
    }

    "2" {
        Write-Host "🟣 Deploying para Heroku..." -ForegroundColor Green

        # Verificar Heroku CLI
        if (-not (Get-Command heroku -ErrorAction SilentlyContinue)) {
            Write-Host "❌ Heroku CLI não instalado. Instale em: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Red
            exit 1
        }

        Write-Host "Fazendo login no Heroku..."
        heroku login

        $appname = Read-Host "Nome do app (ex: fullforce-reativacao)"
        Write-Host "Criando app..."
        heroku create $appname

        Write-Host "Configurando variáveis de ambiente..."
        Get-Content .env | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                heroku config:set "$key=$value" --app $appname
            }
        }

        Write-Host "Fazendo deploy..."
        git push heroku master

        Write-Host "✅ Deploy concluído!" -ForegroundColor Green
        Write-Host "Acesse: heroku open --app $appname"
    }

    "3" {
        Write-Host "🐳 Build Docker Local..." -ForegroundColor Green

        docker build -f Dockerfile.reactivation -t fullforce-reativacao .

        Write-Host "Rodando container..."
        docker run -d `
            --name fullforce-reativacao `
            -p 4002:4002 `
            --env-file .env `
            fullforce-reativacao

        Write-Host "✅ Container rodando!" -ForegroundColor Green
        Write-Host "Acesse: http://localhost:4002"
        Write-Host "Logs: docker logs -f fullforce-reativacao"
    }

    "4" {
        Write-Host "🐳 Docker Compose..." -ForegroundColor Green

        docker-compose up -d

        Write-Host "✅ Serviços iniciados!" -ForegroundColor Green
        Write-Host "Acesse: http://localhost:4002"
        Write-Host "Logs: docker-compose logs -f"
    }

    "5" {
        Write-Host "📦 Build e Test Local..." -ForegroundColor Green

        Write-Host "Instalando dependências..."
        npm install

        Write-Host "Testando sistema..."
        node quick-start.js

        Write-Host "Iniciando servidor..."
        node reactivation-system.js
    }

    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}
