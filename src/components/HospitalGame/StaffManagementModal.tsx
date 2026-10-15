import React, { useState } from 'react';
import {
  Users,
  X,
  UserPlus,
  BatteryCharging,
  Award,
  Zap,
  DollarSign,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { HospitalStaff, HospitalRoom } from '../../types/hospitalGame';
import { AppLanguage } from '../../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: HospitalStaff[];
  rooms: HospitalRoom[];
  budget: number;
  onReassignStaff: (staffId: string, roomId: string) => void;
  onRestStaff: (staffId: string) => void;
  onTrainStaff: (staffId: string) => void;
  onHireStaff: (role: HospitalStaff['role']) => void;
  language: AppLanguage;
}

export const StaffManagementModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staff,
  rooms,
  budget,
  onReassignStaff,
  onRestStaff,
  onTrainStaff,
  onHireStaff,
  language,
}) => {
  const pt = language === 'pt';
  const [selectedRoleToHire, setSelectedRoleToHire] = useState<HospitalStaff['role']>('physician');

  if (!isOpen) return null;

  const totalPayroll = staff.reduce((acc, s) => acc + s.salary, 0);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'surgeon': return pt ? 'Médico Cirurgião' : 'Surgeon';
      case 'physician': return pt ? 'Médico Intensivista' : 'Intensivist Physician';
      case 'radiologist': return pt ? 'Médico Radiologista' : 'Radiologist';
      case 'nurse': return pt ? 'Enfermeiro(a) Chefe' : 'Head Nurse';
      case 'triage_nurse': return pt ? 'Enf. de Triagem (Manchester)' : 'Triage Nurse';
      case 'biomedical': return pt ? 'Biomédico / Análises' : 'Biomedical Scientist';
      case 'acs_agent': return pt ? 'Agente de Saúde (ACS)' : 'Community Health Agent';
      case 'technician': return pt ? 'Engenharia Clínica / Téc.' : 'Clinical Technician';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {pt ? 'Gestão de RH & Corpo Clínico do Hospital' : 'Hospital Staff & Clinical HR Management'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt
                  ? `Folha de pagamento total: R$ ${totalPayroll.toLocaleString('pt-BR')}/dia • ${staff.length} profissionais contratados`
                  : `Total daily payroll: R$ ${totalPayroll.toLocaleString()}/day • ${staff.length} active professionals`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Hire Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {pt ? 'Contratar Novo Profissional de Saúde:' : 'Recruit New Healthcare Professional:'}
            </span>
            <span className="text-[11px] text-slate-500">
              {pt ? 'Custos de contratação deduzidos do orçamento do hospital' : 'Hiring fee deducted from hospital budget'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRoleToHire}
              onChange={(e) => setSelectedRoleToHire(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
            >
              <option value="physician">Médico Clínico/Intensivista (R$ 4.500)</option>
              <option value="surgeon">Cirurgião Geral (R$ 5.500)</option>
              <option value="radiologist">Médico Radiologista (R$ 4.000)</option>
              <option value="nurse">Enfermeiro UTI (R$ 2.500)</option>
              <option value="triage_nurse">Enf. Triagem Manchester (R$ 2.200)</option>
              <option value="biomedical">Biomédico PCR (R$ 2.800)</option>
              <option value="technician">Técnico em Manutenção (R$ 1.900)</option>
            </select>

            <button
              onClick={() => onHireStaff(selectedRoleToHire)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>{pt ? 'Contratar' : 'Hire'}</span>
            </button>
          </div>
        </div>

        {/* Staff Table / Cards */}
        <div className="space-y-3">
          {staff.map((member) => {
            const currentRoom = rooms.find((r) => r.id === member.assignedRoomId);

            return (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-slate-100 rounded-2xl">{member.avatarEmoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{member.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Nível {member.level}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      {getRoleLabel(member.role)}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Diária: R$ {member.salary}/dia • Eficiência: {member.efficiency}%
                    </div>
                  </div>
                </div>

                {/* Energy & Assignment Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Energy bar */}
                  <div className="w-28">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>Energia</span>
                      <span>{member.energy}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${member.energy}%` }}
                        className={`h-full rounded-full ${
                          member.energy < 30 ? 'bg-rose-500' : member.energy < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Room Assignment Select */}
                  <select
                    value={member.assignedRoomId || ''}
                    onChange={(e) => onReassignStaff(member.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-slate-50"
                  >
                    <option value="">(Em Descanso / Sala de Estar)</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>

                  {/* Actions: Rest or Train */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRestStaff(member.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors"
                      title={pt ? 'Mandar descansar para recuperar energia' : 'Rest staff'}
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      <span>{pt ? 'Descansar' : 'Rest'}</span>
                    </button>

                    <button
                      onClick={() => onTrainStaff(member.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                      title={pt ? 'Treinar profissional (+eficiência, R$ 1.500)' : 'Train staff'}
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{pt ? 'Treinar' : 'Train'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
