import React from 'react';
import {
  HospitalRoom,
  HospitalStaff,
  GamePatient,
} from '../../types/hospitalGame';
import {
  DoorOpen,
  Stethoscope,
  Scan,
  Layers,
  FlaskConical,
  Activity,
  Scissors,
  HeartPulse,
  Bed,
  Pill,
  Wind,
  Zap,
  Wrench,
  UserCheck,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { AppLanguage } from '../../types';

interface FloorMapProps {
  rooms: HospitalRoom[];
  staff: HospitalStaff[];
  patients: GamePatient[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onSelectPatient: (patientId: string) => void;
  onRepairRoom: (roomId: string) => void;
  language: AppLanguage;
}

export const HospitalFloorMap: React.FC<FloorMapProps> = ({
  rooms,
  staff,
  patients,
  selectedRoomId,
  onSelectRoom,
  onSelectPatient,
  onRepairRoom,
  language,
}) => {
  const pt = language === 'pt';

  const getIcon = (type: string) => {
    switch (type) {
      case 'reception': return DoorOpen;
      case 'triage': return Stethoscope;
      case 'imaging_cxr': return Scan;
      case 'imaging_ct': return Layers;
      case 'laboratory': return FlaskConical;
      case 'ecg_room': return Activity;
      case 'surgery': return Scissors;
      case 'icu': return HeartPulse;
      case 'ward': return Bed;
      case 'pharmacy': return Pill;
      case 'oxygen_plant': return Wind;
      case 'power_generator': return Zap;
      default: return DoorOpen;
    }
  };

  const getTriageColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-rose-500 border-rose-700 text-white';
      case 'orange': return 'bg-orange-500 border-orange-700 text-white';
      case 'yellow': return 'bg-amber-400 border-amber-600 text-slate-900';
      default: return 'bg-emerald-500 border-emerald-700 text-white';
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl space-y-4">
      {/* Top Map Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {pt ? 'Planta Baixa Interativa do Hospital (Fluxo Automatizado)' : 'Interactive Hospital Campus Floorplan'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {pt
              ? 'Acompanhe a movimentação em tempo real dos pacientes da triagem aos leitos de UTI.'
              : 'Live tracking of patient transitions from triage to surgery and ICU beds.'}
          </p>
        </div>

        {/* Live Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{pt ? 'Vermelho (Emergência)' : 'Red (Critical)'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>{pt ? 'Laranja' : 'Orange'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{pt ? 'Amarelo' : 'Yellow'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{pt ? 'Verde' : 'Green'}</span>
          </span>
        </div>
      </div>

      {/* Grid of Hospital Wings and Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const Icon = getIcon(room.type);
          const roomStaff = staff.filter((s) => s.assignedRoomId === room.id);
          const roomPatients = patients.filter((p) => p.currentRoomId === room.id);
          const isSelected = selectedRoomId === room.id;
          const isFull = room.capacity > 0 && roomPatients.length >= room.capacity;
          const isDamaged = room.equipmentCondition < 60;

          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                isSelected
                  ? 'border-cyan-400 bg-slate-800/90 ring-4 ring-cyan-500/20 shadow-xl scale-[1.01]'
                  : isDamaged
                  ? 'border-rose-500/80 bg-slate-900/90'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Room Top Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center border border-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                        {room.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        Nível {room.level} • {room.capacity > 0 ? `${roomPatients.length}/${room.capacity} Leitos` : 'Utilidade'}
                      </span>
                    </div>
                  </div>

                  {/* Room status badges */}
                  <div className="flex items-center gap-1">
                    {isDamaged && (
                      <span className="p-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse" title="Equipamento desgastado">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {isFull && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        LOTADO
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned Medical Staff in this Room */}
                <div className="flex items-center gap-1.5 my-2.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    {pt ? 'Equipe:' : 'Staff:'}
                  </span>
                  {roomStaff.length === 0 ? (
                    <span className="text-[10px] text-rose-400 italic">
                      {pt ? 'Sem profissional alocado' : 'No staff assigned'}
                    </span>
                  ) : (
                    roomStaff.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-200 border border-slate-700 font-medium"
                        title={`${s.name} (${s.role}) - Energia: ${s.energy}%`}
                      >
                        <span>{s.avatarEmoji}</span>
                        <span className="text-[10px] font-bold truncate max-w-[80px]">
                          {s?.name?.split(' ')?.[1] || s?.name || 'Staff'}
                        </span>
                      </span>
                    ))
                  )}
                </div>

                {/* Live Patients Avatars & Progress Inside Room */}
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 min-h-[52px] flex items-center flex-wrap gap-1.5">
                  {roomPatients.length === 0 ? (
                    <span className="text-[10px] text-slate-600 font-mono italic">
                      {pt ? 'Nenhum paciente no momento' : 'No patients currently'}
                    </span>
                  ) : (
                    roomPatients.map((p) => {
                      const badgeColor = getTriageColorClass(p.triageColor);
                      return (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(p.id);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold transition-all transform hover:scale-105 active:scale-95 shadow-sm ${badgeColor}`}
                          title={`${p.name} (${p.triageColor.toUpperCase()}) - Tratamento: ${p.treatmentProgress}% - Saúde: ${p.healthScore}%`}
                        >
                          <span className="text-[10px] font-mono">{p.name.split(' ')[0]}</span>
                          <span className="text-[9px] opacity-80 font-mono">
                            {p.treatmentProgress}%
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Room Bottom Telemetry (Equipment condition & quick repair) */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1">
                  <span>Equipamento:</span>
                  <span className={room.equipmentCondition < 70 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {room.equipmentCondition}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {room.equipmentCondition < 85 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRepairRoom(room.id);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-700 transition-colors"
                      title={pt ? 'Manutenção Preventiva (R$ 450)' : 'Repair Equipment (R$ 450)'}
                    >
                      <Wrench className="w-2.5 h-2.5" />
                      <span>{pt ? 'Reparar' : 'Repair'}</span>
                    </button>
                  )}
                  <span>{room.powerConsumptionKw} kW</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
