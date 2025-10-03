const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');

class ResponseTracker {
    constructor(googleSheetsService) {
        this.googleSheetsService = googleSheetsService;
        this.responsesFile = path.join(__dirname, '../../data/responses.json');
        this.interessadosFile = path.join(__dirname, '../../data/interessados.json');

        this.responses = [];
        this.interessados = [];

        // Palavras-chave que indicam interesse
        this.keywordsInteresse = [
            'sim', 'quero', 'topo', 'aceito', 'interessado', 'bora', 'vamos',
            'pode', 'topo', 'beleza', 'ok', 'legal', 'gostei', 'adorei',
            'quanto', 'como', 'onde', 'horario', 'horário', 'preço', 'valor',
            'vou', 'irei', 'amanhã', 'hoje'
        ];

        // Palavras-chave que indicam rejeição
        this.keywordsRejeicao = [
            'não', 'nao', 'nunca', 'jamais', 'pare', 'parar', 'desistir',
            'desisti', 'não quero', 'nao quero', 'sem interesse',
            'não me', 'nao me', 'bloquear', 'remover', 'sair', 'deletar'
        ];

        this.loadData();
    }

    async loadData() {
        try {
            const data = await fs.readFile(this.responsesFile, 'utf-8');
            this.responses = JSON.parse(data);
        } catch {
            this.responses = [];
        }

        try {
            const data = await fs.readFile(this.interessadosFile, 'utf-8');
            this.interessados = JSON.parse(data);
        } catch {
            this.interessados = [];
        }
    }

    async saveData() {
        await fs.mkdir(path.dirname(this.responsesFile), { recursive: true });
        await fs.writeFile(this.responsesFile, JSON.stringify(this.responses, null, 2));
        await fs.writeFile(this.interessadosFile, JSON.stringify(this.interessados, null, 2));
    }

    /**
     * Processa mensagem recebida do webhook WAHA
     */
    async processarResposta(webhookData) {
        const { from, body, timestamp, name } = webhookData;

        // Normalizar telefone
        const telefone = this.normalizarTelefone(from);
        const mensagem = (body || '').trim().toLowerCase();

        // Classificar resposta
        const classificacao = this.classificarResposta(mensagem);

        const resposta = {
            telefone,
            nome: name || 'Desconhecido',
            mensagem: body,
            classificacao,
            timestamp: timestamp || moment().format('YYYY-MM-DD HH:mm:ss'),
            processado: false
        };

        this.responses.push(resposta);

        // Se interessado, marcar para follow-up imediato
        if (classificacao === 'INTERESSADO') {
            await this.marcarInteressado(telefone, resposta);
        }

        // Se pediu para parar, adicionar à blacklist
        if (classificacao === 'BLACKLIST') {
            await this.processarPedidoParada(telefone, resposta);
        }

        await this.saveData();

        // Atualizar Google Sheets
        if (this.googleSheetsService) {
            await this.atualizarSheetsResposta(resposta);
        }

        console.log(`📬 Resposta processada: ${telefone} - ${classificacao}`);

        return resposta;
    }

    /**
     * Classifica resposta do lead
     */
    classificarResposta(mensagem) {
        const msg = mensagem.toLowerCase();

        // Pedido de parada/blacklist
        const temPalavraRejeicao = this.keywordsRejeicao.some(k => msg.includes(k));
        if (temPalavraRejeicao && (msg.includes('pare') || msg.includes('parar') || msg.includes('não'))) {
            return 'BLACKLIST';
        }

        // Interesse claro
        const temPalavraInteresse = this.keywordsInteresse.some(k => msg.includes(k));
        if (temPalavraInteresse) {
            return 'INTERESSADO';
        }

        // Dúvida/pergunta
        if (msg.includes('?') || msg.includes('como') || msg.includes('quando') || msg.includes('onde')) {
            return 'DUVIDA';
        }

        // Neutro
        return 'NEUTRO';
    }

    /**
     * Marca lead como interessado para follow-up humano
     */
    async marcarInteressado(telefone, resposta) {
        const interessado = {
            telefone,
            nome: resposta.nome,
            primeiraResposta: resposta.mensagem,
            dataResposta: resposta.timestamp,
            status: 'PENDENTE_FOLLOWUP',
            prioridade: 'ALTA',
            notificado: false
        };

        this.interessados.push(interessado);

        // Notificar operadora (pode ser via WhatsApp, Telegram, email, etc)
        await this.notificarOperadora(interessado);

        console.log(`🎯 LEAD QUENTE: ${telefone} demonstrou interesse!`);
    }

    /**
     * Processa pedido de parada/blacklist
     */
    async processarPedidoParada(telefone, resposta) {
        console.log(`❌ Pedido de parada: ${telefone}`);

        // Importar DailyBatchSelector para acessar blacklist
        const DailyBatchSelector = require('./daily-batch-selector');
        const batchSelector = new DailyBatchSelector(this.googleSheetsService);

        await batchSelector.adicionarBlacklist(
            telefone,
            `Solicitou parada: "${resposta.mensagem.substring(0, 50)}"`
        );
    }

    /**
     * Notifica operadora sobre lead interessado
     */
    async notificarOperadora(interessado) {
        // TODO: Implementar notificação (WhatsApp, Telegram, Email, etc)
        console.log(`🔔 NOTIFICAÇÃO: Lead interessado ${interessado.telefone}`);

        // Exemplo: enviar para número da operadora via WAHA
        const mensagemNotificacao = `
🎯 LEAD QUENTE - AÇÃO IMEDIATA

📱 Telefone: ${interessado.telefone}
👤 Nome: ${interessado.nome}
💬 Resposta: "${interessado.primeiraResposta}"
⏰ Horário: ${interessado.dataResposta}

⚡ IMPORTANTE: Entrar em contato AGORA para conversão!
        `.trim();

        // Aqui você enviaria para o WhatsApp da operadora
        // await this.wahaService.sendMessage(process.env.OPERADORA_WHATSAPP, mensagemNotificacao);
    }

