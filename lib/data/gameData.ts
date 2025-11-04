// lib/data/gameData.ts

import { Ingredient, Recipe, Customer } from '../types';

export const INGREDIENTS: Record<string, Ingredient> = {
  // 金属類
  'Fe': { name: 'Fe (鉄)', price: 100, category: 'metal', description: '錆びやすい金属。多くの反応に使用される。' },
  'Cu': { name: 'Cu (銅)', price: 120, category: 'metal', description: '赤茶色の金属。導電性が高い。' },
  'Zn': { name: 'Zn (亜鉛)', price: 110, category: 'metal', description: '亜鉛メッキに使われる金属。' },
  'Al': { name: 'Al (アルミニウム)', price: 90, category: 'metal', description: '軽量で錆びにくい金属。' },
  'Mg': { name: 'Mg (マグネシウム)', price: 130, category: 'metal', description: '軽くて燃えやすい金属。' },
  'Ca': { name: 'Ca (カルシウム)', price: 80, category: 'metal', description: '骨や歯の成分。アルカリ土類金属。' },
  'Na': { name: 'Na (ナトリウム)', price: 140, category: 'metal', description: '水と激しく反応するアルカリ金属。' },
  
  // 酸類
  'HCl': { name: 'HCl (塩酸)', price: 50, category: 'acid', description: '強酸の代表。胃酸の主成分でもある。' },
  'H2SO4': { name: 'H₂SO₄ (硫酸)', price: 60, category: 'acid', description: '最も重要な工業用酸。' },
  'HNO3': { name: 'HNO₃ (硝酸)', price: 70, category: 'acid', description: '強い酸化力を持つ酸。' },
  'CH3COOH': { name: 'CH₃COOH (酢酸)', price: 40, category: 'acid', description: '食酢の主成分。弱い酸。' },
  
  // 塩基類
  'NaOH': { name: 'NaOH (水酸化ナトリウム)', price: 45, category: 'base', description: '苛性ソーダとも呼ばれる強塩基。' },
  'Ca(OH)2': { name: 'Ca(OH)₂ (消石灰)', price: 35, category: 'base', description: '建築材料としても使われる塩基。' },
  'NH3': { name: 'NH₃ (アンモニア)', price: 55, category: 'base', description: '特有の刺激臭を持つ塩基性気体。' },
  
  // 塩類
  'NaCl': { name: 'NaCl (塩化ナトリウム)', price: 20, category: 'salt', description: '食塩。最も身近な塩。' },
  'CaCl2': { name: 'CaCl₂ (塩化カルシウム)', price: 30, category: 'salt', description: '除湿剤や融雪剤として使用。' },
  'MgSO4': { name: 'MgSO₄ (硫酸マグネシウム)', price: 40, category: 'salt', description: 'エプソム塩とも呼ばれる。' },
  
  // 気体類
  'O2': { name: 'O₂ (酸素)', price: 25, category: 'gas', description: '生命維持に必要な気体。燃焼を助ける。' },
  'H2': { name: 'H₂ (水素)', price: 30, category: 'gas', description: '最も軽い気体。燃料として有望。' },
  'CO2': { name: 'CO₂ (二酸化炭素)', price: 15, category: 'gas', description: '温室効果ガス。ドライアイスの原料。' },
  'Cl2': { name: 'Cl₂ (塩素)', price: 35, category: 'gas', description: '黄緑色の有毒気体。消毒に使用。' },
  
  // 有機化合物
  'C2H5OH': { name: 'C₂H₅OH (エタノール)', price: 80, category: 'organic', description: 'アルコール飲料の主成分。' },
  'CH4': { name: 'CH₄ (メタン)', price: 20, category: 'organic', description: '天然ガスの主成分。温室効果ガス。' },
  'C6H12O6': { name: 'C₆H₁₂O₆ (グルコース)', price: 60, category: 'organic', description: 'ブドウ糖。生物のエネルギー源。' },
  
  // その他
  'H2O': { name: 'H₂O (水)', price: 5, category: 'other', description: '生命の源。最も身近な化合物。' },
  'NaHCO3': { name: 'NaHCO₃ (重曹)', price: 25, category: 'other', description: '料理や掃除に使える万能化合物。' },
  'I2': { name: 'I₂ (ヨウ素)', price: 90, category: 'other', description: '紫色の固体。消毒薬として使用。' }
};

