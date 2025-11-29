#!/usr/bin/env node
// ============================================================================
// GYM PLAN - HTTP API Server
// ============================================================================
// Servidor HTTP que expõe as funcionalidades do MCP via REST API
// Para uso pelo frontend web
// ============================================================================

import { createServer, IncomingMessage, ServerResponse } from "http";
import { userTools } from "../mcp/resources/users.js";
import { exerciseTools } from "../mcp/resources/exercises.js";
import { workoutPlanTools } from "../mcp/resources/workoutPlans.js";
import { workoutSessionTools } from "../mcp/resources/workoutSessions.js";
import { mealTools } from "../mcp/resources/meals.js";
import { mealPlanTools } from "../mcp/resources/mealPlans.js";
import { checkDatabaseConnection } from "../db/prisma.js";

const PORT = process.env.PORT || 3000;

// Tipo flexível para as ferramentas
type ToolHandler = {
  handler: (params: any) => Promise<unknown>;
  [key: string]: unknown;
};

// Todas as ferramentas disponíveis
const allTools: Record<string, ToolHandler> = {
  ...userTools,
  ...exerciseTools,
  ...workoutPlanTools,
  ...workoutSessionTools,
  ...mealTools,
  ...mealPlanTools,
} as Record<string, ToolHandler>;

/**
 * Parse do body JSON
 */
async function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

/**
 * Envia resposta JSON
 */
function sendJSON(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

/**
 * Handler principal
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  // Health check
  if (path === "/" || path === "/health") {
    sendJSON(res, { status: "ok", tools: Object.keys(allTools).length });
    return;
  }

  // Lista de ferramentas
  if (path === "/tools" && req.method === "GET") {
    sendJSON(res, { tools: Object.keys(allTools) });
    return;
  }

  // Chamada de ferramenta: POST /tools/{toolName}
  if (path.startsWith("/tools/") && req.method === "POST") {
    const toolName = path.replace("/tools/", "");
    const tool = allTools[toolName];

    if (!tool) {
      sendJSON(res, { success: false, error: `Ferramenta não encontrada: ${toolName}` }, 404);
      return;
    }

    try {
      const params = await parseBody(req);
      const result = await tool.handler(params);
      sendJSON(res, result);
    } catch (error) {
      sendJSON(res, {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      }, 500);
    }
    return;
  }

  // 404
  sendJSON(res, { error: "Not found" }, 404);
}

/**
 * Inicia o servidor
 */
async function main(): Promise<void> {
  console.log("🏋️ GYM Plan HTTP API Server");
  console.log("📊 Iniciando servidor...");

  // Verifica conexão com o banco
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    console.error("❌ Erro: Não foi possível conectar ao banco de dados.");
    process.exit(1);
  }
  console.log("✅ Banco de dados conectado");

  // Cria servidor HTTP
  const server = createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`✅ API HTTP rodando em http://localhost:${PORT}`);
    console.log(`📝 Ferramentas disponíveis: ${Object.keys(allTools).length}`);
    console.log("\nEndpoints:");
    console.log("  GET  /health - Status do servidor");
    console.log("  GET  /tools  - Lista de ferramentas");
    console.log("  POST /tools/{nome} - Executa uma ferramenta");
  });
}

main().catch(console.error);


