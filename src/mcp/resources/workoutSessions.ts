// ============================================================================
// GYM PLAN MCP - Recurso de Sessões de Treino
// ============================================================================
// Gerenciamento de sessões de treino executadas pelos usuários
// ============================================================================

import prisma from "../../db/prisma.js";
import {
  WorkoutSessionCreateSchema,
  type MCPResponse,
} from "../../types/index.js";
import { validate, isValidUUID, arrayToJSON, jsonToArray } from "../../utils/validators.js";
import { calcularPerformanceScore, gerarRecomendacoes } from "../../utils/generators.js";

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

interface SessionExerciseDetail {
  id: string;
  exerciseId: string;
  seriesExecutadas: number;
  repeticoes: number[];
  carga: number[];
  observacoes: string | null;
  exercise?: {
    id: string;
    nome: string;
    grupoMuscular: string;
  };
  volumeTotal?: number; // séries * reps médias * carga média
}

interface WorkoutSessionResponse {
  id: string;
  userId: string;
  data: Date;
  duracao: number | null;
  comentarios: string | null;
  performanceScore: number | null;
  createdAt: Date;
  updatedAt: Date;
  exercises: SessionExerciseDetail[];
  resumo?: {
    totalExercicios: number;
    totalSeries: number;
    totalRepeticoes: number;
    volumeTotal: number;
    gruposTrabalhos: string[];
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata a resposta da sessão de treino com detalhes
 */
function formatSessionResponse(
  session: {
    id: string;
    userId: string;
    data: Date;
    duracao: number | null;
    comentarios: string | null;
    performanceScore: number | null;
    createdAt: Date;
    updatedAt: Date;
    exercises: Array<{
      id: string;
      exerciseId: string;
      seriesExecutadas: number;
      repeticoes: string;
      carga: string;
      observacoes: string | null;
      exercise?: {
        id: string;
        nome: string;
        grupoMuscular: string;
      };
    }>;
  },
  includeResume = true
): WorkoutSessionResponse {
  const exercises: SessionExerciseDetail[] = session.exercises.map((ex) => {
    const reps = jsonToArray<number>(ex.repeticoes);
    const carga = jsonToArray<number>(ex.carga);
    const mediaReps = reps.length > 0 ? reps.reduce((a, b) => a + b, 0) / reps.length : 0;
    const mediaCarga = carga.length > 0 ? carga.reduce((a, b) => a + b, 0) / carga.length : 0;

    return {
      id: ex.id,
      exerciseId: ex.exerciseId,
      seriesExecutadas: ex.seriesExecutadas,
      repeticoes: reps,
      carga: carga,
      observacoes: ex.observacoes,
      exercise: ex.exercise,
      volumeTotal: Math.round(ex.seriesExecutadas * mediaReps * mediaCarga),
    };
  });

  const response: WorkoutSessionResponse = {
    ...session,
    exercises,
  };

  if (includeResume) {
    const totalSeries = exercises.reduce((sum, ex) => sum + ex.seriesExecutadas, 0);
    const totalRepeticoes = exercises.reduce(
      (sum, ex) => sum + ex.repeticoes.reduce((a, b) => a + b, 0),
      0
    );
    const volumeTotal = exercises.reduce((sum, ex) => sum + (ex.volumeTotal || 0), 0);
    const gruposTrabalhos = [
      ...new Set(exercises.filter((e) => e.exercise).map((e) => e.exercise!.grupoMuscular)),
    ];

    response.resumo = {
      totalExercicios: exercises.length,
      totalSeries,
      totalRepeticoes,
      volumeTotal,
      gruposTrabalhos,
    };
  }

  return response;
}

// ============================================================================
// OPERAÇÕES CRUD
// ============================================================================

/**
 * Busca todas as sessões de treino com filtros
 */
export async function getWorkoutSessions(params?: {
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<MCPResponse<WorkoutSessionResponse[]>> {
  try {
    const where: Record<string, unknown> = {};

    if (params?.userId) {
      if (!isValidUUID(params.userId)) {
        return { success: false, error: "userId inválido" };
      }
      where.userId = params.userId;
    }

    if (params?.startDate || params?.endDate) {
      where.data = {};
      if (params?.startDate) {
        (where.data as Record<string, unknown>).gte = new Date(params.startDate);
      }
      if (params?.endDate) {
        (where.data as Record<string, unknown>).lte = new Date(params.endDate);
      }
    }

    const sessions = await prisma.workoutSession.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                nome: true,
                grupoMuscular: true,
              },
            },
          },
        },
      },
      orderBy: { data: "desc" },
      take: params?.limit || 50,
    });

    return {
      success: true,
      data: sessions.map((s) => formatSessionResponse(s)),
      message: `${sessions.length} sessão(ões) encontrada(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar sessões de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca uma sessão de treino por ID
 */
export async function getWorkoutSessionById(
  id: string
): Promise<MCPResponse<WorkoutSessionResponse>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                nome: true,
                grupoMuscular: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return { success: false, error: "Sessão de treino não encontrada" };
    }

    return {
      success: true,
      data: formatSessionResponse(session),
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar sessão de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Cria uma nova sessão de treino
 */
export async function createWorkoutSession(
  data: unknown
): Promise<MCPResponse<WorkoutSessionResponse>> {
  try {
    const validation = validate(WorkoutSessionCreateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const { userId, data: sessionDate, duracao, comentarios, exercises } = validation.data;

    // Verifica se usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Calcula performance score
    const performanceScore = await calcularPerformanceScore(
      exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        seriesExecutadas: ex.seriesExecutadas,
        repeticoes: ex.repeticoes,
        carga: ex.carga,
      })),
      duracao,
      userId
    );

    // Cria a sessão
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        data: new Date(sessionDate),
        duracao: duracao || null,
        comentarios: comentarios || null,
        performanceScore,
        exercises: {
          create: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            seriesExecutadas: ex.seriesExecutadas,
            repeticoes: arrayToJSON(ex.repeticoes),
            carga: arrayToJSON(ex.carga),
            observacoes: ex.observacoes || null,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                nome: true,
                grupoMuscular: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: formatSessionResponse(session),
      message: `Sessão de treino registrada! Performance: ${performanceScore}/100`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao criar sessão de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Atualiza uma sessão de treino
 */
export async function updateWorkoutSession(
  data: {
    id: string;
    duracao?: number;
    comentarios?: string;
  }
): Promise<MCPResponse<WorkoutSessionResponse>> {
  try {
    if (!isValidUUID(data.id)) {
      return { success: false, error: "ID inválido" };
    }

    // Verifica se sessão existe
    const existing = await prisma.workoutSession.findUnique({
      where: { id: data.id },
    });
    if (!existing) {
      return { success: false, error: "Sessão de treino não encontrada" };
    }

    const updateData: Record<string, unknown> = {};
    if (data.duracao !== undefined) updateData.duracao = data.duracao;
    if (data.comentarios !== undefined) updateData.comentarios = data.comentarios;

    const session = await prisma.workoutSession.update({
      where: { id: data.id },
      data: updateData,
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                nome: true,
                grupoMuscular: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: formatSessionResponse(session),
      message: "Sessão de treino atualizada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao atualizar sessão de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Remove uma sessão de treino
 */
export async function deleteWorkoutSession(
  id: string
): Promise<MCPResponse<{ id: string }>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    // Verifica se sessão existe
    const existing = await prisma.workoutSession.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Sessão de treino não encontrada" };
    }

    await prisma.workoutSession.delete({ where: { id } });

    return {
      success: true,
      data: { id },
      message: "Sessão de treino removida com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao remover sessão de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Obtém estatísticas de treino do usuário
 */
export async function getSessionStats(
  userId: string,
  period?: "week" | "month" | "year"
): Promise<
  MCPResponse<{
    totalSessoes: number;
    mediaPerformance: number;
    totalVolume: number;
    gruposMaisTreinados: { grupo: string; count: number }[];
    evolucaoPerformance: { data: Date; score: number }[];
  }>
> {
  try {
    if (!isValidUUID(userId)) {
      return { success: false, error: "userId inválido" };
    }

    // Define período
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "month":
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        data: { gte: startDate },
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: { grupoMuscular: true },
            },
          },
        },
      },
      orderBy: { data: "asc" },
    });

    const totalSessoes = sessions.length;

    const performanceScores = sessions
      .filter((s) => s.performanceScore !== null)
      .map((s) => s.performanceScore as number);

    const mediaPerformance =
      performanceScores.length > 0
        ? Math.round(performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length)
        : 0;

    // Calcula volume total
    let totalVolume = 0;
    const gruposCount: Record<string, number> = {};

    for (const session of sessions) {
      for (const ex of session.exercises) {
        const reps = jsonToArray<number>(ex.repeticoes);
        const carga = jsonToArray<number>(ex.carga);
        const mediaReps = reps.length > 0 ? reps.reduce((a, b) => a + b, 0) / reps.length : 0;
        const mediaCarga = carga.length > 0 ? carga.reduce((a, b) => a + b, 0) / carga.length : 0;
        totalVolume += ex.seriesExecutadas * mediaReps * mediaCarga;

        if (ex.exercise) {
          gruposCount[ex.exercise.grupoMuscular] =
            (gruposCount[ex.exercise.grupoMuscular] || 0) + 1;
        }
      }
    }

    const gruposMaisTreinados = Object.entries(gruposCount)
      .map(([grupo, count]) => ({ grupo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const evolucaoPerformance = sessions
      .filter((s) => s.performanceScore !== null)
      .map((s) => ({
        data: s.data,
        score: s.performanceScore as number,
      }));

    return {
      success: true,
      data: {
        totalSessoes,
        mediaPerformance,
        totalVolume: Math.round(totalVolume),
        gruposMaisTreinados,
        evolucaoPerformance,
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

/**
 * Obtém recomendações para o usuário
 */
export async function getRecommendations(
  userId: string
): Promise<MCPResponse<string[]>> {
  try {
    if (!isValidUUID(userId)) {
      return { success: false, error: "userId inválido" };
    }

    const recomendacoes = await gerarRecomendacoes(userId);

    return {
      success: true,
      data: recomendacoes,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao gerar recomendações",
      details: error instanceof Error ? error.message : error,
    };
  }
}

// ============================================================================
// EXPORTAÇÃO DAS FERRAMENTAS MCP
// ============================================================================

export const workoutSessionTools = {
  "workoutSessions.list": {
    description: "Lista sessões de treino com filtros opcionais",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "Filtrar por usuário (UUID)" },
        startDate: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
        endDate: { type: "string", description: "Data final (YYYY-MM-DD)" },
        limit: { type: "number", description: "Limite de resultados" },
      },
    },
    handler: getWorkoutSessions,
  },
  "workoutSessions.get": {
    description: "Busca uma sessão de treino pelo ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da sessão (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => getWorkoutSessionById(params.id),
  },
  "workoutSessions.create": {
    description: "Registra uma nova sessão de treino executada",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
        data: { type: "string", description: "Data e hora da sessão (ISO 8601)" },
        duracao: { type: "number", description: "Duração em minutos" },
        comentarios: { type: "string", description: "Comentários do usuário" },
        exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              exerciseId: { type: "string" },
              seriesExecutadas: { type: "number", minimum: 1 },
              repeticoes: {
                type: "array",
                items: { type: "number" },
                description: "Repetições por série [12, 10, 8]",
              },
              carga: {
                type: "array",
                items: { type: "number" },
                description: "Carga por série em kg [20, 25, 30]",
              },
              observacoes: { type: "string" },
            },
            required: ["exerciseId", "seriesExecutadas", "repeticoes", "carga"],
          },
          description: "Exercícios executados na sessão",
        },
      },
      required: ["userId", "data", "exercises"],
    },
    handler: createWorkoutSession,
  },
  "workoutSessions.update": {
    description: "Atualiza uma sessão de treino existente",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da sessão (UUID)" },
        duracao: { type: "number", description: "Duração em minutos" },
        comentarios: { type: "string", description: "Comentários" },
      },
      required: ["id"],
    },
    handler: updateWorkoutSession,
  },
  "workoutSessions.delete": {
    description: "Remove uma sessão de treino",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da sessão (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => deleteWorkoutSession(params.id),
  },
  "workoutSessions.stats": {
    description: "Obtém estatísticas de treino do usuário",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
        period: {
          type: "string",
          enum: ["week", "month", "year"],
          description: "Período de análise",
        },
      },
      required: ["userId"],
    },
    handler: async (params: { userId: string; period?: "week" | "month" | "year" }) =>
      getSessionStats(params.userId, params.period),
  },
  "workoutSessions.recommendations": {
    description: "Obtém recomendações personalizadas para o usuário",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
      },
      required: ["userId"],
    },
    handler: async (params: { userId: string }) => getRecommendations(params.userId),
  },
};

