// app/components/game/ChemiPot.tsx
'use client';

import { UserData } from '../../../lib/types';
import { INGREDIENTS } from '../../../lib/data/gameData';
import { attemptSalvage } from '../../../lib/utils/gameUtils';
import toast from 'react-hot-toast';

interface ChemiPotProps {
  contents: Record<string, number>;
  onClear: () => void;
  userData: UserData | null;
  onSalvage: (formula: string) => void;
}

export default function ChemiPot({ contents, onClear, userData, onSalvage }: ChemiPotProps) {
  const handleSalvage = (formula: string) => {
    const amount = contents[formula];
    if (!amount) return;

    const ingredient = INGREDIENTS[formula];
    const { success, recoveredAmount } = attemptSalvage(formula, amount, userData);

    if (success) {
      toast.success(`${ingredient.name} ${amount.toFixed(2)} mol を回収しました！\n+¥${Math.floor(recoveredAmount)}`);
      // 実際のお金の更新は親コンポーネントで処理
    } else {
      toast.error(`${ingredient.name} の回収に失敗しました...`);
    }

    onSalvage(formula);
  };

  return (
    <div className="mb-6 p-4 bg-orange-100 rounded-xl border-2 border-orange-300">
      <h3 className="text-lg font-semibold text-orange-800 mb-2">🍲 ケミ鍋</h3>
      <div className="min-h-32 bg-orange-200 rounded-lg p-3 border-2 border-orange-400">
        {Object.keys(contents).length === 0 ? (
          <p className="text-gray-600 italic">ここに材料を入れてください...</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(contents).map(([formula, amount]) => {
              const ingredient = INGREDIENTS[formula];
              return (
                <div 
                  key={formula}
                  className="flex justify-between items-center bg-orange-300 p-2 rounded mb-2 animate-pulse"
                >
                  <span className="font-semibold">{ingredient.name}</span>
                  <div className="flex items-center gap-2">
                    <span>{amount.toFixed(2)} mol</span>
                    <button 
                      onClick={() => handleSalvage(formula)}
                      className="text-xs text-red-500 font-semibold px-2 py-1 bg-red-100 rounded hover:bg-red-500 hover:text-white transition"
                    >
                      回収
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button 
        onClick={onClear}
        className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"
      >
        鍋を空にする
      </button>
    </div>
  );
}
