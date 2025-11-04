// app/components/modals/SkillModal.tsx
'use client';

import { UserData } from '../../../lib/types';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onSkillUpdate: (userData: UserData) => void;
}

export default function SkillModal({ isOpen, onClose, userData, onSkillUpdate }: SkillModalProps) {
  if (!isOpen) return null;

  const upgradeSkill = (skillName: keyof UserData['skills']) => {
    if (userData.skillPoints <= 0) {
      toast.error('スキルポイントが足りません！');
      return;
    }

    if (userData.skills[skillName] >= 3) {
      toast.error('このスキルは最大レベルです！');
      return;
    }

    const updatedUserData = {
      ...userData,
      skills: {
        ...userData.skills,
        [skillName]: userData.skills[skillName] + 1
      },
      skillPoints: userData.skillPoints - 1
    };

    onSkillUpdate(updatedUserData);

    const skillNames = {
      cost_reduction: '仕入れ上手',
      recipe_discount: 'レシピ研究',
      hospitality: 'おもてなし',
      chef_personality: 'シェフの人柄',
      word_of_mouth: '口コミ評価',
      salvage: 'サルベージ'
    };

    toast.success(`${skillNames[skillName]} をレベルアップしました！\nLv.${updatedUserData.skills[skillName]}`);
  };

  const skillData = [
    {
      key: 'cost_reduction' as const,
      title: '仕入れ上手',
      description: '材料費を削減します',
      details: ['0%削減', '5%削減', '10%削減', '20%削減'],
      icon: '💰',
      color: 'purple'
    },
    {
      key: 'recipe_discount' as const,
      title: 'レシピ研究',
      description: 'レシピ購入費が安くなります',
      details: ['300円', '200円', '100円', '50円'],
      icon: '📚',
      color: 'blue'
    },
    {
      key: 'hospitality' as const,
      title: 'おもてなし',
      description: '成功時のボーナスが増加します',
      details: ['1.0倍', '1.2倍', '1.5倍', '2.0倍'],
      icon: '🤝',
      color: 'green'
    },
    {
      key: 'chef_personality' as const,
      title: 'シェフの人柄',
      description: '失敗時に再挑戦できる確率が上がります',
      details: ['0%', '10%', '20%', '30%'],
      icon: '😊',
      color: 'orange'
    },
    {
      key: 'word_of_mouth' as const,
      title: '口コミ評価',
      description: 'VIP客の来店率が上がります',
      details: ['1.0倍', '1.5倍', '2.0倍', '3.0倍'],
      icon: '⭐',
      color: 'yellow'
    },
    {
      key: 'salvage' as const,
      title: 'サルベージ',
      description: '材料回収時の返金率が上がります',
      details: ['0%', '10%', '50%', '80%'],
      icon: '♻️',
      color: 'red'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">⭐ スキルツリー</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-semibold">
            スキルポイント: {userData.skillPoints}
          </p>
          <p className="text-sm text-blue-600">調理の成功でスキルポイントが獲得できます</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillData.map((skill) => {
            const level = userData.skills[skill.key];
            const isMaxLevel = level >= 3;
            const canUpgrade = userData.skillPoints > 0 && !isMaxLevel;

            return (
              <div key={skill.key} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{skill.icon}</span>
                    <h3 className="font-semibold text-gray-800">{skill.title}</h3>
                  </div>
                  <button
                    onClick={() => upgradeSkill(skill.key)}
                    disabled={!canUpgrade}
                    className={`w-8 h-8 rounded-full font-bold text-sm transition-all ${
                      canUpgrade
                        ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-110'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs text-gray-500">Lv.{level}</span>
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < level ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>現在: {skill.details[level]}</p>
                  {!isMaxLevel && (
                    <p className="text-green-600">次レベル: {skill.details[level + 1]}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onClose}
            className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}