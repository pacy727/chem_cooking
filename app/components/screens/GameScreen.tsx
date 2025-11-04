// app/components/screens/GameScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData, Order, Recipe, FilterCategory } from '../../../lib/types';
import { RECIPES, CUSTOMERS, INGREDIENTS } from '../../../lib/data/gameData';
import { 
  calculateReaction, 
  calculateLevelUp, 
  saveUserData, 
  getExpForLevel, 
  checkFailureForgiveness,
  calculateRecipeCost,
  checkVipCustomer
} from '../../../lib/utils/gameUtils';
import SkillModal from '../modals/SkillModal';
import IngredientModal from '../modals/IngredientModal';
import Pantry from '../game/Pantry';
import ChemiPot from '../game/ChemiPot';
import { Star, Home, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [showRecipeHint, setShowRecipeHint] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'gas' | 'solution' | 'solid' | 'metal'>('all');
  
  // モーダル状態
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
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

  const generateOrder = () => {
    const recipes = Object.values(RECIPES);
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const targetMol = parseFloat((Math.random() * 3 + 1).toFixed(1));
    
    // 水溶液の濃度をランダム生成
    setCurrentConcentrations(generateConcentrations());
    
    // VIP客来店判定（口コミ評価スキル）
    let isLegend = false;
    if (userData && userData.level >= 10) {
      isLegend = checkVipCustomer(userData);
    }
    
    const order: Order = {
      customer,
      targetMol,
      recipe,
      bonusMultiplier: isLegend ? 5.0 : 1.0,
      isLegend
    };
    
    setCurrentOrder(order);
    setCurrentRecipe(recipe);
    setShowRecipeHint(false);
    resetPlate();
  };

  const resetPlate = () => {
    setPlateProducts([]);
    setPlateUnreacted([]);
    setCustomerFeedbackMsg('');
    setShowResults(false);
  };

  const updateMoney = (change: number) => {
    const newMoney = money + change;
    setMoney(newMoney);
    
    if (userData) {
      const updatedUserData = { ...userData, money: newMoney };
      onUserDataUpdate(updatedUserData);
      saveUserData(updatedUserData);
    }
  };

  // 原子量・分子量の定数（g/mol）
  const MOLAR_MASSES: Record<string, number> = {
    // 気体
    'O2': 32,    // 酸素
    'H2': 2,     // 水素
    'CO2': 44,   // 二酸化炭素
    'N2': 28,    // 窒素
    'Cl2': 71,   // 塩素
    'NH3': 17,   // アンモニア
    
    // 水溶液（溶質の分子量）
    'HCl': 36,      // 塩酸
    'H2SO4': 98,    // 硫酸
    'HNO3': 63,     // 硝酸
    'NaOH': 40,     // 水酸化ナトリウム
    'H2O': 18,      // 水
    
    // 固体
    'NaCl': 58,     // 塩化ナトリウム
    'CaCO3': 100,   // 炭酸カルシウム
    'C': 12,        // 炭素
    'S': 32,        // 硫黄
    'I2': 254,      // ヨウ素
    
    // 金属
    'Fe': 56,       // 鉄
    'Cu': 64,       // 銅
    'Zn': 65,       // 亜鉛
    'Al': 27,       // アルミニウム
    'Mg': 24,       // マグネシウム
    'Na': 23        // ナトリウム
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
    const molAmount = convertToMol(amount, unit, formula);
    const cost = molAmount * 100; // 100円/mol
    
    if (money < cost) {
      toast.error('お金が足りません！');
      return;
    }
    
    updateMoney(-cost);
    setPotContents(prev => ({
      ...prev,
      [formula]: (prev[formula] || 0) + molAmount
    }));
    
    setShowIngredientModal(false);
    
    // 詳細情報付きトースト
    if (unit === 'mL') {
      const concentration = currentConcentrations[formula] || 1.0;
      toast.success(`${formula} ${molAmount.toFixed(3)} mol を追加しました！\n(${concentration}M × ${amount}mL)`);
    } else if (unit === 'g') {
      const molarMass = MOLAR_MASSES[formula] || 100;
      toast.success(`${formula} ${molAmount.toFixed(3)} mol を追加しました！\n(${amount}g ÷ ${molarMass}g/mol)`);
    } else {
      toast.success(`${formula} ${molAmount.toFixed(3)} mol を追加しました！`);
    }
  };

  const clearPot = () => {
    setPotContents({});
  };

  const buyRecipe = () => {
    const recipeCost = calculateRecipeCost(userData);
    
    if (money < recipeCost) {
      toast.error(`お金が足りません！レシピは${recipeCost}円です。`);
      return;
    }
    
    updateMoney(-recipeCost);
    setShowRecipeHint(true);
    toast.success('レシピを購入しました！');
  };

  const performReaction = async () => {
    if (isProcessing || !currentOrder || !currentRecipe) return;
    
    if (Object.keys(potContents).length === 0) {
      toast.error('材料を入れてください！');
      return;
    }
    
    setIsProcessing(true);
    
    // 反応計算を少し遅延させて演出
    setTimeout(() => {
      const result = calculateReaction(potContents, currentRecipe, currentOrder, userData);
      
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

  const clearPotWithoutOrder = () => {
    setPotContents({});
    resetPlate();
  };

  const showReactionResult = (result: any) => {
    setLastResult(result);
    
    let feedbackMsg = '';
    let moneyChange = 0;
    
    if (currentOrder) {
      const baseBonus = 1000 * currentOrder.bonusMultiplier;
      moneyChange = baseBonus * result.bonusRate;
    }
    
    // お皿の表示を更新（統合版）
    const products: Array<{ name: string; amount: number; formula: string }> = [];
    const unreacted: Array<{ name: string; amount: number; formula: string }> = [];
    
    if (result.success && result.product) {
      products.push({
        name: result.product.name,
        amount: result.product.mols,
        formula: currentRecipe?.product.name.split(' ')[0] || 'Unknown'
      });
    }
    
    // 未反応物質の表示
    if (result.excess) {
      unreacted.push({
        name: result.excess.name,
        amount: result.excess.mols,
        formula: 'Excess'
      });
    }
    
    // 副生成物の表示
    if (result.extras) {
      result.extras.forEach((extra: any) => {
        products.push({
          name: extra.name,
          amount: extra.mols,
          formula: extra.name.split(' ')[0]
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
    
    // お客様の反応
    if (result.bonusRate > 0) {
      if (result.code === 'PERFECT') {
        feedbackMsg = '「おいしい～！」';
      } else if (result.code === 'EXCESS_SLIGHT') {
        const msg = result.product.mols > (currentOrder?.targetMol || 0) ? 
          "勝手に大盛にするナ！" : "勝手に小盛にするナ！";
        feedbackMsg = `「${msg}」`;
      } else if (result.code === 'EXCESS_LARGE') {
        feedbackMsg = '「ムチャクチャナ量ダヨ！」';
      }
      
      if (result.totalCost > 0) {
        updateMoney(result.totalCost);
        feedbackMsg += `\n(材料費 ${result.totalCost.toFixed(0)}円 が戻ってきました！)`;
      }
    } else {
      feedbackMsg = '「買えりマス。」';
      
      // 失敗理由の表示
      if (result.code === 'MISSING_STUFF') {
        feedbackMsg += '\n（材料が足りません...）';
      } else if (result.code === 'EXCESS_MATERIAL') {
        feedbackMsg += `\n（${result.excess.name} が ${result.excess.mols.toFixed(2)} mol 余っています...）`;
      }
    }
    
    setCustomerFeedbackMsg(feedbackMsg);
    
    if (moneyChange > 0) {
      updateMoney(moneyChange);
      toast.success(`+${moneyChange.toFixed(0)}円 ボーナス！`);
    }
    
    setShowResults(true);
  };

  const nextOrder = () => {
    clearPot();
    generateOrder();
    setFilterCategory('all');
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
      <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
        {/* ヘッダー（固定高さ48px） */}
        <div className="flex justify-between items-center px-3 py-2 bg-yellow-100 flex-shrink-0 border-b border-yellow-200" style={{ height: '48px' }}>
          <div className="flex items-center gap-2">
            {/* タイトル */}
            <h1 className="font-lobster text-lg font-bold text-yellow-600" style={{ fontFamily: 'Lobster, cursive' }}>
              La Cucina Chimica
            </h1>
            
            {/* ユーザー情報 */}
            {userData && (
              <div className="text-sm text-gray-700 hidden lg:block">
                <span className="font-semibold">{userData.chefName}</span> ({userData.storeName}) | 
                Lv.{userData.level} | 
                EXP: {userData.exp}/{getExpForLevel(userData.level)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* 資本金 */}
            <div className="text-base font-bold text-yellow-600">
              ¥{money.toLocaleString()}
            </div>
            
            {/* ボタン群 */}
            <div className="flex gap-1">
              {userData && (
                <button 
                  onClick={() => setShowSkillModal(true)}
                  className="bg-blue-500 text-white font-semibold py-1 px-2 rounded hover:bg-blue-600 transition flex items-center"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              
              <button 
                onClick={onReturnHome}
                className="bg-gray-500 text-white font-semibold py-1 px-2 rounded hover:bg-gray-600 transition flex items-center"
              >
                <Home className="w-4 h-4" />
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-500 text-white font-semibold py-1 px-2 rounded hover:bg-red-600 transition flex items-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* メインエリア（calc(100vh - 48px)） */}
        <div className="p-3 flex-1 overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
          <div className="grid grid-cols-2 gap-3 h-full">
            {/* 左カラム：パントリー + ケミ鍋 */}
            <div className="flex flex-col gap-3 h-full overflow-hidden">
              {/* パントリー */}
              <div style={{ height: '65%' }}>
                <Pantry 
                  filterCategory={filterCategory}
                  onFilterChange={setFilterCategory}
                  onIngredientClick={(formula, ingredient) => {
                    setSelectedIngredient({ formula, ingredient });
                    setShowIngredientModal(true);
                  }}
                />
              </div>
              
              {/* ケミ鍋エリア */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 overflow-hidden" style={{ height: 'calc(35% - 12px)' }}>
                <ChemiPot 
                  contents={potContents}
                  onSalvage={(formula) => {
                    setPotContents(prev => {
                      const newContents = { ...prev };
                      delete newContents[formula];
                      return newContents;
                    });
                  }}
                  userData={userData}
                  isProcessing={isProcessing}
                />
                
                {/* 反応ボタン */}
                <div className="text-center mt-3">
                  <button 
                    onClick={performReaction}
                    disabled={isProcessing}
                    className="bg-red-600 text-white font-bold text-sm py-2 px-4 rounded shadow hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? '反応中...' : 'REACTION !!'}
                  </button>
                </div>
              </div>
            </div>

            {/* 右カラム：注文 + レシピ + お皿統合エリア */}
            <div className="flex flex-col gap-3 h-full overflow-hidden">
              {/* 注文表示 */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 overflow-hidden" style={{ height: '25%' }}>
                {currentOrder && (
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">👤 お客様のご注文</h3>
                    <p className="text-base font-bold text-blue-900 mb-2">{currentOrder.customer.order}</p>
                    <p className="text-sm text-blue-700">
                      {currentOrder.recipe.product.name} を {currentOrder.targetMol.toFixed(1)} mol
                    </p>
                    
                    {/* レジェンドオーダー表示 */}
                    {currentOrder.isLegend && (
                      <div className="mt-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-center">
                        <span className="text-sm font-bold">✨ レジェンドオーダー ✨</span>
                        <div className="text-sm">ボーナス5倍！</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* レシピエリア */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 overflow-hidden" style={{ height: '25%' }}>
                <h3 className="text-sm font-semibold text-green-800 mb-2">📖 レシピ情報</h3>
                <div className="h-full">
                  {showRecipeHint && currentRecipe ? (
                    <div className="p-3 bg-green-100 rounded-lg border border-green-300 h-full overflow-y-auto">
                      <h4 className="text-base font-bold text-green-800 mb-3">{currentRecipe.name} の作り方</h4>
                      
                      <div className="mb-3">
                        <h5 className="text-sm font-semibold text-green-700 mb-2">必要な材料:</h5>
                        <div className="space-y-1">
                          {Object.entries(currentRecipe.reactants).map(([formula, amount]) => (
                            <div key={formula} className="flex justify-between text-sm">
                              <span className="text-green-700">{formula}</span>
                              <span className="font-semibold text-green-800">{amount} mol</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-sm font-semibold text-green-700 mb-2">生成物:</h5>
                        <div className="text-sm text-green-700">
                          <span className="font-semibold">{currentRecipe.product.name}</span>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-green-700 mb-2">説明:</h5>
                        <p className="text-sm text-green-600">{currentRecipe.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-gray-500 italic text-sm mb-3">レシピを購入して詳細を確認しましょう</p>
                      <button 
                        onClick={buyRecipe}
                        className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-yellow-600 transition shadow-md"
                      >
                        💡 レシピを購入 ({recipeCost}円)
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* お皿統合エリア */}
              <div className="bg-gray-100 rounded-lg border border-gray-300 p-3 overflow-hidden" style={{ height: 'calc(50% - 24px)' }}>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">🍽️ お皿</h3>
                
                <div className="grid grid-cols-2 gap-2 overflow-hidden" style={{ height: 'calc(100% - 30px)' }}>
                  {/* 左側：生成物質・未反応物質 */}
                  <div className="bg-white rounded p-2 border border-gray-200 flex flex-col overflow-hidden">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">生成物・未反応物</h4>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {plateProducts.length === 0 && plateUnreacted.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">まだ何も生成されていません...</p>
                      ) : (
                        <>
                          {plateProducts.map((product, index) => (
                            <div key={`product-${index}`} className="p-1.5 bg-green-50 rounded border border-green-200">
                              <span className="font-semibold text-green-700 text-sm">{product.formula}</span>
                              <span className="text-green-600 ml-2 text-sm">{product.amount.toFixed(2)} mol</span>
                              <div className="text-sm text-gray-600 truncate">{product.name}</div>
                            </div>
                          ))}
                          {plateUnreacted.map((unreacted, index) => (
                            <div key={`unreacted-${index}`} className="p-1.5 bg-red-50 rounded border border-red-200">
                              <span className="font-semibold text-red-700 text-sm">{unreacted.formula}</span>
                              <span className="text-red-600 ml-2 text-sm">{unreacted.amount.toFixed(2)} mol</span>
                              <div className="text-sm text-gray-600 truncate">{unreacted.name}</div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* 右側：お客様の反応 */}
                  <div className="bg-purple-50 rounded p-2 border border-purple-200 flex flex-col overflow-hidden">
                    <h4 className="font-semibold text-purple-700 mb-2 text-sm">💬 お客様の反応</h4>
                    <div className="flex-1 text-purple-700 overflow-y-auto text-sm">
                      {customerFeedbackMsg ? (
                        <div className="whitespace-pre-line">
                          {customerFeedbackMsg.split('\n').map((line, index) => (
                            <div key={index} className={index === 0 ? 'text-sm font-bold' : 'text-sm'}>
                              {line}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">お客様の反応を待っています...</p>
                      )}
                    </div>
                    
                    {/* 結果ボタン */}
                    {showResults && (
                      <div className="mt-2 space-y-1 flex-shrink-0">
                        <button 
                          onClick={nextOrder}
                          className="w-full bg-green-600 text-white font-bold py-1.5 rounded hover:bg-green-700 transition text-sm"
                        >
                          次のお客様 →
                        </button>
                        <button 
                          onClick={retry}
                          className="w-full bg-blue-600 text-white font-bold py-1.5 rounded hover:bg-blue-700 transition text-sm"
                        >
                          リトライ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </>
  );
}