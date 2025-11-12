// app/components/screens/HomeScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData } from '../../../lib/types';
import { calculateRank, getExpForLevel, saveUserData } from '../../../lib/utils/gameUtils';
import { getMoneyRanking, getSalesRanking, getGameStatistics } from '../../../lib/firebase/utils';
import SkillModal from '../modals/SkillModal';
import { Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface HomeScreenProps {
  userData: UserData;
  onStartGame: () => void;
  onLogout: () => void;
  onUserDataUpdate: (userData: UserData) => void;
}

interface RankingItem {
  rank: number;
  storeName: string;
  money: number;
  totalSales?: number;
  level: number;
}

interface GameStats {
  totalUsers: number;
  totalMoney: number;
  totalSales: number;
  averageLevel: number;
}

export default function HomeScreen({ userData, onStartGame, onLogout, onUserDataUpdate }: HomeScreenProps) {
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [salesRankings, setSalesRankings] = useState<RankingItem[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalUsers: 0,
    totalMoney: 0,
    totalSales: 0,
    averageLevel: 1
  });
  const [rankingType, setRankingType] = useState<'money' | 'sales'>('money');
  const [loading, setLoading] = useState(true);

  // ランキング情報
  const rankData = {
    'apprentice': { icon: '🍽️', name: '見習いシェフ', description: 'まだまだ修行が必要です' },
    'intermediate': { icon: '🥄', name: '一人前シェフ', description: '基本的な料理はお任せください' },
    'expert': { icon: '🍳', name: 'ベテランシェフ', description: '複雑な反応もお手のもの' },
    'master': { icon: '👨‍🍳', name: 'マスターシェフ', description: '化学反応の達人です' },
    'legend': { icon: '⭐', name: 'レジェンドシェフ', description: '伝説のシェフです！' }
  };

  const currentRankData = rankData[userData.rank] || rankData['apprentice'];
  const expForNextLevel = getExpForLevel(userData.level);
  const expProgress = (userData.exp / expForNextLevel) * 100;

  // 初期データ読み込み
  useEffect(() => {
    const loadRankingData = async () => {
      try {
        setLoading(true);
        
        const [moneyRankings, salesRankingsData, stats] = await Promise.all([
          getMoneyRanking(),
          getSalesRanking(),
          getGameStatistics()
        ]);

        setRankings(moneyRankings);
        setSalesRankings(salesRankingsData);
        setGameStats(stats);
      } catch (error) {
        console.error('Error loading ranking data:', error);
        toast.error('ランキングデータの読み込みに失敗しました');
        
        setRankings([
          { rank: 1, storeName: 'ラ・キミカ', money: 15000, level: 12 },
          { rank: 2, storeName: 'モル亭', money: 12000, level: 10 },
          { rank: 3, storeName: 'キッチンイオン', money: 8000, level: 8 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadRankingData();
  }, []);

  const handleSkillUpdate = (updatedUserData: UserData) => {
    saveUserData(updatedUserData);
    onUserDataUpdate(updatedUserData);
  };

  const handleRefreshRankings = async () => {
    try {
      setLoading(true);
      const [moneyRankings, salesRankingsData, stats] = await Promise.all([
        getMoneyRanking(),
        getSalesRanking(),
        getGameStatistics()
      ]);

      setRankings(moneyRankings);
      setSalesRankings(salesRankingsData);
      setGameStats(stats);
      toast.success('ランキングを更新しました');
    } catch (error) {
      console.error('Error refreshing rankings:', error);
      toast.error('ランキングの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserRank = () => {
    const currentRankings = rankingType === 'money' ? rankings : salesRankings;
    const userRank = currentRankings.findIndex(
      r => r.storeName === userData.storeName
    );
    return userRank >= 0 ? userRank + 1 : null;
  };

  const currentUserRank = getCurrentUserRank();

  return (
    <>
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
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
        ようこそ、シェフ！
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 space-y-4">
            {/* ★ 資本金（マイナス対応版） */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">資本金</h3>
              
              {/* ★ 色分け表示 */}
              <p className={`text-3xl font-bold ${userData.money >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                ¥{Math.floor(userData.money).toLocaleString()}
              </p>
              
              <p className="text-sm text-gray-500 mt-2">
                ランク: <span className="text-lg">{currentRankData.icon}</span> 
                (総売上: <span className="font-bold">¥{Math.floor(userData.totalSales).toLocaleString()}</span>)
              </p>
              
              {userData.rank === 'legend' && (
                <p className="text-sm font-bold text-purple-600">★レジェンドボーナス x5 適用中★</p>
              )}
              
              {/* ★ マイナス時の警告表示 */}
              {userData.money < 0 && (
                <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 mt-2">
                  <p className="text-red-800 font-bold">⚠️ 赤字経営中！</p>
                  <p className="text-sm text-red-600">黒字化を目指しましょう</p>
                </div>
              )}
              
              {currentUserRank && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700">
                    現在の{rankingType === 'money' ? '資本金' : '売上'}ランキング: {currentUserRank}位
                  </p>
                </div>
              )}
            </div>
            
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

            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">ゲーム統計</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    総シェフ数:
                  </span>
                  <span className="font-bold">{gameStats.totalUsers.toLocaleString()}人</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    総資本金:
                  </span>
                  <span className="font-bold">¥{gameStats.totalMoney.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    総売上:
                  </span>
                  <span className="font-bold">¥{gameStats.totalSales.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>平均レベル:</span>
                  <span className="font-bold">Lv.{gameStats.averageLevel}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">ランキング TOP30</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setRankingType('money')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                    rankingType === 'money'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  資本金
                </button>
                <button
                  onClick={() => setRankingType('sales')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                    rankingType === 'sales'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  総売上
                </button>
                <button
                  onClick={handleRefreshRankings}
                  disabled={loading}
                  className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition disabled:bg-gray-400"
                >
                  {loading ? '更新中...' : '更新'}
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">読み込み中...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {(rankingType === 'money' ? rankings : salesRankings).map((ranking, index) => (
                    <div key={`${ranking.storeName}_${ranking.rank}`}
                      className={`flex items-center justify-between p-3 rounded-lg transition ${
                        ranking.storeName === userData.storeName
                          ? 'bg-yellow-100 border-2 border-yellow-400'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {ranking.rank}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{ranking.storeName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {rankingType === 'money' 
                            ? `¥${ranking.money.toLocaleString()}`
                            : `¥${(ranking.totalSales || 0).toLocaleString()}`
                          }
                        </p>
                        <p className="text-sm text-gray-600">Lv.{ranking.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {(rankingType === 'money' ? rankings : salesRankings).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>ランキングデータがありません</p>
                    <button 
                      onClick={handleRefreshRankings}
                      className="mt-2 text-blue-500 hover:text-blue-700 underline"
                    >
                      再読み込み
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      <SkillModal 
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        userData={userData}
        onSkillUpdate={handleSkillUpdate}
      />
    </>
  );
}