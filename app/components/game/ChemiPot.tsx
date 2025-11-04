// app/components/game/ChemiPot.tsx
'use client';

import { UserData } from '../../../lib/types';
import { INGREDIENTS } from '../../../lib/data/gameData';
import { attemptSalvage } from '../../../lib/utils/gameUtils';
import toast from 'react-hot-toast';

interface ChemiPotProps {
  contents: Record<string, number>;
  onSalvage: (formula: string) => void;
  userData: UserData | null;
  isProcessing: boolean;
}

export default function ChemiPot({ contents, onSalvage, userData, isProcessing }: ChemiPotProps) {
  const handleSalvage = (formula: string) => {
    if (isProcessing) {
      toast.error('調理中は回収できません！');
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
      toast.success(`${ingredient.name} を回収しました！\n+¥${Math.floor(recoveredAmount)}`);
      onSalvage(formula);
    } else {
      toast.error(`${ingredient.name} の回収に失敗しました...`);
    }
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
        
        {/* 投入した材料リスト */}
        <div className="flex-1 h-20 bg-white rounded-lg shadow-md p-2 overflow-y-auto border border-orange-400">
          {itemsArray.length === 0 ? (
            <p className="text-gray-400 text-center italic text-sm">ここに材料が入ります</p>
          ) : (
            <div className="space-y-1">
              {itemsArray.map(([formula, amount]) => {
                const ingredient = INGREDIENTS[formula];
                return (
                  <div 
                    key={formula}
                    className="flex justify-between items-center bg-orange-50 p-1 rounded text-xs"
                  >
                    <div>
                      <span className="font-semibold text-orange-800">{ingredient?.name || formula}</span>
                      <span className="text-orange-600 ml-1">{amount.toFixed(2)} mol</span>
                    </div>
                    <button 
                      onClick={() => handleSalvage(formula)}
                      disabled={isProcessing}
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded transition ${
                        isProcessing 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-500 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      回収
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}