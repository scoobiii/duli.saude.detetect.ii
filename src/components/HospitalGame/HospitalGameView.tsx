import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  Users,
  Boxes,
  Wrench,
  DollarSign,
  Trophy,
  Ambulance,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import {
  HospitalGameState,
  HospitalRoom,
  HospitalStaff,
  SupplyItem,
  HospitalUtility,
  GamePatient,
  HospitalQuest,
  HospitalGameEvent,
} from '../../types/hospitalGame';
import {
  INITIAL_ROOMS,
  INITIAL_STAFF,
  INITIAL_SUPPLIES,
  INITIAL_UTILITIES,
  INITIAL_QUESTS,
  INITIAL_GAME_PATIENTS,
  INITIAL_GAME_STATE,
  processHospitalTick,
  generateRandomPatient,
} from '../../services/hospitalEngine';
import { soundEffects } from '../../services/soundEffects';
import { HospitalFloorMap } from './HospitalFloorMap';
import { StaffManagementModal } from './StaffManagementModal';
import { LogisticsSuppliesModal } from './LogisticsSuppliesModal';
import { UtilitiesFacilitiesModal } from './UtilitiesFacilitiesModal';
import { FinancialLedgerModal } from './FinancialLedgerModal';
import { HospitalQuestsModal } from './HospitalQuestsModal';
import { AppLanguage } from '../../types';

interface HospitalGameProps {
  language: AppLanguage;
  onOpenMultiModalCenter?: () => void;
  onOpenFullArchitecture?: () => void;
}

