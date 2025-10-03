# 🎯 Sistema de Reativação FullForce Academia

Sistema completo de reativação de alunos inativos com **3 ETAPAS** integradas.

**META**: 100% conversão anual @ R$119 dos 650 inativos
**ROI ESPERADO**: 3800%
**LOCAL**: Matupá-MT (24 mil habitantes)

---

## 📊 VISÃO GERAL

### Componentes Principais

**ETAPA 1 - Scoring & Aprovação Manual**
- ✅ SmartScoringEngine: Pontua inativos 0-100
- ✅ DailyBatchSelector: Seleciona top 30-40/dia
- ✅ HyperPersonalizer: Mensagens personalizadas
- ✅ ManualApprovalDashboard: Aprovação operadora
- ✅ ResponseTracker + BlacklistManager

**ETAPA 2 - Automação & Inteligência**
- ✅ InactivityDetector: Segmentação 7/15/30/45/60+ dias
- ✅ SmartOfferGenerator: Ofertas automáticas por segmento
- ✅ WhatsAppCampaignAutomation: Sequências personalizadas
- ✅ ConversionTracker: ROI em tempo real
- ✅ A/B Testing Engine

**ETAPA 3 - Gatilhos Psicológicos & N8N**
- ✅ RecentChurnDetector: Saídas <30 dias (prioridade máxima)
- ✅ PsychologicalTriggerEngine: Escassez, prova social, ancoragem
- ✅ N8N Workflow: Sequência 3 mensagens automática
- ✅ WinbackDashboard: Monitoramento em tempo real

---

## 🚀 INSTALAÇÃO

### 1. Dependências

```bash
cd FullForceAcademia
npm install
```

### 2. Configuração do .env

```env
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
AUTO_CAMPAIGN=false
```

### 3. Estrutura do Google Sheets

Criar abas:
- **Inativos**: Colunas A-K (Nome, Telefone, Plano, Data Início, Data Saída, Motivo, Idade, etc)
- **Conversões**: Registros de sucesso
- **Respostas**: Tracking de respostas
- **Campanhas**: Log de envios

---

## 💻 USO DO SISTEMA

### Modo 1: Manual (Aprovação Operadora)

```bash
# 1. Iniciar servidor
node reactivation-system.js

# 2. Acessar dashboard de aprovação
http://localhost:4002/api/reactivation/dashboard

# 3. Operadora revisa e aprova lote diário
# 4. Sistema envia mensagens aprovadas via WAHA
```

### Modo 2: Automático (Campanha Diária)

```bash
# 1. Configurar AUTO_CAMPAIGN=true no .env

# 2. Iniciar sistema
node reactivation-system.js

# 3. Sistema executa automaticamente às 9h:
#    - Detecta inativos
#    - Calcula scoring
#    - Seleciona top 40
#    - Gera mensagens personalizadas
#    - Envia para aprovação/execução
```

### Modo 3: N8N Workflow (Sequência 3 Mensagens)

```bash
# 1. Importar workflow para N8N
n8n-workflows/reactivation-sequence-3-messages.json

# 2. Configurar variáveis de ambiente no N8N:
#    - API_URL
#    - WAHA_URL
#    - WAHA_API_KEY
#    - WAHA_SESSION

# 3. Ativar workflow

# 4. Sistema executa sequência:
#    DIA 1: Mensagem inicial (gatilhos: prova social + ancoragem)
#    DIA 2: Reforço (gatilhos: escassez + perda)
#    DIA 3: Urgência final (gatilhos: escassez máxima)
```

---

## 📈 SISTEMA DE SCORING

### Critérios e Pesos (Total: 12 pontos)

| Critério | Peso | Impacto |
|----------|------|---------|
| Dias Inativo | 3 | 25% - Quanto mais recente, maior prioridade |
| Motivo Saída | 4 | 33% - Financeiro = 10/10, Mudança = 1/10 |
| Plano Anterior | 2 | 17% - Clube+Full = 10/10, Bronze = 4/10 |
| Tempo Permanência | 2 | 17% - 12+ meses = 10/10, <1 mês = 2/10 |
| Idade | 1 | 8% - 26-35 anos = 10/10 (sweet spot) |

### Score Final (0-100)

- **80-100**: PRIORIDADE MUITO ALTA (converter em 24h)
- **65-79**: PRIORIDADE ALTA (converter em 48h)
- **50-64**: PRIORIDADE MÉDIA (converter em 72h)
- **35-49**: PRIORIDADE BAIXA (converter em 1 semana)
- **0-34**: PRIORIDADE MUITO BAIXA

---

