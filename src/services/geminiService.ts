import { PatientTriage, EpidemiologicalReport, NeighborhoodCluster, AppLanguage } from '../types';
import { TriageInput } from './localAgent';

export interface ServerStatusResponse {
  status: string;
  geminiConfigured: boolean;
  model: string;
  localAgentAvailable: boolean;
  serverTime: string;
}

export async function checkServerStatus(): Promise<ServerStatusResponse> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Falha ao verificar status do servidor');
    return await res.json();
  } catch {
    return {
      status: 'offline',
      geminiConfigured: false,
      model: 'gemini-3.8-flash',
      localAgentAvailable: true,
      serverTime: new Date().toISOString(),
    };
  }
}

export async function requestGeminiTriage(input: TriageInput): Promise<PatientTriage> {
  const response = await fetch('/api/gemini/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Erro HTTP ${response.status} na API Gemini`);
  }

  const result = await response.json();
  const d = result.data;

  return {
    id: `DULI-AI-${Date.now().toString().slice(-6)}`,
    name: input.name || (input.language === 'pt' ? 'Paciente Comunitário' : 'Community Patient'),
    age: input.age,
    gender: input.gender,
    neighborhood: input.neighborhood || (input.language === 'pt' ? 'Centro' : 'Downtown'),
    phone: input.phone,
    susCardNumber: input.susCardNumber,
    timestamp: new Date().toISOString(),
    daysWithSymptoms: input.daysWithSymptoms,
    symptoms: input.symptoms,
    vitals: input.vitals,
    comorbidities: input.comorbidities,
    coughType: input.coughType,
    coughAudioFeatures: input.coughAudioFeatures,
    notes: input.notes,

    triageColor: (['green', 'yellow', 'orange', 'red'].includes(d.colorCode) ? d.colorCode : 'yellow') as any,
    triageLevel: (['low', 'moderate', 'high', 'critical'].includes(d.triageLevel) ? d.triageLevel : 'moderate') as any,
    score: typeof d.score === 'number' ? Math.round(d.score) : 45,
    summary: d.summary || '',
    simpleGuidanceForFamily: d.simpleGuidanceForFamily || '',
    clinicalRationale: d.clinicalRationale || '',
    redFlags: Array.isArray(d.redFlags) ? d.redFlags : [],
    differentialDiagnosis: Array.isArray(d.differentialDiagnosis) ? d.differentialDiagnosis : ['COVID-19', 'Influenza'],
    recommendedAction: d.recommendedAction || '',
    isolationDaysRecommended: typeof d.isolationDaysRecommended === 'number' ? d.isolationDaysRecommended : 7,
    emergencyDispatchRecommended: Boolean(d.emergencyDispatchRecommended),
    evaluatedByEngine: 'gemini-3.8-flash',
    status: d.colorCode === 'red' ? 'referred_upa' : 'pending_visit',
  };
}

export async function requestGeminiEpidemicReport(
  clusters: NeighborhoodCluster[],
  language: AppLanguage = 'pt'
): Promise<EpidemiologicalReport> {
  const totalActive = clusters.reduce((a, b) => a + b.activeCases, 0);
  const totalSuspected = clusters.reduce((a, b) => a + b.suspectedCases, 0);
  const totalSevere = clusters.reduce((a, b) => a + b.severeCases, 0);
  const totalPop = clusters.reduce((a, b) => a + b.population, 0);

  const response = await fetch('/api/gemini/epidemic-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      regionName: 'Município & Bairros Monitorados (DULI)',
      totalPopulation: totalPop,
      activeCases: totalActive,
      suspectedCases: totalSuspected,
      recoveredCases: Math.round(totalPop * 0.05),
      severeCases: totalSevere,
      hospitalizedCases: Math.round(totalSevere * 0.6),
      neighborhoods: clusters.map((c) => ({
        bairro: c.name,
        populacao: c.population,
        casosAtivos: c.activeCases,
        casosSuspeitos: c.suspectedCases,
        risco: c.riskLevel,
        idososVulneraveis: c.vulnerableElderly,
      })),
      language,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Erro HTTP ${response.status} na API de Boletim Gemini`);
  }

  const result = await response.json();
  const d = result.data;

  return {
    epidemicPhase: d.epidemicPhase || 'Fase de Monitoramento Intensivo',
    estimatedRt: typeof d.estimatedRt === 'number' ? d.estimatedRt : 1.15,
    alertLevel: d.alertLevel || 'Amarelo',
    executiveSummary: d.executiveSummary || '',
    highRiskSectors: Array.isArray(d.highRiskSectors) ? d.highRiskSectors : [],
    priorityActionsForACS: Array.isArray(d.priorityActionsForACS) ? d.priorityActionsForACS : [],
    healthSystemLoadAdvice: d.healthSystemLoadAdvice || '',
    recommendedSanitaryMeasures: Array.isArray(d.recommendedSanitaryMeasures) ? d.recommendedSanitaryMeasures : [],
    generatedAt: new Date().toISOString(),
    generatedBy: 'gemini-3.8-flash',
  };
}

export async function requestGeminiCoughAnalysis(params: {
  coughType: string;
  frequency: string;
  hasDyspnea: boolean;
  durationDays: number;
  accompaniedByWheeze: boolean;
  audioFeatures?: any;
  language?: AppLanguage;
}) {
  const response = await fetch('/api/gemini/cough-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Falha na análise de tosse com IA');
  }

  const result = await response.json();
  return result.data;
}

export async function requestGeminiMultimodalDiagnosis(params: {
  patient: any;
  study: any;
  labs?: any;
  language?: AppLanguage;
}) {
  const response = await fetch('/api/gemini/multimodal-diagnosis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Falha ao processar diagnóstico multimodal com Gemini');
  }

  const result = await response.json();
  return result.data;
}

