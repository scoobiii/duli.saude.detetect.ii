import React, { useState } from 'react';
import {
  MapPin,
  ShieldAlert,
  Users,
  Droplets,
  AlertTriangle,
  UserCheck,
  Send,
  Filter,
} from 'lucide-react';
import { NeighborhoodCluster, AppLanguage } from '../../types';

interface HeatmapProps {
  clusters: NeighborhoodCluster[];
  language: AppLanguage;
  onDispatchACSAlert?: (clusterName: string) => void;
}

export const CommunityHeatmap: React.FC<HeatmapProps> = ({
  clusters,
  language,
  onDispatchACSAlert,
}) => {
  const pt = language === 'pt';
  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[1]?.id || 'b2');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [alertSuccessMessage, setAlertSuccessMessage] = useState<string | null>(null);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  const filteredClusters = clusters.filter((c) => {
    if (filterRisk === 'all') return true;
    return c.riskLevel === filterRisk;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'red':
        return {
          fill: '#f43f5e',
          stroke: '#be123c',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          badge: 'bg-rose-600 text-white',
          label: pt ? 'Zona Vermelha (Crítica)' : 'Red Zone (Critical)',
        };
      case 'orange':
        return {
          fill: '#f97316',
          stroke: '#c2410c',
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          badge: 'bg-orange-500 text-white',
          label: pt ? 'Zona Laranja (Alerta Alto)' : 'Orange Zone (High Alert)',
        };
      case 'yellow':
        return {
          fill: '#eab308',
          stroke: '#a16207',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          badge: 'bg-amber-500 text-white',
          label: pt ? 'Zona Amarela (Atenção)' : 'Yellow Zone (Moderate)',
        };
      default:
        return {
          fill: '#10b981',
          stroke: '#047857',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          label: pt ? 'Zona Verde (Controlada)' : 'Green Zone (Controlled)',
        };
    }
  };

  const handleSendAlert = (clusterName: string) => {
    setAlertSuccessMessage(
      pt
        ? `Alerta de busca ativa enviado para os Agentes Comunitários da microárea: ${clusterName}`
        : `Active search alert dispatched to Community Health Agents for: ${clusterName}`
    );
    if (onDispatchACSAlert) onDispatchACSAlert(clusterName);
    setTimeout(() => setAlertSuccessMessage(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {pt ? 'Mapa Comunitário de Agrupamento & Risco (GIS DULI)' : 'DULI Community Cluster & Heatmap (GIS)'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {pt
              ? 'Mapeamento territorial de transmissão local e densidade de vulnerabilidade por microárea de saúde.'
              : 'Territorial mapping of local transmission and vulnerability density by health sector.'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <button
            onClick={() => setFilterRisk('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterRisk === 'all' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            {pt ? 'Todos' : 'All'}
          </button>
          <button
            onClick={() => setFilterRisk('red')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterRisk === 'red' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            {pt ? 'Críticos' : 'Critical'}
          </button>
          <button
            onClick={() => setFilterRisk('orange')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterRisk === 'orange' ? 'bg-orange-500 text-white font-bold' : 'text-slate-600'
            }`}
          >
            {pt ? 'Alerta' : 'Alert'}
          </button>
          <button
            onClick={() => setFilterRisk('green')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterRisk === 'green' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            {pt ? 'Verde' : 'Green'}
          </button>
        </div>
      </div>

      {alertSuccessMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>{alertSuccessMessage}</span>
        </div>
      )}

      {/* Grid: Map on Left, Detail Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* SVG Interactive Map */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-[380px]">
          {/* Top cartography controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 z-10">
            <span>DULI-GIS // COORD_REF: WGS84</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE TELEMETRY</span>
            </span>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="relative w-full h-72 sm:h-80 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            >
              {/* Cartographic Grid Lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                {/* Radial gradients for heatmap glow */}
                <radialGradient id="redGlow">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="orangeGlow">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="100" height="100" fill="url(#grid)" />

              {/* Connecting District Roads/Rivers */}
              <path
                d="M 15 20 Q 40 45 85 30"
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              <path
                d="M 30 85 Q 50 60 70 80"
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              <path
                d="M 45 10 L 45 90"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Neighborhood Sectors & Hotspots */}
              {filteredClusters.map((cluster) => {
                const colors = getRiskColor(cluster.riskLevel);
                const isSelected = cluster.id === selectedClusterId;
                const radius = Math.min(12, Math.max(7, Math.sqrt(cluster.activeCases) * 1.5));

                return (
                  <g
                    key={cluster.id}
                    onClick={() => setSelectedClusterId(cluster.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Radar for critical red zones */}
                    {cluster.riskLevel === 'red' && (
                      <circle
                        cx={cluster.coordinates.x}
                        cy={cluster.coordinates.y}
                        r={radius * 1.8}
                        fill="url(#redGlow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Outer selection ring */}
                    {isSelected && (
                      <circle
                        cx={cluster.coordinates.x}
                        cy={cluster.coordinates.y}
                        r={radius + 3.5}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.2"
                        strokeDasharray="2,2"
                        className="animate-spin-slow origin-center"
                      />
                    )}

                    {/* Main Cluster Circle */}
                    <circle
                      cx={cluster.coordinates.x}
                      cy={cluster.coordinates.y}
                      r={radius}
                      fill={colors.fill}
                      stroke={isSelected ? '#ffffff' : colors.stroke}
                      strokeWidth={isSelected ? '2' : '1'}
                      className="transition-all duration-200 group-hover:scale-110"
                    />

                    {/* Case Count Label inside circle */}
                    <text
                      x={cluster.coordinates.x}
                      y={cluster.coordinates.y + 1.2}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="3.5"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {cluster.activeCases}
                    </text>

                    {/* Sector Name */}
                    <text
                      x={cluster.coordinates.x}
                      y={cluster.coordinates.y + radius + 4.5}
                      textAnchor="middle"
                      fill={isSelected ? '#38bdf8' : '#94a3b8'}
                      fontSize="2.8"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none"
                    >
                      {cluster.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="font-semibold text-slate-300">
              {pt ? 'Legenda de Risco Epidemiológico:' : 'Outbreak Risk Legend:'}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{pt ? 'Crítico' : 'Critical'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>{pt ? 'Alerta' : 'Alert'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>{pt ? 'Atenção' : 'Warning'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{pt ? 'Controlado' : 'Controlled'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Sector Telemetry Inspector Card */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {pt ? 'Inspetor de Microárea' : 'Sector Telemetry Inspector'}
              </span>
              <span
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  getRiskColor(selectedCluster.riskLevel).badge
                }`}
              >
                {selectedCluster.riskLevel}
              </span>
            </div>

            <h4 className="text-xl font-black text-slate-900 mb-1">
              {selectedCluster.name}
            </h4>
            <p className="text-xs text-slate-600 flex items-center gap-1 mb-4">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{selectedCluster.acsAssigned}</span>
            </p>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>{pt ? 'Casos Ativos / Transmissão' : 'Active Contagion Cases'}</span>
                </span>
                <span className="text-base font-black text-rose-600 font-mono">
                  {selectedCluster.activeCases}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>{pt ? 'Casos Suspeitos em Triagem' : 'Suspected in Triage'}</span>
                </span>
                <span className="text-base font-black text-orange-600 font-mono">
                  {selectedCluster.suspectedCases}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{pt ? 'Idosos Vulneráveis (60+)' : 'Vulnerable Seniors (60+)'}</span>
                </span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {selectedCluster.vulnerableElderly}
                </span>
              </div>

              {/* Sanitation index progress bar */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <span>{pt ? 'Índice de Saneamento Básico' : 'Basic Sanitation Index'}</span>
                  </span>
                  <span className="font-mono text-slate-900">{selectedCluster.sanitationIndex}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${selectedCluster.sanitationIndex}%` }}
                    className={`h-full rounded-full ${
                      selectedCluster.sanitationIndex < 60
                        ? 'bg-rose-500'
                        : selectedCluster.sanitationIndex < 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action to dispatch active case search */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <button
              onClick={() => handleSendAlert(selectedCluster.name)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>
                {pt
                  ? `Despachar Alerta ACS para ${selectedCluster.name}`
                  : `Dispatch ACS Alert to ${selectedCluster.name}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
