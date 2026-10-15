import React from 'react';
import { AppLanguage } from '../../types';

interface BodyAvatarProps {
  selectedSymptoms: string[];
  onToggleSymptom: (symptom: string) => void;
  language: AppLanguage;
}

export const BodyAvatarSelector: React.FC<BodyAvatarProps> = ({
  selectedSymptoms,
  onToggleSymptom,
  language,
}) => {
  const pt = language === 'pt';

  const bodyHotspots = [
    {
      id: 'head',
      label: pt ? 'Cabeça / Febre' : 'Head / Fever',
      symptoms: pt ? ['Febre', 'Dor de cabeça', 'Perda de olfato'] : ['Fever', 'Headache', 'Loss of smell'],
      x: '50%',
      y: '14%',
      emoji: '🧠',
    },
    {
      id: 'throat',
      label: pt ? 'Garganta' : 'Throat',
      symptoms: pt ? ['Dor de garganta'] : ['Sore throat'],
      x: '50%',
      y: '25%',
      emoji: '🧣',
    },
    {
      id: 'chest',
      label: pt ? 'Peito / Pulmões' : 'Chest / Lungs',
      symptoms: pt ? ['Tosse', 'Falta de ar', 'Dor no peito'] : ['Cough', 'Shortness of breath', 'Chest pain'],
      x: '50%',
      y: '38%',
      emoji: '🫁',
    },
    {
      id: 'belly',
      label: pt ? 'Barriga / Estômago' : 'Stomach / Belly',
      symptoms: pt ? ['Diarreia', 'Vômito / Enjoo'] : ['Diarrhea', 'Nausea / Vomiting'],
      x: '50%',
      y: '53%',
      emoji: '🥣',
    },
    {
      id: 'body',
      label: pt ? 'Corpo / Músculos' : 'Body / Muscles',
      symptoms: pt ? ['Dor no corpo', 'Fadiga extrema'] : ['Body aches', 'Extreme fatigue'],
      x: '75%',
      y: '65%',
      emoji: '💪',
    },
  ];

  return (
    <div className="bg-linear-to-b from-sky-50 to-indigo-50/40 p-4 sm:p-6 rounded-2xl border border-sky-100 flex flex-col items-center">
      <div className="text-center mb-4">
        <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center justify-center gap-1.5">
          <span>{pt ? 'Toque no corpo onde está incomodando' : 'Tap on the body where it hurts'}</span>
        </h4>
        <p className="text-xs text-slate-500">
          {pt ? 'Clique nos círculos para marcar os sintomas' : 'Click the markers to add symptoms'}
        </p>
      </div>

      <div className="relative w-64 h-80 flex items-center justify-center select-none">
        {/* Stylized friendly SVG Body Outline */}
        <svg
          viewBox="0 0 200 320"
          className="w-full h-full drop-shadow-md text-teal-600/30"
          fill="currentColor"
        >
          {/* Head */}
          <circle cx="100" cy="45" r="28" className="fill-teal-200 stroke-teal-500 stroke-2" />
          {/* Neck */}
          <rect x="94" y="70" width="12" height="15" rx="3" className="fill-teal-300" />
          {/* Torso */}
          <path
            d="M 65 85 Q 100 80 135 85 L 128 175 Q 100 180 72 175 Z"
            className="fill-teal-100 stroke-teal-400 stroke-2"
          />
          {/* Arms */}
          <path
            d="M 65 88 L 40 160 Q 35 170 45 170 L 62 110 Z"
            className="fill-teal-200/80 stroke-teal-400 stroke-1"
          />
          <path
            d="M 135 88 L 160 160 Q 165 170 155 170 L 138 110 Z"
            className="fill-teal-200/80 stroke-teal-400 stroke-1"
          />
          {/* Legs */}
          <path
            d="M 74 175 L 70 290 Q 75 300 88 300 L 96 180 Z"
            className="fill-teal-200/80 stroke-teal-400 stroke-1"
          />
          <path
            d="M 104 180 L 112 300 Q 125 300 130 290 L 126 175 Z"
            className="fill-teal-200/80 stroke-teal-400 stroke-1"
          />
          {/* Smiling Face for friendly pediatric touch */}
          <circle cx="92" cy="40" r="3" fill="#0f766e" />
          <circle cx="108" cy="40" r="3" fill="#0f766e" />
          <path
            d="M 92 52 Q 100 58 108 52"
            fill="none"
            stroke="#0f766e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Interactive Hotspot Buttons */}
        {bodyHotspots.map((spot) => {
          const hasActive = spot.symptoms.some((s) => selectedSymptoms.includes(s));
          return (
            <div
              key={spot.id}
              style={{ left: spot.x, top: spot.y, transform: 'translate(-50%, -50%)' }}
              className="absolute z-10 flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => {
                  // Toggle first symptom of the group or cycle
                  const firstInactive = spot.symptoms.find((s) => !selectedSymptoms.includes(s));
                  if (firstInactive) {
                    onToggleSymptom(firstInactive);
                  } else {
                    spot.symptoms.forEach((s) => {
                      if (selectedSymptoms.includes(s)) onToggleSymptom(s);
                    });
                  }
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-md transition-all transform active:scale-95 ${
                  hasActive
                    ? 'bg-rose-500 text-white ring-4 ring-rose-200 scale-110'
                    : 'bg-white hover:bg-teal-50 text-slate-700 border-2 border-teal-400 hover:scale-105'
                }`}
                title={spot.label}
              >
                <span>{spot.emoji}</span>
              </button>
              <span
                className={`mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs backdrop-blur-xs ${
                  hasActive
                    ? 'bg-rose-600 text-white'
                    : 'bg-white/90 text-slate-700 border border-slate-200'
                }`}
              >
                {spot.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected symptoms pills below the avatar */}
      <div className="w-full mt-4 pt-3 border-t border-sky-200/60 flex flex-wrap gap-1.5 justify-center">
        {selectedSymptoms.length === 0 ? (
          <span className="text-xs text-slate-400 italic">
            {pt ? 'Nenhum sintoma selecionado ainda' : 'No symptoms picked yet'}
          </span>
        ) : (
          selectedSymptoms.map((sym) => (
            <span
              key={sym}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white shadow-2xs"
            >
              {sym}
              <button
                type="button"
                onClick={() => onToggleSymptom(sym)}
                className="hover:text-rose-200 ml-1 text-xs"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};
