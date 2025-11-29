import type { APIRoute } from 'astro';
import { createUser, updateUser } from '../../services/mcpClient';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { id, ...userData } = data;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID is required' }), {
        status: 400,
      });
    }

    // Verifica se é update ou create (se já existir ID no banco seria update, mas vamos tentar update primeiro)
    // Como o MCP separa create/update, vamos assumir update se tiver ID válido do banco
    
    // Nota: Na prática, deveríamos checar se o usuário existe. 
    // Como simplificação, vamos tentar update.
    const response = await updateUser({ id, ...userData });
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal Error' }), {
      status: 500,
    });
  }
}

