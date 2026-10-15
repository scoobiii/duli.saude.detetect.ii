import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  ChevronDown,
  Building2,
  Stethoscope,
  Wrench,
  TrendingUp,
  UserCheck,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../services/firestoreSync';
import { AppLanguage } from '../types';

interface UserProfileBarProps {
  language: AppLanguage;
  onOpenRoleDashboard: (role: UserRole) => void;
}

export const UserProfileBar: React.FC<UserProfileBarProps> = ({ language, onOpenRoleDashboard }) => {
  const { user, profile, role, switchDemoProfile, signInWithGoogle, signOut, isFirebaseAuthenticated } = useAuth();
  const pt = language === 'pt';

  const [isOpen, setIsOpen] = useState(false);

  const roleConfigs: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
    cliente: {
      label: pt ? 'Cliente / Paciente' : 'Client / Patient',
      icon: User,
      color: 'bg-teal-500 text-white',
      desc: pt ? 'Portal de triagens, exames RX/TC e orientações' : 'Patient portal, exams & home guidelines',
    },
    recepcionista: {
      label: pt ? 'Recepcionista SUS' : 'Receptionist',
      icon: Building2,
      color: 'bg-blue-600 text-white',
      desc: pt ? 'Acolhimento, admissões e chamada no totem' : 'Admissions, tickets & totem audio calling',
    },
    medico: {
      label: pt ? 'Médico Clínico' : 'Clinician / Doctor',
      icon: Stethoscope,
      color: 'bg-emerald-600 text-white',
      desc: pt ? 'Prontuário PEP, exames multimodais e conduta UTI' : 'EHR PEP, multimodal imaging & ICU bed conduct',
    },
    manutencao: {
      label: pt ? 'Engenharia / Manutenção' : 'Engineering / Maint.',
      icon: Wrench,
      color: 'bg-amber-600 text-white',
      desc: pt ? 'Ordens de serviço, usina O2, geradores e tomógrafo' : 'Service orders, O2 plant, generators & CT',
    },
    gestao: {
      label: pt ? 'Gestão / ERP Hospitalar' : 'Management / ERP',
      icon: TrendingUp,
      color: 'bg-indigo-600 text-white',
      desc: pt ? 'Controladoria, DRE, faturamento SUS AIH e RH' : 'Finance DRE, SUS AIH billing & HR shifts',
    },
  };

  const currentConfig = roleConfigs[role];
  const CurrentIcon = currentConfig.icon;

  const handleSelectRole = (newRole: UserRole) => {
    switchDemoProfile(newRole);
    onOpenRoleDashboard(newRole);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Active Role Selector Pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all text-left"
        >
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${currentConfig.color}`}>
            <CurrentIcon className="w-4 h-4" />
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-black text-slate-900">{profile?.name ? profile.name.split(' ')[0] : 'Usuário'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 uppercase">
                {role}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
              {currentConfig.label}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>

        {/* Real Google Account Login Button */}
        {isFirebaseAuthenticated ? (
          <button
            onClick={() => signOut()}
            title={pt ? 'Sair da conta Google Firebase' : 'Sign out of Google Firebase'}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => signInWithGoogle()}
            title={pt ? 'Entrar com Google (Firebase Auth)' : 'Sign in with Google (Firebase Auth)'}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-300" />
            <span>Google Login</span>
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 p-4 space-y-3 animate-fade-in">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                {pt ? 'CONTROLE DE ACESSO POR PERFIL (RBAC)' : 'ROLE-BASED ACCESS CONTROL (RBAC)'}
              </span>
              <div className="font-black text-slate-900 text-sm">
                {pt ? 'Selecione o Perfil do Usuário' : 'Select User Role'}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {pt
                  ? 'Cada perfil libera um painel e permissões exclusivas validadas no Firestore.'
                  : 'Each role grants specific dashboards and permissions enforced in Firestore.'}
              </p>
            </div>

            {/* List of 5 Roles */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {(Object.keys(roleConfigs) as UserRole[]).map((r) => {
                const config = roleConfigs[r];
                const Icon = config.icon;
                const isSelected = role === r;

                return (
                  <button
                    key={r}
                    onClick={() => handleSelectRole(r)}
                    className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-white/20 text-white' : config.color
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {config.label}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono">
                            ATIVO
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {config.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Google Firebase Info Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-teal-600" />
                <span>{isFirebaseAuthenticated ? 'Firebase Cloud: Sincronizado' : 'Modo Demonstrativo & Local'}</span>
              </span>

              {!isFirebaseAuthenticated && (
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setIsOpen(false);
                  }}
                  className="font-bold text-teal-700 hover:text-teal-900"
                >
                  Conectar Google
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
