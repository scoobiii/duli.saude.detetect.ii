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
import { DynamicReadmeView } from './components/DynamicReadmeView';
import { useAuth } from './context/AuthContext';
import {
  UserRole,
  HospitalAdmissionRecord,
  MaintenanceOrderRecord,
  FinanceTransactionRecord,
  INITIAL_ADMISSIONS,
  INITIAL_MAINTENANCE_ORDERS,
  INITIAL_FINANCE_RECORDS,
  saveTriageToFirestore,
  saveAdmissionToFirestore,
} from './services/firestoreSync';
import { ClienteDashboard } from './components/RoleDashboards/ClienteDashboard';
import { RecepcionistaDashboard } from './components/RoleDashboards/RecepcionistaDashboard';
import { MedicoDashboard } from './components/RoleDashboards/MedicoDashboard';
import { ManutencaoDashboard } from './components/RoleDashboards/ManutencaoDashboard';
import { GestaoErpDashboard } from './components/RoleDashboards/GestaoErpDashboard';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './services/firebase';

export default function App() {
  const { role, setRole, user } = useAuth();

  const [persona, setPersona] = useState<AppPersona>('role_dashboard');
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

  const [admissions, setAdmissions] = useState<HospitalAdmissionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('duli_admissions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ADMISSIONS;
  });

  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('duli_maintenance_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MAINTENANCE_ORDERS;
  });

  const [finances, setFinances] = useState<FinanceTransactionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('duli_finances');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FINANCE_RECORDS;
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
        setEngineMode('gemini_flash');
      }
    });
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('duli_triages', JSON.stringify(triages));
      localStorage.setItem('duli_admissions', JSON.stringify(admissions));
      localStorage.setItem('duli_maintenance_orders', JSON.stringify(maintenanceOrders));
      localStorage.setItem('duli_finances', JSON.stringify(finances));
    } catch {}
  }, [triages, admissions, maintenanceOrders, finances]);

  // Real-time Firestore synchronization if user authenticated
  useEffect(() => {
    if (!user) return;

    try {
      const unsubscribeTriages = onSnapshot(collection(db, 'triages'), (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as PatientTriage);
          setTriages((prev) => {
            const ids = new Set(remote.map((r) => r.id));
            const localOnly = prev.filter((p) => !ids.has(p.id));
            return [...remote, ...localOnly];
          });
        }
      }, (error) => {
        console.warn('Triages snapshot error:', error);
      });

      const unsubscribeAdmissions = onSnapshot(collection(db, 'hospital_admissions'), (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as HospitalAdmissionRecord);
          setAdmissions((prev) => {
            const ids = new Set(remote.map((r) => r.id));
            const localOnly = prev.filter((p) => !ids.has(p.id));
            return [...remote, ...localOnly];
          });
        }
      }, (error) => {
        console.warn('Admissions snapshot error:', error);
      });

      return () => {
        unsubscribeTriages();
        unsubscribeAdmissions();
      };
    } catch (err) {
      console.warn('Real-time listener setup notice:', err);
    }
  }, [user]);

  const pt = language === 'pt';

  // Handler to add a new triage
  const handleSaveTriage = async (newTriage: PatientTriage) => {
    setTriages((prev) => [newTriage, ...prev]);
    saveTriageToFirestore(newTriage).catch(console.warn);

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

  const handleUpdateAdmissionStage = (id: string, stage: HospitalAdmissionRecord['stage']) => {
    setAdmissions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage } : a))
    );
  };

  const handleUpdateOrderStatus = (id: string, status: MaintenanceOrderRecord['status']) => {
    setMaintenanceOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      triages,
      admissions,
      maintenanceOrders,
      finances,
      clusters,
      stats,
      exportedAt: new Date().toISOString(),
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `duli-hospital-data-${Date.now()}.json`;
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
        onOpenRoleDashboard={(r) => {
          setRole(r);
          setPersona('role_dashboard');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role-Based Dashboard View (Cliente, Recepcionista, Médico, Manutenção, Gestão ERP) */}
        {persona === 'role_dashboard' && (
          <div className="animate-fade-in space-y-6">
            {/* Quick Role Switcher Banner */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider font-mono">
                  {pt ? 'PERFIL ATIVO:' : 'ACTIVE ROLE:'}
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200 uppercase">
                  {role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { r: 'cliente', label: pt ? 'Cliente / Paciente' : 'Patient' },
                  { r: 'recepcionista', label: pt ? 'Recepcionista' : 'Receptionist' },
                  { r: 'medico', label: pt ? 'Médico Clínico' : 'Doctor' },
                  { r: 'manutencao', label: pt ? 'Manutenção / Eng.' : 'Maintenance' },
                  { r: 'gestao', label: pt ? 'Gestão / ERP' : 'Management' },
                ].map((item) => (
                  <button
                    key={item.r}
                    onClick={() => setRole(item.r as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      role === item.r
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Role Dashboard */}
            {role === 'cliente' && (
              <ClienteDashboard
                triages={triages}
                admissions={admissions}
                language={language}
                onOpenNewTriage={() => setIsNewTriageOpen(true)}
                onViewDiagnosticCenter={() => {
                  setPersona('professional_acs');
                  setProTab('multimodal');
                }}
              />
            )}

            {role === 'recepcionista' && (
              <RecepcionistaDashboard
                admissions={admissions}
                onAddAdmission={(adm) => setAdmissions([adm, ...admissions])}
                onUpdateAdmissionStage={handleUpdateAdmissionStage}
                language={language}
              />
            )}

            {role === 'medico' && (
              <MedicoDashboard
                triages={triages}
                admissions={admissions}
                onUpdateTriageStatus={handleUpdateStatus}
                onUpdateAdmissionStage={handleUpdateAdmissionStage}
                onOpenMultiModalCenter={() => {
                  setPersona('professional_acs');
                  setProTab('multimodal');
                }}
                engineMode={engineMode}
                language={language}
              />
            )}

            {role === 'manutencao' && (
              <ManutencaoDashboard
                orders={maintenanceOrders}
                onAddOrder={(ord) => setMaintenanceOrders([ord, ...maintenanceOrders])}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                language={language}
              />
            )}

            {role === 'gestao' && (
              <GestaoErpDashboard
                finances={finances}
                onAddTransaction={(tx) => setFinances([tx, ...finances])}
                onOpenRegulatoryAudit={() => {
                  setPersona('professional_acs');
                  setProTab('regulatory');
                }}
                onOpenMultiModalCenter={() => {
                  setPersona('professional_acs');
                  setProTab('multimodal');
                }}
                language={language}
              />
            )}
          </div>
        )}

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

        {/* Dynamic README & Live CI/CD Pipeline Mode */}
        {persona === 'readme_ci' && (
          <div className="animate-fade-in space-y-6">
            <DynamicReadmeView language={language} />
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
