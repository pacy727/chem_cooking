// lib/data/levelBasedOrders.ts
import { CHEMICAL_REACTIONS, ChemicalReaction } from './reactions';

// 客タイプの定義
export type CustomerType = 'normal' | 'rare' | 'super rare' | 'vip';

export interface CustomerTypeConfig {
  name: string;
  molMultiplier: number;
  bonusMultiplier: number;
  probability: number;
  displayName: string;
  emoji: string;
}

export const CUSTOMER_TYPES: Record<CustomerType, CustomerTypeConfig> = {
  'normal': {
    name: 'normal',
    molMultiplier: 1.0,
    bonusMultiplier: 1.0,
    probability: 0.60, // 60%
    displayName: 'Normal客',
    emoji: '👨‍🔬'
  },
  'rare': {
    name: 'rare',
    molMultiplier: 5.0,
    bonusMultiplier: 2.0,
    probability: 0.25, // 25%
    displayName: 'Rare客',
    emoji: '👨‍🔬'
  },
  'super rare': {
    name: 'super rare',
    molMultiplier: 10.0,
    bonusMultiplier: 3.0,
    probability: 0.10, // 10%
    displayName: 'Super Rare客',
    emoji: '👨‍🔬'
  },
  'vip': {
    name: 'vip',
    molMultiplier: 1.0,
    bonusMultiplier: 5.0,
    probability: 0.05, // 5%
    displayName: 'VIP客',
    emoji: '👨‍🔬'
  }
};

export interface LevelBasedOrder {
  level: number;
  reactionId: number;
  targetProduct: string;
  targetMol: number;
  orderText: string;
  specialInstruction?: string; // level2用の材料指定
  reaction: ChemicalReaction;
  bonusMultiplier?: number; // VIPボーナス
  isLegend?: boolean; // VIP客フラグ
  customerType: CustomerType;
  customerComment: string;
}

// 各反応から注文を生成する関数
function createOrderFromReaction(reaction: ChemicalReaction, targetProductIndex: number = 0): any {
  const product = reaction.products[targetProductIndex];
  const productName = getProductDisplayName(product.formula);
  
  // level2（有機化合物燃焼）の場合は材料指定
  if (reaction.level === 2) {
    const organicReactant = reaction.reactants.find(r => 
      ['CH4', 'C2H6', 'C3H8', 'C2H4', 'C2H2', 'C6H6', 'C4H10'].includes(r.formula)
    );
    
    if (organicReactant) {
      const reactantName = getProductDisplayName(organicReactant.formula);
      return {
        reactionId: reaction.id,
        targetProduct: product.formula,
        orderText: `${reactantName}を用いて、${productName}を作ってください`,
        specialInstruction: organicReactant.formula,
        baseAmount: product.coefficient * (0.5 + Math.random() * 1.0), // 0.5-1.5倍
        reaction: reaction
      };
    }
  }
  
  // 通常の注文
  return {
    reactionId: reaction.id,
    targetProduct: product.formula,
    orderText: `${productName}を作ってください`,
    baseAmount: product.coefficient * (0.5 + Math.random() * 1.0), // 0.5-1.5倍
    reaction: reaction
  };
}

// 客タイプをランダムに選択（スキル補正付き）
function selectRandomCustomerType(userData?: any): CustomerType {
  // 口コミ評価スキルによるVIP確率倍率
  const wordOfMouthLevel = userData?.skills?.word_of_mouth || 0;
  const vipMultipliers = [1.0, 1.5, 2.0, 3.0]; // レベル0,1,2,3の倍率
  const vipMultiplier = vipMultipliers[Math.min(wordOfMouthLevel, 3)];
  
  // 動的確率計算
  const baseProbabilities = {
    normal: 0.60,
    rare: 0.25,
    'super rare': 0.10,
    vip: 0.05
  };
  
  // VIP確率を倍率で調整し、Normal確率を調整
  const adjustedVipProb = Math.min(0.30, baseProbabilities.vip * vipMultiplier); // 最大30%まで
  const vipIncrease = adjustedVipProb - baseProbabilities.vip;
  const adjustedNormalProb = Math.max(0.20, baseProbabilities.normal - vipIncrease); // 最低20%は保持
  
  const adjustedProbabilities = {
    normal: adjustedNormalProb,
    rare: baseProbabilities.rare,
    'super rare': baseProbabilities['super rare'],
    vip: adjustedVipProb
  };
  
  // 確率の正規化（合計が1.0になるように調整）
  const totalProb = Object.values(adjustedProbabilities).reduce((sum, prob) => sum + prob, 0);
  Object.keys(adjustedProbabilities).forEach(key => {
    adjustedProbabilities[key as keyof typeof adjustedProbabilities] /= totalProb;
  });
  
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [type, probability] of Object.entries(adjustedProbabilities)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return type as CustomerType;
    }
  }
  
  return 'normal'; // fallback
}

