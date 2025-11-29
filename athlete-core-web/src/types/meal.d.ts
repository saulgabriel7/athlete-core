/**
 * ATHLETE CORE - Tipos de Refeição e Plano Alimentar
 */

export interface Meal {
  id: string;
  nome: string;
  ingredientes: string[];
  proteina: number;
  carboidrato: number;
  gordura: number;
  calorias: number;
  tags: string[];
  preparo: string | null;
  createdAt: string;
  updatedAt: string;
  macrosPorcentagem?: {
    proteina: number;
    carboidrato: number;
    gordura: number;
  };
}

export interface MealPlanMeal {
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

export interface MealPlan {
  id: string;
  userId: string;
  nome: string;
  metaCalorica: number;
  metaProteina: number;
  metaCarbo: number;
  metaGordura: number;
  observacoes: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  meals: MealPlanMeal[];
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

export interface Macros {
  proteina: number;
  carboidrato: number;
  gordura: number;
  calorias: number;
}

// Tipos de refeição
export type TipoRefeicao = 
  | 'cafe'
  | 'lanche_manha'
  | 'almoco'
  | 'lanche_tarde'
  | 'jantar'
  | 'ceia';

// Labels dos tipos de refeição
export const TipoRefeicaoLabels: Record<string, string> = {
  cafe: 'Café da manhã',
  lanche_manha: 'Lanche da manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da tarde',
  jantar: 'Jantar',
  ceia: 'Ceia',
};

// Tags de refeição
export const MealTagLabels: Record<string, string> = {
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  lowcarb: 'Low Carb',
  sem_gluten: 'Sem Glúten',
  sem_lactose: 'Sem Lactose',
  alta_proteina: 'Alta Proteína',
  baixa_caloria: 'Baixa Caloria',
  rapido: 'Rápido',
  meal_prep: 'Meal Prep',
};

