// app/components/game/Pantry.tsx
'use client';

interface PantryProps {
  filterCategory: 'all' | 'gas' | 'solution' | 'solid' | 'metal' | 'organic';
  onFilterChange: (category: 'all' | 'gas' | 'solution' | 'solid' | 'metal' | 'organic') => void;
  onIngredientClick: (formula: string, ingredient: any) => void;
}

export default function Pantry({ filterCategory, onFilterChange, onIngredientClick }: PantryProps) {
  // 全化学反応の反応物を網羅した材料データ
  const INGREDIENTS_LOCAL: Record<string, any> = {
    // 気体
    'H₂': { name: 'H₂', emoji: '💨', category: 'gas', unit: 'L' },
    'O₂': { name: 'O₂', emoji: '💨', category: 'gas', unit: 'L' },
    'N₂': { name: 'N₂', emoji: '💨', category: 'gas', unit: 'L' },
    'Cl₂': { name: 'Cl₂', emoji: '💨', category: 'gas', unit: 'L' },
    'NH₃': { name: 'NH₃', emoji: '💨', category: 'gas', unit: 'L' },
    'CO₂': { name: 'CO₂', emoji: '💨', category: 'gas', unit: 'L' },
    'NO': { name: 'NO', emoji: '💨', category: 'gas', unit: 'L' },
    'NO₂': { name: 'NO₂', emoji: '💨', category: 'gas', unit: 'L' },
    'SO₂': { name: 'SO₂', emoji: '💨', category: 'gas', unit: 'L' },
    'H₂S': { name: 'H₂S', emoji: '💨', category: 'gas', unit: 'L' },
    'HF': { name: 'HF', emoji: '💨', category: 'gas', unit: 'L' },
    'Br₂': { name: 'Br₂', emoji: '💨', category: 'gas', unit: 'L' },
    
    // 水溶液（酸・塩基）
    'HCl': { name: 'HCl', emoji: '🧪', category: 'solution', unit: 'mL' },
    'H₂SO₄': { name: 'H₂SO₄', emoji: '🧪', category: 'solution', unit: 'mL' },
    'HNO₃': { name: 'HNO₃', emoji: '🧪', category: 'solution', unit: 'mL' },
    'CH₃COOH': { name: 'CH₃COOH', emoji: '🧪', category: 'solution', unit: 'mL' },
    'NaOH': { name: 'NaOH', emoji: '🧪', category: 'solution', unit: 'mL' },
    'KOH': { name: 'KOH', emoji: '🧪', category: 'solution', unit: 'mL' },
    'Ca(OH)₂': { name: 'Ca(OH)₂', emoji: '🧪', category: 'solution', unit: 'mL' },
    'Al(OH)₃': { name: 'Al(OH)₃', emoji: '🧪', category: 'solution', unit: 'mL' },
    'Mg(OH)₂': { name: 'Mg(OH)₂', emoji: '🧪', category: 'solution', unit: 'mL' },
    'Ba(OH)₂': { name: 'Ba(OH)₂', emoji: '🧪', category: 'solution', unit: 'mL' },
    'H₂O': { name: 'H₂O', emoji: '💧', category: 'solution', unit: 'mL' },
    
    // 固体（塩・酸化物）
    'NaCl': { name: 'NaCl', emoji: '🧂', category: 'solid', unit: 'g' },
    'CaCO₃': { name: 'CaCO₃', emoji: '⚪', category: 'solid', unit: 'g' },
    'MnO₂': { name: 'MnO₂', emoji: '⚫', category: 'solid', unit: 'g' },
    'KI': { name: 'KI', emoji: '🟣', category: 'solid', unit: 'g' },
    'KMnO₄': { name: 'KMnO₄', emoji: '🟣', category: 'solid', unit: 'g' },
    'Fe₂O₃': { name: 'Fe₂O₃', emoji: '🟤', category: 'solid', unit: 'g' },
    'P₄': { name: 'P₄', emoji: '🟡', category: 'solid', unit: 'g' },
    'C': { name: 'C', emoji: '⚫', category: 'solid', unit: 'g' },
    'S': { name: 'S', emoji: '🟡', category: 'solid', unit: 'g' },
    'I₂': { name: 'I₂', emoji: '🟣', category: 'solid', unit: 'g' },
    
    // 金属
    'Mg': { name: 'Mg', emoji: '⚪', category: 'metal', unit: 'g' },
    'Al': { name: 'Al', emoji: '⚪', category: 'metal', unit: 'g' },
    'Zn': { name: 'Zn', emoji: '⚪', category: 'metal', unit: 'g' },
    'Fe': { name: 'Fe', emoji: '🔩', category: 'metal', unit: 'g' },
    'Ca': { name: 'Ca', emoji: '⚪', category: 'metal', unit: 'g' },
    'Cu': { name: 'Cu', emoji: '🟤', category: 'metal', unit: 'g' },
    'Na': { name: 'Na', emoji: '🟡', category: 'metal', unit: 'g' },
    'Ag': { name: 'Ag', emoji: '⚪', category: 'metal', unit: 'g' },
    
    // 有機化合物
    'CH₄': { name: 'CH₄', emoji: '🔥', category: 'organic', unit: 'L' },
    'C₂H₆': { name: 'C₂H₆', emoji: '🔥', category: 'organic', unit: 'L' },
    'C₃H₈': { name: 'C₃H₈', emoji: '🔥', category: 'organic', unit: 'L' },
    'C₂H₄': { name: 'C₂H₄', emoji: '🔥', category: 'organic', unit: 'L' },
    'C₂H₂': { name: 'C₂H₂', emoji: '🔥', category: 'organic', unit: 'L' },
    'C₆H₆': { name: 'C₆H₆', emoji: '🔥', category: 'organic', unit: 'L' },
    'C₄H₁₀': { name: 'C₄H₁₀', emoji: '🔥', category: 'organic', unit: 'L' }
  };

  const filteredIngredients = Object.entries(INGREDIENTS_LOCAL).filter(([_, ingredient]) => 
    filterCategory === 'all' || ingredient.category === filterCategory
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 overflow-hidden h-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-800">🥬 パントリー</h2>
        <span className="text-sm font-semibold text-gray-600">100円/mol</span>
      </div>
      
      {/* フィルターボタン */}
      <div className="mb-2 flex flex-wrap gap-1">
        {[
          { label: 'すべて', value: 'all' as const },
          { label: '気体', value: 'gas' as const },
          { label: '水溶液', value: 'solution' as const },
          { label: '固体', value: 'solid' as const },
          { label: '金属', value: 'metal' as const },
          { label: '有機', value: 'organic' as const }
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`px-2 py-1 rounded-full font-semibold text-sm transition-all ${
              filterCategory === value
                ? 'bg-yellow-500 text-white scale-105 shadow-sm'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* 材料カードグリッド */}
      <div className="bg-gray-50 p-2 rounded-lg overflow-y-auto" style={{ height: 'calc(100% - 70px)' }}>
        <div className="grid grid-cols-4 gap-2">
          {filteredIngredients.map(([formula, ingredient]) => (
            <div
              key={formula}
              onClick={() => onIngredientClick(formula, ingredient)}
              className="bg-white aspect-square rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all flex flex-col items-center justify-center p-2"
            >
              <div className="text-2xl mb-1">{ingredient.emoji}</div>
              <div className="text-xs font-semibold text-gray-800 text-center leading-tight">
                {ingredient.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}