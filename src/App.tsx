import React, { useState, useEffect } from 'react';
import {
  Activity,
  MapPin,
  ClipboardList,
  TrendingUp,
  Volume2,
  Users,
  ShieldAlert,
  Download,
  Info,
  Sparkles,
  Bot,
  Heart,
  Baby,
  Stethoscope,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  PatientTriage,
  NeighborhoodCluster,
  CommunityEpidemiologicalStats,
  AppPersona,
  AIEngineMode,
  AppLanguage,
} from './types';
import {
  INITIAL_CLUSTERS,
  INITIAL_TRIAGES,
  INITIAL_EPIDEMIC_STATS,
} from './data/mockCommunityData';
import { checkServerStatus } from './services/geminiService';
import { Navbar } from './components/Navbar';
import { ChildTriageWizard } from './components/ChildFamilyView/ChildTriageWizard';
import { SurveillanceDashboard } from './components/ProfessionalView/SurveillanceDashboard';
import { CommunityHeatmap } from './components/ProfessionalView/CommunityHeatmap';
import { TriageQueueTable } from './components/ProfessionalView/TriageQueueTable';
import { SirEpidemiologySim } from './components/ProfessionalView/SirEpidemiologySim';
import { AcousticDetectLab } from './components/ProfessionalView/AcousticDetectLab';
import { EpidemicReportModal } from './components/ProfessionalView/EpidemicReportModal';
import { NewTriageModal } from './components/NewTriageModal';
import { MultimodalDiagnosticCenter } from './components/ProfessionalView/MultimodalDiagnosticCenter';
import { RegulatoryValidationSuite } from './components/ProfessionalView/RegulatoryValidationSuite';
import { HospitalGameView } from './components/HospitalGame/HospitalGameView';