## 🎯 OFERTAS AUTOMÁTICAS

### Por Segmento de Inatividade

| Dias Inativo | Oferta | Conversão Esperada |
|--------------|--------|-------------------|
| 7-15 dias | Desconto 20% matrícula | 30-35% |
| 30-45 dias | 1ª avaliação grátis | 25-30% |
| 45-60 dias | Amigo grátis plano anual | 20-25% |
| 60+ dias | Combo matrícula + avaliação R$100 | 15-20% |

### Por Motivo de Saída

| Motivo | Oferta Recomendada | Conversão Esperada |
|--------|-------------------|-------------------|
| Financeiro | Anual R$119 (economia máxima) | 40-45% |
| Falta de tempo | Horários flexíveis + treino 30min | 30-35% |
| Lesão/Saúde | Retorno progressivo + acompanhamento | 25-30% |

---

## 🧠 GATILHOS PSICOLÓGICOS

### Implementados no Sistema

1. **ESCASSEZ** (15-25% aumento conversão)
   - "Só X vagas disponíveis"
   - "Oferta acaba em X horas"

2. **PROVA SOCIAL** (20-30% aumento)
   - "X ex-alunos já voltaram esta semana"
   - "X% aproveitam esta condição"

3. **ANCORAGEM** (18-28% aumento)
   - "De R$ 179/mês por R$ 119/ano"
   - "Economia de R$ X"

4. **BÔNUS EXCLUSIVO** (25-35% aumento)
   - "+ 2 meses grátis"
   - "Avaliação física grátis"

5. **PERDA AVERSÃO** (20-30% aumento)
   - "Amanhã volta ao preço normal"
   - "Perde R$ X de economia"

6. **RECIPROCIDADE** (15-25% aumento)
   - "Consegui condição exclusiva pra você"
   - "Guardei esta oferta pensando em você"

---

## 📊 DASHBOARDS

### 1. Dashboard Aprovação (`/api/reactivation/dashboard`)
- Lista diária de 30-40 leads selecionados
- Preview de mensagens personalizadas
- Score e prioridade de cada lead
- Aprovação/rejeição individual ou em lote
- Blacklist permanente

### 2. Winback Dashboard (`/`)
- Métricas em tempo real
- Funil de conversão
- Conversões recentes
- Meta do mês
- ROI atualizado

---

## 🔧 API ENDPOINTS

### Principais Rotas

```bash
GET  /api/reactivation/daily-batch          # Lote diário
POST /api/reactivation/send-approved        # Enviar aprovados
GET  /api/reactivation/recent-churn         # Saídas recentes
POST /api/reactivation/blacklist            # Adicionar blacklist
POST /api/reactivation/conversion           # Registrar conversão
GET  /api/reactivation/stats                # Estatísticas
GET  /api/reactivation/dashboard-data       # Dados dashboard
POST /webhook/waha                          # Webhook respostas
GET  /api/test                              # Testar sistema
```

---

## 📱 INTEGRAÇÃO WAHA

### Configuração

```javascript
// Envio de mensagem
await wahaService.sendMessage(telefone, mensagem);

// Webhook de resposta
POST /webhook/waha
{
  "from": "5566999999999@c.us",
  "body": "Sim, quero voltar!",
  "name": "João Silva",
  "timestamp": "2025-01-10T10:00:00Z"
}
```

### Processamento de Respostas

- **"Sim/Quero/Topo/Aceito"** → Marcado como INTERESSADO → Notifica operadora
- **"Não/Pare/Remover"** → Adiciona à blacklist automaticamente
- **"?/Como/Quando"** → Classifica como DÚVIDA
- Outros → Classifica como NEUTRO

---

## 🎯 RESULTADOS ESPERADOS

### Meta: 650 Inativos → 100% Conversão Anual

| Métrica | Valor |
|---------|-------|
| **Total Inativos** | 650 |
| **Abordagens/Dia** | 30-40 |
| **Taxa Conversão** | 20-25% |
| **Conversões/Dia** | 6-10 |
| **Conversões/Mês** | 180-300 |
| **Tempo para 650** | 2-4 meses |
| **Receita/Conversão** | R$ 119 |
| **Receita Esperada** | R$ 77.350 |
| **Custo Estimado** | R$ 3.250 (R$5/lead) |
| **ROI** | 2.280% |

### Breakdown por Prioridade

- **Saídas <30 dias (30%)**: 195 inativos → 35% conversão → 68 anuais
- **Saídas 30-60 dias (25%)**: 162 inativos → 25% conversão → 40 anuais
- **Saídas 60+ dias (45%)**: 293 inativos → 18% conversão → 52 anuais
- **TOTAL ESPERADO**: 160 conversões anuais nos primeiros 3 meses

