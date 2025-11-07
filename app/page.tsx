// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData, GameScreen as GameScreenType } from '../lib/types';
import { loadUserData } from '../lib/utils/gameUtils';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import GameScreenComponent from "./components/screens/GameScreen";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Firebase初期化のエラーハンドリング
const initializeFirebase = async () => {
  try {
    // Firebase設定が正しいかチェック
    const requiredEnvs = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];

    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      console.warn('Firebase environment variables missing:', missingEnvs);
      toast.error('Firebase設定が不完全です。ローカルストレージモードで動作します。');
      return false;
    }

    // Firebase設定をインポート（動的インポートでエラーをキャッチ）
    await import('../lib/firebase/config');
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    toast.error('Firebaseの初期化に失敗しました。ローカルストレージモードで動作します。');
    return false;
  }
};

export default function ChemicalKitchenPage() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('login');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // 初期化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppLoading(true);
        
        // Firebase初期化を試行
        const firebaseInitialized = await initializeFirebase();
        setFirebaseReady(firebaseInitialized);
        
        if (firebaseInitialized) {
          console.log('アプリケーションはFirebaseモードで動作しています');
        } else {
          console.log('アプリケーションはローカルストレージモードで動作しています');
        }
        
      } catch (error) {
        console.error('App initialization error:', error);
        setFirebaseReady(false);
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = (userData: UserData) => {
    setCurrentUser(userData);
    setIsGuestMode(false);
    setCurrentScreen('home');
    
    if (firebaseReady) {
      toast.success(`${userData.chefName}シェフ、おかえりなさい！ (Firebase同期済み)`);
    } else {
      toast.success(`${userData.chefName}シェフ、おかえりなさい！ (ローカルモード)`);
    }
  };

  const handleGuestLogin = () => {
    setCurrentUser(null);
    setIsGuestMode(true);
    setCurrentScreen('game');
    toast.success('ゲストモードで開始しました');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuestMode(false);
    setCurrentScreen('login');
    toast.success('退勤しました');
  };

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleReturnHome = () => {
    if (isGuestMode) {
      setCurrentScreen('login');
    } else {
      setCurrentScreen('home');
    }
  };

  // アプリ初期化中の表示
  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">化学反応キッチン</h2>
          <p className="text-gray-600">アプリケーションを初期化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#FFF7ED' }}>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Firebase接続状態の表示（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            firebaseReady 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {firebaseReady ? '🔥 Firebase' : '💾 Local'}
          </div>
        </div>
      )}
      
      {currentScreen === 'login' && (
        <LoginScreen 
          onLogin={handleLogin}
          onGuestLogin={handleGuestLogin}
        />
      )}
      
      {currentScreen === 'home' && (
        <HomeScreen 
          userData={currentUser!}
          onStartGame={handleStartGame}
          onLogout={handleLogout}
          onUserDataUpdate={setCurrentUser}
        />
      )}
      
      {currentScreen === 'game' && (
        <GameScreenComponent 
          userData={currentUser}
          isGuestMode={isGuestMode}
          onReturnHome={handleReturnHome}
          onLogout={handleLogout}
          onUserDataUpdate={setCurrentUser}
        />
      )}
    </div>
  );
}