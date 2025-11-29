// ============================================================================
// GYM PLAN MCP - Geradores Automáticos
// ============================================================================
// Funções para geração automática de planos de treino e alimentação
// ============================================================================

import type {
  ObjetivoFisico,
  NivelExperiencia,
  GrupoMuscular,
  WorkoutPlanExercise,
  MealPlanMeal,
} from "../types/index.js";
import {
  calcularPlanoNutricional,
  calcularProteinaDiaria,
} from "./macros.js";
import prisma from "../db/prisma.js";

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

interface UserData {
  id: string;
  peso: number;
  altura: number;
  idade: number;
  objetivoFisico: string;
  nivelExperiencia: string;
  restricoesAlimentares: string | null;
}

interface ExerciseData {
  id: string;
  nome: string;
  grupoMuscular: string;
  nivelRecomendado: string;
}

interface MealData {
  id: string;
  nome: string;
  calorias: number;
  proteina: number;
  tags: string | null;
}

// ============================================================================
// CONFIGURAÇÕES DE TREINO
// ============================================================================

/**
 * Distribuição de grupos musculares por objetivo
 */
const DIVISAO_TREINO: Record<
  ObjetivoFisico,
  Record<number, GrupoMuscular[]>
> = {
  hipertrofia: {
    3: [
      ["peito", "triceps"],
      ["costas", "biceps"],
      ["pernas", "ombros"],
    ] as unknown as GrupoMuscular[],
    4: [
      ["peito"],
      ["costas"],
      ["pernas"],
      ["ombros", "biceps", "triceps"],
    ] as unknown as GrupoMuscular[],
    5: [
      ["peito"],
      ["costas"],
      ["pernas"],
      ["ombros"],
      ["biceps", "triceps"],
    ] as unknown as GrupoMuscular[],
  },
  emagrecimento: {
    3: [
      ["corpo_inteiro", "cardio"],
      ["corpo_inteiro", "cardio"],
      ["corpo_inteiro", "cardio"],
    ] as unknown as GrupoMuscular[],
    4: [
      ["peito", "costas", "cardio"],
      ["pernas", "cardio"],
      ["ombros", "cardio"],
      ["corpo_inteiro", "cardio"],
    ] as unknown as GrupoMuscular[],
    5: [
      ["peito", "cardio"],
      ["costas", "cardio"],
      ["pernas", "cardio"],
      ["ombros", "cardio"],
      ["corpo_inteiro", "cardio"],
    ] as unknown as GrupoMuscular[],
  },
  condicionamento: {
    3: [
      ["corpo_inteiro", "cardio"],
      ["corpo_inteiro", "cardio"],
      ["cardio"],
    ] as unknown as GrupoMuscular[],
    4: [
      ["peito", "costas"],
      ["pernas"],
      ["cardio"],
      ["corpo_inteiro"],
    ] as unknown as GrupoMuscular[],
    5: [
      ["peito", "costas"],
      ["pernas"],
      ["cardio"],
      ["ombros"],
      ["cardio"],
    ] as unknown as GrupoMuscular[],
  },
  performance: {
    3: [
      ["pernas", "cardio"],
      ["peito", "costas"],
      ["corpo_inteiro", "cardio"],
    ] as unknown as GrupoMuscular[],
    4: [
      ["pernas"],
      ["peito", "costas"],
      ["cardio"],
      ["corpo_inteiro"],
    ] as unknown as GrupoMuscular[],
    5: [
      ["pernas"],
      ["peito"],
      ["costas"],
      ["cardio"],
      ["corpo_inteiro"],
    ] as unknown as GrupoMuscular[],
  },
};

/**
 * Configuração de séries e repetições por objetivo e nível
 */
const CONFIG_TREINO: Record<
  ObjetivoFisico,
  Record<NivelExperiencia, { series: number; repeticoes: string; descanso: number }>
> = {
  hipertrofia: {
    iniciante: { series: 3, repeticoes: "10-12", descanso: 90 },
    intermediario: { series: 4, repeticoes: "8-12", descanso: 90 },
    avancado: { series: 4, repeticoes: "6-12", descanso: 120 },
  },
  emagrecimento: {
    iniciante: { series: 3, repeticoes: "12-15", descanso: 45 },
    intermediario: { series: 3, repeticoes: "12-15", descanso: 30 },
    avancado: { series: 4, repeticoes: "15-20", descanso: 30 },
  },
  condicionamento: {
    iniciante: { series: 2, repeticoes: "12-15", descanso: 60 },
    intermediario: { series: 3, repeticoes: "12-15", descanso: 45 },
    avancado: { series: 3, repeticoes: "15-20", descanso: 45 },
  },
  performance: {
    iniciante: { series: 3, repeticoes: "8-10", descanso: 120 },
    intermediario: { series: 4, repeticoes: "6-8", descanso: 150 },
    avancado: { series: 5, repeticoes: "3-6", descanso: 180 },
  },
};

