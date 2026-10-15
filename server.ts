import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Health / Capabilities Check
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    model: 'gemini-3.8-flash',
    localAgentAvailable: true,
    serverTime: new Date().toISOString(),
  });
});

// API: Clinical AI Triage Assessment (DULI / COVID-19 Detect II hybrid)
app.post('/api/gemini/triage', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please use Local Agent mode or configure your API key.',
      });
    }

    const {
      name,
      age,
      gender,
      symptoms = [],
      vitals = {},
      comorbidities = [],
      daysWithSymptoms = 1,
      coughCharacteristics = '',
      notes = '',
      language = 'pt',
    } = req.body;

    const prompt = `
You are a senior physician and epidemiologist triaging a patient for respiratory infection (including COVID-19, Influenza, and viral acute respiratory infections), aligned with WHO and Brazilian SUS / Protocolo de Manchester guidelines.

Patient Data:
- Name/Identifier: ${name || 'Anônimo'}
- Age: ${age || 'Não informado'}
- Gender: ${gender || 'Não informado'}
- Days with symptoms: ${daysWithSymptoms}
- Reported symptoms: ${symptoms.join(', ') || 'Nenhum sintoma explícito marcado'}
- Vitals: SpO2 ${vitals.spo2 ?? 'N/A'}%, Temp ${vitals.temperature ?? 'N/A'}°C, Heart Rate ${vitals.heartRate ?? 'N/A'} bpm, Respiratory Rate ${vitals.respiratoryRate ?? 'N/A'} rpm
- Comorbidities/Risk factors: ${comorbidities.join(', ') || 'Nenhum'}
- Cough characteristics / acoustic notes: ${coughCharacteristics || 'Nenhum registro específico'}
- Patient/Family Notes: ${notes || 'Nenhuma'}

Generate a structured clinical assessment in ${language === 'pt' ? 'Portuguese (PT-BR)' : 'English'}.
Strictly follow the JSON schema provided.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an AI Clinical Triage System for community healthcare surveillance (DULI COVID-19 & Detect II platform). Provide balanced, clinically sound triage recommendations. Always indicate that this is decision support and not a substitute for in-person emergency medical care if alarm signs exist.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triageLevel: {
              type: Type.STRING,
              description: 'Triage severity: "low", "moderate", "high", or "critical"',
            },
            colorCode: {
              type: Type.STRING,
              description: 'Manchester/SUS color: "green", "yellow", "orange", or "red"',
            },
            score: {
              type: Type.NUMBER,
              description: 'Calculated clinical severity score between 0 and 100',
            },
            summary: {
              type: Type.STRING,
              description: 'Short 2-3 sentence executive summary for the patient or community health agent (ACS)',
            },
            simpleGuidanceForFamily: {
              type: Type.STRING,
              description: 'Ultra simple, child/family-friendly instructions on what to do right now (e.g., rest, hydration, mask, isolate, or seek clinic)',
            },
            clinicalRationale: {
              type: Type.STRING,
              description: 'Technical clinical rationale for health professionals and doctors',
            },
            redFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific warning signs that warrant immediate emergency room visit (e.g. SpO2 < 93%, cyanosis, severe chest pain)',
            },
            differentialDiagnosis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top probable conditions (e.g., COVID-19, Influenza A/B, Rhinovirus, Bronchitis)',
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Recommended next step: Home Isolation, Schedule UBS appointment, Telemedicine, or Immediate ER (UPA/Pronto-Socorro)',
            },
            isolationDaysRecommended: {
              type: Type.NUMBER,
              description: 'Recommended isolation period in days (e.g., 5 to 10)',
            },
            emergencyDispatchRecommended: {
              type: Type.BOOLEAN,
              description: 'True if immediate ambulance or emergency attention is needed',
            },
          },
          required: [
            'triageLevel',
            'colorCode',
            'score',
            'summary',
            'simpleGuidanceForFamily',
            'clinicalRationale',
            'redFlags',
            'recommendedAction',
            'emergencyDispatchRecommended',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      engine: 'gemini-3.8-flash',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/triage:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao processar triagem com Gemini AI.',
    });
  }
});

// API: Epidemiological Surveillance & Local Health Community Cluster Analysis (ACS & Health Gestors)
app.post('/api/gemini/epidemic-report', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const {
      regionName = 'Comunidade Local / Bairro',
      totalPopulation = 25000,
      activeCases = 142,
      suspectedCases = 89,
      recoveredCases = 820,
      severeCases = 14,
      hospitalizedCases = 6,
      neighborhoods = [],
      language = 'pt',
    } = req.body;

    const prompt = `
