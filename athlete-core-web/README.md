# 🏋️ ATHLETE CORE - Frontend

Frontend completo do sistema ATHLETE CORE, construído com **Astro**, autenticação via **Clerk**, e integração com o **MCP Server**.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração do Clerk](#-configuração-do-clerk)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Integração com MCP](#-integração-com-mcp)
- [Rotas](#-rotas)

## ✨ Funcionalidades

- **Autenticação Clerk** - Login/cadastro com proteção de rotas
- **Dashboard** - Visão geral com estatísticas
- **Treinos** - Lista e detalhes de planos de treino
- **Alimentação** - Plano alimentar semanal com macros
- **Perfil** - Informações do usuário com cálculos automáticos
- **UI Minimalista** - Design preto & branco elegante

## 📦 Requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Clerk](https://clerk.com) (gratuita)
- MCP Server rodando em `http://localhost:3000`

## 🚀 Instalação

```bash
# 1. Entre na pasta do projeto
cd athlete-core-web

# 2. Instale as dependências
npm install
```

## 🔐 Configuração do Clerk

### 1. Crie uma conta no Clerk

1. Acesse [clerk.com](https://clerk.com)
2. Crie uma conta gratuita
3. Crie um novo aplicativo

### 2. Configure o aplicativo

No painel do Clerk:

1. Vá em **Configure > User & Authentication > Email, Phone, Username**
2. Ative **Email address** como método de autenticação
3. Opcionalmente, ative Google, GitHub, etc.

### 3. Obtenha as chaves

1. Vá em **Configure > Developers > API Keys**
2. Copie a **Publishable key** (começa com `pk_`)
3. Copie a **Secret key** (começa com `sk_`)

### 4. Configure URLs de redirecionamento

Em **Configure > Paths**:

- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/dashboard`
- **After sign-up URL**: `/dashboard`

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Clerk - Autenticação
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
CLERK_SECRET_KEY=sk_test_sua_chave_aqui

# MCP Server
MCP_API_URL=http://localhost:3000
```

> ⚠️ Nunca commite o arquivo `.env` no repositório!

## ▶️ Executando o Projeto

### 1. Inicie o MCP Server

```bash
# Na pasta do MCP (GYM Plan)
cd "../"
npm run dev
# ou
node dist/mcp/server.js
```

### 2. Inicie o Frontend

```bash
# Na pasta athlete-core-web
npm run dev
```

O frontend estará disponível em `http://localhost:4321`

### Comandos disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

## 📁 Estrutura do Projeto

```
/athlete-core-web
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizáveis
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── Container.astro
│   │   │   └── SectionTitle.astro
│   │   └── layout/          # Componentes de layout
│   │       ├── Header.astro
│   │       ├── Footer.astro
│   │       ├── Sidebar.astro
│   │       └── UserAvatar.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro      # Layout base
│   │   └── DashboardLayout.astro # Layout autenticado
│   ├── middleware/
│   │   ├── auth.ts          # Middleware de autenticação
│   │   └── index.ts
│   ├── modules/
│   │   ├── auth/            # Módulos de autenticação
│   │   ├── dashboard/       # Módulos do dashboard
│   │   ├── treino/          # Módulos de treino
│   │   ├── alimentacao/     # Módulos de alimentação
│   │   └── usuario/         # Módulos de usuário
│   ├── pages/
│   │   ├── index.astro           # Home
│   │   ├── sign-in/index.astro   # Login
│   │   ├── sign-up/index.astro   # Cadastro
│   │   ├── dashboard/index.astro # Dashboard
│   │   ├── treino/
│   │   │   ├── index.astro       # Lista de treinos
│   │   │   └── [id].astro        # Detalhe do treino
│   │   ├── alimentacao/
│   │   │   ├── index.astro       # Plano alimentar
│   │   │   └── [id].astro        # Detalhe da refeição
│   │   └── perfil/index.astro    # Perfil
│   ├── services/
│   │   ├── mcpClient.ts     # Cliente para o MCP Server
│   │   └── clerkServer.ts   # Utilitários do Clerk
│   ├── types/               # Definições TypeScript
│   ├── utils/               # Funções utilitárias
│   └── styles/              # Estilos CSS globais
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 🔌 Integração com MCP

O frontend se comunica com o MCP Server através do arquivo `src/services/mcpClient.ts`.

### Funções disponíveis

```typescript
// Usuários
getUser(userId: string)
getUsers()
getUserStats(userId: string)

// Exercícios
getExercises(filters?)
getExercise(id: string)

// Planos de Treino
getWorkoutPlans(userId: string)
getWorkoutPlan(id: string)
getTodayWorkout(userId: string)

// Sessões de Treino
getWorkoutSessions(userId: string, filters?)
getWorkoutSession(id: string)

// Refeições
getMeals(filters?)
getMeal(id: string)

// Planos Alimentares
getMealPlans(userId: string)
getMealPlan(userId: string)
getTodayMeals(userId: string)
```

### Configuração da URL do MCP

O MCP Server deve estar rodando em `http://localhost:3000`. Para alterar:

1. Modifique a variável `MCP_API_URL` no `.env`
2. Ou altere em `src/utils/constants.ts`

## 🛣️ Rotas

### Públicas

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/sign-in` | Login |
| `/sign-up` | Cadastro |

### Protegidas (requerem autenticação)

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Dashboard principal |
| `/treino` | Lista de planos de treino |
| `/treino/[id]` | Detalhes de um treino |
| `/alimentacao` | Plano alimentar semanal |
| `/alimentacao/[id]` | Detalhes de uma refeição |
| `/perfil` | Perfil do usuário |

## 🎨 Design System

### Paleta de Cores

- **Preto**: `#000000`
- **Branco**: `#ffffff`
- **Cinza claro**: `#f5f5f5`
- **Cinza médio**: `#e2e2e2`
- **Cinza escuro**: `#3a3a3a`

### Tipografia

- **Fonte**: Inter
- **Pesos**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Características

- Bordas pretas finas (`1px`)
- Botões com inversão no hover (preto ↔ branco)
- Sem sombras pesadas
- Muito espaço negativo

## 📄 Licença

MIT

---

Desenvolvido para o **ATHLETE CORE** 💪

