const moment = require('moment');

class HyperPersonalizer {
    constructor() {
        this.templates = {
            urgente_financeiro: [
                {
                    texto: `Oi {nome}! 😊

Tudo bem? Vi que você era {plano} e ficou com a gente por {tempo}... sentimos sua falta aqui na FullForce!

Sei que às vezes o orçamento aperta, então trouxe uma oportunidade ESPECIAL pra você:

🔥 PLANO ANUAL R$ 119,00
• Economia de R$ 1.068 no ano
• Acesso ilimitado todos os dias
• Todas as aulas inclusas

Essa oferta é só até AMANHÃ e exclusiva pra você que já fez parte da família FullForce!

Bora voltar? 💪`,
                    cta: 'Quero voltar!',
                    urgencia: '48h'
                },
                {
                    texto: `{nome}, passando aqui rapidinho! 👋

{tempo_academia} de treino juntos não podem ser esquecidos, né?

Tenho uma notícia: liberamos uma condição ESPECIAL de retorno só pra ex-alunos do plano {plano}:

💰 R$ 119 NO ANO INTEIRO
(Isso dá menos de R$ 10/mês!)

Literalmente o preço de 2 lanches... mas com resultado pra vida toda!

Válido só hoje e amanhã. Posso separar sua vaga?`,
                    cta: 'Sim, quero!',
                    urgencia: '48h'
                },
                {
                    texto: `Fala {nome}! Tudo certo?

Olha, sei que quando você saiu era questão de {motivo_saida}... mas trouxe algo que vai te interessar:

🎯 VOLTA CAMPEÃO - R$ 119/ANO
✅ Mesmos benefícios do {plano}
✅ Economia brutal de 89%
✅ Zero burocracia pra voltar

São só {vagas} vagas nessa condição. Garante a sua?`,
                    cta: 'Quero garantir',
                    urgencia: '24h'
                }
            ],

            flexibilidade_horarios: [
                {
                    texto: `Oi {nome}! Como tá a rotina?

Lembro que você comentou sobre {motivo_saida}... então vim com uma solução:

⏰ NOVOS HORÁRIOS FLEXÍVEIS
• Aberto 5h às 23h (seg-sex)
• Finais de semana 7h às 13h
• Treino rápido 30min OK!

BÔNUS: Primeira semana GRÁTIS pra você testar sem compromisso!

{tempo_academia} treinando já mostraram que você tem disciplina... agora só falta o timing certo!

Que tal?`,
                    cta: 'Quero testar',
                    urgencia: '72h'
                },
                {
                    texto: `{nome}! 👊

Saudades de te ver por aqui... {tempo} foi pouco! 😅

Mudamos bastante coisa desde que você saiu:
📅 Horários super flexíveis
⚡ Treinos expressos 30min
🏋️ Equipamentos novos

E pra comemorar seu retorno: *SEMANA GRÁTIS*

Sem pegadinha, sem matrícula. Só testar e decidir!

Amanhã tá bom pra você?`,
                    cta: 'Sim, amanhã!',
                    urgencia: '48h'
                }
            ],

            reconquista_vip: [
                {
                    texto: `{nome}, meu querido(a)! 💙

{tempo_academia} com a gente te transformaram em família FullForce!

Preparamos algo EXCLUSIVO pra você:

👑 VIP RETORNO
• R$ 119 anual (ex-{plano})
• Prioridade reagendamento
• Kit boas-vindas incluso
• Avaliação física grátis

Você faz parte dos TOP 10% de alunos fiéis... por isso essa condição especial!

Aceita voltar pra casa?`,
                    cta: 'Aceito! ❤️',
                    urgencia: '72h'
                },
                {
                    texto: `Oi {nome}! Saudades daqui 🥺

Olha só: {tempo} treinando com consistência merece reconhecimento!

🏆 OFERTA CAMPEÃO (só pra você)
✓ Plano Anual R$ 119
✓ Personal gratuito no 1º mês
✓ Amigo treina grátis por 1 semana

Essa é nossa forma de dizer: *volta logo!*

Topas?`,
                    cta: 'Topo sim!',
                    urgencia: '48h'
                }
            ],

            retorno_padrao: [
                {
                    texto: `Oi {nome}, tudo bem?

Faz um tempo que não te vejo por aqui... sentimos sua falta! 💪

Que tal dar uma passada pra conhecer as novidades?

🎁 PRESENTE PRA VOCÊ:
• Avaliação física completa GRÁTIS
• Aula experimental sem custo
• Plano especial de retorno

Nada de compromisso, só vem conhecer!

Aceita?`,
                    cta: 'Aceito!',
                    urgencia: '1 semana'
                },
                {
                    texto: `{nome}! 👋

A FullForce não é a mesma sem você...

Bora marcar um papo sem compromisso? Quero te mostrar as mudanças e ver se faz sentido você voltar!

🎯 No seu tempo, sem pressão
🎁 Avaliação grátis de boas-vindas
💰 Condições especiais de retorno

Quando você pode?`,
                    cta: 'Vamos marcar',
                    urgencia: '1 semana'
                }
            ]
        };

        this.templateRotation = {}; // Controla rotação de templates
    }