---

## 🧪 TESTES

### Testar Sistema Completo

```bash
# 1. Teste básico
curl http://localhost:4002/api/test

# 2. Teste de scoring
node -e "
const SmartScoringEngine = require('./src/services/smart-scoring-engine');
const engine = new SmartScoringEngine();
const aluno = {
  nome: 'João Silva',
  telefone: '66999999999',
  planoAnterior: 'Prata',
  dataInicio: '2023-01-15',
  dataSaida: '2024-11-20',
  motivoSaida: 'financeiro',
  idade: 32
};
console.log(engine.calculateScore(aluno));
"

# 3. Teste de mensagem personalizada
node -e "
const HyperPersonalizer = require('./src/services/hyper-personalizer');
const p = new HyperPersonalizer();
p.testarTemplate('urgente_financeiro');
"

# 4. Teste de gatilhos psicológicos
node -e "
const PsychologicalTriggerEngine = require('./src/services/psychological-trigger-engine');
const t = new PsychologicalTriggerEngine();
t.testarGatilhos();
"
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
FullForceAcademia/
├── reactivation-system.js          # Sistema principal
├── winback-dashboard.html          # Dashboard monitoramento
├── REACTIVATION-README.md          # Esta documentação
│
├── src/
│   ├── dashboard-approval.html     # Dashboard aprovação
│   │
│   ├── services/                   # Serviços core
│   │   ├── smart-scoring-engine.js
│   │   ├── daily-batch-selector.js
│   │   ├── hyper-personalizer.js
│   │   ├── response-tracker.js
│   │   ├── inactivity-detector.js
│   │   ├── smart-offer-generator.js
│   │   ├── whatsapp-campaign-automation.js
│   │   ├── conversion-tracker.js
│   │   ├── recent-churn-detector.js
│   │   └── psychological-trigger-engine.js
│   │
│   └── routes/
│       └── reactivation-routes.js
│
├── n8n-workflows/
│   └── reactivation-sequence-3-messages.json
│
└── data/                           # Dados persistidos
    ├── historico-abordagens.json
    ├── blacklist.json
    ├── responses.json
    ├── interessados.json
    ├── conversions.json
    └── ab-tests.json
```

---

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### Ajustar Quantidade Diária

```javascript
// Em daily-batch-selector.js
this.config = {
    minPorDia: 30,
    maxPorDia: 40,      // Ajustar conforme capacidade
    diasCooldown: 7,     // Dias antes de abordar novamente
    scoreMinimo: 20      // Score mínimo para considerar
};
```

### Criar Novo Template

```javascript
// Em hyper-personalizer.js
this.templates.meu_template = [
    {
        texto: `Oi {nome}! Mensagem personalizada aqui...`,
        cta: 'Quero voltar!',
        urgencia: '48h'
    }
];
```

### Criar Teste A/B

```javascript
const teste = conversionTracker.criarTesteAB({
    nome: 'teste_urgencia_vs_beneficio',
    descricao: 'Testar urgência vs benefícios',
    variantes: [
        {
            nome: 'Urgência',
            template: 'urgente_financeiro',
            oferta: 'anual_119',
            mensagem: 'Mensagem focada em urgência...'
        },
        {
            nome: 'Benefícios',
            template: 'reconquista_vip',
            oferta: 'anual_119_bonus',
            mensagem: 'Mensagem focada em benefícios...'
        }
    ],
    dataFim: '2025-02-28'
});
```

---

## 🚨 TROUBLESHOOTING

### Problema: Google Sheets não conecta
**Solução**: Verificar credenciais OAuth2 no .env

### Problema: WAHA não envia mensagens
**Solução**:
1. Verificar sessão ativa: `GET /api/sessions/{sessionName}`
2. Restartar sessão se necessário
3. Verificar API_KEY

### Problema: Mensagens duplicadas
**Solução**: Verificar cooldown de 7 dias em `daily-batch-selector.js`

### Problema: Taxa de conversão baixa
**Solução**:
1. Revisar scoring (ajustar pesos)
2. Testar novos templates A/B
3. Aumentar uso de gatilhos psicológicos
4. Focar em saídas <30 dias (maior conversão)

---

## 📞 SUPORTE

- **Sistema**: reactivation-system.js
- **Logs**: Console do servidor
- **Dados**: /data/*.json

**Desenvolvido para FullForce Academia - Matupá-MT**
**🎯 Meta: Converter 100% dos 650 inativos em plano anual R$119**
