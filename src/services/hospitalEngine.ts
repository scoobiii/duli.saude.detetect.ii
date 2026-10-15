import {
  HospitalRoom,
  HospitalStaff,
  SupplyItem,
  HospitalUtility,
  FinancialTransaction,
  GamePatient,
  HospitalQuest,
  HospitalGameEvent,
  HospitalGameState,
} from '../types/hospitalGame';
import { TriageColor, TriageSeverity, Vitals } from '../types';

export const INITIAL_ROOMS: HospitalRoom[] = [
  {
    id: 'room_reception',
    name: 'Recepção & Acolhimento SUS',
    type: 'reception',
    capacity: 12,
    currentPatientIds: [],
    assignedStaffIds: [],
    level: 1,
    equipmentCondition: 98,
    isOperating: true,
    powerConsumptionKw: 8,
    oxygenConsumptionM3: 0,
    icon: 'DoorOpen',
    color: 'border-blue-400 bg-blue-50/70',
  },
  {
    id: 'room_triage',
    name: 'Salas de Triagem (Manchester)',
    type: 'triage',
    capacity: 6,
    currentPatientIds: [],
    assignedStaffIds: ['staff_4'],
    level: 1,
    equipmentCondition: 95,
    isOperating: true,
    powerConsumptionKw: 12,
    oxygenConsumptionM3: 5,
    icon: 'Stethoscope',
    color: 'border-teal-500 bg-teal-50/70',
  },
  {
    id: 'room_imaging_cxr',
    name: 'Radiologia Digital (Raio-X)',
    type: 'imaging_cxr',
    capacity: 2,
    currentPatientIds: [],
    assignedStaffIds: ['staff_3'],
    level: 1,
    equipmentCondition: 92,
    isOperating: true,
    powerConsumptionKw: 28,
    oxygenConsumptionM3: 0,
    icon: 'Scan',
    color: 'border-cyan-500 bg-cyan-50/70',
  },
  {
    id: 'room_imaging_ct',
    name: 'Tomografia Helicoidal (TC)',
    type: 'imaging_ct',
    capacity: 1,
    currentPatientIds: [],
    assignedStaffIds: [],
    level: 1,
    equipmentCondition: 88,
    isOperating: true,
    powerConsumptionKw: 45,
    oxygenConsumptionM3: 0,
    icon: 'Layers',
    color: 'border-indigo-500 bg-indigo-50/70',
  },
  {
    id: 'room_laboratory',
    name: 'Laboratório de Análises & PCR',
    type: 'laboratory',
    capacity: 4,
    currentPatientIds: [],
    assignedStaffIds: ['staff_6'],
    level: 1,
    equipmentCondition: 94,
    isOperating: true,
    powerConsumptionKw: 22,
    oxygenConsumptionM3: 2,
    icon: 'FlaskConical',
    color: 'border-purple-500 bg-purple-50/70',
  },
  {
    id: 'room_ecg',
    name: 'Eletrocardiografia (ECG 12D)',
    type: 'ecg_room',
    capacity: 3,
    currentPatientIds: [],
    assignedStaffIds: [],
    level: 1,
    equipmentCondition: 96,
    isOperating: true,
    powerConsumptionKw: 10,
    oxygenConsumptionM3: 2,
    icon: 'Activity',
    color: 'border-emerald-500 bg-emerald-50/70',
  },
  {
    id: 'room_surgery',
    name: 'Centro Cirúrgico (Bloco 01)',
    type: 'surgery',
    capacity: 2,
    currentPatientIds: [],
    assignedStaffIds: ['staff_1'],
    level: 1,
    equipmentCondition: 95,
    isOperating: true,
    powerConsumptionKw: 55,
    oxygenConsumptionM3: 35,
    icon: 'Scissors',
    color: 'border-rose-500 bg-rose-50/70',
  },
  {
    id: 'room_icu',
    name: 'UTI Respiratória / Covid-19',
    type: 'icu',
    capacity: 6,
    currentPatientIds: [],
    assignedStaffIds: ['staff_2', 'staff_5'],
    level: 1,
    equipmentCondition: 91,
    isOperating: true,
    powerConsumptionKw: 65,
    oxygenConsumptionM3: 60,
    icon: 'HeartPulse',
    color: 'border-rose-600 bg-rose-100/70',
  },
  {
    id: 'room_ward',
    name: 'Enfermaria de Observação',
    type: 'ward',
    capacity: 10,
    currentPatientIds: [],
    assignedStaffIds: [],
    level: 1,
    equipmentCondition: 97,
    isOperating: true,
    powerConsumptionKw: 20,
    oxygenConsumptionM3: 15,
    icon: 'Bed',
    color: 'border-amber-400 bg-amber-50/70',
  },
  {
    id: 'room_pharmacy',
    name: 'Farmácia Central & Dispensário',
    type: 'pharmacy',
    capacity: 8,
    currentPatientIds: [],
    assignedStaffIds: [],
    level: 1,
    equipmentCondition: 99,
    isOperating: true,
    powerConsumptionKw: 15,
    oxygenConsumptionM3: 0,
    icon: 'Pill',
    color: 'border-emerald-600 bg-emerald-50/70',
  },
  {
    id: 'room_oxygen',
    name: 'Usina Criogênica de O2',
    type: 'oxygen_plant',
    capacity: 0,
    currentPatientIds: [],
    assignedStaffIds: ['staff_8'],
    level: 1,
    equipmentCondition: 92,
    isOperating: true,
    powerConsumptionKw: 40,
    oxygenConsumptionM3: 0,
    icon: 'Wind',
    color: 'border-sky-500 bg-sky-50/70',
  },
  {
    id: 'room_power',
    name: 'Geradores & Subestação',
    type: 'power_generator',
    capacity: 0,
    currentPatientIds: [],
    assignedStaffIds: [],
    level: 1,
    equipmentCondition: 94,
    isOperating: true,
    powerConsumptionKw: 0,
    oxygenConsumptionM3: 0,
    icon: 'Zap',
    color: 'border-amber-500 bg-amber-50/70',
  },
];