    /**
     * Gera mensagem personalizada para o aluno
     */
    gerarMensagem(aluno) {
        // Selecionar template baseado na recomendação do scoring
        const templateTipo = aluno.scoring?.recomendacao?.template || 'retorno_padrao';
        const templates = this.templates[templateTipo] || this.templates.retorno_padrao;

        // Rotacionar templates para evitar repetição
        const templateIndex = this.getNextTemplateIndex(aluno.telefone, templates.length);
        const template = templates[templateIndex];

        // Substituir variáveis
        const mensagem = this.substituirVariaveis(template.texto, aluno);

        return {
            mensagem,
            template: templateTipo,
            templateIndex,
            cta: template.cta,
            urgencia: template.urgencia,
            metadados: {
                scoreTotal: aluno.scoring?.scoreTotal,
                prioridade: aluno.scoring?.prioridade,
                recomendacao: aluno.scoring?.recomendacao
            }
        };
    }

    /**
     * Substitui variáveis no template
     */
    substituirVariaveis(texto, aluno) {
        let mensagem = texto;

        // Nome
        const primeiroNome = (aluno.nome || 'amigo(a)').split(' ')[0];
        mensagem = mensagem.replace(/{nome}/g, primeiroNome);

        // Plano anterior
        const plano = aluno.planoAnterior || 'nosso plano';
        mensagem = mensagem.replace(/{plano}/g, plano);

        // Tempo de permanência (formato amigável)
        const tempoPermanencia = this.formatarTempoPermanencia(aluno.dataInicio, aluno.dataSaida);
        mensagem = mensagem.replace(/{tempo_academia}/g, tempoPermanencia);
        mensagem = mensagem.replace(/{tempo}/g, tempoPermanencia);

        // Motivo de saída (tratado)
        const motivoTratado = this.tratarMotivoSaida(aluno.motivoSaida);
        mensagem = mensagem.replace(/{motivo_saida}/g, motivoTratado);

        // Vagas disponíveis (número aleatório entre 3-8 para urgência)
        const vagas = Math.floor(Math.random() * 6) + 3;
        mensagem = mensagem.replace(/{vagas}/g, vagas);

        // Dias inativo
        const diasInativo = aluno.dataUltimaAtividade || aluno.dataSaida
            ? moment().diff(moment(aluno.dataUltimaAtividade || aluno.dataSaida), 'days')
            : 0;
        mensagem = mensagem.replace(/{dias_inativo}/g, diasInativo);

        return mensagem.trim();
    }

    /**
     * Formata tempo de permanência de forma amigável
     */
    formatarTempoPermanencia(dataInicio, dataSaida) {
        if (!dataInicio || !dataSaida) return 'o tempo que você treinou';

        const meses = moment(dataSaida).diff(moment(dataInicio), 'months');

        if (meses >= 24) return `${Math.floor(meses / 12)} anos`;
        if (meses >= 12) return '1 ano';
        if (meses >= 6) return `${meses} meses`;
        if (meses >= 2) return `${meses} meses`;
        return 'esse tempo';
    }