// ============================================================================
// GERAÇÃO DE PLANO DE TREINO
// ============================================================================

/**
 * Gera um plano de treino automático baseado no perfil do usuário
 * @param userId ID do usuário
 * @param diasPorSemana Número de dias de treino por semana (3-5)
 * @returns Dados do plano de treino gerado
 */
export async function gerarPlanoTreinoAutomatico(
  userId: string,
  diasPorSemana: number = 4
): Promise<{
  nome: string;
  observacoes: string;
  exercises: WorkoutPlanExercise[];
}> {
  // Busca dados do usuário
  const user = (await prisma.user.findUnique({
    where: { id: userId },
  })) as UserData | null;

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const objetivo = user.objetivoFisico as ObjetivoFisico;
  const nivel = user.nivelExperiencia as NivelExperiencia;

  // Normaliza dias para 3-5
  const dias = Math.max(3, Math.min(5, diasPorSemana));

  // Busca exercícios disponíveis
  const exercicios = (await prisma.exercise.findMany({
    where: {
      nivelRecomendado: {
        in:
          nivel === "iniciante"
            ? ["iniciante"]
            : nivel === "intermediario"
            ? ["iniciante", "intermediario"]
            : ["iniciante", "intermediario", "avancado"],
      },
    },
  })) as ExerciseData[];

  // Agrupa exercícios por grupo muscular
  const exerciciosPorGrupo = exercicios.reduce((acc, ex) => {
    const grupo = ex.grupoMuscular;
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(ex);
    return acc;
  }, {} as Record<string, ExerciseData[]>);

  // Gera a divisão de treino
  const divisao = DIVISAO_TREINO[objetivo][dias] || DIVISAO_TREINO[objetivo][4];
  const config = CONFIG_TREINO[objetivo][nivel];

  const exercises: WorkoutPlanExercise[] = [];
  
  // Dias de treino começam na segunda-feira (1)
  const diasSemana = [1, 2, 3, 4, 5].slice(0, dias);

  for (let i = 0; i < dias; i++) {
    const gruposDia = Array.isArray(divisao[i]) ? divisao[i] : [divisao[i]];
    let ordem = 1;

    for (const grupo of gruposDia as unknown as string[]) {
      const exerciciosGrupo = exerciciosPorGrupo[grupo] || [];
      
      // Seleciona 2-4 exercícios por grupo muscular
      const numExercicios = nivel === "iniciante" ? 2 : nivel === "intermediario" ? 3 : 4;
      const selecionados = exerciciosGrupo.slice(0, Math.min(numExercicios, exerciciosGrupo.length));

      for (const ex of selecionados) {
        exercises.push({
          exerciseId: ex.id,
          diaSemana: diasSemana[i],
          ordem: ordem++,
          series: config.series,
          repeticoes: config.repeticoes,
          descanso: config.descanso,
          observacoes: null,
        });
      }
    }
  }

  // Gera nome e observações do plano
  const nomeObjetivo = {
    hipertrofia: "Hipertrofia",
    emagrecimento: "Emagrecimento",
    condicionamento: "Condicionamento",
    performance: "Performance",
  }[objetivo];

  return {
    nome: `Plano de ${nomeObjetivo} - ${dias}x por semana`,
    observacoes: `Plano gerado automaticamente para objetivo de ${objetivo}. ` +
      `Nível: ${nivel}. ` +
      `Descanse 1-2 dias entre treinos do mesmo grupo muscular.`,
    exercises,
  };
}

// ============================================================================
// GERAÇÃO DE PLANO ALIMENTAR
// ============================================================================

/**
 * Gera um plano alimentar automático baseado no perfil do usuário
 * @param userId ID do usuário
 * @param refeicoesporDia Número de refeições por dia (3-6)
 * @returns Dados do plano alimentar gerado
 */
