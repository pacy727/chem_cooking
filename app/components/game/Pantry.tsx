// app/components/game/Pantry.tsx
'use client';

import { CHEMICAL_REACTIONS } from '../../../lib/data/reactions';

interface PantryProps {
  filterCategory: 'all' | 'gas' | 'solution' | 'solid' | 'metal' | 'organic';
  onFilterChange: (category: 'all' | 'gas' | 'solution' | 'solid' | 'metal' | 'organic') => void;
  onIngredientClick: (formula: string, ingredient: any) => void;
}

export default function Pantry({ filterCategory, onFilterChange, onIngredientClick }: PantryProps) {
  // CHEMICAL_REACTIONSから実際に使用される反応物を抽出
  const getValidReactants = () => {
    const reactants = new Set<string>();
    
    CHEMICAL_REACTIONS.forEach(reaction => {
      reaction.reactants.forEach(reactant => {
        reactants.add(reactant.formula);
      });
    });
    
    return Array.from(reactants);
  };

  // 実際に使用される反応物のみの材料データ
  const createIngredientsFromReactions = () => {
    const validReactants = getValidReactants();
    const fullIngredientsData: Record<string, any> = {
      // 気体
      'H₂': { name: 'H₂', emoji: '💨', category: 'gas', unit: 'L' },
      'O₂': { name: 'O₂', emoji: '💨', category: 'gas', unit: 'L' },
      'N₂': { name: 'N₂', emoji: '💨', category: 'gas', unit: 'L' },
      'Cl₂': { name: 'Cl₂', emoji: '💨', category: 'gas', unit: 'L' },
      'NH₃': { name: 'NH₃', emoji: '💨', category: 'gas', unit: 'L' },
      'CO₂': { name: 'CO₂', emoji: '💨', category: 'gas', unit: 'L' },
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

    // 実際に反応物として使用される物質のみを抽出
    const validIngredients: Record<string, any> = {};
    validReactants.forEach(formula => {
      if (fullIngredientsData[formula]) {
        validIngredients[formula] = fullIngredientsData[formula];
      }
    });

    return validIngredients;
  };

  const INGREDIENTS_LOCAL = createIngredientsFromReactions();

  const filteredIngredients = Object.entries(INGREDIENTS_LOCAL).filter(([_, ingredient]) => 
    filterCategory === 'all' || ingredient.category === filterCategory
  );

  return (
    <>
      {/* フィルターボタン（参考HTML準拠） */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => onFilterChange('all')}
          className={`filter-btn px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filterCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          全て
        </button>
        <button
          onClick={() => onFilterChange('gas')}
          className={`filter-btn px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filterCategory === 'gas'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          気体
        </button>
        <button
          onClick={() => onFilterChange('solution')}
          className={`filter-btn px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filterCategory === 'solution'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          水溶液
        </button>
        <button
          onClick={() => onFilterChange('solid')}
          className={`filter-btn px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filterCategory === 'solid'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          固体
        </button>
        <button
          onClick={() => onFilterChange('metal')}
          className={`filter-btn px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filterCategory === 'metal'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          金属
        </button>
        <button
          onClick={() => onFilterChange('organic')}
          className={`filter-btn px-3 py-1 rounded text-sm font-semibold transition-colors ${
            filterCategory === 'organic'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          有機
        </button>
      </div>
      
      {/* 材料カードグリッド（5カラム、正方形角丸） */}
      <div className="grid grid-cols-5 gap-3 h-56 overflow-y-auto">
        {filteredIngredients.map(([formula, ingredient]) => (
          <button
            key={formula}
            onClick={() => onIngredientClick(formula, ingredient)}
            className="p-3 bg-gray-50 rounded-xl shadow-sm hover:bg-yellow-100 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col items-center justify-center aspect-square"
          >
            <span className="text-4xl">{ingredient.emoji}</span>
            <span className="block text-sm font-semibold mt-1">{ingredient.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}