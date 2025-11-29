import type { APIRoute } from 'astro';
import { getUser, getWorkoutPlans, getMealPlan, getExercises } from '../../../services/mcpClient';

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
// Usando Gemini 2.0 Flash (modelo mais recente disponível)
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

// System prompt que define o comportamento do assistente
const SYSTEM_PROMPT = `Você é o **ATHLETE CORE AI**, um assistente de fitness e nutrição integrado ao app ATHLETE CORE.

## Suas Capacidades:
- Criar e sugerir planos de treino personalizados
- Orientar sobre nutrição e dietas
- Explicar exercícios e técnicas corretas
- Motivar e acompanhar o progresso do usuário
- Responder dúvidas sobre fitness, musculação e saúde

## Regras:
1. Seja conciso e direto nas respostas
2. Use emojis moderadamente para tornar as respostas mais amigáveis
3. Sempre considere o contexto do usuário (objetivo, nível, dados físicos)
4. Para criar treinos, sugira exercícios específicos com séries, repetições e descanso
5. Para nutrição, considere as restrições alimentares do usuário
6. Nunca dê conselhos médicos - sempre recomende consultar um profissional
7. Responda em português brasileiro

## Formato de Treino (quando solicitado):
**Nome do Exercício**
- Séries: X
- Repetições: X-X
- Descanso: Xs
- Dica: (técnica importante)

## Formato de Refeição (quando solicitado):
**Nome da Refeição**
- Ingredientes: lista
- Macros: Xg proteína, Xg carbo, Xg gordura
- Calorias: ~X kcal`;

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const POST: APIRoute = async ({ request }) => {
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'GEMINI_API_KEY não configurada' 
    }), { status: 500 });
  }

  try {
    const { message, history, userId } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Mensagem é obrigatória' 
      }), { status: 400 });
    }

    // Busca contexto do usuário se disponível
    let userContext = '';
    if (userId) {
      try {
        const [userRes, workoutsRes, mealsRes] = await Promise.all([
          getUser(userId),
          getWorkoutPlans(userId),
          getMealPlan(userId)
        ]);

        if (userRes.success && userRes.data) {
          const user = userRes.data;
          userContext = `
## Contexto do Usuário Atual:
- Nome: ${user.nome}
- Idade: ${user.idade} anos
- Peso: ${user.peso}kg
- Altura: ${user.altura}cm
- Objetivo: ${user.objetivoFisico}
- Nível: ${user.nivelExperiencia}
- IMC: ${user.imc?.toFixed(1) || 'N/A'}
- TMB: ${user.tmb?.toFixed(0) || 'N/A'} kcal
${user.restricoesAlimentares?.length ? `- Restrições: ${user.restricoesAlimentares.join(', ')}` : ''}
`;
        }

        if (workoutsRes.success && workoutsRes.data?.length > 0) {
          userContext += `\n- Treinos ativos: ${workoutsRes.data.length}`;
          const ativo = workoutsRes.data.find(w => w.ativo);
          if (ativo) {
            userContext += `\n- Plano atual: "${ativo.nome}"`;
          }
        }

        if (mealsRes.success && mealsRes.data?.length > 0) {
          const ativo = mealsRes.data[0];
          userContext += `\n- Meta calórica: ${ativo.metaCalorica} kcal`;
          userContext += `\n- Meta proteína: ${ativo.metaProteina}g`;
        }
      } catch (e) {
        // Silently fail - contexto é opcional
      }
    }

    // Monta o histórico de conversa para o Gemini
    const contents: ChatMessage[] = [];

    // Adiciona system prompt como primeira mensagem do modelo
    contents.push({
      role: 'user',
      parts: [{ text: 'Iniciar conversa' }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: `${SYSTEM_PROMPT}${userContext}\n\nOlá! 👋 Sou o assistente do ATHLETE CORE. Como posso ajudar você hoje?` }]
    });

    // Adiciona histórico da conversa
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Adiciona a mensagem atual
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Chama a API do Gemini
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Erro ao chamar Gemini API' 
      }), { status: 500 });
    }

    const data = await response.json();
    
    // Extrai a resposta do Gemini
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Desculpe, não consegui processar sua mensagem.';

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }), { status: 500 });
  }
};