// 客のコメントを生成
function generateCustomerComment(productName: string, customerType: CustomerType): string {
  const comments = {
    'normal': [
      `${productName}のサンプルが欲しいんだ、頼むよ。`,
      `${productName}を調達してもらえる？`,
      `${productName}が必要なんです。`,
      `${productName}を作ってください。`
    ],
    'rare': [
      `${productName}を大量に必要としている！頼む！`,
      `${productName}の大口注文だ。できるかな？`,
      `${productName}をたくさん作ってもらいたい。`,
      `${productName}を大量生産してくれ！`
    ],
    'super rare': [
      `${productName}を超大量に必要だ！！`,
      `${productName}の超特大注文！やってくれるか？`,
      `${productName}を工場レベルで作ってほしい！`,
      `${productName}の超大量生産を頼む！！`
    ],
    'vip': [
      `${productName}の特別注文です。最高品質で。`,
      `${productName}をVIP仕様で調達願います。`,
      `${productName}の特注品をお願いします。`,
      `${productName}を特別に作っていただけますか？`
    ]
  };
  
  const typeComments = comments[customerType];
  return typeComments[Math.floor(Math.random() * typeComments.length)];
}
function getProductDisplayName(formula: string): string {
  const names: Record<string, string> = {
    // Level 1 products
    'H2O': '水',
    'MgO': '酸化マグネシウム',
    'Al2O3': '酸化アルミニウム',
    'NH3': 'アンモニア',
    'ZnCl2': '塩化亜鉛',
    'FeCl2': '塩化鉄(II)',
    'MgCl2': '塩化マグネシウム',
    'AlCl3': '塩化アルミニウム',
    'ZnSO4': '硫酸亜鉛',
    'FeSO4': '硫酸鉄(II)',
    'MgSO4': '硫酸マグネシウム',
    'Al2(SO4)3': '硫酸アルミニウム',
    'CaCl2': '塩化カルシウム',
    'CuO': '酸化銅(II)',
    'Fe2O3': '酸化鉄(III)',
    'HCl': '塩化水素',
    'NaCl': '塩化ナトリウム',
    'H2': '水素',
    
    // Level 2 products
    'CO2': '二酸化炭素',
    
    // Level 3 products
    'Na2SO4': '硫酸ナトリウム',
    'CH3COONa': '酢酸ナトリウム',
    'KNO3': '硝酸カリウム',
    'Ca(NO3)2': '硝酸カルシウム',
    'KCl': '塩化カリウム',
    'K2SO4': '硫酸カリウム',
    'CH3COOK': '酢酸カリウム',
    'CaCO3': '炭酸カルシウム',
    'NH4Cl': '塩化アンモニウム',
    '(NH4)2SO4': '硫酸アンモニウム',
    'Na2S': '硫化ナトリウム',
    'K2S': '硫化カリウム',
    'CaS': '硫化カルシウム',
    'BaS': '硫化バリウム',
    'NH4NO3': '硝酸アンモニウム',
    'CH3COONH4': '酢酸アンモニウム',
    'NH4F': 'フッ化アンモニウム',
    'NaF': 'フッ化ナトリウム',
    'KF': 'フッ化カリウム',
    'CaF2': 'フッ化カルシウム',
    'CaSO4': '硫酸カルシウム',
    
    // Level 4 products
    'MnCl2': '塩化マンガン(II)',
    'Cl2': '塩素',
    'KBr': '臭化カリウム',
    'I2': 'ヨウ素',
    'CuSO4': '硫酸銅(II)',
    'SO2': '二酸化硫黄',
    'Cu(NO3)2': '硝酸銅(II)',
    'NO': '一酸化窒素',
    'NO2': '二酸化窒素',
    'Fe': '鉄',
    'HClO': '次亜塩素酸',
    'P4O10': '五酸化二リン',
    'AgNO3': '硝酸銀',
    
    // Reactants for level 2
    'CH4': 'メタン',
    'C2H6': 'エタン',
    'C3H8': 'プロパン',
    'C2H4': 'エチレン',
    'C2H2': 'アセチレン',
    'C6H6': 'ベンゼン',
    'C4H10': 'ブタン'
  };
  
  return names[formula] || formula;
}

