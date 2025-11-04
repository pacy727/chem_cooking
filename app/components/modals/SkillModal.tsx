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

    if (userData.skills[skillName] >= 5) {
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
      cost_reduction: '材料費削減',
      material_recovery: '材料サルベージ',
      failure_forgiveness: 'セカンドチャンス',
      exp_multiplier: '経験値ブースト'
    };

    toast.success(`${skillNames[skillName]} をレベルアップしました！\nLv.${updatedUserData.skills[skillName]}`);
  };

  const skillData = [
    {
      key: 'cost_reduction' as const,
      title: '材料費削減',
      description: '材料費を削減します',
      icon: '💰',
      color: 'purple'
    },
    {
      key: 'material_recovery' as const,
      title: '材料サルベージ',
      description: '失敗時に材料を回収する確率が上がります',
      icon: '♻️',
      color: 'green'
    },
    {
      key: 'failure_forgiveness' as const,
      title: 'セカンドチャンス',
      description: '失敗時にもう一度やり直すチャンスが得られます',
      icon: '🔄',
      color: 'orange'
    },
    {
      key: 'exp_multiplier' as const,
      title: '経験値ブースト',
      description: '獲得経験値が増加します',
      icon: '📈',
      color: 'blue'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
        
        <div className="space-y-6">
          {skillData.map((skill) => {
            const level = userData.skills[skill.key];
            const isMaxLevel = level >= 5;
            const canUpgrade = userData.skillPoints > 0 && !isMaxLevel;

            return (
              <div key={skill.key} className="skill-category">
                <h3 className={`text-lg font-semibold text-${skill.color}-700 mb-3`}>
                  {skill.icon} {skill.title}
                </h3>
                <div className={`bg-${skill.color}-50 p-4 rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold text-${skill.color}-800`}>{skill.title}</h4>
                      <p className={`text-sm text-${skill.color}-600`}>{skill.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs text-${skill.color}-500`}>
                          Lv.{level}
                        </span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < level ? `bg-${skill.color}-500` : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => upgradeSkill(skill.key)}
                      disabled={!canUpgrade}
                      className={`w-10 h-10 rounded-full font-bold text-lg transition-all ${
                        canUpgrade
                          ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-110'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
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
