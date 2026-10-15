import React from 'react';
import {
  Trophy,
  X,
  Award,
  CheckCircle2,
  Sparkles,
  Gift,
} from 'lucide-react';
import { HospitalQuest } from '../../types/hospitalGame';
import { AppLanguage } from '../../types';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: HospitalQuest[];
  onClaimQuestReward: (questId: string) => void;
  language: AppLanguage;
}

export const HospitalQuestsModal: React.FC<QuestsModalProps> = ({
  isOpen,
  onClose,
  quests,
  onClaimQuestReward,
  language,
}) => {
  const pt = language === 'pt';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {pt ? 'Missões Clínicas & Conquistas Hospitalares' : 'Hospital Quests & Achievements'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt ? 'Cumpra metas de eficiência clínica para desbloquear verbas e prestígio' : 'Accomplish clinical milestones to earn budget and reputation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="space-y-4">
          {quests.map((q) => {
            const isReady = q.currentCount >= q.targetCount && !q.completed;
            const percent = Math.min(100, Math.round((q.currentCount / q.targetCount) * 100));

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  q.completed
                    ? 'border-emerald-200 bg-emerald-50/50 opacity-80'
                    : isReady
                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>{q.title}</span>
                      {q.completed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          CONCLUÍDO
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{q.description}</p>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-700">
                    {q.currentCount} / {q.targetCount}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-3">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      q.completed ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>

                {/* Reward & Claim Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2 font-mono text-slate-600">
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span>+R$ {q.rewardBudget.toLocaleString('pt-BR')} • +{q.rewardXp} XP • +{q.rewardReputation}% Rep</span>
                  </div>

                  {isReady && (
                    <button
                      onClick={() => onClaimQuestReward(q.id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md transition-all active:scale-95 animate-bounce"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{pt ? 'Resgatar Recompensa' : 'Claim Reward'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
