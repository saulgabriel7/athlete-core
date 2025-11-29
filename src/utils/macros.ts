// ============================================================================
// GYM PLAN MCP - Cálculos de Macros e Nutrição
// ============================================================================
// Funções utilitárias para cálculos nutricionais, TMB, TDEE e macros
// ============================================================================

import type { ObjetivoFisico, NivelExperiencia, Macros } from "../types/index.js";

// ============================================================================
// CONSTANTES NUTRICIONAIS
// ============================================================================

/**
 * Calorias por grama de cada macronutriente
 */
export const CALORIAS_POR_GRAMA = {
  proteina: 4,
  carboidrato: 4,
  gordura: 9,
  alcool: 7, // para referência
} as const;

/**
 * Fatores de atividade para cálculo de TDEE
 */
export const FATORES_ATIVIDADE = {
  sedentario: 1.2, // Pouco ou nenhum exercício
  leve: 1.375, // Exercício leve 1-3 dias/semana
  moderado: 1.55, // Exercício moderado 3-5 dias/semana
  ativo: 1.725, // Exercício intenso 6-7 dias/semana
  muito_ativo: 1.9, // Exercício muito intenso + trabalho físico
} as const;

/**
 * Distribuição de macros por objetivo (em porcentagem)
 */
export const DISTRIBUICAO_MACROS: Record<
  ObjetivoFisico,
  { proteina: number; carboidrato: number; gordura: number }
> = {
  hipertrofia: { proteina: 30, carboidrato: 45, gordura: 25 },
  emagrecimento: { proteina: 35, carboidrato: 35, gordura: 30 },
  condicionamento: { proteina: 25, carboidrato: 50, gordura: 25 },
  performance: { proteina: 25, carboidrato: 55, gordura: 20 },
};

/**
 * Ajuste calórico por objetivo
 */
export const AJUSTE_CALORICO: Record<ObjetivoFisico, number> = {
  hipertrofia: 300, // superávit
  emagrecimento: -400, // déficit
  condicionamento: 0, // manutenção
  performance: 200, // leve superávit
};

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

/**
 * Calcula a Taxa Metabólica Basal (TMB) usando a fórmula de Mifflin-St Jeor
 * @param peso Peso em kg
 * @param altura Altura em cm
 * @param idade Idade em anos
 * @param sexo Sexo biológico ('masculino' | 'feminino')
 * @returns TMB em kcal/dia
 */
export function calcularTMB(
  peso: number,
  altura: number,
  idade: number,
  sexo: "masculino" | "feminino" = "masculino"
): number {
  // Fórmula de Mifflin-St Jeor
  const tmb = 10 * peso + 6.25 * altura - 5 * idade;
  return sexo === "masculino" ? tmb + 5 : tmb - 161;
}

/**
 * Calcula o Gasto Energético Total Diário (TDEE)
 * @param tmb Taxa Metabólica Basal
 * @param nivelAtividade Nível de atividade física
 * @returns TDEE em kcal/dia
 */
export function calcularTDEE(
  tmb: number,
  nivelAtividade: keyof typeof FATORES_ATIVIDADE = "moderado"
): number {
  return Math.round(tmb * FATORES_ATIVIDADE[nivelAtividade]);
}

/**
 * Mapeia nível de experiência para nível de atividade
 */
export function nivelExperienciaParaAtividade(
  nivel: NivelExperiencia
): keyof typeof FATORES_ATIVIDADE {
  const mapa: Record<NivelExperiencia, keyof typeof FATORES_ATIVIDADE> = {
    iniciante: "leve",
    intermediario: "moderado",
    avancado: "ativo",
  };
  return mapa[nivel];
}

/**
 * Calcula a meta calórica diária baseada no objetivo
 * @param tdee Gasto Energético Total Diário
 * @param objetivo Objetivo físico do usuário
 * @returns Meta calórica em kcal/dia
 */
export function calcularMetaCalorica(
  tdee: number,
  objetivo: ObjetivoFisico
): number {
  return Math.round(tdee + AJUSTE_CALORICO[objetivo]);
}

/**
 * Calcula a distribuição de macros em gramas
 * @param calorias Meta calórica diária
 * @param objetivo Objetivo físico do usuário
 * @returns Objeto com macros em gramas
 */
export function calcularMacros(
  calorias: number,
  objetivo: ObjetivoFisico
): Macros {
  const distribuicao = DISTRIBUICAO_MACROS[objetivo];

  const proteinaCalorias = (calorias * distribuicao.proteina) / 100;
  const carboidratoCalorias = (calorias * distribuicao.carboidrato) / 100;
  const gorduraCalorias = (calorias * distribuicao.gordura) / 100;

  return {
    proteina: Math.round(proteinaCalorias / CALORIAS_POR_GRAMA.proteina),
    carboidrato: Math.round(carboidratoCalorias / CALORIAS_POR_GRAMA.carboidrato),
    gordura: Math.round(gorduraCalorias / CALORIAS_POR_GRAMA.gordura),
    calorias: calorias,
  };
}

