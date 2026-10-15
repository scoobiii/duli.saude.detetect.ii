import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Volume2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Printer,
  Sparkles,
  Phone,
  CreditCard,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppLanguage } from '../../types';
import { HospitalAdmissionRecord, saveAdmissionToFirestore } from '../../services/firestoreSync';

interface RecepcionistaDashboardProps {
  admissions: HospitalAdmissionRecord[];
  onAddAdmission: (admission: HospitalAdmissionRecord) => void;
  onUpdateAdmissionStage: (id: string, stage: HospitalAdmissionRecord['stage']) => void;
  language: AppLanguage;
}

export const RecepcionistaDashboard: React.FC<RecepcionistaDashboardProps> = ({
  admissions,
  onAddAdmission,
  onUpdateAdmissionStage,
  language,
}) => {
  const { profile } = useAuth();
  const pt = language === 'pt';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  // Form State for New Admission
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [susCard, setSusCard] = useState('');
  const [priority, setPriority] = useState<HospitalAdmissionRecord['priority']>('yellow');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [assignedRoom, setAssignedRoom] = useState('Triagem Manchester 01');

  // Speech synthesizer for calling patient to room
  const handleCallPatient = (patient: HospitalAdmissionRecord) => {
    try {
      const speech = new SpeechSynthesisUtterance();
      speech.lang = pt ? 'pt-BR' : 'en-US';
      speech.text = pt
        ? `Atenção paciente: ${patient.patientName}. Favor dirigir-se à ${patient.assignedRoom || 'sala de triagem'}.`
        : `Attention patient: ${patient.patientName}. Please proceed to ${patient.assignedRoom || 'triage room'}.`;
      speech.rate = 0.95;
      window.speechSynthesis.speak(speech);
    } catch {
      // Audio fallback
    }
  };

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newAdm: HospitalAdmissionRecord = {
      id: `adm-${Date.now().toString().slice(-5)}`,
      patientName: patientName.trim(),
      susCard: susCard.trim() || '898.0000.0000.0000',
      stage: 'triage',
      priority,
      chiefComplaint: chiefComplaint.trim() || 'Sintomas respiratórios e febre',
      assignedRoom,
      admittedAt: new Date().toISOString(),
      aihBilledAmount: priority === 'red' ? 6800 : priority === 'orange' ? 2400 : 450,
    };

    onAddAdmission(newAdm);
    await saveAdmissionToFirestore(newAdm);

    // Reset and close
    setPatientName('');
    setSusCard('');
    setChiefComplaint('');
    setIsFormOpen(false);
  };

  const filteredAdmissions = admissions.filter((adm) => {
    const matchesSearch =
      adm.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (adm.susCard && adm.susCard.includes(searchTerm));
    const matchesStage = filterStage === 'all' || adm.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const waitingInReception = admissions.filter((a) => a.stage === 'reception').length;
  const inTriage = admissions.filter((a) => a.stage === 'triage').length;
  const inExams = admissions.filter((a) => a.stage === 'exams').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Receptionist Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-blue-100 border border-white/20 shadow-inner">
              <Building className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-400/20 text-blue-200 border border-blue-300/30">
                  {pt ? 'RECEPÇÃO CENTRAL & ACOLHIMENTO SUS' : 'CENTRAL RECEPTION & ADMISSIONS'}
                </span>
                <span className="text-xs font-mono text-blue-200">
                  Operador: {profile.name}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {pt ? 'Gestão de Fila e Admissões' : 'Queue & Admission Management'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                {pt
                  ? 'Abertura de ficha, validação de Cartão SUS, chamada por voz no painel eletrônico e encaminhamento Manchester.'
                  : 'Ticket creation, SUS card validation, voice queue calling, and Manchester protocol forwarding.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4 text-blue-700" />
            <span>{pt ? 'Nova Ficha de Admissão (+)' : 'New Patient Ticket (+)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aguardando Recepção</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{waitingInReception}</div>
          </div>
          <Clock className="w-8 h-8 text-blue-400/50" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Triagem Manchester</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{inTriage}</div>
          </div>
          <Users className="w-8 h-8 text-amber-400/50" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Salas de Exame</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{inExams}</div>
          </div>
          <Building className="w-8 h-8 text-indigo-400/50" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Atendidos Hoje</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{admissions.length}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={pt ? 'Buscar paciente por nome ou número Cartão SUS...' : 'Search patient by name or SUS card...'}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: pt ? 'Todos' : 'All' },
            { id: 'reception', label: pt ? 'Recepção' : 'Reception' },
            { id: 'triage', label: pt ? 'Triagem' : 'Triage' },
            { id: 'exams', label: pt ? 'Exames' : 'Exams' },
            { id: 'icu', label: pt ? 'UTI' : 'ICU' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStage(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStage === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Admissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-base">
            {pt ? 'Painel de Fila & Chamada no Totem' : 'Queue Board & Electronic Totem Call'}
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {filteredAdmissions.length} pacientes na listagem
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3 px-4">Cartão SUS</th>
                <th className="py-3 px-4">Queixa / Sintoma</th>
                <th className="py-3 px-4">Etapa Atual</th>
                <th className="py-3 px-4">Sala Destino</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.map((adm) => {
                const isRed = adm.priority === 'red';
                const isOrange = adm.priority === 'orange';
                const isYellow = adm.priority === 'yellow';

                return (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                          isRed
                            ? 'bg-rose-100 text-rose-800'
                            : isOrange
                            ? 'bg-amber-100 text-amber-800'
                            : isYellow
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isRed ? 'bg-rose-600 animate-ping' : isOrange ? 'bg-amber-600' : 'bg-yellow-500'
                          }`}
                        />
                        <span>{adm.priority}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {adm.patientName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {adm.susCard || '898.0000.0000.0000'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {adm.chiefComplaint}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {adm.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {adm.assignedRoom || 'Recepção'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleCallPatient(adm)}
                          title="Chamar paciente por voz no sistema de som"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Chamar</span>
                        </button>

                        <button
                          onClick={() =>
                            onUpdateAdmissionStage(
                              adm.id,
                              adm.stage === 'reception'
                                ? 'triage'
                                : adm.stage === 'triage'
                                ? 'exams'
                                : 'doctor_consult'
                            )
                          }
                          title="Avançar paciente para próxima sala"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                        >
                          <span>Avançar</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Admission Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>{pt ? 'Nova Ficha de Admissão SUS' : 'New Admission Ticket'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmission} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo do Paciente *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Ex: João da Silva Santos"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Número do Cartão SUS</label>
                <input
                  type="text"
                  value={susCard}
                  onChange={(e) => setSusCard(e.target.value)}
                  placeholder="Ex: 898.0001.4421.0019"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridade Inicial</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  >
                    <option value="green">Verde (Pouco Urgente)</option>
                    <option value="yellow">Amarelo (Urgente)</option>
                    <option value="orange">Laranja (Muito Urgente)</option>
                    <option value="red">Vermelho (Emergência Imediata)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direcionar para Sala</label>
                  <select
                    value={assignedRoom}
                    onChange={(e) => setAssignedRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Triagem Manchester 01">Triagem Manchester 01</option>
                    <option value="Triagem Manchester 02">Triagem Manchester 02</option>
                    <option value="Consultório Médico 01">Consultório Médico 01</option>
                    <option value="Emergência / Reanimação">Emergência / Reanimação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Queixa Principal / Motivo da Vinda</label>
                <textarea
                  rows={3}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Ex: Febre alta há 3 dias acompanhada de tosse seca e dor de garganta..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-md transition-all active:scale-95"
                >
                  Confirmar Admissão & Imprimir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
