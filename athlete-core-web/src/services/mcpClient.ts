/**
 * ATHLETE CORE - MCP Client
 * Cliente para comunicação com o servidor MCP
 */

import type { ApiResponse } from '../types/api';
import type { User, UserStats } from '../types/user';
import type { WorkoutPlan, WorkoutSession, Exercise, WorkoutStats } from '../types/workout';
import type { MealPlan, Meal } from '../types/meal';
import { MCP_API_URL } from '../utils/constants';
import { logError } from '../utils/errorHandler';

/**
 * URL base da API MCP
 */
const API_URL = MCP_API_URL;

/**
 * ID do usuário de demonstração (criado no seed do banco)
 * Em produção, isso seria mapeado do Clerk ID para o user ID do banco
 */
export const DEMO_USER_ID = '2219d3a8-0b48-472a-b0e3-fd603d95336d';

/**
 * Mapeia um Clerk ID para o user ID do banco
 * Por enquanto retorna o user de demonstração
 * TODO: Implementar sincronização real com Clerk
 */
export function mapClerkIdToUserId(_clerkId: string): string {
  return DEMO_USER_ID;
}

/**
 * Faz uma chamada para uma ferramenta MCP
 */
async function callMCPTool<T>(
  tool: string,
  args: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}/tools/${tool}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    
    // O MCP retorna { content: [{ text: "JSON" }] }
    if (data.content && Array.isArray(data.content) && data.content[0]?.text) {
      return JSON.parse(data.content[0].text);
    }
    
    return data;
  } catch (error) {
    logError(error, `MCP Tool: ${tool}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao chamar MCP',
    };
  }
}

// ============================================================================
// USUÁRIOS
// ============================================================================

/**
 * Busca um usuário por ID
 */
export async function getUser(userId: string): Promise<ApiResponse<User>> {
  return callMCPTool<User>('users.get', { id: userId });
}

/**
 * Lista todos os usuários
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  return callMCPTool<User[]>('users.list', {});
}

/**
 * Cria um novo usuário
 */
export async function createUser(data: Partial<User>): Promise<ApiResponse<User>> {
  return callMCPTool<User>('users.create', data);
}

/**
 * Atualiza um usuário
 */
export async function updateUser(data: Partial<User> & { id: string }): Promise<ApiResponse<User>> {
  return callMCPTool<User>('users.update', data);
}

/**
 * Obtém estatísticas do usuário
 */
export async function getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
  return callMCPTool<UserStats>('users.stats', { userId });
}

// ============================================================================
// EXERCÍCIOS
// ============================================================================

/**
 * Lista todos os exercícios
 */
export async function getExercises(filters?: {
  search?: string;
  grupoMuscular?: string;
  nivel?: string;
}): Promise<ApiResponse<Exercise[]>> {
  return callMCPTool<Exercise[]>('exercises.list', filters || {});
}

/**
 * Busca um exercício por ID
 */
export async function getExercise(id: string): Promise<ApiResponse<Exercise>> {
  return callMCPTool<Exercise>('exercises.get', { id });
}

/**
 * Busca exercícios por grupo muscular
 */
export async function getExercisesByMuscleGroup(
  grupoMuscular: string
): Promise<ApiResponse<Exercise[]>> {
  return callMCPTool<Exercise[]>('exercises.byMuscleGroup', { grupoMuscular });
}

// ============================================================================
// PLANOS DE TREINO
// ============================================================================

/**
 * Lista planos de treino do usuário
 */
export async function getWorkoutPlans(userId: string): Promise<ApiResponse<WorkoutPlan[]>> {
  return callMCPTool<WorkoutPlan[]>('workoutPlans.list', { userId });
}

/**
 * Busca um plano de treino por ID
 */
export async function getWorkoutPlan(id: string): Promise<ApiResponse<WorkoutPlan>> {
  return callMCPTool<WorkoutPlan>('workoutPlans.get', { id });
}

/**
 * Alias para getWorkoutPlan - usado nas páginas
 */
export async function getWorkoutDetails(id: string): Promise<ApiResponse<WorkoutPlan>> {
  return getWorkoutPlan(id);
}

/**
 * Busca o treino do dia
 */
export async function getTodayWorkout(userId: string): Promise<ApiResponse<WorkoutPlan['exercises']>> {
  return callMCPTool<WorkoutPlan['exercises']>('workoutPlans.today', { userId });
}

/**
 * Gera um plano de treino automático
 */
export async function generateWorkoutPlan(
  userId: string,
  diasPorSemana?: number
): Promise<ApiResponse<WorkoutPlan>> {
  return callMCPTool<WorkoutPlan>('workoutPlans.generate', { userId, diasPorSemana });
}

// ============================================================================
// SESSÕES DE TREINO
// ============================================================================

/**
 * Lista sessões de treino do usuário
 */
export async function getWorkoutSessions(
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<ApiResponse<WorkoutSession[]>> {
  return callMCPTool<WorkoutSession[]>('workoutSessions.list', { userId, ...filters });
}

/**
 * Busca uma sessão de treino por ID
 */
export async function getWorkoutSession(id: string): Promise<ApiResponse<WorkoutSession>> {
  return callMCPTool<WorkoutSession>('workoutSessions.get', { id });
}

/**
 * Obtém estatísticas de treino
 */
export async function getWorkoutStats(
  userId: string,
  period?: 'week' | 'month' | 'year'
): Promise<ApiResponse<WorkoutStats>> {
  return callMCPTool<WorkoutStats>('workoutSessions.stats', { userId, period });
}

/**
 * Obtém recomendações personalizadas
 */
export async function getRecommendations(userId: string): Promise<ApiResponse<string[]>> {
  return callMCPTool<string[]>('workoutSessions.recommendations', { userId });
}

/**
 * Cria uma nova sessão de treino
 */
export async function createWorkoutSession(data: {
  userId: string;
  data: string;
  duracao?: number;
  comentarios?: string;
  exercises: Array<{
    exerciseId: string;
    seriesExecutadas: number;
    repeticoes: number[];
    carga: number[];
    observacoes?: string;
  }>;
}): Promise<ApiResponse<WorkoutSession>> {
  return callMCPTool<WorkoutSession>('workoutSessions.create', data);
}

// ============================================================================
// REFEIÇÕES
// ============================================================================

/**
 * Lista todas as refeições
 */
export async function getMeals(filters?: {
  search?: string;
  tags?: string[];
  maxCalorias?: number;
  minProteina?: number;
}): Promise<ApiResponse<Meal[]>> {
  return callMCPTool<Meal[]>('meals.list', filters || {});
}

/**
 * Busca uma refeição por ID
 */
export async function getMeal(id: string): Promise<ApiResponse<Meal>> {
  return callMCPTool<Meal>('meals.get', { id });
}

/**
 * Alias para getMeal - usado nas páginas
 */
export async function getMealDetails(id: string): Promise<ApiResponse<Meal>> {
  return getMeal(id);
}

/**
 * Busca refeições por tag
 */
export async function getMealsByTag(tag: string): Promise<ApiResponse<Meal[]>> {
  return callMCPTool<Meal[]>('meals.byTag', { tag });
}

// ============================================================================
// PLANOS ALIMENTARES
// ============================================================================

/**
 * Lista planos alimentares do usuário
 */
export async function getMealPlans(userId: string): Promise<ApiResponse<MealPlan[]>> {
  return callMCPTool<MealPlan[]>('mealPlans.list', { userId });
}

/**
 * Busca um plano alimentar por ID
 */
export async function getMealPlan(userId: string): Promise<ApiResponse<MealPlan[]>> {
  return callMCPTool<MealPlan[]>('mealPlans.list', { userId, ativo: true });
}

/**
 * Busca as refeições do dia
 */
export async function getTodayMeals(userId: string): Promise<ApiResponse<MealPlan['meals']>> {
  return callMCPTool<MealPlan['meals']>('mealPlans.today', { userId });
}

/**
 * Gera um plano alimentar automático
 */
export async function generateMealPlan(
  userId: string,
  refeicoesporDia?: number
): Promise<ApiResponse<MealPlan>> {
  return callMCPTool<MealPlan>('mealPlans.generate', { userId, refeicoesporDia });
}

// ============================================================================
// EXPORTAÇÃO PADRÃO
// ============================================================================

export default {
  // Usuários
  getUser,
  getUsers,
  createUser,
  updateUser,
  getUserStats,
  // Exercícios
  getExercises,
  getExercise,
  getExercisesByMuscleGroup,
  // Planos de Treino
  getWorkoutPlans,
  getWorkoutPlan,
  getWorkoutDetails,
  getTodayWorkout,
  generateWorkoutPlan,
  // Sessões
  getWorkoutSessions,
  getWorkoutSession,
  getWorkoutStats,
  getRecommendations,
  createWorkoutSession,
  // Refeições
  getMeals,
  getMeal,
  getMealDetails,
  getMealsByTag,
  // Planos Alimentares
  getMealPlans,
  getMealPlan,
  getTodayMeals,
  generateMealPlan,
};

