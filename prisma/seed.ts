// ============================================================================
// GYM PLAN MCP - Seed do Banco de Dados
// ============================================================================
// Popula o banco de dados com exercícios e refeições padrão
// ============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// EXERCÍCIOS PADRÃO
// ============================================================================

const exercicios = [
  // PEITO
  {
    nome: "Supino Reto com Barra",
    grupoMuscular: "peito",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Deite no banco com os pés no chão. Segure a barra com pegada média, desça até o peito e empurre para cima estendendo os braços.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Supino Inclinado com Halteres",
    grupoMuscular: "peito",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "No banco inclinado a 30-45 graus, segure os halteres acima do peito. Desça controladamente e empurre para cima.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Crucifixo com Halteres",
    grupoMuscular: "peito",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Deitado no banco, braços estendidos para os lados com leve flexão. Junte os halteres acima do peito em arco.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Flexão de Braços",
    grupoMuscular: "peito",
    equipamentoNecessario: "corpo_livre",
    instrucoesDetalhadas:
      "Posição de prancha, mãos na largura dos ombros. Desça o corpo flexionando os cotovelos e empurre de volta.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Crossover no Cabo",
    grupoMuscular: "peito",
    equipamentoNecessario: "cabo",
    instrucoesDetalhadas:
      "Em pé entre as polias altas, puxe os cabos para baixo e para frente, juntando as mãos na frente do corpo.",
    nivelRecomendado: "avancado",
  },

  // COSTAS
  {
    nome: "Puxada Frontal",
    grupoMuscular: "costas",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Sente-se na máquina, pegada aberta na barra. Puxe a barra até o peito contraindo as escápulas.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Remada Curvada com Barra",
    grupoMuscular: "costas",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Em pé, incline o tronco a 45 graus. Puxe a barra em direção ao abdômen contraindo as costas.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Remada Unilateral com Halter",
    grupoMuscular: "costas",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Apoie um joelho e mão no banco. Puxe o halter em direção ao quadril mantendo o cotovelo próximo ao corpo.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Pull-up (Barra Fixa)",
    grupoMuscular: "costas",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Pendure-se na barra com pegada pronada. Puxe o corpo até o queixo ultrapassar a barra.",
    nivelRecomendado: "avancado",
  },
  {
    nome: "Remada no Cabo Sentado",
    grupoMuscular: "costas",
    equipamentoNecessario: "cabo",
    instrucoesDetalhadas:
      "Sentado, pés apoiados. Puxe o cabo em direção ao abdômen mantendo a postura ereta.",
    nivelRecomendado: "iniciante",
  },

  // OMBROS
  {
    nome: "Desenvolvimento com Halteres",
    grupoMuscular: "ombros",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Sentado ou em pé, halteres na altura dos ombros. Empurre para cima estendendo os braços.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Elevação Lateral",
    grupoMuscular: "ombros",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Em pé, braços ao lado do corpo. Eleve os braços lateralmente até a altura dos ombros.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Elevação Frontal",
    grupoMuscular: "ombros",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Em pé, halteres à frente das coxas. Eleve os braços para frente até a altura dos ombros.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Desenvolvimento Arnold",
    grupoMuscular: "ombros",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Inicie com halteres na frente do peito, palmas para dentro. Rotacione e empurre para cima.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Face Pull",
    grupoMuscular: "ombros",
    equipamentoNecessario: "cabo",
    instrucoesDetalhadas:
      "Puxe o cabo em direção ao rosto, separando as mãos e contraindo os deltoides posteriores.",
    nivelRecomendado: "intermediario",
  },

  // BÍCEPS
  {
    nome: "Rosca Direta com Barra",
    grupoMuscular: "biceps",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Em pé, pegada supinada na barra. Flexione os cotovelos elevando a barra até os ombros.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Rosca Alternada com Halteres",
    grupoMuscular: "biceps",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Em pé ou sentado, alterne a flexão dos braços com rotação do punho (supinação).",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Rosca Martelo",
    grupoMuscular: "biceps",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Em pé, pegada neutra (palmas para dentro). Flexione os cotovelos mantendo a pegada.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Rosca Scott",
    grupoMuscular: "biceps",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Apoie os braços no banco Scott. Flexione os cotovelos controladamente.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Rosca Concentrada",
    grupoMuscular: "biceps",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Sentado, apoie o cotovelo na parte interna da coxa. Flexione o braço isolando o bíceps.",
    nivelRecomendado: "intermediario",
  },

  // TRÍCEPS
  {
    nome: "Tríceps Pulley",
    grupoMuscular: "triceps",
    equipamentoNecessario: "cabo",
    instrucoesDetalhadas:
      "Em pé, cotovelos fixos ao lado do corpo. Estenda os braços para baixo contraindo o tríceps.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Tríceps Francês",
    grupoMuscular: "triceps",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Deitado ou sentado, halter acima da cabeça. Flexione os cotovelos e estenda de volta.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Tríceps Testa com Barra",
    grupoMuscular: "triceps",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Deitado, barra acima do peito. Flexione os cotovelos descendo a barra até a testa e estenda.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Mergulho no Banco",
    grupoMuscular: "triceps",
    equipamentoNecessario: "banco",
    instrucoesDetalhadas:
      "Mãos no banco atrás do corpo, pernas estendidas. Flexione os cotovelos e empurre para cima.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Tríceps Coice",
    grupoMuscular: "triceps",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Inclinado, cotovelo fixo ao lado do corpo. Estenda o braço para trás.",
    nivelRecomendado: "iniciante",
  },

  // PERNAS
  {
    nome: "Agachamento Livre",
    grupoMuscular: "pernas",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Barra nas costas, pés na largura dos ombros. Desça flexionando quadris e joelhos, suba contraindo.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Leg Press 45°",
    grupoMuscular: "pernas",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Sentado na máquina, pés na plataforma. Flexione os joelhos e estenda empurrando a plataforma.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Cadeira Extensora",
    grupoMuscular: "pernas",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Sentado, tornozelos sob o rolo. Estenda os joelhos contraindo o quadríceps.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Mesa Flexora",
    grupoMuscular: "pernas",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Deitado de bruços, tornozelos sob o rolo. Flexione os joelhos contraindo os isquiotibiais.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Afundo com Halteres",
    grupoMuscular: "pernas",
    equipamentoNecessario: "halteres",
    instrucoesDetalhadas:
      "Em pé com halteres. Dê um passo à frente, flexione ambos os joelhos e retorne.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Stiff (Levantamento Terra Romeno)",
    grupoMuscular: "pernas",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Em pé, barra à frente das coxas. Incline o tronco mantendo as pernas semi-estendidas.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Panturrilha em Pé",
    grupoMuscular: "pernas",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Na máquina de panturrilha, eleve os calcanhares contraindo os gêmeos.",
    nivelRecomendado: "iniciante",
  },

  // GLÚTEOS
  {
    nome: "Hip Thrust",
    grupoMuscular: "gluteos",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Apoie as costas no banco, barra sobre o quadril. Eleve o quadril contraindo os glúteos.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Glúteo na Polia",
    grupoMuscular: "gluteos",
    equipamentoNecessario: "cabo",
    instrucoesDetalhadas:
      "De frente para a máquina, caneleira na polia. Estenda a perna para trás contraindo o glúteo.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Abdução de Quadril",
    grupoMuscular: "gluteos",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Sentado na máquina, empurre as coxas para fora contraindo os glúteos médios.",
    nivelRecomendado: "iniciante",
  },

  // ABDÔMEN
  {
    nome: "Abdominal Crunch",
    grupoMuscular: "abdomen",
    equipamentoNecessario: "corpo_livre",
    instrucoesDetalhadas:
      "Deitado, joelhos flexionados. Eleve os ombros do solo contraindo o abdômen.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Prancha Isométrica",
    grupoMuscular: "abdomen",
    equipamentoNecessario: "corpo_livre",
    instrucoesDetalhadas:
      "Apoie os antebraços e pontas dos pés no solo. Mantenha o corpo reto e estável.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Abdominal Infra na Barra",
    grupoMuscular: "abdomen",
    equipamentoNecessario: "barra",
    instrucoesDetalhadas:
      "Pendurado na barra, eleve os joelhos em direção ao peito ou as pernas estendidas.",
    nivelRecomendado: "avancado",
  },
  {
    nome: "Russian Twist",
    grupoMuscular: "abdomen",
    equipamentoNecessario: "corpo_livre",
    instrucoesDetalhadas:
      "Sentado, tronco inclinado para trás. Rotacione o tronco de um lado para o outro.",
    nivelRecomendado: "intermediario",
  },

  // CARDIO
  {
    nome: "Esteira (Caminhada/Corrida)",
    grupoMuscular: "cardio",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Caminhe ou corra na esteira mantendo uma intensidade adequada ao seu condicionamento.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Bicicleta Ergométrica",
    grupoMuscular: "cardio",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Pedale mantendo uma cadência constante e resistência adequada.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Elíptico",
    grupoMuscular: "cardio",
    equipamentoNecessario: "maquina",
    instrucoesDetalhadas:
      "Movimente braços e pernas em sincronia no aparelho elíptico.",
    nivelRecomendado: "iniciante",
  },
  {
    nome: "Pular Corda",
    grupoMuscular: "cardio",
    equipamentoNecessario: "nenhum",
    instrucoesDetalhadas:
      "Salte a corda mantendo um ritmo constante, aterrissando suavemente.",
    nivelRecomendado: "intermediario",
  },
  {
    nome: "Burpee",
    grupoMuscular: "corpo_inteiro",
    equipamentoNecessario: "corpo_livre",
    instrucoesDetalhadas:
      "Da posição em pé, agache, coloque as mãos no chão, salte para prancha, faça uma flexão, volte ao agachamento e salte.",
    nivelRecomendado: "avancado",
  },
];

