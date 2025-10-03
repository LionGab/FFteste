#!/usr/bin/env node

/**
 * FullForce Academia - Quick Start Script
 * Inicialização rápida do sistema de reativação
 */

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function pergunta(texto) {
    return new Promise(resolve => {
        rl.question(texto, resolve);
    });
}

async function quickStart() {
    console.log('\n🎯 ===== FULLFORCE ACADEMIA - QUICK START =====\n');
    console.log('Sistema de Reativação - 3 Etapas Completas\n');

    // Menu de opções
    console.log('Escolha o modo de operação:\n');
    console.log('1. 📋 Dashboard de Aprovação Manual (Recomendado para início)');
    console.log('2. 🤖 Campanha Automática Diária (9h)');
    console.log('3. 🔬 Teste do Sistema');
    console.log('4. 📊 Executar Campanha Agora (Manual)');
    console.log('5. ⚙️  Configurar N8N Workflow');
    console.log('6. 📈 Ver Dashboard Winback\n');

    const opcao = await pergunta('Digite o número da opção: ');

    switch(opcao.trim()) {
        case '1':
            await iniciarDashboardAprovacao();
            break;

        case '2':
            await iniciarCampanhaAutomatica();
            break;

        case '3':
            await testarSistema();
            break;

        case '4':
            await executarCampanhaManual();
            break;

        case '5':
            await configurarN8N();
            break;

        case '6':
            await verDashboard();
            break;

        default:
            console.log('❌ Opção inválida');
            rl.close();
    }
}

async function iniciarDashboardAprovacao() {
    console.log('\n📋 Iniciando Dashboard de Aprovação...\n');

    exec('node reactivation-system.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${error}`);
            return;
        }
        console.log(stdout);
    });

    console.log('✅ Servidor iniciado!');
    console.log('\n📍 Acesse:');
    console.log('   Dashboard Aprovação: http://localhost:4002/api/reactivation/dashboard');
    console.log('   Dashboard Winback: http://localhost:4002\n');

    rl.close();
}

async function iniciarCampanhaAutomatica() {
    console.log('\n🤖 Configurando Campanha Automática...\n');

    const fs = require('fs');
    const envPath = '.env';

    // Ler .env atual
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    // Atualizar AUTO_CAMPAIGN
    if (envContent.includes('AUTO_CAMPAIGN=')) {
        envContent = envContent.replace(/AUTO_CAMPAIGN=.*/, 'AUTO_CAMPAIGN=true');
    } else {
        envContent += '\nAUTO_CAMPAIGN=true\n';
    }

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Campanha automática configurada!');
    console.log('⏰ Execução diária às 9h\n');

    exec('node reactivation-system.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${error}`);
            return;
        }
        console.log(stdout);
    });

    rl.close();
}

async function testarSistema() {
    console.log('\n🔬 Testando Sistema Completo...\n');

    console.log('1️⃣ Testando Scoring Engine...');
    exec('node -e "const S = require(\'./src/services/smart-scoring-engine\'); const s = new S(); const a = {nome:\'João\',telefone:\'66999999999\',planoAnterior:\'Prata\',dataInicio:\'2023-01-15\',dataSaida:\'2024-11-20\',motivoSaida:\'financeiro\',idade:32}; console.log(s.calculateScore(a));"',
    (error, stdout) => {
        console.log(stdout);
    });

    setTimeout(() => {
        console.log('2️⃣ Testando Personalizer...');
        exec('node -e "const P = require(\'./src/services/hyper-personalizer\'); const p = new P(); p.testarTemplate(\'urgente_financeiro\');"',
        (error, stdout) => {
            console.log(stdout);
        });
    }, 1000);

    setTimeout(() => {
        console.log('3️⃣ Testando Gatilhos Psicológicos...');
        exec('node -e "const T = require(\'./src/services/psychological-trigger-engine\'); const t = new T(); t.testarGatilhos();"',
        (error, stdout) => {
            console.log(stdout);
        });
    }, 2000);

    setTimeout(() => {
        console.log('\n✅ Testes concluídos!\n');
        rl.close();
    }, 4000);
}

async function executarCampanhaManual() {
    console.log('\n📤 Executando Campanha Manual...\n');

    const ReactivationSystem = require('./reactivation-system');
    const system = new ReactivationSystem();

    console.log('🎯 Processando...');

    // Executar campanha
    setTimeout(async () => {
        try {
            await system.campaignAutomation.executarCampanhaDiaria();
            console.log('\n✅ Campanha executada! Verifique o dashboard de aprovação.\n');
        } catch (error) {
            console.error('❌ Erro:', error.message);
        }
        rl.close();
    }, 1000);
}

async function configurarN8N() {
    console.log('\n⚙️  Configuração N8N Workflow\n');
    console.log('📄 Arquivo: n8n-workflows/reactivation-sequence-3-messages.json\n');
    console.log('📋 Passos:\n');
    console.log('1. Abra seu N8N');
    console.log('2. Clique em "Import from File"');
    console.log('3. Selecione: n8n-workflows/reactivation-sequence-3-messages.json');
    console.log('4. Configure as variáveis de ambiente:');
    console.log('   - API_URL: http://seu-servidor:4002');
    console.log('   - WAHA_URL: https://seu-waha.railway.app');
    console.log('   - WAHA_API_KEY: sua_api_key');
    console.log('   - WAHA_SESSION: fullforce-session');
    console.log('5. Ative o workflow\n');
    console.log('✅ O workflow executará automaticamente às 9h todos os dias!\n');

    rl.close();
}

async function verDashboard() {
    console.log('\n📊 Iniciando Dashboard Winback...\n');

    exec('node reactivation-system.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${error}`);
            return;
        }
        console.log(stdout);
    });

    console.log('✅ Dashboard disponível em: http://localhost:4002\n');

    rl.close();
}

// Executar
quickStart().catch(error => {
    console.error('Erro:', error);
    rl.close();
});
