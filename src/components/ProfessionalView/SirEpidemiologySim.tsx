import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { AppLanguage, SirSimulationParams } from '../../types';
import { simulateSirModel } from '../../services/localAgent';

interface SirSimProps {
  language: AppLanguage;
}

export const SirEpidemiologySim: React.FC<SirSimProps> = ({ language }) => {
  const pt = language === 'pt';

  // Simulation parameters
  const [population, setPopulation] = useState<number>(30000);
  const [initialInfected, setInitialInfected] = useState<number>(150);
  const [maskAdoption, setMaskAdoption] = useState<number>(65);
  const [isolationAdherence, setIsolationAdherence] = useState<number>(70);
  const [transmissionBeta, setTransmissionBeta] = useState<number>(0.35); // base R0 ~ 2.5
  const [recoveryGamma, setRecoveryGamma] = useState<number>(0.14); // ~7 days infectious period
  const simulationDays = 60;
  const hospitalCapacity = 180; // Beds available in district

  // Calculate Controlled simulation curve
  const controlledPoints = useMemo(() => {
    return simulateSirModel({
      population,
      initialInfected,
      initialRecovered: 500,
      transmissionRateBeta: transmissionBeta,
      recoveryRateGamma: recoveryGamma,
      maskAdoptionPercent: maskAdoption,
      isolationEffectivenessPercent: isolationAdherence,
      simulationDays,
    });
  }, [population, initialInfected, maskAdoption, isolationAdherence, transmissionBeta, recoveryGamma]);

  // Calculate Uncontrolled (0% masks, 0% isolation) for direct baseline comparison
  const uncontrolledPoints = useMemo(() => {
    return simulateSirModel({
      population,
      initialInfected,
      initialRecovered: 500,
      transmissionRateBeta: transmissionBeta,
      recoveryRateGamma: recoveryGamma,
      maskAdoptionPercent: 0,
      isolationEffectivenessPercent: 0,
      simulationDays,
    });
  }, [population, initialInfected, transmissionBeta, recoveryGamma]);

  // Peak metrics
  const peakControlled = useMemo(() => {
    let maxI = 0;
    let maxH = 0;
    let dayI = 0;
    controlledPoints.forEach((p) => {
      if (p.infected > maxI) {
        maxI = p.infected;
        dayI = p.day;
      }
      if (p.hospitalized > maxH) maxH = p.hospitalized;
    });
    return { maxI, maxH, dayI };
  }, [controlledPoints]);

  const peakUncontrolled = useMemo(() => {
    let maxI = 0;
    let maxH = 0;
    uncontrolledPoints.forEach((p) => {
      if (p.infected > maxI) maxI = p.infected;
      if (p.hospitalized > maxH) maxH = p.hospitalized;
    });
    return { maxI, maxH };
  }, [uncontrolledPoints]);

  const reductionPercent = Math.round(
    ((peakUncontrolled.maxI - peakControlled.maxI) / (peakUncontrolled.maxI || 1)) * 100
  );

  // SVG dimensions & scaling
  const maxSimPop = population * 0.45; // scale peak
  const svgWidth = 600;
  const svgHeight = 260;
  const padding = 35;

  const getX = (day: number) => padding + (day / simulationDays) * (svgWidth - padding * 2);
  const getY = (val: number) => svgHeight - padding - (val / maxSimPop) * (svgHeight - padding * 2);

  // Generate SVG path strings
  const infectedPath = controlledPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.infected)}`)
    .join(' ');

  const unctrlInfectedPath = uncontrolledPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.infected)}`)
    .join(' ');

  const hospitalizedPath = controlledPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.hospitalized)}`)
    .join(' ');

  const recoveredPath = controlledPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.recovered)}`)
    .join(' ');

  const capacityY = getY(hospitalCapacity);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {pt ? 'Simulador Epidemiológico SIR (Achatamento da Curva)' : 'Epidemiological SIR Outbreak Model'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {pt
              ? 'Modelagem matemática dinâmica de transmissão comunitária e capacidade de leitos hospitalares.'
              : 'Dynamic mathematical modeling of community transmission and hospital bed strain.'}
          </p>
        </div>

        <button
          onClick={() => {
            setMaskAdoption(65);
            setIsolationAdherence(70);
            setTransmissionBeta(0.35);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{pt ? 'Restaurar Parâmetros' : 'Reset'}</span>
        </button>
      </div>

      {/* Interactive Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        {/* Mask Adoption */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-slate-800">
            <span>{pt ? 'Adesão a Máscaras PFF2' : 'Mask Adoption'}</span>
            <span className="text-teal-700 font-mono">{maskAdoption}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={maskAdoption}
            onChange={(e) => setMaskAdoption(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <span className="text-[10px] text-slate-500 block mt-1">
            {pt ? 'Reduz taxa de contágio' : 'Reduces transmission rate'}
          </span>
        </div>

        {/* Isolation */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-slate-800">
            <span>{pt ? 'Adesão ao Isolamento Domiciliar' : 'Home Quarantine Adherence'}</span>
            <span className="text-indigo-700 font-mono">{isolationAdherence}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isolationAdherence}
            onChange={(e) => setIsolationAdherence(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-[10px] text-slate-500 block mt-1">
            {pt ? 'Busca ativa e quarentena 7 dias' : 'Early detection & quarantine'}
          </span>
        </div>

        {/* Transmission Beta */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-slate-800">
            <span>{pt ? 'Contatos Diários / Taxa β' : 'Transmission β'}</span>
            <span className="text-amber-700 font-mono">{transmissionBeta.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="0.6"
            step="0.02"
            value={transmissionBeta}
            onChange={(e) => setTransmissionBeta(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <span className="text-[10px] text-slate-500 block mt-1">
            {pt ? 'Intensidade de aglomeração' : 'Gathering density'}
          </span>
        </div>

        {/* Initial Infected */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-slate-800">
            <span>{pt ? 'Focos Iniciais de Infecção (I₀)' : 'Initial Outbreak Size (I₀)'}</span>
            <span className="text-rose-700 font-mono">{initialInfected}</span>
          </div>
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={initialInfected}
            onChange={(e) => setInitialInfected(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <span className="text-[10px] text-slate-500 block mt-1">
            {pt ? 'Casos ativos no dia zero' : 'Active cases at day 0'}
          </span>
        </div>
      </div>

      {/* Projection Impact Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-800 uppercase">
            {pt ? 'Achatamento do Pico' : 'Peak Curve Flattening'}
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5 font-mono">
            -{reductionPercent}%
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-1">
            {pt
              ? 'Menos pessoas infectadas simultaneamente'
              : 'Fewer simultaneous infections'}
          </div>
        </div>

        <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200">
          <div className="text-[10px] font-bold text-indigo-800 uppercase">
            {pt ? 'Dia do Pico de Casos' : 'Peak Outbreak Day'}
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-0.5 font-mono">
            Dia {peakControlled.dayI}
          </div>
          <div className="text-[11px] text-indigo-800 font-medium mt-1">
            {pt
              ? 'Ganho de tempo para o sistema de saúde'
              : 'Gains critical time for clinics'}
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          peakControlled.maxH > hospitalCapacity
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-teal-50 border-teal-200 text-teal-900'
        }`}>
          <div className="text-[10px] font-bold uppercase">
            {pt ? 'Pico de Demanda Hospitalar' : 'Peak Bed Demand'}
          </div>
          <div className="text-2xl font-black mt-0.5 font-mono">
            {peakControlled.maxH} / {hospitalCapacity} {pt ? 'leitos' : 'beds'}
          </div>
          <div className="text-[11px] font-medium mt-1">
            {peakControlled.maxH <= hospitalCapacity
              ? pt ? '✓ Dentro da capacidade de internação' : '✓ Within hospital capacity'
              : pt ? '⚠ Risco de sobrecarga do SUS' : '⚠ Risk of hospital overload'}
          </div>
        </div>
      </div>

      {/* SVG Projection Curve */}
      <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span>SIR_PROJECTION_ENGINE // N={population}</span>
          <span>HORIZON: {simulationDays} DAYS</span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 select-none">
            {/* Grid Lines */}
            <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1" />
            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#334155" strokeWidth="1" />

            {/* Hospital Capacity Ceiling Line */}
            <line
              x1={padding}
              y1={capacityY}
              x2={svgWidth - padding}
              y2={capacityY}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text x={svgWidth - padding - 5} y={capacityY - 6} fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="end">
              {pt ? 'Capacidade Máxima de Leitos' : 'Hospital Bed Capacity'}
            </text>

            {/* Uncontrolled Curve (Grey dashed) */}
            <path
              d={unctrlInfectedPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="3,3"
              opacity="0.6"
            />

            {/* Controlled Active Contagion (Red solid) */}
            <path
              d={infectedPath}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3"
            />

            {/* Hospitalized (Purple solid) */}
            <path
              d={hospitalizedPath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.5"
            />

            {/* Recovered (Emerald) */}
            <path
              d={recoveredPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Axes Labels */}
            <text x={padding} y={padding - 10} fill="#94a3b8" fontSize="9">
              {pt ? 'Indivíduos' : 'Individuals'}
            </text>
            <text x={svgWidth - padding} y={svgHeight - padding + 18} fill="#94a3b8" fontSize="9" textAnchor="end">
              {pt ? 'Dias de Simulação (0 a 60)' : 'Simulation Days (0 to 60)'}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-3 border-t border-slate-800 gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500" />
              <span>{pt ? 'Casos Ativos (Com Medidas)' : 'Infected (Interventions Active)'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
              <span>{pt ? 'Sem Medidas (Cenário Descontrolado)' : 'No Interventions Baseline'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-400" />
              <span>{pt ? 'Internações Hospitalares' : 'Hospitalized'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500" />
              <span>{pt ? 'Recuperados' : 'Recovered'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
