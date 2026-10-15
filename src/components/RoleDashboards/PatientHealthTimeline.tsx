import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Activity,
  Layers,
  HeartPulse,
  Pill,
  Building,
  UserCheck,
  Stethoscope,
  FileText,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Thermometer,
  ShieldAlert,
  Microscope,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { PatientTriage, AppLanguage, ImagingStudy, LabBiomarkerPanel } from '../../types';
import { HospitalAdmissionRecord } from '../../services/firestoreSync';
import { INITIAL_IMAGING_STUDIES, INITIAL_LAB_PANELS } from '../../data/multimodalMedicalData';

export type TimelineEventType = 'triage' | 'admission' | 'diagnostic' | 'lab' | 'clinical_evolution';

export interface TimelineEvent {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  dateLabel: string;
  timeLabel: string;
  type: TimelineEventType;
  title: string;
  subtitle?: string;
  urgencyLevel?: 'critical' | 'high' | 'moderate' | 'low' | 'neutral';
  triageColor?: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  vitals?: {
    spo2?: number;
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    respiratoryRate?: number;
  };
  details: {
    description: string;
    stageOrStatus?: string;
    doctorOrTechnician?: string;
    locationRoom?: string;
    scoreOrSeverity?: string | number;
    findings?: string[];
    labs?: Record<string, string | number>;
    tags?: string[];
    aihAmount?: number;
  };
}

interface PatientHealthTimelineProps {
  patient: PatientTriage;
  allTriages?: PatientTriage[];
  allAdmissions?: HospitalAdmissionRecord[];
  imagingStudies?: ImagingStudy[];
  labPanels?: Record<string, LabBiomarkerPanel>;
  language: AppLanguage;
  onOpenMultiModalCenter?: () => void;
  onAddEvolution?: (evolutionText: string) => void;
}

