// app/components/modals/AccountModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: (storeName: string, chefName: string) => void;
}

export default function AccountModal({ isOpen, onClose, onCreateAccount }: AccountModalProps) {
  const [storeName, setStoreName] = useState('');
  const [chefName, setChefName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onCreateAccount(storeName, chefName);
    setStoreName('');
    setChefName('');
  };

  const handleCancel = () => {
    setStoreName('');
    setChefName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">👨‍🍳 アカウント作成</h2>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">店名 (Store Name):</label>
            <input 
              type="text" 
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-3 border" 
              placeholder="例: 化学キッチン"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">お名前 (Your Name):</label>
            <input 
              type="text" 
              value={chefName}
              onChange={(e) => setChefName(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-3 border" 
              placeholder="例: 山田太郎"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition"
            >
              アカウント作成
            </button>
            <button 
              onClick={handleCancel}
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