export default function App() {
  const [persona, setPersona] = useState<AppPersona>('hospital_tycoon');
  const [engineMode, setEngineMode] = useState<AIEngineMode>('local_agent');
  const [language, setLanguage] = useState<AppLanguage>('pt');

  // Professional Sub-tabs
  const [proTab, setProTab] = useState<'overview' | 'multimodal' | 'regulatory' | 'map' | 'queue' | 'sir' | 'acoustic'>('overview');

  // Stored state with local storage persistence
  const [triages, setTriages] = useState<PatientTriage[]>(() => {
    try {
      const saved = localStorage.getItem('duli_triages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRIAGES;
  });

  const [clusters, setClusters] = useState<NeighborhoodCluster[]>(() => {
    try {
      const saved = localStorage.getItem('duli_clusters');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CLUSTERS;
  });

  const [stats, setStats] = useState<CommunityEpidemiologicalStats>(INITIAL_EPIDEMIC_STATS);

  // Server & Gemini Status
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);

  // Modals
  const [isNewTriageOpen, setIsNewTriageOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Check server status on mount
  useEffect(() => {
    checkServerStatus().then((res) => {
      setServerOnline(res.status === 'ok');
      setGeminiConfigured(res.geminiConfigured);
      if (res.geminiConfigured) {
        // If Gemini is ready, we can default to it or let user keep local
        setEngineMode('gemini_flash');
      }
    });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('duli_triages', JSON.stringify(triages));
    } catch {}
  }, [triages]);

  const pt = language === 'pt';

  // Handler to add a new triage
  const handleSaveTriage = (newTriage: PatientTriage) => {
    setTriages((prev) => [newTriage, ...prev]);

    // Update active / suspected cluster numbers
    setClusters((prev) =>
      prev.map((c) => {
        if (c.name.toLowerCase() === newTriage.neighborhood.toLowerCase()) {
          return {
            ...c,
            activeCases: c.activeCases + 1,
            suspectedCases: Math.max(0, c.suspectedCases - 1),
            riskLevel:
              newTriage.triageColor === 'red'
                ? 'red'
                : newTriage.triageColor === 'orange'
                ? 'orange'
                : c.riskLevel,
          };
        }
        return c;
      })
    );
  };

  const handleUpdateStatus = (id: string, status: PatientTriage['status']) => {
    setTriages((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ triages, clusters, stats, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `duli-health-surveillance-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const criticalCount = triages.filter((t) => t.triageColor === 'red' || t.triageColor === 'orange').length;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Global Navigation Header */}
      <Navbar
        persona={persona}
        setPersona={setPersona}
        engineMode={engineMode}
        setEngineMode={setEngineMode}
        language={language}
        setLanguage={setLanguage}
        serverOnline={serverOnline}
        geminiConfigured={geminiConfigured}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Gamified Hospital & Clinic Management Tycoon Mode */}
        {persona === 'hospital_tycoon' && (
          <div className="animate-fade-in space-y-6">
            <HospitalGameView
              language={language}
              onOpenMultiModalCenter={() => {
                setPersona('professional_acs');
                setProTab('multimodal');
              }}
            />
          </div>
        )}

        {/* Child & Family Citizen Mode */}
        {persona === 'child_citizen' && (
          <div className="animate-fade-in space-y-6">
            <ChildTriageWizard
              engineMode={engineMode}
              language={language}
              onSaveTriage={handleSaveTriage}
            />
          </div>
        )}

        {/* Professional / ACS Surveillance Mode */}
        {persona === 'professional_acs' && (
          <div className="space-y-6 animate-fade-in">
            {/* Professional Sub-navigation bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { id: 'overview', label: pt ? 'Visão Geral & Indicadores' : 'Overview & Telemetry', icon: Activity },
                  { id: 'multimodal', label: pt ? 'Centro Diagnóstico (RX/TC/ECG)' : 'Multi-Modal (CXR/CT/ECG)', icon: Layers },
                  { id: 'regulatory', label: pt ? 'Validação ISO / FDA / ANVISA' : 'Regulatory (ISO/FDA/ANVISA)', icon: ShieldCheck },
                  { id: 'map', label: pt ? 'Mapa de Agrupamento (GIS)' : 'Cluster Map (GIS)', icon: MapPin },
                  { id: 'queue', label: pt ? `Fila de Atendimento (${triages.length})` : `Triage Queue (${triages.length})`, icon: ClipboardList },
                  { id: 'sir', label: pt ? 'Simulador SIR (Curva)' : 'SIR Epidemic Simulator', icon: TrendingUp },
                  { id: 'acoustic', label: pt ? 'Lab Acústico Detect II' : 'Detect II Acoustic Lab', icon: Volume2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = proTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Status info */}
              <div className="flex items-center gap-3 px-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>
                    {engineMode === 'gemini_flash' ? 'IA: Gemini 3.8 Flash' : 'IA: Agente Local'}
                  </span>
                </span>
              </div>
            </div>

            {/* Sub-tab Views */}
            {proTab === 'overview' && (
              <div className="space-y-6">
                <SurveillanceDashboard
                  stats={stats}
                  totalTriaged={triages.length}
                  criticalCases={criticalCount}
                  language={language}
                  onOpenNewTriage={() => setIsNewTriageOpen(true)}
                  onOpenEpidemicReport={() => setIsReportOpen(true)}
                  onExportData={handleExportData}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <CommunityHeatmap
                      clusters={clusters}
                      language={language}
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <AcousticDetectLab
                      engineMode={engineMode}
                      language={language}
                    />
                  </div>
                </div>

                <TriageQueueTable
                  triages={triages}
                  language={language}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            )}

            {proTab === 'multimodal' && (
              <MultimodalDiagnosticCenter
                triages={triages}
                engineMode={engineMode}
                language={language}
              />
            )}

            {proTab === 'regulatory' && (
              <RegulatoryValidationSuite
                language={language}
              />
            )}

            {proTab === 'map' && (
              <CommunityHeatmap
                clusters={clusters}
                language={language}
              />
            )}

            {proTab === 'queue' && (
              <TriageQueueTable
                triages={triages}
                language={language}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {proTab === 'sir' && (
              <SirEpidemiologySim language={language} />
            )}

            {proTab === 'acoustic' && (
              <AcousticDetectLab
                engineMode={engineMode}
                language={language}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <NewTriageModal
        isOpen={isNewTriageOpen}
        onClose={() => setIsNewTriageOpen(false)}
        engineMode={engineMode}
        language={language}
        onSaveTriage={handleSaveTriage}
      />

      <EpidemicReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        clusters={clusters}
        engineMode={engineMode}
        language={language}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">DULI-COVID19</span>
            <span>×</span>
            <span className="font-semibold text-teal-700">COVID-19 Detect II</span>
            <span>•</span>
            <span>HackCovid19 Brasil & Devpost Architecture</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            {pt
              ? 'Sistema de Suporte à Decisão Clínica & Vigilância Epidemiológica • Protocolo Manchester / SUS'
              : 'Clinical Decision Support & Community Surveillance • Manchester Protocol / SUS'}
          </div>
        </div>
      </footer>
    </div>
  );
}
