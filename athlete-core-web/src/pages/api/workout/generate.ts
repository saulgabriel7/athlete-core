import type { APIRoute } from 'astro';
import { generateWorkoutPlan } from '../../../services/mcpClient';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { userId, diasPorSemana } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'User ID is required' }), {
        status: 400,
      });
    }

    const response = await generateWorkoutPlan(userId, diasPorSemana || 4);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal Error' }), {
      status: 500,
    });
  }
}