export async function gerarPlanoAlimentarAutomatico(
  userId: string,
  refeicoesporDia: number = 5
): Promise<{
  nome: string;
  metaCalorica: number;
  metaProteina: number;
  metaCarbo: number;
  metaGordura: number;
  observacoes: string;
  meals: MealPlanMeal[];
}> {
  // Busca dados do usuário
  const user = (await prisma.user.findUnique({
    where: { id: userId },
  })) as UserData | null;

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const objetivo = user.objetivoFisico as ObjetivoFisico;
  const nivel = user.nivelExperiencia as NivelExperiencia;

  // Calcula necessidades nutricionais
  const plano = calcularPlanoNutricional(
    user.peso,
    user.altura,
    user.idade,
    objetivo,
    nivel
  );

  const proteinaDiaria = calcularProteinaDiaria(user.peso, objetivo);

  // Parse das restrições alimentares
  const restricoes: string[] = user.restricoesAlimentares
    ? JSON.parse(user.restricoesAlimentares)
    : [];

  // Busca refeições disponíveis
  const refeicoes = (await prisma.meal.findMany()) as MealData[];

  // Filtra refeições baseado nas restrições
  const refeicoesFiltradas = restricoes.length > 0
    ? refeicoes.filter((r) => {
        const tags: string[] = r.tags ? JSON.parse(r.tags) : [];
        // Verifica se tem tags que indicam compatibilidade com a restrição
        return !restricoes.some((restricao) => {
          if (restricao.toLowerCase().includes("gluten") || restricao.toLowerCase().includes("glúten")) {
            return !tags.includes("sem_gluten");
          }
          if (restricao.toLowerCase().includes("lactose")) {
            return !tags.includes("sem_lactose");
          }
          if (restricao.toLowerCase().includes("vegan") || restricao.toLowerCase().includes("vegano")) {
            return !tags.includes("vegano") && !tags.includes("vegetariano");
          }
          return false;
        });
      })
    : refeicoes;

  // Organiza refeições por calorias (do menor para maior)
  const refeicoesOrdenadas = [...refeicoesFiltradas].sort(
    (a, b) => a.calorias - b.calorias
  );

  // Distribuição de tipos de refeição baseado no número de refeições
  const tiposRefeicao = {
    3: ["cafe", "almoco", "jantar"],
    4: ["cafe", "almoco", "lanche_tarde", "jantar"],
    5: ["cafe", "lanche_manha", "almoco", "lanche_tarde", "jantar"],
    6: ["cafe", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"],
  }[Math.max(3, Math.min(6, refeicoesporDia))] || ["cafe", "lanche_manha", "almoco", "lanche_tarde", "jantar"];

  const meals: MealPlanMeal[] = [];

  // Gera refeições para cada dia da semana
  for (let dia = 1; dia <= 5; dia++) {
    // Segunda a sexta
    for (let i = 0; i < tiposRefeicao.length; i++) {
      const tipo = tiposRefeicao[i];
      
      // Seleciona refeição baseada no tipo e calorias
      let refeicao: MealData | undefined;
      
      if (tipo === "cafe" || tipo === "lanche_manha" || tipo === "lanche_tarde" || tipo === "ceia") {
        // Refeições menores
        refeicao = refeicoesOrdenadas.find(
          (r) => r.calorias >= 150 && r.calorias <= 400
        ) || refeicoesOrdenadas[0];
      } else {
        // Almoço e jantar - refeições maiores
        refeicao = refeicoesOrdenadas.find(
          (r) => r.calorias >= 400 && r.calorias <= 800
        ) || refeicoesOrdenadas[refeicoesOrdenadas.length - 1];
      }

      if (refeicao) {
        meals.push({
          mealId: refeicao.id,
          diaSemana: dia,
          tipoRefeicao: tipo as MealPlanMeal["tipoRefeicao"],
          ordem: i + 1,
        });
      }
    }
  }

  return {
    nome: `Plano Alimentar - ${objetivo}`,
    metaCalorica: plano.metaCalorica,
    metaProteina: Math.max(plano.macros.proteina, proteinaDiaria),
    metaCarbo: plano.macros.carboidrato,
    metaGordura: plano.macros.gordura,
    observacoes:
      `Plano gerado automaticamente. TMB: ${plano.tmb}kcal, TDEE: ${plano.tdee}kcal. ` +
      `Objetivo: ${objetivo}. ` +
      (restricoes.length > 0 ? `Restrições consideradas: ${restricoes.join(", ")}.` : ""),
    meals,
  };
}

// ============================================================================
// CÁLCULO DE PERFORMANCE
// ============================================================================

/**
 * Calcula o score de performance de uma sessão de treino
 * @param exercicios Exercícios executados na sessão
 * @param duracao Duração da sessão em minutos
 * @param userId ID do usuário para comparação com histórico
 * @returns Score de 0 a 100
 */
export async function calcularPerformanceScore(
  exercicios: Array<{
    exerciseId: string;
    seriesExecutadas: number;
    repeticoes: number[];
    carga: number[];
  }>,
  duracao?: number,
  userId?: string
): Promise<number> {
  let score = 0;
  let maxScore = 0;

  // Pontuação base por exercício completado
  for (const ex of exercicios) {
    maxScore += 100;
    
    // Pontos por séries executadas (até 30 pontos)
    const pontosSertes = Math.min(30, ex.seriesExecutadas * 10);
    
    // Pontos por consistência de repetições (até 30 pontos)
    const repsMedia = ex.repeticoes.reduce((a, b) => a + b, 0) / ex.repeticoes.length;
    const repsVariacao = ex.repeticoes.reduce((sum, r) => sum + Math.abs(r - repsMedia), 0) / ex.repeticoes.length;
    const pontosReps = Math.max(0, 30 - repsVariacao * 3);
    
    // Pontos por progressão de carga (até 20 pontos)
    const cargaMedia = ex.carga.reduce((a, b) => a + b, 0) / ex.carga.length;
    const pontosCarga = cargaMedia > 0 ? 20 : 10;
    
    // Pontos por volume total (até 20 pontos)
    const volumeTotal = ex.seriesExecutadas * repsMedia * cargaMedia;
    const pontosVolume = Math.min(20, volumeTotal / 100);

    score += pontosSertes + pontosReps + pontosCarga + pontosVolume;
  }

  // Ajuste por duração (bônus ou penalidade)
  if (duracao) {
    const duracaoIdeal = exercicios.length * 10; // ~10 min por exercício
    const diferencaDuracao = Math.abs(duracao - duracaoIdeal);
    
    if (diferencaDuracao < 15) {
      score *= 1.05; // Bônus de 5%
    } else if (diferencaDuracao > 30) {
      score *= 0.95; // Penalidade de 5%
    }
  }

  // Comparação com histórico (se disponível)
  if (userId) {
    const ultimasSessoes = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { data: "desc" },
      take: 5,
      select: { performanceScore: true },
    });

    if (ultimasSessoes.length > 0) {
      const mediaHistorico = ultimasSessoes
        .filter((s) => s.performanceScore !== null)
        .reduce((sum, s) => sum + (s.performanceScore || 0), 0) / ultimasSessoes.length;

      // Bônus se superou média histórica
      if (score > mediaHistorico) {
        score *= 1.1;
      }
    }
  }

  // Normaliza para 0-100
  const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Gera recomendações baseadas no histórico de treino
 * @param userId ID do usuário
 * @returns Array de recomendações
 */