export const INITIAL_STAFF: HospitalStaff[] = [
  {
    id: 'staff_1',
    name: 'Dr. Gabriel Ramos',
    role: 'surgeon',
    salary: 450,
    efficiency: 92,
    energy: 90,
    assignedRoomId: 'room_surgery',
    level: 2,
    avatarEmoji: '👨‍⚕️',
  },
  {
    id: 'staff_2',
    name: 'Dra. Mariana Azevedo',
    role: 'physician',
    salary: 420,
    efficiency: 95,
    energy: 85,
    assignedRoomId: 'room_icu',
    level: 3,
    avatarEmoji: '👩‍⚕️',
  },
  {
    id: 'staff_3',
    name: 'Dra. Beatriz Toledo',
    role: 'radiologist',
    salary: 380,
    efficiency: 89,
    energy: 95,
    assignedRoomId: 'room_imaging_cxr',
    level: 2,
    avatarEmoji: '👩‍🔬',
  },
  {
    id: 'staff_4',
    name: 'Enf. Lucas Prado',
    role: 'triage_nurse',
    salary: 220,
    efficiency: 94,
    energy: 88,
    assignedRoomId: 'room_triage',
    level: 2,
    avatarEmoji: '👨‍⚕️',
  },
  {
    id: 'staff_5',
    name: 'Enfª. Camila Duarte',
    role: 'nurse',
    salary: 240,
    efficiency: 91,
    energy: 82,
    assignedRoomId: 'room_icu',
    level: 2,
    avatarEmoji: '👩‍⚕️',
  },
  {
    id: 'staff_6',
    name: 'Biomédico Ricardo Neves',
    role: 'biomedical',
    salary: 260,
    efficiency: 96,
    energy: 92,
    assignedRoomId: 'room_laboratory',
    level: 2,
    avatarEmoji: '👨‍🔬',
  },
  {
    id: 'staff_7',
    name: 'ACS Maria Silva',
    role: 'acs_agent',
    salary: 160,
    efficiency: 90,
    energy: 95,
    assignedRoomId: 'room_reception',
    level: 2,
    avatarEmoji: '👩‍💼',
  },
  {
    id: 'staff_8',
    name: 'Téc. Roberto Santos',
    role: 'technician',
    salary: 190,
    efficiency: 88,
    energy: 90,
    assignedRoomId: 'room_oxygen',
    level: 1,
    avatarEmoji: '👷‍♂️',
  },
];

