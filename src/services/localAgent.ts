import {
  PatientTriage,
  TriageColor,
  TriageSeverity,
  Vitals,
  SirSimulationParams,
  SirDataPoint,
  EpidemiologicalReport,
  NeighborhoodCluster,
  AppLanguage,
} from '../types';

export interface TriageInput {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Outro';
  neighborhood: string;
  phone?: string;
  susCardNumber?: string;
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
  language?: AppLanguage;
}

/**
 * Local Deterministic Clinical Heuristic Agent (WHO / SUS / Manchester protocol)
 * Runs 100% locally with zero latency and requires no network or API keys.
 */
export function evaluateLocalTriage(input: TriageInput): PatientTriage {
  let score = 0;
  const redFlags: string[] = [];
  const pt = input.language !== 'en';

  // 1. Critical Vital Signs Assessment
  const spo2 = input.vitals.spo2;
  const temp = input.vitals.temperature;
  const heartRate = input.vitals.heartRate;
  const respRate = input.vitals.respiratoryRate;

  if (spo2 !== undefined) {
    if (spo2 <= 92) {
      score += 45;
      redFlags.push(pt ? `Saturação Crítica de Oxigênio (SpO2 ${spo2}%) abaixo de 93%` : `Critical Oxygen Saturation (SpO2 ${spo2}%) below 93%`);
    } else if (spo2 <= 94) {
      score += 25;
      redFlags.push(pt ? `Dessaturação Leve a Moderada (SpO2 ${spo2}%)` : `Mild to Moderate Desaturation (SpO2 ${spo2}%)`);
    }
  }

  if (temp !== undefined) {
    if (temp >= 39.0) {
      score += 22;
      redFlags.push(pt ? `Febre alta persistente (${temp}°C)` : `Persistent high fever (${temp}°C)`);
    } else if (temp >= 37.8) {
      score += 12;
    }
  }

  if (respRate !== undefined && respRate >= 24) {
    score += 25;
    redFlags.push(pt ? `Taquipneia / Frequência Respiratória Elevada (${respRate} rpm)` : `Tachypnea / Elevated Respiratory Rate (${respRate} rpm)`);
  }

  if (heartRate !== undefined && heartRate >= 110) {
    score += 10;
  }

  // 2. High Priority Symptoms
  const symptomsLower = input.symptoms.map((s) => s.toLowerCase());

  if (symptomsLower.includes('falta de ar') || symptomsLower.includes('shortness of breath') || symptomsLower.includes('dispneia')) {
    score += 35;
    redFlags.push(pt ? 'Dispneia / Falta de ar aguda referida' : 'Reported acute dyspnea / shortness of breath');
  }

  if (symptomsLower.includes('dor no peito') || symptomsLower.includes('chest pain') || symptomsLower.includes('dor torácica')) {
    score += 30;
    redFlags.push(pt ? 'Dor ou aperto torácico constante' : 'Persistent chest pain or pressure');
  }

  if (symptomsLower.includes('labios roxos') || symptomsLower.includes('cianose') || symptomsLower.includes('confusão mental') || symptomsLower.includes('confusion')) {
    score += 40;
    redFlags.push(pt ? 'Sinais de hipóxia grave / Alteração neurológica ou cianose' : 'Severe hypoxia signs / Cyanosis or confusion');
  }

  if (symptomsLower.includes('febre') || symptomsLower.includes('fever')) {
    score += 12;
  }
  if (symptomsLower.includes('tosse') || symptomsLower.includes('cough')) {
    score += 12;
  }
  if (symptomsLower.includes('perda de olfato') || symptomsLower.includes('perda de paladar') || symptomsLower.includes('loss of smell')) {
    score += 10;
  }
  if (symptomsLower.includes('fadiga extrema') || symptomsLower.includes('fatigue')) {
    score += 8;
  }
  if (symptomsLower.includes('dor de garganta') || symptomsLower.includes('sore throat')) {
    score += 6;
  }
  if (symptomsLower.includes('diarreia') || symptomsLower.includes('vomito') || symptomsLower.includes('diarrhea')) {
    score += 6;
  }
  if (symptomsLower.includes('dor no corpo') || symptomsLower.includes('body aches')) {
    score += 6;
  }

  // 3. Cough Acoustic & Pattern characteristics (COVID-19 Detect II component)
  if (input.coughType === 'chiado') {
    score += 15;
    redFlags.push(pt ? 'Presença de chiado no peito / broncoespasmo' : 'Wheezing or bronchospasm observed');
  } else if (input.coughType === 'seca' && (symptomsLower.includes('febre') || (temp && temp >= 37.8))) {
    score += 8;
  }

  // 4. Vulnerability & Comorbidities
  if (input.age >= 65) {
    score += 15;
  } else if (input.age >= 50) {
    score += 8;
  }

  const comorbLower = input.comorbidities.map((c) => c.toLowerCase());
  if (comorbLower.includes('diabetes')) score += 10;
  if (comorbLower.includes('hipertensao') || comorbLower.includes('hipertensão') || comorbLower.includes('hypertension')) score += 8;
  if (comorbLower.includes('asma') || comorbLower.includes('dpoc') || comorbLower.includes('asthma') || comorbLower.includes('doenca respiratoria')) {
    score += 15;
    redFlags.push(pt ? 'Paciente com comorbidade pulmonar crônica prévia' : 'Pre-existing chronic respiratory condition');
  }
  if (comorbLower.includes('imunodeprimido') || comorbLower.includes('cancer') || comorbLower.includes('imunossupressao')) {
    score += 18;
  }
  if (comorbLower.includes('gestante') || comorbLower.includes('gravida') || comorbLower.includes('pregnant')) {
    score += 12;
  }

  // Cap score
  score = Math.min(100, Math.max(5, score));

  // Determine Triage Classification
  let triageColor: TriageColor = 'green';
  let triageLevel: TriageSeverity = 'low';
  let emergencyDispatchRecommended = false;

  const hasCriticalAlarm = (spo2 !== undefined && spo2 <= 92) ||
    symptomsLower.includes('cianose') ||
    (symptomsLower.includes('falta de ar') && symptomsLower.includes('dor no peito')) ||
    score >= 60;

  if (hasCriticalAlarm) {
    triageColor = 'red';
    triageLevel = 'critical';
    emergencyDispatchRecommended = true;
  } else if (score >= 38 || (spo2 !== undefined && spo2 <= 94) || (input.age >= 65 && score >= 28)) {
    triageColor = 'orange';
    triageLevel = 'high';
  } else if (score >= 20) {
    triageColor = 'yellow';
    triageLevel = 'moderate';
  } else {
    triageColor = 'green';
    triageLevel = 'low';
  }

  // Guidance texts
  let summary = '';
  let simpleGuidanceForFamily = '';
  let clinicalRationale = '';
  let recommendedAction = '';
  let isolationDaysRecommended = 7;

  if (pt) {
    if (triageColor === 'red') {
      summary = `Atenção Imediata: Quadro de Síndrome Respiratória Aguda Grave com hipóxia ou esforço ventilatório significativo.`;
      simpleGuidanceForFamily = `Procure a Emergência ou acione o SAMU 192 imediatamente! Deixe o paciente confortável, com as vias aéreas livres e ventiladas. Não demore para buscar socorro.`;
      clinicalRationale = `Paciente apresenta marcadores clínicos de instabilidade respiratória / hipoxemia compatíveis com Protocolo Vermelho de Manchester. Requer leito de estabilização, oxigenoterapia e gasometria.`;
      recommendedAction = `Encaminhamento de Urgência à UPA ou Hospital de Referência (SAMU 192).`;
    } else if (triageColor === 'orange') {
      summary = `Risco Alto: Sintomatologia respiratória moderada a severa com presença de comorbidades ou sinais de alerta.`;
      simpleGuidanceForFamily = `Vá com calma até o Posto de Saúde (UBS) ou UPA mais próxima hoje mesmo. Use máscara protetora e leve documentos e carteira de vacinação.`;
      clinicalRationale = `Quadro clínico com risco de evolução desfavorável. Avaliação médica presencial nas próximas 2 horas indicada para ausculta pulmonar e oximetria seriada.`;
      recommendedAction = `Atendimento Médico Presencial Prioritário na UBS ou UPA mais próxima.`;
    } else if (triageColor === 'yellow') {
      summary = `Risco Moderado: Sintomas de infecção de vias aéreas com necessidade de acompanhamento e suporte.`;
      simpleGuidanceForFamily = `Fique em repouso no quarto, beba bastante água e líquidos, lave as mãos com frequência e agende uma consulta no Posto de Saúde. Se sentir falta de ar, volte imediatamente ao médico.`;
      clinicalRationale = `Quadro sugestivo de infecção viral (COVID-19 ou Influenza). Indicação de isolamento domiciliar monitorado pelo ACS da microárea e testagem RT-PCR/Antígeno.`;
      recommendedAction = `Isolamento domiciliar, teleatendimento ou consulta na UBS em até 24h.`;
    } else {
      summary = `Risco Baixo: Sintomatologia leve de vias aéreas superiores, sem sinais de gravidade identificados.`;
      simpleGuidanceForFamily = `Tudo parece bem sob controle! Beba bastante água, coma alimentos saudáveis, descanse bastante e evite contato próximo com pessoas idosas por alguns dias.`;
      clinicalRationale = `Quadro gripal leve sem comorbidades descompensadas ou desconforto ventilatório. Monitoramento de temperatura e hidratação.`;
      recommendedAction = `Repouso domiciliar e hidratação. Reavaliar se surgirem sinais de alerta.`;
    }
  } else {
    // English
    if (triageColor === 'red') {
      summary = `Emergency: Severe Acute Respiratory Syndrome features with critical hypoxia or severe respiratory distress.`;
      simpleGuidanceForFamily = `Seek emergency medical care or call 911 immediately! Keep the patient calm, sitting upright, with plenty of fresh air. Do not delay emergency assistance.`;
      clinicalRationale = `Patient displays clinical instability compatible with Red Triage. Requires emergency stabilization, supplemental O2, and arterial blood gas evaluation.`;
      recommendedAction = `Immediate transfer to Emergency Room or dispatch ambulance.`;
    } else if (triageColor === 'orange') {
      summary = `High Priority: Significant respiratory symptoms coupled with risk factors or oxygen desaturation.`;
      simpleGuidanceForFamily = `Visit an urgent care center or community clinic today. Wear a protective mask and have a companion assist you.`;
      clinicalRationale = `Sub-acute decompensation risk. In-person clinical exam and chest auscultation recommended within 2 hours.`;
      recommendedAction = `Priority in-person medical evaluation at local clinic or urgent care.`;
    } else if (triageColor === 'yellow') {
      summary = `Moderate Priority: Symptoms suggestive of viral respiratory infection requiring active monitoring.`;
      simpleGuidanceForFamily = `Rest at home, drink plenty of water and warm fluids, isolate in your room, and contact your local health clinic for viral antigen testing.`;
      clinicalRationale = `Syndrome compatible with COVID-19 or Influenza. Advised home isolation with municipal health agent phone follow-up.`;
      recommendedAction = `Home isolation, hydration, and scheduled clinic consultation.`;
    } else {
      summary = `Low Risk: Mild upper respiratory symptoms with no immediate warning criteria.`;
      simpleGuidanceForFamily = `Everything looks manageable at home! Rest well, drink plenty of fluids, and monitor symptoms over the next 48 hours.`;
      clinicalRationale = `Mild presentation without signs of pneumonia or respiratory exhaustion. Supportive care indicated.`;
      recommendedAction = `Home self-care, hydration, and monitoring.`;
    }
  }

  // Differential diagnosis list
  const differentials = pt
    ? ['COVID-19 (SARS-CoV-2)', 'Influenza A/B (Gripe sazonal)', 'Vírus Sincicial Respiratório (VSR)', 'Rinite / Sinusite Alérgica']
    : ['COVID-19 (SARS-CoV-2)', 'Seasonal Influenza A/B', 'Respiratory Syncytial Virus (RSV)', 'Allergic Rhinosinusitis'];

  return {
    id: `DULI-${Date.now().toString().slice(-6)}`,
    name: input.name || (pt ? 'Paciente Comunitário' : 'Community Patient'),
    age: input.age,
    gender: input.gender,
    neighborhood: input.neighborhood || (pt ? 'Centro' : 'Downtown'),
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
    triageColor,
    triageLevel,
    score,
    summary,
    simpleGuidanceForFamily,
    clinicalRationale,
    redFlags,
    differentialDiagnosis: differentials,
    recommendedAction,
    isolationDaysRecommended,
    emergencyDispatchRecommended,
    evaluatedByEngine: 'local-agent',
    status: triageColor === 'red' ? 'referred_upa' : 'pending_visit',
  };
}

