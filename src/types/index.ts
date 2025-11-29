// ============================================================================
// GYM PLAN MCP - Tipos e Schemas Zod
// ============================================================================
// Este arquivo contém todas as definições de tipos TypeScript e schemas de
// validação Zod para o sistema de gerenciamento de treinos.
// ============================================================================

import { z } from "zod";

// ============================================================================
// ENUMS E CONSTANTES
// ============================================================================

/**
 * Objetivos físicos disponíveis para o usuário
 */
export const ObjetivoFisicoEnum = z.enum([
  "hipertrofia",
  "emagrecimento",
  "condicionamento",
  "performance",
]);
export type ObjetivoFisico = z.infer<typeof ObjetivoFisicoEnum>;

/**
 * Níveis de experiência do usuário
 */
export const NivelExperienciaEnum = z.enum([
  "iniciante",
  "intermediario",
  "avancado",
]);
export type NivelExperiencia = z.infer<typeof NivelExperienciaEnum>;

/**
 * Grupos musculares para categorização de exercícios
 */
export const GrupoMuscularEnum = z.enum([
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
]);
export type GrupoMuscular = z.infer<typeof GrupoMuscularEnum>;

/**
 * Tipos de equipamento para exercícios
 */
export const EquipamentoEnum = z.enum([
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
]);
export type Equipamento = z.infer<typeof EquipamentoEnum>;

/**
 * Dias da semana (0 = domingo, 6 = sábado)
 */
export const DiaSemanaEnum = z.number().int().min(0).max(6);
export type DiaSemana = z.infer<typeof DiaSemanaEnum>;

/**
 * Tipos de refeição
 */
export const TipoRefeicaoEnum = z.enum([
  "cafe",
  "lanche_manha",
  "almoco",
  "lanche_tarde",
  "jantar",
  "ceia",
]);
export type TipoRefeicao = z.infer<typeof TipoRefeicaoEnum>;

/**
 * Tags para refeições
 */
export const MealTagEnum = z.enum([
  "vegano",
  "vegetariano",
  "lowcarb",
  "sem_gluten",
  "sem_lactose",
  "alta_proteina",
  "baixa_caloria",
  "rapido",
  "meal_prep",
]);
export type MealTag = z.infer<typeof MealTagEnum>;

// ============================================================================
// SCHEMAS DE USUÁRIO
// ============================================================================

/**
 * Schema para criação de usuário
 */
export const UserCreateSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  idade: z.number().int().min(14, "Idade mínima é 14 anos").max(120),
  peso: z.number().positive("Peso deve ser positivo").max(500),
  altura: z.number().positive("Altura deve ser positiva").max(300),
  objetivoFisico: ObjetivoFisicoEnum,
  restricoesAlimentares: z.array(z.string()).optional().default([]),
  nivelExperiencia: NivelExperienciaEnum,
});
export type UserCreate = z.infer<typeof UserCreateSchema>;

/**
 * Schema para atualização de usuário
 */
export const UserUpdateSchema = UserCreateSchema.partial().extend({
  id: z.string().uuid(),
});
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

/**
 * Schema completo do usuário (incluindo campos gerados)
 */
export const UserSchema = UserCreateSchema.extend({
  id: z.string().uuid(),
  restricoesAlimentares: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

// ============================================================================
// SCHEMAS DE EXERCÍCIO
// ============================================================================

/**
 * Schema para criação de exercício
 */
export const ExerciseCreateSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  grupoMuscular: GrupoMuscularEnum,
  equipamentoNecessario: EquipamentoEnum.optional(),
  videoUrl: z.string().url().optional().nullable(),
  instrucoesDetalhadas: z
    .string()
    .min(10, "Instruções devem ter pelo menos 10 caracteres"),
  nivelRecomendado: NivelExperienciaEnum,
});
export type ExerciseCreate = z.infer<typeof ExerciseCreateSchema>;

/**
 * Schema para atualização de exercício
 */
export const ExerciseUpdateSchema = ExerciseCreateSchema.partial().extend({
  id: z.string().uuid(),
});
export type ExerciseUpdate = z.infer<typeof ExerciseUpdateSchema>;

/**
 * Schema completo do exercício
 */
export const ExerciseSchema = ExerciseCreateSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// ============================================================================
// SCHEMAS DE PLANO DE TREINO
// ============================================================================

/**
 * Schema para exercício dentro do plano de treino
 */