export const INITIAL_SUPPLIES: SupplyItem[] = [
  {
    id: 'supply_o2',
    name: 'Oxigênio Medicinal Criogênico',
    category: 'oxygen',
    currentStock: 4800,
    maxCapacity: 8000,
    unit: 'm³',
    unitCost: 18,
    supplierName: 'White Martins / Oxigênio Brasil',
    deliveryDays: 1,
  },
  {
    id: 'supply_meds',
    name: 'Sedativos, Antibióticos & Corticoides',
    category: 'medication',
    currentStock: 650,
    maxCapacity: 1200,
    unit: 'ampolas',
    unitCost: 35,
    supplierName: 'Distribuidora Farmacêutica Nacional',
    deliveryDays: 2,
  },
  {
    id: 'supply_ppe',
    name: 'Máscaras PFF2/N95 & Aventais Cirúrgicos',
    category: 'ppe',
    currentStock: 1800,
    maxCapacity: 3000,
    unit: 'unidades',
    unitCost: 6,
    supplierName: 'EPI Hospitalar SP',
    deliveryDays: 1,
  },
  {
    id: 'supply_reagents',
    name: 'Kits RT-PCR & Contraste Iodado para TC',
    category: 'imaging_reagent',
    currentStock: 240,
    maxCapacity: 600,
    unit: 'kits',
    unitCost: 120,
    supplierName: 'Diagnóstica Biotecnologia',
    deliveryDays: 3,
  },
  {
    id: 'supply_blood',
    name: 'Hemoderivados & Bolsas de Concentrado',
    category: 'blood_packs',
    currentStock: 45,
    maxCapacity: 100,
    unit: 'bolsas',
    unitCost: 280,
    supplierName: 'Hemocentro Regional SUS',
    deliveryDays: 1,
  },
];

export const INITIAL_UTILITIES: HospitalUtility[] = [
  {
    id: 'power',
    name: 'Subestação Elétrica & Geradores',
    status: 'optimal',
    capacity: 450,
    currentConsumption: 295,
    unit: 'kW',
    backupActive: false,
    wearPercent: 12,
  },
  {
    id: 'oxygen',
    name: 'Rede Central de Gases Medicinais',
    status: 'optimal',
    capacity: 250,
    currentConsumption: 114,
    unit: 'm³/h',
    backupActive: false,
    wearPercent: 16,
  },
  {
    id: 'hepa_filters',
    name: 'Filtragem de Ar HEPA & Pressão Negativa',
    status: 'optimal',
    capacity: 100,
    currentConsumption: 82,
    unit: '% vazão',
    backupActive: false,
    wearPercent: 24,
  },
  {
    id: 'waste_autoclave',
    name: 'Autoclaves & Resíduos Biológicos',
    status: 'optimal',
    capacity: 600,
    currentConsumption: 340,
    unit: 'kg/dia',
    backupActive: false,
    wearPercent: 18,
  },
];

