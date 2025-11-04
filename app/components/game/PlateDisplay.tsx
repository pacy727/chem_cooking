// app/components/game/PlateDisplay.tsx
'use client';

interface PlateDisplayProps {
  emoji: string;
  name: string;
  amount: string;
  excess?: { name: string; amount: string } | null;
}

export default function PlateDisplay({ emoji, name, amount, excess }: PlateDisplayProps) {
  return (
    <div className="mb-6 p-4 bg-gray-100 rounded-xl border-2 border-gray-300">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">🍽️ お皿</h3>
      <div className="text-center">
        <div className="text-6xl mb-2 animate-pulse">{emoji}</div>
        <p className="text-xl font-bold text-gray-800">{name}</p>
        <p className="text-lg text-gray-600">{amount}</p>
        
        {/* 余剰物質表示エリア */}
        {excess && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 font-semibold">余剰/副生成物:</p>
            <p className="text-sm text-red-700">
              {excess.name} {excess.amount}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
