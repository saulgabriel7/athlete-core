// ============================================================================
// GYM PLAN MCP - Recurso de Refeições
// ============================================================================
// Gerenciamento do catálogo de refeições e informações nutricionais
// ============================================================================

import prisma from "../../db/prisma.js";
import {
  MealCreateSchema,
  MealUpdateSchema,
  type MCPResponse,
} from "../../types/index.js";
import { validate, isValidUUID, arrayToJSON, jsonToArray } from "../../utils/validators.js";
import { calcularCaloriasDeMacros, somarMacros } from "../../utils/macros.js";

// ============================================================================
// TIPOS DE RESPOSTA
// ============================================================================

interface MealResponse {
  id: string;
  nome: string;
  ingredientes: string[];
  proteina: number;
  carboidrato: number;
  gordura: number;
  calorias: number;
  tags: string[];
  preparo: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Campos calculados
  macrosPorcentagem?: {
    proteina: number;
    carboidrato: number;
    gordura: number;
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata a resposta da refeição com campos calculados
 */
function formatMealResponse(
  meal: {
    id: string;
    nome: string;
    ingredientes: string;
    proteina: number;
    carboidrato: number;
    gordura: number;
    calorias: number;
    tags: string | null;
    preparo: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  includeCalculations = true
): MealResponse {
  const response: MealResponse = {
    ...meal,
    ingredientes: jsonToArray<string>(meal.ingredientes),
    tags: jsonToArray<string>(meal.tags),
  };

  if (includeCalculations && meal.calorias > 0) {
    const totalMacros = meal.proteina * 4 + meal.carboidrato * 4 + meal.gordura * 9;
    if (totalMacros > 0) {
      response.macrosPorcentagem = {
        proteina: Math.round((meal.proteina * 4 / totalMacros) * 100),
        carboidrato: Math.round((meal.carboidrato * 4 / totalMacros) * 100),
        gordura: Math.round((meal.gordura * 9 / totalMacros) * 100),
      };
    }
  }

  return response;
}

// ============================================================================
// OPERAÇÕES CRUD
// ============================================================================

/**
 * Busca todas as refeições com filtros opcionais
 */
export async function getMeals(params?: {
  search?: string;
  tags?: string[];
  maxCalorias?: number;
  minProteina?: number;
}): Promise<MCPResponse<MealResponse[]>> {
  try {
    const where: Record<string, unknown> = {};

    if (params?.search) {
      where.nome = { contains: params.search };
    }
    if (params?.maxCalorias) {
      where.calorias = { lte: params.maxCalorias };
    }
    if (params?.minProteina) {
      where.proteina = { gte: params.minProteina };
    }

    let meals = await prisma.meal.findMany({
      where,
      orderBy: { nome: "asc" },
    });

    // Filtro por tags (feito em memória por limitação do SQLite)
    if (params?.tags && params.tags.length > 0) {
      meals = meals.filter((meal) => {
        const mealTags = jsonToArray<string>(meal.tags);
        return params.tags!.some((tag) => mealTags.includes(tag));
      });
    }

    return {
      success: true,
      data: meals.map((m) => formatMealResponse(m, false)),
      message: `${meals.length} refeição(ões) encontrada(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar refeições",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca uma refeição por ID
 */
export async function getMealById(
  id: string
): Promise<MCPResponse<MealResponse>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    const meal = await prisma.meal.findUnique({
      where: { id },
    });

    if (!meal) {
      return { success: false, error: "Refeição não encontrada" };
    }

    return {
      success: true,
      data: formatMealResponse(meal),
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar refeição",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca refeições por tag
 */
export async function getMealsByTag(
  tag: string
): Promise<MCPResponse<MealResponse[]>> {
  try {
    const meals = await prisma.meal.findMany({
      orderBy: { nome: "asc" },
    });

    const filteredMeals = meals.filter((meal) => {
      const mealTags = jsonToArray<string>(meal.tags);
      return mealTags.includes(tag);
    });

    return {
      success: true,
      data: filteredMeals.map((m) => formatMealResponse(m, false)),
      message: `${filteredMeals.length} refeição(ões) com tag "${tag}"`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar refeições por tag",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Cria uma nova refeição
 */
export async function createMeal(
  data: unknown
): Promise<MCPResponse<MealResponse>> {
  try {
    const validation = validate(MealCreateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const mealData = validation.data;

    // Calcula calorias se não fornecidas
    const calorias =
      mealData.calorias ||
      calcularCaloriasDeMacros(
        mealData.proteina,
        mealData.carboidrato,
        mealData.gordura
      );

    const meal = await prisma.meal.create({
      data: {
        nome: mealData.nome,
        ingredientes: arrayToJSON(mealData.ingredientes),
        proteina: mealData.proteina,
        carboidrato: mealData.carboidrato,
        gordura: mealData.gordura,
        calorias,
        tags: arrayToJSON(mealData.tags || []),
        preparo: mealData.preparo || null,
      },
    });

    return {
      success: true,
      data: formatMealResponse(meal),
      message: "Refeição criada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao criar refeição",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Atualiza uma refeição existente
 */
export async function updateMeal(
  data: unknown
): Promise<MCPResponse<MealResponse>> {
  try {
    const validation = validate(MealUpdateSchema, data);

    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Dados inválidos",
        details: validation.errors,
      };
    }

    const { id, ...updateData } = validation.data;

    // Verifica se refeição existe
    const existing = await prisma.meal.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Refeição não encontrada" };
    }

    // Prepara dados para atualização
    const prismaData: Record<string, unknown> = {};
    if (updateData.nome !== undefined) prismaData.nome = updateData.nome;
    if (updateData.ingredientes !== undefined)
      prismaData.ingredientes = arrayToJSON(updateData.ingredientes);
    if (updateData.proteina !== undefined) prismaData.proteina = updateData.proteina;
    if (updateData.carboidrato !== undefined)
      prismaData.carboidrato = updateData.carboidrato;
    if (updateData.gordura !== undefined) prismaData.gordura = updateData.gordura;
    if (updateData.tags !== undefined) prismaData.tags = arrayToJSON(updateData.tags);
    if (updateData.preparo !== undefined) prismaData.preparo = updateData.preparo;

    // Recalcula calorias se macros foram alterados
    if (
      updateData.proteina !== undefined ||
      updateData.carboidrato !== undefined ||
      updateData.gordura !== undefined
    ) {
      const prot = updateData.proteina ?? existing.proteina;
      const carb = updateData.carboidrato ?? existing.carboidrato;
      const gord = updateData.gordura ?? existing.gordura;
      prismaData.calorias = calcularCaloriasDeMacros(prot, carb, gord);
    }

    const meal = await prisma.meal.update({
      where: { id },
      data: prismaData,
    });

    return {
      success: true,
      data: formatMealResponse(meal),
      message: "Refeição atualizada com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao atualizar refeição",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Remove uma refeição
 */
export async function deleteMeal(
  id: string
): Promise<MCPResponse<{ id: string }>> {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: "ID inválido" };
    }

    // Verifica se refeição existe
    const existing = await prisma.meal.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Refeição não encontrada" };
    }

    // Verifica se está sendo usada em planos alimentares
    const usageCount = await prisma.mealPlanMeal.count({
      where: { mealId: id },
    });

    if (usageCount > 0) {
      return {
        success: false,
        error: `Refeição está sendo usada em ${usageCount} plano(s) alimentar(es)`,
      };
    }

    await prisma.meal.delete({ where: { id } });

    return {
      success: true,
      data: { id },
      message: "Refeição removida com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao remover refeição",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Calcula macros totais de múltiplas refeições
 */
export async function calculateMealsMacros(
  mealIds: string[]
): Promise<
  MCPResponse<{
    proteina: number;
    carboidrato: number;
    gordura: number;
    calorias: number;
    refeicoes: { id: string; nome: string; calorias: number }[];
  }>
> {
  try {
    // Valida IDs
    for (const id of mealIds) {
      if (!isValidUUID(id)) {
        return { success: false, error: `ID inválido: ${id}` };
      }
    }

    const meals = await prisma.meal.findMany({
      where: { id: { in: mealIds } },
    });

    if (meals.length === 0) {
      return { success: false, error: "Nenhuma refeição encontrada" };
    }

    const macros = somarMacros(meals);

    return {
      success: true,
      data: {
        ...macros,
        refeicoes: meals.map((m) => ({
          id: m.id,
          nome: m.nome,
          calorias: m.calorias,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao calcular macros",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Busca refeições por faixa de calorias
 */
export async function getMealsByCalorieRange(
  minCalorias: number,
  maxCalorias: number
): Promise<MCPResponse<MealResponse[]>> {
  try {
    const meals = await prisma.meal.findMany({
      where: {
        calorias: {
          gte: minCalorias,
          lte: maxCalorias,
        },
      },
      orderBy: { calorias: "asc" },
    });

    return {
      success: true,
      data: meals.map((m) => formatMealResponse(m, false)),
      message: `${meals.length} refeição(ões) entre ${minCalorias} e ${maxCalorias} kcal`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar refeições",
      details: error instanceof Error ? error.message : error,
    };
  }
}

/**
 * Lista todas as tags disponíveis
 */
export async function getMealTags(): Promise<
  MCPResponse<{ tag: string; count: number }[]>
> {
  try {
    const meals = await prisma.meal.findMany({
      select: { tags: true },
    });

    const tagsCount: Record<string, number> = {};
    for (const meal of meals) {
      const tags = jsonToArray<string>(meal.tags);
      for (const tag of tags) {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      }
    }

    const result = Object.entries(tagsCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar tags",
      details: error instanceof Error ? error.message : error,
    };
  }
}

// ============================================================================
// EXPORTAÇÃO DAS FERRAMENTAS MCP
// ============================================================================

export const mealTools = {
  "meals.list": {
    description: "Lista todas as refeições disponíveis com filtros opcionais",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Busca por nome" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filtrar por tags (vegano, lowcarb, etc)",
        },
        maxCalorias: { type: "number", description: "Máximo de calorias" },
        minProteina: { type: "number", description: "Mínimo de proteína em g" },
      },
    },
    handler: getMeals,
  },
  "meals.get": {
    description: "Busca uma refeição pelo ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da refeição (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => getMealById(params.id),
  },
  "meals.byTag": {
    description: "Busca refeições por tag específica",
    inputSchema: {
      type: "object",
      properties: {
        tag: {
          type: "string",
          enum: [
            "vegano",
            "vegetariano",
            "lowcarb",
            "sem_gluten",
            "sem_lactose",
            "alta_proteina",
            "baixa_caloria",
            "rapido",
            "meal_prep",
          ],
          description: "Tag da refeição",
        },
      },
      required: ["tag"],
    },
    handler: async (params: { tag: string }) => getMealsByTag(params.tag),
  },
  "meals.byCalories": {
    description: "Busca refeições por faixa de calorias",
    inputSchema: {
      type: "object",
      properties: {
        minCalorias: { type: "number", description: "Calorias mínimas" },
        maxCalorias: { type: "number", description: "Calorias máximas" },
      },
      required: ["minCalorias", "maxCalorias"],
    },
    handler: async (params: { minCalorias: number; maxCalorias: number }) =>
      getMealsByCalorieRange(params.minCalorias, params.maxCalorias),
  },
  "meals.create": {
    description: "Cria uma nova refeição no catálogo",
    inputSchema: {
      type: "object",
      properties: {
        nome: { type: "string", description: "Nome da refeição" },
        ingredientes: {
          type: "array",
          items: { type: "string" },
          description: "Lista de ingredientes",
        },
        proteina: { type: "number", description: "Proteína em gramas" },
        carboidrato: { type: "number", description: "Carboidrato em gramas" },
        gordura: { type: "number", description: "Gordura em gramas" },
        calorias: {
          type: "number",
          description: "Calorias totais (calculado automaticamente se não fornecido)",
        },
        tags: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "vegano",
              "vegetariano",
              "lowcarb",
              "sem_gluten",
              "sem_lactose",
              "alta_proteina",
              "baixa_caloria",
              "rapido",
              "meal_prep",
            ],
          },
          description: "Tags da refeição",
        },
        preparo: { type: "string", description: "Instruções de preparo" },
      },
      required: ["nome", "ingredientes", "proteina", "carboidrato", "gordura"],
    },
    handler: createMeal,
  },
  "meals.update": {
    description: "Atualiza uma refeição existente",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da refeição (UUID)" },
        nome: { type: "string" },
        ingredientes: { type: "array", items: { type: "string" } },
        proteina: { type: "number" },
        carboidrato: { type: "number" },
        gordura: { type: "number" },
        tags: { type: "array", items: { type: "string" } },
        preparo: { type: "string" },
      },
      required: ["id"],
    },
    handler: updateMeal,
  },
  "meals.delete": {
    description: "Remove uma refeição do catálogo",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da refeição (UUID)" },
      },
      required: ["id"],
    },
    handler: async (params: { id: string }) => deleteMeal(params.id),
  },
  "meals.calculateMacros": {
    description: "Calcula macros totais de múltiplas refeições",
    inputSchema: {
      type: "object",
      properties: {
        mealIds: {
          type: "array",
          items: { type: "string" },
          description: "Lista de IDs de refeições",
        },
      },
      required: ["mealIds"],
    },
    handler: async (params: { mealIds: string[] }) =>
      calculateMealsMacros(params.mealIds),
  },
  "meals.tags": {
    description: "Lista todas as tags de refeições e quantidade",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: getMealTags,
  },
};