export const INITIAL_QUESTS: HospitalQuest[] = [
  {
    id: 'quest_1',
    title: 'Acolhimento Rápido',
    description: 'Atender e triar 15 pacientes no tempo padrão de Manchester.',
    targetCount: 15,
    currentCount: 4,
    rewardBudget: 15000,
    rewardXp: 450,
    rewardReputation: 5,
    completed: false,
  },
  {
    id: 'quest_2',
    title: 'Zero Desabastecimento de O2',
    description: 'Manter a usina de oxigênio acima de 70% de capacidade por 3 dias.',
    targetCount: 3,
    currentCount: 1,
    rewardBudget: 22000,
    rewardXp: 600,
    rewardReputation: 8,
    completed: false,
  },
  {
    id: 'quest_3',
    title: 'Salvando Vidas na UTI',
    description: 'Tratar e conceder alta clínica para 5 pacientes críticos na UTI.',
    targetCount: 5,
    currentCount: 2,
    rewardBudget: 35000,
    rewardXp: 950,
    rewardReputation: 12,
    completed: false,
  },
  {
    id: 'quest_4',
    title: 'Eficiência Diagnóstica',
    description: 'Realizar 8 tomografias ou raios-X com laudo por IA.',
    targetCount: 8,
    currentCount: 3,
    rewardBudget: 18000,
    rewardXp: 500,
    rewardReputation: 6,
    completed: false,
  },
];

export const INITIAL_GAME_PATIENTS: GamePatient[] = [
  {
    id: 'GP-01',
    name: 'Dona Geralda Souza',
    age: 68,
    triageColor: 'red',
    triageSeverity: 'critical',
    symptoms: ['Falta de ar aguda', 'Febre 38.6°C', 'SpO2 91%'],
    vitals: { temperature: 38.6, spo2: 91, heartRate: 104, respiratoryRate: 26 },
    currentRoomId: 'room_icu',
    treatmentProgress: 45,
    healthScore: 38,
    satisfaction: 85,
    needsSurgery: false,
    needsCt: true,
    needsCxr: true,
    needsIcu: true,
    state: 'in_treatment',
    stayCostAccrued: 4800,
    entryTimestamp: Date.now() - 3600000 * 5,
  },
  {
    id: 'GP-02',
    name: 'Cláudio Bezerra',
    age: 44,
    triageColor: 'yellow',
    triageSeverity: 'moderate',
    symptoms: ['Tosse seca', 'Anosmia', 'SpO2 95%'],
    vitals: { temperature: 37.5, spo2: 95, heartRate: 88, respiratoryRate: 20 },
    currentRoomId: 'room_imaging_cxr',
    treatmentProgress: 70,
    healthScore: 78,
    satisfaction: 92,
    needsSurgery: false,
    needsCt: false,
    needsCxr: true,
    needsIcu: false,
    state: 'in_treatment',
    stayCostAccrued: 1400,
    entryTimestamp: Date.now() - 3600000 * 3,
  },
  {
    id: 'GP-03',
    name: 'Lucas Ferreira',
    age: 9,
    triageColor: 'green',
    triageSeverity: 'low',
    symptoms: ['Coriza', 'Febre 37.9°C'],
    vitals: { temperature: 37.9, spo2: 98, heartRate: 92, respiratoryRate: 19 },
    currentRoomId: 'room_pharmacy',
    treatmentProgress: 90,
    healthScore: 94,
    satisfaction: 98,
    needsSurgery: false,
    needsCt: false,
    needsCxr: false,
    needsIcu: false,
    state: 'in_treatment',
    stayCostAccrued: 450,
    entryTimestamp: Date.now() - 3600000 * 1,
  },
  {
    id: 'GP-04',
    name: 'Marilena Costa',
    age: 58,
    triageColor: 'orange',
    triageSeverity: 'high',
    symptoms: ['Febre 38.3°C', 'Dor no peito', 'SpO2 94%'],
    vitals: { temperature: 38.3, spo2: 94, heartRate: 98, respiratoryRate: 22 },
    currentRoomId: 'room_triage',
    treatmentProgress: 25,
    healthScore: 62,
    satisfaction: 88,
    needsSurgery: false,
    needsCt: true,
    needsCxr: true,
    needsIcu: false,
    state: 'in_treatment',
    stayCostAccrued: 1800,
    entryTimestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'GP-05',
    name: 'Seu Raimundo Alves',
    age: 72,
    triageColor: 'red',
    triageSeverity: 'critical',
    symptoms: ['Dessaturação 89%', 'Hipotensão', 'Confusão'],
    vitals: { temperature: 38.9, spo2: 89, heartRate: 116, respiratoryRate: 28 },
    currentRoomId: 'room_reception',
    treatmentProgress: 10,
    healthScore: 28,
    satisfaction: 80,
    needsSurgery: true,
    needsCt: true,
    needsCxr: true,
    needsIcu: true,
    state: 'waiting',
    stayCostAccrued: 800,
    entryTimestamp: Date.now() - 1800000,
  },
];

