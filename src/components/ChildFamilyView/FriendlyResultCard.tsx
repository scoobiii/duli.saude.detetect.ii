import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Share2,
  CheckCircle2,
  FileText,
  Ambulance,
  Home,
  Clock,
  Sparkles,
  Bot,
} from 'lucide-react';
import { PatientTriage, AppLanguage } from '../../types';

interface FriendlyResultCardProps {
  triage: PatientTriage;
  language: AppLanguage;
  onNewEvaluation: () => void;
}

export const FriendlyResultCard: React.FC<FriendlyResultCardProps> = ({
  triage,
  language,
  onNewEvaluation,
}) => {
  const pt = language === 'pt';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Text-to-Speech (Web Speech API) for maximum accessibility (children, seniors, illiterate citizens)
  const handleSpeakGuidance = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${triage.summary}. ${triage.simpleGuidanceForFamily}. Orientação do DULI: ${triage.recommendedAction}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = pt ? 'pt-BR' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Color config
  const colorMap = {
    green: {
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800',
      title: pt ? 'Tudo Bem! Risco Baixo' : 'All Good! Low Risk',
      icon: ShieldCheck,
    },
    yellow: {
      bg: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800',
      title: pt ? 'Atenção! Risco Moderado' : 'Attention! Moderate Risk',
      icon: AlertTriangle,
    },
    orange: {
      bg: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      badge: 'bg-orange-100 text-orange-800',
      title: pt ? 'Alerta! Risco Elevado' : 'Alert! High Risk',
      icon: ShieldAlert,
    },
    red: {
      bg: 'bg-rose-600',
      lightBg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-900',
      badge: 'bg-rose-100 text-rose-800',
      title: pt ? 'URGÊNCIA IMEDIATA (SAMU 192)' : 'IMMEDIATE EMERGENCY (Call 911 / 192)',
      icon: Ambulance,
    },
  }[triage.triageColor];

  const IconComponent = colorMap.icon;

  return (
    <div className={`rounded-3xl border-2 ${colorMap.border} ${colorMap.lightBg} p-5 sm:p-8 shadow-xl transition-all`}>
      {/* Header with Color and Severity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl ${colorMap.bg} text-white flex items-center justify-center shadow-md`}>
            <IconComponent className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${colorMap.badge}`}>
                {pt ? `Protocolo ${triage.triageColor.toUpperCase()}` : `${triage.triageColor.toUpperCase()} Code`}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                {triage.evaluatedByEngine === 'gemini-3.8-flash' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Gemini 3.8</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    <span>Agente Local</span>
                  </>
                )}
              </span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-black ${colorMap.text} mt-1`}>
              {colorMap.title}
            </h3>
          </div>
        </div>

        {/* Read aloud & Actions */}
        <div className="flex items-center gap-2">
          {'speechSynthesis' in window && (
            <button
              onClick={handleSpeakGuidance}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
              <span>{isSpeaking ? (pt ? 'Parar Áudio' : 'Stop Audio') : (pt ? 'Ouvir em Voz Alta' : 'Read Aloud')}</span>
            </button>
          )}

          <button
            onClick={onNewEvaluation}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-bold shadow-sm"
          >
            {pt ? 'Nova Triagem' : 'New Triage'}
          </button>
        </div>
      </div>

      {/* Main Friendly Guidance Box */}
      <div className="my-6 bg-white/90 backdrop-blur-xs rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          {pt ? 'O que fazer agora (Instruções Claras)' : 'What to do right now (Clear Steps)'}
        </h4>
        <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
          {triage.simpleGuidanceForFamily}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Home className="w-4 h-4 text-teal-600" />
            <span>
              {pt
                ? `Isolamento sugerido: ${triage.isolationDaysRecommended} dias`
                : `Suggested isolation: ${triage.isolationDaysRecommended} days`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              {pt ? 'Monitorar sintomas a cada 6 horas' : 'Monitor vitals every 6h'}
            </span>
          </div>
          {triage.vitals.spo2 && (
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg font-mono">
              <span>SpO2: {triage.vitals.spo2}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Red Flags / Sinais de Alerta */}
      {triage.redFlags && triage.redFlags.length > 0 && (
        <div className="mb-6 bg-rose-100/70 border border-rose-200 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{pt ? 'Sinais de Alerta para ir Imediatamente ao Hospital / SAMU' : 'Red Flags to Seek Immediate Hospital Care'}</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-rose-900">
            {triage.redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Toggle for health agents & doctors */}
      <div className="pt-2">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            {showTechnicalDetails
              ? pt
                ? 'Ocultar parecer clínico técnico'
                : 'Hide clinical rationale'
              : pt
              ? 'Ver parecer clínico técnico e diagnósticos diferenciais'
              : 'View clinical rationale & differential diagnoses'}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-4 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-2 font-mono">
            <div>
              <span className="text-teal-400 font-bold">Racional Clínico: </span>
              <span>{triage.clinicalRationale}</span>
            </div>
            {triage.differentialDiagnosis && triage.differentialDiagnosis.length > 0 && (
              <div>
                <span className="text-teal-400 font-bold">Hipóteses Diagnósticas: </span>
                <span>{triage.differentialDiagnosis.join(', ')}</span>
              </div>
            )}
            <div>
              <span className="text-teal-400 font-bold">Conduta Sugerida: </span>
              <span>{triage.recommendedAction}</span>
            </div>
            <div>
              <span className="text-slate-400">Score de Gravidade: </span>
              <span className="text-amber-300 font-bold">{triage.score}/100</span>
              <span className="text-slate-400 ml-4">ID de Rastreio: </span>
              <span className="text-white">{triage.id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