/**
 * Local SIR / SEIR Epidemiological Simulation Engine
 * Models contagion curves, peak infections, and intervention impact (masks, isolation)
 */
export function simulateSirModel(params: SirSimulationParams): SirDataPoint[] {
  const {
    population,
    initialInfected,
    initialRecovered,
    transmissionRateBeta,
    recoveryRateGamma,
    maskAdoptionPercent,
    isolationEffectivenessPercent,
    simulationDays,
  } = params;

  // Interventions reduce effective beta
  const maskReduction = (maskAdoptionPercent / 100) * 0.40; // up to 40% reduction
  const isolationReduction = (isolationEffectivenessPercent / 100) * 0.45; // up to 45% reduction
  const totalInterventionFactor = Math.max(0.15, 1 - (maskReduction + isolationReduction));
  const effectiveBeta = transmissionRateBeta * totalInterventionFactor;

  let S = population - initialInfected - initialRecovered;
  let I = initialInfected;
  let R = initialRecovered;

  const points: SirDataPoint[] = [];
  const dt = 1; // 1 day steps

  for (let day = 0; day <= simulationDays; day++) {
    const hospitalized = Math.round(I * 0.08); // 8% average severe hospitalization
    points.push({
      day,
      susceptible: Math.round(S),
      infected: Math.round(I),
      recovered: Math.round(R),
      hospitalized,
    });

    // Differential equations:
    // dS/dt = - effectiveBeta * S * I / N
    // dI/dt = effectiveBeta * S * I / N - gamma * I
    // dR/dt = gamma * I
    const newInfections = (effectiveBeta * S * I) / population;
    const newRecoveries = recoveryRateGamma * I;

    S = Math.max(0, S - newInfections * dt);
    I = Math.max(0, I + (newInfections - newRecoveries) * dt);
    R = Math.min(population, R + newRecoveries * dt);
  }

  return points;
}

