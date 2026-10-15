import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  FileText,
  Activity,
  Layers,
  HeartPulse,
  Pill,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Building,
  Clock,
  Calendar,
  Microscope,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientTriage, AppLanguage, AIEngineMode } from '../../types';
import { HospitalAdmissionRecord } from '../../services/firestoreSync';
import { INITIAL_TRIAGES } from '../../data/mockCommunityData';
import { PatientHealthTimeline } from './PatientHealthTimeline';

interface MedicoDashboardProps {
  triages: PatientTriage[];
  admissions: HospitalAdmissionRecord[];
  onUpdateTriageStatus: (id: string, status: PatientTriage['status']) => void;
  onUpdateAdmissionStage: (id: string, stage: HospitalAdmissionRecord['stage']) => void;
  onOpenMultiModalCenter: () => void;
  engineMode: AIEngineMode;
  language: AppLanguage;
}

export const MedicoDashboard: React.FC<MedicoDashboardProps> = ({
  triages,
  admissions,
  onUpdateTriageStatus,
  onUpdateAdmissionStage,
  onOpenMultiModalCenter,
  engineMode,
  language,
}) => {
  const { profile } = useAuth();
  const pt = language === 'pt';

  const safeTriages = triages && triages.length > 0 ? triages : INITIAL_TRIAGES;
  const [selectedTriageId, setSelectedTriageId] = useState<string>(safeTriages[0]?.id || 'DULI-094812');
  const [activePepTab, setActivePepTab] = useState<'timeline' | 'consultation' | 'diagnostics'>('timeline');
  const [searchPatientTerm, setSearchPatientTerm] = useState('');

  const selectedTriage = useMemo(() => {
    return safeTriages.find((t) => t.id === selectedTriageId) || safeTriages[0] || INITIAL_TRIAGES[0];
  }, [safeTriages, selectedTriageId]);

  const [clinicalNote, setClinicalNote] = useState('');
  const [prescriptions, setPrescriptions] = useState<string[]>([
    'Dipirona 500mg VO 6/6h em caso de febre',
    'Azitromicina 500mg VO 1x/dia por 5 dias',
    'Oxigenoterapia sob cateter nasal 2 L/min se SpO2 < 94%',
  ]);
  const [newPrescriptionInput, setNewPrescriptionInput] = useState('');
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  const handleAddPrescription = () => {
    if (!newPrescriptionInput.trim()) return;
    setPrescriptions([...prescriptions, newPrescriptionInput.trim()]);
    setNewPrescriptionInput('');
  };

  const handleApplyClinicalDecision = (decision: 'alta' | 'enfermaria' | 'uti') => {
    if (!selectedTriage) return;
    if (decision === 'alta') {
      onUpdateTriageStatus(selectedTriage.id, 'resolved');
      setDecisionFeedback(pt ? '✅ Paciente liberado com alta médica, atestado emitido e orientações domiciliares.' : '✅ Patient discharged home with instructions.');
    } else if (decision === 'enfermaria') {
      onUpdateTriageStatus(selectedTriage.id, 'in_observation');
      setDecisionFeedback(pt ? '🏥 Encaminhado para leito de internação em enfermaria respiratória com suporte clínico.' : '🏥 Transferred to respiratory ward bed.');
    } else {
      onUpdateTriageStatus(selectedTriage.id, 'referred_upa');
      setDecisionFeedback(pt ? '🚨 Vaga solicitada com urgência em leito de Terapia Intensiva (UTI Respiratória).' : '🚨 Emergency ICU bed reservation requested.');
    }

    setTimeout(() => setDecisionFeedback(null), 4000);
  };

  const filteredQueue = useMemo(() => {
    if (!searchPatientTerm.trim()) return safeTriages;
    const term = searchPatientTerm.toLowerCase();
    return safeTriages.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term) ||
        (t.susCardNumber && t.susCardNumber.toLowerCase().includes(term)) ||
        t.neighborhood.toLowerCase().includes(term)
    );
  }, [safeTriages, searchPatientTerm]);

  const criticalQueue = safeTriages.filter((t) => t.triageColor === 'red' || t.triageColor === 'orange');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Clinical Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-200 border border-white/20 shadow-inner">
              <Stethoscope className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-300/30">
                  {pt ? 'PRONTUÁRIO ELETRÔNICO DO PACIENTE (PEP)' : 'ELECTRONIC HEALTH RECORD (EHR)'}
                </span>
                <span className="text-xs font-mono text-emerald-200">
                  {profile.crmOrCoren || 'CRM-SP 142.890'} • {profile.name}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {pt ? 'Consultório Médico & Decisão Clínica' : 'Clinical Evaluation & Decision Desk'}
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                {pt
                  ? 'Feed cronológico de triagens, internações e laudos diagnósticos, prescrição digital e conduta clínica.'
                  : 'Chronological feed of triages, admissions, and diagnostic reports, digital prescriptions, and clinical decisions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMultiModalCenter}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95"
            >
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>{pt ? 'Abrir Centro Radiológico RX/TC/ECG' : 'Open Multi-modal Center'}</span>
            </button>
          </div>
        </div>
      </div>

      {decisionFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm shadow-xs animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{decisionFeedback}</span>
        </div>
      )}

      {/* Main Grid: Patient Queue on Left, Full EHR / Timeline / Clinical Station on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triage Patients Queue (Manchester priority) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">
                {pt ? 'Fila de Chamada Médica' : 'Medical Call Queue'}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {criticalQueue.length} Emergências
              </span>
            </div>

            {/* Quick search input for patients */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPatientTerm}
                onChange={(e) => setSearchPatientTerm(e.target.value)}
                placeholder={pt ? 'Buscar paciente ou Cartão SUS...' : 'Search patient or SUS...'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredQueue.map((triage) => {
                const isSelected = selectedTriage?.id === triage.id;
                const isRed = triage.triageColor === 'red';
                const isOrange = triage.triageColor === 'orange';
                const isYellow = triage.triageColor === 'yellow';

                return (
                  <button
                    key={triage.id}
                    onClick={() => setSelectedTriageId(triage.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isRed
                            ? 'bg-rose-100 text-rose-800'
                            : isOrange
                            ? 'bg-amber-100 text-amber-800'
                            : isYellow
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {triage.triageColor}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {triage.neighborhood}
                      </span>
                    </div>

                    <div className="font-black text-slate-900 text-xs sm:text-sm">
                      {triage.name} ({triage.age} anos)
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      SpO2: <strong className="text-slate-800">{triage.vitals?.spo2 || 95}%</strong> • Temp: {triage.vitals?.temperature || 37.0}°C
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active PEP Prontuário Eletrônico & Timeline */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header of Active EHR Document */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  PRONTUÁRIO ELETRÔNICO #{selectedTriage.id}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedTriage.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Idade: {selectedTriage.age} anos • Sexo: {selectedTriage.gender} • Bairro: {selectedTriage.neighborhood} • Cartão SUS: {selectedTriage.susCardNumber || '898.0000.0000.0000'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                    selectedTriage.triageColor === 'red'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : selectedTriage.triageColor === 'orange'
                      ? 'bg-amber-500 text-white'
                      : 'bg-yellow-400 text-slate-900'
                  }`}
                >
                  {selectedTriage.triageColor} ({selectedTriage.triageLevel})
                </span>
              </div>
            </div>

            {/* Vitals & Bio-signals Quick Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">SpO2 (Oxímetro)</span>
                <div
                  className={`text-xl font-black mt-1 ${
                    (selectedTriage.vitals?.spo2 || 98) < 92 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {selectedTriage.vitals?.spo2 || 96}%
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Temperatura</span>
                <div
                  className={`text-xl font-black mt-1 ${
                    (selectedTriage.vitals?.temperature || 36.5) >= 38 ? 'text-amber-600' : 'text-slate-900'
                  }`}
                >
                  {selectedTriage.vitals?.temperature || 37.2}°C
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Frequência Cardíaca</span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {selectedTriage.vitals?.heartRate || 88} BPM
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Pressão Arterial</span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {selectedTriage.vitals?.systolicBP || 120}/{selectedTriage.vitals?.diastolicBP || 80}
                </div>
              </div>
            </div>

            {/* Nav Tabs: Timeline vs Consultation vs Diagnostics */}
            <div className="flex items-center gap-2 border-b border-slate-100 pt-1 pb-1">
              <button
                onClick={() => setActivePepTab('timeline')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
                  activePepTab === 'timeline'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{pt ? 'Linha do Tempo Clínica (Feed Vertical)' : 'Patient Health Timeline'}</span>
              </button>

              <button
                onClick={() => setActivePepTab('consultation')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
                  activePepTab === 'consultation'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>{pt ? 'Consulta & Prescrição' : 'Consultation & Prescriptions'}</span>
              </button>

              <button
                onClick={() => setActivePepTab('diagnostics')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
                  activePepTab === 'diagnostics'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{pt ? 'Laudos Radiológicos & Labs' : 'Imaging & Labs'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CHRONOLOGICAL VERTICAL HEALTH TIMELINE */}
          {activePepTab === 'timeline' && (
            <PatientHealthTimeline
              patient={selectedTriage}
              allTriages={safeTriages}
              allAdmissions={admissions}
              language={language}
              onOpenMultiModalCenter={onOpenMultiModalCenter}
            />
          )}

          {/* TAB 2: CONSULTATION & CLINICAL CONDUCT */}
          {activePepTab === 'consultation' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Quick Timeline Preview Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-950">
                    {pt
                      ? 'Histórico Longitudinal: Visualização de triagens anteriores, internações e laudos disponível.'
                      : 'Longitudinal Record: Past triages, admissions, and diagnostic results feed available.'}
                  </span>
                </div>
                <button
                  onClick={() => setActivePepTab('timeline')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-2xs"
                >
                  {pt ? 'Ver Feed Completo' : 'View Full Feed'}
                </button>
              </div>

              {/* Clinical Summary & Rationale */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase">
                  Síntese Clínica & Raciocínio Algorítmico ({selectedTriage.evaluatedByEngine})
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-mono">
                  {selectedTriage.clinicalRationale || selectedTriage.summary}
                </p>
              </div>

              {/* Digital Prescriptions Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Prescrição Médica Hospitalar (SUS)</span>
                </h4>

                <div className="space-y-2">
                  {prescriptions.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-800">{item}</span>
                      <button
                        onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 font-bold px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPrescriptionInput}
                    onChange={(e) => setNewPrescriptionInput(e.target.value)}
                    placeholder="Adicionar novo medicamento ou conduta..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleAddPrescription}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Conduct & Disposition Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Definição de Conduta & Destino do Paciente
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleApplyClinicalDecision('alta')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all font-bold text-xs"
                  >
                    <UserCheck className="w-5 h-5 mb-1 text-emerald-600" />
                    <span>Dar Alta Hospitalar</span>
                    <span className="text-[10px] text-emerald-600 font-normal">Tratamento domiciliar</span>
                  </button>

                  <button
                    onClick={() => handleApplyClinicalDecision('enfermaria')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all font-bold text-xs"
                  >
                    <Building className="w-5 h-5 mb-1 text-amber-600" />
                    <span>Internação em Enfermaria</span>
                    <span className="text-[10px] text-amber-600 font-normal">Observação e O2 estável</span>
                  </button>

                  <button
                    onClick={() => handleApplyClinicalDecision('uti')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all font-bold text-xs"
                  >
                    <AlertTriangle className="w-5 h-5 mb-1 text-rose-600" />
                    <span>Regular Leito de UTI</span>
                    <span className="text-[10px] text-rose-600 font-normal">Vaga crítica respiratória</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS & IMAGING */}
          {activePepTab === 'diagnostics' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Exames Radiológicos & Biomarcadores Vinculados ao PEP</span>
                </h4>
                <button
                  onClick={onOpenMultiModalCenter}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>Abrir Bounding Boxes e Cortes Tomográficos</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">CXR Digital</span>
                  <p className="font-bold text-slate-900 mt-1">Infiltrado Basal Bilateral</p>
                  <span className="text-[11px] text-slate-500">Brixia Score: 14/18 (Comprometimento Severo)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">TC de Tórax HRCT</span>
                  <p className="font-bold text-slate-900 mt-1">Vidro Fosco Multilobar</p>
                  <span className="text-[11px] text-slate-500">CORADS 5 • Acometimento &gt; 55%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">ECG 12D & Labs</span>
                  <p className="font-bold text-slate-900 mt-1">PCR: 74.2 mg/L • Dímero-D: 1680</p>
                  <span className="text-[11px] text-slate-500">Taquicardia Sinusal • Sem supra ST</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[11px]">Rastreabilidade & Validação Regulatória</span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                  Imagens processadas com calibração DICOM padrão ANVISA RDC 657/2022 (SaMD Classe II) e modelos validados sobre os bancos internacionais BIMCV-COVID19+ e COVID-QU-Ex.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
