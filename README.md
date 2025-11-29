# 🏋️ GYM Plan MCP Server

Um servidor MCP (Model Context Protocol) completo em TypeScript para gerenciamento de treinos de academia, execução de treinos, planos alimentares, refeições, informações nutricionais e perfil do usuário.

**Compatível com Cursor MCP Server.**

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração no Cursor](#-configuração-no-cursor)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Ferramentas MCP Disponíveis](#-ferramentas-mcp-disponíveis)
- [Recursos MCP](#-recursos-mcp)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Cálculos Automáticos](#-cálculos-automáticos)
- [Desenvolvimento](#-desenvolvimento)

## ✨ Funcionalidades

### 👤 Gerenciamento de Usuários
- Perfil completo com dados físicos
- Objetivos físicos (hipertrofia, emagrecimento, condicionamento, performance)
- Restrições alimentares
- Nível de experiência
- Cálculo automático de IMC, TMB, TDEE e macros recomendados

### 💪 Exercícios
- Catálogo completo de exercícios
- Categorização por grupo muscular
- Níveis de dificuldade
- Equipamentos necessários
- Instruções detalhadas

### 📅 Planos de Treino
- Planos semanais personalizados
- Geração automática baseada no perfil
- Controle de séries, repetições e descanso
- Versionamento de planos
- Treino do dia

### 📊 Sessões de Treino
- Registro de treinos executados
- Performance score automático
- Histórico detalhado
- Estatísticas e evolução
- Recomendações personalizadas

### 🍽️ Refeições
- Catálogo de refeições
- Informações nutricionais completas
- Tags (vegano, lowcarb, sem glúten, etc.)
- Cálculo automático de macros

### 🥗 Planos Alimentares
- Planos semanais com metas calóricas
- Geração automática baseada no perfil
- Distribuição por tipo de refeição
- Análise de atingimento de metas

## 📦 Requisitos

- Node.js 18+
- npm ou yarn

## 🚀 Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Gere o cliente Prisma
npm run db:generate

# 3. Crie o banco de dados e aplique o schema
npm run db:push

# 4. Popule com dados iniciais
npm run db:seed

# 5. Compile o projeto
npm run build

# Ou execute tudo de uma vez:
npm run setup
```

## ⚙️ Configuração no Cursor

Adicione ao seu arquivo `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "gym-plan": {
      "command": "node",
      "args": ["/caminho/para/GYM Plan/dist/mcp/server.js"]
    }
  }
}
```

Ou para desenvolvimento:

```json
{
  "mcpServers": {
    "gym-plan": {
      "command": "npx",
      "args": ["tsx", "/caminho/para/GYM Plan/src/mcp/server.ts"]
    }
  }
}
```

Reinicie o Cursor após a configuração.

## 📁 Estrutura do Projeto

```
/GYM Plan
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── db/
│   │   └── prisma.ts      # Cliente Prisma singleton
│   ├── mcp/
│   │   ├── server.ts      # Servidor MCP principal
│   │   └── resources/
│   │       ├── users.ts         # Recurso de usuários
│   │       ├── exercises.ts     # Recurso de exercícios
│   │       ├── workoutPlans.ts  # Recurso de planos de treino
│   │       ├── workoutSessions.ts # Recurso de sessões
│   │       ├── meals.ts         # Recurso de refeições
│   │       └── mealPlans.ts     # Recurso de planos alimentares
│   ├── types/
│   │   └── index.ts       # Tipos TypeScript e schemas Zod
│   └── utils/
│       ├── validators.ts  # Funções de validação
│       ├── macros.ts      # Cálculos nutricionais
│       └── generators.ts  # Geradores automáticos
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Ferramentas MCP Disponíveis

### Usuários

| Ferramenta | Descrição |
|------------|-----------|
| `users.list` | Lista todos os usuários |
| `users.get` | Busca usuário por ID (com IMC, TMB, TDEE calculados) |
| `users.create` | Cria um novo usuário |
| `users.update` | Atualiza dados do usuário |
| `users.delete` | Remove um usuário |
| `users.stats` | Estatísticas de treino do usuário |

### Exercícios

| Ferramenta | Descrição |
|------------|-----------|
| `exercises.list` | Lista exercícios com filtros |
| `exercises.get` | Busca exercício por ID |
| `exercises.byMuscleGroup` | Exercícios por grupo muscular |
| `exercises.create` | Cria novo exercício |
| `exercises.update` | Atualiza exercício |
| `exercises.delete` | Remove exercício |
| `exercises.muscleGroups` | Lista grupos musculares |

### Planos de Treino

| Ferramenta | Descrição |
|------------|-----------|
| `workoutPlans.list` | Lista planos de treino |
| `workoutPlans.get` | Busca plano por ID |
| `workoutPlans.today` | Treino do dia atual |
| `workoutPlans.create` | Cria plano manual |
| `workoutPlans.generate` | **Gera plano automático** |
| `workoutPlans.update` | Atualiza plano |
| `workoutPlans.delete` | Remove plano |

### Sessões de Treino

| Ferramenta | Descrição |
|------------|-----------|
| `workoutSessions.list` | Lista sessões com filtros |
| `workoutSessions.get` | Busca sessão por ID |
| `workoutSessions.create` | Registra treino executado |
| `workoutSessions.update` | Atualiza sessão |
| `workoutSessions.delete` | Remove sessão |
| `workoutSessions.stats` | Estatísticas do período |
| `workoutSessions.recommendations` | **Recomendações personalizadas** |

### Refeições

| Ferramenta | Descrição |
|------------|-----------|
| `meals.list` | Lista refeições com filtros |
| `meals.get` | Busca refeição por ID |
| `meals.byTag` | Refeições por tag |
| `meals.byCalories` | Por faixa de calorias |
| `meals.create` | Cria nova refeição |
| `meals.update` | Atualiza refeição |
| `meals.delete` | Remove refeição |
| `meals.calculateMacros` | **Calcula macros de múltiplas refeições** |
| `meals.tags` | Lista todas as tags |

### Planos Alimentares

| Ferramenta | Descrição |
|------------|-----------|
| `mealPlans.list` | Lista planos alimentares |
| `mealPlans.get` | Busca plano por ID |
| `mealPlans.today` | Refeições do dia atual |
| `mealPlans.create` | Cria plano manual |
| `mealPlans.generate` | **Gera plano automático** |
| `mealPlans.update` | Atualiza plano |
| `mealPlans.delete` | Remove plano |
| `mealPlans.addMeal` | Adiciona refeição ao plano |
| `mealPlans.removeMeal` | Remove refeição do plano |

## 📚 Recursos MCP

Recursos disponíveis para leitura via MCP Resources:

| URI | Descrição |
|-----|-----------|
| `gym://users` | Lista de usuários |
| `gym://exercises` | Catálogo de exercícios |
| `gym://workout-plans` | Planos de treino |
| `gym://workout-sessions` | Sessões recentes |
| `gym://meals` | Catálogo de refeições |
| `gym://meal-plans` | Planos alimentares |

## 💡 Exemplos de Uso

### Criar um usuário

```typescript
// Via ferramenta MCP
{
  "tool": "users.create",
  "arguments": {
    "nome": "Maria Silva",
    "idade": 25,
    "peso": 60,
    "altura": 165,
    "objetivoFisico": "hipertrofia",
    "nivelExperiencia": "intermediario",
    "restricoesAlimentares": ["glúten"]
  }
}
```

### Gerar plano de treino automático

```typescript
{
  "tool": "workoutPlans.generate",
  "arguments": {
    "userId": "uuid-do-usuario",
    "diasPorSemana": 4
  }
}
```

### Registrar sessão de treino

```typescript
{
  "tool": "workoutSessions.create",
  "arguments": {
    "userId": "uuid-do-usuario",
    "data": "2024-01-15T10:00:00Z",
    "duracao": 60,
    "exercises": [
      {
        "exerciseId": "uuid-do-exercicio",
        "seriesExecutadas": 4,
        "repeticoes": [12, 10, 10, 8],
        "carga": [20, 25, 25, 30]
      }
    ]
  }
}
```

### Gerar plano alimentar automático

```typescript
{
  "tool": "mealPlans.generate",
  "arguments": {
    "userId": "uuid-do-usuario",
    "refeicoesporDia": 5
  }
}
```

## 🧮 Cálculos Automáticos

### Para Usuários

- **IMC** (Índice de Massa Corporal)
- **TMB** (Taxa Metabólica Basal) - Fórmula Mifflin-St Jeor
- **TDEE** (Gasto Energético Total Diário)
- **Meta Calórica** baseada no objetivo
- **Macros Recomendados** (proteína, carboidrato, gordura)

### Para Sessões de Treino

- **Performance Score** (0-100) baseado em:
  - Séries executadas
  - Consistência de repetições
  - Progressão de carga
  - Volume total
  - Comparação com histórico

### Para Refeições

- **Calorias** calculadas automaticamente dos macros
- **Porcentagem de macros** em relação ao total
- **Soma de macros** para múltiplas refeições

### Para Planos Alimentares

- **Macros diários médios**
- **Porcentagem de atingimento** das metas

## 🔧 Desenvolvimento

### Scripts disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Compila TypeScript
npm run start        # Executa versão compilada
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Aplica schema ao banco
npm run db:migrate   # Cria migration
npm run db:seed      # Popula banco com dados
npm run db:studio    # Abre Prisma Studio
npm run setup        # Configuração completa
```

### Tecnologias utilizadas

- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados local
- **Zod** - Validação de schemas
- **MCP SDK** - Model Context Protocol

## 📄 Licença

MIT

---

Desenvolvido com 💪 para o Cursor MCP Server.