// ============================================================================
// REFEIÇÕES PADRÃO
// ============================================================================

const refeicoes = [
  // CAFÉ DA MANHÃ
  {
    nome: "Ovos Mexidos com Torrada Integral",
    ingredientes: JSON.stringify([
      "2 ovos",
      "2 fatias de pão integral",
      "10g de manteiga",
    ]),
    proteina: 14,
    carboidrato: 24,
    gordura: 15,
    calorias: 283,
    tags: JSON.stringify(["rapido"]),
    preparo: "Mexer os ovos na frigideira com manteiga. Servir com torradas.",
  },
  {
    nome: "Smoothie de Proteína com Banana",
    ingredientes: JSON.stringify([
      "1 banana",
      "30g whey protein",
      "200ml leite desnatado",
      "1 colher de aveia",
    ]),
    proteina: 32,
    carboidrato: 45,
    gordura: 3,
    calorias: 335,
    tags: JSON.stringify(["alta_proteina", "rapido"]),
    preparo: "Bater todos os ingredientes no liquidificador.",
  },
  {
    nome: "Iogurte Grego com Frutas e Granola",
    ingredientes: JSON.stringify([
      "200g iogurte grego natural",
      "50g granola",
      "100g frutas vermelhas",
    ]),
    proteina: 18,
    carboidrato: 42,
    gordura: 8,
    calorias: 312,
    tags: JSON.stringify(["alta_proteina"]),
    preparo: "Montar em uma tigela o iogurte com frutas e granola por cima.",
  },
  {
    nome: "Tapioca com Ovo e Queijo",
    ingredientes: JSON.stringify([
      "30g goma de tapioca",
      "1 ovo",
      "30g queijo coalho",
    ]),
    proteina: 15,
    carboidrato: 26,
    gordura: 12,
    calorias: 268,
    tags: JSON.stringify(["sem_gluten", "rapido"]),
    preparo: "Fazer a tapioca na frigideira, rechear com ovo e queijo.",
  },
  {
    nome: "Overnight Oats",
    ingredientes: JSON.stringify([
      "50g aveia",
      "200ml leite",
      "1 colher mel",
      "30g frutas secas",
    ]),
    proteina: 12,
    carboidrato: 58,
    gordura: 6,
    calorias: 334,
    tags: JSON.stringify(["meal_prep"]),
    preparo: "Misturar ingredientes na noite anterior e deixar na geladeira.",
  },

  // ALMOÇO/JANTAR
  {
    nome: "Frango Grelhado com Arroz e Brócolis",
    ingredientes: JSON.stringify([
      "150g peito de frango",
      "100g arroz integral",
      "100g brócolis",
      "1 colher azeite",
    ]),
    proteina: 42,
    carboidrato: 45,
    gordura: 12,
    calorias: 456,
    tags: JSON.stringify(["alta_proteina", "meal_prep"]),
    preparo:
      "Grelhar o frango temperado. Cozinhar o arroz e o brócolis. Finalizar com azeite.",
  },
  {
    nome: "Salmão com Batata Doce",
    ingredientes: JSON.stringify([
      "150g filé de salmão",
      "200g batata doce",
      "100g aspargos",
      "1 colher azeite",
    ]),
    proteina: 38,
    carboidrato: 52,
    gordura: 18,
    calorias: 522,
    tags: JSON.stringify(["alta_proteina", "sem_gluten"]),
    preparo: "Assar o salmão e a batata. Grelhar os aspargos.",
  },
  {
    nome: "Carne Moída com Purê de Batata",
    ingredientes: JSON.stringify([
      "150g carne moída magra",
      "200g batata",
      "50ml leite",
      "temperos a gosto",
    ]),
    proteina: 35,
    carboidrato: 40,
    gordura: 15,
    calorias: 435,
    tags: JSON.stringify(["alta_proteina"]),
    preparo: "Refogar a carne com temperos. Fazer o purê com batata e leite.",
  },
  {
    nome: "Bowl de Quinoa com Legumes",
    ingredientes: JSON.stringify([
      "80g quinoa",
      "150g legumes variados",
      "100g grão de bico",
      "30g abacate",
    ]),
    proteina: 22,
    carboidrato: 58,
    gordura: 14,
    calorias: 446,
    tags: JSON.stringify(["vegano", "alta_proteina"]),
    preparo: "Cozinhar a quinoa. Saltear os legumes. Montar o bowl.",
  },
  {
    nome: "Omelete de Claras com Espinafre",
    ingredientes: JSON.stringify([
      "4 claras de ovo",
      "50g espinafre",
      "30g queijo cottage",
      "temperos",
    ]),
    proteina: 24,
    carboidrato: 4,
    gordura: 5,
    calorias: 157,
    tags: JSON.stringify(["lowcarb", "baixa_caloria", "rapido"]),
    preparo: "Bater as claras, adicionar espinafre e cottage. Cozinhar na frigideira.",
  },
  {
    nome: "Tilápia Grelhada com Legumes",
    ingredientes: JSON.stringify([
      "200g filé de tilápia",
      "150g legumes grelhados",
      "1 colher azeite",
      "limão",
    ]),
    proteina: 45,
    carboidrato: 12,
    gordura: 8,
    calorias: 300,
    tags: JSON.stringify(["alta_proteina", "baixa_caloria", "sem_gluten"]),
    preparo: "Grelhar a tilápia com limão. Grelhar os legumes com azeite.",
  },
  {
    nome: "Macarrão Integral com Frango",
    ingredientes: JSON.stringify([
      "100g macarrão integral",
      "150g frango desfiado",
      "100g molho de tomate",
      "temperos",
    ]),
    proteina: 38,
    carboidrato: 72,
    gordura: 8,
    calorias: 514,
    tags: JSON.stringify(["alta_proteina", "meal_prep"]),
    preparo: "Cozinhar o macarrão. Misturar com frango e molho.",
  },

  // LANCHES
  {
    nome: "Shake Pós-Treino",
    ingredientes: JSON.stringify([
      "30g whey protein",
      "300ml água",
      "1 banana",
      "20g dextrose",
    ]),
    proteina: 28,
    carboidrato: 48,
    gordura: 2,
    calorias: 322,
    tags: JSON.stringify(["alta_proteina", "rapido"]),
    preparo: "Bater tudo no liquidificador.",
  },
  {
    nome: "Mix de Castanhas",
    ingredientes: JSON.stringify([
      "20g castanha do pará",
      "20g amêndoas",
      "10g nozes",
    ]),
    proteina: 8,
    carboidrato: 6,
    gordura: 28,
    calorias: 308,
    tags: JSON.stringify(["lowcarb", "rapido", "vegano"]),
    preparo: "Misturar as castanhas em um potinho.",
  },
  {
    nome: "Banana com Pasta de Amendoim",
    ingredientes: JSON.stringify(["1 banana", "20g pasta de amendoim"]),
    proteina: 6,
    carboidrato: 30,
    gordura: 10,
    calorias: 230,
    tags: JSON.stringify(["rapido", "vegano"]),
    preparo: "Cortar a banana e cobrir com pasta de amendoim.",
  },
  {
    nome: "Wrap de Frango com Cream Cheese",
    ingredientes: JSON.stringify([
      "1 wrap integral",
      "80g frango desfiado",
      "30g cream cheese light",
      "alface",
    ]),
    proteina: 25,
    carboidrato: 22,
    gordura: 8,
    calorias: 260,
    tags: JSON.stringify(["alta_proteina", "rapido"]),
    preparo: "Espalhar cream cheese no wrap, adicionar frango e alface. Enrolar.",
  },
  {
    nome: "Cottage com Frutas",
    ingredientes: JSON.stringify([
      "150g queijo cottage",
      "100g frutas picadas",
      "1 colher mel",
    ]),
    proteina: 18,
    carboidrato: 20,
    gordura: 5,
    calorias: 197,
    tags: JSON.stringify(["alta_proteina", "rapido"]),
    preparo: "Misturar o cottage com frutas e mel.",
  },
  {
    nome: "Sanduíche Natural de Atum",
    ingredientes: JSON.stringify([
      "2 fatias pão integral",
      "100g atum em água",
      "1 colher maionese light",
      "alface",
      "tomate",
    ]),
    proteina: 28,
    carboidrato: 26,
    gordura: 6,
    calorias: 270,
    tags: JSON.stringify(["alta_proteina", "rapido"]),
    preparo: "Misturar atum com maionese. Montar o sanduíche com vegetais.",
  },

  // OPÇÕES VEGANAS
  {
    nome: "Tofu Grelhado com Quinoa",
    ingredientes: JSON.stringify([
      "150g tofu firme",
      "80g quinoa",
      "100g legumes",
      "molho shoyu",
    ]),
    proteina: 24,
    carboidrato: 42,
    gordura: 12,
    calorias: 372,
    tags: JSON.stringify(["vegano", "alta_proteina", "sem_gluten"]),
    preparo: "Grelhar o tofu com shoyu. Cozinhar quinoa e servir com legumes.",
  },
  {
    nome: "Hambúrguer de Lentilha",
    ingredientes: JSON.stringify([
      "100g lentilha cozida",
      "30g aveia",
      "temperos",
      "1 pão integral",
    ]),
    proteina: 18,
    carboidrato: 52,
    gordura: 4,
    calorias: 316,
    tags: JSON.stringify(["vegano", "alta_proteina"]),
    preparo: "Processar lentilha com aveia, moldar e grelhar.",
  },
  {
    nome: "Buddha Bowl",
    ingredientes: JSON.stringify([
      "100g grão de bico",
      "50g edamame",
      "100g legumes",
      "tahine",
    ]),
    proteina: 20,
    carboidrato: 38,
    gordura: 14,
    calorias: 358,
    tags: JSON.stringify(["vegano", "alta_proteina", "sem_gluten"]),
    preparo: "Montar todos os ingredientes em um bowl e regar com tahine.",
  },
];

