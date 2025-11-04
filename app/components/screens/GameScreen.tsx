// app/components/screens/GameScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData, Order, Recipe, FilterCategory } from '../../../lib/types';
import { RECIPES, CUSTOMERS } from '../../../lib/data/gameData';
import { 
  calculateReaction, 
  calculateLevelUp, 
  saveUserData, 
  getExpForLevel, 
  checkFailureForgiveness,
  calculateRecipeCost,
  checkVipCustomer
} from '../../../lib/utils/gameUtils';
import ChemiPot from '../game/ChemiPot';
import OrderDisplay from '../game/OrderDisplay';
import SkillModal from '../modals/SkillModal';
import IngredientModal from '../modals/IngredientModal';
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
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  
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

  const addToPot = (formula: string, amount: number, cost: number) => {
    if (money < cost) {
      toast.error('お金が足りません！');
      return;
    }
    
    updateMoney(-cost);
    setPotContents(prev => ({
      ...prev,
      [formula]: (prev[formula] || 0) + amount
    }));
    
    setShowIngredientModal(false);
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
      <div className="h-screen w-full bg-white shadow-xl flex flex-col overflow-hidden">
        {/* ヘッダー（76px: 60px高さ + 8px上下margin） */}
        <div className="flex justify-between items-center px-4 py-2 bg-yellow-100 rounded-xl flex-shrink-0 mx-4 mt-2 mb-2" style={{ height: '60px' }}>
          <div className="flex items-center gap-4">
            {/* タイトル */}
            <h1 className="font-lobster text-lg font-bold text-yellow-600" style={{ fontFamily: 'Lobster, cursive' }}>
              La Cucina Chimica
            </h1>
            
            {/* ユーザー情報 */}
            {userData && (
              <div className="text-sm text-gray-700 hidden md:block">
                <span className="font-semibold">{userData.chefName}</span> ({userData.storeName}) | 
                Lv.{userData.level} | 
                EXP: {userData.exp}/{getExpForLevel(userData.level)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* 資本金 */}
            <div className="text-lg font-bold text-yellow-600">
              ¥{money.toLocaleString()}
            </div>
            
            {/* ボタン群 */}
            <div className="flex gap-2">
              {userData && (
                <button 
                  onClick={() => setShowSkillModal(true)}
                  className="bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-600 transition flex items-center"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              
              <button 
                onClick={onReturnHome}
                className="bg-gray-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition flex items-center"
              >
                <Home className="w-4 h-4" />
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-600 transition flex items-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* メインエリア（100vh - ヘッダー76px - 全体padding32px = calc(100vh - 108px)） */}
        <div className="px-4 pb-4" style={{ height: 'calc(100vh - 108px)' }}>
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* 左カラム：パントリー + ケミ鍋 */}
            <div className="flex flex-col gap-3 h-full">
              {/* パントリー */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-3 overflow-hidden" style={{ height: '65%' }}>
                <h2 className="text-sm font-semibold mb-2 text-gray-800">🥬 パントリー</h2>
                
                {/* フィルターボタン */}
                <div className="mb-2 flex flex-wrap gap-1">
                  {[
                    { label: '全て', value: 'all' as FilterCategory },
                    { label: '金属', value: 'metal' as FilterCategory },
                    { label: '酸', value: 'acid' as FilterCategory },
                    { label: '塩基', value: 'base' as FilterCategory },
                    { label: '塩', value: 'salt' as FilterCategory },
                    { label: '気体', value: 'gas' as FilterCategory },
                    { label: '有機', value: 'organic' as FilterCategory },
                    { label: 'その他', value: 'other' as FilterCategory }
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setFilterCategory(value)}
                      className={`px-2 py-0.5 rounded-full font-semibold text-xs transition-all ${
                        filterCategory === value
                          ? 'bg-yellow-500 text-white transform scale-105 shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                
                {/* 材料リスト */}
                <div className="bg-gray-50 p-2 rounded-xl overflow-y-auto" style={{ height: 'calc(100% - 70px)' }}>
                  {(() => {
                    // インライン材料データ
                    const INGREDIENTS: Record<string, any> = {
                      'Fe': { name: 'Fe (鉄)', price: 100, category: 'metal' },
                      'Cu': { name: 'Cu (銅)', price: 120, category: 'metal' },
                      'Zn': { name: 'Zn (亜鉛)', price: 110, category: 'metal' },
                      'HCl': { name: 'HCl (塩酸)', price: 50, category: 'acid' },
                      'H2SO4': { name: 'H₂SO₄ (硫酸)', price: 60, category: 'acid' },
                      'NaOH': { name: 'NaOH (水酸化ナトリウム)', price: 45, category: 'base' },
                      'NH3': { name: 'NH₃ (アンモニア)', price: 55, category: 'base' },
                      'NaCl': { name: 'NaCl (塩化ナトリウム)', price: 20, category: 'salt' },
                      'O2': { name: 'O₂ (酸素)', price: 25, category: 'gas' },
                      'H2': { name: 'H₂ (水素)', price: 30, category: 'gas' },
                      'H2O': { name: 'H₂O (水)', price: 5, category: 'other' }
                    };
                    
                    const filteredIngredients = Object.entries(INGREDIENTS).filter(([_, ingredient]) => 
                      filterCategory === 'all' || ingredient.category === filterCategory
                    );
                    
                    return (
                      <div className="space-y-1">
                        {filteredIngredients.map(([formula, ingredient]) => (
                          <div
                            key={formula}
                            onClick={() => {
                              setSelectedIngredient({ formula, ingredient });
                              setShowIngredientModal(true);
                            }}
                            className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-800 text-xs">{ingredient.name}</p>
                                <p className="text-xs text-gray-600">¥{ingredient.price}/mol</p>
                              </div>
                              <button className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-600 transition">
                                追加
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* ケミ鍋エリア */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-3 overflow-hidden" style={{ height: 'calc(35% - 12px)' }}>
                <div style={{ height: 'calc(100% - 60px)' }}>
                  <ChemiPot 
                    contents={potContents}
                    onClear={clearPot}
                    userData={userData}
                    onSalvage={(formula) => {
                      setPotContents(prev => {
                        const newContents = { ...prev };
                        delete newContents[formula];
                        return newContents;
                      });
                    }}
                  />
                </div>
                
                {/* 反応ボタン */}
                <div className="mt-1 text-center">
                  <button 
                    onClick={performReaction}
                    disabled={isProcessing}
                    className="bg-red-600 text-white font-bold text-xs py-1 px-3 rounded-lg shadow-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? '反応中...' : 'REACTION !!'}
                  </button>
                </div>

                {/* レシピヒント */}
                <div className="mt-1">
                  {showRecipeHint && currentRecipe ? (
                    <div className="p-1 bg-green-100 rounded border border-green-300">
                      <h4 className="text-xs font-semibold text-green-800">📖 レシピ</h4>
                      <div className="text-green-700 text-xs">
                        {Object.entries(currentRecipe.reactants).map(([formula, amount]) => (
                          <span key={formula}>{formula}:{amount} </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button 
                        onClick={buyRecipe}
                        className="bg-yellow-500 text-white font-semibold py-0.5 px-2 rounded text-xs hover:bg-yellow-600 transition"
                      >
                        💡 レシピ ({recipeCost}円)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右カラム：注文 + お皿統合エリア */}
            <div className="flex flex-col gap-3 h-full">
              {/* 注文表示 */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-3 overflow-hidden" style={{ height: '35%' }}>
                {currentOrder && (
                  <OrderDisplay order={currentOrder} />
                )}
              </div>
              
              {/* お皿統合エリア */}
              <div className="bg-gray-100 rounded-xl border-2 border-gray-300 p-3 overflow-hidden" style={{ height: 'calc(65% - 12px)' }}>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">🍽️ お皿</h3>
                
                <div className="grid grid-cols-2 gap-2 overflow-hidden" style={{ height: 'calc(100% - 30px)' }}>
                  {/* 左側：生成物質・未反応物質 */}
                  <div className="bg-white rounded-lg p-2 border border-gray-200 flex flex-col overflow-hidden">
                    <h4 className="font-semibold text-gray-700 mb-1 text-xs">生成物・未反応物</h4>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {plateProducts.length === 0 && plateUnreacted.length === 0 ? (
                        <p className="text-gray-500 italic text-xs">まだ何も生成されていません...</p>
                      ) : (
                        <>
                          {plateProducts.map((product, index) => (
                            <div key={`product-${index}`} className="p-1 bg-green-50 rounded border border-green-200">
                              <span className="font-semibold text-green-700 text-xs">{product.formula}</span>
                              <span className="text-green-600 ml-1 text-xs">{product.amount.toFixed(2)} mol</span>
                              <div className="text-xs text-gray-600 truncate">{product.name}</div>
                            </div>
                          ))}
                          {plateUnreacted.map((unreacted, index) => (
                            <div key={`unreacted-${index}`} className="p-1 bg-red-50 rounded border border-red-200">
                              <span className="font-semibold text-red-700 text-xs">{unreacted.formula}</span>
                              <span className="text-red-600 ml-1 text-xs">{unreacted.amount.toFixed(2)} mol</span>
                              <div className="text-xs text-gray-600 truncate">{unreacted.name}</div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* 右側：お客様の反応 */}
                  <div className="bg-purple-50 rounded-lg p-2 border border-purple-200 flex flex-col overflow-hidden">
                    <h4 className="font-semibold text-purple-700 mb-1 text-xs">💬 お客様の反応</h4>
                    <div className="flex-1 text-purple-700 overflow-y-auto text-xs">
                      {customerFeedbackMsg ? (
                        <div className="whitespace-pre-line">
                          {customerFeedbackMsg.split('\n').map((line, index) => (
                            <div key={index} className={index === 0 ? 'text-sm font-bold' : 'text-xs'}>
                              {line}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-xs">お客様の反応を待っています...</p>
                      )}
                    </div>
                    
                    {/* 結果ボタン */}
                    {showResults && (
                      <div className="mt-1 space-y-1 flex-shrink-0">
                        <button 
                          onClick={nextOrder}
                          className="w-full bg-green-600 text-white font-bold py-1 px-1 rounded hover:bg-green-700 transition text-xs"
                        >
                          次のお客様 →
                        </button>
                        <button 
                          onClick={retry}
                          className="w-full bg-blue-600 text-white font-bold py-1 px-1 rounded hover:bg-blue-700 transition text-xs"
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
          onAddToPot={addToPot}
        />
      )}
    </>
  );
}