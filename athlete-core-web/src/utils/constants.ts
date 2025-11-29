/**
 * ATHLETE CORE - Constantes
 */

// URL da API MCP
export const MCP_API_URL = import.meta.env.MCP_API_URL || 'http://localhost:3000';

// Rotas públicas (não requerem autenticação)
export const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
];

// Rotas protegidas
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/treino',
  '/alimentacao',
  '/perfil',
];

// Navegação do sidebar
export const SIDEBAR_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home' },
  { label: 'Treinos', href: '/treino', icon: 'dumbbell' },
  { label: 'Alimentação', href: '/alimentacao', icon: 'utensils' },
  { label: 'Perfil', href: '/perfil', icon: 'user' },
];

// Dias da semana
export const DIAS_SEMANA = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
];

// Objetivos físicos
export const OBJETIVOS_FISICOS = [
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'condicionamento', label: 'Condicionamento' },
  { value: 'performance', label: 'Performance' },
];

// Níveis de experiência
export const NIVEIS_EXPERIENCIA = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];

// Grupos musculares
export const GRUPOS_MUSCULARES = [
  { value: 'peito', label: 'Peito' },
  { value: 'costas', label: 'Costas' },
  { value: 'ombros', label: 'Ombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'pernas', label: 'Pernas' },
  { value: 'gluteos', label: 'Glúteos' },
  { value: 'abdomen', label: 'Abdômen' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'corpo_inteiro', label: 'Corpo Inteiro' },
];

// Tipos de refeição
export const TIPOS_REFEICAO = [
  { value: 'cafe', label: 'Café da manhã' },
  { value: 'lanche_manha', label: 'Lanche da manhã' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'lanche_tarde', label: 'Lanche da tarde' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'ceia', label: 'Ceia' },
];

// Tags de refeição
export const MEAL_TAGS = [
  { value: 'vegano', label: 'Vegano' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'lowcarb', label: 'Low Carb' },
  { value: 'sem_gluten', label: 'Sem Glúten' },
  { value: 'sem_lactose', label: 'Sem Lactose' },
  { value: 'alta_proteina', label: 'Alta Proteína' },
  { value: 'baixa_caloria', label: 'Baixa Caloria' },
  { value: 'rapido', label: 'Rápido' },
  { value: 'meal_prep', label: 'Meal Prep' },
];

