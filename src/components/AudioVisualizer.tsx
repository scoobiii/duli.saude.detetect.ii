import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { AppLanguage } from '../types';

interface AudioVisualizerProps {
  coughType: 'seca' | 'produtiva' | 'chiado' | 'latente' | 'sem_tosse';
  setCoughType: (type: 'seca' | 'produtiva' | 'chiado' | 'latente' | 'sem_tosse') => void;
  language: AppLanguage;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  coughType,
  setCoughType,
  language,
}) => {
  const pt = language === 'pt';
  const [isRecording, setIsRecording] = useState(false);
  const [audioAnalyzed, setAudioAnalyzed] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>([15, 25, 40, 20, 60, 30, 45, 15, 20, 35, 50, 25]);

  // Audio wave animation during recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setBarHeights((prev) =>
          prev.map(() => Math.floor(Math.random() * 75) + 10)
        );
      }, 100);
    } else {
      setBarHeights([10, 18, 24, 15, 30, 22, 18, 12, 16, 20, 14, 10]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartSimulatedAnalysis = () => {
    setIsRecording(true);
    setAudioAnalyzed(false);

    setTimeout(() => {
      setIsRecording(false);
      setAudioAnalyzed(true);
      // If user hasn't chosen one, pick 'seca' as high-probability COVID-19 profile
      if (coughType === 'sem_tosse') {
        setCoughType('seca');
      }
    }, 2400);
  };

  return (
    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{pt ? 'COVID-19 Detect II: Análise Acústica da Tosse' : 'COVID-19 Detect II: Acoustic Cough Analysis'}</span>
              <span className="text-[10px] bg-teal-900 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                AI Spectrogram
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {pt
                ? 'Detecção de biomarcadores acústicos respiratórios'
                : 'Respiratory acoustic biomarker detection'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Audio Bars Visualizer */}
      <div className="h-20 bg-slate-950/80 rounded-xl p-3 flex items-end justify-center gap-1.5 border border-slate-800/80 overflow-hidden relative">
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className={`w-3 rounded-t-sm transition-all duration-100 ${
              isRecording
                ? 'bg-linear-to-t from-teal-500 to-emerald-300 shadow-sm shadow-teal-500/50'
                : audioAnalyzed
                ? 'bg-linear-to-t from-indigo-500 to-sky-400'
                : 'bg-slate-700'
            }`}
          />
        ))}

        {isRecording && (
          <div className="absolute top-2 right-3 flex items-center gap-1 text-[11px] font-mono text-rose-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{pt ? 'GRAVANDO AMOSTRA...' : 'RECORDING SAMPLE...'}</span>
          </div>
        )}
      </div>

      {/* Action Trigger */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleStartSimulatedAnalysis}
          disabled={isRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md ${
            isRecording
              ? 'bg-rose-600 text-white cursor-wait'
              : 'bg-teal-600 hover:bg-teal-500 text-white active:scale-95'
          }`}
        >
          <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce' : ''}`} />
          <span>
            {isRecording
              ? pt
                ? 'Ouvindo tosse (3s)...'
                : 'Listening to cough (3s)...'
              : pt
              ? 'Gravar / Testar Áudio da Tosse'
              : 'Record / Test Cough Audio'}
          </span>
        </button>

        {audioAnalyzed && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
            <span>{pt ? 'Espectro acústico processado!' : 'Acoustic spectrum analyzed!'}</span>
          </div>
        )}
      </div>

      {/* Manual Pattern Selector (Children & Citizens can also just pick) */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          {pt ? 'Ou escolha o tipo de tosse que mais parece com a sua:' : 'Or select the cough profile that best matches:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'sem_tosse', label: pt ? 'Sem Tosse' : 'No Cough', desc: pt ? 'Tudo limpo' : 'Clear' },
            { id: 'seca', label: pt ? 'Tosse Seca' : 'Dry Cough', desc: pt ? 'Garganta arranhando' : 'Scratchy throat' },
            { id: 'produtiva', label: pt ? 'Tosse com Catarro' : 'Wet / Productive', desc: pt ? 'Com muco' : 'With mucus' },
            { id: 'chiado', label: pt ? 'Chiado no Peito' : 'Wheezing / Whistle', desc: pt ? 'Apito ao respirar' : 'Chest whistle' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCoughType(item.id as any)}
              className={`p-2 rounded-xl text-left border transition-all text-xs ${
                coughType === item.id
                  ? 'bg-teal-600/30 border-teal-400 text-white ring-2 ring-teal-500/40'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold">{item.label}</div>
              <div className="text-[10px] text-slate-400">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
