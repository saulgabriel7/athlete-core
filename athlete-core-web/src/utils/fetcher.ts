/**
 * ATHLETE CORE - Fetcher
 * Funções utilitárias para requisições HTTP
 */

import type { ApiResponse } from '../types/api';

/**
 * Opções de requisição
 */
interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Faz uma requisição HTTP com timeout
 */
export async function fetcher<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Requisição timeout - servidor não respondeu a tempo',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Erro desconhecido na requisição',
    };
  }
}

/**
 * Faz uma requisição GET
 */
export async function get<T>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
  return fetcher<T>(url, { ...options, method: 'GET' });
}

/**
 * Faz uma requisição POST
 */
export async function post<T>(
  url: string,
  body: unknown,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return fetcher<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Faz uma requisição PUT
 */
export async function put<T>(
  url: string,
  body: unknown,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  return fetcher<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Faz uma requisição DELETE
 */
export async function del<T>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
  return fetcher<T>(url, { ...options, method: 'DELETE' });
}

