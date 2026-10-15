import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { PatientTriage } from '../types';

export type UserRole = 'cliente' | 'recepcionista' | 'medico' | 'manutencao' | 'gestao';

export interface AppUserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  crmOrCoren?: string;
  susCardNumber?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalAdmissionRecord {
  id: string;
  patientName: string;
  patientUid?: string;
  susCard?: string;
  stage: 'reception' | 'triage' | 'exams' | 'doctor_consult' | 'ward' | 'icu' | 'surgery' | 'discharged';
  priority: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  chiefComplaint: string;
  assignedDoctor?: string;
  assignedRoom?: string;
  diagnosis?: string;
  aihBilledAmount?: number;
  admittedAt: string;
  dischargedAt?: string;
}

export interface MaintenanceOrderRecord {
  id: string;
  equipmentName: string;
  equipmentType: 'tomografo' | 'raio_x' | 'ecg' | 'ventilador' | 'usina_o2' | 'gerador_eletrico' | 'autoclave' | 'ar_pressao_negativa';
  locationRoom: string;
  priority: 'critica' | 'alta' | 'media' | 'preventiva';
  status: 'aberta' | 'em_andamento' | 'calibrado' | 'concluida';
  description: string;
  reportedBy: string;
  technicianAssigned: string;
  nextCalibrationDate: string;
  createdAt: string;
}

export interface FinanceTransactionRecord {
  id: string;
  type: 'receita_sus' | 'receita_convenio' | 'despesa_rh' | 'despesa_insumos' | 'despesa_manutencao';
  description: string;
  amount: number;
  category: string;
  referenceDocument: string;
  recordedBy: string;
  timestamp: string;
}

