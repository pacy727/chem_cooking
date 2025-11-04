// lib/types/index.ts

export interface Ingredient {
  name: string;
  price: number;
  category: 'metal' | 'acid' | 'base' | 'salt' | 'gas' | 'organic' | 'other';
  description: string;
}

export interface Recipe {
  name: string;
  emoji: string;
  product: {
    name: string;
    emoji: string;
  };
  reactants: Record<string, number>;
  description: string;
}

export interface Customer {
  name: string;
  avatar: string;
  order: string;
  personality: string;
}

export interface UserData {
  storeName: string;
  chefName: string;
  level: number;
  exp: number;
  money: number;
  totalSales: number;
  rank: 'apprentice' | 'intermediate' | 'expert' | 'master' | 'legend';
  skills: {
    cost_reduction: number;
    material_recovery: number;
    failure_forgiveness: number;
    exp_multiplier: number;
  };
  skillPoints: number;
  achievements: string[];
  lastPlayed: string;
}

export interface Order {
  customer: Customer;
  targetMol: number;
  recipe: Recipe;
  bonusMultiplier: number;
  isLegend: boolean;
}

export interface ReactionResult {
  success: boolean;
  code: string;
  product?: {
    name: string;
    mols: number;
  };
  bonusRate: number;
  totalCost: number;
  excess?: {
    name: string;
    mols: number;
  };
  extras?: Array<{
    name: string;
    mols: number;
  }>;
  missing?: string[];
  wrong?: string[];
}

export type FilterCategory = 'all' | 'metal' | 'acid' | 'base' | 'salt' | 'gas' | 'organic' | 'other';

export type GameScreen = 'login' | 'home' | 'game';
