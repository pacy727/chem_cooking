// app/components/screens/GameScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData, Order, Recipe } from '../../../lib/types';
import { RECIPES, CUSTOMERS, INGREDIENTS } from '../../../lib/data/gameData';
import { findReaction, calculateReactionMols, CHEMICAL_REACTIONS } from '../../../lib/data/reactions';
import { generateLevelBasedOrder, LevelBasedOrder, CUSTOMER_TYPES } from '../../../lib/data/levelBasedOrders';
import { 
  calculateLevelUp, 
  saveUserData, 
  getExpForLevel, 
  checkFailureForgiveness,
  calculateRecipeCost,
  checkVipCustomer
} from '../../../lib/utils/gameUtils';
import SkillModal from '../modals/SkillModal';
import IngredientModal from '../modals/IngredientModal';
import ChefCommentModal from '../modals/ChefCommentModal';
import Pantry from '../game/Pantry';
import ChemiPot from '../game/ChemiPot';
import { Star, Home, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

  // 評価絵文字を決定する関数
  const getEvaluationEmoji = (message: string, bonusRate: number) => {
    // 注文不一致の場合
    if (message.includes('注文と違い')) {
      return '💀'; // 完全に間違い
    }
    
    // bonusRateに基づく評価
    if (bonusRate >= 1.0) {
      return '🤩'; // パーフェクト
    } else if (bonusRate >= 0.8) {
      return '😘'; // 優秀
    } else if (bonusRate >= 0.3) {
      return '😥'; // 及第点だが失敗
    } else if (bonusRate > 0) {
      return '🤢'; // 悪い
    } else {
      return '😡'; // 失敗
    }
  };

  // 数値フォーマット関数：右側の不要な0を削除
const formatNumber = (num: number, decimalPlaces: number = 2): string => {
  return parseFloat(num.toFixed(decimalPlaces)).toString();
};

interface GameScreenProps {
  userData: UserData | null;
  isGuestMode: boolean;
  onReturnHome: () => void;
  onLogout: () => void;
  onUserDataUpdate: (userData: UserData) => void;
}

export default function GameScreen({ 
  userData, 
  isGuestMode, 
  onReturnHome, 
  onLogout, 
  onUserDataUpdate 
}: GameScreenProps) {
  const [money, setMoney] = useState(userData?.money || 5000);
  const [potContents, setPotContents] = useState<Record<string, number>>({});
  const [currentOrder, setCurrentOrder] = useState<LevelBasedOrder | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<any>(null);
  const [relatedReactions, setRelatedReactions] = useState<any[]>([]); // 関連する反応式リスト
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [reactionCompleted, setReactionCompleted] = useState(false); // 反応完了フラグ
  const [materialCosts, setMaterialCosts] = useState<number>(0); // 材料費追跡
  const [lastResult, setLastResult] = useState<any>(null);
  const [showRecipeHint, setShowRecipeHint] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'gas' | 'solution' | 'solid' | 'metal' | 'organic'>('all');
  
  // モーダル状態
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showChefCommentModal, setShowChefCommentModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<{ formula: string; ingredient: any } | null>(null);

  // お皿表示状態（統合版）
  const [plateProducts, setPlateProducts] = useState<Array<{ name: string; amount: number; formula: string }>>([]);
  const [plateUnreacted, setPlateUnreacted] = useState<Array<{ name: string; amount: number; formula: string }>>([]);
  const [customerFeedbackMsg, setCustomerFeedbackMsg] = useState('');

  // 初期化
  useEffect(() => {
    generateOrder();
  }, []);

  // 所持金の同期
  useEffect(() => {
    if (userData) {
      setMoney(userData.money);
    }
  }, [userData]);

  // 関連する反応を検索する関数
  const findRelatedReactions = (targetProduct: string, maxReactions: number = 5) => {
    // 目標生成物を含む反応を検索
    const reactions = CHEMICAL_REACTIONS.filter(reaction => 
      reaction.products.some(product => product.formula === targetProduct)
    );
    
    // 6個以上ある場合はランダムに5個選択
    if (reactions.length > maxReactions) {
      const shuffled = [...reactions].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, maxReactions);
    }
    
    return reactions;
  };

  const generateOrder = () => {
    // ユーザーレベルに基づいて注文を生成
    const userLevel = userData?.level || 1;
    const order = generateLevelBasedOrder(userLevel, userData); // userDataも渡す
    
    // 水溶液の濃度をランダム生成
    setCurrentConcentrations(generateConcentrations());
    
    // VIP客来店判定（口コミ評価スキル）
    let isLegend = false;
    if (userData && userData.level >= 10) {
      isLegend = checkVipCustomer(userData);
    }
    
    // 基本ボーナスにVIPボーナスを適用
    const bonusMultiplier = isLegend ? 5.0 : 1.0;
    const enhancedOrder: LevelBasedOrder = {
      ...order,
      bonusMultiplier,
      isLegend
    };
    
    setCurrentOrder(enhancedOrder);
    setCurrentRecipe(order.reaction as any); // 反応データをレシピとして使用（型キャスト）
    setShowRecipeHint(false);
    setReactionCompleted(false); // 反応ボタンを再有効化
    
    // デバッグ用：客タイプと倍率を確認
    const wordOfMouthLevel = userData?.skills?.word_of_mouth || 0;
    const vipMultipliers = [1.0, 1.5, 2.0, 3.0];
    const vipMultiplier = vipMultipliers[Math.min(wordOfMouthLevel, 3)];
    console.log(`注文生成: ${order.customerType} - mol倍率: ${CUSTOMER_TYPES[order.customerType].molMultiplier}, ボーナス倍率: ${CUSTOMER_TYPES[order.customerType].bonusMultiplier}, 口コミ評価Lv${wordOfMouthLevel}(VIP確率×${vipMultiplier})`);
    resetPlate();
  };

  const resetPlate = () => {
    setPlateProducts([]);
    setPlateUnreacted([]);
    setCustomerFeedbackMsg('');
    setShowResults(false);
    setMaterialCosts(0); // 材料費もリセット
  };

  const clearPotWithoutOrder = () => {
    setPotContents({});
    setMaterialCosts(0); // 材料費もリセット
    resetPlate();
  };

  const updateMoney = (change: number) => {
    const newMoney = Math.ceil(money + change);
    setMoney(newMoney);
    
    if (userData) {
      const updatedUserData = { ...userData, money: newMoney };
      onUserDataUpdate(updatedUserData);
      saveUserData(updatedUserData);
    }
  };

  // 新しい反応計算システム
  const calculateNewReaction = (
    potContents: Record<string, number>,
    recipe: any, // ChemicalReaction型
    order: LevelBasedOrder,
    userData: UserData | null
  ) => {
    const substances = Object.keys(potContents);
    const [formula1, formula2] = substances;
    const mol1 = potContents[formula1];
    const mol2 = potContents[formula2] || 0;
    
    // 反応の検索（レベル制限なし）
    const reaction = findReaction(formula1, formula2);
    
    if (!reaction) {
      // 反応しない場合
      return {
        success: false,
        code: 'NO_REACTION',
        bonusRate: 0,
        totalCost: 0,
        unreacted: substances.map(formula => ({
          formula,
          name: INGREDIENTS[formula]?.name || formula,
          mols: potContents[formula]
        })),
        chefComment: `${formula1}と${formula2}は反応しません。適切な組み合わせを選んでください。`,
        reaction: null
      };
    }
    
    // 反応計算
    const reactionResult = calculateReactionMols(reaction, mol1, mol2, formula1, formula2);
    
    // 注文との比較（生成物の中に注文品があるかチェック）
    const targetProduct = order.targetProduct; // 直接化学式を使用
    const targetMol = order.targetMol;
    
    let bonusRate = 0;
    let success = false;
    let orderMatch = false;
    
    // 生成物の中に注文品があるかチェック
    const matchingProduct = reactionResult.producedMols.find(p => p.formula === targetProduct);
    
    if (matchingProduct) {
      orderMatch = true;
      const productMol = matchingProduct.mols;
      const difference = Math.abs(productMol - targetMol);
      
      // 未反応物（反応物のみ）の計算
      const reactants = reaction.reactants || [];
      const reactantUnreactedAmount = reactionResult.remainingMols?.reduce((total: number, remaining: any) => {
        if (reactants.includes(remaining.formula)) {
          return total + remaining.mols;
        }
        return total;
      }, 0) || 0;
      
      // 未反応物の割合（目的生成物のmol数に対する比率）
      const unreactedRatio = productMol > 0 ? reactantUnreactedAmount / productMol : 0;
      
      // まず生成物の精度で基本レベルを決定
      let baseLevel = '';
      if (difference <= 0.01) {
        baseLevel = 'perfect';
      } else if (difference <= targetMol * 0.1) {
        baseLevel = 'excellent';
      } else if (difference <= targetMol * 0.3) {
        baseLevel = 'passing';
      } else {
        baseLevel = 'fail';
      }
      
      // 未反応物の割合で最終判定を決定
      if (unreactedRatio > 0.2) {
        // 未反応物が20%を超える場合: どうであれ失敗
        bonusRate = 0;
        success = false;
      } else if (unreactedRatio > 0.1) {
        // 未反応物が10%-20%: パーフェクト、優秀でも及第点
        if (baseLevel === 'perfect' || baseLevel === 'excellent') {
          bonusRate = 0.3;
          success = false; // 及第点は失敗扱い
        } else if (baseLevel === 'passing') {
          bonusRate = 0.3;
          success = false;
        } else {
          bonusRate = 0;
          success = false;
        }
      } else {
        // 未反応物が10%以下: パーフェクトでも優秀でもOK
        if (baseLevel === 'perfect') {
          bonusRate = 1.0;
          success = true;
        } else if (baseLevel === 'excellent') {
          bonusRate = 0.8;
          success = true;
        } else if (baseLevel === 'passing') {
          bonusRate = 0.3;
          success = false; // 及第点は失敗扱い
        } else {
          bonusRate = 0;
          success = false;
        }
      }
    }
    
    // おもてなしスキルでボーナス倍率適用
    if (userData && bonusRate > 0) {
      const hospitalityLevel = userData.skills?.hospitality || 0;
      const hospitalityMultipliers = [1.0, 1.2, 1.5, 2.0];
      bonusRate *= hospitalityMultipliers[hospitalityLevel] || 1.0;
    }
    
    return {
      success,
      code: success ? 'REACTION_SUCCESS' : 'REACTION_MISMATCH',
      bonusRate,
      totalCost: 0,
      reaction: reaction,
      reactionResult: reactionResult,
      orderMatch,
      targetProduct,
      targetMol,
      chefComment: generateChefComment(reaction, reactionResult, orderMatch, success, bonusRate, order)
    };
  };
  
  // シェフコメント生成
  const generateChefComment = (
    reaction: any,
    reactionResult: any,
    orderMatch: boolean,
    success: boolean,
    bonusRate: number,
    order: any
  ) => {
    if (!orderMatch) {
      return `${reaction.equation}の反応が起こりましたが、注文された物質ではありませんね。注文をよく確認してください。`;
    }
    
    // 注文情報を正確に取得
    const targetProduct = order.targetProduct;
    const targetMol = order.targetMol;
    
    // 実際の生成量を取得
    const actualProduct = reactionResult.producedMols?.find((p: any) => p.formula === targetProduct);
    const actualMol = actualProduct ? actualProduct.mols : 0;
    const difference = Math.abs(actualMol - targetMol);
    const differenceRatio = difference / targetMol;
    
    // 未反応物の情報を取得（反応物のみを対象）
    // 反応の反応物（左辺）を特定
    const reactants = reaction.reactants || [];
    
    // 反応物の未反応分のみを計算
    const reactantUnreactedAmount = reactionResult.remainingMols?.reduce((total: number, remaining: any) => {
      // 反応物リストに含まれる物質のみカウント
      if (reactants.includes(remaining.formula)) {
        return total + remaining.mols;
      }
      return total;
    }, 0) || 0;
    
    // 生成量の目標に対する達成率
    const productionRatio = actualMol / targetMol;
    
    // 未反応物の割合（目的生成物のmol数に対する比率）
    const unreactedRatio = actualMol > 0 ? reactantUnreactedAmount / actualMol : 0;
    
    // 生成物の精度レベルを判定
    let accuracyLevel = '';
    if (difference <= 0.01) {
      accuracyLevel = 'perfect';
    } else if (difference <= targetMol * 0.1) {
      accuracyLevel = 'excellent';
    } else if (difference <= targetMol * 0.3) {
      accuracyLevel = 'acceptable';
    } else {
      accuracyLevel = 'poor';
    }
    
    // ケース別コメント生成（新フォーマット）
    const statusLine = `料理の生成量: ${(productionRatio * 100).toFixed(1)}%、未反応割合: ${(unreactedRatio * 100).toFixed(1)}%`;
    
    if (bonusRate >= 1.0) {
      // パーフェクト成功
      return `${statusLine}\n完璧ネ！注文通り正確に作れたヨ！プロの腕だネ！`;
      
    } else if (bonusRate >= 0.8) {
      // 優秀成功
      if (actualMol > targetMol) {
        return `${statusLine}\n素晴らしいネ！少し多めだけど、品質は申し分ないヨ！`;
      } else {
        return `${statusLine}\n良い出来だネ！少し少なめだけど、実用レベルヨ！`;
      }
      
    } else if (bonusRate >= 0.3) {
      // 及第点（失敗扱い）
      if (unreactedRatio > 0.1) {
        if (accuracyLevel === 'perfect' || accuracyLevel === 'excellent') {
          return `${statusLine}\n生成量は良いけど、材料がもったいないネ！効率を上げるヨ！`;
        } else {
          return `${statusLine}\n量の誤差と未反応物、両方に問題があるネ...`;
        }
      } else {
        return `${statusLine}\nレシピ比率は良いけど、精度が足りないヨ！mol計算を確認するネ！`;
      }
      
    } else {
      // 失敗
      if (unreactedRatio > 0.2) {
        return `${statusLine}\n未反応物が多すぎるヨ！材料の比率を見直すネ！`;
      } else if (unreactedRatio > 0.1) {
        if (accuracyLevel === 'poor') {
          return `${statusLine}\n生成量も効率も両方ダメネ...基本から見直すヨ！`;
        } else {
          return `${statusLine}\n生成量は悪くないけど、効率が悪いから不合格ネ！`;
        }
      } else {
        if (actualMol < targetMol * 0.5) {
          if (unreactedRatio < 0.05) {
            return `${statusLine}\nレシピ比率は完璧ネ！でも量が少なすぎるヨ！！`;
          } else {
            return `${statusLine}\n量が少なすぎるネ！化学量論比を正確に計算するヨ！`;
          }
        } else {
          if (unreactedRatio < 0.05) {
            return `${statusLine}\nレシピ比率は良いけど、目標量との差が大きいネ！`;
          } else {
            return `${statusLine}\n目標量との差が大きすぎるヨ！計算を見直すネ！`;
          }
        }
      }
    }
  };

  // 原子量・分子量の定数（g/mol）
  const MOLAR_MASSES: Record<string, number> = {
    // 気体
    'H₂': 2,     // 水素
    'O₂': 32,    // 酸素
    'N₂': 28,    // 窒素
    'Cl₂': 71,   // 塩素
    'NH₃': 17,   // アンモニア
    'CO₂': 44,   // 二酸化炭素
    'NO': 30,    // 一酸化窒素
    'NO₂': 46,   // 二酸化窒素
    'SO₂': 64,   // 二酸化硫黄
    'H₂S': 34,   // 硫化水素
    'HF': 20,    // フッ化水素
    'Br₂': 160,  // 臭素
    
    // 水溶液（溶質の分子量）
    'HCl': 36,      // 塩酸
    'H₂SO₄': 98,    // 硫酸
    'HNO₃': 63,     // 硝酸
    'CH₃COOH': 60,  // 酢酸
    'NaOH': 40,     // 水酸化ナトリウム
    'KOH': 56,      // 水酸化カリウム
    'Ca(OH)₂': 74,  // 水酸化カルシウム
    'Al(OH)₃': 78,  // 水酸化アルミニウム
    'Mg(OH)₂': 58,  // 水酸化マグネシウム
    'Ba(OH)₂': 171, // 水酸化バリウム
    'H₂O': 18,      // 水
    
    // 固体
    'NaCl': 58,     // 塩化ナトリウム
    'CaCO₃': 100,   // 炭酸カルシウム
    'MnO₂': 87,     // 二酸化マンガン
    'KI': 166,      // ヨウ化カリウム
    'KMnO₄': 158,   // 過マンガン酸カリウム
    'Fe₂O₃': 160,   // 酸化鉄(III)
    'P₄': 124,      // リン
    'C': 12,        // 炭素
    'S': 32,        // 硫黄
    'I₂': 254,      // ヨウ素
    
    // 金属
    'Mg': 24,       // マグネシウム
    'Al': 27,       // アルミニウム
    'Zn': 65,       // 亜鉛
    'Fe': 56,       // 鉄
    'Ca': 40,       // カルシウム
    'Cu': 64,       // 銅
    'Na': 23,       // ナトリウム
    'Ag': 108,      // 銀
    
    // 有機化合物
    'CH₄': 16,      // メタン
    'C₂H₆': 30,     // エタン
    'C₃H₈': 44,     // プロパン
    'C₂H₄': 28,     // エチレン
    'C₂H₂': 26,     // アセチレン
    'C₆H₆': 78,     // ベンゼン
    'C₄H₁₀': 58     // ブタン
  };

  // 水溶液の濃度選択肢（mol/L）
  const SOLUTION_CONCENTRATIONS = [0.1, 0.2, 0.25, 0.5, 1.0, 2.0, 2.5, 5.0];

  // 現在の注文の水溶液濃度を管理
  const [currentConcentrations, setCurrentConcentrations] = useState<Record<string, number>>({});

  // 注文生成時に水溶液濃度をランダム設定
  const generateConcentrations = () => {
    const concentrations: Record<string, number> = {};
    const solutionFormulas = ['HCl', 'H2SO4', 'HNO3', 'NaOH', 'H2O'];
    
    solutionFormulas.forEach(formula => {
      const randomIndex = Math.floor(Math.random() * SOLUTION_CONCENTRATIONS.length);
      concentrations[formula] = SOLUTION_CONCENTRATIONS[randomIndex];
    });
    
    return concentrations;
  };

  // 単位からmolへの変換関数（修正版）
  const convertToMol = (amount: number, unit: string, formula: string): number => {
    switch (unit) {
      case 'L':   // 気体：標準状態で22.4L = 1mol
        return amount / 22.4;
      case 'mL':  // 水溶液：濃度 × 体積(L) = mol
        const concentration = currentConcentrations[formula] || 1.0;
        const volumeInL = amount / 1000; // mL → L
        return concentration * volumeInL;
      case 'g':   // 固体・金属：質量(g) ÷ 分子量(g/mol) = mol
        const molarMass = MOLAR_MASSES[formula] || 100;
        return amount / molarMass;
      default:
        return amount;
    }
  };

  const addToPot = (formula: string, amount: number, unit: string) => {
    // ケミ鍋の2物質制限チェック
    const currentSubstances = Object.keys(potContents);
    if (currentSubstances.length >= 2 && !currentSubstances.includes(formula)) {
      toast.error('ケミ鍋には2種類の物質までしか入れられません！\n既存の物質を回収してから追加してください。');
      setShowIngredientModal(false);
      return;
    }
    
    const molAmount = convertToMol(amount, unit, formula);
    const cost = Math.ceil(molAmount * 100); // 100円/mol、切り上げ
    
    // if (money < cost) {
    //   toast.error('お金が足りません！');
    //   return;
    // }
    // マイナスになる場合は警告を表示
    if (money - cost < 0) {
      toast('⚠️ 赤字になります！', {
        icon: '💸',
        duration: 2000
      });
    }

    // あまりにも大きなマイナスは防ぐ
    if (money - cost < -100000) {
      toast.error('これ以上の赤字は許可されていません！\n（上限: -10万円まで）');
      return;
    }
    updateMoney(-cost);
    setMaterialCosts(prev => prev + cost); // 材料費を記録
    setPotContents(prev => ({
      ...prev,
      [formula]: (prev[formula] || 0) + molAmount
    }));
    
    setShowIngredientModal(false);
    
    // 詳細情報付きトースト
    if (unit === 'mL') {
      const concentration = currentConcentrations[formula] || 1.0;
      toast.success(`${formula} ${formatNumber(molAmount, 3)} mol を追加しました！\n(${concentration}M × ${amount}mL)`);
    } else if (unit === 'g') {
      const molarMass = MOLAR_MASSES[formula] || 100;
      toast.success(`${formula} ${formatNumber(molAmount, 3)} mol を追加しました！\n(${amount}g ÷ ${molarMass}g/mol)`);
    } else {
      toast.success(`${formula} ${formatNumber(molAmount, 3)} mol を追加しました！`);
    }
  };

  const clearPot = () => {
    setPotContents({});
    setMaterialCosts(0); // 材料費もリセット
  };

  const buyRecipe = () => {
    const recipeCost = calculateRecipeCost(userData);
    
    if (money < recipeCost) {
      toast.error(`お金が足りません！レシピは${recipeCost}円です。`);
      return;
    }
    
    if (!currentOrder) {
      toast.error('注文が見つかりません！');
      return;
    }
    
    updateMoney(-recipeCost);
    
    // 目標生成物に関連する反応を検索
    const reactions = findRelatedReactions(currentOrder.targetProduct);
    setRelatedReactions(reactions);
    
    setShowRecipeHint(true);
    toast.success(`反応情報を購入しました！\n${reactions.length}個の関連反応が見つかりました。`);
  };

  const performReaction = async () => {
    if (isProcessing || !currentOrder || !currentRecipe || reactionCompleted) return;
    
    const substances = Object.keys(potContents);
    if (substances.length === 0) {
      toast.error('材料を入れてください！');
      return;
    }
    
    if (substances.length === 1) {
      toast.error('反応には2種類の物質が必要です！');
      return;
    }
    
    setIsProcessing(true);
    
    // 反応計算を少し遅延させて演出
    setTimeout(() => {
      const result = calculateNewReaction(potContents, currentRecipe, currentOrder, userData);
      
      // 失敗許容スキルチェック（シェフの人柄）
      if (userData && result.bonusRate <= 0) {
        if (checkFailureForgiveness(userData)) {
          toast.success('シェフの腕が光った！ (スキル発動)\n「もう一度チャンスをあげるヨ！」', {
            duration: 3000
          });
          clearPotWithoutOrder();
          setIsProcessing(false);
          return;
        }
      }
      
      showReactionResult(result);
      setIsProcessing(false);
    }, 1500);
  };

  
  const showReactionResult = (result: any) => {
    setLastResult(result);
    setReactionCompleted(true); // 反応ボタンを無効化
    
    let feedbackMsg = '';
    let moneyChange = 0;
    
    // ★ 報酬計算を1回だけ行う（関数の最初で計算）
    let orderBonus = 0;
    let materialRefund = 0;
    
    if (currentOrder) {
      const baseBonus = 1000;
      const customerMultiplier = currentOrder.bonusMultiplier || 1.0;
      orderBonus = Math.ceil(baseBonus * result.bonusRate * customerMultiplier);
      
      // パーフェクト・優秀時のみ材料費返却
      materialRefund = result.bonusRate >= 0.8 ? Math.ceil(materialCosts) : 0;
      moneyChange = orderBonus + materialRefund;
    }
    
    // お皿の表示を更新（新しい反応システム対応）
    const products: Array<{ name: string; amount: number; formula: string }> = [];
    const unreacted: Array<{ name: string; amount: number; formula: string }> = [];
    
    if (result.code === 'NO_REACTION') {
      // 反応しない場合、すべて未反応として表示
      result.unreacted?.forEach((item: any) => {
        unreacted.push({
          name: item.name,
          amount: item.mols,
          formula: item.formula
        });
      });
    } else if (result.reactionResult) {
      // 新しい反応システムの結果処理
      const reactionResult = result.reactionResult;
      
      // 生成物の表示
      reactionResult.producedMols?.forEach((product: any) => {
        products.push({
          name: getProductDisplayName(product.formula),
          amount: product.mols,
          formula: product.formula
        });
      });
      
      // 未反応物質の表示
      reactionResult.remainingMols?.forEach((remaining: any) => {
        unreacted.push({
          name: getProductDisplayName(remaining.formula),
          amount: remaining.mols,
          formula: remaining.formula
        });
      });
    }
    
    setPlateProducts(products);
    setPlateUnreacted(unreacted);
    
    // EXP付与
    if (userData) {
      const expGain = result.bonusRate > 0 ? 100 : 50;
      const levelUpResult = calculateLevelUp(userData, expGain);
      
      if (levelUpResult.leveledUp) {
        toast.success(`レベルアップ！ Lv.${levelUpResult.newLevel} になりました！\nスキルポイント +${levelUpResult.skillPointsGained}`, {
          duration: 4000
        });
      }
      
      // 総売上更新
      if (result.bonusRate > 0) {
        userData.totalSales += moneyChange;
      }
      
      onUserDataUpdate(userData);
      saveUserData(userData);
    }
    
    // お客様の詳細な反応メッセージ（新判定システム対応）
    if (result.orderMatch) {
      // 注文品が生成された場合
      if (result.bonusRate >= 1.0) {
        feedbackMsg = '「完璧です！おいしい～！」';
      } else if (result.bonusRate >= 0.8) {
        feedbackMsg = '「良いですネ！少し量が違うけど...」';
      } else if (result.bonusRate >= 0.3) {
        feedbackMsg = '「う～ん、量が足りないか効率が悪いですネ...」';
      } else {
        feedbackMsg = '「注文品はできてますが、量や効率に問題がありマス...」';
      }
      
      // 未反応物質がある場合の追加コメント
      if (unreacted.length > 0) {
        const unreactedList = unreacted.map(item => `${item.formula} ${formatNumber(item.amount)} mol`).join(', ');
        feedbackMsg += `\n（${unreactedList} が混入しています...）`;
      }
      
      // ★ 報酬の内訳を表示（計算済みの値を使用）
      if (materialRefund > 0) {
        feedbackMsg += `\n注文報酬: +${orderBonus.toLocaleString()}円`;
        feedbackMsg += `\n材料費返却: +${materialRefund.toLocaleString()}円`;
        feedbackMsg += `\n合計: +${moneyChange.toLocaleString()}円`;
      } else {
        feedbackMsg += `\n+${moneyChange.toLocaleString()}円`;
      }
    } else {
      // 注文品が全く生成されなかった場合
      if (result.code === 'NO_REACTION') {
        feedbackMsg = '「反応しませんネ...」';
        feedbackMsg += '\n（これらの物質は反応しません）';
      } else {
        feedbackMsg = '「反応はしたけど、注文と違いマス...」';
        if (result.reaction) {
          feedbackMsg += `\n（${result.reaction.equation} の反応が起こりました）`;
        }
      }
      
      // 失敗理由の詳細表示
      if (unreacted.length > 0) {
        const unreactedList = unreacted.map(item => `${item.formula} ${formatNumber(item.amount)} mol`).join(', ');
        feedbackMsg += `\n（${unreactedList} が混入しています...）`;
      }
      
      feedbackMsg += '\n+0円';
    }
    
    setCustomerFeedbackMsg(feedbackMsg);
    
    if (moneyChange > 0) {
      updateMoney(moneyChange);
    }
    
    setShowResults(true);
  };

  // 化学式から表示名を取得（showReactionResult用）
  const getProductDisplayName = (formula: string): string => {
    const names: Record<string, string> = {
      // 気体
      'H2': '水素',
      'O2': '酸素',
      'N2': '窒素',
      'Cl2': '塩素',
      'NH3': 'アンモニア',
      'CO2': '二酸化炭素',
      'NO': '一酸化窒素',
      'NO2': '二酸化窒素',
      'SO2': '二酸化硫黄',
      'H2S': '硫化水素',
      'HF': 'フッ化水素',
      'Br2': '臭素',
      
      // 水溶液
      'HCl': '塩化水素',
      'H2SO4': '硫酸',
      'HNO3': '硝酸',
      'CH3COOH': '酢酸',
      'NaOH': '水酸化ナトリウム',
      'KOH': '水酸化カリウム',
      'Ca(OH)2': '水酸化カルシウム',
      'H2O': '水',
      
      // 固体・塩
      'NaCl': '塩化ナトリウム',
      'CaCO3': '炭酸カルシウム',
      'ZnCl2': '塩化亜鉛',
      'FeCl2': '塩化鉄(II)',
      'MgCl2': '塩化マグネシウム',
      'AlCl3': '塩化アルミニウム',
      'ZnSO4': '硫酸亜鉛',
      'FeSO4': '硫酸鉄(II)',
      'MgSO4': '硫酸マグネシウム',
      'CaCl2': '塩化カルシウム',
      'CuO': '酸化銅(II)',
      'Fe2O3': '酸化鉄(III)',
      'MgO': '酸化マグネシウム',
      'Al2O3': '酸化アルミニウム',
      'Na2SO4': '硫酸ナトリウム',
      'CH3COONa': '酢酸ナトリウム',
      'KNO3': '硝酸カリウム',
      'NH4Cl': '塩化アンモニウム',
      'AgNO3': '硝酸銀',
      
      // 金属
      'Mg': 'マグネシウム',
      'Al': 'アルミニウム',
      'Zn': '亜鉛',
      'Fe': '鉄',
      'Ca': 'カルシウム',
      'Cu': '銅',
      'Na': 'ナトリウム',
      'Ag': '銀',
      
      // 有機化合物
      'CH4': 'メタン',
      'C2H6': 'エタン',
      'C3H8': 'プロパン',
      'C2H4': 'エチレン',
      'C2H2': 'アセチレン',
      'C6H6': 'ベンゼン',
      'C4H10': 'ブタン'
    };
    
    return names[formula] || formula;
  };

  const nextOrder = () => {
    clearPot();
    generateOrder();
    setFilterCategory('all');
    setReactionCompleted(false); // 反応ボタンを再有効化
    setRelatedReactions([]); // 関連反応もクリア
    setShowRecipeHint(false); // レシピヒントもリセット
  };

  const retry = () => {
    clearPot();
    resetPlate();
  };

  const handleSkillUpdate = (updatedUserData: UserData) => {
    onUserDataUpdate(updatedUserData);
    saveUserData(updatedUserData);
  };

  const recipeCost = calculateRecipeCost(userData);

  return (
    <>
      {/* 全体コンテナ - 90%幅、画面内確実収容 */}
      <div className="w-[90%] mx-auto max-h-screen h-screen flex flex-col overflow-hidden">
        {/* ヘッダー：タイトルと所持金（コンパクト版） */}
        <header className="flex justify-between items-center p-3 bg-white rounded-xl shadow-md flex-shrink-0">
          <button 
            onClick={onReturnHome}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            ホームへ戻る
          </button>
          <h1 className="text-2xl font-bold text-yellow-600 hidden md:block">
            化学反応キッチン
          </h1>
          
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
              ¥{money.toLocaleString()}
            </div>
            
            {/* その他のボタン群 */}
            <div className="flex gap-2">
              {userData && (
                <button 
                  onClick={() => setShowSkillModal(true)}
                  className="bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-600 transition flex items-center"
                >
                  <Star className="w-5 h-5" />
                </button>
              )}
              
              <button 
                onClick={onLogout}
                className="bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition flex items-center"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 mt-2">
          {/* 左側：パントリーとケミ鍋 */}
          <div>
            {/* 1. パントリーエリア */}
            <section className="mb-3">
              <div className="bg-white p-3 rounded-xl shadow-md relative">
                {/* 価格表示（右上角） */}
                <div className="absolute top-2 right-2 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  100円/mol
                </div>
                <Pantry 
                  filterCategory={filterCategory}
                  onFilterChange={setFilterCategory}
                  onIngredientClick={(formula, ingredient) => {
                    setSelectedIngredient({ formula, ingredient });
                    setShowIngredientModal(true);
                  }}
                />
              </div>
            </section>
            
            {/* 2. ケミ鍋エリア */}
            <section className="mt-12">
              <div className="flex items-center space-x-4">
                {/* ケミ鍋ビジュアル */}
                <div className="w-28 h-28 bg-gray-700 rounded-full flex items-center justify-center relative shadow-inner">
                  <span className="text-5xl">🍲</span>
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {Object.keys(potContents).length}
                  </div>
                </div>
                
                {/* 投入材料表示エリア（左右2つのコンテナ + 中央「+」） */}
                <div className="flex-1 h-28 flex items-center space-x-2">
                  {/* 材料リスト配列の準備 */}
                  {(() => {
                    const materials = Object.entries(potContents);
                    const leftMaterial = materials[0] || null;
                    const rightMaterial = materials[1] || null;
                    
                    return (
                      <>
                        {/* 左側材料コンテナ */}
                        <div className="flex-1 h-full bg-white rounded-xl shadow-md p-3 flex flex-col items-center justify-center">
                          {leftMaterial ? (
                            <>
                              <div className="text-lg font-bold text-gray-800">{leftMaterial[0]}</div>
                              <div className="text-sm text-gray-600">{formatNumber(leftMaterial[1])} mol</div>
                              <button 
                                onClick={() => {
                                  const removedFormula = leftMaterial[0];
                                  const removedAmount = leftMaterial[1];
                                  
                                  // サルベージ機能
                                  const salvageLevel = userData?.skills?.salvage || 0;
                                  
                                  if (salvageLevel === 0) {
                                    toast.error('サルベージスキルがないため回収できません！\nスキルポイントを使ってサルベージスキルを習得してください。');
                                    return;
                                  }
                                  
                                  // サルベージ率の計算（レベルに応じて）
                                  const salvageRates = [0, 0.3, 0.5, 0.7]; // Lv0:0%, Lv1:30%, Lv2:50%, Lv3:70%
                                  const salvageRate = salvageRates[Math.min(salvageLevel, 3)];
                                  
                                  // 回収金額計算
                                  const materialCost = removedAmount * 100; // 100円/mol
                                  const recoveredAmount = Math.ceil(materialCost * salvageRate);
                                  
                                  // 材料をケミ鍋から削除
                                  setPotContents(prev => {
                                    const newContents = { ...prev };
                                    delete newContents[removedFormula];
                                    return newContents;
                                  });
                                  
                                  // 材料費記録を更新
                                  setMaterialCosts(prev => Math.max(0, prev - materialCost));
                                  
                                  // サルベージ金額を返却
                                  if (recoveredAmount > 0) {
                                    updateMoney(recoveredAmount);
                                    toast.success(`${getProductDisplayName(removedFormula)} ${formatNumber(removedAmount)} mol を回収しました！\nサルベージLv.${salvageLevel} (${(salvageRate * 100)}%): +${recoveredAmount}円`, {
                                      duration: 3000
                                    });
                                  }
                                }}
                                className="mt-1 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                              >
                                回収
                              </button>
                            </>
                          ) : (
                            <div className="text-gray-400 text-center text-sm">材料1</div>
                          )}
                        </div>

                        {/* 中央の「+」マーク */}
                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full font-bold text-lg shadow-md">
                          +
                        </div>

                        {/* 右側材料コンテナ */}
                        <div className="flex-1 h-full bg-white rounded-xl shadow-md p-3 flex flex-col items-center justify-center">
                          {rightMaterial ? (
                            <>
                              <div className="text-lg font-bold text-gray-800">{rightMaterial[0]}</div>
                              <div className="text-sm text-gray-600">{formatNumber(rightMaterial[1])} mol</div>
                              <button 
                                onClick={() => {
                                  const removedFormula = rightMaterial[0];
                                  const removedAmount = rightMaterial[1];
                                  
                                  // サルベージ機能
                                  const salvageLevel = userData?.skills?.salvage || 0;
                                  
                                  if (salvageLevel === 0) {
                                    toast.error('サルベージスキルがないため回収できません！\nスキルポイントを使ってサルベージスキルを習得してください。');
                                    return;
                                  }
                                  
                                  // サルベージ率の計算（レベルに応じて）
                                  const salvageRates = [0, 0.3, 0.5, 0.7]; // Lv0:0%, Lv1:30%, Lv2:50%, Lv3:70%
                                  const salvageRate = salvageRates[Math.min(salvageLevel, 3)];
                                  
                                  // 回収金額計算
                                  const materialCost = removedAmount * 100; // 100円/mol
                                  const recoveredAmount = Math.ceil(materialCost * salvageRate);
                                  
                                  // 材料をケミ鍋から削除
                                  setPotContents(prev => {
                                    const newContents = { ...prev };
                                    delete newContents[removedFormula];
                                    return newContents;
                                  });
                                  
                                  // 材料費記録を更新
                                  setMaterialCosts(prev => Math.max(0, prev - materialCost));
                                  
                                  // サルベージ金額を返却
                                  if (recoveredAmount > 0) {
                                    updateMoney(recoveredAmount);
                                    toast.success(`${getProductDisplayName(removedFormula)} ${formatNumber(removedAmount)} mol を回収しました！\nサルベージLv.${salvageLevel} (${(salvageRate * 100)}%): +${recoveredAmount}円`, {
                                      duration: 3000
                                    });
                                  }
                                }}
                                className="mt-1 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                              >
                                回収
                              </button>
                            </>
                          ) : (
                            <div className="text-gray-400 text-center text-sm">材料2</div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              {/* 反応ボタン */}
              <button 
                onClick={performReaction}
                disabled={isProcessing || reactionCompleted}
                className={`mt-4 w-full bg-red-500 text-white font-bold text-xl py-3 rounded-lg shadow-lg hover:bg-red-600 transition transform hover:scale-105 active:scale-95 ${
                  isProcessing || reactionCompleted
                    ? 'bg-gray-400 cursor-not-allowed'
                    : ''
                }`}
              >
                {isProcessing ? '反応中...' : reactionCompleted ? '反応完了' : 'REACTION !!'}
              </button>
            </section>
          </div>

          {/* 右カラム：注文 + お皿 */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            {/* 注文エリア */}
            <section className="mb-3">
              <div className="bg-white p-3 rounded-xl shadow-md h-64">
                {/* 注文情報エリア（上半分・固定高さ） */}
                <div className="h-32 flex items-center">
                  {currentOrder && (
                    <div className="flex items-center space-x-4 w-full">
                      <span className="text-6xl">{CUSTOMER_TYPES[currentOrder.customerType]?.emoji || '👨‍🔬'}</span>
                      <div>
                        <p className="text-base font-semibold text-gray-800">{currentOrder.customerComment}</p>
                        <p className="text-xl font-bold text-blue-600">{currentOrder.orderText}</p>
                        <p className="text-sm font-bold">[{CUSTOMER_TYPES[currentOrder.customerType]?.displayName || 'Normal客'}]</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* レシピ購入セクション（下半分・固定高さ2/3・スクロール対応） */}
                <div className="h-24 border-t pt-3 flex flex-col">
                  {showRecipeHint && relatedReactions.length > 0 ? (
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-2">
                        {relatedReactions.map((reaction, index) => (
                          <div 
                            key={reaction.id} 
                            className="text-center text-lg font-mono text-gray-700 bg-gray-100 p-3 rounded"
                          >
                            {reaction.equation}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <button 
                        onClick={buyRecipe}
                        className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                      >
                        レシピを見る ({recipeCost}円)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 4. 給仕エリア（お皿） */}
            <section>
              <div className="flex flex-col items-center justify-between bg-gray-100 rounded-xl h-[250px] p-3">
                
                {/* 上段: お皿とフィードバック */}
                <div className="flex flex-row items-center justify-around w-full">
                  {/* お皿 */}
                  <div className="bg-white rounded-xl w-56 h-36 shadow-inner flex flex-col items-center justify-center text-gray-300 transition-all duration-300 p-3">
                    
                    {/* 全ての生成物を横並び表示 */}
                    {plateProducts.length > 0 && (
                      <div className="text-center w-full">
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                          {plateProducts.map((product, index) => (
                            <div key={product.formula} className="text-center bg-gradient-to-b from-yellow-50 to-orange-50 rounded-md p-2 shadow-sm border border-yellow-200 min-w-0 flex-shrink-0">
                              <span className="block text-sm font-bold text-orange-800 drop-shadow-sm">
                                {product.formula}
                              </span>
                              <span className="block text-xs font-semibold text-amber-600">
                                {formatNumber(product.amount)} mol
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 未反応物エリア */}
                    {plateUnreacted.length > 0 && (
                      <div className="text-center w-full">
                        <span className="block text-xs text-gray-500 mb-1">（未反応）</span>
                        <div className="flex flex-wrap justify-center gap-2">
                          {plateUnreacted.map((unreacted, index) => (
                            <div key={unreacted.formula} className="text-center bg-gray-50 rounded-md p-1 min-w-0 flex-shrink-0">
                              <span className="block text-xs font-semibold text-gray-700">
                                {unreacted.formula}
                              </span>
                              <span className="block text-xs text-gray-500">
                                {formatNumber(unreacted.amount)} mol
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 空の状態 */}
                    {plateProducts.length === 0 && plateUnreacted.length === 0 && (
                      <div className="text-center text-gray-400">
                        <div className="text-6xl mb-2">🍽️</div>
                        <div className="text-sm">お皿</div>
                      </div>
                    )}
                  </div>

                  {/* フィードバックエリア */}
                  <div className="flex flex-col items-center justify-center flex-1 max-w-md ml-4">
                    {customerFeedbackMsg && (
                      <div className="text-center w-full">
                        <div className="whitespace-pre-line text-purple-700 leading-relaxed">
                          {customerFeedbackMsg.split('\n').map((line, index) => {
                            // 1行目に評価絵文字を追加
                            if (index === 0) {
                              const emoji = getEvaluationEmoji(line, lastResult?.bonusRate || 0);
                              return (
                                <div key={index} className="text-lg font-bold mb-2 break-keep">
                                  <span className="text-2xl mr-2">{emoji}</span>
                                  {line}
                                </div>
                              );
                            }
                            return (
                              <div key={index} className="text-sm mb-1 break-keep">
                                {line}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 下段: ボタンエリア */}
                {showResults && (
                  <div className="mt-4 w-full flex flex-row justify-center gap-4">
                    <button 
                      onClick={nextOrder}
                      className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                      次の注文へ
                    </button>
                    <button 
                      onClick={() => setShowChefCommentModal(true)}
                      className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                    >
                      シェフのコメント
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* モーダル */}
      {userData && (
        <SkillModal 
          isOpen={showSkillModal}
          onClose={() => setShowSkillModal(false)}
          userData={userData}
          onSkillUpdate={handleSkillUpdate}
        />
      )}

      {selectedIngredient && (
        <IngredientModal 
          isOpen={showIngredientModal}
          onClose={() => setShowIngredientModal(false)}
          formula={selectedIngredient.formula}
          ingredient={selectedIngredient.ingredient}
          userData={userData}
          onAddToPot={(formula, amount, unit) => addToPot(formula, amount, unit)}
          concentration={currentConcentrations[selectedIngredient.formula]}
          molarMass={MOLAR_MASSES[selectedIngredient.formula]}
        />
      )}

      {/* シェフのコメントモーダル */}
      <ChefCommentModal 
        isOpen={showChefCommentModal}
        onClose={() => setShowChefCommentModal(false)}
        lastResult={lastResult}
        currentRecipe={currentRecipe}
      />
    </>
  );
}