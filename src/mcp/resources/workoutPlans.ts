// ============================================================================
// GYM PLAN MCP - Recurso de Planos de Treino
// ============================================================================
// Gerenciamento de planos de treino semanais dos usuários
// ============================================================================

import prisma from "../../db/prisma.js";
import {
  WorkoutPlanCreateSchema,
  WorkoutPlanUpdateSchema,
  DiaSemanaLabels,
  type MCPResponse,
} from "../../types/index.js";
import { validate, isValidUUID } from "../../utils/validators.js";
import { gerarPlanoTreinoAutomatico } from "../../utils/generators.js";

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

interface WorkoutPlanExerciseDetail {
  id: string;
  exerciseId: string;
  diaSemana: number;
  diaSemanaLabel: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes: string | null;
  exercise?: {
    id: string;
    nome: string;
    grupoMuscular: string;
  };
}

interface WorkoutPlanResponse {
  id: string;
  userId: string;
  nome: string;
  observacoes: string | null;
  versao: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  exercises: WorkoutPlanExerciseDetail[];
  resumo?: {
    totalExercicios: number;
    diasDeTreino: number[];
    gruposMusculares: string[];
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata a resposta do plano de treino com detalhes
 */
function formatWorkoutPlanResponse(
  plan: {
    id: string;
    userId: string;
    nome: string;
    observacoes: string | null;
    versao: number;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
    exercises: Array<{
      id: string;
      exerciseId: string;
      diaSemana: number;
      ordem: number;
      series: number;
      repeticoes: string;
      descanso: number;
      observacoes: string | null;
      exercise?: {
        id: string;
        nome: string;
        grupoMuscular: string;
      };
    }>;
  },
  includeResume = true
): WorkoutPlanResponse {
  const exercises: WorkoutPlanExerciseDetail[] = plan.exercises.map((ex) => ({
    ...ex,
    diaSemanaLabel: DiaSemanaLabels[ex.diaSemana],
  }));

  const response: WorkoutPlanResponse = {
    ...plan,
    exercises,
  };

  if (includeResume) {
    const diasDeTreino = [...new Set(exercises.map((e) => e.diaSemana))].sort();
    const gruposMusculares = [
      ...new Set(
        exercises.filter((e) => e.exercise).map((e) => e.exercise!.grupoMuscular)
      ),
    ];

    response.resumo = {
      totalExercicios: exercises.length,
      diasDeTreino,
      gruposMusculares,
    };
  }

  return response;
}

// ============================================================================
// OPERAÇÕES CRUD
// ============================================================================

/**
 * Busca todos os planos de treino com filtros opcionais
 */
export async function getWorkoutPlans(params?: {
  userId?: string;
  ativo?: boolean;
}): Promise<MCPResponse<WorkoutPlanResponse[]>> {
  try {
    const where: Record<string, unknown> = {};

    if (params?.userId) {
      if (!isValidUUID(params.userId)) {
        return { success: false, error: "userId inválido" };
      }
      where.userId = params.userId;
    }
    if (params?.ativo !== undefined) {
      where.ativo = params.ativo;
    }

    const plans = await prisma.workoutPlan.findMany({
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
          orderBy: [{ diaSemana: "asc" }, { ordem: "asc" }],
        },
      },
      orderBy: [{ ativo: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      data: plans.map((p) => formatWorkoutPlanResponse(p)),
      message: `${plans.length} plano(s) encontrado(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar planos de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca um plano de treino por ID
 */
export async function getWorkoutPlanById(
  id: string
): Promise<MCPResponse<WorkoutPlanResponse>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    const plan = await prisma.workoutPlan.findUnique({
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
          orderBy: [{ diaSemana: "asc" }, { ordem: "asc" }],
        },
      },
    });

    if (!plan) {
      return { success: false, error: "Plano de treino não encontrado" };
    }

    return {
      success: true,
      data: formatWorkoutPlanResponse(plan),
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar plano de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca o treino do dia para um usuário
 */
export async function getTodayWorkout(
  userId: string
): Promise<MCPResponse<WorkoutPlanExerciseDetail[]>> {
  try {
    if (!isValidUUID(userId)) {
      return { success: false, error: "userId inválido" };
    }

    const hoje = new Date().getDay(); // 0 = domingo

    const planoAtivo = await prisma.workoutPlan.findFirst({
      where: { userId, ativo: true },
      include: {
        exercises: {
          where: { diaSemana: hoje },
          include: {
            exercise: {
              select: {
                id: true,
                nome: true,
                grupoMuscular: true,
              },
            },
          },
          orderBy: { ordem: "asc" },
        },
      },
    });

    if (!planoAtivo) {
      return {
        success: false,
        error: "Nenhum plano de treino ativo encontrado",
      };
    }

    if (planoAtivo.exercises.length === 0) {
      return {
        success: true,
        data: [],
        message: `Hoje é dia de descanso! (${DiaSemanaLabels[hoje]})`,
      };
    }

    const exercises: WorkoutPlanExerciseDetail[] = planoAtivo.exercises.map(
      (ex) => ({
        ...ex,
        diaSemanaLabel: DiaSemanaLabels[ex.diaSemana],
      })
    );

    return {
      success: true,
      data: exercises,
      message: `Treino de ${DiaSemanaLabels[hoje]} - ${exercises.length} exercício(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar treino do dia",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Cria um novo plano de treino
 */
export async function createWorkoutPlan(
  data: unknown
): Promise<MCPResponse<WorkoutPlanResponse>> {
  try {
    const validation = validate(WorkoutPlanCreateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const { userId, nome, observacoes, exercises } = validation.data;

    // Verifica se usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Desativa planos anteriores do usuário
    await prisma.workoutPlan.updateMany({
      where: { userId, ativo: true },
      data: { ativo: false },
    });

    // Cria o novo plano
    const plan = await prisma.workoutPlan.create({
      data: {
        userId,
        nome,
        observacoes: observacoes || null,
        exercises: {
          create: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            diaSemana: ex.diaSemana,
            ordem: ex.ordem,
            series: ex.series,
            repeticoes: ex.repeticoes,
            descanso: ex.descanso,
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
          orderBy: [{ diaSemana: "asc" }, { ordem: "asc" }],
        },
      },
    });

    return {
      success: true,
      data: formatWorkoutPlanResponse(plan),
      message: "Plano de treino criado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao criar plano de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Gera um plano de treino automático
 */
export async function generateWorkoutPlan(params: {
  userId: string;
  diasPorSemana?: number;
}): Promise<MCPResponse<WorkoutPlanResponse>> {
  try {
    if (!isValidUUID(params.userId)) {
      return { success: false, error: "userId inválido" };
    }

    // Gera o plano
    const planoGerado = await gerarPlanoTreinoAutomatico(
      params.userId,
      params.diasPorSemana || 4
    );

    // Cria o plano no banco
    const result = await createWorkoutPlan({
      userId: params.userId,
      nome: planoGerado.nome,
      observacoes: planoGerado.observacoes,
      exercises: planoGerado.exercises,
    });

    if (result.success) {
      result.message = "Plano de treino gerado automaticamente com sucesso";
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: "Erro ao gerar plano de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Atualiza um plano de treino existente
 */
export async function updateWorkoutPlan(
  data: unknown
): Promise<MCPResponse<WorkoutPlanResponse>> {
  try {
    const validation = validate(WorkoutPlanUpdateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const { id, nome, observacoes, exercises, ativo } = validation.data;

    // Verifica se plano existe
    const existing = await prisma.workoutPlan.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Plano de treino não encontrado" };
    }

    // Se está ativando este plano, desativa os outros
    if (ativo === true) {
      await prisma.workoutPlan.updateMany({
        where: { userId: existing.userId, ativo: true, NOT: { id } },
        data: { ativo: false },
      });
    }

    // Atualiza o plano
    const updateData: Record<string, unknown> = {
      versao: existing.versao + 1,
    };
    if (nome !== undefined) updateData.nome = nome;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (ativo !== undefined) updateData.ativo = ativo;

    // Se exercises foi fornecido, recria todos
    if (exercises !== undefined) {
      // Remove exercícios existentes
      await prisma.workoutPlanExercise.deleteMany({
        where: { workoutPlanId: id },
      });

      // Cria novos
      await prisma.workoutPlanExercise.createMany({
        data: exercises.map((ex) => ({
          workoutPlanId: id,
          exerciseId: ex.exerciseId,
          diaSemana: ex.diaSemana,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          descanso: ex.descanso,
          observacoes: ex.observacoes || null,
        })),
      });
    }

    const plan = await prisma.workoutPlan.update({
      where: { id },
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
          orderBy: [{ diaSemana: "asc" }, { ordem: "asc" }],
        },
      },
    });

    return {
      success: true,
      data: formatWorkoutPlanResponse(plan),
      message: "Plano de treino atualizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao atualizar plano de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Remove um plano de treino
 */
export async function deleteWorkoutPlan(
  id: string
): Promise<MCPResponse<{ id: string }>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    // Verifica se plano existe
    const existing = await prisma.workoutPlan.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Plano de treino não encontrado" };
    }

    await prisma.workoutPlan.delete({ where: { id } });

    return {
      success: true,
      data: { id },
      message: "Plano de treino removido com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao remover plano de treino",
      details: error instanceof Error ? error.message : error,
    };
  }
}

// ============================================================================
// EXPORTAÇÃO DAS FERRAMENTAS MCP
// ============================================================================

export const workoutPlanTools = {
  "workoutPlans.list": {
    description: "Lista todos os planos de treino",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "Filtrar por usuário (UUID)" },
        ativo: { type: "boolean", description: "Filtrar por status ativo" },
      },
    },
    handler: getWorkoutPlans,
  },
  "workoutPlans.get": {
    description: "Busca um plano de treino pelo ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do plano (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => getWorkoutPlanById(params.id),
  },
  "workoutPlans.today": {
    description: "Busca o treino do dia atual para um usuário",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
      },
      required: ["userId"],
    },
    handler: async (params: { userId: string }) => getTodayWorkout(params.userId),
  },
  "workoutPlans.create": {
    description: "Cria um novo plano de treino",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
        nome: { type: "string", description: "Nome do plano" },
        observacoes: { type: "string", description: "Observações" },
        exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              exerciseId: { type: "string" },
              diaSemana: { type: "number", minimum: 0, maximum: 6 },
              ordem: { type: "number", minimum: 1 },
              series: { type: "number", minimum: 1 },
              repeticoes: { type: "string" },
              descanso: { type: "number", minimum: 0 },
              observacoes: { type: "string" },
            },
            required: ["exerciseId", "diaSemana", "ordem", "series", "repeticoes", "descanso"],
          },
          description: "Lista de exercícios do plano",
        },
      },
      required: ["userId", "nome", "exercises"],
    },
    handler: createWorkoutPlan,
  },
  "workoutPlans.generate": {
    description: "Gera automaticamente um plano de treino baseado no perfil do usuário",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
        diasPorSemana: {
          type: "number",
          minimum: 3,
          maximum: 5,
          description: "Número de dias de treino por semana",
        },
      },
      required: ["userId"],
    },
    handler: generateWorkoutPlan,
  },
  "workoutPlans.update": {
    description: "Atualiza um plano de treino existente",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do plano (UUID)" },
        nome: { type: "string", description: "Nome do plano" },
        observacoes: { type: "string", description: "Observações" },
        ativo: { type: "boolean", description: "Status ativo" },
        exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              exerciseId: { type: "string" },
              diaSemana: { type: "number" },
              ordem: { type: "number" },
              series: { type: "number" },
              repeticoes: { type: "string" },
              descanso: { type: "number" },
              observacoes: { type: "string" },
            },
          },
          description: "Lista de exercícios (substitui todos)",
        },
      },
      required: ["id"],
    },
    handler: updateWorkoutPlan,
  },
  "workoutPlans.delete": {
    description: "Remove um plano de treino",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do plano (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => deleteWorkoutPlan(params.id),
  },
};

