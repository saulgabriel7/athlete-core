// ============================================================================
// GYM PLAN MCP - Validadores
// ============================================================================
// Funções utilitárias para validação de dados usando Zod
// ============================================================================

import { z, ZodError, ZodSchema } from "zod";
import type { MCPResponse } from "../types/index.js";

/**
 * Resultado de validação
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Valida dados usando um schema Zod
 * @param schema Schema Zod para validação
 * @param data Dados a serem validados
 * @returns Resultado da validação com dados tipados ou erros
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      success: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ["Erro de validação desconhecido"],
    };
  }
}

/**
 * Valida dados e retorna resposta formatada para MCP
 * @param schema Schema Zod para validação
 * @param data Dados a serem validados
 * @returns Resposta MCP formatada
 */
export function validateForMCP<T>(
  schema: ZodSchema<T>,
  data: unknown
): MCPResponse<T> {
  const result = validate(schema, data);
  
  if (result.success && result.data !== undefined) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    error: "Erro de validação",
    details: result.errors,
  };
}

/**
 * Valida um UUID
 * @param id String a ser validada como UUID
 * @returns true se for um UUID válido
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Valida se uma string é um JSON válido
 * @param str String a ser validada
 * @returns true se for JSON válido
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converte array para string JSON (para armazenamento no SQLite)
 * @param arr Array a ser convertido
 * @returns String JSON
 */
export function arrayToJSON<T>(arr: T[]): string {
  return JSON.stringify(arr);
}

/**
 * Converte string JSON para array
 * @param str String JSON
 * @returns Array tipado ou array vazio se inválido
 */
export function jsonToArray<T>(str: string | null | undefined): T[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Valida se um email é válido
 * @param email String do email
 * @returns true se for email válido
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * Valida se uma URL é válida
 * @param url String da URL
 * @returns true se for URL válida
 */
export function isValidURL(url: string): boolean {
  const urlSchema = z.string().url();
  return urlSchema.safeParse(url).success;
}

/**
 * Sanitiza uma string removendo caracteres especiais
 * @param str String a ser sanitizada
 * @returns String sanitizada
 */
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove < e >
    .replace(/\s+/g, " "); // Normaliza espaços
}

/**
 * Valida se um número está dentro de um range
 * @param value Valor a ser validado
 * @param min Valor mínimo
 * @param max Valor máximo
 * @returns true se estiver no range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida parâmetros obrigatórios de um objeto
 * @param obj Objeto a ser validado
 * @param requiredKeys Chaves obrigatórias
 * @returns Array de chaves faltantes ou null se válido
 */
export function getMissingRequiredKeys(
  obj: Record<string, unknown>,
  requiredKeys: string[]
): string[] | null {
  const missing = requiredKeys.filter(
    (key) => obj[key] === undefined || obj[key] === null
  );
  return missing.length > 0 ? missing : null;
}

/**
 * Schema para validação de parâmetros de paginação
 */
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Schema para validação de filtros genéricos
 */
export const FilterSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
export type Filter = z.infer<typeof FilterSchema>;

/**
 * Combina schemas de paginação e filtro
 */
export const QueryParamsSchema = PaginationSchema.merge(FilterSchema);
export type QueryParams = z.infer<typeof QueryParamsSchema>;

