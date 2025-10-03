const moment = require('moment');

class SmartOfferGenerator {
    constructor() {
        // Regras de ofertas por segmento de inatividade
        this.regrasOfertas = {
            // 7-15 dias inativo - desconto matrícula
            '7-15': {
                nome: 'Desconto Matrícula 20%',
                tipo: 'DESCONTO',
                valor: 20,
                descricao: 'Desconto de 20% na matrícula',
                termos: 'Válido por 48h. Não cumulativo.',
                valorFinal: 'Matrícula de R$ 100 por R$ 80',
                urgencia: '48 horas',
                conversaoEsperada: '30-35%',
                roi: 'Alto'
            },

            // 30-45 dias - 1ª avaliação grátis
            '30-45': {
                nome: 'Avaliação Física Grátis',
                tipo: 'BRINDE',
                valor: 0,
                descricao: 'Primeira avaliação física completamente grátis',
                termos: 'Válido por 7 dias. Agendar pelo WhatsApp.',
                valorFinal: 'Avaliação de R$ 150 - GRÁTIS',
                urgencia: '7 dias',
                conversaoEsperada: '25-30%',
                roi: 'Médio-Alto'
            },

            // 45-60 dias - amigo grátis plano anual
            '45-60': {
                nome: 'Traga um Amigo Grátis',
                tipo: 'COMBO',
                valor: 119,
                descricao: 'Amigo treina grátis por 1 mês ao contratar plano anual',
                termos: 'Válido para plano anual R$ 119. Amigo recebe 1 mês grátis.',
                valorFinal: 'Você: R$ 119/ano + Amigo: 1 mês grátis',
                urgencia: '10 dias',
                conversaoEsperada: '20-25%',
                roi: 'Médio'
            },

            // 60+ dias - combo matrícula + avaliação
            '60+': {
                nome: 'Combo Retorno Total',
                tipo: 'COMBO',
                valor: 100,
                descricao: 'Matrícula + Avaliação Física + 1ª semana',
                termos: 'Pacote completo de retorno. Válido por 15 dias.',
                valorFinal: 'Combo completo: R$ 100 (economia de R$ 250)',
                urgencia: '15 dias',
                conversaoEsperada: '15-20%',
                roi: 'Médio-Baixo'
            }
        };

        // Ofertas especiais por plano anterior
        this.ofertasPorPlano = {
            'Clube+Full': {
                nome: 'Retorno VIP Anual',
                descricao: 'R$ 119 anual + 2 meses grátis (economia total R$ 358)',
                valorOriginal: 179,
                valorOferta: 119,
                economia: 60,
                beneficios: ['Acesso ilimitado', 'Todas as aulas', '2 meses extras grátis'],
                urgencia: '72h',
                conversaoEsperada: '35-40%'
            },
            'Passaporte': {
                nome: 'Passaporte Anual Premium',
                descricao: 'De R$ 189/mês para R$ 119/ano',
                valorOriginal: 189,
                valorOferta: 119,
                economia: 2149,
                beneficios: ['Economia de R$ 2.149 no ano', 'Acesso total', 'Sem fidelidade'],
                urgencia: '72h',
                conversaoEsperada: '32-37%'
            },
            'Prata': {
                nome: 'Upgrade Anual Prata',
                descricao: 'Plano anual com benefícios do Prata',
                valorOriginal: 149,
                valorOferta: 119,
                economia: 1669,
                beneficios: ['R$ 119/ano', 'Mesmos benefícios', 'Economia R$ 1.669'],
                urgencia: '72h',
                conversaoEsperada: '28-33%'
            }
        };

        // Ofertas por motivo de saída
        this.ofertasPorMotivo = {
            'financeiro': {
                nome: 'Condição Financeira Especial',
                tipo: 'PLANO_ANUAL',
                descricao: 'Plano anual R$ 119 - menos de R$ 10/mês!',
                destaque: 'ECONOMIA MÁXIMA',
                argumento: 'Menos que 2 lanches por mês, mas com saúde pra vida toda!',
                conversaoEsperada: '40-45%'
            },
            'tempo': {
                nome: 'Flexibilidade Total',
                tipo: 'HORARIOS_FLEXIVEIS',
                descricao: 'Treino rápido 30min + horários 5h-23h',
                destaque: 'ENCAIXA NA SUA ROTINA',
                argumento: 'Academia aberta quando VOCÊ pode. Treino eficiente em 30min!',
                conversaoEsperada: '30-35%'
            },
            'lesao': {
                nome: 'Retorno Progressivo',
                tipo: 'ACOMPANHAMENTO',
                descricao: 'Avaliação + treino adaptado + acompanhamento',
                destaque: 'SEGURANÇA E CUIDADO',
                argumento: 'Retorne com segurança. Treino personalizado pra sua recuperação!',
                conversaoEsperada: '25-30%'
            }
        };
    }

