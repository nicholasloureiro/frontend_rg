# RG - Sistema de Gestão para Alfaiataria

Sistema completo de gestão para lojas de aluguel e venda de trajes formais, desenvolvido com React e Vite.

## 📋 Sobre o Projeto

O RG é uma aplicação web moderna para gerenciamento de alfaiatarias e lojas de trajes de gala. O sistema oferece controle completo sobre:

- **Dashboard Analítico**: Métricas em tempo real sobre vendas, conversões, ticket médio e desempenho
- **Gestão de Clientes**: Cadastro completo com histórico de pedidos e atendimentos
- **Gestão de Funcionários**: Controle de atendentes e seus desempenhos
- **Triagem**: Sistema de primeiro atendimento para captura de leads e informações iniciais
- **Ordens de Serviço**: Gerenciamento detalhado de pedidos de locação e venda com controle de estoque e ajustes
- **Eventos**: Organização por eventos (casamentos, formaturas, etc.)
- **Produtos**: Catálogo de produtos disponíveis para locação e venda

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18.3** - Biblioteca principal
- **React Router DOM 7** - Gerenciamento de rotas
- **Redux Toolkit** - Gerenciamento de estado global
- **Vite 7** - Build tool e dev server
- **Axios** - Cliente HTTP

### UI/UX
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Ícones
- **Phosphor Icons** & **Lucide React** - Ícones adicionais
- **FontAwesome** - Ícones
- **Material UI** - Componentes React
- **SweetAlert2** - Alertas e modais elegantes

### Gráficos e Visualização
- **Nivo** - Biblioteca de gráficos (`@nivo/bar`, `@nivo/line`, `@nivo/pie`)

### Utilitários
- **React DatePicker** - Seleção de datas
- **React Phone Number Input** - Input de telefone internacional
- **jsPDF & html2canvas** - Geração de PDFs
- **browser-image-compression** - Compressão de imagens
- **google-libphonenumber** - Validação de telefones

## 📂 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Charts.jsx
│   ├── Header.jsx
│   ├── Modal.jsx
│   ├── Sidebar.jsx
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Home.jsx        # Dashboard
│   ├── Login.jsx
│   ├── Clientes.jsx
│   ├── Funcionarios.jsx
│   ├── Triagem.jsx
│   ├── OrdemServico.jsx
│   ├── Eventos.jsx
│   └── Produtos.jsx
├── services/           # Serviços de API
│   ├── api.js          # Configuração Axios
│   ├── authService.js
│   ├── clientService.js
│   ├── dashboardService.js
│   └── ...
├── store/              # Redux Store
│   ├── index.js
│   └── slices/
├── hooks/              # Custom Hooks
│   ├── useAuth.js
│   ├── useTheme.js
│   └── ...
├── utils/              # Funções utilitárias
│   ├── Mascaras.js
│   ├── ValidarCPF.js
│   ├── format.js
│   └── ...
└── styles/             # Arquivos CSS
```

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- NPM ou Yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd RG
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Copie o template `.env.example` para `.env` e ajuste:
```bash
cp .env.example .env
```
Exemplo:
```env
VITE_API_BASE_URL=http://localhost:8000
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse a aplicação em `http://localhost:5173`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa o linter
- `npm run preview` - Preview do build de produção
- `npm test` - Roda os testes (vitest)
- `npm run test:watch` - Modo watch
- `npm run test:ui` - UI interativa do vitest

## 🧪 Testes

O projeto usa **Vitest** + **@testing-library/react**. Os testes ficam em `src/**/__tests__/` ou como `*.test.js[x]` ao lado do arquivo testado.

```bash
npm test                         # roda tudo
npm test -- ValidarCPF           # filtra por nome
npm run test:watch               # modo watch (re-roda ao salvar)
```

Configuração: `vitest.config.js` + `src/test/setup.js`.

## 🏛️ Arquitetura

Decisões arquiteturais estão documentadas em [`docs/adr/`](docs/adr/):

1. [0001 — Record architecture decisions](docs/adr/0001-record-architecture-decisions.md)
2. [0002 — React + Vite + Redux Toolkit](docs/adr/0002-react-vite-redux.md)
3. [0003 — MaterialReactTable for data grids](docs/adr/0003-material-react-table.md)
4. [0004 — JWT auth with auto-refresh](docs/adr/0004-jwt-auth-auto-refresh.md)

## 🔐 Autenticação

O sistema utiliza autenticação JWT (JSON Web Tokens) com refresh tokens automático. As rotas são protegidas e redirecionam para login quando não autenticado.

## 📊 Funcionalidades Principais

### Dashboard
- Visualização de provas, retiradas e devoluções (em atraso, hoje, próximos 10 dias)
- Resultados do dia, semana e mês
- Gráficos analíticos: vendas por tipo, conversão por atendente, ticket médio, etc.
- Filtros por período personalizados

### Triagem
- Formulário completo de primeiro atendimento
- Busca automática de dados do cliente por CPF
- Validação de CPF e email
- Integração com ViaCEP para preenchimento automático de endereço
- Seleção de atendente responsável
- Vinculação com eventos

### Ordem de Serviço
- Cadastro detalhado de produtos (paletó, calça, camisa, colete, acessórios)
- Controle de medidas e ajustes
- Seleção de cores e marcas
- Cálculo automático de valores
- Datas de prova, retirada e devolução
- Geração de PDF da ordem de serviço
- Controle de status (Em andamento, Finalizado, Cancelado)

### Gestão de Clientes
- CRUD completo de clientes
- Histórico de pedidos por cliente
- Busca e filtros
- Visualização de métricas do cliente

### Eventos
- Criação e gerenciamento de eventos
- Vinculação de clientes a eventos
- Acompanhamento de pedidos por evento
- Detalhamento completo do evento

## 🎨 Temas

O sistema suporta tema claro/escuro com alternância automática e persistência da preferência do usuário.

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Autores

Desenvolvido por [Seu Nome/Equipe]

## 📞 Suporte

Para suporte, entre em contato através do email: [seu-email@exemplo.com]
