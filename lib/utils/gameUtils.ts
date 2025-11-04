// lib/utils/gameUtils.ts

import { UserData, ReactionResult, Recipe, Order } from '../types';
import { INGREDIENTS, SKILL_COST_REDUCTION, SKILL_RECOVERY_CHANCE, SKILL_FORGIVENESS_CHANCE, SKILL_EXP_MULTIPLIER } from '../data/gameData';

// ユーザーデータ管理
export function createDefaultUserData(storeName: string, chefName: string): UserData {
  return {
    storeName,
    chefName,
    level: 1,
    exp: 0,
    money: 5000,
    totalSales: 0,
    rank: 'apprentice',
    skills: {
      cost_reduction: 0,
      material_recovery: 0,
      failure_forgiveness: 0,
      exp_multiplier: 0
    },
    skillPoints: 0,
    achievements: [],
    lastPlayed: new Date().toISOString()
  };
}

export function saveUserData(userData: UserData): void {
  if (typeof window === 'undefined') return;
  
  userData.lastPlayed = new Date().toISOString();
  const users = JSON.parse(localStorage.getItem('chemKitchenUsers') || '{}');
  const key = `${userData.storeName}_${userData.chefName}`;
  users[key] = userData;
  localStorage.setItem('chemKitchenUsers', JSON.stringify(users));
}

export function loadUserData(storeName: string, chefName: string): UserData | null {
  if (typeof window === 'undefined') return null;
  
  const users = JSON.parse(localStorage.getItem('chemKitchenUsers') || '{}');
  const key = `${storeName}_${chefName}`;
  return users[key] || null;
}

export function userExists(storeName: string, chefName: string): boolean {
  return loadUserData(storeName, chefName) !== null;
}

// レベル・経験値管理
export function getExpForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

export function calculateLevelUp(userData: UserData, expGain: number): { leveledUp: boolean; newLevel: number; skillPointsGained: number } {
  const expMultiplier = SKILL_EXP_MULTIPLIER[userData.skills.exp_multiplier] || 1.0;
  const actualExp = Math.floor(expGain * expMultiplier);
  
  userData.exp += actualExp;
  let leveledUp = false;
  let skillPointsGained = 0;
  
  while (userData.exp >= getExpForLevel(userData.level)) {
    userData.exp -= getExpForLevel(userData.level);
    userData.level++;
    skillPointsGained += 2;
    leveledUp = true;
  }
  
  userData.skillPoints += skillPointsGained;
  return { leveledUp, newLevel: userData.level, skillPointsGained };
}

// ランク計算
export function calculateRank(level: number, totalSales: number): UserData['rank'] {
  if (level >= 20 && totalSales >= 100000) return 'legend';
  if (level >= 15 && totalSales >= 50000) return 'master';
  if (level >= 10 && totalSales >= 20000) return 'expert';
  if (level >= 5 && totalSales >= 5000) return 'intermediate';
  return 'apprentice';
}