// Default Demonstration Profiles
export const DEMO_USER_PROFILES: Record<UserRole, AppUserProfile> = {
  cliente: {
    uid: 'demo_patient_001',
    name: 'Maria Clara Santos (Paciente)',
    email: 'maria.santos@paciente.sus.gov.br',
    role: 'cliente',
    susCardNumber: '898.0001.4421.0019',
    phone: '(11) 98765-4321',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  recepcionista: {
    uid: 'demo_reception_002',
    name: 'Carlos Mendes (Recepção Central)',
    email: 'carlos.mendes@hospital.gov.br',
    role: 'recepcionista',
    specialty: 'Acolhimento & Classificação SUS',
    phone: '(11) 97123-4567',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  medico: {
    uid: 'demo_doctor_003',
    name: 'Dra. Beatriz Albuquerque',
    email: 'beatriz.albuquerque@hospital.gov.br',
    role: 'medico',
    specialty: 'Pneumologia & Terapia Intensiva',
    crmOrCoren: 'CRM-SP 142.890',
    phone: '(11) 99887-7665',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  manutencao: {
    uid: 'demo_maint_004',
    name: 'Eng. Roberto Nogueira',
    email: 'roberto.nogueira@hospital.gov.br',
    role: 'manutencao',
    specialty: 'Engenharia Clínica & Facilities',
    crmOrCoren: 'CREA-SP 88.421/D',
    phone: '(11) 96543-2109',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  gestao: {
    uid: 'demo_admin_005',
    name: 'Diretora Helena Fontes',
    email: 'helena.fontes@hospital.gov.br',
    role: 'gestao',
    specialty: 'Diretoria Executiva & Controladoria ERP',
    phone: '(11) 95432-1098',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// INITIAL MOCK ADMISSIONS
export const INITIAL_ADMISSIONS: HospitalAdmissionRecord[] = [
  {
    id: 'adm-001',
    patientName: 'Sr. Arnaldo Silveira',
    patientUid: 'demo_patient_001',
    susCard: '898.0001.4421.0019',
    stage: 'icu',
    priority: 'red',
    chiefComplaint: 'Insuficiência respiratória aguda e queda de SpO2 para 86%',
    assignedDoctor: 'Dra. Beatriz Albuquerque',
    assignedRoom: 'UTI Respiratória - Leito 02',
    diagnosis: 'COVID-19 grave com infiltrado bilateral extenso (75%)',
    aihBilledAmount: 6800,
    admittedAt: '2026-10-15T08:30:00.000Z',
  },
  {
    id: 'adm-002',
    patientName: 'Fernanda Lima Castro',
    susCard: '898.2234.9981.0022',
    stage: 'exams',
    priority: 'orange',
    chiefComplaint: 'Febre alta (39.1°C), dor pleurítica intensa e tosse produtiva',
    assignedDoctor: 'Dra. Beatriz Albuquerque',
    assignedRoom: 'Tomografia Computadorizada (HRCT)',
    diagnosis: 'Suspeita de consolidação lobar inferior direita',
    aihBilledAmount: 1850,
    admittedAt: '2026-10-15T09:15:00.000Z',
  },
  {
    id: 'adm-003',
    patientName: 'Lucas Eduardo Pires',
    susCard: '898.3341.1120.0031',
    stage: 'triage',
    priority: 'yellow',
    chiefComplaint: 'Tosse persistente há 4 dias, coriza e mialgia moderada',
    assignedRoom: 'Triagem Manchester 01',
    aihBilledAmount: 450,
    admittedAt: '2026-10-15T09:40:00.000Z',
  },
  {
    id: 'adm-004',
    patientName: 'Dona Geralda Moreira',
    susCard: '898.4419.8821.0044',
    stage: 'reception',
    priority: 'green',
    chiefComplaint: 'Renovação de receita e avaliação de sintomas gripais leves',
    assignedRoom: 'Acolhimento Recepção Geral',
    aihBilledAmount: 120,
    admittedAt: '2026-10-15T10:05:00.000Z',
  },
];

// INITIAL MAINTENANCE ORDERS
export const INITIAL_MAINTENANCE_ORDERS: MaintenanceOrderRecord[] = [
  {
    id: 'os-01',
    equipmentName: 'Tomógrafo Multislice 64 Canais (GE Optima)',
    equipmentType: 'tomografo',
    locationRoom: 'Centro de Diagnóstico por Imagem - Sala 02',
    priority: 'alta',
    status: 'em_andamento',
    description: 'Calibração do tubo de raio-X e teste de espessura de corte helicoidal (1.25mm)',
    reportedBy: 'Dra. Beatriz Albuquerque',
    technicianAssigned: 'Eng. Roberto Nogueira',
    nextCalibrationDate: '2026-11-15',
    createdAt: '2026-10-14T14:00:00.000Z',
  },
  {
    id: 'os-02',
    equipmentName: 'Usina Criogênica de Oxigênio Medicinal (O2)',
    equipmentType: 'usina_o2',
    locationRoom: 'Central de Gases Medicinais Externa',
    priority: 'critica',
    status: 'calibrado',
    description: 'Verificação da válvula reguladora de pressão da rede primária (4.5 bar estável)',
    reportedBy: 'Diretora Helena Fontes',
    technicianAssigned: 'Eng. Roberto Nogueira',
    nextCalibrationDate: '2026-10-30',
    createdAt: '2026-10-13T09:30:00.000Z',
  },
  {
    id: 'os-03',
    equipmentName: 'Ventilador Mecânico Pulmonar (Dräger Evita)',
    equipmentType: 'ventilador',
    locationRoom: 'UTI Respiratória - Box 04',
    priority: 'preventiva',
    status: 'concluida',
    description: 'Troca de diafragma expiratório e calibração de sensores de fluxo e FiO2',
    reportedBy: 'Enf. Chefe Marcos',
    technicianAssigned: 'Eng. Roberto Nogueira',
    nextCalibrationDate: '2026-12-01',
    createdAt: '2026-10-12T11:00:00.000Z',
  },
  {
    id: 'os-04',
    equipmentName: 'Aparelho de Raio-X Digital Direto (DR Philips)',
    equipmentType: 'raio_x',
    locationRoom: 'Radiologia Geral - Sala 01',
    priority: 'media',
    status: 'aberta',
    description: 'Ajuste de colimação óptica e checagem do sensor de miliamperagem (mAs)',
    reportedBy: 'Tec. Radiologia Aline',
    technicianAssigned: 'Eng. Roberto Nogueira',
    nextCalibrationDate: '2026-11-20',
    createdAt: '2026-10-15T07:45:00.000Z',
  },
  {
    id: 'os-05',
    equipmentName: 'Sistema de Filtragem HEPA & Pressão Negativa',
    equipmentType: 'ar_pressao_negativa',
    locationRoom: 'Isolamento de Doenças Respiratórias - Ala C',
    priority: 'alta',
    status: 'concluida',
    description: 'Troca dos pré-filtros G4 e teste de diferencial de pressão manométrica (-15 Pa)',
    reportedBy: 'CCIH - Controle de Infecção',
    technicianAssigned: 'Eng. Roberto Nogueira',
    nextCalibrationDate: '2026-11-10',
    createdAt: '2026-10-10T16:20:00.000Z',
  },
];

// INITIAL ERP FINANCIAL TRANSACTIONS
export const INITIAL_FINANCE_RECORDS: FinanceTransactionRecord[] = [
  {
    id: 'fin-01',
    type: 'receita_sus',
    description: 'Faturamento Lote AIH SUS - Alta de Paciente UTI Respiratória',
    amount: 6800,
    category: 'Repasse Ministério da Saúde / SUS',
    referenceDocument: 'AIH-2026-004819',
    recordedBy: 'Diretoria Helena Fontes',
    timestamp: '2026-10-14T18:00:00.000Z',
  },
  {
    id: 'fin-02',
    type: 'receita_sus',
    description: 'Procedimentos Ambulatoriais Especializados (BPA/SIA - RX e TC)',
    amount: 3450,
    category: 'Faturamento SIA/SUS',
    referenceDocument: 'BPA-2026-10822',
    recordedBy: 'Carlos Mendes',
    timestamp: '2026-10-14T19:30:00.000Z',
  },
  {
    id: 'fin-03',
    type: 'despesa_insumos',
    description: 'Reabastecimento Emergencial de Oxigênio Criogênico Líquido (4.000 m³)',
    amount: -4200,
    category: 'Gases Medicinais - White Martins',
    referenceDocument: 'NF-e 88.401',
    recordedBy: 'Diretoria Helena Fontes',
    timestamp: '2026-10-13T10:15:00.000Z',
  },
  {
    id: 'fin-04',
    type: 'despesa_rh',
    description: 'Folha de Pagamento Plantão Noturno UTI & Pronto Atendimento',
    amount: -12500,
    category: 'Recursos Humanos / Corpo Clínico',
    referenceDocument: 'FP-PLANT-1026',
    recordedBy: 'Diretoria Helena Fontes',
    timestamp: '2026-10-13T22:00:00.000Z',
  },
  {
    id: 'fin-05',
    type: 'despesa_manutencao',
    description: 'Contrato Preventivo e Troca de Tubo do Tomógrafo Multislice',
    amount: -3800,
    category: 'Engenharia Clínica / Contratos',
    referenceDocument: 'OS-ENG-0144',
    recordedBy: 'Eng. Roberto Nogueira',
    timestamp: '2026-10-12T15:30:00.000Z',
  },
];

// Helper to save or sync with Firestore
export async function saveTriageToFirestore(triage: PatientTriage): Promise<void> {
  const path = 'triages';
  try {
    const docRef = doc(db, path, triage.id);
    await setDoc(docRef, {
      ...triage,
      createdAt: triage.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${triage.id}`);
  }
}

export async function saveAdmissionToFirestore(admission: HospitalAdmissionRecord): Promise<void> {
  const path = 'hospital_admissions';
  try {
    const docRef = doc(db, path, admission.id);
    await setDoc(docRef, admission);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${admission.id}`);
  }
}

export async function saveMaintenanceOrderToFirestore(order: MaintenanceOrderRecord): Promise<void> {
  const path = 'maintenance_orders';
  try {
    const docRef = doc(db, path, order.id);
    await setDoc(docRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${order.id}`);
  }
}

export async function saveFinanceRecordToFirestore(record: FinanceTransactionRecord): Promise<void> {
  const path = 'hospital_finances';
  try {
    const docRef = doc(db, path, record.id);
    await setDoc(docRef, record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${record.id}`);
  }
}
