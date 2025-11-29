/**
 * ATHLETE CORE - Tipos de Treino
 */

export interface Exercise {
  id: string;
  nome: string;
  grupoMuscular: string;
  equipamentoNecessario: string | null;
  videoUrl: string | null;
  instrucoesDetalhadas: string;
  nivelRecomendado: 'iniciante' | 'intermediario' | 'avancado';
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanExercise {
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

export interface WorkoutPlan {
  id: string;
  userId: string;
  nome: string;
  observacoes: string | null;
  versao: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutPlanExercise[];
  resumo?: {
    totalExercicios: number;
    diasDeTreino: number[];
    gruposMusculares: string[];
  };
}

export interface SessionExercise {
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
  volumeTotal?: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  data: string;
  duracao: number | null;
  comentarios: string | null;
  performanceScore: number | null;
  createdAt: string;
  updatedAt: string;
  exercises: SessionExercise[];
  resumo?: {
    totalExercicios: number;
    totalSeries: number;
    totalRepeticoes: number;
    volumeTotal: number;
    gruposTrabalhos: string[];
  };
}

export interface WorkoutStats {
  totalSessoes: number;
  mediaPerformance: number;
  totalVolume: number;
  gruposMaisTreinados: { grupo: string; count: number }[];
  evolucaoPerformance: { data: string; score: number }[];
}

// Mapeamento de dia da semana
export const DiaSemanaLabels: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

// Mapeamento de grupo muscular
export const GrupoMuscularLabels: Record<string, string> = {
  peito: 'Peito',
  costas: 'Costas',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  pernas: 'Pernas',
  gluteos: 'Glúteos',
  abdomen: 'Abdômen',
  cardio: 'Cardio',
  corpo_inteiro: 'Corpo Inteiro',
};