export const HospitalGameView: React.FC<HospitalGameProps> = ({
  language,
  onOpenMultiModalCenter,
  onOpenFullArchitecture,
}) => {
  const pt = language === 'pt';

  // Game Core States
  const [gameState, setGameState] = useState<HospitalGameState>(INITIAL_GAME_STATE);
  const [rooms, setRooms] = useState<HospitalRoom[]>(INITIAL_ROOMS);
  const [staff, setStaff] = useState<HospitalStaff[]>(INITIAL_STAFF);
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES);
  const [utilities, setUtilities] = useState<HospitalUtility[]>(INITIAL_UTILITIES);
  const [patients, setPatients] = useState<GamePatient[]>(INITIAL_GAME_PATIENTS);
  const [quests, setQuests] = useState<HospitalQuest[]>(INITIAL_QUESTS);

  // Inspector States
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('room_icu');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modals
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isSuppliesOpen, setIsSuppliesOpen] = useState(false);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);

  // Live event banner
  const [activeEvent, setActiveEvent] = useState<HospitalGameEvent | null>(null);
  const [liveLogs, setLiveLogs] = useState<string[]>([
    'Hospital das Clínicas DULI operacional: 12 leitos ativos.',
    'Equipe de Cirurgia e UTI a postos para admissões de emergência.',
  ]);

  // Tick simulation loop
  useEffect(() => {
    if (gameState.gameSpeed === 0) return; // Paused

    const intervalMs = gameState.gameSpeed === 1 ? 2400 : gameState.gameSpeed === 2 ? 1200 : 500;
    const interval = setInterval(() => {
      const result = processHospitalTick(
        gameState,
        patients,
        rooms,
        staff,
        supplies,
        utilities
      );

      setGameState(result.newGameState);
      setPatients(result.newPatients);
      setRooms(result.newRooms);
      setStaff(result.newStaff);
      setSupplies(result.newSupplies);
      setUtilities(result.newUtilities);

      if (result.newLogs.length > 0) {
        setLiveLogs((prev) => [...result.newLogs, ...prev].slice(0, 8));
      }

      // Audio triggers
      if (result.curedThisTick.length > 0) {
        soundEffects.playCashSound();
      }

      // Random emergency trigger check (approx every few days)
      if (Math.random() < 0.05 && !activeEvent) {
        soundEffects.playAmbulanceSiren();
        setActiveEvent({
          id: `evt-${Date.now()}`,
          title: pt ? 'SURTO COMUNITÁRIO NA VILA ESPERANÇA!' : 'OUTBREAK SURGE IN NEIGHBORHOOD!',
          description: pt
            ? 'Uma van do SAMU está trazendo 4 pacientes com sintomas graves de insuficiência respiratória aguda. O que fazer?'
            : '4 critical respiratory patients incoming via ambulance. Select immediate directive:',
          severity: 'high',
          type: 'outbreak_surge',
          options: [
            {
              label: pt ? 'Abrir Leitos de UTI Extras (R$ 8.000)' : 'Open Emergency Surge ICU (R$ 8,000)',
              cost: 8000,
              effectDescription: pt ? 'Aumenta reputação e capacidade' : 'Increases reputation and bed capacity',
              actionKey: 'open_icu',
            },
            {
              label: pt ? 'Triagem de Campanha Rápida' : 'Deploy Field Rapid Triage',
              cost: 1500,
              effectDescription: pt ? 'Estabiliza pacientes na triagem' : 'Stabilizes patients in triage',
              actionKey: 'rapid_triage',
            },
          ],
        });
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [gameState, patients, rooms, staff, supplies, utilities, activeEvent]);

  // Handlers
  const handleToggleSound = () => {
    const next = !gameState.soundEnabled;
    soundEffects.setEnabled(next);
    setGameState((prev) => ({ ...prev, soundEnabled: next }));
  };

  const handleSetSpeed = (speed: 0 | 1 | 2 | 5) => {
    setGameState((prev) => ({ ...prev, gameSpeed: speed }));
  };

  const handleCallAmbulance = () => {
    soundEffects.playAmbulanceSiren();
    const newArrival = generateRandomPatient();
    newArrival.triageColor = 'red';
    newArrival.triageSeverity = 'critical';
    newArrival.currentRoomId = 'room_reception';
    setPatients((prev) => [newArrival, ...prev]);
    setLiveLogs((prev) => [
      `AMBULÂNCIA CHEGANDO: ${newArrival.name} admitido em estado crítico com SpO2 88%!`,
      ...prev,
    ]);
  };

  const handleRepairRoom = (roomId: string) => {
    if (gameState.budget < 450) return;
    soundEffects.playHeartBip();
    setGameState((prev) => ({ ...prev, budget: prev.budget - 450 }));
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, equipmentCondition: 100 } : r))
    );
    setLiveLogs((prev) => [`Equipamento reparado com sucesso na sala: ${roomId}`, ...prev]);
  };

  const handlePerformFullMaintenance = () => {
    if (gameState.budget < 3800) return;
    soundEffects.playHeartBip();
    setGameState((prev) => ({ ...prev, budget: prev.budget - 3800 }));
    setUtilities((prev) => prev.map((u) => ({ ...u, wearPercent: 0, status: 'optimal' })));
    setRooms((prev) => prev.map((r) => ({ ...r, equipmentCondition: 100 })));
    setLiveLogs((prev) => ['Revisão preventiva geral concluída em todas as utilidades!', ...prev]);
    setIsUtilitiesOpen(false);
  };

  const handleToggleBackup = (utilityId: string) => {
    setUtilities((prev) =>
      prev.map((u) =>
        u.id === utilityId ? { ...u, backupActive: !u.backupActive } : u
      )
    );
  };

  const handleOrderSupply = (supplyId: string, quantity: number, totalCost: number) => {
    if (gameState.budget < totalCost) return;
    soundEffects.playCashSound();
    setGameState((prev) => ({ ...prev, budget: prev.budget - totalCost }));
    setSupplies((prev) =>
      prev.map((s) =>
        s.id === supplyId
          ? { ...s, currentStock: Math.min(s.maxCapacity, s.currentStock + quantity) }
          : s
      )
    );
    setLiveLogs((prev) => [`Insumo recebido com sucesso: +${quantity} unidades.`, ...prev]);
  };

  const handleReassignStaff = (staffId: string, roomId: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, assignedRoomId: roomId || undefined } : s))
    );
  };

  const handleRestStaff = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, energy: 100, assignedRoomId: undefined } : s))
    );
  };

  const handleTrainStaff = (staffId: string) => {
    if (gameState.budget < 1500) return;
    setGameState((prev) => ({ ...prev, budget: prev.budget - 1500 }));
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, level: s.level + 1, efficiency: Math.min(100, s.efficiency + 8) }
          : s
      )
    );
  };

  const handleHireStaff = (role: HospitalStaff['role']) => {
    const cost = 3000;
    if (gameState.budget < cost) return;
    soundEffects.playCashSound();
    const newMember: HospitalStaff = {
      id: `staff_${Date.now()}`,
      name: `Dr(a). Especialista ${staff.length + 1}`,
      role,
      salary: 320,
      efficiency: 92,
      energy: 100,
      level: 1,
      avatarEmoji: role === 'surgeon' ? '👨‍⚕️' : '👩‍⚕️',
    };
    setGameState((prev) => ({ ...prev, budget: prev.budget - cost }));
    setStaff((prev) => [...prev, newMember]);
    setLiveLogs((prev) => [`Novo profissional contratado para a equipe: ${newMember.name}`, ...prev]);
  };

  const handleClaimQuestReward = (questId: string) => {
    soundEffects.playLevelUp();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          setGameState((gs) => ({
            ...gs,
            budget: gs.budget + q.rewardBudget,
            xp: gs.xp + q.rewardXp,
            reputation: Math.min(100, gs.reputation + q.rewardReputation),
          }));
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  const handleEventChoice = (option: any) => {
    if (gameState.budget >= option.cost) {
      setGameState((prev) => ({
        ...prev,
        budget: prev.budget - option.cost,
        reputation: Math.min(100, prev.reputation + 4),
      }));
      setLiveLogs((prev) => [`Ação emergencial executada: ${option.label}`, ...prev]);
    }
    setActiveEvent(null);
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Gamified Hospital HUD (Top Status Bar) */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
        {/* Row 1: Hospital Name, Level, Budget, Time */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-black text-xl">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {gameState.hospitalName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  NÍVEL {gameState.hospitalLevel}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                <span>XP: {gameState.xp} / {gameState.xpToNextLevel}</span>
                <span>•</span>
                <span>Dia {gameState.day}, {String(gameState.hour).padStart(2, '0')}:00h</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Budget R$, Reputation %, Cured Count */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Cash Box */}
            <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2.5">
              <span className="text-emerald-400 font-black text-lg">R$</span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Orçamento SUS</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {gameState.budget.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Community Reputation */}
            <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2.5">
              <span className="text-amber-400 font-black text-lg">★</span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Satisfação</span>
                <span className="text-base font-black text-amber-300 font-mono">
                  {gameState.reputation}%
                </span>
              </div>
            </div>

            {/* Cured Count */}
            <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2.5">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pacientes Curados</span>
                <span className="text-base font-black text-white font-mono">
                  {gameState.curedCount}
                </span>
              </div>
            </div>

            {/* Time Controls (Pause, 1x, 2x, 5x) & Sound Toggle */}
            <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => handleSetSpeed(0)}
                className={`p-1.5 rounded-xl transition-all ${
                  gameState.gameSpeed === 0 ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Pausar Simulação"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSetSpeed(1)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  gameState.gameSpeed === 1 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Velocidade Normal (1x)"
              >
                1x
              </button>
              <button
                onClick={() => handleSetSpeed(2)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  gameState.gameSpeed === 2 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Velocidade Rápida (2x)"
              >
                2x
              </button>
              <button
                onClick={() => handleSetSpeed(5)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  gameState.gameSpeed === 5 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Velocidade Ultra (5x)"
              >
                5x
              </button>

              <button
                onClick={handleToggleSound}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white ml-1 border-l border-slate-800"
                title={gameState.soundEnabled ? 'Desativar Sons' : 'Ativar Sons'}
              >
                {gameState.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Management Subsystems & Call Ambulance Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsStaffOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{pt ? `RH & Médicos (${staff.length})` : `Staff (${staff.length})`}</span>
            </button>

            <button
              onClick={() => setIsSuppliesOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>{pt ? 'Logística & Suprimentos' : 'Supplies & Logistics'}</span>
            </button>

            <button
              onClick={() => setIsUtilitiesOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>{pt ? 'Utilidades & Manutenção' : 'Utilities & Facilities'}</span>
            </button>

            <button
              onClick={() => setIsFinanceOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>{pt ? 'Finanças & Faturamento SUS' : 'SUS Billing & Finance'}</span>
            </button>

            <button
              onClick={() => setIsQuestsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>{pt ? 'Missões & Conquistas' : 'Quests & Achievements'}</span>
            </button>

            {onOpenFullArchitecture && (
              <button
                onClick={onOpenFullArchitecture}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 text-xs font-bold transition-all shadow-md shadow-cyan-950/40"
                title={pt ? 'Abrir Geografia, Planta Baixa e Ecossistema Open Source (openDCIM, OpenMRS, OpenBoxes)' : 'Open Hospital Architecture & Open Source Ecosystem'}
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{pt ? 'Planta & Infra Open Source' : 'Architecture & Infra'}</span>
              </button>
            )}
          </div>

          <button
            onClick={handleCallAmbulance}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all active:scale-95 animate-pulse"
          >
            <Ambulance className="w-4 h-4" />
            <span>{pt ? 'Chamar Ambulância SAMU' : 'Call Ambulance'}</span>
          </button>
        </div>
      </div>

      {/* Breaking Emergency Event Banner (if active) */}
      {activeEvent && (
        <div className="bg-rose-950 text-white p-5 rounded-3xl border-2 border-rose-600 shadow-2xl animate-fade-in space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-rose-900 rounded-2xl animate-bounce">🚨</span>
              <div>
                <span className="text-[10px] font-mono font-bold bg-rose-800 px-2 py-0.5 rounded text-rose-200">
                  EVENTO EPIDÊMICO EM TEMPO REAL
                </span>
                <h3 className="text-lg font-black text-rose-100 mt-1">{activeEvent.title}</h3>
                <p className="text-xs text-rose-200/90 mt-0.5">{activeEvent.description}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveEvent(null)}
              className="p-1 rounded-lg text-rose-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-800/80">
            {activeEvent.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleEventChoice(opt)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md transition-all active:scale-95"
              >
                <span>{opt.label}</span>
                <span className="text-rose-200 text-[10px]">({opt.effectDescription})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Floorplan & Live Campus View */}
      <HospitalFloorMap
        rooms={rooms}
        staff={staff}
        patients={patients}
        selectedRoomId={selectedRoomId}
        onSelectRoom={(id) => {
          setSelectedRoomId(id);
          setSelectedPatientId(null);
        }}
        onSelectPatient={(id) => setSelectedPatientId(id)}
        onRepairRoom={handleRepairRoom}
        language={language}
      />

      {/* Bottom Grid: Patient / Room Inspector on Left, Live Telemetry Console on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Patient / Room Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>
                {selectedPatient
                  ? pt ? 'Inspetor de Paciente em Atendimento' : 'Active Patient Inspector'
                  : pt ? 'Inspetor da Ala / Sala Hospitalar' : 'Wing / Room Telemetry'}
              </span>
            </span>

            {selectedPatient && (
              <button
                onClick={() => setSelectedPatientId(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                {pt ? 'Voltar para sala' : 'Back to room'}
              </button>
            )}
          </div>

          {selectedPatient ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900">{selectedPatient.name}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedPatient.age} anos • {selectedPatient.triageSeverity.toUpperCase()} • Sala Atual:{' '}
                    <strong>{rooms.find((r) => r.id === selectedPatient.currentRoomId)?.name}</strong>
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedPatient.triageColor === 'red'
                      ? 'bg-rose-600 text-white'
                      : selectedPatient.triageColor === 'orange'
                      ? 'bg-orange-500 text-white'
                      : selectedPatient.triageColor === 'yellow'
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {selectedPatient.triageColor}
                </span>
              </div>

              {/* Patient Progress & Health Vitals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Tratamento</span>
                  <span className="font-bold text-cyan-700 text-sm">{selectedPatient.treatmentProgress}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Saúde Geral</span>
                  <span className="font-bold text-emerald-700 text-sm">{selectedPatient.healthScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">SpO2 Atual</span>
                  <span className="font-bold text-rose-600 text-sm">{selectedPatient.vitals.spo2}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Faturamento AIH</span>
                  <span className="font-bold text-slate-900 text-sm">R$ {selectedPatient.stayCostAccrued}</span>
                </div>
              </div>

              {/* Quick Transfer Selector */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-700">
                  {pt ? 'Transferir para outra ala:' : 'Transfer to wing:'}
                </span>
                <select
                  value={selectedPatient.currentRoomId}
                  onChange={(e) => {
                    const targetRoom = e.target.value;
                    setPatients((prev) =>
                      prev.map((p) => (p.id === selectedPatient.id ? { ...p, currentRoomId: targetRoom } : p))
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.currentPatientIds.length}/{r.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : selectedRoom ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900">{selectedRoom.name}</h4>
                  <p className="text-xs text-slate-500">
                    Capacidade: {selectedRoom.capacity > 0 ? `${selectedRoom.currentPatientIds.length} / ${selectedRoom.capacity} pacientes` : 'Instalação Técnica'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-lg">
                  Consumo: {selectedRoom.powerConsumptionKw} kW
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  {pt ? 'Pacientes em Atendimento nesta Sala:' : 'Patients in this Room:'}
                </span>
                {selectedRoom.currentPatientIds.length === 0 ? (
                  <span className="text-slate-400 italic">
                    {pt ? 'Nenhum paciente no momento.' : 'No patients currently.'}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoom.currentPatientIds.map((pid) => {
                      const p = patients.find((item) => item.id === pid);
                      if (!p) return null;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPatientId(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-cyan-500 text-slate-800 font-bold text-xs"
                        >
                          {p.name} ({p.treatmentProgress}%)
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Live Simulation Console / Telemetry Log (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-300 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>LIVE HOSPITAL AUTOMATION LOG</span>
            </span>
            <span className="text-slate-500 text-[10px]">TICK: REALTIME</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {liveLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-cyan-500 font-bold">›</span>
                <span className={i === 0 ? 'text-white font-bold' : 'text-slate-400'}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <StaffManagementModal
        isOpen={isStaffOpen}
        onClose={() => setIsStaffOpen(false)}
        staff={staff}
        rooms={rooms}
        budget={gameState.budget}
        onReassignStaff={handleReassignStaff}
        onRestStaff={handleRestStaff}
        onTrainStaff={handleTrainStaff}
        onHireStaff={handleHireStaff}
        language={language}
      />

      <LogisticsSuppliesModal
        isOpen={isSuppliesOpen}
        onClose={() => setIsSuppliesOpen(false)}
        supplies={supplies}
        budget={gameState.budget}
        onOrderSupply={handleOrderSupply}
        language={language}
      />

      <UtilitiesFacilitiesModal
        isOpen={isUtilitiesOpen}
        onClose={() => setIsUtilitiesOpen(false)}
        utilities={utilities}
        budget={gameState.budget}
        onPerformMaintenance={handlePerformFullMaintenance}
        onToggleBackup={handleToggleBackup}
        language={language}
      />

      <FinancialLedgerModal
        isOpen={isFinanceOpen}
        onClose={() => setIsFinanceOpen(false)}
        budget={gameState.budget}
        curedCount={gameState.curedCount}
        language={language}
      />

      <HospitalQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        quests={quests}
        onClaimQuestReward={handleClaimQuestReward}
        language={language}
      />
    </div>
  );
};
