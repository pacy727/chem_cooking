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
import Pantry from '../game/Pantry';
import ChemiPot from '../game/ChemiPot';
import OrderDisplay from '../game/OrderDisplay';
import PlateDisplay from '../game/PlateDisplay';
import CustomerFeedback from '../game/CustomerFeedback';
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

  // プレート表示状態
  const [plateEmoji, setPlateEmoji] = useState('🍽️');
  const [plateName, setPlateName] = useState('');
  const [plateAmount, setPlateAmount] = useState('');
  const [plateExcess, setPlateExcess] = useState<{ name: string; amount: string } | null>(null);
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
    setPlateEmoji('🍽️');
    setPlateName('');
    setPlateAmount('');
    setPlateExcess(null);
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
    
    // プレート表示更新
    if (result.bonusRate > 0) {
      setPlateEmoji(currentRecipe?.product.emoji || '🍽️');
      setPlateName(result.product.name);
      setPlateAmount(`${result.product.mols.toFixed(2)} mol`);
      
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
      setPlateEmoji('🤢');
      setPlateName('失敗作');
      setPlateAmount('0 mol');
      feedbackMsg = '「買えりマス。」';
      
      // 失敗理由の表示
      if (result.code === 'MISSING_STUFF') {
        feedbackMsg += '\n（材料が足りません...）';
      } else if (result.code === 'EXCESS_MATERIAL') {
        feedbackMsg += `\n（${result.excess.name} が ${result.excess.mols.toFixed(2)} mol 余っています...）`;
        setPlateExcess({ name: result.excess.name, amount: `${result.excess.mols.toFixed(2)} mol` });
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
      <div className="max-w-6xl mx-auto p-4 bg-white rounded-2xl shadow-xl">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6 p-4 bg-yellow-100 rounded-xl">
          <div>
            <h1 className="font-lobster text-4xl font-bold text-yellow-600" style={{ fontFamily: 'Lobster, cursive' }}>
              La Cucina Chimica
            </h1>
            <p className="text-lg text-gray-700">
              所持金: <span className="font-bold text-yellow-600">¥{money.toLocaleString()}</span>
            </p>
            
            {/* ユーザー情報（ログイン時のみ） */}
            {userData && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{userData.chefName}</span> シェフ ({userData.storeName}) | 
                Lv.{userData.level} | 
                EXP: {userData.exp}/{getExpForLevel(userData.level)}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* スキルボタン（ログイン時のみ） */}
            {userData && (
              <button 
                onClick={() => setShowSkillModal(true)}
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                スキル <Star className="w-4 h-4" />
              </button>
            )}
            
            <button 
              onClick={onReturnHome}
              className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> ホーム
            </button>
            <button 
              onClick={onLogout}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> 退勤
            </button>
          </div>
        </div>

        {/* メインゲームエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左：パントリー */}
          <div className="lg:col-span-1">
            <Pantry 
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
              onIngredientClick={(formula, ingredient) => {
                setSelectedIngredient({ formula, ingredient });
                setShowIngredientModal(true);
              }}
            />
          </div>

          {/* 中央：調理エリア */}
          <div className="lg:col-span-1">
            {currentOrder && (
              <OrderDisplay order={currentOrder} />
            )}
            
            <ChemiPot 
              contents={potContents}
              onClear={clearPot}
              userData={userData}
              onSalvage={(formula) => {
                // サルベージ処理
                setPotContents(prev => {
                  const newContents = { ...prev };
                  delete newContents[formula];
                  return newContents;
                });
              }}
            />
            
            {/* 反応ボタン */}
            <div className="mb-6 text-center">
              <button 
                onClick={performReaction}
                disabled={isProcessing}
                className="bg-red-600 text-white font-bold text-2xl py-4 px-8 rounded-xl shadow-lg hover:bg-red-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '反応中...' : 'REACTION !!'}
              </button>
            </div>

            {/* レシピヒント */}
            {showRecipeHint && currentRecipe ? (
              <div className="p-4 bg-green-100 rounded-xl border-2 border-green-300">
                <h4 className="text-lg font-semibold text-green-800 mb-2">📖 レシピヒント</h4>
                <div className="text-green-700">
                  <strong>{currentRecipe.product.name}</strong> の作り方:<br />
                  {Object.entries(currentRecipe.reactants).map(([formula, amount]) => (
                    <div key={formula}>• {formula}: {amount} mol</div>
                  ))}
                  <br />
                  <em>{currentRecipe.description}</em>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button 
                  onClick={buyRecipe}
                  className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                >
                  💡 レシピを購入 ({recipeCost}円)
                </button>
              </div>
            )}
          </div>

          {/* 右：結果表示 */}
          <div className="lg:col-span-1">
            <PlateDisplay 
              emoji={plateEmoji}
              name={plateName}
              amount={plateAmount}
              excess={plateExcess}
            />
            
            <CustomerFeedback message={customerFeedbackMsg} />
            
            {/* 結果ボタン */}
            {showResults && (
              <div className="space-y-3">
                <button 
                  onClick={nextOrder}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                >
                  次のお客様 →
                </button>
                <button 
                  onClick={retry}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  同じ注文でリトライ
                </button>
              </div>
            )}
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