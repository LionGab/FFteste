const moment = require('moment');

class PsychologicalTriggerEngine {
    constructor() {
        // Gatilhos psicológicos implementados
        this.triggers = {
            ESCASSEZ: {
                nome: 'Escassez',
                descricao: 'Limita disponibilidade para criar urgência',
                exemplos: [
                    'Só {vagas} vagas disponíveis',
                    'Oferta válida até {prazo}',
                    'Últimas vagas nesta condição',
                    'Promoção acaba em {horas} horas'
                ],
                efetividade: 'Alta',
                aumento_conversao: '15-25%'
            },
            PROVA_SOCIAL: {
                nome: 'Prova Social',
                descricao: 'Mostra que outros já aproveitaram',
                exemplos: [
                    '{numero} ex-alunos já voltaram esta semana',
                    'João, Maria e mais {numero} já garantiram a vaga',
                    'Todo dia {numero} pessoas aproveitam esta oferta',
                    '{numero}% dos ex-alunos voltam com esta condição'
                ],
                efetividade: 'Muito Alta',
                aumento_conversao: '20-30%'
            },
            ANCORAGEM: {
                nome: 'Ancoragem',
                descricao: 'Compara com preço maior para destacar economia',
                exemplos: [
                    'De R$ {preco_alto} por apenas R$ {preco_baixo}',
                    'Valor normal R$ {preco_alto}, hoje R$ {preco_baixo}',
                    'Economia de R$ {economia} no ano',
                    '{porcentagem}% mais barato que o normal'
                ],
                efetividade: 'Alta',
                aumento_conversao: '18-28%'
            },
            BONUS_EXCLUSIVO: {
                nome: 'Bônus Exclusivo',
                descricao: 'Oferece algo extra só para quem decidir agora',
                exemplos: [
                    '+ 2 meses grátis se confirmar hoje',
                    'Bônus: Avaliação física grátis (valor R$ 150)',
                    'Ganhe kit FullForce exclusivo',
                    'Personal gratuito no 1º mês'
                ],
                efetividade: 'Muito Alta',
                aumento_conversao: '25-35%'
            },
            PERDA_AVERSAO: {
                nome: 'Aversão à Perda',
                descricao: 'Foco no que será perdido se não agir',
                exemplos: [
                    'Não perca esta oportunidade única',
                    'Amanhã volta ao preço normal (+ R$ {diferenca})',
                    'Esta condição não volta mais',
                    'Depois de amanhã perde R$ {economia}'
                ],
                efetividade: 'Muito Alta',
                aumento_conversao: '20-30%'
            },
            RECIPROCIDADE: {
                nome: 'Reciprocidade',
                descricao: 'Oferece algo primeiro para criar obrigação',
                exemplos: [
                    'Estou separando esta vaga especial pra você',
                    'Consegui uma condição exclusiva pro seu retorno',
                    'Falei com o gerente e liberou desconto extra',
                    'Guardei esta oferta pensando em você'
                ],
                efetividade: 'Alta',
                aumento_conversao: '15-25%'
            }
        };

        // Sequências de gatilhos por etapa
        this.sequencias = {
            DIA_1: ['PROVA_SOCIAL', 'ANCORAGEM', 'BONUS_EXCLUSIVO'],
            DIA_2: ['ESCASSEZ', 'PROVA_SOCIAL', 'PERDA_AVERSAO'],
            DIA_3: ['ESCASSEZ', 'PERDA_AVERSAO', 'ANCORAGEM']
        };

        // Dados dinâmicos para os gatilhos
        this.dadosDinamicos = {
            vagasRestantes: () => Math.floor(Math.random() * 5) + 3, // 3-8 vagas
            pessoasQueVoltaram: () => Math.floor(Math.random() * 15) + 5, // 5-20 pessoas
            horasRestantes: () => Math.floor(Math.random() * 24) + 12 // 12-36 horas
        };
    }

    /**
     * Gera mensagem com gatilhos psicológicos
     */
    gerarMensagemComGatilhos(aluno, tipo = 'DIA_1', oferta = null) {
        const nome = aluno.nome.split(' ')[0];
        const gatilhosUsados = this.sequencias[tipo] || this.sequencias.DIA_1;

        // Construir mensagem base
        let mensagem = this.getMensagemBase(nome, tipo);

        // Aplicar gatilhos
        gatilhosUsados.forEach(gatilho => {
            const textoGatilho = this.aplicarGatilho(gatilho, aluno, oferta);
            mensagem = this.inserirGatilho(mensagem, textoGatilho, gatilho);
        });

        // Adicionar CTA forte
        const cta = this.getCTA(tipo);
        mensagem += `\n\n${cta}`;

        return {
            mensagem,
            gatilhosUsados,
            tipo,
            efetividadeEsperada: this.calcularEfetividade(gatilhosUsados)
        };
    }

