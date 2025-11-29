/**
 * ATHLETE CORE - Formatters
 * Funções de formatação de dados
 */

/**
 * Formata uma data para exibição
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', options || {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata data relativa (ex: "há 2 dias")
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
  return `Há ${Math.floor(diffDays / 365)} anos`;
}

/**
 * Formata número com separador de milhar
 */
export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formata peso em kg
 */
export function formatWeight(kg: number): string {
  return `${formatNumber(kg, 1)} kg`;
}

/**
 * Formata altura em cm
 */
export function formatHeight(cm: number): string {
  const meters = cm / 100;
  return `${formatNumber(meters, 2)} m`;
}

/**
 * Formata calorias
 */
export function formatCalories(kcal: number): string {
  return `${formatNumber(kcal)} kcal`;
}

/**
 * Formata macros em gramas
 */
export function formatMacro(grams: number, label?: string): string {
  const formatted = `${formatNumber(grams)}g`;
  return label ? `${formatted} ${label}` : formatted;
}

/**
 * Formata duração em minutos
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Formata tempo de descanso em segundos
 */
export function formatRestTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Formata IMC com classificação
 */
export function formatIMC(imc: number): { value: string; classification: string } {
  const value = formatNumber(imc, 1);
  let classification = '';
  
  if (imc < 18.5) classification = 'Abaixo do peso';
  else if (imc < 25) classification = 'Peso normal';
  else if (imc < 30) classification = 'Sobrepeso';
  else if (imc < 35) classification = 'Obesidade grau I';
  else if (imc < 40) classification = 'Obesidade grau II';
  else classification = 'Obesidade grau III';
  
  return { value, classification };
}

/**
 * Formata nome do dia da semana
 */
export function formatDiaSemana(dia: number, short = false): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diasShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return short ? diasShort[dia] : dias[dia];
}

/**
 * Obtém as iniciais de um nome
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Trunca texto com ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitaliza a primeira letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formata lista de ingredientes
 */
export function formatIngredientes(ingredientes: string[]): string {
  return ingredientes.join(', ');
}

/**
 * Formata tags como badges
 */
export function formatTags(tags: string[]): string[] {
  const labels: Record<string, string> = {
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
  
  return tags.map((tag) => labels[tag] || capitalize(tag.replace('_', ' ')));
}

