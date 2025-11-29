// ============================================================================
// GYM PLAN MCP - Recurso de Usuários
// ============================================================================
// Gerenciamento completo de usuários do sistema
// ============================================================================

import prisma from "../../db/prisma.js";
import {
  UserCreateSchema,
  UserUpdateSchema,
  type MCPResponse,
} from "../../types/index.js";
import {
  validate,
  arrayToJSON,
  jsonToArray,
  isValidUUID,
} from "../../utils/validators.js";
import {
  calcularIMC,
  classificarIMC,
  calcularPlanoNutricional,
  calcularAguaDiaria,
} from "../../utils/macros.js";
import type { ObjetivoFisico, NivelExperiencia } from "../../types/index.js";

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

interface UserResponse {
  id: string;
  nome: string;
  idade: number;
  peso: number;
  altura: number;
  objetivoFisico: string;
  restricoesAlimentares: string[];
  nivelExperiencia: string;
  createdAt: Date;
  updatedAt: Date;
  // Campos calculados
  imc?: number;
  classificacaoIMC?: string;
  aguaDiaria?: number;
  planoNutricional?: {
    tmb: number;
    tdee: number;
    metaCalorica: number;
    macros: {
      proteina: number;
      carboidrato: number;
      gordura: number;
      calorias: number;
    };
  };
}

// ============================================================================
// FUNÇÕES DE CONVERSÃO
// ============================================================================

/**
 * Converte dados do Prisma para formato de resposta
 */
function formatUserResponse(user: {
  id: string;
  nome: string;
  idade: number;
  peso: number;
  altura: number;
  objetivoFisico: string;
  restricoesAlimentares: string | null;
  nivelExperiencia: string;
  createdAt: Date;
  updatedAt: Date;
}, includeCalculations = true): UserResponse {
  const response: UserResponse = {
    ...user,
    restricoesAlimentares: jsonToArray<string>(user.restricoesAlimentares),
  };

  if (includeCalculations) {
    response.imc = calcularIMC(user.peso, user.altura);
    response.classificacaoIMC = classificarIMC(response.imc);
    response.aguaDiaria = calcularAguaDiaria(user.peso);
    response.planoNutricional = calcularPlanoNutricional(
      user.peso,
      user.altura,
      user.idade,
      user.objetivoFisico as ObjetivoFisico,
      user.nivelExperiencia as NivelExperiencia
    );
  }

  return response;
}

// ============================================================================
// OPERAÇÕES CRUD
// ============================================================================

/**
 * Busca todos os usuários
 */