// 化学反応計算
export function calculateReaction(
  potContents: Record<string, number>,
  recipe: Recipe,
  order: Order,
  userData: UserData | null
): ReactionResult {
  const tolerance = 0.01;
  const requiredReactants = recipe.reactants;
  const missingIngredients: string[] = [];
  let limitingMol = Infinity;
  
  // 制限試薬の特定
  for (const [formula, required] of Object.entries(requiredReactants)) {
    const available = potContents[formula] || 0;
    
    if (available < tolerance) {
      missingIngredients.push(formula);
      continue;
    }
    
    const possibleMol = available / required;
    if (possibleMol < limitingMol) {
      limitingMol = possibleMol;
    }
  }
  
  if (missingIngredients.length > 0) {
    return {
      success: false,
      code: 'MISSING_STUFF',
      bonusRate: 0,
      totalCost: 0,
      missing: missingIngredients
    };
  }
  
  // 余剰材料のチェック
  let hasExcess = false;
  let maxExcess = { name: '', mols: 0 };
  
  for (const [formula, available] of Object.entries(potContents)) {
    const required = requiredReactants[formula] || 0;
    const used = required * limitingMol;
    const excess = available - used;
    
    if (excess > tolerance) {
      hasExcess = true;
      const ingredient = INGREDIENTS[formula];
      if (excess > maxExcess.mols) {
        maxExcess = { name: ingredient.name, mols: excess };
      }
    }
  }
  
  // 間違った材料のチェック
  const wrongIngredients: string[] = [];
  for (const formula of Object.keys(potContents)) {
    if (!requiredReactants[formula]) {
      wrongIngredients.push(formula);
    }
  }
  
  if (wrongIngredients.length > 0) {
    const extras = handleSpecialReactions(potContents);
    return {
      success: false,
      code: 'WRONG_STUFF',
      bonusRate: 0,
      totalCost: 0,
      wrong: wrongIngredients,
      extras
    };
  }
  
  // 生成物の計算
  const productMols = limitingMol;
  const product = {
    name: recipe.product.name,
    mols: productMols
  };
  
  // 材料費回収計算
  let totalCost = 0;
  if (userData) {
    const recoveryLevel = userData.skills.material_recovery;
    const recoveryChance = SKILL_RECOVERY_CHANCE[recoveryLevel] || 0;
    
    for (const [formula, required] of Object.entries(requiredReactants)) {
      const used = required * limitingMol;
      const ingredient = INGREDIENTS[formula];
      
      let price = ingredient.price;
      if (userData) {
        const reductionRate = SKILL_COST_REDUCTION[userData.skills.cost_reduction] || 0;
        price *= (1 - reductionRate);
      }
      
      if (Math.random() < recoveryChance) {
        totalCost += price * used * 0.3;
      }
    }
  }
  
  if (hasExcess) {
    return {
      success: false,
      code: 'EXCESS_MATERIAL',
      product,
      excess: maxExcess,
      bonusRate: 0,
      totalCost
    };
  }
  
  // 成功 - 注文量との比較
  const targetMol = order.targetMol;
  const difference = Math.abs(productMols - targetMol);
  
  let bonusRate = 0;
  let resultCode = '';
  
  if (difference <= tolerance) {
    bonusRate = 1.0;
    resultCode = 'PERFECT';
  } else if (difference <= targetMol * 0.1) {
    bonusRate = 0.8;
    resultCode = 'EXCESS_SLIGHT';
  } else if (difference <= targetMol * 0.3) {
    bonusRate = 0.5;
    resultCode = 'EXCESS_LARGE';
  } else {
    bonusRate = 0;
    resultCode = 'EXCESS_TOO_MUCH';
  }
  
  return {
    success: bonusRate > 0,
    code: resultCode,
    product,
    bonusRate,
    totalCost
  };
}

function handleSpecialReactions(potContents: Record<string, number>) {
  const extras: Array<{ name: string; mols: number }> = [];
  
  // 鉄と塩酸の反応: Fe + 2HCl → FeCl₂ + H₂
  const fe = potContents['Fe'] || 0;
  const hcl = potContents['HCl'] || 0;
  
  if (fe > 0 && hcl > 0) {
    const mol = Math.min(fe, hcl / 2);
    extras.push({ name: 'FeCl₂ (塩化鉄)', mols: mol });
    extras.push({ name: 'H₂ (水素ガス)', mols: mol });
  }
  
  // カルシウムと塩酸の反応: Ca + 2HCl → CaCl₂ + H₂
  const ca = potContents['Ca'] || 0;
  
  if (ca > 0 && hcl > 0) {
    const mol = Math.min(ca, hcl / 2);
    extras.push({ name: 'CaCl₂ (塩化カルシウム)', mols: mol });
    extras.push({ name: 'H₂ (水素ガス)', mols: mol });
  }
  
  return extras;
}

// 材料費計算（スキル効果適用）
export function calculateIngredientCost(formula: string, amount: number, userData: UserData | null): number {
  const ingredient = INGREDIENTS[formula];
  let cost = ingredient.price * amount;
  
  if (userData) {
    const reductionRate = SKILL_COST_REDUCTION[userData.skills.cost_reduction] || 0;
    cost *= (1 - reductionRate);
  }
  
  return cost;
}

// 材料サルベージ判定
export function attemptSalvage(formula: string, amount: number, userData: UserData | null): { success: boolean; recoveredAmount: number } {
  let recoveryChance = 0.5; // 基本50%
  
  if (userData) {
    const skillLevel = userData.skills.material_recovery;
    recoveryChance = SKILL_RECOVERY_CHANCE[skillLevel] || 0.5;
  }
  
  const success = Math.random() < recoveryChance;
  const recoveredAmount = success ? calculateIngredientCost(formula, amount, userData) * 0.7 : 0;
  
  return { success, recoveredAmount };
}

// 失敗許容判定
export function checkFailureForgiveness(userData: UserData | null): boolean {
  if (!userData) return false;
  
  const forgivenessLevel = userData.skills.failure_forgiveness;
  const forgivenessChance = SKILL_FORGIVENESS_CHANCE[forgivenessLevel] || 0;
  
  return Math.random() < forgivenessChance;
}
