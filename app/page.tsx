// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserData, GameScreen } from '../lib/types';
import { loadUserData } from '../lib/utils/gameUtils';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import GameScreen from './components/screens/GameScreen';
import { Toaster } from 'react-hot-toast';

export default function ChemicalKitchenPage() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('login');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // 初期化
  useEffect(() => {
    // ページロード時の初期化処理があればここに
  }, []);

  const handleLogin = (userData: UserData) => {
    setCurrentUser(userData);
    setIsGuestMode(false);
    setCurrentScreen('home');
  };

  const handleGuestLogin = () => {
    setCurrentUser(null);
    setIsGuestMode(true);
    setCurrentScreen('game');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuestMode(false);
    setCurrentScreen('login');
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

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#FFF7ED' }}>
      <Toaster position="top-center" />
      
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
        <GameScreen 
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