    /**
     * Gera oferta personalizada para o aluno
     */
    gerarOferta(aluno) {
        const diasInativo = aluno.diasInativo || this.calcularDiasInativo(aluno.dataSaida);
        const planoAnterior = aluno.planoAnterior || '';
        const motivoSaida = aluno.motivoSaida || '';

        // Prioridade 1: Motivo de saída (se financeiro = anual R$119)
        if (motivoSaida.toLowerCase().includes('financeiro')) {
            return this.gerarOfertaFinanceira(aluno, planoAnterior);
        }

        // Prioridade 2: Plano anterior (manter valor percebido)
        if (this.ofertasPorPlano[planoAnterior]) {
            return this.gerarOfertaPorPlano(aluno, planoAnterior);
        }

        // Prioridade 3: Dias de inatividade
        return this.gerarOfertaPorInatividade(aluno, diasInativo);
    }

    /**
     * Oferta financeira (prioridade máxima)
     */
    gerarOfertaFinanceira(aluno, planoAnterior) {
        const valorOriginal = this.getValorOriginal(planoAnterior);

        return {
            nome: 'OFERTA ESPECIAL - Plano Anual R$ 119',
            tipo: 'PLANO_ANUAL_FINANCEIRO',
            valorOriginal,
            valorOferta: 119,
            economia: (valorOriginal * 12) - 119,
            descricao: `De R$ ${valorOriginal}/mês para R$ 119/ANO INTEIRO`,
            beneficios: [
                '⭐ Apenas R$ 9,92 por mês',
                `💰 Economia de R$ ${((valorOriginal * 12) - 119).toFixed(0)} no ano`,
                '🎯 Acesso ilimitado todos os dias',
                '🏋️ Todas as aulas inclusas',
                '📅 Sem fidelidade após o ano'
            ],
            urgencia: '48 horas',
            cta: 'QUERO ECONOMIZAR AGORA',
            conversaoEsperada: '40-45%',
            roi: 'Altíssimo',
            scriptVenda: this.getScriptFinanceiro(aluno.nome, valorOriginal)
        };
    }

    /**
     * Oferta por plano anterior
     */
    gerarOfertaPorPlano(aluno, planoAnterior) {
        const config = this.ofertasPorPlano[planoAnterior];

        return {
            ...config,
            tipo: 'RETORNO_VIP',
            scriptVenda: this.getScriptPlano(aluno.nome, planoAnterior, config)
        };
    }

    /**
     * Oferta por dias de inatividade
     */
    gerarOfertaPorInatividade(aluno, diasInativo) {
        let oferta;

        if (diasInativo <= 15) {
            oferta = this.regrasOfertas['7-15'];
        } else if (diasInativo <= 45) {
            oferta = this.regrasOfertas['30-45'];
        } else if (diasInativo <= 60) {
            oferta = this.regrasOfertas['45-60'];
        } else {
            oferta = this.regrasOfertas['60+'];
        }

        return {
            ...oferta,
            diasInativo,
            scriptVenda: this.getScriptInatividade(aluno.nome, diasInativo, oferta)
        };
    }

