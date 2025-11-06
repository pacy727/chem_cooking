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
    'apprentice': { icon: '🍽️', name: '見習いシェフ', description: 'まだまだ修行が必要です' },
    'intermediate': { icon: '🥄', name: '一人前シェフ', description: '基本的な料理はお任せください' },
    'expert': { icon: '🍳', name: 'ベテランシェフ', description: '複雑な反応もお手のもの' },
    'master': { icon: '👨‍🍳', name: 'マスターシェフ', description: '化学反応の達人です' },
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
            {userData.storeName}
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
          {(() => {
            const greetings = [
              "今日もお客様の笑顔のために☺",
              "素晴らしい一日になりそうですね✨",
              "美味しい化学反応を作りましょう🧪",
              "今日も元気に調理しましょう🍳",
              "お客様をびっくりさせちゃいましょう😊",
              "新しいレシピに挑戦してみませんか？🌟",
              "今日はどんな発見があるでしょうか💡"
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            return <span className="ml-2 text-gray-600">{randomGreeting}</span>;
          })()}
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
          
          {/* 左：資本金とステータス */}
          <div className="md:col-span-1 space-y-4">
            {/* 資本金 */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">資本金</h3>
              <p className="text-3xl font-bold text-gray-800">¥{Math.floor(userData.money).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                ランク: <span className="text-lg">{currentRankData.icon}</span> 
                (総売上: <span className="font-bold">¥{Math.floor(userData.totalSales).toLocaleString()}</span>)
              </p>
              {userData.rank === 'legend' && (
                <p className="text-sm font-bold text-purple-600">★レジェンドボーナス x5 適用中★</p>
              )}
            </div>
            
            {/* シェフステータス */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">シェフ ステータス</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <p>レベル: <span className="font-bold text-lg text-blue-600">Lv.{userData.level}</span></p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${expProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 text-right">
                  EXP: {userData.exp} / {expForNextLevel}
                </p>
              </div>
            </div>
          </div>

          {/* 右：ランキング */}
          <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">ランキング (総売上)</h3>
            <div className="space-y-2">
              <p>🥇 1位: ラ・キミカ (¥15,000)</p>
              <p>🥈 2位: モル亭 (¥12,000)</p>
              <p>🥉 3位: キッチンイオン (¥8,000)</p>
              <p className="text-xs text-gray-400 mt-4 text-center">（ランキング機能は開発中です）</p>
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