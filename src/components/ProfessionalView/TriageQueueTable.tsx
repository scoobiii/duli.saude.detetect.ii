import React, { useState } from 'react';
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Clock,
  Ambulance,
  Home,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  Bot,
} from 'lucide-react';
import { PatientTriage, TriageColor, AppLanguage } from '../../types';

interface TriageQueueProps {
  triages: PatientTriage[];
  language: AppLanguage;
  onUpdateStatus: (id: string, status: PatientTriage['status']) => void;
}

export const TriageQueueTable: React.FC<TriageQueueProps> = ({
  triages,
  language,
  onUpdateStatus,
}) => {
  const pt = language === 'pt';

  const [search, setSearch] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientTriage | null>(null);

  const filteredTriages = triages.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      (item.susCardNumber && item.susCardNumber.includes(search));

    const matchesColor = colorFilter === 'all' || item.triageColor === colorFilter;

    return matchesSearch && matchesColor;
  });

  const getBadge = (color: TriageColor) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          label: pt ? 'Vermelho (Emergência)' : 'Red (Emergency)',
        };
      case 'orange':
        return {
          bg: 'bg-orange-100 text-orange-800 border-orange-300',
          dot: 'bg-orange-500',
          label: pt ? 'Laranja (Muito Urgente)' : 'Orange (High Urgent)',
        };
      case 'yellow':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: pt ? 'Amarelo (Urgente)' : 'Yellow (Urgent)',
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          label: pt ? 'Verde (Pouco Urgente)' : 'Green (Standard)',
        };
    }
  };

  const getStatusLabel = (status: PatientTriage['status']) => {
    switch (status) {
      case 'referred_upa':
        return { label: pt ? 'Encaminhado UPA' : 'Referred to ER', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'in_observation':
        return { label: pt ? 'Em Observação' : 'Under Observation', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'pending_visit':
        return { label: pt ? 'Pendente Visita ACS' : 'Pending ACS Visit', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'home_recovery':
        return { label: pt ? 'Isolamento Domiciliar' : 'Home Quarantine', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      default:
        return { label: pt ? 'Concluído' : 'Resolved', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Table Header & Filters */}
      <div className="p-5 sm:p-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {pt ? 'Fila de Triagem & Casos Comunitários (Manchester / SUS)' : 'Triage Queue & Community Cases'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {pt
                ? `${filteredTriages.length} pacientes monitorados nas microáreas de atendimento primário.`
                : `${filteredTriages.length} patients monitored in local primary care sectors.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={pt ? 'Buscar por nome, bairro ou SUS...' : 'Search name, sector or ID...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
              />
            </div>

            {/* Color Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setColorFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  colorFilter === 'all' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                {pt ? 'Todos' : 'All'}
              </button>
              <button
                onClick={() => setColorFilter('red')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'red' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'
                }`}
                title="Vermelho"
              >
                🔴
              </button>
              <button
                onClick={() => setColorFilter('orange')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'orange' ? 'bg-orange-500 text-white font-bold' : 'text-slate-600'
                }`}
                title="Laranja"
              >
                🟠
              </button>
              <button
                onClick={() => setColorFilter('yellow')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'yellow' ? 'bg-amber-400 text-slate-900 font-bold' : 'text-slate-600'
                }`}
                title="Amarelo"
              >
                🟡
              </button>
              <button
                onClick={() => setColorFilter('green')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  colorFilter === 'green' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
                }`}
                title="Verde"
              >
                🟢
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">{pt ? 'Classificação' : 'Classification'}</th>
              <th className="py-3.5 px-4">{pt ? 'Paciente / Bairro' : 'Patient / Sector'}</th>
              <th className="py-3.5 px-4">{pt ? 'Sintomas & Sinais Vitais' : 'Symptoms & Vitals'}</th>
              <th className="py-3.5 px-4">{pt ? 'Status de Atendimento' : 'Care Status'}</th>
              <th className="py-3.5 px-4 text-right">{pt ? 'Ações' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredTriages.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                  {pt ? 'Nenhum paciente encontrado com esses filtros.' : 'No patients match these filters.'}
                </td>
              </tr>
            ) : (
              filteredTriages.map((patient) => {
                const badge = getBadge(patient.triageColor);
                const statusMeta = getStatusLabel(patient.status);

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Badge / Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {patient.score} pts
                        </span>
                      </div>
                    </td>

                    {/* Patient / Neighborhood */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>
                          {patient.age} {pt ? 'anos' : 'y'} • {patient.gender}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{patient.neighborhood}</span>
                      </div>
                    </td>

                    {/* Symptoms & Vitals */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {patient.symptoms.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                        {patient.symptoms.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            +{patient.symptoms.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        {patient.vitals.spo2 && (
                          <span className={patient.vitals.spo2 < 94 ? 'text-rose-600 font-bold' : ''}>
                            SpO2: {patient.vitals.spo2}%
                          </span>
                        )}
                        {patient.vitals.temperature && (
                          <span>Tax: {patient.vitals.temperature}°C</span>
                        )}
                      </div>
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={patient.status}
                        onChange={(e) => onUpdateStatus(patient.id, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${statusMeta.color}`}
                      >
                        <option value="pending_visit">{pt ? 'Pendente Visita ACS' : 'Pending ACS Visit'}</option>
                        <option value="in_observation">{pt ? 'Em Observação' : 'Under Observation'}</option>
                        <option value="referred_upa">{pt ? 'Encaminhado UPA' : 'Referred to ER'}</option>
                        <option value="home_recovery">{pt ? 'Isolamento Domiciliar' : 'Home Quarantine'}</option>
                        <option value="resolved">{pt ? 'Concluído' : 'Resolved'}</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          title={pt ? 'Ver Prontuário Completo' : 'View Full Details'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {patient.phone && (
                          <a
                            href={`https://wa.me/55${patient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${patient.name}, aqui é da equipe de Saúde da Família (DULI). Como você está se sentindo hoje?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title={pt ? 'Contatar via WhatsApp' : 'Contact via WhatsApp'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${
                    getBadge(selectedPatient.triageColor).dot
                  }`}
                >
                  {selectedPatient.score}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-500">
                    ID: {selectedPatient.id} • {selectedPatient.neighborhood}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 text-sm">{selectedPatient.summary}</div>
              <div className="text-slate-600 leading-relaxed">{selectedPatient.clinicalRationale}</div>
            </div>

            {/* Vitals Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {pt ? 'Sinais Vitais & Telemetria' : 'Vital Signs & Telemetry'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">SpO2</span>
                  <span className="font-bold text-slate-900">{selectedPatient.vitals.spo2 ?? 'N/A'}%</span>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Temperatura</span>
                  <span className="font-bold text-slate-900">{selectedPatient.vitals.temperature ?? 'N/A'}°C</span>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Freq. Cardíaca</span>
                  <span className="font-bold text-slate-900">{selectedPatient.vitals.heartRate ?? 'N/A'} bpm</span>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Freq. Resp.</span>
                  <span className="font-bold text-slate-900">{selectedPatient.vitals.respiratoryRate ?? 'N/A'} rpm</span>
                </div>
              </div>
            </div>

            {/* Red flags */}
            {selectedPatient.redFlags.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pt ? 'Sinais de Alerta Identificados' : 'Red Flags'}</span>
                </h4>
                <ul className="text-xs text-rose-800 list-disc list-inside space-y-1">
                  {selectedPatient.redFlags.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                {pt ? 'Fechar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
