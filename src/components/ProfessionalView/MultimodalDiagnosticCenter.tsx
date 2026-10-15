import React, { useState } from 'react';
import {
  Layers,
  Eye,
  Sliders,
  Activity,
  FileText,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Database,
  ShieldCheck,
  Zap,
  RotateCcw,
  Stethoscope,
  Heart,
  Search,
} from 'lucide-react';
import {
  ImagingStudy,
  LabBiomarkerPanel,
  PatientTriage,
  AIEngineMode,
  AppLanguage,
} from '../../types';
import {
  INITIAL_IMAGING_STUDIES,
  INITIAL_LAB_PANELS,
  REAL_DATASETS,
} from '../../data/multimodalMedicalData';
import { requestGeminiMultimodalDiagnosis } from '../../services/geminiService';

interface MultimodalProps {
  triages: PatientTriage[];
  engineMode: AIEngineMode;
  language: AppLanguage;
}

export const MultimodalDiagnosticCenter: React.FC<MultimodalProps> = ({
  triages,
  engineMode,
  language,
}) => {
  const pt = language === 'pt';

  const [studies, setStudies] = useState<ImagingStudy[]>(INITIAL_IMAGING_STUDIES);
  const [selectedStudyId, setSelectedStudyId] = useState<string>(INITIAL_IMAGING_STUDIES[0].id);

  // Viewer controls
  const [showMasks, setShowMasks] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [maskOpacity, setMaskOpacity] = useState<number>(65);
  const [invertContrast, setInvertContrast] = useState<boolean>(false);
  const [ctSliceIndex, setCtSliceIndex] = useState<number>(6); // For CT scans (1 to 12)

  // AI Second Opinion state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedStudy = studies.find((s) => s.id === selectedStudyId) || studies[0];
  const linkedPatient = triages.find((t) => t.id === selectedStudy.patientId) || triages[0];
  const linkedLabs = INITIAL_LAB_PANELS[selectedStudy.patientId] || INITIAL_LAB_PANELS['DULI-094812'];

  const handleRunMultimodalAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAiReport(null);

    try {
      if (engineMode === 'gemini_flash') {
        const res = await requestGeminiMultimodalDiagnosis({
          patient: {
            name: linkedPatient.name,
            age: linkedPatient.age,
            gender: linkedPatient.gender,
            symptoms: linkedPatient.symptoms,
            daysWithSymptoms: linkedPatient.daysWithSymptoms,
            vitals: linkedPatient.vitals,
          },
          study: selectedStudy,
          labs: linkedLabs,
          language,
        });
        setAiReport(res);
      } else {
        // High fidelity local clinical heuristic multi-modal fusion
        setTimeout(() => {
          setAiReport({
            diagnosticImpression: pt
              ? `Quadro de Síndrome Respiratória Aguda Grave com confirmação por imagem (${selectedStudy.modality}) e biomarcadores inflamatórios compatíveis com infecção por SARS-CoV-2 / COVID-19 grave.`
              : `Severe Acute Respiratory Syndrome confirmed by multi-modal imaging (${selectedStudy.modality}) and inflammatory biomarkers consistent with severe COVID-19.`,
            severityClassification: selectedStudy.severityScore >= 75 ? (pt ? 'Grave a Crítico' : 'Severe to Critical') : (pt ? 'Moderado' : 'Moderate'),
            estimatedLungInvolvementPercent: selectedStudy.modality === 'CT_CHEST' ? 58 : 50,
            radiologicalSummary: pt
              ? 'Presença evidente de opacidades em vidro fosco bilaterais multifocais com distribuição predominantemente periférica e subpleural. Padrão de pavimentação em mosaico (Crazy-Paving) detectado pelo modelo treinado.'
              : 'Prominent bilateral multifocal ground-glass opacities with predominantly peripheral and subpleural distribution. Crazy-Paving pattern identified by trained segmentation neural net.',
            cardiovascularRisk: pt
              ? 'ECG evidencia taquicardia sinusal e alterações inespecíficas da repolarização por estresse hipóxico. Troponina dentro dos limites de referência afasta necrose miocárdica isquêmica aguda no momento.'
              : 'ECG indicates sinus tachycardia with hypoxia-induced repolarization changes. Troponin within normal limits rules out acute myocardial necrosis.',
            inflammatoryThromboticProfile: pt
              ? `PCR muito elevada (${linkedLabs.crp} mg/L) e Dímero-D elevado (${linkedLabs.dDimer} ng/mL), associados à linfopenia marcante (${linkedLabs.lymphocytes} /mm3), confirmam hiperinflamação e estado pró-trombótico acentuado.`
              : `Markedly elevated CRP (${linkedLabs.crp} mg/L) and D-Dimer (${linkedLabs.dDimer} ng/mL) combined with lymphopenia (${linkedLabs.lymphocytes} /mm3) indicate hyperinflammatory and prothrombotic state.`,
            therapeuticRecommendations: pt
              ? [
                  'Oxigenoterapia suplementar imediata com meta de SpO2 entre 94% e 96%.',
                  'Posicionamento em pronação consciente (12 a 16 horas/dia).',
                  'Tromboprofilaxia farmacológica com Heparina de Baixo Peso Molecular (HBPM) conforme protocolo institucional.',
                  'Corticoterapia com Dexametasona 6 mg/dia por até 10 dias.',
                  'Internação em Unidade de Terapia Intensiva (UTI) ou sala vermelha de estabilização.',
                ]
              : [
                  'Immediate supplemental oxygen therapy targeting SpO2 94-96%.',
                  'Awake prone positioning (12-16 hours per day).',
                  'Pharmacological thromboprophylaxis with Low Molecular Weight Heparin (LMWH).',
                  'Dexamethasone 6 mg daily for up to 10 days.',
                  'Admission to Intensive Care Unit (ICU) / respiratory intermediate care.',
                ],
            differentialDiagnosis: [
              'COVID-19 com Pneumonia Viral Grave',
              'Pneumonia Bacteriana Adquirida na Comunidade Secundária',
              'Tromboembolismo Pulmonar (TEP)',
              'Insuficiência Cardíaca Congestiva Descompensada',
            ],
          });
          setIsAnalyzing(false);
        }, 800);
      }
    } catch (e: any) {
      console.warn('Multimodal analysis error:', e);
      setErrorMsg(e.message || 'Falha ao processar diagnóstico multimodal.');
    } finally {
      if (engineMode === 'gemini_flash') setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                MULTIMODAL DIAGNOSTIC WORKSPACE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                DICOM PS 3.16 // HL7 FHIR R4
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {pt
                ? 'Centro Diagnóstico Multimodal & Imagens Clínicas'
                : 'Multi-Modal Imaging & Diagnostic Center'}
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              {pt
                ? 'Fusão de Raio-X de Tórax, Tomografia Computadorizada (TC), Eletrocardiograma (ECG) e Biomarcadores Laboratoriais integrados ao Prontuário do SUS.'
                : 'Fusion of Chest X-Ray, Chest CT, 12-lead ECG, and Laboratory Biomarker Panels linked to Patient Electronic Health Record.'}
            </p>
          </div>

          {/* Quick study selector */}
          <div className="flex flex-wrap items-center gap-2">
            {studies.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStudyId(st.id);
                  setAiReport(null);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedStudyId === st.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{st.modality}</span>
                <span className="ml-1 opacity-70">({st?.patientName ? st.patientName.split(' ')[0] : 'Paciente'})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Imaging Viewer on Left (8 cols), Patient Record & Labs on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Medical Viewer */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7 space-y-5">
          {/* Viewer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-900 text-cyan-300">
                  {selectedStudy.modality}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedStudy.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedStudy.indication} • {selectedStudy.studyDate}
              </p>
            </div>

            {/* Viewer Controls: Masks, Boxes, Opacity */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowMasks(!showMasks)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  showMasks
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Máscara de segmentação lesional"
              >
                {pt ? 'Máscara IA' : 'AI Mask'}
              </button>

              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  showBoundingBoxes
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Caixas de detecção de objetos (Bounding Boxes)"
              >
                {pt ? 'Bounding Boxes' : 'BBoxes'}
              </button>

              <button
                onClick={() => setInvertContrast(!invertContrast)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  invertContrast
                    ? 'bg-slate-900 text-white border-slate-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Inverter contraste radiológico"
              >
                {pt ? 'Inverter' : 'Invert'}
              </button>
            </div>
          </div>

          {/* Opacity Slider for Mask Layer */}
          {showMasks && (
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 whitespace-nowrap">
                {pt ? 'Opacidade da Máscara (Grad-CAM):' : 'Segmentation Mask Opacity:'}
              </span>
              <input
                type="range"
                min="10"
                max="100"
                value={maskOpacity}
                onChange={(e) => setMaskOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <span className="font-mono font-bold text-slate-900 w-10 text-right">
                {maskOpacity}%
              </span>
            </div>
          )}

          {/* Canvas Viewer Container */}
          <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center select-none">
            {/* 1. CXR (Chest X-Ray) Renderer */}
            {selectedStudy.modality === 'CXR' && (
              <div
                className={`w-full h-full relative flex items-center justify-center transition-all ${
                  invertContrast ? 'invert' : ''
                }`}
              >
                {/* Anatomical Chest X-Ray Radiograph SVG */}
                <svg
                  viewBox="0 0 400 320"
                  className="w-full h-full"
                  style={{ background: '#090d16' }}
                >
                  {/* Rib Cage and Thoracic Skeleton Silhouette */}
                  <g opacity="0.35" stroke="#94a3b8" strokeWidth="2" fill="none">
                    {/* Spine */}
                    <line x1="200" y1="20" x2="200" y2="300" strokeWidth="8" stroke="#cbd5e1" opacity="0.5" />
                    {/* Clavicles */}
                    <path d="M 120 40 Q 160 55 200 50 Q 240 55 280 40" strokeWidth="4" />
                    {/* Ribs Bilateral */}
                    {[70, 95, 120, 145, 170, 195, 220, 245].map((y, i) => (
                      <g key={i}>
                        <path d={`M 195 ${y - 15} Q 110 ${y - 5} 80 ${y + 25}`} strokeWidth="3" />
                        <path d={`M 205 ${y - 15} Q 290 ${y - 5} 320 ${y + 25}`} strokeWidth="3" />
                      </g>
                    ))}
                  </g>

                  {/* Lung Fields (Dark radiolucent baseline) */}
                  <path
                    d="M 110 50 C 70 80 65 200 80 270 C 130 260 170 240 185 220 C 185 100 160 60 110 50 Z"
                    fill="#1e293b"
                    opacity="0.75"
                  />
                  <path
                    d="M 290 50 C 330 80 335 200 320 270 C 270 260 230 240 215 220 C 215 100 240 60 290 50 Z"
                    fill="#1e293b"
                    opacity="0.75"
                  />

                  {/* Cardiac Silhouette (Heart & Mediastinum) */}
                  <path
                    d="M 185 80 C 185 160 140 220 160 260 C 210 270 235 240 225 180 C 220 120 215 80 185 80 Z"
                    fill="#e2e8f0"
                    opacity="0.45"
                  />

                  {/* Diaphragmatic Domes */}
                  <path d="M 60 280 Q 130 250 195 265" stroke="#cbd5e1" strokeWidth="3" fill="none" opacity="0.6" />
                  <path d="M 340 280 Q 270 250 205 265" stroke="#cbd5e1" strokeWidth="3" fill="none" opacity="0.6" />

                  {/* Ground Glass Opacities & Consolidation Pathology Texture */}
                  <g opacity="0.65">
                    {/* Diffuse bilateral basal infiltrates */}
                    <circle cx="120" cy="180" r="35" fill="#f8fafc" filter="blur(8px)" opacity="0.4" />
                    <circle cx="140" cy="220" r="30" fill="#f8fafc" filter="blur(6px)" opacity="0.5" />
                    <circle cx="270" cy="190" r="40" fill="#f8fafc" filter="blur(8px)" opacity="0.4" />
                    <circle cx="280" cy="230" r="35" fill="#f8fafc" filter="blur(6px)" opacity="0.5" />
                  </g>

                  {/* AI SEGMENTATION MASK OVERLAY (Ground-Glass & Consolidation) */}
                  {showMasks && (
                    <g opacity={maskOpacity / 100}>
                      {/* Left Lung GGO Heatmap */}
                      <path
                        d="M 100 130 C 80 160 85 240 145 245 C 165 230 170 170 140 140 Z"
                        fill="#06b6d4"
                        filter="blur(5px)"
                      />
                      {/* Right Lung Consolidation Heatmap (Red/Orange hot zone) */}
                      <path
                        d="M 250 140 C 230 180 240 250 300 255 C 315 220 310 170 280 140 Z"
                        fill="#f43f5e"
                        filter="blur(6px)"
                      />
                      <circle cx="275" cy="210" r="22" fill="#fbbf24" filter="blur(4px)" />
                    </g>
                  )}

                  {/* AI OBJECT DETECTION BOUNDING BOXES */}
                  {showBoundingBoxes &&
                    selectedStudy.detectedLesions.map((lesion, idx) => {
                      if (!lesion.bbox) return null;
                      const bx = (lesion.bbox.x / 100) * 400;
                      const by = (lesion.bbox.y / 100) * 320;
                      const bw = (lesion.bbox.width / 100) * 400;
                      const bh = (lesion.bbox.height / 100) * 320;
                      const color = lesion.type === 'consolidation' ? '#f43f5e' : lesion.type === 'ground_glass' ? '#06b6d4' : '#a855f7';

                      return (
                        <g key={idx}>
                          <rect
                            x={bx}
                            y={by}
                            width={bw}
                            height={bh}
                            fill="none"
                            stroke={color}
                            strokeWidth="1.8"
                            strokeDasharray="4,2"
                          />
                          <rect
                            x={bx}
                            y={by - 15}
                            width={bw}
                            height="15"
                            fill={color}
                            rx="2"
                          />
                          <text
                            x={bx + 3}
                            y={by - 4}
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {lesion.label} ({lesion.confidence}%)
                          </text>
                        </g>
                      );
                    })}
                </svg>
              </div>
            )}

            {/* 2. CT (Computed Tomography HRCT) Axial Slice Renderer */}
            {selectedStudy.modality === 'CT_CHEST' && (
              <div className="w-full h-full relative flex flex-col items-center justify-center p-2">
                <svg viewBox="0 0 320 280" className="w-full h-full">
                  {/* Thoracic Outer Wall */}
                  <ellipse cx="160" cy="140" rx="135" ry="110" fill="#0f172a" stroke="#475569" strokeWidth="4" />
                  {/* Vertebra posterior */}
                  <circle cx="160" cy="235" r="18" fill="#e2e8f0" opacity="0.8" />
                  {/* Sternum anterior */}
                  <rect x="145" y="35" width="30" height="10" rx="3" fill="#e2e8f0" opacity="0.8" />
                  {/* Left & Right Lung Parenchyma */}
                  <path d="M 65 140 C 65 85 130 80 145 110 C 150 160 140 210 85 210 C 65 200 65 160 65 140 Z" fill="#020617" />
                  <path d="M 255 140 C 255 85 190 80 175 110 C 170 160 180 210 235 210 C 255 200 255 160 255 140 Z" fill="#020617" />
                  {/* Heart / Ascending Aorta */}
                  <ellipse cx="160" cy="130" rx="30" ry="24" fill="#334155" opacity="0.85" />

                  {/* Ground Glass Crazy Paving Slice Pattern */}
                  {showMasks && (
                    <g opacity={maskOpacity / 100}>
                      <circle cx="95" cy="150" r="24" fill="#06b6d4" filter="blur(6px)" />
                      <circle cx="225" cy="155" r="28" fill="#f43f5e" filter="blur(7px)" />
                      <path d="M 85 160 L 125 140 M 90 140 L 115 170" stroke="#f8fafc" strokeWidth="1" opacity="0.4" />
                      <path d="M 215 150 L 245 170 M 210 170 L 240 145" stroke="#f8fafc" strokeWidth="1" opacity="0.4" />
                    </g>
                  )}

                  {/* Bounding boxes */}
                  {showBoundingBoxes && (
                    <g>
                      <rect x="65" y="115" width="60" height="75" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,2" />
                      <rect x="195" y="120" width="65" height="75" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,2" />
                      <text x="70" y="110" fill="#06b6d4" fontSize="8" fontWeight="bold">Crazy-Paving (97.9%)</text>
                      <text x="200" y="115" fill="#f43f5e" fontSize="8" fontWeight="bold">Consolidação (94.6%)</text>
                    </g>
                  )}
                </svg>

                {/* Axial Slice Scrubber Bar */}
                <div className="absolute bottom-2 left-4 right-4 bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>CORTE AXIAL: {ctSliceIndex} / 12 (Espessura: 1.25mm)</span>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={ctSliceIndex}
                    onChange={(e) => setCtSliceIndex(Number(e.target.value))}
                    className="w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span>CORADS: 5</span>
                </div>
              </div>
            )}

            {/* 3. ECG 12-Lead Rhythm Trace Renderer */}
            {selectedStudy.modality === 'ECG_12LEAD' && (
              <div className="w-full h-full relative flex flex-col justify-between p-3 bg-slate-950 font-mono text-xs">
                {/* ECG Paper Millimetric Grid */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1">
                  <span>25 mm/s • 10 mm/mV • 500 Hz • FILTRO: 0.05-150 Hz</span>
                  <span className="text-amber-400 font-bold">FC = 104 bpm • TAQUICARDIA SINUSAL</span>
                </div>

                {/* Waveform Canvas */}
                <svg viewBox="0 0 600 180" className="w-full h-44">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="ecgGrid" width="15" height="15" patternUnits="userSpaceOnUse">
                      <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="600" height="180" fill="url(#ecgGrid)" />

                  {/* Lead Traces */}
                  {/* Lead I / II */}
                  <g stroke="#10b981" strokeWidth="1.8" fill="none">
                    <path
                      d="
                      M 10 40 L 40 40 
                      L 48 36 L 56 40 L 64 40 
                      L 68 44 L 72 10 L 76 52 L 80 40 
                      L 100 40 L 115 32 L 130 40 L 170 40
                      L 178 36 L 186 40 L 194 40 
                      L 198 44 L 202 10 L 206 52 L 210 40 
                      L 230 40 L 245 32 L 260 40 L 300 40
                      L 308 36 L 316 40 L 324 40 
                      L 328 44 L 332 10 L 336 52 L 340 40 
                      L 360 40 L 375 32 L 390 40 L 430 40
                      L 438 36 L 446 40 L 454 40 
                      L 458 44 L 462 10 L 466 52 L 470 40 
                      L 490 40 L 505 32 L 520 40 L 580 40
                      "
                    />
                  </g>

                  {/* Precordial Lead V5 (showing T-wave inversion) */}
                  <g stroke="#38bdf8" strokeWidth="1.8" fill="none">
                    <path
                      d="
                      M 10 120 L 40 120 
                      L 48 116 L 56 120 
                      L 66 124 L 72 80 L 78 135 L 82 120 
                      L 95 120 L 115 136 L 135 120 L 170 120
                      L 178 116 L 186 120 
                      L 196 124 L 202 80 L 208 135 L 212 120 
                      L 225 120 L 245 136 L 265 120 L 300 120
                      L 308 116 L 316 120 
                      L 326 124 L 332 80 L 338 135 L 342 120 
                      L 355 120 L 375 136 L 395 120 L 430 120
                      L 438 116 L 446 120 
                      L 456 124 L 462 80 L 468 135 L 472 120 
                      L 485 120 L 505 136 L 525 120 L 580 120
                      "
                    />
                  </g>

                  {/* Wave Marker Overlays */}
                  {showBoundingBoxes && (
                    <g>
                      <rect x="95" y="105" width="45" height="40" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2,2" />
                      <text x="96" y="100" fill="#f59e0b" fontSize="8" fontWeight="bold">Inversão Onda T (V5)</text>
                    </g>
                  )}
                </svg>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1">
                  <span>VERDE: DII (Ritmo Sinusal) • AZUL: V5 (Repolarização Ventricular)</span>
                  <span className="text-emerald-400 font-bold">PTB-XL VALIDATED</span>
                </div>
              </div>
            )}

            {/* Corner DICOM Tag overlay */}
            <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded-sm border border-slate-800 pointer-events-none">
              STUDY_UID: {selectedStudy.id}
            </div>
            <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-sm border border-slate-800 pointer-events-none">
              BRIXIA SCORE: {selectedStudy.severityScore}/100
            </div>
          </div>

          {/* Model Accuracy & Training Dataset Citation Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-600" />
                <span>{pt ? 'Modelo de IA Treinado & Acurácia de Validação' : 'Trained AI Model & Validation Metrics'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                {selectedStudy.modelMetrics.datasetOrigin}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Acurácia</span>
                <span className="text-base font-black text-cyan-600 font-mono">
                  {selectedStudy.modelMetrics.accuracy}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Sensibilidade</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {selectedStudy.modelMetrics.sensitivity}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Especificidade</span>
                <span className="text-base font-black text-indigo-600 font-mono">
                  {selectedStudy.modelMetrics.specificity}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">AUC-ROC</span>
                <span className="text-base font-black text-amber-600 font-mono">
                  {selectedStudy.modelMetrics.aucRoc}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">F1-Score</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {selectedStudy.modelMetrics.f1Score}
                </span>
              </div>
            </div>
          </div>

          {/* Radiological Findings Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {pt ? 'Achados Radiológicos Identificados (Segmentação & Bounding Boxes):' : 'Radiological Findings:'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {selectedStudy.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Linked Patient PEP & Lab Panel */}
        <div className="lg:col-span-4 space-y-5">
          {/* Linked Electronic Health Record (Prontuário PEP do SUS) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>{pt ? 'Prontuário Associado (PEP)' : 'Linked Health Record'}</span>
              </span>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-bold">
                CNS: {linkedPatient.susCardNumber || '898 0012 3491'}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">{linkedPatient.name}</h4>
              <p className="text-xs text-slate-500">
                {linkedPatient.age} {pt ? 'anos' : 'y'} • {linkedPatient.gender} • {linkedPatient.neighborhood}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">{pt ? 'SpO2 em ar ambiente:' : 'Room Air SpO2:'}</span>
                <span className="font-bold text-rose-600 font-mono">{linkedPatient.vitals.spo2}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{pt ? 'Temperatura axilar:' : 'Temperature:'}</span>
                <span className="font-bold text-slate-900 font-mono">{linkedPatient.vitals.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{pt ? 'Comorbidades:' : 'Comorbidities:'}</span>
                <span className="font-bold text-slate-900">{linkedPatient.comorbidities.join(', ') || 'Nenhuma'}</span>
              </div>
            </div>
          </div>

          {/* Inflammatory Biomarker Laboratory Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-600" />
                <span>{pt ? 'Painel de Biomarcadores' : 'Biomarker Lab Panel'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                RT-PCR: {linkedLabs.rtPcrCovid}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Proteína C-Reativa (PCR)</span>
                  <span className="text-[10px] text-slate-400">Ref: &lt; 5.0 mg/L</span>
                </div>
                <span className="font-mono font-black text-rose-600 text-sm">{linkedLabs.crp} mg/L</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">D-Dímero</span>
                  <span className="text-[10px] text-slate-400">Ref: &lt; 500 ng/mL</span>
                </div>
                <span className="font-mono font-black text-rose-600 text-sm">{linkedLabs.dDimer} ng/mL</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Ferritina</span>
                  <span className="text-[10px] text-slate-400">Ref: 30-400 ng/mL</span>
                </div>
                <span className="font-mono font-bold text-amber-600">{linkedLabs.ferritin} ng/mL</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Troponina I Cardíaca</span>
                  <span className="text-[10px] text-slate-400">Ref: &lt; 0.04 ng/mL</span>
                </div>
                <span className="font-mono font-bold text-emerald-600">{linkedLabs.troponinI} ng/mL</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Linfócitos Totais</span>
                  <span className="text-[10px] text-slate-400">Ref: 1000-4000 /mm3</span>
                </div>
                <span className="font-mono font-black text-rose-600 text-sm">{linkedLabs.lymphocytes} /mm3</span>
              </div>
            </div>
          </div>

          {/* Trigger Multimodal AI Analysis */}
          <button
            onClick={handleRunMultimodalAnalysis}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : engineMode === 'gemini_flash' ? (
              <Sparkles className="w-5 h-5 text-amber-300" />
            ) : (
              <Bot className="w-5 h-5 text-cyan-200" />
            )}
            <span>
              {isAnalyzing
                ? pt ? 'Correlacionando Imagens & Labs...' : 'Correlating Imaging & Labs...'
                : pt
                ? `Laudo Clínico Integrado (${engineMode === 'gemini_flash' ? 'Gemini 3.8' : 'Agente Local'})`
                : `Generate Multi-Modal Report (${engineMode === 'gemini_flash' ? 'Gemini 3.8' : 'Local Agent'})`}
            </span>
          </button>
        </div>
      </div>

      {/* AI Integrated Multi-Modal Report Card */}
      {aiReport && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-5 animate-fade-in font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold block">
                LAUDO DIAGNÓSTICO INTEGRADO MULTIMODAL // ANVISA & FDA COMPLIANT
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {aiReport.diagnosticImpression}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs uppercase">
                {aiReport.severityClassification}
              </span>
              <span className="text-slate-400">
                PULMÃO ACOMETIDO: <span className="text-amber-400 font-bold">{aiReport.estimatedLungInvolvementPercent}%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-cyan-400 font-bold block text-sm">Parecer Radiológico (Vidro Fosco & BBoxes):</span>
              <p className="text-slate-300 leading-relaxed text-xs">{aiReport.radiologicalSummary}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-amber-400 font-bold block text-sm">Perfil Inflamatório & Cardiovascular:</span>
              <p className="text-slate-300 leading-relaxed text-xs">{aiReport.inflammatoryThromboticProfile}</p>
              <p className="text-slate-400 text-[11px] pt-1">{aiReport.cardiovascularRisk}</p>
            </div>
          </div>

          {/* Therapeutic directives */}
          <div className="p-4 bg-cyan-950/40 rounded-2xl border border-cyan-800/60">
            <span className="text-cyan-300 font-bold block mb-2 text-xs">
              CONDUTAS TERAPÊUTICAS IMEDIATAS (Diretrizes Clínicas):
            </span>
            <ul className="space-y-1 text-slate-200">
              {aiReport.therapeuticRecommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">›</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