export const WorkoutPlanExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  diaSemana: DiaSemanaEnum,
  ordem: z.number().int().min(1),
  series: z.number().int().min(1).max(20),
  repeticoes: z.string().regex(/^\d+(-\d+)?$/, 'Formato: "10" ou "8-12"'),
  descanso: z.number().int().min(0).max(600), // máximo 10 minutos
  observacoes: z.string().optional().nullable(),
});
export type WorkoutPlanExercise = z.infer<typeof WorkoutPlanExerciseSchema>;

/**
 * Schema para criação de plano de treino
 */
export const WorkoutPlanCreateSchema = z.object({
  userId: z.string().uuid(),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  observacoes: z.string().optional().nullable(),
  exercises: z.array(WorkoutPlanExerciseSchema).min(1, "Plano deve ter pelo menos 1 exercício"),
});
export type WorkoutPlanCreate = z.infer<typeof WorkoutPlanCreateSchema>;

/**
 * Schema para atualização de plano de treino
 */
export const WorkoutPlanUpdateSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2).optional(),
  observacoes: z.string().optional().nullable(),
  exercises: z.array(WorkoutPlanExerciseSchema).optional(),
  ativo: z.boolean().optional(),
});
export type WorkoutPlanUpdate = z.infer<typeof WorkoutPlanUpdateSchema>;

/**
 * Schema completo do plano de treino
 */
export const WorkoutPlanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  nome: z.string(),
  observacoes: z.string().nullable(),
  versao: z.number().int(),
  ativo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  exercises: z.array(WorkoutPlanExerciseSchema.extend({
    id: z.string().uuid(),
    workoutPlanId: z.string().uuid(),
  })).optional(),
});
export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;

// ============================================================================
// SCHEMAS DE SESSÃO DE TREINO
// ============================================================================

/**
 * Schema para exercício executado na sessão
 */
export const SessionExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  seriesExecutadas: z.number().int().min(1),
  repeticoes: z.array(z.number().int().min(0)), // ex: [12, 10, 8]
  carga: z.array(z.number().min(0)), // ex: [20, 25, 30] em kg
  observacoes: z.string().optional().nullable(),
});
export type SessionExercise = z.infer<typeof SessionExerciseSchema>;

/**
 * Schema para criação de sessão de treino
 */
export const WorkoutSessionCreateSchema = z.object({
  userId: z.string().uuid(),
  data: z.string().datetime().or(z.date()),
  duracao: z.number().int().min(1).optional(), // em minutos
  comentarios: z.string().optional().nullable(),
  exercises: z.array(SessionExerciseSchema).min(1, "Sessão deve ter pelo menos 1 exercício"),
});
export type WorkoutSessionCreate = z.infer<typeof WorkoutSessionCreateSchema>;

/**
 * Schema completo da sessão de treino
 */
export const WorkoutSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  data: z.date(),
  duracao: z.number().int().nullable(),
  comentarios: z.string().nullable(),
  performanceScore: z.number().min(0).max(100).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  exercises: z.array(SessionExerciseSchema.extend({
    id: z.string().uuid(),
    workoutSessionId: z.string().uuid(),
  })).optional(),
});
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;

// ============================================================================
// SCHEMAS DE REFEIÇÃO
// ============================================================================

/**
 * Schema para macros nutricionais
 */
export const MacrosSchema = z.object({
  proteina: z.number().min(0),
  carboidrato: z.number().min(0),
  gordura: z.number().min(0),
  calorias: z.number().min(0),
});
export type Macros = z.infer<typeof MacrosSchema>;

/**
 * Schema para criação de refeição
 */
export const MealCreateSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  ingredientes: z.array(z.string()).min(1, "Deve ter pelo menos 1 ingrediente"),
  proteina: z.number().min(0),
  carboidrato: z.number().min(0),
  gordura: z.number().min(0),
  calorias: z.number().min(0).optional(), // será calculado se não fornecido
  tags: z.array(MealTagEnum).optional().default([]),
  preparo: z.string().optional().nullable(),
});
export type MealCreate = z.infer<typeof MealCreateSchema>;

/**
 * Schema para atualização de refeição
 */
export const MealUpdateSchema = MealCreateSchema.partial().extend({
  id: z.string().uuid(),
});
export type MealUpdate = z.infer<typeof MealUpdateSchema>;

/**
 * Schema completo da refeição
 */
