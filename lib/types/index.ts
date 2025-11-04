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
    cost_reduction: number;        // 仕入れ上手：材料費削減
    recipe_discount: number;       // レシピ研究：レシピ購入費削減
    hospitality: number;          // おもてなし：成功時ボーナス倍率
    chef_personality: number;     // シェフの人柄：失敗時再挑戦率
    word_of_mouth: number;        // 口コミ評価：VIP客来店率
    salvage: number;              // サルベージ：材料回収返金率
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