/**
 * Local Epidemiological Bulletin Generator (for Offline Community Surveillance)
 */
export function generateLocalEpidemicReport(
  clusters: NeighborhoodCluster[],
  language: AppLanguage = 'pt'
): EpidemiologicalReport {
  const totalActive = clusters.reduce((acc, c) => acc + c.activeCases, 0);
  const totalSuspected = clusters.reduce((acc, c) => acc + c.suspectedCases, 0);
  const totalSevere = clusters.reduce((acc, c) => acc + c.severeCases, 0);
  const totalPop = clusters.reduce((acc, c) => acc + c.population, 0);

  const redClusters = clusters.filter((c) => c.riskLevel === 'red' || c.riskLevel === 'orange');
  const highRiskNames = redClusters.map((c) => c.name);

  // Estimate local R_t based on cluster dynamics
  const estimatedRt = Number((1.05 + (totalActive / (totalPop * 0.01)) * 0.08).toFixed(2));
  const isHighAlert = totalSevere > 8 || estimatedRt > 1.2;

  const pt = language === 'pt';

  return {
    epidemicPhase: pt
      ? isHighAlert ? 'Transmissão Comunitária Sustentada' : 'Surto Localizado Sob Monitoramento'
      : isHighAlert ? 'Sustained Community Transmission' : 'Localized Monitored Outbreak',
    estimatedRt,
    alertLevel: isHighAlert ? (pt ? 'Laranja (Alerta Reforçado)' : 'Orange (High Alert)') : (pt ? 'Amarelo (Atenção Moderada)' : 'Yellow (Moderate Attention)'),
    executiveSummary: pt
      ? `A análise epidemiológica de dados locais registra ${totalActive} casos ativos e ${totalSuspected} casos suspeitos em triagem nas microáreas monitoradas pelos Agentes Comunitários de Saúde (ACS). O indicador R(t) atual de ${estimatedRt} sugere necessidade de reforço nas barreiras sanitárias e busca ativa domiciliar.`
      : `Epidemiological analysis of local health telemetry records ${totalActive} active cases and ${totalSuspected} suspected cases in triage across health zones monitored by Community Health Agents. Current R(t) reproduction rate of ${estimatedRt} warrants reinforced active case searching.`,
    highRiskSectors: highRiskNames.length > 0 ? highRiskNames : [clusters[0]?.name || 'Centro'],
    priorityActionsForACS: pt
      ? [
          'Intensificar visita domiciliar ativa nas residências com pessoas idosas (60+ anos) nos setores de alerta.',
          'Distribuir máscaras PFF2/N95 e folhetos explicativos em linguagem comunitária acessível.',
          'Orientar famílias com casos suspeitos a realizarem o auto-isolamento precoce por 7 dias.',
          'Encaminhar pacientes com oximetria abaixo de 94% diretamente à Sala de Estabilização da UBS.',
        ]
      : [
          'Intensify active household outreach for vulnerable seniors (60+ years) in high-risk zones.',
          'Distribute protective masks and easy-to-read community guidance brochures.',
          'Instruct households with positive/suspected cases to enact early 7-day home quarantine.',
          'Immediately escort patients with pulse oximetry under 94% to the nearest health clinic.',
        ],
    healthSystemLoadAdvice: pt
      ? 'Manter reserva de insumos para oxigenoterapia e ampliar horário da sala de testagem rápida de antígeno na UBS central.'
      : 'Maintain contingency oxygen delivery equipment and expand rapid antigen testing tent hours at central clinic.',
    recommendedSanitaryMeasures: pt
      ? [
          'Evitar aglomerações em espaços fechados nas microáreas com classificação Laranja/Vermelha.',
          'Higienização regular das mãos com água e sabão ou álcool em gel 70%.',
          'Uso da ferramenta DULI para checagem diária de sintomas por toda a família.',
        ]
      : [
          'Avoid enclosed crowd gatherings in orange and red designated micro-sectors.',
          'Regular hand hygiene with soap and water or 70% alcohol gel.',
          'Daily utilization of DULI community tool for family symptom check-ins.',
        ],
    generatedAt: new Date().toISOString(),
    generatedBy: 'local-agent',
  };
}
