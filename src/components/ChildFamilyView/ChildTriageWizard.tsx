import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Thermometer,
  Heart,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Smile,
} from 'lucide-react';
import { BodyAvatarSelector } from './BodyAvatarSelector';
import { AudioVisualizer } from '../AudioVisualizer';
import { FriendlyResultCard } from './FriendlyResultCard';
import { PatientTriage, AIEngineMode, AppLanguage } from '../../types';
import { evaluateLocalTriage } from '../../services/localAgent';
import { requestGeminiTriage } from '../../services/geminiService';

interface ChildTriageWizardProps {
  engineMode: AIEngineMode;
  language: AppLanguage;
  onSaveTriage: (triage: PatientTriage) => void;
}

export const ChildTriageWizard: React.FC<ChildTriageWizardProps> = ({
  engineMode,
  language,
  onSaveTriage,
}) => {
  const pt = language === 'pt';

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(10);
  const [gender, setGender] = useState<'M' | 'F' | 'Outro'>('F');
  const [neighborhood, setNeighborhood] = useState<string>('Vila Esperança');

  // Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Febre']);
  const [daysWithSymptoms, setDaysWithSymptoms] = useState<number>(2);

  // Vitals
  const [temperature, setTemperature] = useState<number>(37.8);
  const [spo2, setSpo2] = useState<number>(97);
  const [hasPulseOximeter, setHasPulseOximeter] = useState<boolean>(false);

  // Cough & Audio
  const [coughType, setCoughType] = useState<'seca' | 'produtiva' | 'chiado' | 'latente' | 'sem_tosse'>('seca');

  // Evaluation states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<PatientTriage | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick symptom emoji catalog
  const quickSymptoms = pt
    ? [
        { label: 'Febre', emoji: '🤒', desc: 'Corpo quente' },
        { label: 'Tosse', emoji: '🗣️', desc: 'Tosse seca ou pigarro' },
        { label: 'Falta de ar', emoji: '😮‍💨', desc: 'Dificuldade para respirar' },
        { label: 'Dor de garganta', emoji: '🧣', desc: 'Arranha ao engolir' },
        { label: 'Dor no peito', emoji: '🫀', desc: 'Aperto no coração/peito' },
        { label: 'Perda de olfato', emoji: '👃', desc: 'Não sente cheiro de nada' },
        { label: 'Perda de paladar', emoji: '👅', desc: 'Comida sem gosto' },
        { label: 'Dor no corpo', emoji: '⚡', desc: 'Corpo dolorido' },
        { label: 'Fadiga extrema', emoji: '🛌', desc: 'Cansaço muito forte' },
        { label: 'Diarreia', emoji: '🥣', desc: 'Dor de barriga' },
      ]
    : [
        { label: 'Fever', emoji: '🤒', desc: 'Warm body' },
        { label: 'Cough', emoji: '🗣️', desc: 'Dry or hacking cough' },
        { label: 'Shortness of breath', emoji: '😮‍💨', desc: 'Trouble breathing' },
        { label: 'Sore throat', emoji: '🧣', desc: 'Hurts to swallow' },
        { label: 'Chest pain', emoji: '🫀', desc: 'Tightness in chest' },
        { label: 'Loss of smell', emoji: '👃', desc: 'Cannot smell food' },
        { label: 'Loss of taste', emoji: '👅', desc: 'Food has no flavor' },
        { label: 'Body aches', emoji: '⚡', desc: 'Aching muscles' },
        { label: 'Extreme fatigue', emoji: '🛌', desc: 'Exhaustion' },
        { label: 'Diarrhea', emoji: '🥣', desc: 'Stomach issues' },
      ];

  const handleToggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleEvaluate = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const inputData = {
      name: name.trim() || (pt ? 'Paciente da Família' : 'Family Member'),
      age,
      gender,
      neighborhood,
      daysWithSymptoms,
      symptoms: selectedSymptoms,
      vitals: {
        temperature,
        spo2: hasPulseOximeter ? spo2 : undefined,
      },
      comorbidities: age >= 60 ? ['Idoso'] : [],
      coughType,
      language,
    };

    try {
      if (engineMode === 'gemini_flash') {
        try {
          const res = await requestGeminiTriage(inputData);
          setCurrentResult(res);
          onSaveTriage(res);
        } catch (apiErr: any) {
          // Graceful fallback to local agent
          console.warn('Gemini API call failed, falling back to local heuristic agent:', apiErr);
          const fallback = evaluateLocalTriage(inputData);
          setCurrentResult(fallback);
          onSaveTriage(fallback);
          setErrorMsg(
            pt
              ? 'Nota: Usamos o Agente Clínico Local offline pois a API do Gemini não pôde ser contatada no momento.'
              : 'Note: Used offline Local Clinical Agent as Gemini API could not be reached.'
          );
        }
      } else {
        // Deterministic Local Agent
        const res = evaluateLocalTriage(inputData);
        setCurrentResult(res);
        onSaveTriage(res);
      }
      setStep(4);
    } catch (e: any) {
      setErrorMsg(e.message || 'Erro durante triagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetWizard = () => {
    setCurrentResult(null);
    setStep(1);
    setSelectedSymptoms(['Febre']);
    setTemperature(37.5);
    setCoughType('seca');
  };

  // Helper avatar for age
  const getAgeIcon = (a: number) => {
    if (a < 12) return '🧒 Criança';
    if (a < 18) return '🧑 Jovem';
    if (a < 60) return '🧔 Adulto';
    return '👴 Vovô / Vovó (Atenção redobrada!)';
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Friendly banner */}
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 mb-2">
          <Smile className="w-4 h-4 text-teal-600" />
          <span>{pt ? 'Triagem Rápida & Fácil para Toda a Família' : 'Quick & Easy Family Triage'}</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {pt ? 'Como você ou alguém da sua casa está se sentindo?' : 'How are you or your family feeling today?'}
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto mt-1">
          {pt
            ? 'Responda em menos de 1 minuto para saber se precisa ir ao posto de saúde ou se pode cuidar em casa com segurança.'
            : 'Answer in under 1 minute to check whether to visit a clinic or rest safely at home.'}
        </p>
      </div>

      {/* Step Indicators */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {[
            { num: 1, label: pt ? '1. Quem é?' : '1. Who?' },
            { num: 2, label: pt ? '2. Sintomas' : '2. Symptoms' },
            { num: 3, label: pt ? '3. Febre & Tosse' : '3. Vitals & Cough' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                step === s.num
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : step > s.num
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Basic Person Info */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              {pt ? 'Qual o nome de quem está doente? (opcional)' : "What is the person's name? (optional)"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={pt ? 'Ex: Maria, Davi, Vovó Ana...' : 'E.g., Sarah, David, Grandma...'}
              className="w-full px-4 py-3 text-base rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-800">
                {pt ? 'Quantos anos a pessoa tem?' : 'How old is the person?'}
              </label>
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {age} {pt ? 'anos' : 'years old'} • {getAgeIcon(age)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
              <span>1 ano (Bebê)</span>
              <span>10 anos</span>
              <span>30 anos</span>
              <span>60+ anos</span>
              <span>100 anos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                {pt ? 'Bairro / Região de residência' : 'Neighborhood / District'}
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Vila Esperança">Vila Esperança</option>
                <option value="Morro São José">Morro São José</option>
                <option value="Centro Histórico">Centro Histórico</option>
                <option value="Jardim América">Jardim América</option>
                <option value="Bairro das Flores">Bairro das Flores</option>
                <option value="Parque das Nações">Parque das Nações</option>
                <option value="Outro Setor">{pt ? 'Outro Bairro / Setor' : 'Other Sector'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                {pt ? 'Há quantos dias começaram os sintomas?' : 'How many days of symptoms?'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5, 7, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysWithSymptoms(d)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      daysWithSymptoms === d
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {d} {pt ? 'dias' : 'd'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>{pt ? 'Próximo: Escolher Sintomas' : 'Next: Pick Symptoms'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Symptoms with Body Avatar & Quick Buttons */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Human Avatar on the left */}
            <div className="lg:col-span-6">
              <BodyAvatarSelector
                selectedSymptoms={selectedSymptoms}
                onToggleSymptom={handleToggleSymptom}
                language={language}
              />
            </div>

            {/* Quick symptom pills on the right */}
            <div className="lg:col-span-6 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">
                {pt ? 'Ou toque diretamente nos sintomas:' : 'Or tap directly on the symptoms:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSymptoms.map((item) => {
                  const isSelected = selectedSymptoms.includes(item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleToggleSymptom(item.label)}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[11px] text-slate-500 leading-tight">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSymptoms.includes('Falta de ar') || selectedSymptoms.includes('Shortness of breath') ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {pt
                      ? 'Atenção: Falta de ar é um sintoma importante. Vamos checar com cuidado a seguir.'
                      : 'Warning: Shortness of breath is an important symptom to check closely.'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{pt ? 'Voltar' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>{pt ? 'Próximo: Febre & Tosse' : 'Next: Fever & Cough'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Vitals, Thermometer & Detect II Cough Waveform */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          {/* Interactive Thermometer */}
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/60">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-amber-600" />
                <span>{pt ? 'Temperatura no Termômetro (°C)' : 'Thermometer Temperature (°C)'}</span>
              </label>
              <span
                className={`text-base font-black px-3.5 py-1 rounded-full shadow-2xs ${
                  temperature >= 38.5
                    ? 'bg-rose-600 text-white'
                    : temperature >= 37.5
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {temperature.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min="35.5"
              max="40.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
              <span className="text-emerald-700">36.5°C ({pt ? 'Normal' : 'Normal'})</span>
              <span className="text-amber-700">37.8°C ({pt ? 'Febrícula' : 'Low grade'})</span>
              <span className="text-rose-700">39.0°C+ ({pt ? 'Febre Alta' : 'High fever'})</span>
            </div>
          </div>

          {/* Oximeter Optional Check */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {pt ? 'Você tem um oxímetro de dedo em casa?' : 'Do you have a finger pulse oximeter at home?'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {pt ? 'Se não tiver, não tem problema! A avaliação funciona mesmo sem ele.' : 'Optional: Triage works accurately with or without it.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasPulseOximeter(!hasPulseOximeter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  hasPulseOximeter ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {hasPulseOximeter ? (pt ? 'Sim, tenho' : 'Yes, I have') : (pt ? 'Não tenho' : 'No')}
              </button>
            </div>

            {hasPulseOximeter && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    {pt ? 'Valor de Saturação de Oxigênio (SpO2 %)' : 'Oxygen Saturation (SpO2 %)'}
                  </span>
                  <span className="font-mono font-bold text-sm text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-lg">
                    {spo2}%
                  </span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            )}
          </div>

          {/* COVID-19 Detect II: Audio Visualizer and Cough Classifier */}
          <AudioVisualizer
            coughType={coughType}
            setCoughType={setCoughType}
            language={language}
          />

          {/* Final Submit Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{pt ? 'Voltar' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isLoading}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all transform active:scale-95 ${
                isLoading
                  ? 'bg-slate-600 cursor-wait'
                  : engineMode === 'gemini_flash'
                  ? 'bg-gradient-to-r from-teal-600 via-indigo-600 to-cyan-600 hover:opacity-95'
                  : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{pt ? 'Avaliando com IA...' : 'Evaluating with AI...'}</span>
                </>
              ) : (
                <>
                  {engineMode === 'gemini_flash' ? (
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  ) : (
                    <Bot className="w-5 h-5 text-blue-200" />
                  )}
                  <span>
                    {engineMode === 'gemini_flash'
                      ? pt
                        ? 'Obter Parecer com Gemini 3.8 Flash'
                        : 'Evaluate with Gemini 3.8 Flash'
                      : pt
                      ? 'Obter Parecer com Agente Local (Offline)'
                      : 'Evaluate with Local Agent (Offline)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULT SCREEN */}
      {step === 4 && currentResult && (
        <FriendlyResultCard
          triage={currentResult}
          language={language}
          onNewEvaluation={resetWizard}
        />
      )}
    </div>
  );
};
