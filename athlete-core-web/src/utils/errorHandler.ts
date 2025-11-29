/**
 * ATHLETE CORE - Error Handler
 * Funções de tratamento de erros
 */

import type { ApiResponse, ApiErrorResponse } from '../types/api';

/**
 * Verifica se a resposta é um erro
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Extrai mensagem de erro de uma resposta da API
 */
export function getErrorMessage(response: ApiErrorResponse): string {
  if (response.details && Array.isArray(response.details)) {
    return response.details.join(', ');
  }
  return response.error || 'Erro desconhecido';
}

/**
 * Mensagens de erro amigáveis
 */
const errorMessages: Record<string, string> = {
  'Failed to fetch': 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  'Network Error': 'Erro de rede. Verifique sua conexão com a internet.',
  'timeout': 'O servidor demorou muito para responder. Tente novamente.',
  'Unauthorized': 'Você não tem permissão para acessar este recurso.',
  'Not Found': 'O recurso solicitado não foi encontrado.',
  'Internal Server Error': 'Erro interno do servidor. Tente novamente mais tarde.',
};

/**
 * Converte erro técnico em mensagem amigável
 */
export function friendlyError(error: string): string {
  for (const [key, message] of Object.entries(errorMessages)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  return error;
}

/**
 * Classe de erro customizada para API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Loga erro no console (apenas em desenvolvimento)
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[ATHLETE CORE${context ? ` - ${context}` : ''}]`, error);
  }
}

/**
 * Trata resposta da API e lança erro se necessário
 */
export function handleApiResponse<T>(response: ApiResponse<T>, context?: string): T {
  if (isApiError(response)) {
    const message = getErrorMessage(response);
    logError(message, context);
    throw new ApiError(message, undefined, response.details);
  }
  return response.data;
}

/**
 * Wrapper para try/catch em funções assíncronas
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}