You are the Chief Epidemiologist for a municipal Health Surveillance Center (DULI Vigilância Epidemiológica).
Analyze the local health indicators for "${regionName}":

- Total Population: ${totalPopulation}
- Active Confirmed Cases: ${activeCases}
- Suspected Cases Pending Triage: ${suspectedCases}
- Recovered Cases: ${recoveredCases}
- Severe / High Risk: ${severeCases}
- Hospitalized / ICU: ${hospitalizedCases}
- Neighborhood Clusters / Sectors:
${JSON.stringify(neighborhoods, null, 2)}

Provide an actionable, strategic epidemiological bulletin in ${language === 'pt' ? 'Portuguese (PT-BR)' : 'English'}.
Strictly follow the JSON schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert epidemiological surveillance analyst assisting community health teams and municipal secretaries.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            epidemicPhase: {
              type: Type.STRING,
              description: 'Current phase: "Contained", "Localized Outbreak", "Accelerated Community Transmission", or "Slowing Down"',
            },
            estimatedRt: {
              type: Type.NUMBER,
              description: 'Estimated effective reproduction number R(t)',
            },
            alertLevel: {
              type: Type.STRING,
              description: 'Community alert level: "Verde", "Amarelo", "Laranja", or "Vermelho"',
            },
            executiveSummary: {
              type: Type.STRING,
              description: 'Executive briefing for public health coordinators and Community Health Agents (ACS)',
            },
            highRiskSectors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Neighborhoods or sectors requiring immediate active search or sanitary barrier',
            },
            priorityActionsForACS: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 4-5 concrete field actions for Community Health Agents',
            },
            healthSystemLoadAdvice: {
              type: Type.STRING,
              description: 'Recommendations for UBS clinics, testing stations, and bed capacity',
            },
            recommendedSanitaryMeasures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Civic and public health guidance for citizens and schools',
            },
          },
          required: [
            'epidemicPhase',
            'estimatedRt',
            'alertLevel',
            'executiveSummary',
            'highRiskSectors',
            'priorityActionsForACS',
            'healthSystemLoadAdvice',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      engine: 'gemini-3.8-flash',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/epidemic-report:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao gerar relatório epidemiológico.',
    });
  }
});