    /**
     * Trata motivo de saída para texto amigável
     */
    tratarMotivoSaida(motivo) {
        if (!motivo) return 'ajuste na rotina';

        const motivoLower = motivo.toLowerCase();

        if (motivoLower.includes('financeiro') || motivoLower.includes('dinheiro')) {
            return 'ajuste no orçamento';
        }
        if (motivoLower.includes('tempo') || motivoLower.includes('horario')) {
            return 'falta de tempo';
        }
        if (motivoLower.includes('saude') || motivoLower.includes('lesao')) {
            return 'questão de saúde';
        }
        if (motivoLower.includes('viagem') || motivoLower.includes('mudanca')) {
            return 'mudança de cidade';
        }

        return 'motivo pessoal';
    }

    /**
     * Controla rotação de templates
     */
    getNextTemplateIndex(telefone, totalTemplates) {
        if (!this.templateRotation[telefone]) {
            this.templateRotation[telefone] = 0;
        }

        const index = this.templateRotation[telefone] % totalTemplates;
        this.templateRotation[telefone]++;

        return index;
    }

    /**
     * Gera preview de mensagem para aprovação
     */
    gerarPreview(aluno) {
        const msg = this.gerarMensagem(aluno);

        return {
            telefone: aluno.telefone,
            nome: aluno.nome,
            score: aluno.scoring?.scoreTotal,
            prioridade: aluno.scoring?.prioridade,
            mensagemPreview: msg.mensagem.substring(0, 150) + '...',
            mensagemCompleta: msg.mensagem,
            template: msg.template,
            cta: msg.cta,
            urgencia: msg.urgencia,
            caracteristicas: {
                tamanho: msg.mensagem.length,
                linhas: msg.mensagem.split('\n').length,
                emojis: (msg.mensagem.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
                temUrgencia: msg.urgencia !== '1 semana'
            }
        };
    }

    /**
     * Gera lote de mensagens para aprovação
     */
    gerarLoteParaAprovacao(lote) {
        return lote.map(aluno => this.gerarPreview(aluno));
    }

    /**
     * Estatísticas de templates usados
     */
    getEstatisticasTemplates() {
        const distribuicao = {};

        Object.keys(this.templateRotation).forEach(telefone => {
            const count = this.templateRotation[telefone];
            const tipo = count % 3; // Assumindo 3 templates por tipo

            distribuicao[tipo] = (distribuicao[tipo] || 0) + 1;
        });

        return {
            totalEnviados: Object.keys(this.templateRotation).length,
            distribuicaoPorTemplate: distribuicao,
            templatesDisponiveis: Object.keys(this.templates).length
        };
    }

    /**
     * Adiciona novo template personalizado
     */
    adicionarTemplate(tipo, template) {
        if (!this.templates[tipo]) {
            this.templates[tipo] = [];
        }

        this.templates[tipo].push({
            texto: template.texto,
            cta: template.cta || 'Responder',
            urgencia: template.urgencia || '1 semana'
        });

        console.log(`✅ Template '${tipo}' adicionado com sucesso`);
    }

    /**
     * Testa template com aluno fictício
     */
    testarTemplate(tipo, alunoTeste = null) {
        const aluno = alunoTeste || {
            nome: 'João Silva',
            telefone: '66999999999',
            planoAnterior: 'Prata',
            dataInicio: '2023-01-15',
            dataSaida: '2024-11-01',
            dataUltimaAtividade: '2024-11-01',
            motivoSaida: 'financeiro',
            idade: 32,
            scoring: {
                scoreTotal: 85,
                prioridade: 'MUITO_ALTA',
                recomendacao: {
                    template: tipo
                }
            }
        };

        return this.gerarPreview(aluno);
    }
}

module.exports = HyperPersonalizer;
