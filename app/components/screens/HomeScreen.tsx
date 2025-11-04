// app/components/screens/HomeScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData } from '../../../lib/types';
import { calculateRank, getExpForLevel, saveUserData } from '../../../lib/utils/gameUtils';
import SkillModal from '../modals/SkillModal';
import { Star } from 'lucide-react';

interface HomeScreenProps {
  userData: UserData;
  onStartGame: () => void;
  onLogout: () => void;
  onUserDataUpdate: (userData: UserData) => void;
}

export default function HomeScreen({ userData, onStartGame, onLogout, onUserDataUpdate }: HomeScreenProps) {
  const [showSkillModal, setShowSkillModal] = useState(false);

  // ランク情報
  const rankData = {
    'apprentice': { icon: '🥉', name: '見習いシェフ', description: 'まだまだ修行が必要です' },
    'intermediate': { icon: '🥈', name: '一人前シェフ', description: '基本的な料理はお任せください' },
    'expert': { icon: '🥇', name: 'ベテランシェフ', description: '複雑な反応もお手のもの' },
    'master': { icon: '👑', name: 'マスターシェフ', description: '化学反応の達人です' },
    'legend': { icon: '⭐', name: 'レジェンドシェフ', description: '伝説のシェフです！' }
  };

  const currentRankData = rankData[userData.rank];
  const expForNextLevel = getExpForLevel(userData.level);
  const expProgress = (userData.exp / expForNextLevel) * 100;

  const handleSkillUpdate = (updatedUserData: UserData) => {
    saveUserData(updatedUserData);
    onUserDataUpdate(updatedUserData);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-lobster text-5xl font-bold text-yellow-600" style={{ fontFamily: 'Lobster, cursive' }}>
            La Cucina Chimica
          </h1>
          <button 
            onClick={onLogout}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            退勤 (ログアウト)
          </button>
        </div>
        
        <p className="text-xl text-gray-700 mb-6">
          ようこそ、<span className="font-bold">{userData.chefName}</span> シェフ！ 
          (<span className="font-semibold">{userData.storeName}</span>)
        </p>

        {/* スタートボタンとスキルボタン */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={onStartGame}
            className="flex-1 bg-green-600 text-white font-bold text-2xl py-4 rounded-lg shadow-lg hover:bg-green-700 transition transform hover:scale-105"
          >
            調理を始める 🍳
          </button>
          <button 
            onClick={() => setShowSkillModal(true)}
            className="w-1/3 bg-blue-500 text-white font-bold text-2xl py-4 rounded-lg shadow-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            スキル <Star className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左：お店ランクとステータス */}
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
            <h3 className="text-2xl font-semibold text-yellow-800 mb-4">お店ステータス</h3>
            
            {/* ランク表示 */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700">お店ランク</h4>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{currentRankData.icon}</span>
                <div>
                  <p className="text-xl font-bold text-gray-800">{currentRankData.name}</p>
                  <p className="text-sm text-gray-600">{currentRankData.description}</p>
                </div>
              </div>
            </div>
            
            {/* 経験値とレベル */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700">シェフレベル</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">Lv.{userData.level}</span>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${expProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {userData.exp} / {expForNextLevel} EXP
                  </p>
                </div>
              </div>
            </div>
            
            {/* 総売上 */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700">総売上</h4>
              <p className="text-2xl font-bold text-green-600">¥{userData.totalSales.toLocaleString()}</p>
            </div>
            
            {/* 現在所持金 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700">所持金</h4>
              <p className="text-xl font-semibold text-yellow-600">¥{userData.money.toLocaleString()}</p>
            </div>
          </div>
          
          {/* 右：最近の実績 */}
          <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">最近の実績</h3>
            <div className="space-y-3">
              {userData.achievements.length > 0 ? (
                userData.achievements.slice(-5).map((achievement, index) => (
                  <div key={index} className="p-2 bg-white rounded-lg border border-green-200">
                    <p className="text-green-700">{achievement}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 italic">まだ実績がありません。調理を始めましょう！</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* スキルモーダル */}
      <SkillModal 
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        userData={userData}
        onSkillUpdate={handleSkillUpdate}
      />
    </>
  );
}
