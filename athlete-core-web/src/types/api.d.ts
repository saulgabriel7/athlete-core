/**
 * ATHLETE CORE - Tipos de API
 */

/**
 * Resposta padrão de sucesso da API MCP
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Resposta padrão de erro da API MCP
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

/**
 * Tipo unificado de resposta da API MCP
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Parâmetros de filtro
 */
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Parâmetros combinados de query
 */
export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * Estado de loading/error para componentes
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Ferramentas MCP disponíveis
 */
export type MCPTool = 
  // Users
  | 'users.list'
  | 'users.get'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.stats'
  // Exercises
  | 'exercises.list'
  | 'exercises.get'
  | 'exercises.byMuscleGroup'
  | 'exercises.create'
  | 'exercises.update'
  | 'exercises.delete'
  | 'exercises.muscleGroups'
  // Workout Plans
  | 'workoutPlans.list'
  | 'workoutPlans.get'
  | 'workoutPlans.today'
  | 'workoutPlans.create'
  | 'workoutPlans.generate'
  | 'workoutPlans.update'
  | 'workoutPlans.delete'
  // Workout Sessions
  | 'workoutSessions.list'
  | 'workoutSessions.get'
  | 'workoutSessions.create'
  | 'workoutSessions.update'
  | 'workoutSessions.delete'
  | 'workoutSessions.stats'
  | 'workoutSessions.recommendations'
  // Meals
  | 'meals.list'
  | 'meals.get'
  | 'meals.byTag'
  | 'meals.byCalories'
  | 'meals.create'
  | 'meals.update'
  | 'meals.delete'
  | 'meals.calculateMacros'
  | 'meals.tags'
  // Meal Plans
  | 'mealPlans.list'
  | 'mealPlans.get'
  | 'mealPlans.today'
  | 'mealPlans.create'
  | 'mealPlans.generate'
  | 'mealPlans.update'
  | 'mealPlans.delete'
  | 'mealPlans.addMeal'
  | 'mealPlans.removeMeal';

