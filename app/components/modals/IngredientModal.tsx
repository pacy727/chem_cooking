// app/components/modals/IngredientModal.tsx
'use client';

import { useState } from 'react';
import { UserData, Ingredient } from '../../../lib/types';
import { calculateIngredientCost } from '../../../lib/utils/gameUtils';
import { X } from 'lucide-react';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: string;
  ingredient: Ingredient;
  userData: UserData | null;
  onAddToPot: (formula: string, amount: number, cost: number) => void;
}

export default function IngredientModal({ 
  isOpen, 
  onClose, 
  formula, 
  ingredient, 
  userData, 
  onAddToPot 
}: IngredientModalProps) {
  const [amount, setAmount] = useState(1.0);

  if (!isOpen) return null;

  const cost = calculateIngredientCost(formula, amount, userData);

  const handleAdd = () => {
    if (amount > 0) {
      onAddToPot(formula, amount, cost);
    }
  };

  const categoryLabels: Record<string, string> = {
    metal: '金属',
    acid: '酸',
    base: '塩基',
    salt: '塩',
    gas: '気体',
    organic: '有機化合物',
    other: 'その他'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{ingredient.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-3">
          <p><strong>化学式:</strong> {formula}</p>
          <p><strong>基本価格:</strong> ¥{ingredient.price} / mol</p>
          <p><strong>実際のコスト:</strong> ¥{cost.toFixed(0)} / {amount.toFixed(1)} mol</p>
          <p><strong>種類:</strong> {categoryLabels[ingredient.category] || ingredient.category}</p>
          <p><strong>説明:</strong> {ingredient.description}</p>
          
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">追加する量 (mol):</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full border-gray-300 rounded-lg p-2 border" 
              min="0" 
              step="0.1"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleAdd}
              className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition"
            >
              鍋に追加 (¥{cost.toFixed(0)})
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
