// ============================================================================
// GYM PLAN MCP - Recurso de Planos Alimentares
// ============================================================================
// Gerenciamento de planos alimentares semanais dos usuários
// ============================================================================

import prisma from "../../db/prisma.js";
import {
  MealPlanCreateSchema,
  MealPlanUpdateSchema,
  DiaSemanaLabels,
  TipoRefeicaoLabels,
  type MCPResponse,
} from "../../types/index.js";
import { validate, isValidUUID } from "../../utils/validators.js";
import { gerarPlanoAlimentarAutomatico } from "../../utils/generators.js";
import { somarMacros, calcularPorcentagemMacros } from "../../utils/macros.js";

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

interface MealPlanMealDetail {
  id: string;
  mealId: string;
  diaSemana: number;
  diaSemanaLabel: string;
  tipoRefeicao: string;
  tipoRefeicaoLabel: string;
  ordem: number;
  meal?: {
    id: string;
    nome: string;
    proteina: number;
    carboidrato: number;
    gordura: number;
    calorias: number;
  };
}

interface MealPlanResponse {
  id: string;
  userId: string;
  nome: string;
  metaCalorica: number;
  metaProteina: number;
  metaCarbo: number;
  metaGordura: number;
  observacoes: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  meals: MealPlanMealDetail[];
  resumo?: {
    totalRefeicoes: number;
    diasPlanificados: number;
    macrosDiarios: {
      proteina: number;
      carboidrato: number;
      gordura: number;
      calorias: number;
    };
    atingimentoMetas: {
      proteina: number;
      carboidrato: number;
      gordura: number;
      calorias: number;
    };
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata a resposta do plano alimentar com detalhes
 */
function formatMealPlanResponse(
  plan: {
    id: string;
    userId: string;
    nome: string;
    metaCalorica: number;
    metaProteina: number;
    metaCarbo: number;
    metaGordura: number;
    observacoes: string | null;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
    meals: Array<{
      id: string;
      mealId: string;
      diaSemana: number;
      tipoRefeicao: string;
      ordem: number;
      meal?: {
        id: string;
        nome: string;
        proteina: number;
        carboidrato: number;
        gordura: number;
        calorias: number;
      };
    }>;
  },
  includeResume = true
): MealPlanResponse {
  const meals: MealPlanMealDetail[] = plan.meals.map((m) => ({
    ...m,
    diaSemanaLabel: DiaSemanaLabels[m.diaSemana],
    tipoRefeicaoLabel: TipoRefeicaoLabels[m.tipoRefeicao] || m.tipoRefeicao,
  }));

  const response: MealPlanResponse = {
    ...plan,
    meals,
  };

  if (includeResume && meals.length > 0) {
    const diasPlanificados = [...new Set(meals.map((m) => m.diaSemana))].length;

    // Calcula macros médios diários
    const mealsComNutri = meals.filter((m) => m.meal);
    const totalMacros = somarMacros(
      mealsComNutri.map((m) => ({
        proteina: m.meal!.proteina,
        carboidrato: m.meal!.carboidrato,
        gordura: m.meal!.gordura,
        calorias: m.meal!.calorias,
      }))
    );

    const macrosDiarios = {
      proteina: diasPlanificados > 0 ? Math.round(totalMacros.proteina / diasPlanificados) : 0,
      carboidrato: diasPlanificados > 0 ? Math.round(totalMacros.carboidrato / diasPlanificados) : 0,
      gordura: diasPlanificados > 0 ? Math.round(totalMacros.gordura / diasPlanificados) : 0,
      calorias: diasPlanificados > 0 ? Math.round(totalMacros.calorias / diasPlanificados) : 0,
    };

    const atingimentoMetas = calcularPorcentagemMacros(macrosDiarios, {
      proteina: plan.metaProteina,
      carboidrato: plan.metaCarbo,
      gordura: plan.metaGordura,
      calorias: plan.metaCalorica,
    });

    response.resumo = {
      totalRefeicoes: meals.length,
      diasPlanificados,
      macrosDiarios,
      atingimentoMetas,
    };
  }

  return response;
}

// ============================================================================
// OPERAÇÕES CRUD
// ============================================================================

/**
 * Busca todos os planos alimentares com filtros opcionais
 */
export async function getMealPlans(params?: {
  userId?: string;
  ativo?: boolean;
}): Promise<MCPResponse<MealPlanResponse[]>> {
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

    const plans = await prisma.mealPlan.findMany({
      where,
      include: {
        meals: {
          include: {
            meal: {
              select: {
                id: true,
                nome: true,
                proteina: true,
                carboidrato: true,
                gordura: true,
                calorias: true,
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
      data: plans.map((p) => formatMealPlanResponse(p)),
      message: `${plans.length} plano(s) encontrado(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar planos alimentares",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca um plano alimentar por ID
 */
export async function getMealPlanById(
  id: string
): Promise<MCPResponse<MealPlanResponse>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    const plan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        meals: {
          include: {
            meal: {
              select: {
                id: true,
                nome: true,
                proteina: true,
                carboidrato: true,
                gordura: true,
                calorias: true,
              },
            },
          },
          orderBy: [{ diaSemana: "asc" }, { ordem: "asc" }],
        },
      },
    });

    if (!plan) {
      return { success: false, error: "Plano alimentar não encontrado" };
    }

    return {
      success: true,
      data: formatMealPlanResponse(plan),
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar plano alimentar",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca as refeições do dia para um usuário
 */
export async function getTodayMeals(
  userId: string
): Promise<MCPResponse<MealPlanMealDetail[]>> {
  try {
    if (!isValidUUID(userId)) {
      return { success: false, error: "userId inválido" };
    }

    const hoje = new Date().getDay(); // 0 = domingo

    const planoAtivo = await prisma.mealPlan.findFirst({
      where: { userId, ativo: true },
      include: {
        meals: {
          where: { diaSemana: hoje },
          include: {
            meal: {
              select: {
                id: true,
                nome: true,
                proteina: true,
                carboidrato: true,
                gordura: true,
                calorias: true,
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
        error: "Nenhum plano alimentar ativo encontrado",
      };
    }

    const meals: MealPlanMealDetail[] = planoAtivo.meals.map((m) => ({
      ...m,
      diaSemanaLabel: DiaSemanaLabels[m.diaSemana],
      tipoRefeicaoLabel: TipoRefeicaoLabels[m.tipoRefeicao] || m.tipoRefeicao,
    }));

    // Calcula totais do dia
    const totalCalorias = meals.reduce(
      (sum, m) => sum + (m.meal?.calorias || 0),
      0
    );

    return {
      success: true,
      data: meals,
      message: `${meals.length} refeição(ões) para ${DiaSemanaLabels[hoje]} - Total: ${totalCalorias} kcal`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar refeições do dia",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Cria um novo plano alimentar
 */
export async function createMealPlan(
  data: unknown
): Promise<MCPResponse<MealPlanResponse>> {
  try {
    const validation = validate(MealPlanCreateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const {
      userId,
      nome,
      metaCalorica,
      metaProteina,
      metaCarbo,
      metaGordura,
      observacoes,
      meals,
    } = validation.data;

    // Verifica se usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Desativa planos anteriores do usuário
    await prisma.mealPlan.updateMany({
      where: { userId, ativo: true },
      data: { ativo: false },
    });

    // Cria o novo plano
    const plan = await prisma.mealPlan.create({
      data: {
        userId,
        nome,
        metaCalorica,
        metaProteina,
        metaCarbo,
        metaGordura,
        observacoes: observacoes || null,
        meals: {
          create: (meals || []).map((m) => ({
            mealId: m.mealId,
            diaSemana: m.diaSemana,
            tipoRefeicao: m.tipoRefeicao,
            ordem: m.ordem,
          })),
        },
      },
      include: {
        meals: {
          include: {
            meal: {
              select: {
                id: true,
                nome: true,
                proteina: true,
                carboidrato: true,
                gordura: true,
                calorias: true,
              },
            },
          },
          orderBy: [{ diaSemana: "asc" }, { ordem: "asc" }],
        },
      },
    });

    return {
      success: true,
      data: formatMealPlanResponse(plan),
      message: "Plano alimentar criado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao criar plano alimentar",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Gera um plano alimentar automático
 */
export async function generateMealPlan(params: {
  userId: string;
  refeicoesporDia?: number;
}): Promise<MCPResponse<MealPlanResponse>> {
  try {
    if (!isValidUUID(params.userId)) {
      return { success: false, error: "userId inválido" };
    }

    // Gera o plano
    const planoGerado = await gerarPlanoAlimentarAutomatico(
      params.userId,
      params.refeicoesporDia || 5
    );

    // Cria o plano no banco
    const result = await createMealPlan({
      userId: params.userId,
      ...planoGerado,
    });

    if (result.success) {
      result.message = "Plano alimentar gerado automaticamente com sucesso";
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: "Erro ao gerar plano alimentar",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Atualiza um plano alimentar existente
 */
export async function updateMealPlan(
  data: unknown
): Promise<MCPResponse<MealPlanResponse>> {
  try {
    const validation = validate(MealPlanUpdateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const {
      id,
      nome,
      metaCalorica,
      metaProteina,
      metaCarbo,
      metaGordura,
      observacoes,
      meals,
      ativo,
    } = validation.data;

    // Verifica se plano existe
    const existing = await prisma.mealPlan.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Plano alimentar não encontrado" };
    }

    // Se está ativando este plano, desativa os outros
    if (ativo === true) {
      await prisma.mealPlan.updateMany({
        where: { userId: existing.userId, ativo: true, NOT: { id } },
        data: { ativo: false },
      });
    }

    // Atualiza o plano
    const updateData: Record<string, unknown> = {};
    if (nome !== undefined) updateData.nome = nome;
    if (metaCalorica !== undefined) updateData.metaCalorica = metaCalorica;
    if (metaProteina !== undefined) updateData.metaProteina = metaProteina;
    if (metaCarbo !== undefined) updateData.metaCarbo = metaCarbo;
    if (metaGordura !== undefined) updateData.metaGordura = metaGordura;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (ativo !== undefined) updateData.ativo = ativo;

    // Se meals foi fornecido, recria todos
    if (meals !== undefined) {
      // Remove refeições existentes
      await prisma.mealPlanMeal.deleteMany({
        where: { mealPlanId: id },
      });

      // Cria novas
      await prisma.mealPlanMeal.createMany({
        data: meals.map((m) => ({
          mealPlanId: id,
          mealId: m.mealId,
          diaSemana: m.diaSemana,
          tipoRefeicao: m.tipoRefeicao,
          ordem: m.ordem,
        })),
      });
    }

    const plan = await prisma.mealPlan.update({
      where: { id },
      data: updateData,
      include: {
        meals: {
          include: {
            meal: {
              select: {
                id: true,
                nome: true,
                proteina: true,
                carboidrato: true,
                gordura: true,
                calorias: true,
              },
            },
          },
          orderBy: [{ diaSemana: "asc" }, { ordem: "asc" }],
        },
      },
    });

    return {
      success: true,
      data: formatMealPlanResponse(plan),
      message: "Plano alimentar atualizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao atualizar plano alimentar",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Remove um plano alimentar
 */
export async function deleteMealPlan(
  id: string
): Promise<MCPResponse<{ id: string }>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    // Verifica se plano existe
    const existing = await prisma.mealPlan.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Plano alimentar não encontrado" };
    }

    await prisma.mealPlan.delete({ where: { id } });

    return {
      success: true,
      data: { id },
      message: "Plano alimentar removido com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao remover plano alimentar",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Adiciona uma refeição ao plano
 */
export async function addMealToPlan(
  planId: string,
  mealData: {
    mealId: string;
    diaSemana: number;
    tipoRefeicao: string;
    ordem: number;
  }
): Promise<MCPResponse<MealPlanResponse>> {
  try {
    if (!isValidUUID(planId) || !isValidUUID(mealData.mealId)) {
      return { success: false, error: "ID inválido" };
    }

    // Verifica se plano existe
    const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return { success: false, error: "Plano alimentar não encontrado" };
    }

    // Verifica se refeição existe
    const meal = await prisma.meal.findUnique({ where: { id: mealData.mealId } });
    if (!meal) {
      return { success: false, error: "Refeição não encontrada" };
    }

    // Adiciona a refeição
    await prisma.mealPlanMeal.create({
      data: {
        mealPlanId: planId,
        mealId: mealData.mealId,
        diaSemana: mealData.diaSemana,
        tipoRefeicao: mealData.tipoRefeicao,
        ordem: mealData.ordem,
      },
    });

    // Retorna plano atualizado
    return getMealPlanById(planId);
  } catch (error) {
    return {
      success: false,
      error: "Erro ao adicionar refeição ao plano",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Remove uma refeição do plano
 */
export async function removeMealFromPlan(
  mealPlanMealId: string
): Promise<MCPResponse<{ id: string }>> {
  try {
    if (!isValidUUID(mealPlanMealId)) {
      return { success: false, error: "ID inválido" };
    }

    // Verifica se existe
    const existing = await prisma.mealPlanMeal.findUnique({
      where: { id: mealPlanMealId },
    });
    if (!existing) {
      return { success: false, error: "Refeição não encontrada no plano" };
    }

    await prisma.mealPlanMeal.delete({ where: { id: mealPlanMealId } });

    return {
      success: true,
      data: { id: mealPlanMealId },
      message: "Refeição removida do plano com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao remover refeição do plano",
      details: error instanceof Error ? error.message : error,
    };
  }
}

// ============================================================================
// EXPORTAÇÃO DAS FERRAMENTAS MCP
// ============================================================================

export const mealPlanTools = {
  "mealPlans.list": {
    description: "Lista todos os planos alimentares",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "Filtrar por usuário (UUID)" },
        ativo: { type: "boolean", description: "Filtrar por status ativo" },
      },
    },
    handler: getMealPlans,
  },
  "mealPlans.get": {
    description: "Busca um plano alimentar pelo ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do plano (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => getMealPlanById(params.id),
  },
  "mealPlans.today": {
    description: "Busca as refeições do dia atual para um usuário",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
      },
      required: ["userId"],
    },
    handler: async (params: { userId: string }) => getTodayMeals(params.userId),
  },
  "mealPlans.create": {
    description: "Cria um novo plano alimentar",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
        nome: { type: "string", description: "Nome do plano" },
        metaCalorica: { type: "number", description: "Meta de calorias diárias" },
        metaProteina: { type: "number", description: "Meta de proteína em g" },
        metaCarbo: { type: "number", description: "Meta de carboidrato em g" },
        metaGordura: { type: "number", description: "Meta de gordura em g" },
        observacoes: { type: "string", description: "Observações" },
        meals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mealId: { type: "string" },
              diaSemana: { type: "number", minimum: 0, maximum: 6 },
              tipoRefeicao: {
                type: "string",
                enum: ["cafe", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"],
              },
              ordem: { type: "number", minimum: 1 },
            },
            required: ["mealId", "diaSemana", "tipoRefeicao", "ordem"],
          },
          description: "Lista de refeições do plano",
        },
      },
      required: ["userId", "nome", "metaCalorica", "metaProteina", "metaCarbo", "metaGordura"],
    },
    handler: createMealPlan,
  },
  "mealPlans.generate": {
    description: "Gera automaticamente um plano alimentar baseado no perfil do usuário",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "ID do usuário (UUID)" },
        refeicoesporDia: {
          type: "number",
          minimum: 3,
          maximum: 6,
          description: "Número de refeições por dia",
        },
      },
      required: ["userId"],
    },
    handler: generateMealPlan,
  },
  "mealPlans.update": {
    description: "Atualiza um plano alimentar existente",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do plano (UUID)" },
        nome: { type: "string" },
        metaCalorica: { type: "number" },
        metaProteina: { type: "number" },
        metaCarbo: { type: "number" },
        metaGordura: { type: "number" },
        observacoes: { type: "string" },
        ativo: { type: "boolean" },
        meals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mealId: { type: "string" },
              diaSemana: { type: "number" },
              tipoRefeicao: { type: "string" },
              ordem: { type: "number" },
            },
          },
          description: "Lista de refeições (substitui todas)",
        },
      },
      required: ["id"],
    },
    handler: updateMealPlan,
  },
  "mealPlans.delete": {
    description: "Remove um plano alimentar",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do plano (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => deleteMealPlan(params.id),
  },
  "mealPlans.addMeal": {
    description: "Adiciona uma refeição ao plano alimentar",
    inputSchema: {
      type: "object",
      properties: {
        planId: { type: "string", description: "ID do plano (UUID)" },
        mealId: { type: "string", description: "ID da refeição (UUID)" },
        diaSemana: { type: "number", minimum: 0, maximum: 6 },
        tipoRefeicao: {
          type: "string",
          enum: ["cafe", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"],
        },
        ordem: { type: "number", minimum: 1 },
      },
      required: ["planId", "mealId", "diaSemana", "tipoRefeicao", "ordem"],
    },
    handler: async (params: {
      planId: string;
      mealId: string;
      diaSemana: number;
      tipoRefeicao: string;
      ordem: number;
    }) =>
      addMealToPlan(params.planId, {
        mealId: params.mealId,
        diaSemana: params.diaSemana,
        tipoRefeicao: params.tipoRefeicao,
        ordem: params.ordem,
      }),
  },
  "mealPlans.removeMeal": {
    description: "Remove uma refeição do plano alimentar",
    inputSchema: {
      type: "object",
      properties: {
        mealPlanMealId: {
          type: "string",
          description: "ID da refeição no plano (UUID)",
        },
      },
      required: ["mealPlanMealId"],
    },
    handler: async (params: { mealPlanMealId: string }) =>
      removeMealFromPlan(params.mealPlanMealId),
  },
};

