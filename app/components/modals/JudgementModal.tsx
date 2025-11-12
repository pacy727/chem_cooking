// app/components/modals/JudgementModal.tsx
'use client';

import { useEffect, useState } from 'react';

interface JudgementModalProps {
  isOpen: boolean;
  bonusRate: number;
  orderMatch: boolean;
  onComplete: () => void;
}

export default function JudgementModal({ isOpen, bonusRate, orderMatch, onComplete }: JudgementModalProps) {
  const [phase, setPhase] = useState<'fade-in' | 'show' | 'fade-out'>('fade-in');

  useEffect(() => {
    if (!isOpen) return;

    // フェーズ管理
    const fadeInTimer = setTimeout(() => setPhase('show'), 300);
    const showTimer = setTimeout(() => setPhase('fade-out'), 1800);
    const completeTimer = setTimeout(() => {
      setPhase('fade-in');
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(showTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  // 判定内容の決定
  const getJudgement = () => {
    if (!orderMatch) {
      return {
        emoji: '💀',
        text: 'Oh No...',
        color: 'text-gray-600',
        bgGradient: 'from-gray-900 to-gray-800'
      };
    }

    if (bonusRate >= 1.0) {
      return {
        emoji: '🤩',
        text: 'PERFECT!!!',
        color: 'text-yellow-400',
        bgGradient: 'from-yellow-500 to-orange-500'
      };
    } else if (bonusRate >= 0.8) {
      return {
        emoji: '😘',
        text: 'EXCELLENT!',
        color: 'text-green-400',
        bgGradient: 'from-green-500 to-teal-500'
      };
    } else if (bonusRate >= 0.3) {
      return {
        emoji: '😥',
        text: 'Not Bad...',
        color: 'text-blue-400',
        bgGradient: 'from-blue-500 to-cyan-500'
      };
    } else if (bonusRate > 0) {
      return {
        emoji: '🤢',
        text: 'Oh...',
        color: 'text-purple-400',
        bgGradient: 'from-purple-500 to-pink-500'
      };
    } else {
      return {
        emoji: '😡',
        text: 'FAILED!',
        color: 'text-red-400',
        bgGradient: 'from-red-600 to-orange-600'
      };
    }
  };

  const judgement = getJudgement();

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        phase === 'fade-in' ? 'opacity-0' :
        phase === 'show' ? 'opacity-100' :
        'opacity-0'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className={`text-center transform transition-all duration-500 ${
          phase === 'show' 
            ? 'scale-100 rotate-0' 
            : 'scale-50 rotate-12'
        }`}
      >
        {/* 背景グロー効果 */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${judgement.bgGradient} opacity-30 blur-3xl rounded-full transform scale-150`}
        ></div>

        {/* メイン絵文字 */}
        <div 
          className={`relative text-9xl mb-4 animate-bounce ${
            phase === 'show' ? 'animation-play-running' : 'animation-play-paused'
          }`}
          style={{
            textShadow: '0 0 40px rgba(255, 255, 255, 0.8)',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))'
          }}
        >
          {judgement.emoji}
        </div>

        {/* テキスト */}
        <div 
          className={`relative text-6xl font-black ${judgement.color} tracking-wider`}
          style={{
            textShadow: '4px 4px 0px rgba(0, 0, 0, 0.3), 0 0 30px currentColor',
            fontFamily: '"Impact", "Arial Black", sans-serif',
            WebkitTextStroke: '2px rgba(255, 255, 255, 0.3)'
          }}
        >
          {judgement.text}
        </div>

        {/* キラキラエフェクト（成功時のみ） */}
        {bonusRate >= 0.8 && (
          <>
            <div className="absolute top-0 left-1/4 text-6xl animate-ping" style={{ animationDuration: '1.5s' }}>✨</div>
            <div className="absolute top-0 right-1/4 text-6xl animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}>✨</div>
            <div className="absolute bottom-0 left-1/3 text-6xl animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.4s' }}>⭐</div>
            <div className="absolute bottom-0 right-1/3 text-6xl animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}>⭐</div>
          </>
        )}
      </div>
    </div>
  );
}