import React, { useState } from 'react';
import {
  User,
  Heart,
  FileText,
  Activity,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Pill,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PatientTriage, AppLanguage } from '../../types';
import { HospitalAdmissionRecord } from '../../services/firestoreSync';

interface ClienteDashboardProps {
  triages: PatientTriage[];
  admissions: HospitalAdmissionRecord[];
  language: AppLanguage;
  onOpenNewTriage: () => void;
  onViewDiagnosticCenter: () => void;
}

export const ClienteDashboard: React.FC<ClienteDashboardProps> = ({
  triages,
  admissions,
  language,
  onOpenNewTriage,
  onViewDiagnosticCenter,
}) => {
  const { profile, isFirebaseAuthenticated } = useAuth();
  const pt = language === 'pt';

  const [activeTab, setActiveTab] = useState<'triages' | 'exams' | 'guidelines' | 'prescriptions'>('triages');

  // Filter triages belonging to this patient or show all recent for family demo
  const myTriages = triages.slice(0, 5);
  const myAdmission = admissions.find((a) => a.patientUid === profile.uid || a.patientName.includes('Arnaldo') || a.patientName.includes('Santos')) || admissions[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Welcome Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-teal-100 border border-white/20 shadow-inner">
              <User className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  {pt ? 'PORTAL DO PACIENTE & CIDADÃO' : 'PATIENT & CITIZEN PORTAL'}
                </span>
                {isFirebaseAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Nuvem Firebase Conectada</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{profile.name}</h2>
              <p className="text-teal-100 text-xs sm:text-sm mt-0.5">
                Cartão SUS: <span className="font-mono font-bold">{profile.susCardNumber || '898.0001.4421.0019'}</span> • Telefone: {profile.phone || '(11) 98765-4321'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTriage}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-teal-700" />
              <span>{pt ? 'Realizar Nova Auto-Triagem' : 'New Self-Triage'}</span>
            </button>
            <button
              onClick={onViewDiagnosticCenter}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-teal-600/60 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm border border-teal-400/30 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>{pt ? 'Ver Exames (RX/TC/ECG)' : 'View Exams'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Navigation Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'triages', label: pt ? 'Minhas Avaliações Clínicas' : 'My Clinical Triages', icon: Activity },
          { id: 'exams', label: pt ? 'Laudos & Exames Multimodais' : 'Exams & Reports', icon: FileText },
          { id: 'guidelines', label: pt ? 'Orientações & Isolamento' : 'Guidelines & Isolation', icon: ShieldCheck },
          { id: 'prescriptions', label: pt ? 'Prescrições & Medicamentos' : 'Prescriptions', icon: Pill },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Triages History */}
      {activeTab === 'triages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTriages.map((triage) => {
            const isRed = triage.triageColor === 'red';
            const isOrange = triage.triageColor === 'orange';
            const isYellow = triage.triageColor === 'yellow';

            return (
              <div
                key={triage.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        isRed
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isOrange
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : isYellow
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRed
                            ? 'bg-rose-600 animate-ping'
                            : isOrange
                            ? 'bg-amber-600'
                            : isYellow
                            ? 'bg-yellow-500'
                            : 'bg-emerald-600'
                        }`}
                      />
                      <span>{triage.triageColor.toUpperCase()} • PROTOCOLO MANCHESTER</span>
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(triage.timestamp).toLocaleDateString(pt ? 'pt-BR' : 'en-US')}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base mb-1">{triage.summary}</h3>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {triage.simpleGuidanceForFamily || triage.clinicalRationale}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-3 space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">SpO2 (Oxigênio):</span>
                      <span className="font-bold text-slate-900">{triage.vitals?.spo2 ? `${triage.vitals.spo2}%` : 'Não aferido'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Temperatura:</span>
                      <span className="font-bold text-slate-900">{triage.vitals?.temperature ? `${triage.vitals.temperature}°C` : 'Normal'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sintomas:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{triage.symptoms?.join(', ') || 'Nenhum'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Avaliado por: {triage.evaluatedByEngine === 'gemini-3.8-flash' ? 'Gemini IA' : 'Agente Local'}
                  </span>
                  <span className="font-bold text-teal-700 flex items-center gap-1">
                    <span>{triage.status === 'resolved' ? 'Concluído' : 'Em Acompanhamento'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Multimodal Exams for Patient */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {pt ? 'Resultados de Diagnóstico por Imagem e Laboratório' : 'Imaging and Lab Results'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt ? 'Estudos DICOM analisados pela IA e validados pelo médico responsável' : 'DICOM studies analyzed by AI and validated by physician'}
              </p>
            </div>
            <button
              onClick={onViewDiagnosticCenter}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition-colors"
            >
              <span>Abrir Visualizador Radiológico Completo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">RAIO-X DE TÓRAX (CXR)</span>
              <h4 className="font-bold text-slate-900 text-sm">Radiografia Digital de Tórax PA</h4>
              <p className="text-xs text-slate-600">
                Opacidades periféricas basais bilaterais. Índice de acometimento estimado: 25-35%.
              </p>
              <div className="pt-2 flex justify-between text-xs text-slate-500">
                <span>Status: <strong>Laudado</strong></span>
                <span className="text-teal-700 font-bold">Confiança IA: 97.4%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-800">TOMOGRAFIA (HRCT)</span>
              <h4 className="font-bold text-slate-900 text-sm">TC de Tórax em Alta Resolução</h4>
              <p className="text-xs text-slate-600">
                Atenuação em vidro fosco multifocal predominantemente subpleural. Padrão CORADS 5.
              </p>
              <div className="pt-2 flex justify-between text-xs text-slate-500">
                <span>Status: <strong>Disponível</strong></span>
                <span className="text-teal-700 font-bold">12 Cortes Axiais</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">LABORATÓRIO / SANGUE</span>
              <h4 className="font-bold text-slate-900 text-sm">Painel Inflamatório & PCR</h4>
              <p className="text-xs text-slate-600">
                PCR: 74.2 mg/L (Elevado) • Dímero-D: 1.680 ng/mL • Ferritina: 890 ng/mL • RT-PCR: Positivo.
              </p>
              <div className="pt-2 flex justify-between text-xs text-slate-500">
                <span>Status: <strong>Assinado</strong></span>
                <span className="text-teal-700 font-bold">Bioquímica SUS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Isolation Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Protocolo de Isolamento Domiciliar (7 a 10 dias)</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Mantenha-se em quarto individual bem ventilado. Higienize as mãos com frequência e utilize máscara cirúrgica ou PFF2 ao sair do cômodo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h5 className="font-bold text-slate-900 text-xs uppercase mb-2">Sinais de Alarme (Procurar UPA / SAMU 192)</h5>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Sensação de falta de ar (*dispneia*) ou cansaço aos mínimos esforços</li>
                <li>Saturação de oxigênio (SpO2) no oxímetro abaixo de 94%</li>
                <li>Dor persistente ou aperto no peito</li>
                <li>Lábios ou extremidades arroxeadas (*cianose*)</li>
                <li>Confusão mental, sonolência excessiva ou desmaio</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h5 className="font-bold text-slate-900 text-xs uppercase mb-2">Cuidados Diários em Casa</h5>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Ingestão abundante de líquidos (água, sucos naturais e soro caseiro)</li>
                <li>Repouso absoluto e alimentação balanceada rica em nutrientes</li>
                <li>Medição de temperatura e oxímetro a cada 6 horas</li>
                <li>Separação de talheres, pratos e toalhas de uso individual</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-lg font-black text-slate-900">
            {pt ? 'Receituário & Prescrição Médica Digital' : 'Digital Medical Prescriptions'}
          </h3>
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <span className="font-bold text-slate-900 text-sm">Receita Médica SUS #2026-9041</span>
                <p className="text-xs text-slate-500">Emitido por: Dra. Beatriz Albuquerque (CRM-SP 142.890)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Ativo / Em uso
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900">Dipirona Monoidratada 500mg</strong>
                  <p className="text-slate-500">1 comprimido por via oral a cada 6 horas se febre &gt; 37.8°C ou dor de cabeça</p>
                </div>
                <span className="text-slate-500 font-mono">Uso sintomático</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900">Xarope Mucolítico / Acebrofilina</strong>
                  <p className="text-slate-500">10 ml por via oral de 12 em 12 horas durante 5 dias</p>
                </div>
                <span className="text-slate-500 font-mono">5 dias</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900">Soro Fisiológico 0.9% Nasal</strong>
                  <p className="text-slate-500">Instilar 2 a 3 jatos em cada narina de 4 a 6 vezes ao dia</p>
                </div>
                <span className="text-slate-500 font-mono">Contínuo</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