    /**
     * Mensagem base por dia
     */
    getMensagemBase(nome, tipo) {
        switch (tipo) {
            case 'DIA_1':
                return `Oi ${nome}! 😊\n\nTenho uma OPORTUNIDADE ESPECIAL de retorno pra você:`;

            case 'DIA_2':
                return `${nome}, vi que você viu minha mensagem...\n\nSó passando pra reforçar:`;

            case 'DIA_3':
                return `${nome}! ⏰\n\nÚLTIMA CHANCE - essa é a última vez que consigo esta condição:`;

            default:
                return `Oi ${nome}!`;
        }
    }

    /**
     * Aplica gatilho específico
     */
    aplicarGatilho(tipoGatilho, aluno, oferta) {
        const valorOriginal = this.getValorOriginal(aluno.planoAnterior);
        const valorOferta = oferta?.valorOferta || 119;
        const economia = (valorOriginal * 12) - valorOferta;

        switch (tipoGatilho) {
            case 'ESCASSEZ':
                const vagas = this.dadosDinamicos.vagasRestantes();
                const horas = this.dadosDinamicos.horasRestantes();
                return `⚠️ ATENÇÃO: Só ${vagas} vagas disponíveis!\n   Oferta acaba em ${horas}h`;

            case 'PROVA_SOCIAL':
                const pessoas = this.dadosDinamicos.pessoasQueVoltaram();
                return `✅ ${pessoas} ex-alunos já garantiram a vaga esta semana!\n   Não fique de fora`;

            case 'ANCORAGEM':
                return `💰 PLANO ANUAL R$ 119\n   (De R$ ${valorOriginal}/mês = R$ ${valorOriginal * 12}/ano)\n   ECONOMIA: R$ ${economia.toFixed(0)}`;

            case 'BONUS_EXCLUSIVO':
                return `🎁 BÔNUS ESPECIAL:\n   + 2 meses grátis (R$ ${valorOriginal * 2} de economia)\n   + Avaliação física grátis (R$ 150)\n   Total de bônus: R$ ${(valorOriginal * 2 + 150).toFixed(0)}`;

            case 'PERDA_AVERSAO':
                return `⚠️ IMPORTANTE:\n   Amanhã volta ao preço normal (R$ ${valorOriginal}/mês)\n   Você vai PERDER R$ ${economia.toFixed(0)} de economia!`;

            case 'RECIPROCIDADE':
                return `💙 Falei com o gerente e consegui esta condição EXCLUSIVA pra você...\n   Ninguém mais tem acesso a este preço!`;

            default:
                return '';
        }
    }

    /**
     * Insere gatilho na mensagem
     */
    inserirGatilho(mensagem, textoGatilho, tipo) {
        if (!textoGatilho) return mensagem;

        // Inserir com quebra de linha
        return `${mensagem}\n\n${textoGatilho}`;
    }

    /**
     * CTA por tipo
     */
    getCTA(tipo) {
        switch (tipo) {
            case 'DIA_1':
                return '🎯 Posso garantir sua vaga AGORA?\n\nÉ só responder SIM que eu confirmo!';

            case 'DIA_2':
                return '⏰ Confirma pra mim até hoje?\n\nSó dizer: QUERO!';

            case 'DIA_3':
                return '🔥 RESPONDE AGORA - ÚLTIMA CHANCE!\n\nDiga SIM ou perde pra sempre!';

            default:
                return 'Bora voltar? 💪';
        }
    }

    /**
     * Calcula efetividade combinada dos gatilhos
     */
    calcularEfetividade(gatilhosUsados) {
        // Média de aumento de conversão
        const aumentos = gatilhosUsados.map(g => {
            const trigger = this.triggers[g];
            if (!trigger) return 0;

            const range = trigger.aumento_conversao.split('-');
            const min = parseInt(range[0]);
            const max = parseInt(range[1]);
            return (min + max) / 2;
        });

        const mediaAumento = aumentos.reduce((a, b) => a + b, 0) / aumentos.length;

        return {
            aumentoConversao: `${mediaAumento.toFixed(0)}%`,
            gatilhosCount: gatilhosUsados.length,
            efetividade: mediaAumento > 25 ? 'Muito Alta' : mediaAumento > 20 ? 'Alta' : 'Média'
        };
    }

    /**
     * Gera sequência completa de 3 dias
     */
    gerarSequenciaCompleta(aluno, oferta = null) {
        return {
            dia1: this.gerarMensagemComGatilhos(aluno, 'DIA_1', oferta),
            dia2: this.gerarMensagemComGatilhos(aluno, 'DIA_2', oferta),
            dia3: this.gerarMensagemComGatilhos(aluno, 'DIA_3', oferta),
            cronograma: {
                dia1: { enviar: 'Imediatamente', foco: 'Apresentar oferta' },
                dia2: { enviar: 'Após 48h', foco: 'Reforçar urgência' },
                dia3: { enviar: 'Após 120h (5 dias)', foco: 'Última chance' }
            }
        };
    }

