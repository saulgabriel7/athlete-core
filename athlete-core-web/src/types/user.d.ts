/**
 * ATHLETE CORE - Tipos de Usuário
 */

export interface User {
  id: string;
  nome: string;
  idade: number;
  peso: number;
  altura: number;
  objetivoFisico: 'hipertrofia' | 'emagrecimento' | 'condicionamento' | 'performance';
  restricoesAlimentares: string[];
  nivelExperiencia: 'iniciante' | 'intermediario' | 'avancado';
  createdAt: string;
  updatedAt: string;
  
  // Campos calculados
  imc?: number;
  classificacaoIMC?: string;
  aguaDiaria?: number;
  planoNutricional?: {
    tmb: number;
    tdee: number;
    metaCalorica: number;
    macros: {
      proteina: number;
      carboidrato: number;
      gordura: number;
      calorias: number;
    };
  };
}

export interface UserStats {
  totalTreinos: number;
  totalExercicios: number;
  mediaPerformance: number;
  ultimoTreino: string | null;
  diasConsecutivos: number;
}

export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  emailAddresses: { emailAddress: string }[];
}

