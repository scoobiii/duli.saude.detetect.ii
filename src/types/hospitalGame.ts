import { TriageColor, TriageSeverity, Vitals } from './index';

export type RoomType =
  | 'reception'
  | 'triage'
  | 'imaging_cxr'
  | 'imaging_ct'
  | 'laboratory'
  | 'ecg_room'
  | 'surgery'
  | 'icu'
  | 'ward'
  | 'pharmacy'
  | 'oxygen_plant'
  | 'power_generator';

export interface HospitalRoom {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  currentPatientIds: string[];
  assignedStaffIds: string[];
  level: number;
  equipmentCondition: number; // 0 - 100%
  isOperating: boolean;
  powerConsumptionKw: number;
  oxygenConsumptionM3: number;
  icon: string;
  color: string;
}

export type StaffRole =
  | 'physician'
  | 'surgeon'
  | 'radiologist'
  | 'nurse'
  | 'triage_nurse'
  | 'biomedical'
  | 'acs_agent'
  | 'technician';

export interface HospitalStaff {
  id: string;
  name: string;
  role: StaffRole;
  salary: number; // Daily salary in R$
  efficiency: number; // 0 - 100%
  energy: number; // 0 - 100%
  assignedRoomId?: string;
  level: number;
  avatarEmoji: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: 'oxygen' | 'medication' | 'ppe' | 'imaging_reagent' | 'blood_packs';
  currentStock: number;
  maxCapacity: number;
  unit: string;
  unitCost: number; // R$
  supplierName: string;
  deliveryDays: number;
}

export interface HospitalUtility {
  id: 'power' | 'oxygen' | 'water' | 'hepa_filters' | 'waste_autoclave';
  name: string;
  status: 'optimal' | 'warning' | 'critical';
  capacity: number;
  currentConsumption: number;
  unit: string;
  backupActive: boolean;
  wearPercent: number; // 0 - 100%
}

export interface FinancialTransaction {
  id: string;
  timestamp: string;
  type: 'sus_reimbursement' | 'staff_payroll' | 'supplies_purchase' | 'maintenance' | 'utility_cost';
  description: string;
  amount: number; // Positive for revenue, negative for expense
}

export interface GamePatient {
  id: string;
  name: string;
  age: number;
  triageColor: TriageColor;
  triageSeverity: TriageSeverity;
  symptoms: string[];
  vitals: Vitals;
  currentRoomId: string;
  treatmentProgress: number; // 0 - 100%
  healthScore: number; // 0 - 100%
  satisfaction: number; // 0 - 100%
  needsSurgery: boolean;
  needsCt: boolean;
  needsCxr: boolean;
  needsIcu: boolean;
  state: 'waiting' | 'in_treatment' | 'cured' | 'deceased' | 'transferred';
  stayCostAccrued: number;
  entryTimestamp: number;
}

export interface HospitalQuest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardBudget: number;
  rewardXp: number;
  rewardReputation: number;
  completed: boolean;
}

export interface HospitalGameEvent {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'outbreak_surge' | 'blackout' | 'oxygen_drop' | 'anvisa_inspection' | 'vip_donation';
  options: {
    label: string;
    cost: number;
    effectDescription: string;
    actionKey: string;
  }[];
}

export interface HospitalGameState {
  day: number;
  hour: number; // 0 to 23
  hospitalLevel: number;
  hospitalName: string;
  xp: number;
  xpToNextLevel: number;
  budget: number; // R$
  reputation: number; // 0 - 100%
  curedCount: number;
  deceasedCount: number;
  gameSpeed: 0 | 1 | 2 | 5; // 0 = paused, 1 = normal, 2 = fast, 5 = ultra
  soundEnabled: boolean;
}
