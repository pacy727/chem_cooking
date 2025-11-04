// app/components/game/Pantry.tsx
'use client';

interface PantryProps {
  filterCategory: 'all' | 'gas' | 'solution' | 'solid' | 'metal';
  onFilterChange: (category: 'all' | 'gas' | 'solution' | 'solid' | 'metal') => void;
  onIngredientClick: (formula: string, ingredient: any) => void;
}

export default function Pantry({ filterCategory, onFilterChange, onIngredientClick }: PantryProps) {
  // 新しい材料データ
  const INGREDIENTS_LOCAL: Record<string, any> = {
    // 気体
    'O2': { name: 'O₂', emoji: '💨', category: 'gas', unit: 'L' },
    'H2': { name: 'H₂', emoji: '💨', category: 'gas', unit: 'L' },
    'CO2': { name: 'CO₂', emoji: '💨', category: 'gas', unit: 'L' },
    'N2': { name: 'N₂', emoji: '💨', category: 'gas', unit: 'L' },
    'Cl2': { name: 'Cl₂', emoji: '💨', category: 'gas', unit: 'L' },
    'NH3': { name: 'NH₃', emoji: '💨', category: 'gas', unit: 'L' },
    
    // 水溶液
    'HCl': { name: 'HCl', emoji: '🧪', category: 'solution', unit: 'mL' },
    'H2SO4': { name: 'H₂SO₄', emoji: '🧪', category: 'solution', unit: 'mL' },
    'HNO3': { name: 'HNO₃', emoji: '🧪', category: 'solution', unit: 'mL' },
    'NaOH': { name: 'NaOH', emoji: '🧪', category: 'solution', unit: 'mL' },
    'H2O': { name: 'H₂O', emoji: '💧', category: 'solution', unit: 'mL' },
    
    // 固体
    'NaCl': { name: 'NaCl', emoji: '🧂', category: 'solid', unit: 'g' },
    'CaCO3': { name: 'CaCO₃', emoji: '⚪', category: 'solid', unit: 'g' },
    'C': { name: 'C', emoji: '⚫', category: 'solid', unit: 'g' },
    'S': { name: 'S', emoji: '🟡', category: 'solid', unit: 'g' },
    'I2': { name: 'I₂', emoji: '🟣', category: 'solid', unit: 'g' },
    
    // 金属
    'Fe': { name: 'Fe', emoji: '🔩', category: 'metal', unit: 'g' },
    'Cu': { name: 'Cu', emoji: '🟤', category: 'metal', unit: 'g' },
    'Zn': { name: 'Zn', emoji: '⚪', category: 'metal', unit: 'g' },
    'Al': { name: 'Al', emoji: '⚪', category: 'metal', unit: 'g' },
    'Mg': { name: 'Mg', emoji: '⚪', category: 'metal', unit: 'g' },
    'Na': { name: 'Na', emoji: '🟡', category: 'metal', unit: 'g' }
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
          { label: '金属', value: 'metal' as const }
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