export const RECIPES: Record<string, Recipe> = {
  'cola': {
    name: 'コーラ',
    emoji: '🥤',
    product: { name: 'C₁₂H₂₂O₁₁ (コーラ)', emoji: '🥤' },
    reactants: {
      'CO2': 2,
      'C6H12O6': 1,
      'H2O': 5
    },
    description: '二酸化炭素と糖類を水に溶かした清涼飲料水'
  },
  'salt_water': {
    name: '塩水',
    emoji: '🧂',
    product: { name: 'NaCl・H₂O (塩水)', emoji: '🧂' },
    reactants: {
      'NaCl': 1,
      'H2O': 3
    },
    description: '塩化ナトリウムを水に溶解した溶液'
  },
  'soap': {
    name: '石鹸',
    emoji: '🧼',
    product: { name: 'NaOH・C₁₈H₃₆O₂ (石鹸)', emoji: '🧼' },
    reactants: {
      'NaOH': 3,
      'C2H5OH': 2,
      'H2O': 1
    },
    description: '水酸化ナトリウムと油脂から作られる界面活性剤'
  },
  'wine': {
    name: 'ワイン',
    emoji: '🍷',
    product: { name: 'C₂H₅OH・H₂O (ワイン)', emoji: '🍷' },
    reactants: {
      'C6H12O6': 1,
      'H2O': 2
    },
    description: 'ブドウ糖の発酵により生成されるアルコール飲料'
  },
  'vinegar': {
    name: 'お酢',
    emoji: '🫗',
    product: { name: 'CH₃COOH・H₂O (酢)', emoji: '🫗' },
    reactants: {
      'CH3COOH': 1,
      'H2O': 4
    },
    description: '酢酸を水で希釈した調味料'
  },
  'rust': {
    name: '錆',
    emoji: '🟤',
    product: { name: 'Fe₂O₃ (酸化鉄)', emoji: '🟤' },
    reactants: {
      'Fe': 4,
      'O2': 3
    },
    description: '鉄の酸化により生成される赤褐色の化合物'
  },
  'brass': {
    name: '真鍮',
    emoji: '🔶',
    product: { name: 'Cu₃Zn₂ (真鍮)', emoji: '🔶' },
    reactants: {
      'Cu': 3,
      'Zn': 2
    },
    description: '銅と亜鉛の合金。楽器などに使用'
  },
  'fertilizer': {
    name: '肥料',
    emoji: '🌱',
    product: { name: 'NH₄NO₃ (硝酸アンモニウム)', emoji: '🌱' },
    reactants: {
      'NH3': 1,
      'HNO3': 1
    },
    description: 'アンモニアと硝酸から作られる窒素肥料'
  },
  'lime_milk': {
    name: '石灰乳',
    emoji: '🥛',
    product: { name: 'Ca(OH)₂・H₂O (石灰乳)', emoji: '🥛' },
    reactants: {
      'Ca': 1,
      'H2O': 2
    },
    description: 'カルシウムと水の反応で生成される白色懸濁液'
  },
  'salt': {
    name: '食塩',
    emoji: '🧂',
    product: { name: 'NaCl (塩化ナトリウム)', emoji: '🧂' },
    reactants: {
      'Na': 1,
      'Cl2': 0.5
    },
    description: 'ナトリウムと塩素の反応で生成される白色固体'
  }
};

export const CUSTOMERS: Customer[] = [
  { name: 'マダム・シェミストリー', avatar: '👩‍🔬', order: '「コーラください」', personality: 'elegant' },
  { name: 'プロフェッサー・モル', avatar: '👨‍🏫', order: '「塩水をお願いします」', personality: 'academic' },
  { name: 'キッド・リアクション', avatar: '👦', order: '「石鹸が欲しいです」', personality: 'curious' },
  { name: 'ミス・エレメント', avatar: '👩‍💼', order: '「ワインをください」', personality: 'sophisticated' },
  { name: 'ドクター・ボンド', avatar: '👨‍⚕️', order: '「お酢をお願いします」', personality: 'precise' },
  { name: 'キャプテン・カタリスト', avatar: '👨‍✈️', order: '「錆を見せてください」', personality: 'adventurous' },
  { name: 'レディ・アロイ', avatar: '👸', order: '「真鍮を作って」', personality: 'regal' },
  { name: 'ファーマー・フィールド', avatar: '👨‍🌾', order: '「肥料が必要です」', personality: 'practical' },
  { name: 'ビルダー・ベース', avatar: '👷‍♂️', order: '「石灰乳をください」', personality: 'hardworking' },
  { name: 'シェフ・ソルト', avatar: '👨‍🍳', order: '「食塩を作って」', personality: 'passionate' }
];

// スキル効果定数
export const SKILL_COST_REDUCTION = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
export const SKILL_RECOVERY_CHANCE = [0, 0.2, 0.35, 0.5, 0.7, 0.9];
export const SKILL_FORGIVENESS_CHANCE = [0, 0.1, 0.2, 0.35, 0.5, 0.7];
export const SKILL_EXP_MULTIPLIER = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7];