export const MealSchema = MealCreateSchema.extend({
  id: z.string().uuid(),
  calorias: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Meal = z.infer<typeof MealSchema>;

// ============================================================================
// SCHEMAS DE PLANO ALIMENTAR
// ============================================================================

/**
 * Schema para refeição no plano alimentar
 */
export const MealPlanMealSchema = z.object({
  mealId: z.string().uuid(),
  diaSemana: DiaSemanaEnum,
  tipoRefeicao: TipoRefeicaoEnum,
  ordem: z.number().int().min(1),
});
export type MealPlanMeal = z.infer<typeof MealPlanMealSchema>;

/**
 * Schema para criação de plano alimentar
 */
export const MealPlanCreateSchema = z.object({
  userId: z.string().uuid(),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  metaCalorica: z.number().positive("Meta calórica deve ser positiva"),
  metaProteina: z.number().min(0),
  metaCarbo: z.number().min(0),
  metaGordura: z.number().min(0),
  observacoes: z.string().optional().nullable(),
  meals: z.array(MealPlanMealSchema).optional().default([]),
});
export type MealPlanCreate = z.infer<typeof MealPlanCreateSchema>;

/**
 * Schema para atualização de plano alimentar
 */
export const MealPlanUpdateSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2).optional(),
  metaCalorica: z.number().positive().optional(),
  metaProteina: z.number().min(0).optional(),
  metaCarbo: z.number().min(0).optional(),
  metaGordura: z.number().min(0).optional(),
  observacoes: z.string().optional().nullable(),
  meals: z.array(MealPlanMealSchema).optional(),
  ativo: z.boolean().optional(),
});
export type MealPlanUpdate = z.infer<typeof MealPlanUpdateSchema>;

/**
 * Schema completo do plano alimentar
 */
export const MealPlanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  nome: z.string(),
  metaCalorica: z.number(),
  metaProteina: z.number(),
  metaCarbo: z.number(),
  metaGordura: z.number(),
  observacoes: z.string().nullable(),
  ativo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  meals: z.array(MealPlanMealSchema.extend({
    id: z.string().uuid(),
    mealPlanId: z.string().uuid(),
  })).optional(),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

// ============================================================================
// TIPOS DE RESPOSTA MCP
// ============================================================================

/**
 * Estrutura padrão de resposta de sucesso
 */
export interface MCPSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Estrutura padrão de resposta de erro
 */
export interface MCPErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

/**
 * Tipo unificado de resposta MCP
 */
export type MCPResponse<T> = MCPSuccessResponse<T> | MCPErrorResponse;

// ============================================================================
// TIPOS PARA GERAÇÃO AUTOMÁTICA
// ============================================================================

/**
 * Parâmetros para geração automática de plano de treino
 */
export const AutoWorkoutPlanParamsSchema = z.object({
  userId: z.string().uuid(),
  diasPorSemana: z.number().int().min(1).max(7).default(4),
  duracaoTreino: z.number().int().min(20).max(180).default(60), // minutos
  focoMuscular: z.array(GrupoMuscularEnum).optional(),
});
export type AutoWorkoutPlanParams = z.infer<typeof AutoWorkoutPlanParamsSchema>;

/**
 * Parâmetros para geração automática de plano alimentar
 */
export const AutoMealPlanParamsSchema = z.object({
  userId: z.string().uuid(),
  metaCalorica: z.number().positive().optional(), // será calculado se não fornecido
  refeicoesporDia: z.number().int().min(3).max(8).default(5),
  restricoes: z.array(z.string()).optional(),
});
export type AutoMealPlanParams = z.infer<typeof AutoMealPlanParamsSchema>;

// ============================================================================
// HELPERS DE TIPO
// ============================================================================

/**
 * Mapeamento de dia da semana para nome em português
 */
export const DiaSemanaLabels: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

/**
 * Mapeamento de tipo de refeição para nome em português
 */
export const TipoRefeicaoLabels: Record<string, string> = {
  cafe: "Café da manhã",
  lanche_manha: "Lanche da manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche da tarde",
  jantar: "Jantar",
  ceia: "Ceia",
};

/**
 * Mapeamento de grupo muscular para nome em português
 */
export const GrupoMuscularLabels: Record<string, string> = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  pernas: "Pernas",
  gluteos: "Glúteos",
  abdomen: "Abdômen",
  cardio: "Cardio",
  corpo_inteiro: "Corpo Inteiro",
};

