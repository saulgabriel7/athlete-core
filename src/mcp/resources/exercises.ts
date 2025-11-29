// ============================================================================
// GYM PLAN MCP - Recurso de Exercícios
// ============================================================================
// Gerenciamento do catálogo de exercícios do sistema
// ============================================================================

import prisma from "../../db/prisma.js";
import {
  ExerciseCreateSchema,
  ExerciseUpdateSchema,
  type MCPResponse,
} from "../../types/index.js";
import { validate, isValidUUID } from "../../utils/validators.js";

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

interface ExerciseResponse {
  id: string;
  nome: string;
  grupoMuscular: string;
  equipamentoNecessario: string | null;
  videoUrl: string | null;
  instrucoesDetalhadas: string;
  nivelRecomendado: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// OPERAÇÕES CRUD
// ============================================================================

/**
 * Busca todos os exercícios com filtros opcionais
 */
export async function getExercises(params?: {
  search?: string;
  grupoMuscular?: string;
  nivel?: string;
  equipamento?: string;
}): Promise<MCPResponse<ExerciseResponse[]>> {
  try {
    const where: Record<string, unknown> = {};

    if (params?.search) {
      where.nome = { contains: params.search };
    }
    if (params?.grupoMuscular) {
      where.grupoMuscular = params.grupoMuscular;
    }
    if (params?.nivel) {
      where.nivelRecomendado = params.nivel;
    }
    if (params?.equipamento) {
      where.equipamentoNecessario = params.equipamento;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [{ grupoMuscular: "asc" }, { nome: "asc" }],
    });

    return {
      success: true,
      data: exercises,
      message: `${exercises.length} exercício(s) encontrado(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar exercícios",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca um exercício por ID
 */
export async function getExerciseById(
  id: string
): Promise<MCPResponse<ExerciseResponse>> {
  try {
    if (!isValidUUID(id)) {
      return {
        success: false,
        error: "ID inválido",
      };
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return {
        success: false,
        error: "Exercício não encontrado",
      };
    }

    return {
      success: true,
      data: exercise,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar exercício",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca exercícios por grupo muscular
 */
export async function getExercisesByMuscleGroup(
  grupoMuscular: string
): Promise<MCPResponse<ExerciseResponse[]>> {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { grupoMuscular },
      orderBy: { nome: "asc" },
    });

    return {
      success: true,
      data: exercises,
      message: `${exercises.length} exercício(s) encontrado(s) para ${grupoMuscular}`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar exercícios por grupo muscular",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Cria um novo exercício
 */
export async function createExercise(
  data: unknown
): Promise<MCPResponse<ExerciseResponse>> {
  try {
    const validation = validate(ExerciseCreateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const exerciseData = validation.data;

    const exercise = await prisma.exercise.create({
      data: {
        nome: exerciseData.nome,
        grupoMuscular: exerciseData.grupoMuscular,
        equipamentoNecessario: exerciseData.equipamentoNecessario || null,
        videoUrl: exerciseData.videoUrl || null,
        instrucoesDetalhadas: exerciseData.instrucoesDetalhadas,
        nivelRecomendado: exerciseData.nivelRecomendado,
      },
    });

    return {
      success: true,
      data: exercise,
      message: "Exercício criado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao criar exercício",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Atualiza um exercício existente
 */
export async function updateExercise(
  data: unknown
): Promise<MCPResponse<ExerciseResponse>> {
  try {
    const validation = validate(ExerciseUpdateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const { id, ...updateData } = validation.data;

    // Verifica se exercício existe
    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) {
      return {
        success: false,
        error: "Exercício não encontrado",
      };
    }

    // Prepara dados para atualização
    const prismaData: Record<string, unknown> = {};
    if (updateData.nome !== undefined) prismaData.nome = updateData.nome;
    if (updateData.grupoMuscular !== undefined)
      prismaData.grupoMuscular = updateData.grupoMuscular;
    if (updateData.equipamentoNecessario !== undefined)
      prismaData.equipamentoNecessario = updateData.equipamentoNecessario;
    if (updateData.videoUrl !== undefined)
      prismaData.videoUrl = updateData.videoUrl;
    if (updateData.instrucoesDetalhadas !== undefined)
      prismaData.instrucoesDetalhadas = updateData.instrucoesDetalhadas;
    if (updateData.nivelRecomendado !== undefined)
      prismaData.nivelRecomendado = updateData.nivelRecomendado;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: prismaData,
    });

    return {
      success: true,
      data: exercise,
      message: "Exercício atualizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao atualizar exercício",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Remove um exercício
 */
export async function deleteExercise(
  id: string
): Promise<MCPResponse<{ id: string }>> {
  try {
    if (!isValidUUID(id)) {
      return {
        success: false,
        error: "ID inválido",
      };
    }

    // Verifica se exercício existe
    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) {
      return {
        success: false,
        error: "Exercício não encontrado",
      };
    }

    // Verifica se está sendo usado em planos de treino
    const usageCount = await prisma.workoutPlanExercise.count({
      where: { exerciseId: id },
    });

    if (usageCount > 0) {
      return {
        success: false,
        error: `Exercício está sendo usado em ${usageCount} plano(s) de treino`,
      };
    }

    await prisma.exercise.delete({ where: { id } });

    return {
      success: true,
      data: { id },
      message: "Exercício removido com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao remover exercício",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Lista todos os grupos musculares disponíveis
 */
export async function getMuscleGroups(): Promise<
  MCPResponse<{ grupo: string; count: number }[]>
> {
  try {
    const exercises = await prisma.exercise.findMany({
      select: { grupoMuscular: true },
    });

    const grupos = exercises.reduce((acc, ex) => {
      acc[ex.grupoMuscular] = (acc[ex.grupoMuscular] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(grupos)
      .map(([grupo, count]) => ({ grupo, count }))
      .sort((a, b) => a.grupo.localeCompare(b.grupo));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar grupos musculares",
      details: error instanceof Error ? error.message : error,
    };
  }
}

// ============================================================================
// EXPORTAÇÃO DAS FERRAMENTAS MCP
// ============================================================================

export const exerciseTools = {
  "exercises.list": {
    description: "Lista todos os exercícios disponíveis com filtros opcionais",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Busca por nome" },
        grupoMuscular: {
          type: "string",
          enum: [
            "peito",
            "costas",
            "ombros",
            "biceps",
            "triceps",
            "pernas",
            "gluteos",
            "abdomen",
            "cardio",
            "corpo_inteiro",
          ],
          description: "Filtrar por grupo muscular",
        },
        nivel: {
          type: "string",
          enum: ["iniciante", "intermediario", "avancado"],
          description: "Filtrar por nível recomendado",
        },
        equipamento: {
          type: "string",
          enum: [
            "barra",
            "halteres",
            "maquina",
            "cabo",
            "corpo_livre",
            "kettlebell",
            "elastico",
            "bola",
            "banco",
            "nenhum",
          ],
          description: "Filtrar por equipamento necessário",
        },
      },
    },
    handler: getExercises,
  },
  "exercises.get": {
    description: "Busca um exercício pelo ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do exercício (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => getExerciseById(params.id),
  },
  "exercises.byMuscleGroup": {
    description: "Busca exercícios por grupo muscular",
    inputSchema: {
      type: "object",
      properties: {
        grupoMuscular: {
          type: "string",
          enum: [
            "peito",
            "costas",
            "ombros",
            "biceps",
            "triceps",
            "pernas",
            "gluteos",
            "abdomen",
            "cardio",
            "corpo_inteiro",
          ],
          description: "Grupo muscular",
        },
      },
      required: ["grupoMuscular"],
    },
    handler: async (params: { grupoMuscular: string }) =>
      getExercisesByMuscleGroup(params.grupoMuscular),
  },
  "exercises.create": {
    description: "Cria um novo exercício no catálogo",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome do exercício" },
        grupoMuscular: {
          type: "string",
          enum: [
            "peito",
            "costas",
            "ombros",
            "biceps",
            "triceps",
            "pernas",
            "gluteos",
            "abdomen",
            "cardio",
            "corpo_inteiro",
          ],
          description: "Grupo muscular principal",
        },
        equipamentoNecessario: {
          type: "string",
          enum: [
            "barra",
            "halteres",
            "maquina",
            "cabo",
            "corpo_livre",
            "kettlebell",
            "elastico",
            "bola",
            "banco",
            "nenhum",
          ],
          description: "Equipamento necessário",
        },
        videoUrl: {
          type: "string",
          description: "URL de vídeo demonstrativo",
        },
        instrucoesDetalhadas: {
          type: "string",
          description: "Instruções de execução do exercício",
        },
        nivelRecomendado: {
          type: "string",
          enum: ["iniciante", "intermediario", "avancado"],
          description: "Nível recomendado",
        },
      },
      required: ["nome", "grupoMuscular", "instrucoesDetalhadas", "nivelRecomendado"],
    },
    handler: createExercise,
  },
  "exercises.update": {
    description: "Atualiza um exercício existente",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do exercício (UUID)" },
        nome: { type: "string", description: "Nome do exercício" },
        grupoMuscular: {
          type: "string",
          enum: [
            "peito",
            "costas",
            "ombros",
            "biceps",
            "triceps",
            "pernas",
            "gluteos",
            "abdomen",
            "cardio",
            "corpo_inteiro",
          ],
        },
        equipamentoNecessario: {
          type: "string",
          enum: [
            "barra",
            "halteres",
            "maquina",
            "cabo",
            "corpo_livre",
            "kettlebell",
            "elastico",
            "bola",
            "banco",
            "nenhum",
          ],
        },
        videoUrl: { type: "string" },
        instrucoesDetalhadas: { type: "string" },
        nivelRecomendado: {
          type: "string",
          enum: ["iniciante", "intermediario", "avancado"],
        },
      },
      required: ["id"],
    },
    handler: updateExercise,
  },
  "exercises.delete": {
    description: "Remove um exercício do catálogo",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do exercício (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => deleteExercise(params.id),
  },
  "exercises.muscleGroups": {
    description: "Lista todos os grupos musculares e quantidade de exercícios",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: getMuscleGroups,
  },
};

