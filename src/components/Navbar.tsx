import React from 'react';
import {
  Activity,
  HeartHandshake,
  Bot,
  Sparkles,
  PhoneCall,
  Languages,
  Stethoscope,
  Baby,
  ShieldCheck,
  Gamepad2,
  FileCode2,
  UserCheck,
  Building2,
} from 'lucide-react';
import { AppPersona, AIEngineMode, AppLanguage } from '../types';
import { UserRole } from '../services/firestoreSync';
import { UserProfileBar } from './UserProfileBar';

interface NavbarProps {
  persona: AppPersona;
  setPersona: (p: AppPersona) => void;
  engineMode: AIEngineMode;
  setEngineMode: (e: AIEngineMode) => void;
  language: AppLanguage;
  setLanguage: (l: AppLanguage) => void;
  serverOnline: boolean;
  geminiConfigured: boolean;
  onOpenRoleDashboard: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  persona,
  setPersona,
  engineMode,
  setEngineMode,
  language,
  setLanguage,
  serverOnline,
  geminiConfigured,
  onOpenRoleDashboard,
}) => {
  const pt = language === 'pt';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  DULI<span className="text-teal-600 font-black">.</span>Saúde
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
                  Detect II
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {pt
                  ? 'Vigilância Comunitária & Gestão Hospitalar 360°'
                  : 'Community Surveillance & 360° Hospital Tycoon'}
              </p>
            </div>
          </div>

          {/* Center: Mode / Persona Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setPersona('role_dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                persona === 'role_dashboard'
                  ? 'bg-indigo-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={pt ? 'Acessar painel do usuário por perfil (Cliente, Recepcionista, Médico, Manutenção, Gestão)' : 'Access role-based dashboard'}
            >
              <UserCheck className="w-4 h-4 text-indigo-300" />
              <span>{pt ? 'Painel por Perfil' : 'Role Dashboard'}</span>
            </button>
            <button
              onClick={() => setPersona('hospital_tycoon')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                persona === 'hospital_tycoon'
                  ? 'bg-slate-900 text-cyan-300 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={pt ? 'Simulador gamificado de hospital e clínica com fluxo automatizado de pacientes' : 'Gamified hospital tycoon & management'}
            >
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>{pt ? 'Hospital Tycoon' : 'Hospital Tycoon'}</span>
            </button>
            <button
              onClick={() => setPersona('hospital_architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                persona === 'hospital_architecture'
                  ? 'bg-cyan-900 text-cyan-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={pt ? 'Geografia, planta baixa do hospital e ecossistema open source (openDCIM, OpenMRS, OpenBoxes, Odoo)' : 'Hospital geography, multi-floor blueprint and open source ecosystem'}
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>{pt ? 'Planta & Infra' : 'Floorplan & Infra'}</span>
            </button>
            <button
              onClick={() => setPersona('professional_acs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                persona === 'professional_acs'
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={pt ? 'Painel técnico para Agentes de Saúde (ACS) e médicos' : 'Professional health agent & clinic dashboard'}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{pt ? 'Modo Vigilância' : 'Surveillance Mode'}</span>
            </button>
            <button
              onClick={() => setPersona('child_citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                persona === 'child_citizen'
                  ? 'bg-white text-teal-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={pt ? 'Modo simples e acessível para toda a família e crianças' : 'Simple family and child friendly mode'}
            >
              <Baby className="w-4 h-4 text-amber-500" />
              <span>{pt ? 'Modo Família' : 'Family Mode'}</span>
            </button>
            <button
              onClick={() => setPersona('readme_ci')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                persona === 'readme_ci'
                  ? 'bg-cyan-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={pt ? 'README dinâmico em tempo real via GitHub Pages, pipeline CI e binários com 100% de cobertura' : 'Dynamic live README via GitHub Pages, CI pipeline and binaries with 100% coverage'}
            >
              <FileCode2 className="w-4 h-4 text-cyan-300" />
              <span>{pt ? 'README & CI' : 'README & CI'}</span>
            </button>
          </div>

          {/* Right Controls: User Profile RBAC, AI Engine Switch, Language & SAMU */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile Bar with 1-click Role Switcher & Google Login */}
            <UserProfileBar
              language={language}
              onOpenRoleDashboard={(r) => {
                onOpenRoleDashboard(r);
                setPersona('role_dashboard');
              }}
            />

            {/* AI Engine Switcher */}
            <div className="relative hidden md:flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setEngineMode('local_agent')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  engineMode === 'local_agent'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={pt ? 'Executa localmente no seu navegador sem precisar de internet ou chave' : 'Runs 100% locally in browser, no key needed'}
              >
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>{pt ? 'Agente Local' : 'Local Agent'}</span>
              </button>
              <button
                onClick={() => setEngineMode('gemini_flash')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  engineMode === 'gemini_flash'
                    ? 'bg-linear-to-r from-teal-600 to-indigo-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={pt ? 'IA Gemini 3.8 Flash com raciocínio clínico aprofundado' : 'Gemini 3.8 Flash with deep clinical triage reasoning'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Gemini 3.8</span>
                {geminiConfigured && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                )}
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title={pt ? 'Mudar idioma / Switch language' : 'Mudar idioma'}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Emergency Hotline Button */}
            <a
              href="tel:192"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
              title={pt ? 'Ligar para Emergência SAMU 192' : 'Call Emergency'}
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span>SAMU 192</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
