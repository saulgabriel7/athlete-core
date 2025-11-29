// ============================================================================
// GYM PLAN MCP - Cliente Prisma
// ============================================================================
// Singleton do cliente Prisma para conexão com o banco de dados SQLite
// ============================================================================

import { PrismaClient } from "@prisma/client";

// Singleton global para evitar múltiplas instâncias em desenvolvimento
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Cliente Prisma singleton
 * Reutiliza a conexão existente em desenvolvimento para evitar
 * esgotamento de conexões durante hot reload
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Função para desconectar o cliente Prisma
 * Útil para testes e cleanup
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Função para verificar a conexão com o banco
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export default prisma;