export async function gerarRecomendacoes(userId: string): Promise<string[]> {
  const recomendacoes: string[] = [];

  // Busca últimas sessões
  const sessoes = await prisma.workoutSession.findMany({
    where: { userId },
    orderBy: { data: "desc" },
    take: 10,
    include: { exercises: true },
  });

  if (sessoes.length === 0) {
    return ["Comece registrando seu primeiro treino para receber recomendações personalizadas!"];
  }

  // Análise de frequência
  if (sessoes.length < 3) {
    recomendacoes.push("Continue treinando regularmente! A consistência é a chave do sucesso.");
  }

  // Análise de performance
  const scoresRecentes = sessoes
    .filter((s) => s.performanceScore !== null)
    .map((s) => s.performanceScore as number);

  if (scoresRecentes.length >= 3) {
    const mediaRecente = scoresRecentes.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const mediaAnterior = scoresRecentes.slice(3).reduce((a, b) => a + b, 0) / Math.max(1, scoresRecentes.length - 3);

    if (mediaRecente > mediaAnterior * 1.1) {
      recomendacoes.push("Parabéns! Sua performance está melhorando. Continue assim!");
    } else if (mediaRecente < mediaAnterior * 0.9) {
      recomendacoes.push("Sua performance diminuiu um pouco. Considere descansar mais ou verificar sua alimentação.");
    }
  }

  // Análise de grupos musculares trabalhados
  const gruposTrabalhados = new Set<string>();
  for (const sessao of sessoes) {
    for (const ex of sessao.exercises) {
      const exercicio = await prisma.exercise.findUnique({
        where: { id: ex.exerciseId },
        select: { grupoMuscular: true },
      });
      if (exercicio) {
        gruposTrabalhados.add(exercicio.grupoMuscular);
      }
    }
  }

  const gruposImportantes = ["peito", "costas", "pernas", "ombros"];
  const gruposFaltantes = gruposImportantes.filter((g) => !gruposTrabalhados.has(g));
  
  if (gruposFaltantes.length > 0) {
    recomendacoes.push(
      `Considere adicionar exercícios de ${gruposFaltantes.join(", ")} aos seus treinos para um desenvolvimento mais equilibrado.`
    );
  }

  if (recomendacoes.length === 0) {
    recomendacoes.push("Você está no caminho certo! Continue mantendo a consistência nos treinos.");
  }

  return recomendacoes;
}

