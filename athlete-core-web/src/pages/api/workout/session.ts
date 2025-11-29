import type { APIRoute } from 'astro';
import { createWorkoutSession } from '../../../services/mcpClient';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validação básica
    if (!data.userId || !data.exercises) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid data' }), {
        status: 400,
      });
    }

    const response = await createWorkoutSession(data);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: 'Internal Error' }), {
      status: 500,
    });
  }
}