export async function getUsers(params?: {
  search?: string;
  objetivo?: string;
  nivel?: string;
}): Promise<MCPResponse<UserResponse[]>> {
  try {
    const where: Record<string, unknown> = {};

    if (params?.search) {
      where.nome = { contains: params.search };
    }
    if (params?.objetivo) {
      where.objetivoFisico = params.objetivo;
    }
    if (params?.nivel) {
      where.nivelExperiencia = params.nivel;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: users.map((u) => formatUserResponse(u, false)),
      message: `${users.length} usuário(s) encontrado(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar usuários",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca um usuário por ID
 */
export async function getUserById(
  id: string
): Promise<MCPResponse<UserResponse>> {
  try {
    if (!isValidUUID(id)) {
      return {
        success: false,
        error: "ID inválido",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    return {
      success: true,
      data: formatUserResponse(user),
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar usuário",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Cria um novo usuário
 */
export async function createUser(
  data: unknown
): Promise<MCPResponse<UserResponse>> {
  try {
    const validation = validate(UserCreateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const userData = validation.data;

    const user = await prisma.user.create({
      data: {
        nome: userData.nome,
        idade: userData.idade,
        peso: userData.peso,
        altura: userData.altura,
        objetivoFisico: userData.objetivoFisico,
        restricoesAlimentares: arrayToJSON(userData.restricoesAlimentares || []),
        nivelExperiencia: userData.nivelExperiencia,
      },
    });

    return {
      success: true,
      data: formatUserResponse(user),
      message: "Usuário criado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao criar usuário",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Atualiza um usuário existente
 */
export async function updateUser(
  data: unknown
): Promise<MCPResponse<UserResponse>> {
  try {
    const validation = validate(UserUpdateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const { id, ...updateData } = validation.data;

    // Verifica se usuário existe
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Prepara dados para atualização
    const prismaData: Record<string, unknown> = {};
    if (updateData.nome !== undefined) prismaData.nome = updateData.nome;
    if (updateData.idade !== undefined) prismaData.idade = updateData.idade;
    if (updateData.peso !== undefined) prismaData.peso = updateData.peso;
    if (updateData.altura !== undefined) prismaData.altura = updateData.altura;
    if (updateData.objetivoFisico !== undefined)
      prismaData.objetivoFisico = updateData.objetivoFisico;
    if (updateData.restricoesAlimentares !== undefined)
      prismaData.restricoesAlimentares = arrayToJSON(
        updateData.restricoesAlimentares
      );
    if (updateData.nivelExperiencia !== undefined)
      prismaData.nivelExperiencia = updateData.nivelExperiencia;

    const user = await prisma.user.update({
      where: { id },
      data: prismaData,
    });

    return {
      success: true,
      data: formatUserResponse(user),
      message: "Usuário atualizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao atualizar usuário",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Remove um usuário
 */
export async function deleteUser(id: string): Promise<MCPResponse<{ id: string }>> {
  try {
    if (!isValidUUID(id)) {
      return {
        success: false,
        error: "ID inválido",
      };
    }

    // Verifica se usuário existe
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    await prisma.user.delete({ where: { id } });

    return {
      success: true,
      data: { id },
      message: "Usuário removido com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao remover usuário",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Obtém estatísticas do usuário
 */
export async function getUserStats(
  userId: string
): Promise<
  MCPResponse<{
    totalTreinos: number;
    totalExercicios: number;
    mediaPerformance: number;
    ultimoTreino: Date | null;
    diasConsecutivos: number;
  }>
> {
  try {
    if (!isValidUUID(userId)) {
      return {
        success: false,
        error: "ID inválido",
      };
    }

    // Busca sessões de treino do usuário
    const sessoes = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { data: "desc" },
      include: { exercises: true },
    });

    const totalTreinos = sessoes.length;
    const totalExercicios = sessoes.reduce(
      (sum, s) => sum + s.exercises.length,
      0
    );

    const performanceScores = sessoes
      .filter((s) => s.performanceScore !== null)
      .map((s) => s.performanceScore as number);

    const mediaPerformance =
      performanceScores.length > 0
        ? Math.round(
            performanceScores.reduce((a, b) => a + b, 0) /
              performanceScores.length
          )
        : 0;

    const ultimoTreino = sessoes.length > 0 ? sessoes[0].data : null;

    // Calcula dias consecutivos
    let diasConsecutivos = 0;
    if (sessoes.length > 0) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      for (const sessao of sessoes) {
        const dataSessao = new Date(sessao.data);
        dataSessao.setHours(0, 0, 0, 0);

        const diffDias = Math.floor(
          (hoje.getTime() - dataSessao.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDias === diasConsecutivos || diffDias === diasConsecutivos + 1) {
          diasConsecutivos++;
        } else {
          break;
        }
      }
    }

    return {
      success: true,
      data: {
        totalTreinos,
        totalExercicios,
        mediaPerformance,
        ultimoTreino,
        diasConsecutivos,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar estatísticas",
      details: error instanceof Error ? error.message : error,
    };
  }
}

// ============================================================================
// EXPORTAÇÃO DAS FERRAMENTAS MCP
// ============================================================================

export const userTools = {
  "users.list": {
    description: "Lista todos os usuários do sistema",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Busca por nome" },
        objetivo: {
          type: "string",
          enum: ["hipertrofia", "emagrecimento", "condicionamento", "performance"],
          description: "Filtrar por objetivo físico",
        },
        nivel: {
          type: "string",
          enum: ["iniciante", "intermediario", "avancado"],
          description: "Filtrar por nível de experiência",
        },
      },
    },
    handler: getUsers,
  },
  "users.get": {
    description: "Busca um usuário pelo ID com informações calculadas (IMC, TMB, etc)",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do usuário (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => getUserById(params.id),
  },
  "users.create": {
    description: "Cria um novo usuário no sistema",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome do usuário" },
        idade: { type: "number", description: "Idade em anos" },
        peso: { type: "number", description: "Peso em kg" },
        altura: { type: "number", description: "Altura em cm" },
        objetivoFisico: {
          type: "string",
          enum: ["hipertrofia", "emagrecimento", "condicionamento", "performance"],
          description: "Objetivo físico do usuário",
        },
        restricoesAlimentares: {
          type: "array",
          items: { type: "string" },
          description: "Lista de restrições alimentares",
        },
        nivelExperiencia: {
          type: "string",
          enum: ["iniciante", "intermediario", "avancado"],
          description: "Nível de experiência em treino",
        },
      },
      required: ["nome", "idade", "peso", "altura", "objetivoFisico", "nivelExperiencia"],
    },
    handler: createUser,
  },
  "users.update": {
    description: "Atualiza dados de um usuário existente",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do usuário (UUID)" },
        nome: { type: "string", description: "Nome do usuário" },
        idade: { type: "number", description: "Idade em anos" },
        peso: { type: "number", description: "Peso em kg" },
        altura: { type: "number", description: "Altura em cm" },
        objetivoFisico: {
          type: "string",
          enum: ["hipertrofia", "emagrecimento", "condicionamento", "performance"],
        },
        restricoesAlimentares: {
          type: "array",
          items: { type: "string" },
        },
        nivelExperiencia: {
          type: "string",
          enum: ["iniciante", "intermediario", "avancado"],
        },
      },
      required: ["id"],
    },
    handler: updateUser,
  },
  "users.delete": {
    description: "Remove um usuário do sistema",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do usuário (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => deleteUser(params.id),
  },
  "users.stats": {
    description: "Obtém estatísticas de treino do usuário",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
      },
      required: ["userId"],
    },
    handler: async (params: { userId: string }) => getUserStats(params.userId),
  },
};