export const INITIAL_GAME_STATE: HospitalGameState = {
  day: 14,
  hour: 10,
  hospitalLevel: 2,
  hospitalName: 'Hospital das Clínicas & Vigilância DULI',
  xp: 1450,
  xpToNextLevel: 2500,
  budget: 184500, // R$
  reputation: 92, // 92%
  curedCount: 88,
  deceasedCount: 2,
  gameSpeed: 1,
  soundEnabled: true,
};

// Random first names for procedurally generated patients
const FIRST_NAMES = [
  'Davi', 'Helena', 'Arthur', 'Alice', 'Bernardo', 'Laura', 'Gabriel', 'Manuela',
  'Samuel', 'Sophia', 'Pedro', 'Isabella', 'Thiago', 'Lorena', 'Mateus', 'Lívia',
  'Rafael', 'Beatriz', 'Lucas', 'Cecília', 'Rodrigo', 'Eloá', 'Fernando', 'Mariana',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
];

export function generateRandomPatient(): GamePatient {
  const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const age = Math.floor(Math.random() * 75) + 5;
  const isSevere = Math.random() < 0.28;
  const isModerate = !isSevere && Math.random() < 0.45;

  let triageColor: TriageColor = 'green';
  let triageSeverity: TriageSeverity = 'low';
  let spo2 = Math.floor(Math.random() * 3) + 97;
  let temp = Number((36.5 + Math.random() * 0.9).toFixed(1));

  if (isSevere) {
    triageColor = Math.random() < 0.4 ? 'red' : 'orange';
    triageSeverity = triageColor === 'red' ? 'critical' : 'high';
    spo2 = Math.floor(Math.random() * 5) + 89;
    temp = Number((38.4 + Math.random() * 1.2).toFixed(1));
  } else if (isModerate) {
    triageColor = 'yellow';
    triageSeverity = 'moderate';
    spo2 = Math.floor(Math.random() * 3) + 94;
    temp = Number((37.6 + Math.random() * 0.8).toFixed(1));
  }

  return {
    id: `GP-${Math.floor(Math.random() * 9000) + 1000}`,
    name: `${fName} ${lName}`,
    age,
    triageColor,
    triageSeverity,
    symptoms: isSevere
      ? ['Falta de ar aguda', 'Febre alta', 'Tosse com chiado']
      : isModerate
      ? ['Tosse seca', 'Dor de garganta', 'Cansaço']
      : ['Coriza leve', 'Dor de cabeça'],
    vitals: {
      temperature: temp,
      spo2,
      heartRate: Math.floor(Math.random() * 35) + 75,
      respiratoryRate: isSevere ? 26 : 18,
    },
    currentRoomId: 'room_reception',
    treatmentProgress: 0,
    healthScore: isSevere ? 35 : isModerate ? 65 : 90,
    satisfaction: 95,
    needsSurgery: isSevere && Math.random() < 0.3,
    needsCt: isSevere || isModerate,
    needsCxr: true,
    needsIcu: triageColor === 'red',
    state: 'waiting',
    stayCostAccrued: 250,
    entryTimestamp: Date.now(),
  };
}

/**
 * Main game simulation tick function:
 * Advances patient flow, consumes utilities & oxygen, earns SUS revenues, heals patients!
 */
