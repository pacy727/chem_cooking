// app/components/game/OrderDisplay.tsx
'use client';

import { Order } from '../../../lib/types';

interface OrderDisplayProps {
  order: Order;
}

export default function OrderDisplay({ order }: OrderDisplayProps) {
  return (
    <div className="mb-6 p-4 bg-blue-100 rounded-xl border-2 border-blue-300">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">👤 お客様のご注文</h3>
      <p className="text-xl font-bold text-blue-900 mb-2">{order.customer.order}</p>
      <p className="text-lg text-blue-700">
        {order.recipe.product.name} を {order.targetMol.toFixed(1)} mol
      </p>
      
      {/* レジェンドオーダー表示 */}
      {order.isLegend && (
        <div className="mt-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-center">
          <span className="text-sm font-bold">✨ レジェンドオーダー ✨</span>
          <div className="text-xs">ボーナス5倍！</div>
        </div>
      )}
    </div>
  );
}
