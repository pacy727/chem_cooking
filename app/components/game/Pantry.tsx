// app/components/game/Pantry.tsx
'use client';

import { INGREDIENTS } from '../../../lib/data/gameData';
import { FilterCategory } from '../../../lib/types';

interface PantryProps {
  filterCategory: FilterCategory;
  onFilterChange: (category: FilterCategory) => void;
  onIngredientClick: (formula: string, ingredient: any) => void;
}

export default function Pantry({ filterCategory, onFilterChange, onIngredientClick }: PantryProps) {
  const filterButtons: Array<{ label: string; value: FilterCategory }> = [
    { label: '全て', value: 'all' },
    { label: '金属', value: 'metal' },
    { label: '酸', value: 'acid' },
    { label: '塩基', value: 'base' },
    { label: '塩', value: 'salt' },
    { label: '気体', value: 'gas' },
    { label: '有機', value: 'organic' },
    { label: 'その他', value: 'other' }
  ];

  const filteredIngredients = Object.entries(INGREDIENTS).filter(([_, ingredient]) => 
    filterCategory === 'all' || ingredient.category === filterCategory
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">🥬 パントリー (材料庫)</h2>
      
      {/* フィルターボタン */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filterButtons.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`px-3 py-1 rounded-full font-semibold text-sm transition-all ${
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
      <div className="space-y-2 max-h-96 overflow-y-auto bg-gray-50 p-3 rounded-xl">
        {filteredIngredients.map(([formula, ingredient]) => (
          <div
            key={formula}
            onClick={() => onIngredientClick(formula, ingredient)}
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{ingredient.name}</p>
                <p className="text-sm text-gray-600">¥{ingredient.price}/mol</p>
              </div>
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition">
                追加
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