/**
 * Calcula calorias totais a partir dos macros
 * @param proteina Proteína em gramas
 * @param carboidrato Carboidrato em gramas
 * @param gordura Gordura em gramas
 * @returns Total de calorias
 */
export function calcularCaloriasDeMacros(
  proteina: number,
  carboidrato: number,
  gordura: number
): number {
  return Math.round(
    proteina * CALORIAS_POR_GRAMA.proteina +
      carboidrato * CALORIAS_POR_GRAMA.carboidrato +
      gordura * CALORIAS_POR_GRAMA.gordura
  );
}

/**
 * Calcula o plano nutricional completo para um usuário
 * @param peso Peso em kg
 * @param altura Altura em cm
 * @param idade Idade em anos
 * @param objetivo Objetivo físico
 * @param nivelExperiencia Nível de experiência
 * @returns Objeto com TMB, TDEE, meta calórica e macros
 */
export function calcularPlanoNutricional(
  peso: number,
  altura: number,
  idade: number,
  objetivo: ObjetivoFisico,
  nivelExperiencia: NivelExperiencia
): {
  tmb: number;
  tdee: number;
  metaCalorica: number;
  macros: Macros;
} {
  const tmb = calcularTMB(peso, altura, idade);
  const nivelAtividade = nivelExperienciaParaAtividade(nivelExperiencia);
  const tdee = calcularTDEE(tmb, nivelAtividade);
  const metaCalorica = calcularMetaCalorica(tdee, objetivo);
  const macros = calcularMacros(metaCalorica, objetivo);

  return {
    tmb: Math.round(tmb),
    tdee,
    metaCalorica,
    macros,
  };
}

/**
 * Calcula o Índice de Massa Corporal (IMC)
 * @param peso Peso em kg
 * @param altura Altura em cm
 * @returns IMC
 */
export function calcularIMC(peso: number, altura: number): number {
  const alturaMetros = altura / 100;
  return Math.round((peso / (alturaMetros * alturaMetros)) * 10) / 10;
}

/**
 * Classifica o IMC
 * @param imc Índice de Massa Corporal
 * @returns Classificação do IMC
 */
export function classificarIMC(imc: number): string {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade grau I";
  if (imc < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

/**
 * Calcula a necessidade de proteína diária baseada no objetivo
 * @param peso Peso em kg
 * @param objetivo Objetivo físico
 * @returns Proteína em gramas/dia
 */
export function calcularProteinaDiaria(
  peso: number,
  objetivo: ObjetivoFisico
): number {
  // Gramas de proteína por kg de peso corporal
  const proteinaPorKg: Record<ObjetivoFisico, number> = {
    hipertrofia: 2.0,
    emagrecimento: 2.2,
    condicionamento: 1.6,
    performance: 1.8,
  };

  return Math.round(peso * proteinaPorKg[objetivo]);
}

/**
 * Calcula o volume de água diário recomendado
 * @param peso Peso em kg
 * @returns Litros de água por dia
 */
export function calcularAguaDiaria(peso: number): number {
  // 35ml por kg de peso corporal
  return Math.round((peso * 35) / 10) / 100;
}

/**
 * Soma os macros de múltiplas refeições
 * @param meals Array de objetos com macros
 * @returns Macros totais
 */
export function somarMacros(
  meals: Array<{
    proteina: number;
    carboidrato: number;
    gordura: number;
    calorias: number;
  }>
): Macros {
  return meals.reduce(
    (total, meal) => ({
      proteina: total.proteina + meal.proteina,
      carboidrato: total.carboidrato + meal.carboidrato,
      gordura: total.gordura + meal.gordura,
      calorias: total.calorias + meal.calorias,
    }),
    { proteina: 0, carboidrato: 0, gordura: 0, calorias: 0 }
  );
}

/**
 * Calcula a porcentagem de macros atingidos
 * @param atual Macros atuais consumidos
 * @param meta Macros meta
 * @returns Porcentagens de cada macro
 */
export function calcularPorcentagemMacros(
  atual: Macros,
  meta: Macros
): {
  proteina: number;
  carboidrato: number;
  gordura: number;
  calorias: number;
} {
  return {
    proteina: Math.round((atual.proteina / meta.proteina) * 100),
    carboidrato: Math.round((atual.carboidrato / meta.carboidrato) * 100),
    gordura: Math.round((atual.gordura / meta.gordura) * 100),
    calorias: Math.round((atual.calorias / meta.calorias) * 100),
  };
}

