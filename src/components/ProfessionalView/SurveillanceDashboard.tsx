import React from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  UserPlus,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { CommunityEpidemiologicalStats, AppLanguage } from '../../types';

interface DashboardProps {
  stats: CommunityEpidemiologicalStats;
  totalTriaged: number;
  criticalCases: number;
  language: AppLanguage;
  onOpenNewTriage: () => void;
  onOpenEpidemicReport: () => void;
  onExportData: () => void;
}

export const SurveillanceDashboard: React.FC<DashboardProps> = ({
  stats,
  totalTriaged,
  criticalCases,
  language,
  onOpenNewTriage,
  onOpenEpidemicReport,
  onExportData,
}) => {
  const pt = language === 'pt';

  const kpis = [
    {
      label: pt ? 'Casos Ativos Confirmados' : 'Active Confirmed Cases',
      value: stats.activeCases,
      change: '+4.2%',
      isNegative: true,
      icon: Activity,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: pt ? 'Casos em Triagem (Suspeitos)' : 'Suspected Cases in Triage',
      value: stats.suspectedCases,
      change: '-2.1%',
      isNegative: false,
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      label: pt ? 'Taxa R(t) de Transmissão' : 'R(t) Effective Reproduction',
      value: stats.estimatedRt.toFixed(2),
      badge: stats.estimatedRt > 1.0 ? (pt ? 'Em Expansão' : 'Expanding') : (pt ? 'Controlado' : 'Controlled'),
      icon: TrendingUp,
      color: stats.estimatedRt > 1.0 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: pt ? 'Ocupação de Leitos UTI / UPA' : 'ICU / Hospital Ward Bed Occupancy',
      value: `${stats.icuOccupancyRate}%`,
      badge: stats.icuOccupancyRate > 75 ? (pt ? 'Alerta Amarelo' : 'Warning') : (pt ? 'Adequado' : 'Adequate'),
      icon: Building2,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      label: pt ? 'Visitas Domiciliares ACS' : 'ACS Household Visits (Week)',
      value: stats.acsVisitsCompletedWeek,
      change: pt ? 'Meta 92%' : 'Target 92%',
      icon: Users,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      label: pt ? 'Total Triagens Registradas' : 'Total Triages Recorded',
      value: totalTriaged,
      badge: `${criticalCases} ${pt ? 'críticos' : 'critical'}`,
      icon: HeartPulse,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {pt ? 'SALA DE SITUAÇÃO EPIDEMIOLÓGICA' : 'EPIDEMIOLOGICAL SURVEILLANCE ROOM'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {stats.municipality}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {pt ? 'Vigilância de Saúde & Rastreamento DULI' : 'DULI Health & Outbreak Surveillance'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              {pt
                ? 'Painel unificado para monitoramento comunitário de microáreas, busca ativa de Agentes Comunitários (ACS) e detecção precoce de surtos respiratórios.'
                : 'Unified telemetry for community health zones, active household case finding, and early respiratory outbreak detection.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTriage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>{pt ? 'Nova Triagem / Visita ACS' : 'New Triage / ACS Visit'}</span>
            </button>

            <button
              onClick={onOpenEpidemicReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs sm:text-sm font-bold transition-all"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>{pt ? 'Gerar Boletim IA' : 'Generate AI Bulletin'}</span>
            </button>

            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold"
              title={pt ? 'Exportar dados em JSON' : 'Export data'}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{pt ? 'Exportar' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {kpi.badge ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {kpi.badge}
                    </span>
                  ) : kpi.change ? (
                    <span
                      className={`text-[10px] font-bold ${
                        kpi.isNegative ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {kpi.change}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