    /**
     * Atualiza Google Sheets com resposta
     */
    async atualizarSheetsResposta(resposta) {
        try {
            const values = [[
                resposta.telefone,
                resposta.nome,
                resposta.mensagem,
                resposta.classificacao,
                resposta.timestamp
            ]];

            await this.googleSheetsService.sheets.spreadsheets.values.append({
                spreadsheetId: this.googleSheetsService.spreadsheetId,
                range: 'Respostas!A:E',
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

        } catch (error) {
            console.error('Erro ao atualizar Sheets:', error);
        }
    }

    /**
     * Normaliza número de telefone
     */
    normalizarTelefone(telefone) {
        return telefone.replace(/\D/g, '').slice(-11);
    }

    /**
     * Lista de interessados pendentes
     */
    getInteressadosPendentes() {
        return this.interessados.filter(i => i.status === 'PENDENTE_FOLLOWUP');
    }

    /**
     * Marcar interessado como contatado
     */
    async marcarComoContatado(telefone, observacoes = '') {
        const index = this.interessados.findIndex(i => i.telefone === telefone);

        if (index !== -1) {
            this.interessados[index].status = 'CONTATADO';
            this.interessados[index].dataContato = moment().format('YYYY-MM-DD HH:mm:ss');
            this.interessados[index].observacoes = observacoes;

            await this.saveData();

            console.log(`✅ ${telefone} marcado como contatado`);
        }
    }

    /**
     * Marcar como convertido
     */
    async marcarComoConvertido(telefone, plano, valor) {
        const index = this.interessados.findIndex(i => i.telefone === telefone);

        if (index !== -1) {
            this.interessados[index].status = 'CONVERTIDO';
            this.interessados[index].dataConversao = moment().format('YYYY-MM-DD HH:mm:ss');
            this.interessados[index].planoVendido = plano;
            this.interessados[index].valorConversao = valor;

            await this.saveData();

            // Atualizar Google Sheets
            if (this.googleSheetsService) {
                await this.registrarConversao(this.interessados[index]);
            }

            console.log(`💰 CONVERSÃO: ${telefone} - ${plano} - R$ ${valor}`);
        }
    }

    async registrarConversao(conversao) {
        try {
            const values = [[
                conversao.telefone,
                conversao.nome,
                conversao.planoVendido,
                conversao.valorConversao,
                conversao.dataConversao,
                conversao.dataResposta,
                'REATIVACAO'
            ]];

            await this.googleSheetsService.sheets.spreadsheets.values.append({
                spreadsheetId: this.googleSheetsService.spreadsheetId,
                range: 'Conversoes!A:G',
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

        } catch (error) {
            console.error('Erro ao registrar conversão:', error);
        }
    }

    /**
     * Estatísticas de respostas
     */
    getEstatisticas(diasAtras = 30) {
        const dataLimite = moment().subtract(diasAtras, 'days');

        const respostasRecentes = this.responses.filter(r =>
            moment(r.timestamp).isAfter(dataLimite)
        );

        const interessadosRecentes = this.interessados.filter(i =>
            moment(i.dataResposta).isAfter(dataLimite)
        );

        const convertidosRecentes = interessadosRecentes.filter(i =>
            i.status === 'CONVERTIDO'
        );

        const taxaResposta = respostasRecentes.length; // Total de respostas
        const taxaInteresse = interessadosRecentes.length;
        const taxaConversao = convertidosRecentes.length;

        const receitaTotal = convertidosRecentes.reduce((sum, c) =>
            sum + (parseFloat(c.valorConversao) || 0), 0
        );

        return {
            periodo: `${diasAtras} dias`,
            totalRespostas: respostasRecentes.length,
            distribuicao: {
                INTERESSADO: respostasRecentes.filter(r => r.classificacao === 'INTERESSADO').length,
                DUVIDA: respostasRecentes.filter(r => r.classificacao === 'DUVIDA').length,
                NEUTRO: respostasRecentes.filter(r => r.classificacao === 'NEUTRO').length,
                BLACKLIST: respostasRecentes.filter(r => r.classificacao === 'BLACKLIST').length
            },
            interessados: taxaInteresse,
            convertidos: taxaConversao,
            taxaConversao: taxaInteresse > 0 ? ((taxaConversao / taxaInteresse) * 100).toFixed(1) + '%' : '0%',
            receitaTotal: `R$ ${receitaTotal.toFixed(2)}`,
            ticketMedio: convertidosRecentes.length > 0
                ? `R$ ${(receitaTotal / convertidosRecentes.length).toFixed(2)}`
                : 'R$ 0'
        };
    }

    /**
     * Limpar dados antigos
     */
    async limparDadosAntigos() {
        const dataLimite = moment().subtract(90, 'days');

        this.responses = this.responses.filter(r =>
            moment(r.timestamp).isAfter(dataLimite)
        );

        this.interessados = this.interessados.filter(i =>
            moment(i.dataResposta).isAfter(dataLimite) || i.status === 'PENDENTE_FOLLOWUP'
        );

        await this.saveData();

        console.log('🧹 Dados antigos limpos (>90 dias)');
    }
}

module.exports = ResponseTracker;
