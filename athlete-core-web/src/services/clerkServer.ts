/**
 * ATHLETE CORE - Clerk Server
 * Funções server-side para integração com Clerk
 */

import type { ClerkUser } from '../types/user';

/**
 * Obtém o usuário atual da sessão Clerk
 * Deve ser chamado apenas no servidor (Astro)
 */
export async function getCurrentUser(locals: App.Locals): Promise<ClerkUser | null> {
  try {
    const auth = locals.auth();
    
    if (!auth.userId) {
      return null;
    }

    // Obtém dados do usuário do Clerk
    const user = await locals.currentUser();
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      emailAddresses: user.emailAddresses.map((e) => ({
        emailAddress: e.emailAddress,
      })),
    };
  } catch (error) {
    console.error('[Clerk] Erro ao obter usuário:', error);
    return null;
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(locals: App.Locals): boolean {
  try {
    const auth = locals.auth();
    return !!auth.userId;
  } catch {
    return false;
  }
}

/**
 * Obtém o ID do usuário atual mapeado para o banco MCP
 * Por enquanto retorna o user de demonstração
 * TODO: Implementar sincronização real Clerk <-> MCP
 */
export function getUserId(locals: App.Locals): string | null {
  try {
    const auth = locals.auth();
    if (!auth.userId) {
      return null;
    }
    // Mapeia o Clerk ID para o ID do usuário no banco MCP
    // Por enquanto, usa o usuário de demonstração
    return '2219d3a8-0b48-472a-b0e3-fd603d95336d';
  } catch {
    return null;
  }
}

/**
 * Redireciona para login se não autenticado
 */
export function requireAuth(locals: App.Locals, redirect: (url: string) => Response): Response | null {
  if (!isAuthenticated(locals)) {
    return redirect('/sign-in');
  }
  return null;
}