export function processHospitalTick(
  gameState: HospitalGameState,
  patients: GamePatient[],
  rooms: HospitalRoom[],
  staff: HospitalStaff[],
  supplies: SupplyItem[],
  utilities: HospitalUtility[]
): {
  newGameState: HospitalGameState;
  newPatients: GamePatient[];
  newRooms: HospitalRoom[];
  newStaff: HospitalStaff[];
  newSupplies: SupplyItem[];
  newUtilities: HospitalUtility[];
  curedThisTick: GamePatient[];
  revenueEarnedThisTick: number;
  newLogs: string[];
} {
  const newLogs: string[] = [];
  let revenueEarnedThisTick = 0;
  const curedThisTick: GamePatient[] = [];

  // Advance time
  let newHour = gameState.hour + 1;
  let newDay = gameState.day;
  if (newHour >= 24) {
    newHour = 0;
    newDay += 1;
    newLogs.push(`Novo Dia Iniciado: Dia ${newDay}. Folha de pagamento e diárias SUS processadas.`);
  }

  // 1. Process Patient Flow & Healing
  const updatedPatients: GamePatient[] = [];
  const roomOccupancyMap: Record<string, string[]> = {};
  rooms.forEach((r) => (roomOccupancyMap[r.id] = []));

  // Determine room efficiency based on assigned staff
  const roomEfficiency: Record<string, number> = {};
  rooms.forEach((room) => {
    const assignedStaff = staff.filter((s) => s.assignedRoomId === room.id && s.energy > 15);
    const totalStaffEfficiency = assignedStaff.reduce((acc, s) => acc + s.efficiency, 0);
    roomEfficiency[room.id] = assignedStaff.length > 0 ? Math.min(1.5, Math.max(0.6, totalStaffEfficiency / 100)) : 0.25;
  });

  // Calculate utility consumption
  let totalPowerDraw = 0;
  let totalO2Draw = 0;

  patients.forEach((patient) => {
    let p = { ...patient };

    if (p.state === 'cured' || p.state === 'deceased') {
      return; // Skip already finished patients
    }

    const currentRoom = rooms.find((r) => r.id === p.currentRoomId);
    const eff = roomEfficiency[p.currentRoomId] || 0.4;

    // Progress in current room
    if (p.state === 'in_treatment' || p.state === 'waiting') {
      p.treatmentProgress = Math.min(100, p.treatmentProgress + Math.round(12 * eff));
      p.healthScore = Math.min(100, p.healthScore + Math.round(8 * eff));
      p.stayCostAccrued += 120;

      // Next room transition logic
      if (p.treatmentProgress >= 100) {
        if (p.currentRoomId === 'room_reception') {
          p.currentRoomId = 'room_triage';
          p.treatmentProgress = 0;
          p.state = 'in_treatment';
        } else if (p.currentRoomId === 'room_triage') {
          if (p.triageColor === 'red' && p.needsIcu) {
            p.currentRoomId = 'room_icu';
          } else if (p.needsSurgery) {
            p.currentRoomId = 'room_surgery';
          } else if (p.needsCt) {
            p.currentRoomId = 'room_imaging_ct';
          } else if (p.needsCxr) {
            p.currentRoomId = 'room_imaging_cxr';
          } else {
            p.currentRoomId = 'room_ward';
          }
          p.treatmentProgress = 0;
        } else if (p.currentRoomId === 'room_imaging_cxr' || p.currentRoomId === 'room_imaging_ct') {
          p.currentRoomId = p.triageColor === 'red' ? 'room_icu' : 'room_ward';
          p.treatmentProgress = 0;
        } else if (p.currentRoomId === 'room_surgery') {
          p.currentRoomId = 'room_icu';
          p.treatmentProgress = 0;
          p.needsSurgery = false;
        } else if (p.currentRoomId === 'room_icu' || p.currentRoomId === 'room_ward' || p.currentRoomId === 'room_pharmacy') {
          // Patient is CURED!
          p.state = 'cured';
          p.treatmentProgress = 100;
          p.healthScore = 100;
          curedThisTick.push(p);

          // Calculate SUS reimbursement
          const baseBill = p.triageColor === 'red' ? 6800 : p.triageColor === 'orange' ? 3400 : 1200;
          const totalReimbursement = baseBill + (p.stayCostAccrued * 0.8);
          revenueEarnedThisTick += Math.round(totalReimbursement);
          newLogs.push(`Alta Clínica: ${p.name} curado! Reembolso SUS AIH recebido: +R$ ${Math.round(totalReimbursement)}.`);
        }
      }
    }

    if (p.state !== 'cured') {
      if (roomOccupancyMap[p.currentRoomId]) {
        roomOccupancyMap[p.currentRoomId].push(p.id);
      }
      updatedPatients.push(p);
    }
  });

  // Calculate actual resource draws
  rooms.forEach((rm) => {
    const patientCount = roomOccupancyMap[rm.id]?.length || 0;
    if (patientCount > 0 || rm.type === 'icu' || rm.type === 'surgery') {
      totalPowerDraw += rm.powerConsumptionKw;
      totalO2Draw += rm.oxygenConsumptionM3 * (patientCount > 0 ? patientCount : 1);
    }
  });

  // 2. Consume oxygen supplies
  const updatedSupplies = supplies.map((sup) => {
    if (sup.category === 'oxygen') {
      return {
        ...sup,
        currentStock: Math.max(0, sup.currentStock - Math.round(totalO2Draw * 0.8)),
      };
    }
    return sup;
  });

  // 3. Update staff energy
  const updatedStaff = staff.map((st) => {
    if (st.assignedRoomId) {
      return {
        ...st,
        energy: Math.max(10, st.energy - 3),
      };
    } else {
      return {
        ...st,
        energy: Math.min(100, st.energy + 8), // rest
      };
    }
  });

  // 4. Update rooms with new patient arrays
  const updatedRooms = rooms.map((rm) => ({
    ...rm,
    currentPatientIds: roomOccupancyMap[rm.id] || [],
  }));

  // 5. Update utilities status
  const updatedUtilities = utilities.map((ut) => {
    if (ut.id === 'power') {
      return { ...ut, currentConsumption: totalPowerDraw };
    }
    if (ut.id === 'oxygen') {
      return { ...ut, currentConsumption: totalO2Draw };
    }
    return ut;
  });

  // 6. Spawn new patient periodically if reception has room
  if (Math.random() < 0.42 && (roomOccupancyMap['room_reception']?.length || 0) < 10) {
    const newArrival = generateRandomPatient();
    updatedPatients.unshift(newArrival);
    newLogs.push(`Novo Paciente Acolhido: ${newArrival.name} (${newArrival.triageColor.toUpperCase()})`);
  }

  // 7. Update Game State
  const xpEarned = curedThisTick.length * 150;
  let newXp = gameState.xp + xpEarned;
  let newLevel = gameState.hospitalLevel;
  let newXpTarget = gameState.xpToNextLevel;

  if (newXp >= gameState.xpToNextLevel) {
    newLevel += 1;
    newXp -= gameState.xpToNextLevel;
    newXpTarget = Math.round(gameState.xpToNextLevel * 1.5);
    newLogs.push(`PARABÉNS! Hospital subiu para o NÍVEL ${newLevel}! Novos leitos e recursos desbloqueados.`);
  }

  const updatedGameState: HospitalGameState = {
    ...gameState,
    hour: newHour,
    day: newDay,
    budget: gameState.budget + revenueEarnedThisTick,
    xp: newXp,
    hospitalLevel: newLevel,
    xpToNextLevel: newXpTarget,
    curedCount: gameState.curedCount + curedThisTick.length,
    reputation: Math.min(100, Math.max(30, gameState.reputation + (curedThisTick.length > 0 ? 1 : 0))),
  };

  return {
    newGameState: updatedGameState,
    newPatients: updatedPatients,
    newRooms: updatedRooms,
    newStaff: updatedStaff,
    newSupplies: updatedSupplies,
    newUtilities: updatedUtilities,
    curedThisTick,
    revenueEarnedThisTick,
    newLogs,
  };
}
