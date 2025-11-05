// app/components/modals/ChefCommentModal.tsx
'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

// 数値フォーマット関数：右側の不要な0を削除
const formatNumber = (num: number, decimalPlaces: number = 2): string => {
  return parseFloat(num.toFixed(decimalPlaces)).toString();
};

interface ChefCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastResult: any;
  currentRecipe: any;
}

export default function ChefCommentModal({ isOpen, onClose, lastResult, currentRecipe }: ChefCommentModalProps) {
  // Escキーで閉じる
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lastResult) return null;

  // 反応式の決定
  const getReactionFormula = () => {
    if (lastResult.reaction) {
      return lastResult.reaction.equation;
    }
    return '反応が起こりませんでした';
  };

  // テーブル構築
  const buildReactionTable = () => {
    if (lastResult.code === 'NO_REACTION') {
      return (
        <p className="text-red-500 text-center p-4">
          反応が起こりませんでした。投入した物質同士は反応しません。
        </p>
      );
    }

    if (!lastResult.reaction || !lastResult.reactionResult) {
      return (
        <p className="text-gray-500 text-center p-4">
          反応データが取得できませんでした。
        </p>
      );
    }

    const reaction = lastResult.reaction;
    const reactionResult = lastResult.reactionResult;

    return (
      <table className="w-full text-center border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">項目</th>
            <th className="border border-gray-300 p-2">{formatChemicalFormula(reaction.reactants[0]?.formula || '反応物1')}</th>
            <th className="border border-gray-300 p-2">{formatChemicalFormula(reaction.reactants[1]?.formula || '反応物2')}</th>
            {reaction.products.map((product: any, index: number) => (
              <th key={index} className="border border-gray-300 p-2">{formatChemicalFormula(product.formula)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">係数比</td>
            <td className="border border-gray-300 p-2">{reaction.reactants[0]?.coefficient || 1}</td>
            <td className="border border-gray-300 p-2">{reaction.reactants[1]?.coefficient || 1}</td>
            {reaction.products.map((product: any, index: number) => (
              <td key={index} className="border border-gray-300 p-2">{product.coefficient}</td>
            ))}
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">反応前 (mol)</td>
            <td className="border border-gray-300 p-2">
              {formatNumber(getInitialMol(reaction.reactants[0].formula, reactionResult))}
            </td>
            <td className="border border-gray-300 p-2">
              {formatNumber(getInitialMol(reaction.reactants[1].formula, reactionResult))}
            </td>
            {reaction.products.map((_: any, index: number) => (
              <td key={index} className="border border-gray-300 p-2">{formatNumber(0)}</td>
            ))}
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">反応量 (mol)</td>
            <td className="border border-gray-300 p-2">
              <span className="text-red-600">
                -{formatNumber(getConsumedMol(reaction.reactants[0].formula, reactionResult))}
              </span>
            </td>
            <td className="border border-gray-300 p-2">
              <span className="text-red-600">
                -{formatNumber(getConsumedMol(reaction.reactants[1].formula, reactionResult))}
              </span>
            </td>
            {reactionResult.producedMols.map((product: any, index: number) => (
              <td key={index} className="border border-gray-300 p-2">
                <span className="text-blue-600">
                  +{formatNumber(product.mols)}
                </span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-gray-300 p-2 font-semibold">反応後 (mol)</td>
            <td className="border border-gray-300 p-2">
              {formatNumber(getRemainingMol(reaction.reactants[0].formula, reactionResult))}
            </td>
            <td className="border border-gray-300 p-2">
              {formatNumber(getRemainingMol(reaction.reactants[1].formula, reactionResult))}
            </td>
            {reactionResult.producedMols.map((product: any, index: number) => (
              <td key={index} className="border border-gray-300 p-2">{formatNumber(product.mols)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  // 化学式の下付き数字変換関数
  const formatChemicalFormula = (formula: string): string => {
    // 既に下付き数字の場合はそのまま返す
    if (formula.includes('₂') || formula.includes('₃') || formula.includes('₄')) {
      return formula;
    }
    
    // 通常数字を下付き数字に変換
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

  // 初期mol数を取得
  const getInitialMol = (formula: string, reactionResult: any): number => {
    const remaining = reactionResult.remainingMols.find((r: any) => r.formula === formula);
    const produced = reactionResult.producedMols.find((p: any) => p.formula === formula);
    const remainingMol = remaining ? remaining.mols : 0;
    const consumedMol = getConsumedMol(formula, reactionResult);
    return remainingMol + consumedMol;
  };

  // 消費mol数を計算
  const getConsumedMol = (formula: string, reactionResult: any): number => {
    if (!lastResult.reaction) return 0;
    
    const reaction = lastResult.reaction;
    const reactant = reaction.reactants.find((r: any) => r.formula === formula);
    if (!reactant) return 0;
    
    // 制限反応剤により決まる反応量
    const limitingMols = reactionResult.producedMols.length > 0 ? 
      reactionResult.producedMols[0].mols / reaction.products[0].coefficient : 0;
    
    return limitingMols * reactant.coefficient;
  };

  // 残存mol数を取得
  const getRemainingMol = (formula: string, reactionResult: any): number => {
    const remaining = reactionResult.remainingMols.find((r: any) => r.formula === formula);
    return remaining ? remaining.mols : 0;
  };

  // シェフの評価
  const getChefFeedback = () => {
    return lastResult.chefComment || '反応についての詳細な解説は以下のとおりです。';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      {/* モーダル本体 */}
      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl transform transition-all duration-300 scale-100 h-[95vh] flex flex-col">
        
        {/* ヘッダー (タイトルと閉じるボタン) */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-2xl font-bold text-center text-gray-800">シェフの解説</h3>
          <button 
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* スクロール可能なコンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          {/* 反応式 */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">反応式</p>
            <p className="text-xl font-bold text-center bg-gray-100 p-3 rounded-lg">
              {getReactionFormula()}
            </p>
          </div>

          {/* 反応プロセス (テーブル) */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">反応プロセス</p>
            <div className="bg-gray-50 p-3 rounded-lg border overflow-x-auto">
              {buildReactionTable()}
            </div>
          </div>

          {/* シェフの評価 */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">シェフの評価</p>
            <div className="flex items-start space-x-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <span className="text-4xl mt-1">👨‍🍳</span>
              <p className="text-gray-700 flex-1">
                {getChefFeedback()}
              </p>
            </div>
          </div>

          {/* 成績評価 */}
          {lastResult.orderMatch !== undefined && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">注文マッチング</p>
              <div className={`p-3 rounded-lg border ${
                lastResult.orderMatch 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  lastResult.orderMatch ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastResult.orderMatch ? '✅ 注文通りの物質ができました' : '❌ 注文と異なる物質ができました'}
                </p>
                {lastResult.bonusRate > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ボーナス倍率: {(lastResult.bonusRate * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}