// API: Acoustic & Pattern Cough Analysis (inspired by COVID-19 Detect II)
app.post('/api/gemini/cough-analysis', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const {
      audioFeatures = {},
      coughType = 'seca',
      frequency = 'frequente',
      hasDyspnea = false,
      durationDays = 3,
      accompaniedByWheeze = false,
      language = 'pt',
    } = req.body;

    const prompt = `
Analyze the respiratory acoustic profile and symptom telemetry inspired by AI acoustic triage systems (COVID-19 Detect II):

- Cough Type: ${coughType} (dry, productive, barking, spasmodic)
- Frequency: ${frequency}
- Associated Dyspnea / Shortness of breath: ${hasDyspnea ? 'Yes' : 'No'}
- Duration: ${durationDays} days
- Wheezing / Stridor: ${accompaniedByWheeze ? 'Yes' : 'No'}
- Acoustic telemetry features: ${JSON.stringify(audioFeatures)}

Analyze the respiratory acoustic signature in ${language === 'pt' ? 'Portuguese (PT-BR)' : 'English'}.
Strictly follow the JSON schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coughClassification: {
              type: Type.STRING,
              description: 'E.g., "Tosse Seca Irritativa com padrão broncopulmonar viral"',
            },
            covid19CorrelationProbability: {
              type: Type.NUMBER,
              description: 'Probability percentage 0 to 100',
            },
            airwayInvolvement: {
              type: Type.STRING,
              description: 'Upper airway, Lower airway, or Mixed',
            },
            biomarkerInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key acoustic and clinical markers observed',
            },
            telemetrySummary: {
              type: Type.STRING,
              description: 'Summary explanation for patient and medical team',
            },
            urgentAuscultationNeeded: {
              type: Type.BOOLEAN,
              description: 'Whether immediate physical lung auscultation is required',
            },
          },
          required: [
            'coughClassification',
            'covid19CorrelationProbability',
            'airwayInvolvement',
            'biomarkerInsights',
            'telemetrySummary',
            'urgentAuscultationNeeded',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      engine: 'gemini-3.8-flash',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/cough-analysis:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao analisar padrão de tosse.',
    });
  }
});

// API: Multi-Modal Imaging (CXR, CT, ECG) & Lab Panel Clinical Second Opinion
app.post('/api/gemini/multimodal-diagnosis', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const {
      patient = {},
      study = {},
      labs = {},
      language = 'pt',
    } = req.body;

    const prompt = `
You are a senior board-certified Radiologist, Cardiologist, and Critical Care Specialist reviewing a multi-modal diagnostic workup (Chest X-Ray, Chest CT, and 12-lead ECG) alongside inflammatory biomarkers (C-Reactive Protein, D-Dimer, Ferritin, Troponin, Lymphocyte count).

Patient Record:
- Name: ${patient.name || 'Anônimo'}
- Age: ${patient.age} years old, Gender: ${patient.gender}
- Suspected Diagnosis: Respiratory Infection / COVID-19 / ARDS
- Days of symptoms: ${patient.daysWithSymptoms || 'N/A'}
- Reported symptoms: ${(patient.symptoms || []).join(', ')}
- Vitals: SpO2 ${patient.vitals?.spo2 ?? 'N/A'}%, Temp ${patient.vitals?.temperature ?? 'N/A'}°C, FC ${patient.vitals?.heartRate ?? 'N/A'} bpm, FR ${patient.vitals?.respiratoryRate ?? 'N/A'} rpm

Imaging Study:
- Modality: ${study.modality} (${study.title})
- Indication: ${study.indication}
- Radiological findings: ${(study.findings || []).join('; ')}
- Detected lesions / Ground-Glass Opacities: ${JSON.stringify(study.detectedLesions || [])}
- AI Severity Score: ${study.severityScore}/100

Laboratory Biomarker Panel:
- PCR: ${labs.crp ?? 'N/A'} mg/L (Normal < 5.0)
- D-Dímero: ${labs.dDimer ?? 'N/A'} ng/mL (Normal < 500)
- Ferritina: ${labs.ferritin ?? 'N/A'} ng/mL (Normal 30-400)
- Troponina I: ${labs.troponinI ?? 'N/A'} ng/mL (Normal < 0.04)
- Linfócitos: ${labs.lymphocytes ?? 'N/A'} /mm3 (Normal 1000-4000)
- Leucócitos: ${labs.leukocytes ?? 'N/A'} /mm3
- RT-PCR COVID-19: ${labs.rtPcrCovid ?? 'N/A'}

Provide a rigorous, evidence-based second opinion medical report in ${language === 'pt' ? 'Portuguese (PT-BR)' : 'English'}.
Strictly adhere to the JSON schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert multi-modal clinical diagnostic AI assistant integrating radiology (CXR, CT), cardiology (ECG), and laboratory hematology/inflammatory panels under international clinical practice guidelines.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosticImpression: {
              type: Type.STRING,
              description: 'Executive diagnostic impression synthesizing imaging and labs',
            },
            severityClassification: {
              type: Type.STRING,
              description: '"Leve", "Moderado", "Grave" ou "Crítico"',
            },
            estimatedLungInvolvementPercent: {
              type: Type.NUMBER,
              description: 'Estimated percentage of pulmonary parenchyma affected (0 to 100)',
            },
            radiologicalSummary: {
              type: Type.STRING,
              description: 'Detailed analysis of ground-glass opacities, crazy-paving, and consolidations',
            },
            cardiovascularRisk: {
              type: Type.STRING,
              description: 'ECG interpretation, troponin correlation, and thrombotic/myocarditis risk assessment',
            },
            inflammatoryThromboticProfile: {
              type: Type.STRING,
              description: 'Interpretation of CRP, D-Dimer, and lymphopenia relative to hyperinflammation / cytokine release',
            },
            therapeuticRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of immediate evidence-based clinical interventions (e.g. prone positioning, O2 therapy, anticoagulation, dexamethasone)',
            },
            differentialDiagnosis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Differential diagnoses list',
            },
          },
          required: [
            'diagnosticImpression',
            'severityClassification',
            'estimatedLungInvolvementPercent',
            'radiologicalSummary',
            'cardiovascularRisk',
            'inflammatoryThromboticProfile',
            'therapeuticRecommendations',
            'differentialDiagnosis',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      engine: 'gemini-3.8-flash',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/multimodal-diagnosis:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao processar diagnóstico multimodal.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DULI Health Platform running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