    /**
     * Otimiza gatilhos baseado no perfil do aluno
     */
    otimizarGatilhosPorPerfil(aluno) {
        const motivoSaida = (aluno.motivoSaida || '').toLowerCase();
        const planoAnterior = aluno.planoAnterior || '';
        const diasInativo = aluno.diasInativo || 0;

        let gatilhosRecomendados = [];

        // Motivo financeiro = foco em ancoragem + economia
        if (motivoSaida.includes('financeiro')) {
            gatilhosRecomendados = ['ANCORAGEM', 'PERDA_AVERSAO', 'PROVA_SOCIAL'];
        }
        // Plano alto anterior = foco em bônus + exclusividade
        else if (planoAnterior.includes('Clube') || planoAnterior.includes('Passaporte')) {
            gatilhosRecomendados = ['BONUS_EXCLUSIVO', 'RECIPROCIDADE', 'ESCASSEZ'];
        }
        // Saída recente = urgência máxima
        else if (diasInativo <= 15) {
            gatilhosRecomendados = ['ESCASSEZ', 'PROVA_SOCIAL', 'BONUS_EXCLUSIVO'];
        }
        // Padrão
        else {
            gatilhosRecomendados = ['PROVA_SOCIAL', 'ANCORAGEM', 'ESCASSEZ'];
        }

        return {
            gatilhos: gatilhosRecomendados,
            motivo: this.getMotivoOtimizacao(motivoSaida, planoAnterior, diasInativo),
            efetividadeEsperada: this.calcularEfetividade(gatilhosRecomendados)
        };
    }

    getMotivoOtimizacao(motivo, plano, dias) {
        if (motivo.includes('financeiro')) return 'Saída por motivo financeiro - foco em economia';
        if (plano.includes('Clube')) return 'Ex-plano premium - foco em exclusividade';
        if (dias <= 15) return 'Saída recente - máxima urgência';
        return 'Perfil padrão - abordagem equilibrada';
    }

    getValorOriginal(plano) {
        const valores = {
            'Clube+Full': 179,
            'Passaporte': 189,
            'Prata': 149,
            'Bronze': 119
        };
        return valores[plano] || 149;
    }

    /**
     * Testa gatilhos
     */
    testarGatilhos(alunoTeste = null) {
        const aluno = alunoTeste || {
            nome: 'João Silva',
            planoAnterior: 'Prata',
            motivoSaida: 'financeiro',
            diasInativo: 15
        };

        console.log('\n🧪 TESTE DE GATILHOS PSICOLÓGICOS\n');

        const sequencia = this.gerarSequenciaCompleta(aluno);

        console.log('📅 DIA 1 (Abertura):');
        console.log(sequencia.dia1.mensagem);
        console.log(`   Gatilhos: ${sequencia.dia1.gatilhosUsados.join(', ')}`);
        console.log(`   Efetividade: ${sequencia.dia1.efetividadeEsperada.efetividade}\n`);

        console.log('📅 DIA 2 (Reforço):');
        console.log(sequencia.dia2.mensagem);
        console.log(`   Gatilhos: ${sequencia.dia2.gatilhosUsados.join(', ')}\n`);

        console.log('📅 DIA 3 (Urgência):');
        console.log(sequencia.dia3.mensagem);
        console.log(`   Gatilhos: ${sequencia.dia3.gatilhosUsados.join(', ')}\n`);

        const otimizado = this.otimizarGatilhosPorPerfil(aluno);
        console.log('🎯 GATILHOS OTIMIZADOS PARA O PERFIL:');
        console.log(`   Recomendados: ${otimizado.gatilhos.join(', ')}`);
        console.log(`   Motivo: ${otimizado.motivo}`);
        console.log(`   Aumento esperado: ${otimizado.efetividadeEsperada.aumentoConversao}\n`);

        return sequencia;
    }

    /**
     * Relatório de gatilhos mais efetivos
     */
    getRelatorioEfetividade() {
        return Object.entries(this.triggers).map(([key, trigger]) => ({
            gatilho: trigger.nome,
            descricao: trigger.descricao,
            efetividade: trigger.efetividade,
            aumentoConversao: trigger.aumento_conversao,
            exemplos: trigger.exemplos.length
        })).sort((a, b) => {
            const ordemEfetividade = { 'Muito Alta': 3, 'Alta': 2, 'Média': 1 };
            return ordemEfetividade[b.efetividade] - ordemEfetividade[a.efetividade];
        });
    }
}

module.exports = PsychologicalTriggerEngine;