export const PatientHealthTimeline: React.FC<PatientHealthTimelineProps> = ({
  patient,
  allTriages = [],
  allAdmissions = [],
  imagingStudies = INITIAL_IMAGING_STUDIES,
  labPanels = INITIAL_LAB_PANELS,
  language,
  onOpenMultiModalCenter,
  onAddEvolution,
}) => {
  const pt = language === 'pt';

  const [filterType, setFilterType] = useState<TimelineEventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [evolutionNote, setEvolutionNote] = useState('');
  const [evolutionCategory, setEvolutionCategory] = useState<'Evolução Médica' | 'Intercorrência Clínica' | 'Ajuste de Conduta' | 'Alta Programada'>('Evolução Médica');
  const [customEvolutions, setCustomEvolutions] = useState<TimelineEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`duli_evolutions_${patient.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveEvolution = () => {
    if (!evolutionNote.trim()) return;

    const now = new Date();
    const newEvent: TimelineEvent = {
      id: `evo-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now.toISOString(),
      dateLabel: now.toLocaleDateString(pt ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeLabel: now.toLocaleTimeString(pt ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      type: 'clinical_evolution',
      title: `${evolutionCategory} - Prontuário Eletrônico`,
      subtitle: pt ? 'Registro de Conduta & Evolução Hospitalar' : 'Clinical Progress & Conduct Record',
      urgencyLevel: evolutionCategory === 'Intercorrência Clínica' ? 'high' : 'neutral',
      details: {
        description: evolutionNote.trim(),
        doctorOrTechnician: 'Dra. Beatriz Albuquerque (CRM-SP 142.890)',
        locationRoom: 'Consultório / Posto Clínico',
        tags: [evolutionCategory, 'PEP SUS', 'Human-in-the-Loop'],
      },
    };

    const updated = [newEvent, ...customEvolutions];
    setCustomEvolutions(updated);
    try {
      localStorage.setItem(`duli_evolutions_${patient.id}`, JSON.stringify(updated));
    } catch {}

    if (onAddEvolution) {
      onAddEvolution(evolutionNote.trim());
    }

    setEvolutionNote('');
    setIsEvolutionModalOpen(false);
  };

  // Build Unified Timeline Events for Selected Patient
  const rawTimelineEvents = useMemo<TimelineEvent[]>(() => {
    const list: TimelineEvent[] = [];

    // 1. Triages matching this patient
    const relevantTriages = allTriages.filter(
      (t) => t.id === patient.id || t.name.toLowerCase() === patient.name.toLowerCase()
    );
    const triageSources = relevantTriages.length > 0 ? relevantTriages : [patient];

    triageSources.forEach((triage) => {
      const dt = new Date(triage.timestamp || Date.now());
      list.push({
        id: `triage-${triage.id}`,
        patientId: triage.id,
        patientName: triage.name,
        timestamp: triage.timestamp || new Date().toISOString(),
        dateLabel: dt.toLocaleDateString(pt ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeLabel: dt.toLocaleTimeString(pt ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'triage',
        title: pt
          ? `Triagem Manchester: Classificação ${triage.triageColor.toUpperCase()} (${triage.triageLevel})`
          : `Manchester Triage: Priority ${triage.triageColor.toUpperCase()} (${triage.triageLevel})`,
        subtitle: pt ? `Acolhimento UBS/UPA - Escore Clínico: ${triage.score}/100` : `Primary Care Intake - Score: ${triage.score}/100`,
        urgencyLevel:
          triage.triageColor === 'red'
            ? 'critical'
            : triage.triageColor === 'orange'
            ? 'high'
            : triage.triageColor === 'yellow'
            ? 'moderate'
            : 'low',
        triageColor: triage.triageColor,
        vitals: {
          spo2: triage.vitals?.spo2,
          temperature: triage.vitals?.temperature,
          heartRate: triage.vitals?.heartRate,
          bloodPressure:
            triage.vitals?.systolicBP && triage.vitals?.diastolicBP
              ? `${triage.vitals.systolicBP}/${triage.vitals.diastolicBP}`
              : undefined,
          respiratoryRate: triage.vitals?.respiratoryRate,
        },
        details: {
          description: triage.clinicalRationale || triage.summary,
          stageOrStatus: triage.status,
          doctorOrTechnician: `Avaliador: Agente Local & Protocolo de Manchester`,
          locationRoom: `Bairro: ${triage.neighborhood}`,
          scoreOrSeverity: `${triage.score}/100`,
          findings: triage.symptoms,
          tags: [
            ...(triage.comorbidities || []),
            triage.coughType ? `Tosse: ${triage.coughType}` : '',
            triage.emergencyDispatchRecommended ? '🚨 Despacho SAMU' : 'Acompanhamento Atenção Básica',
          ].filter(Boolean),
        },
      });
    });

    // 2. Admissions matching this patient
    const relevantAdmissions = allAdmissions.filter((adm) => {
      const matchName =
        adm.patientName.toLowerCase().includes(patient.name.toLowerCase()) ||
        patient.name.toLowerCase().includes(adm.patientName.toLowerCase());
      const matchCard =
        adm.susCard &&
        patient.susCardNumber &&
        adm.susCard.replace(/\D/g, '') === patient.susCardNumber.replace(/\D/g, '');
      return matchName || matchCard;
    });

    relevantAdmissions.forEach((adm) => {
      const dt = new Date(adm.admittedAt || Date.now());
      list.push({
        id: `adm-${adm.id}`,
        patientId: patient.id,
        patientName: adm.patientName,
        timestamp: adm.admittedAt,
        dateLabel: dt.toLocaleDateString(pt ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeLabel: dt.toLocaleTimeString(pt ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'admission',
        title: pt
          ? `Internação Hospitalar: ${adm.assignedRoom || 'Leito Designado'}`
          : `Hospital Admission: ${adm.assignedRoom || 'Assigned Bed'}`,
        subtitle: pt
          ? `Estágio Atual: ${adm.stage.toUpperCase()} • Prioridade: ${adm.priority.toUpperCase()}`
          : `Current Stage: ${adm.stage.toUpperCase()} • Priority: ${adm.priority.toUpperCase()}`,
        urgencyLevel:
          adm.priority === 'red'
            ? 'critical'
            : adm.priority === 'orange'
            ? 'high'
            : adm.priority === 'yellow'
            ? 'moderate'
            : 'low',
        triageColor: adm.priority,
        details: {
          description: adm.chiefComplaint || adm.diagnosis || 'Admissão para conduta e suporte hospitalar.',
          stageOrStatus: adm.stage,
          doctorOrTechnician: adm.assignedDoctor || 'Dra. Beatriz Albuquerque',
          locationRoom: adm.assignedRoom,
          aihAmount: adm.aihBilledAmount,
          tags: [
            `Estágio: ${adm.stage}`,
            `AIH SUS: R$ ${adm.aihBilledAmount?.toLocaleString('pt-BR') || '---'}`,
            adm.assignedRoom || 'Ala Clínica',
          ],
        },
      });
    });

    // 3. Imaging Studies matching this patient
    const relevantStudies = imagingStudies.filter(
      (s) =>
        s.patientId === patient.id ||
        s.patientName.toLowerCase().includes(patient.name.toLowerCase()) ||
        patient.name.toLowerCase().includes(s.patientName.toLowerCase())
    );

    relevantStudies.forEach((study) => {
      const dt = new Date(study.studyDate.replace(' ', 'T') || Date.now());
      list.push({
        id: `study-${study.id}`,
        patientId: patient.id,
        patientName: study.patientName,
        timestamp: dt.toISOString(),
        dateLabel: dt.toLocaleDateString(pt ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeLabel: dt.toLocaleTimeString(pt ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'diagnostic',
        title: pt
          ? `Laudo Radiológico: ${study.title}`
          : `Radiological Report: ${study.title}`,
        subtitle: pt
          ? `Modalidade: ${study.modality} • Escore de Gravidade: ${study.severityScore}/100`
          : `Modality: ${study.modality} • Severity Score: ${study.severityScore}/100`,
        urgencyLevel: study.severityScore > 70 ? 'critical' : study.severityScore > 40 ? 'high' : 'moderate',
        details: {
          description: study.indication,
          stageOrStatus: study.status,
          scoreOrSeverity: `${study.severityScore}/100`,
          findings: study.findings,
          tags: [
            study.modality,
            `Gravidade: ${study.severityScore}%`,
            ...study.detectedLesions.map((l) => `${l.label} (${l.confidence.toFixed(1)}%)`),
          ],
        },
      });
    });

    // 4. Lab Biomarker Panels matching this patient
    const labPanel = labPanels[patient.id];
    if (labPanel) {
      const dt = new Date(labPanel.collectedAt.replace(' ', 'T') || Date.now());
      list.push({
        id: `lab-${patient.id}`,
        patientId: patient.id,
        patientName: patient.name,
        timestamp: dt.toISOString(),
        dateLabel: dt.toLocaleDateString(pt ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeLabel: dt.toLocaleTimeString(pt ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'lab',
        title: pt
          ? `Painel de Biomarcadores Críticos & RT-PCR`
          : `Critical Biomarker Panel & RT-PCR`,
        subtitle: pt
          ? `RT-PCR SARS-CoV-2: ${labPanel.rtPcrCovid} • Coleta Laboratorial`
          : `SARS-CoV-2 RT-PCR: ${labPanel.rtPcrCovid} • Laboratory Panel`,
        urgencyLevel: labPanel.crp > 50 || labPanel.dDimer > 1000 ? 'critical' : 'high',
        details: {
          description: pt
            ? `Perfil inflamatório com dosagem de PCR ultra-sensível, Dímero-D, Ferritina e Hemograma com contagem de linfócitos.`
            : `Inflammatory profile including high-sensitivity CRP, D-Dimer, Ferritin and complete blood count.`,
          stageOrStatus: 'Laudo Liberado',
          labs: {
            'PCR (mg/L)': labPanel.crp,
            'Dímero-D (ng/mL)': labPanel.dDimer,
            'Ferritina (ng/mL)': labPanel.ferritin,
            'Troponina I (ng/mL)': labPanel.troponinI,
            'Linfócitos (/mm³)': labPanel.lymphocytes,
            'Leucócitos (/mm³)': labPanel.leukocytes,
            'RT-PCR COVID-19': labPanel.rtPcrCovid,
          },
          tags: [
            `RT-PCR: ${labPanel.rtPcrCovid}`,
            `PCR: ${labPanel.crp} mg/L`,
            `Dímero-D: ${labPanel.dDimer} ng/mL`,
          ],
        },
      });
    }

    // 5. Append Custom Doctor Evolutions
    list.push(...customEvolutions);

    return list;
  }, [patient, allTriages, allAdmissions, imagingStudies, labPanels, customEvolutions, pt]);

  // Filtering and Sorting
  const filteredEvents = useMemo(() => {
    return rawTimelineEvents
      .filter((ev) => {
        if (filterType !== 'all' && ev.type !== filterType) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        const inTitle = ev.title.toLowerCase().includes(q);
        const inDesc = ev.details.description.toLowerCase().includes(q);
        const inTags = ev.details.tags?.some((t) => t.toLowerCase().includes(q));
        const inFindings = ev.details.findings?.some((f) => f.toLowerCase().includes(q));
        const inLabs = ev.details.labs && Object.keys(ev.details.labs).some((k) => k.toLowerCase().includes(q));
        return inTitle || inDesc || inTags || inFindings || inLabs;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [rawTimelineEvents, filterType, searchQuery, sortOrder]);

  // Summary counts
  const summaryCounts = useMemo(() => {
    return {
      total: rawTimelineEvents.length,
      triages: rawTimelineEvents.filter((e) => e.type === 'triage').length,
      admissions: rawTimelineEvents.filter((e) => e.type === 'admission').length,
      diagnostics: rawTimelineEvents.filter((e) => e.type === 'diagnostic' || e.type === 'lab').length,
      evolutions: rawTimelineEvents.filter((e) => e.type === 'clinical_evolution').length,
    };
  }, [rawTimelineEvents]);

  const getEventBadge = (type: TimelineEventType, urgency?: string) => {
    switch (type) {
      case 'triage':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-700',
          icon: ShieldAlert,
          dot: 'bg-emerald-500',
          label: pt ? 'Triagem' : 'Triage',
        };
      case 'admission':
        return {
          bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-300 dark:border-indigo-700',
          icon: Building,
          dot: 'bg-indigo-500',
          label: pt ? 'Internação' : 'Admission',
        };
      case 'diagnostic':
        return {
          bg: 'bg-cyan-500/10 text-cyan-700 border-cyan-300 dark:border-cyan-700',
          icon: Layers,
          dot: 'bg-cyan-500',
          label: pt ? 'Exame Imagem' : 'Imaging',
        };
      case 'lab':
        return {
          bg: 'bg-purple-500/10 text-purple-700 border-purple-300 dark:border-purple-700',
          icon: Microscope,
          dot: 'bg-purple-500',
          label: pt ? 'Biomarcadores' : 'Lab Panel',
        };
      case 'clinical_evolution':
        return {
          bg: 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-700',
          icon: Stethoscope,
          dot: 'bg-amber-500',
          label: pt ? 'Evolução' : 'Progress Note',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6">
      {/* Top Banner / Timeline Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-300 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {pt ? 'HISTÓRICO LONGITUDINAL' : 'LONGITUDINAL FEED'}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  ID: #{patient.id} • {patient.name}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                {pt ? 'Linha do Tempo Clínica do Paciente' : 'Patient Health Chronological Timeline'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {pt
                  ? 'Feed vertical cronológico unificando triagens, regulações hospitalares, exames radiológicos e evoluções médicas.'
                  : 'Vertical chronological feed unifying triages, hospital admissions, imaging studies, and clinical evolutions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEvolutionModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-900" />
              <span>{pt ? '+ Nova Evolução Médica' : '+ New Clinical Note'}</span>
            </button>
          </div>
        </div>

        {/* Metric Badges Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300">{pt ? 'Total Eventos' : 'Total Events'}</span>
            <div className="text-lg font-black text-white">{summaryCounts.total}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-300">{pt ? 'Triagens' : 'Triages'}</span>
            <div className="text-lg font-black text-emerald-400">{summaryCounts.triages}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-300">{pt ? 'Internações' : 'Admissions'}</span>
            <div className="text-lg font-black text-indigo-400">{summaryCounts.admissions}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-cyan-300">{pt ? 'Exames & Labs' : 'Diagnostics'}</span>
            <div className="text-lg font-black text-cyan-400">{summaryCounts.diagnostics}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-amber-300">{pt ? 'Evoluções PEP' : 'Progress Notes'}</span>
            <div className="text-lg font-black text-amber-400">{summaryCounts.evolutions}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="px-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pt ? 'Todos' : 'All'} ({summaryCounts.total})
            </button>
            <button
              onClick={() => setFilterType('triage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'triage'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {pt ? 'Triagens' : 'Triages'} ({summaryCounts.triages})
            </button>
            <button
              onClick={() => setFilterType('admission')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'admission'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              {pt ? 'Internações' : 'Admissions'} ({summaryCounts.admissions})
            </button>
            <button
              onClick={() => setFilterType('diagnostic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'diagnostic'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
              }`}
            >
              {pt ? 'Exames & RX/TC' : 'Imaging'}
            </button>
            <button
              onClick={() => setFilterType('lab')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'lab'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              {pt ? 'Biomarcadores' : 'Labs'}
            </button>
            <button
              onClick={() => setFilterType('clinical_evolution')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === 'clinical_evolution'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {pt ? 'Evoluções' : 'Evolutions'} ({summaryCounts.evolutions})
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={pt ? 'Buscar no histórico...' : 'Search timeline...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors"
              title={pt ? 'Inverter ordem cronológica' : 'Toggle chronological order'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? (pt ? 'Mais Recente' : 'Newest') : (pt ? 'Mais Antigo' : 'Oldest')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Overlay to Add Doctor's Clinical Evolution */}
      {isEvolutionModalOpen && (
        <div className="px-6 animate-fade-in">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-amber-700" />
                <h4 className="font-black text-amber-950 text-sm">
                  {pt ? 'Nova Evolução Clínica Médica (PEP SUS)' : 'New Clinical Progress Note (EHR)'}
                </h4>
              </div>
              <button
                onClick={() => setIsEvolutionModalOpen(false)}
                className="text-amber-700 hover:text-amber-950 font-bold text-xs"
              >
                ✕ {pt ? 'Fechar' : 'Close'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {(['Evolução Médica', 'Intercorrência Clínica', 'Ajuste de Conduta', 'Alta Programada'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setEvolutionCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      evolutionCategory === cat
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/60'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            <textarea
              rows={3}
              value={evolutionNote}
              onChange={(e) => setEvolutionNote(e.target.value)}
              placeholder={
                pt
                  ? 'Ex: Paciente admitido em UTI respiratória. Gasometria com PaO2/FiO2 145. Iniciada ventilação não invasiva e ajuste de parâmetros de O2...'
                  : 'e.g. Patient admitted to ICU. Blood gas PaO2/FiO2 145. Initiated high-flow nasal cannula with strict SpO2 monitoring...'
              }
              className="w-full p-3 rounded-xl border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEvolutionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-amber-100/50"
              >
                {pt ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveEvolution}
                disabled={!evolutionNote.trim()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs shadow-sm transition-all"
              >
                {pt ? 'Registrar no Prontuário' : 'Save to Timeline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Feed Body */}
      <div className="px-6 pb-6">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-bold text-sm text-slate-700">
              {pt ? 'Nenhum evento clínico localizado' : 'No clinical events found'}
            </p>
            <p className="text-xs">
              {pt
                ? 'Tente ajustar os filtros ou registrar uma nova evolução médica para este paciente.'
                : 'Try adjusting filters or adding a new clinical note for this patient.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {filteredEvents.map((event, idx) => {
              const badge = getEventBadge(event.type, event.urgencyLevel);
              const Icon = badge.icon;
              const isExpanded = !!expandedEvents[event.id];

              return (
                <div key={event.id} className="relative group animate-fade-in">
                  {/* Timeline Node Icon Indicator */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 ${
                      event.urgencyLevel === 'critical'
                        ? 'bg-rose-600 ring-4 ring-rose-100 animate-pulse'
                        : event.urgencyLevel === 'high'
                        ? 'bg-amber-500 ring-2 ring-amber-100'
                        : event.type === 'admission'
                        ? 'bg-indigo-600 ring-2 ring-indigo-100'
                        : event.type === 'diagnostic'
                        ? 'bg-cyan-600 ring-2 ring-cyan-100'
                        : event.type === 'lab'
                        ? 'bg-purple-600 ring-2 ring-purple-100'
                        : 'bg-emerald-600 ring-2 ring-emerald-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Timeline Card */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      event.urgencyLevel === 'critical'
                        ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                        : event.type === 'admission'
                        ? 'bg-indigo-50/30 border-indigo-200 shadow-2xs'
                        : event.type === 'diagnostic'
                        ? 'bg-cyan-50/30 border-cyan-200 shadow-2xs'
                        : event.type === 'clinical_evolution'
                        ? 'bg-amber-50/30 border-amber-200 shadow-2xs'
                        : 'bg-white border-slate-200 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Header line of card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>

                        {event.triageColor && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              event.triageColor === 'red'
                                ? 'bg-rose-600 text-white'
                                : event.triageColor === 'orange'
                                ? 'bg-amber-500 text-white'
                                : event.triageColor === 'yellow'
                                ? 'bg-yellow-400 text-slate-900'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {event.triageColor}
                          </span>
                        )}

                        <span className="text-xs font-black text-slate-900">
                          {event.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.dateLabel}</span>
                        <span>•</span>
                        <span>{event.timeLabel}</span>
                      </div>
                    </div>

                    {/* Subtitle / context */}
                    {event.subtitle && (
                      <div className="text-xs font-semibold text-slate-600 mt-2">
                        {event.subtitle}
                      </div>
                    )}

                    {/* Vitals Bar if Present */}
                    {event.vitals && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        {event.vitals.spo2 !== undefined && (
                          <div className="flex items-center justify-between px-2">
                            <span className="text-slate-500 font-bold">SpO2:</span>
                            <span
                              className={`font-black ${
                                event.vitals.spo2 < 92 ? 'text-rose-600' : 'text-slate-900'
                              }`}
                            >
                              {event.vitals.spo2}%
                            </span>
                          </div>
                        )}
                        {event.vitals.temperature !== undefined && (
                          <div className="flex items-center justify-between px-2">
                            <span className="text-slate-500 font-bold">Temp:</span>
                            <span
                              className={`font-black ${
                                event.vitals.temperature >= 38 ? 'text-amber-600' : 'text-slate-900'
                              }`}
                            >
                              {event.vitals.temperature}°C
                            </span>
                          </div>
                        )}
                        {event.vitals.heartRate !== undefined && (
                          <div className="flex items-center justify-between px-2">
                            <span className="text-slate-500 font-bold">FC:</span>
                            <span className="font-black text-slate-900">
                              {event.vitals.heartRate} bpm
                            </span>
                          </div>
                        )}
                        {event.vitals.bloodPressure && (
                          <div className="flex items-center justify-between px-2">
                            <span className="text-slate-500 font-bold">PA:</span>
                            <span className="font-black text-slate-900">
                              {event.vitals.bloodPressure}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main Description */}
                    <p className="text-xs text-slate-700 leading-relaxed mt-2.5">
                      {event.details.description}
                    </p>

                    {/* Lab Biomarker Grid if this is a lab event */}
                    {event.details.labs && (
                      <div className="mt-3 p-3 rounded-xl bg-purple-50/60 border border-purple-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {Object.entries(event.details.labs).map(([key, val]) => (
                          <div key={key} className="bg-white p-2 rounded-lg border border-purple-100 shadow-2xs">
                            <div className="text-[10px] font-bold text-purple-700 truncate">{key}</div>
                            <div className="font-black text-slate-900 mt-0.5">{String(val)}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Findings list if present (CXR, TC, Triagem) */}
                    {event.details.findings && event.details.findings.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {pt ? 'Achados & Sintomas Registrados:' : 'Recorded Findings & Symptoms:'}
                        </div>
                        <div className="space-y-1 text-xs">
                          {event.details.findings.slice(0, isExpanded ? undefined : 2).map((finding, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-1.5 text-slate-700">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable Extra Details / CT / DICOM button */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {event.details.doctorOrTechnician && (
                          <span className="text-[11px] font-mono text-slate-500">
                            👨‍⚕️ {event.details.doctorOrTechnician}
                          </span>
                        )}
                        {event.details.locationRoom && (
                          <span className="text-[11px] font-mono text-slate-500">
                            📍 {event.details.locationRoom}
                          </span>
                        )}
                        {event.details.aihAmount && (
                          <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            SUS AIH: R$ {event.details.aihAmount.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {event.type === 'diagnostic' && onOpenMultiModalCenter && (
                          <button
                            onClick={onOpenMultiModalCenter}
                            className="flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200 transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{pt ? 'Abrir DICOM / Segmentação' : 'Open DICOM'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {((event.details.findings && event.details.findings.length > 2) ||
                          (event.details.tags && event.details.tags.length > 0)) && (
                          <button
                            onClick={() => toggleExpand(event.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <span>{isExpanded ? (pt ? 'Menos detalhes' : 'Less') : (pt ? 'Mais detalhes' : 'More')}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Extended Tags on Expansion */}
                    {isExpanded && event.details.tags && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                        {event.details.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