// ============================================================================
// FUNÇÃO DE SEED
// ============================================================================

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // Limpa dados existentes
  console.log("🗑️  Limpando dados existentes...");
  await prisma.sessionExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workoutPlanExercise.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.mealPlanMeal.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  // Insere exercícios
  console.log("💪 Inserindo exercícios...");
  for (const exercicio of exercicios) {
    await prisma.exercise.create({ data: exercicio });
  }
  console.log(`   ✅ ${exercicios.length} exercícios inseridos`);

  // Insere refeições
  console.log("🍽️  Inserindo refeições...");
  for (const refeicao of refeicoes) {
    await prisma.meal.create({ data: refeicao });
  }
  console.log(`   ✅ ${refeicoes.length} refeições inseridas`);

  // Cria um usuário de exemplo
  console.log("👤 Criando usuário de exemplo...");
  const user = await prisma.user.create({
    data: {
      nome: "João Silva",
      idade: 28,
      peso: 75,
      altura: 178,
      objetivoFisico: "hipertrofia",
      restricoesAlimentares: JSON.stringify([]),
      nivelExperiencia: "intermediario",
    },
  });
  console.log(`   ✅ Usuário criado: ${user.nome} (${user.id})`);

  console.log("\n✨ Seed concluído com sucesso!");
  console.log("\n📊 Resumo:");
  console.log(`   - ${exercicios.length} exercícios`);
  console.log(`   - ${refeicoes.length} refeições`);
  console.log(`   - 1 usuário de exemplo`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

