// app/components/screens/LoginScreen.tsx
'use client';

import { useState } from 'react';
import { UserData } from '../../../lib/types';
import { loadUserData, createDefaultUserData, saveUserData, userExists } from '../../../lib/utils/gameUtils';
import AccountModal from '../modals/AccountModal';
import toast from 'react-hot-toast';

interface LoginScreenProps {
  onLogin: (userData: UserData) => void;
  onGuestLogin: () => void;
}

export default function LoginScreen({ onLogin, onGuestLogin }: LoginScreenProps) {
  const [storeName, setStoreName] = useState('');
  const [chefName, setChefName] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleLogin = () => {
    if (!storeName.trim() || !chefName.trim()) {
      toast.error('店名とお名前を入力してください。');
      return;
    }

    const userData = loadUserData(storeName.trim(), chefName.trim());
    if (!userData) {
      toast.error('アカウントが見つかりません。アカウント作成をしてください。');
      return;
    }

    onLogin(userData);
    toast.success(`${userData.chefName}シェフ、おかえりなさい！`);
  };

  const handleCreateAccount = (newStoreName: string, newChefName: string) => {
    if (!newStoreName.trim() || !newChefName.trim()) {
      toast.error('店名とお名前を入力してください。');
      return;
    }

    if (userExists(newStoreName.trim(), newChefName.trim())) {
      toast.error('このアカウントは既に存在します。ログインしてください。');
      return;
    }

    const userData = createDefaultUserData(newStoreName.trim(), newChefName.trim());
    saveUserData(userData);
    toast.success('アカウントが作成されました！ログインしてください。');
    setShowAccountModal(false);
  };

  return (
    <>
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="font-lobster text-6xl font-bold text-yellow-600" style={{ fontFamily: 'Lobster, cursive' }}>
          La Cucina Chimica
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-2">化学反応キッチン 🍳</h2>
        <p className="mt-4 text-gray-600">シェフとして出勤し、完璧な料理（生成物）を目指しましょう！</p>

        {/* ログインエリア */}
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b-2 border-red-500 pb-2">出勤 / ゲスト</h3>
          
          {/* ゲストとして調理 */}
          <button 
            onClick={onGuestLogin}
            className="w-full bg-green-600 text-white font-bold text-lg py-3 rounded-lg shadow-lg hover:bg-green-700 transition transform hover:scale-105"
          >
            👨‍🍳 ゲストとして調理
          </button>
          
          {/* ログイン */}
          <div className="space-y-3 pt-4">
            <input 
              type="text" 
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 border" 
              placeholder="店名 (Store Name)"
            />
            <input 
              type="text" 
              value={chefName}
              onChange={(e) => setChefName(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 border" 
              placeholder="お名前 (Your Name)"
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
              出勤 (ログイン)
            </button>
          </div>
          
          {/* アカウント作成 */}
          <div className="pt-4">
            <button 
              onClick={() => setShowAccountModal(true)}
              className="text-gray-600 hover:text-red-600 transition underline"
            >
              就職面接はこちら (アカウント作成)
            </button>
          </div>
        </div>
      </div>

      {/* アカウント作成モーダル */}
      <AccountModal 
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onCreateAccount={handleCreateAccount}
      />
    </>
  );
}
