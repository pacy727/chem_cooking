// app/components/game/ChemiPot.tsx
'use client';

import { UserData } from '../../../lib/types';
import { INGREDIENTS } from '../../../lib/data/gameData';
import { attemptSalvage } from '../../../lib/utils/gameUtils';
import toast from 'react-hot-toast';

// 数値フォーマット関数：右側の不要な0を削除
const formatNumber = (num: number, decimalPlaces: number = 2): string => {
  return parseFloat(num.toFixed(decimalPlaces)).toString();
};

interface ChemiPotProps {
  contents: Record<string, number>;
  onSalvage: (formula: string) => void;
  userData: UserData | null;
  isProcessing: boolean;
  reactionCompleted: boolean;  // ← 追加
}

export default function ChemiPot({ contents, onSalvage, userData, isProcessing,reactionCompleted }: ChemiPotProps) {
  const handleSalvage = (formula: string) => {
    if (isProcessing|| reactionCompleted) {
      toast.error('調理中または調理完了後は回収できません！');
      return;
    }

    const amount = contents[formula];
    if (!amount) return;

    // サルベージスキルチェック
    const salvageSkillLevel = userData?.skills.salvage || 0;
    if (salvageSkillLevel === 0) {
      toast.error('サルベージスキル (Lv1) がないと回収できません！');
      return;
    }

    const ingredient = INGREDIENTS[formula];
    const { success, recoveredAmount } = attemptSalvage(formula, amount, userData);

    if (success) {
      toast.success(`${ingredient.name} を回収しました！\n+¥${Math.ceil(recoveredAmount)}`);
      onSalvage(formula);
    } else {
      toast.error(`${ingredient.name} の回収に失敗しました...`);
    }
  };

  // 化学式の下付き数字変換関数
  const formatChemicalFormula = (formula: string): string => {
    if (formula.includes('₂') || formula.includes('₃') || formula.includes('₄')) {
      return formula;
    }
    
    return formula
      .replace(/2/g, '₂')
      .replace(/3/g, '₃')
      .replace(/4/g, '₄')
      .replace(/5/g, '₅')
      .replace(/6/g, '₆')
      .replace(/7/g, '₇')
      .replace(/8/g, '₈')
      .replace(/9/g, '₉')
      .replace(/0/g, '₀')
      .replace(/1/g, '₁');
  };

  const itemsArray = Object.entries(contents);
  const itemCount = itemsArray.length;

  return (
    <div>
      <h3 className="text-sm font-semibold text-orange-800 mb-2">🍲 ケミ鍋</h3>
      
      <div className="flex items-center gap-4">
        {/* ケミ鍋ビジュアル */}
        <div className={`w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center relative shadow-inner ${isProcessing ? 'animate-pulse' : ''}`}>
          <span className={`text-4xl ${isProcessing ? 'pot-bubble' : ''}`}>🍲</span>
          {/* 材料の数 */}
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {itemCount}
          </div>
        </div>
        
        {/* 投入した材料リスト - {□+□}デザイン */}
        <div className="flex-1 h-20 bg-white rounded-lg shadow-md p-2 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {/* 材料1（左側） */}
            <div className={`w-20 h-16 border-2 rounded-lg flex flex-col items-center justify-center text-xs ${
              itemsArray[0] ? 'border-orange-400 bg-orange-50' : 'border-dashed border-gray-300 bg-gray-50'
            }`}>
              {itemsArray[0] ? (
                <>
                  <div className="font-semibold text-orange-800 leading-tight">
                    {formatChemicalFormula(itemsArray[0][0])}
                  </div>
                  <div className="text-orange-600 text-xs">
                    {formatNumber(itemsArray[0][1])} mol
                  </div>
                  <button
                    onClick={() => handleSalvage(itemsArray[0][0])}
                    disabled={isProcessing || reactionCompleted}  // ← reactionCompleted を追加
                    className={`text-xs font-semibold px-1 py-0.5 rounded mt-1 transition ${
                      isProcessing || reactionCompleted  // ← ここにも追加
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    回収
                  </button>
                </>
              ) : (
                <span className="text-gray-400 text-lg">□</span>
              )}
            </div>
            
            {/* プラス記号 */}
            <span className="text-xl font-bold text-gray-600">+</span>
            
            {/* 材料2（右側） */}
            <div className={`w-20 h-16 border-2 rounded-lg flex flex-col items-center justify-center text-xs ${
              itemsArray[1] ? 'border-orange-400 bg-orange-50' : 'border-dashed border-gray-300 bg-gray-50'
            }`}>
              {itemsArray[1] ? (
                <>
                  <div className="font-semibold text-orange-800 leading-tight">
                    {formatChemicalFormula(itemsArray[1][0])}
                  </div>
                  <div className="text-orange-600 text-xs">
                    {formatNumber(itemsArray[1][1])} mol
                  </div>
                  <button
                    onClick={() => handleSalvage(itemsArray[1][0])}
                    disabled={isProcessing || reactionCompleted}  // ← reactionCompleted を追加
                    className={`text-xs font-semibold px-1 py-0.5 rounded mt-1 transition ${
                      isProcessing || reactionCompleted  // ← ここにも追加
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    回収
                  </button>
                </>
              ) : (
                <span className="text-gray-400 text-lg">□</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}