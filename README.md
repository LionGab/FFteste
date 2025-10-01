# 🏋️ FullForce Academia - Website Oficial

## 🔍 Auditoria Técnica Completa

### 📋 Visão Geral do Projeto

Site institucional completo para a **FullForce Academia**, desenvolvido com foco em performance, responsividade e experiência do usuário.

### 🏗️ Arquitetura do Projeto

```
FullForceAcademia/
├── fullforce-site/          # Diretório principal do site
│   ├── index.html           # Página inicial
│   ├── css/                 # Arquivos de estilos
│   │   ├── style.css        # Estilos principais
│   │   └── responsive.css   # Media queries e responsividade
│   ├── js/                  # Scripts JavaScript
│   │   └── main.js          # Funcionalidades interativas
│   ├── images/              # Imagens e assets
│   └── pages/               # Páginas secundárias
│       ├── about.html       # Sobre a academia
│       ├── services.html    # Serviços oferecidos
│       ├── schedule.html    # Grade de horários
│       └── contact.html     # Formulário de contato
├── package.json             # Configuração do projeto
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Documentação (este arquivo)
```

## 🚀 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica moderna
- **CSS3**: Estilos avançados com variáveis CSS e Flexbox/Grid
- **JavaScript ES6+**: Interatividade e validações
- **Design Responsivo**: Mobile-first approach
- **Acessibilidade**: ARIA labels e navegação por teclado

## 📱 Páginas Implementadas

### 1. **Página Inicial (index.html)**
- Hero section com call-to-action
- Grid de features (4 cards)
- Preview de serviços
- Seção de conversão (CTA)
- Footer completo

### 2. **Sobre (about.html)**
- História da academia
- Missão e valores
- Informações sobre a equipe
- Grid de valores institucionais

### 3. **Serviços (services.html)**
- 8 modalidades detalhadas:
  - Musculação
  - Treinamento Funcional
  - CrossFit
  - Personal Training
  - Yoga e Pilates
  - Spinning
  - Lutas (Boxe/Muay Thai)
  - Dança Fitness
- Benefícios de cada serviço

### 4. **Horários (schedule.html)**
- Grade de horários completa
- Tabelas para Segunda-Sexta e Sábado
- Informações sobre funcionamento
- Sistema de vagas

### 5. **Contato (contact.html)**
- Formulário de contato validado
- Informações de contato completas
- Seção de perguntas frequentes (FAQ)
- Área para mapa (preparada)

## 🎨 Design System

### Paleta de Cores
```css
--primary-color: #ff6b00    /* Laranja vibrante */
--secondary-color: #1a1a1a  /* Preto suave */
--accent-color: #ffaa00     /* Amarelo-laranja */
--text-color: #333          /* Cinza escuro */
--light-bg: #f5f5f5        /* Fundo claro */
--white: #ffffff           /* Branco */
```

### Tipografia
- Font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Tamanhos responsivos
- Line-height otimizado para leitura

## 📐 Features Implementadas

### ✅ Responsividade
- Desktop (1400px+)
- Laptop (1024px - 1399px)
- Tablet (768px - 1023px)
- Mobile (até 767px)

### ✅ Interatividade
- Menu hamburger mobile
- Smooth scrolling
- Validação de formulários
- Animações on scroll
- Back to top button
- Efeitos hover em cards

### ✅ Acessibilidade
- Navegação por teclado
- Contraste adequado
- Labels semânticos
- ARIA attributes

### ✅ Performance
- CSS otimizado
- JavaScript modular
- Carregamento eficiente
- Sem dependências externas

## 🚀 Como Executar

### Opção 1: Abrir diretamente
```bash
# Navegue até o diretório
cd fullforce-site

# Abra o index.html no navegador
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

### Opção 2: Servidor local (http-server)
```bash
# Instalar http-server globalmente (se necessário)
npm install -g http-server

# Executar servidor
npm start
# ou
http-server fullforce-site -p 8080 -o
```

### Opção 3: Live Server (desenvolvimento)
```bash
# Instalar live-server globalmente (se necessário)
npm install -g live-server

# Executar com hot reload
npm run dev
# ou
live-server fullforce-site --port=8080
```

## 📝 Estrutura de Navegação

```
Home (index.html)
├── Sobre (pages/about.html)
├── Serviços (pages/services.html)
├── Horários (pages/schedule.html)
└── Contato (pages/contact.html)
```

## 🔧 Personalização

### Alterar Cores
Edite as variáveis CSS em `css/style.css`:
```css
:root {
    --primary-color: #sua-cor;
    --secondary-color: #sua-cor;
}
```

### Adicionar Novas Páginas
1. Crie o arquivo HTML em `pages/`
2. Use o template de uma página existente
3. Atualize os links de navegação
4. Adicione no footer

### Modificar Conteúdo
- Textos: Edite diretamente nos arquivos HTML
- Estilos: Modifique `css/style.css`
- Comportamentos: Ajuste `js/main.js`

## 📊 Status do Projeto

### ✅ Implementado
- [x] Estrutura completa do site
- [x] 5 páginas principais
- [x] Design responsivo
- [x] Sistema de navegação
- [x] Formulário de contato
- [x] Grade de horários
- [x] Catálogo de serviços
- [x] Animações e interações
- [x] Validações de formulário

### 🔄 Melhorias Futuras
- [ ] Integração com backend
- [ ] Sistema de agendamento online
- [ ] Galeria de fotos
- [ ] Blog de conteúdo
- [ ] Área do aluno
- [ ] Integração com redes sociais
- [ ] Newsletter
- [ ] Chat online

## 📞 Contato

**FullForce Academia**
- 📧 Email: contato@fullforceacademia.com.br
- 📱 WhatsApp: (11) 98765-4321
- 📞 Telefone: (11) 1234-5678
- 📍 Endereço: Rua Exemplo, 123 - São Paulo, SP

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuições

Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido com 💪 pela equipe FullForce Academia**
