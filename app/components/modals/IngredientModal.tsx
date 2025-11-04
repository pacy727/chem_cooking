// app/components/modals/IngredientModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData } from '../../../lib/types';
import { X } from 'lucide-react';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: string;
  ingredient: {
    name: string;
    emoji: string;
    category: string;
    unit: string;
  };
  userData: UserData | null;
  onAddToPot: (formula: string, amount: number, unit: string) => void;
  concentration?: number;  // 水溶液の濃度 (mol/L)
  molarMass?: number;      // 分子量 (g/mol)
}

export default function IngredientModal({ 
  isOpen, 
  onClose, 
  formula, 
  ingredient, 
  userData, 
  onAddToPot,
  concentration,
  molarMass
}: IngredientModalProps) {
  const [amount, setAmount] = useState<string>(''); // 空白初期値

  // Enterキー処理
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isOpen) {
        handleAdd();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, amount]);

  // モーダルが開かれたときに入力欄にフォーカス
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = document.getElementById('amount-input');
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onAddToPot(formula, numAmount, ingredient.unit);
      setAmount(''); // 追加後にリセット
    }
  };

  const handleIncrement = () => {
    const currentValue = parseFloat(amount) || 0;
    const step = getStepValue();
    setAmount((currentValue + step).toString());
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(amount) || 0;
    const step = getStepValue();
    const newValue = Math.max(0, currentValue - step);
    setAmount(newValue.toString());
  };

  const getStepValue = () => {
    switch (ingredient.unit) {
      case 'L': return 1;
      case 'mL': return 100;
      case 'g': return 10;
      default: return 1;
    }
  };

  const categoryLabels: Record<string, string> = {
    gas: '気体',
    solution: '水溶液',
    solid: '固体',
    metal: '金属'
  };

  const getDescription = () => {
    switch (ingredient.category) {
      case 'gas':
        return '気体状態の物質です。標準状態での体積で測定します。';
      case 'solution':
        return `水溶液状態の物質です。現在の濃度: ${concentration || 1.0} mol/L`;
      case 'solid':
        return `固体状態の物質です。分子量: ${molarMass || 100} g/mol`;
      case 'metal':
        return `金属元素です。原子量: ${molarMass || 100} g/mol`;
      default:
        return '化学物質です。';
    }
  };

  const isValidAmount = amount !== '' && parseFloat(amount) > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ingredient.emoji}</span>
            <h2 className="text-2xl font-bold">{ingredient.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p><strong>化学式:</strong> {formula}</p>
          <p><strong>種類:</strong> {categoryLabels[ingredient.category] || ingredient.category}</p>
          <p><strong>説明:</strong> {getDescription()}</p>

          {/* 濃度・分子量情報表示 */}
          {ingredient.category === 'solution' && concentration && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p><strong>現在の濃度:</strong> {concentration} mol/L</p>
              <p className="text-sm text-gray-600">※注文毎にランダム設定</p>
            </div>
          )}

          {(ingredient.category === 'solid' || ingredient.category === 'metal') && molarMass && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <p><strong>{ingredient.category === 'metal' ? '原子量' : '分子量'}:</strong> {molarMass} g/mol</p>
            </div>
          )}
          
          <div className="mt-6">
            <label className="block text-lg font-semibold mb-3">
              追加する量 ({ingredient.unit}):
            </label>
            
            {/* 数値入力エリア（上下ボタン付き） */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleDecrement}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-2 rounded-l-lg font-bold text-lg transition"
              >
                −
              </button>
              
              <input 
                id="amount-input"
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 border-t border-b border-gray-300 p-2 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" 
                min="0"
                step={getStepValue()}
                placeholder="数値を入力"
              />
              
              <button
                type="button"
                onClick={handleIncrement}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-2 rounded-r-lg font-bold text-lg transition"
              >
                ＋
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mt-2 text-center">
              Enterキーでも追加できます
            </p>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button 
              onClick={handleAdd}
              disabled={!isValidAmount}
              className={`flex-1 font-bold py-3 rounded-lg transition text-lg ${
                isValidAmount
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              鍋に追加
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-lg hover:bg-gray-500 transition text-lg"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}