#!/usr/bin/env node
// ============================================================================
// GYM PLAN MCP - Servidor Principal
// ============================================================================
// Servidor MCP completo para gerenciamento de treinos de academia,
// planos alimentares e perfil do usuário.
//
// Compatível com Cursor MCP Server.
// ============================================================================

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { userTools } from "./resources/users.js";
import { exerciseTools } from "./resources/exercises.js";
import { workoutPlanTools } from "./resources/workoutPlans.js";
import { workoutSessionTools } from "./resources/workoutSessions.js";
import { mealTools } from "./resources/meals.js";
import { mealPlanTools } from "./resources/mealPlans.js";

import { checkDatabaseConnection, disconnectPrisma } from "../db/prisma.js";

// ============================================================================
// CONFIGURAÇÃO DO SERVIDOR
// ============================================================================

const SERVER_NAME = "gym-plan-mcp";
const SERVER_VERSION = "1.0.0";

/**
 * Registro de todas as ferramentas disponíveis
 */
const allTools = {
  ...userTools,
  ...exerciseTools,
  ...workoutPlanTools,
  ...workoutSessionTools,
  ...mealTools,
  ...mealPlanTools,
};

/**
 * Tipo para as ferramentas
 */
type ToolHandler = (params: Record<string, unknown>) => Promise<unknown>;

interface ToolDefinition {
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: ToolHandler;
}

// ============================================================================
// RECURSOS MCP (READ-ONLY)
// ============================================================================

/**
 * Recursos disponíveis para leitura via MCP Resources
 */
const resources = [
  {
    uri: "gym://users",
    name: "Lista de Usuários",
    description: "Lista todos os usuários cadastrados no sistema",
    mimeType: "application/json",
  },
  {
    uri: "gym://exercises",
    name: "Catálogo de Exercícios",
    description: "Lista todos os exercícios disponíveis",
    mimeType: "application/json",
  },
  {
    uri: "gym://workout-plans",
    name: "Planos de Treino",
    description: "Lista todos os planos de treino",
    mimeType: "application/json",
  },
  {
    uri: "gym://workout-sessions",
    name: "Sessões de Treino",
    description: "Lista as últimas sessões de treino",
    mimeType: "application/json",
  },
  {
    uri: "gym://meals",
    name: "Catálogo de Refeições",
    description: "Lista todas as refeições disponíveis",
    mimeType: "application/json",
  },
  {
    uri: "gym://meal-plans",
    name: "Planos Alimentares",
    description: "Lista todos os planos alimentares",
    mimeType: "application/json",
  },
];

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

/**
 * Cria e configura o servidor MCP
 */
function createServer(): Server {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // ========================================
  // HANDLER: Listar Ferramentas
  // ========================================
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = Object.entries(allTools).map(([name, tool]) => {
      const toolDef = tool as ToolDefinition;
      return {
        name,
        description: toolDef.description,
        inputSchema: toolDef.inputSchema,
      };
    });

    return { tools };
  });

  // ========================================
  // HANDLER: Executar Ferramenta
  // ========================================
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = allTools[name as keyof typeof allTools] as ToolDefinition | undefined;

    if (!tool) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: `Ferramenta não encontrada: ${name}`,
            }),
          },
        ],
      };
    }

    try {
      const result = await tool.handler((args || {}) as Record<string, unknown>);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : "Erro desconhecido",
            }),
          },
        ],
      };
    }
  });

  // ========================================
  // HANDLER: Listar Recursos
  // ========================================
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return { resources };
  });

  // ========================================
  // HANDLER: Ler Recurso
  // ========================================
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    let result: unknown;

    switch (uri) {
      case "gym://users":
        result = await userTools["users.list"].handler({});
        break;
      case "gym://exercises":
        result = await exerciseTools["exercises.list"].handler({});
        break;
      case "gym://workout-plans":
        result = await workoutPlanTools["workoutPlans.list"].handler({});
        break;
      case "gym://workout-sessions":
        result = await workoutSessionTools["workoutSessions.list"].handler({ limit: 50 });
        break;
      case "gym://meals":
        result = await mealTools["meals.list"].handler({});
        break;
      case "gym://meal-plans":
        result = await mealPlanTools["mealPlans.list"].handler({});
        break;
      default:
        result = { success: false, error: `Recurso não encontrado: ${uri}` };
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  });

  return server;
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.error("🏋️ GYM Plan MCP Server v" + SERVER_VERSION);
  console.error("📊 Iniciando servidor...");

  // Verifica conexão com o banco
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    console.error("❌ Erro: Não foi possível conectar ao banco de dados.");
    console.error("   Execute: npm run db:push && npm run db:seed");
    process.exit(1);
  }
  console.error("✅ Banco de dados conectado");

  // Cria o servidor
  const server = createServer();

  // Configura transporte stdio
  const transport = new StdioServerTransport();

  // Conecta o servidor ao transporte
  await server.connect(transport);

  console.error("✅ Servidor MCP pronto!");
  console.error("📝 Ferramentas disponíveis: " + Object.keys(allTools).length);

  // Graceful shutdown
  const shutdown = async () => {
    console.error("\n🛑 Encerrando servidor...");
    await disconnectPrisma();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// Executa
main().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});

