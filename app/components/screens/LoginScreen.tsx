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

  const handleLogin = async () => {
    if (!storeName.trim() || !chefName.trim()) {
      toast.error('店名とお名前を入力してください。');
      return;
    }

    try {
      console.log('=== ログイン試行 ===');
      console.log('店名:', storeName.trim());
      console.log('シェフ名:', chefName.trim());

      const userData = await loadUserData(storeName.trim(), chefName.trim());
      
      console.log('読み込んだユーザーデータ:', userData);

      if (!userData) {
        toast.error('アカウントが見つかりません。アカウント作成をしてください。');
        return;
      }

      // ★ データの整合性チェック
      if (typeof userData.money !== 'number' || isNaN(userData.money)) {
        console.error('不正なmoneyデータ:', userData.money);
        userData.money = 5000; // デフォルト値
      }

      if (!userData.storeName || !userData.chefName) {
        console.error('不正なユーザー名データ:', { storeName: userData.storeName, chefName: userData.chefName });
        userData.storeName = storeName.trim();
        userData.chefName = chefName.trim();
      }

      console.log('修正後のユーザーデータ:', userData);

      onLogin(userData);
      toast.success(`おかえりなさい！`);
      } catch (error) {
      console.error('ログインエラー:', error);
      toast.error('ログインに失敗しました。もう一度お試しください。');
    }
  };

  const handleCreateAccount = async (newStoreName: string, newChefName: string) => {
    if (!newStoreName.trim() || !newChefName.trim()) {
      toast.error('店名とお名前を入力してください。');
      return;
    }

    try {
      console.log('=== アカウント作成試行 ===');
      console.log('店名:', newStoreName.trim());
      console.log('シェフ名:', newChefName.trim());

      const exists = await userExists(newStoreName.trim(), newChefName.trim());
      
      console.log('ユーザー存在チェック:', exists);

      if (exists) {
        toast.error('このアカウントは既に存在します。ログインしてください。');
        return;
      }

      const userData = createDefaultUserData(newStoreName.trim(), newChefName.trim());
      
      console.log('作成したユーザーデータ:', userData);

      await saveUserData(userData);
      
      console.log('保存成功');

      toast.success('アカウントが作成されました！ログインしてください。');
      setShowAccountModal(false);
    } catch (error) {
      console.error('アカウント作成エラー:', error);
      toast.error('アカウント作成に失敗しました。もう一度お試しください。');
    }
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