// 全65反応から注文候補を生成
const ALL_POSSIBLE_ORDERS: any[] = [];

// Level 1-4 の全反応から注文を生成
CHEMICAL_REACTIONS.forEach(reaction => {
  // 各生成物について注文を作成
  reaction.products.forEach((product, index) => {
    // 水素ガス(H2)は副生成物として扱うことが多いので、主要生成物のみを対象とする
    if (product.formula === 'H2' && reaction.products.length > 1) return;
    
    const order = createOrderFromReaction(reaction, index);
    if (order) {
      ALL_POSSIBLE_ORDERS.push({
        ...order,
        level: reaction.level
      });
    }
  });
});

// レベルに応じた注文を生成
export function generateLevelBasedOrder(userLevel: number, userData?: any): LevelBasedOrder {
  let availableOrders: any[] = [];
  
  // レベルに応じて利用可能な注文を決定
  if (userLevel >= 1 && userLevel <= 5) {
    availableOrders = ALL_POSSIBLE_ORDERS.filter(order => order.level <= 2);
  } else if (userLevel >= 6 && userLevel <= 10) {
    availableOrders = ALL_POSSIBLE_ORDERS.filter(order => order.level <= 3);
  } else {
    availableOrders = ALL_POSSIBLE_ORDERS.filter(order => order.level <= 4);
  }
  
  // ランダムに注文を選択
  const selectedOrder = availableOrders[Math.floor(Math.random() * availableOrders.length)];
  
  // 客タイプをランダムに選択（スキル補正付き）
  const customerType = selectRandomCustomerType(userData);
  const customerConfig = CUSTOMER_TYPES[customerType];
  
  // キリのいい数値からランダムに選択
  const molOptions = [0.1, 0.2, 0.25, 0.5, 1.0, 1.5, 2.5, 3.0, 5.0];
  const baseMol = molOptions[Math.floor(Math.random() * molOptions.length)];
  
  // 客タイプに応じてmol数を調整
  const targetMol = baseMol * customerConfig.molMultiplier;
  
  // 商品名を取得
  const productName = getProductDisplayName(selectedOrder.targetProduct);
  
  // 客のコメントを生成
  const customerComment = generateCustomerComment(productName, customerType);
  
  return {
    level: selectedOrder.level,
    reactionId: selectedOrder.reactionId,
    targetProduct: selectedOrder.targetProduct,
    targetMol,
    orderText: `${selectedOrder.orderText} (${targetMol} mol)`,
    specialInstruction: selectedOrder.specialInstruction,
    reaction: selectedOrder.reaction,
    customerType,
    customerComment,
    bonusMultiplier: customerConfig.bonusMultiplier
  };
}

// 注文統計情報を取得（デバッグ用）
export function getOrderStatistics() {
  const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  ALL_POSSIBLE_ORDERS.forEach(order => {
    levelCounts[order.level as keyof typeof levelCounts]++;
  });
  
  return {
    total: ALL_POSSIBLE_ORDERS.length,
    byLevel: levelCounts,
    level2WithMaterial: ALL_POSSIBLE_ORDERS.filter(order => 
      order.level === 2 && order.specialInstruction
    ).length
  };
}