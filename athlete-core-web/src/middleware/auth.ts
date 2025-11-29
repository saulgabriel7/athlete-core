/**
 * ATHLETE CORE - Middleware de Autenticação
 * Protege rotas que requerem autenticação via Clerk
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

/**
 * Rotas que requerem autenticação
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/treino(.*)',
  '/alimentacao(.*)',
  '/perfil(.*)',
]);

/**
 * Middleware Clerk com proteção de rotas
 */
export const onRequest = clerkMiddleware((auth, context) => {
  const { userId } = auth();
  
  // Se a rota é protegida e usuário não está autenticado
  if (isProtectedRoute(context.request) && !userId) {
    // Redireciona para sign-in
    return context.redirect('/sign-in');
  }
});

