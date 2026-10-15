import React from 'react';
import {
  Wrench,
  X,
  Zap,
  Wind,
  Droplets,
  ShieldAlert,
  Flame,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { HospitalUtility } from '../../types/hospitalGame';
import { AppLanguage } from '../../types';

interface UtilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  utilities: HospitalUtility[];
  budget: number;
  onPerformMaintenance: (utilityId?: string) => void;
  onToggleBackup: (utilityId: string) => void;
  language: AppLanguage;
}

export const UtilitiesFacilitiesModal: React.FC<UtilitiesModalProps> = ({
  isOpen,
  onClose,
  utilities,
  budget,
  onPerformMaintenance,
  onToggleBackup,
  language,
}) => {
  const pt = language === 'pt';

  if (!isOpen) return null;

  const getUtilityIcon = (id: string) => {
    switch (id) {
      case 'power': return Zap;
      case 'oxygen': return Wind;
      case 'hepa_filters': return Droplets;
      default: return Wrench;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {pt ? 'Gestão de Utilidades, Engenharia Clínica & Manutenção' : 'Utilities, Facilities & Clinical Engineering'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt
                  ? 'Controle de geradores elétricos, usina central de O2 e filtragem de pressão negativa'
                  : 'Power generators, medical oxygen plant, and negative pressure HEPA air systems'}
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

        {/* Global Overhaul Action */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-xs font-bold text-cyan-400 block">
              {pt ? 'Manutenção Preventiva Geral do Campus' : 'Preventive Campus Overhaul:'}
            </span>
            <span className="text-xs text-slate-300">
              {pt ? 'Restaura a vida útil de todas as utilidades e equipamentos hospitalares (R$ 3.800)' : 'Restores condition for all hospital utilities and equipment'}
            </span>
          </div>

          <button
            onClick={() => onPerformMaintenance()}
            disabled={budget < 3800}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 ${
              budget < 3800
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{pt ? 'Executar Revisão Geral' : 'Execute Campus Overhaul'}</span>
          </button>
        </div>

        {/* Utilities Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {utilities.map((ut) => {
            const Icon = getUtilityIcon(ut.id);
            const loadPercent = Math.min(100, Math.round((ut.currentConsumption / ut.capacity) * 100));

            return (
              <div
                key={ut.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-600" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ut.status === 'optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ut.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">{ut.name}</h4>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    Carga: {ut.currentConsumption} / {ut.capacity} {ut.unit} ({loadPercent}%)
                  </div>

                  {/* Load progress bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                    <div
                      style={{ width: `${loadPercent}%` }}
                      className={`h-full rounded-full ${
                        loadPercent > 85
                          ? 'bg-rose-500'
                          : loadPercent > 70
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Desgaste: <strong>{ut.wearPercent}%</strong>
                  </span>

                  <button
                    onClick={() => onToggleBackup(ut.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      ut.backupActive
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {ut.backupActive ? (pt ? 'Gerador Ativo' : 'Backup ON') : (pt ? 'Ativar Backup' : 'Turn ON Backup')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