    /**
     * Script de venda financeiro
     */
    getScriptFinanceiro(nome, valorOriginal) {
        return `
Oi ${nome}! 😊

Sei que o orçamento é importante, então preparei algo ESPECIAL:

💰 PLANO ANUAL R$ 119
(sim, o ano INTEIRO!)

Veja só:
✅ De R$ ${valorOriginal}/mês para R$ 9,92/mês
✅ Economia de R$ ${((valorOriginal * 12) - 119).toFixed(0)} no ano
✅ Zero burocracia pra voltar
✅ Acesso total todos os dias

É literalmente o preço de 2 lanches por mês... mas com resultado pra vida toda! 💪

Essa condição é SÓ até amanhã (são poucas vagas).

Posso garantir a sua?
        `.trim();
    }

    /**
     * Script de venda por plano
     */
    getScriptPlano(nome, plano, config) {
        return `
Oi ${nome}! 👋

Você era ${plano} e faz muita falta por aqui...

Trouxe uma OFERTA EXCLUSIVA de retorno:

🎯 ${config.nome.toUpperCase()}
• De R$ ${config.valorOriginal}/mês
• Por R$ ${config.valorOferta} NO ANO INTEIRO
• Economia: R$ ${config.economia} 💰

${config.beneficios.map(b => `✅ ${b}`).join('\n')}

Válido só por ${config.urgencia}!

Bora voltar pra família FullForce? ❤️
        `.trim();
    }

    /**
     * Script por inatividade
     */
    getScriptInatividade(nome, dias, oferta) {
        const tempo = dias <= 30 ? 'faz pouco tempo' : `faz ${dias} dias`;

        return `
Oi ${nome}! Tudo bem?

Vi que ${tempo} você não treina... sentimos sua falta! 😢

Preparei algo especial pro seu retorno:

🎁 ${oferta.nome.toUpperCase()}
${oferta.descricao}

${oferta.valorFinal}

✅ ${oferta.termos}
⏰ Válido por ${oferta.urgencia}

Vamos voltar? 💪
        `.trim();
    }

    /**
     * Calcula dias de inatividade
     */
    calcularDiasInativo(dataSaida) {
        if (!dataSaida) return 0;
        return moment().diff(moment(dataSaida), 'days');
    }

    /**
     * Valor original por plano
     */
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
     * Testa oferta
     */
    testarOferta(alunoTeste) {
        const aluno = alunoTeste || {
            nome: 'João Silva',
            planoAnterior: 'Prata',
            dataSaida: '2024-11-20',
            motivoSaida: 'financeiro',
            diasInativo: 15
        };

        const oferta = this.gerarOferta(aluno);

        console.log('\n🎯 OFERTA GERADA:\n');
        console.log(oferta);
        console.log('\n📝 SCRIPT DE VENDA:\n');
        console.log(oferta.scriptVenda);

        return oferta;
    }

    /**
     * Gera ofertas para lote completo
     */
    gerarOfertasLote(lote) {
        return lote.map(aluno => ({
            ...aluno,
            oferta: this.gerarOferta(aluno)
        }));
    }

    /**
     * Estatísticas de ofertas
     */
    getEstatisticasOfertas(lote) {
        const comOfertas = this.gerarOfertasLote(lote);

        const porTipo = {};
        comOfertas.forEach(a => {
            const tipo = a.oferta.tipo;
            porTipo[tipo] = (porTipo[tipo] || 0) + 1;
        });

        const conversaoMedia = comOfertas.reduce((sum, a) => {
            const conv = parseFloat(a.oferta.conversaoEsperada?.split('-')[0] || 0);
            return sum + conv;
        }, 0) / comOfertas.length;

        const receitaEsperada = comOfertas.reduce((sum, a) => {
            const conv = parseFloat(a.oferta.conversaoEsperada?.split('-')[0] || 20) / 100;
            const valor = a.oferta.valorOferta || 119;
            return sum + (valor * conv);
        }, 0);

        return {
            totalOfertas: comOfertas.length,
            distribuicaoPorTipo: porTipo,
            conversaoMediaEsperada: `${conversaoMedia.toFixed(1)}%`,
            receitaEsperada: `R$ ${receitaEsperada.toFixed(2)}`,
            conversoes Esperadas: Math.round(comOfertas.length * (conversaoMedia / 100))
        };
    }
}

module.exports = SmartOfferGenerator;
