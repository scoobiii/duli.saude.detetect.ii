export type TriageColor = 'green' | 'yellow' | 'orange' | 'red';
export type TriageSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface Vitals {
  temperature?: number; // in Celsius e.g. 37.8
  spo2?: number; // Oxygen Saturation % e.g. 96
  heartRate?: number; // BPM e.g. 84
  respiratoryRate?: number; // RPM e.g. 18
  systolicBP?: number; // mmHg e.g. 120
  diastolicBP?: number; // mmHg e.g. 80
}

export interface PatientTriage {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Outro';
  neighborhood: string;
  phone?: string;
  susCardNumber?: string;
  timestamp: string;
  daysWithSymptoms: number;
  symptoms: string[];
  vitals: Vitals;
  comorbidities: string[];
  coughType?: 'seca' | 'produtiva' | 'latente' | 'sem_tosse' | 'chiado';
  coughAudioFeatures?: {
    frequencyPeakHz?: number;
    intensityDb?: number;
    burstCount?: number;
  };
  notes?: string;
  
  // Evaluation Result
  triageColor: TriageColor;
  triageLevel: TriageSeverity;
  score: number; // 0 - 100
  summary: string;
  simpleGuidanceForFamily: string;
  clinicalRationale: string;
  redFlags: string[];
  differentialDiagnosis?: string[];
  recommendedAction: string;
  isolationDaysRecommended: number;
  emergencyDispatchRecommended: boolean;
  evaluatedByEngine: 'local-agent' | 'gemini-3.8-flash';
  
  // Workflow Status for ACS / Clinic
  status: 'pending_visit' | 'in_observation' | 'referred_upa' | 'home_recovery' | 'resolved';
}

export interface NeighborhoodCluster {
  id: string;
  name: string;
  population: number;
  activeCases: number;
  suspectedCases: number;
  severeCases: number;
  riskLevel: 'green' | 'yellow' | 'orange' | 'red';
  vulnerableElderly: number;
  sanitationIndex: number; // 0 - 100
  acsAssigned: string;
  coordinates: { x: number; y: number }; // SVG map normalized coords
}

export interface CommunityEpidemiologicalStats {
  municipality: string;
  lastUpdated: string;
  totalPopulation: number;
  totalCases: number;
  activeCases: number;
  suspectedCases: number;
  recoveredCases: number;
  deaths: number;
  estimatedRt: number; // Basic / Effective reproduction number R(t)
  positivityRate: number; // e.g. 18.5%
  icuOccupancyRate: number; // e.g. 74%
  wardOccupancyRate: number; // e.g. 62%
  acsVisitsCompletedWeek: number;
}

export interface SirSimulationParams {
  population: number;
  initialInfected: number;
  initialRecovered: number;
  transmissionRateBeta: number; // Contact rate * transmission prob
  recoveryRateGamma: number; // 1 / infectious period
  maskAdoptionPercent: number; // 0 - 100
  isolationEffectivenessPercent: number; // 0 - 100
  simulationDays: number;
}

export interface SirDataPoint {
  day: number;
  susceptible: number;
  infected: number;
  recovered: number;
  hospitalized: number;
}

export interface EpidemiologicalReport {
  epidemicPhase: string;
  estimatedRt: number;
  alertLevel: string;
  executiveSummary: string;
  highRiskSectors: string[];
  priorityActionsForACS: string[];
  healthSystemLoadAdvice: string;
  recommendedSanitaryMeasures?: string[];
  generatedAt: string;
  generatedBy: 'local-agent' | 'gemini-3.8-flash';
}

export type AppPersona = 'hospital_tycoon' | 'professional_acs' | 'child_citizen' | 'readme_ci' | 'role_dashboard';
export type AIEngineMode = 'local_agent' | 'gemini_flash';
export type AppLanguage = 'pt' | 'en';

export interface ModelValidationMetric {
  accuracy: number; // percentage e.g. 96.8
  sensitivity: number; // percentage e.g. 97.4 (Recall)
  specificity: number; // percentage e.g. 96.2
  aucRoc: number; // e.g. 0.985
  f1Score: number; // e.g. 0.971
  datasetOrigin: string; // e.g. "BIMCV-COVID19+ & COVID-QU-Ex"
  nValSamples: number;
}

export interface ImagingStudy {
  id: string;
  patientId: string;
  patientName: string;
  modality: 'CXR' | 'CT_CHEST' | 'ECG_12LEAD';
  title: string;
  studyDate: string;
  indication: string;
  status: 'analyzed' | 'review_required';
  findings: string[];
  severityScore: number; // 0-100 (e.g. Brixia score / RALE)
  detectedLesions: {
    type: 'ground_glass' | 'consolidation' | 'pleural_effusion' | 'cardiomegaly' | 'st_elevation' | 'normal';
    label: string;
    location: string;
    confidence: number;
    bbox?: { x: number; y: number; width: number; height: number }; // normalized 0-100%
  }[];
  modelMetrics: ModelValidationMetric;
  dicomMetadata: {
    sopInstanceUid: string;
    kvp?: number;
    exposureMs?: number;
    sliceThicknessMm?: number;
    leadConfiguration?: string;
  };
}

export interface LabBiomarkerPanel {
  patientId: string;
  crp: number; // C-Reactive Protein (mg/L), normal < 5.0
  dDimer: number; // ng/mL FEU, normal < 500
  ferritin: number; // ng/mL, normal 30-400
  troponinI: number; // ng/mL, normal < 0.04
  lymphocytes: number; // /mm3, normal 1000-4000
  leukocytes: number; // /mm3, normal 4000-11000
  rtPcrCovid: 'Positivo' | 'Negativo' | 'Inconclusivo';
  collectedAt: string;
}

export interface RealDatasetCitation {
  id: string;
  name: string;
  institution: string;
  country: string;
  sampleSize: string;
  modalities: string[];
  publicationOrSource: string;
  license: string;
  reportedBenchmark: string;
  url: string;
}

export interface RegulatoryStandardItem {
  id: string;
  agency: 'ANVISA' | 'FDA' | 'CE_MDR' | 'PMDA' | 'ISO';
  regulationCode: string;
  title: string;
  category: 'Quality_System' | 'Clinical_Evaluation' | 'Risk_Management' | 'Software_Lifecycle' | 'AI_Governance';
  status: 'passed' | 'compliant' | 'verified';
  evidenceVerification: string;
  auditStandard: string;
  validationDate: string;
}

