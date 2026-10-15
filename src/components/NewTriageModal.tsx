import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Sparkles,
  Bot,
  AlertCircle,
  Thermometer,
  Activity,
  Heart,
  ShieldAlert,
} from 'lucide-react';
import { PatientTriage, AIEngineMode, AppLanguage } from '../types';
import { evaluateLocalTriage } from '../services/localAgent';
import { requestGeminiTriage } from '../services/geminiService';

interface NewTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineMode: AIEngineMode;
  language: AppLanguage;
  onSaveTriage: (triage: PatientTriage) => void;
}

export const NewTriageModal: React.FC<NewTriageModalProps> = ({
  isOpen,
  onClose,
  engineMode,
  language,
  onSaveTriage,
}) => {
  const pt = language === 'pt';

  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'M' | 'F' | 'Outro'>('F');
  const [neighborhood, setNeighborhood] = useState('Vila Esperança');
  const [phone, setPhone] = useState('(11) 98800-1122');
  const [susCard, setSusCard] = useState('898 0000 1234 5678');
  const [days, setDays] = useState(3);

  // Symptoms
  const [symptoms, setSymptoms] = useState<string[]>(['Febre', 'Tosse']);
  // Comorbidities
  const [comorbidities, setComorbidities] = useState<string[]>([]);

  // Vitals
  const [temperature, setTemperature] = useState<number>(38.2);
  const [spo2, setSpo2] = useState<number>(95);
  const [heartRate, setHeartRate] = useState<number>(92);
  const [respRate, setRespRate] = useState<number>(20);
  const [coughType, setCoughType] = useState<'seca' | 'produtiva' | 'chiado' | 'latente' | 'sem_tosse'>('seca');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const allSymptoms = pt
    ? ['Febre', 'Tosse', 'Falta de ar', 'Dor de garganta', 'Dor no peito', 'Perda de olfato', 'Perda de paladar', 'Dor no corpo', 'Fadiga extrema', 'Diarreia', 'Coriza']
    : ['Fever', 'Cough', 'Shortness of breath', 'Sore throat', 'Chest pain', 'Loss of smell', 'Loss of taste', 'Body aches', 'Extreme fatigue', 'Diarrhea', 'Runny nose'];

  const allComorbidities = pt
    ? ['Hipertensão', 'Diabetes', 'Asma / DPOC', 'Doença Cardíaca', 'Imunossuprimido', 'Obesidade', 'Gestante']
    : ['Hypertension', 'Diabetes', 'Asthma / COPD', 'Heart Disease', 'Immunosuppressed', 'Obesity', 'Pregnant'];

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const toggleComorbidity = (com: string) => {
    setComorbidities((prev) =>
      prev.includes(com) ? prev.filter((c) => c !== com) : [...prev, com]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const inputData = {
      name: name.trim() || (pt ? 'Paciente da Microárea' : 'District Patient'),
      age,
      gender,
      neighborhood,
      phone,
      susCardNumber: susCard,
      daysWithSymptoms: days,
      symptoms,
      vitals: {
        temperature,
        spo2,
        heartRate,
        respiratoryRate: respRate,
      },
      comorbidities,
      coughType,
      notes,
      language,
    };

    try {
      if (engineMode === 'gemini_flash') {
        try {
          const res = await requestGeminiTriage(inputData);
          onSaveTriage(res);
          onClose();
        } catch (apiErr: any) {
          console.warn('Gemini triage failed, falling back to local agent:', apiErr);
          const fallback = evaluateLocalTriage(inputData);
          onSaveTriage(fallback);
          onClose();
        }
      } else {
        const res = evaluateLocalTriage(inputData);
        onSaveTriage(res);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao processar triagem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {pt ? 'Novo Registro de Triagem Clínica / ACS' : 'New Clinical Triage Record'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt ? 'Ficha de campo para busca ativa e consulta de acolhimento' : 'Field triage record for active health agents'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {pt ? 'Nome Completo do Paciente' : 'Patient Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {pt ? 'Bairro / Microárea' : 'Neighborhood / Microsector'}
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Vila Esperança">Vila Esperança</option>
                <option value="Morro São José">Morro São José</option>
                <option value="Centro Histórico">Centro Histórico</option>
                <option value="Jardim América">Jardim América</option>
                <option value="Bairro das Flores">Bairro das Flores</option>
                <option value="Parque das Nações">Parque das Nações</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {pt ? 'Idade' : 'Age'}
              </label>
              <input
                type="number"
                min="0"
                max="110"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {pt ? 'Gênero' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {pt ? 'Dias c/ Sintomas' : 'Days with symptoms'}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Sinais Vitais */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {pt ? 'Sinais Vitais Coletados (Telemetria)' : 'Recorded Vital Signs'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">SpO2 (%)</label>
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  min="34"
                  max="42"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Freq. Card (bpm)</label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Freq. Resp (rpm)</label>
                <input
                  type="number"
                  min="8"
                  max="50"
                  value={respRate}
                  onChange={(e) => setRespRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Sintomas */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {pt ? 'Sintomas Apresentados' : 'Reported Symptoms'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allSymptoms.map((sym) => {
                const active = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-teal-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comorbidades */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {pt ? 'Comorbidades / Fatores de Risco' : 'Comorbidities / Risk Factors'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allComorbidities.map((com) => {
                const active = comorbidities.includes(com);
                return (
                  <button
                    key={com}
                    type="button"
                    onClick={() => toggleComorbidity(com)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {com}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              {pt ? 'Cancelar' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : engineMode === 'gemini_flash' ? (
                <Sparkles className="w-4 h-4 text-amber-300" />
              ) : (
                <Bot className="w-4 h-4 text-blue-200" />
              )}
              <span>{pt ? 'Salvar & Avaliar com IA' : 'Save & Evaluate with AI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
