import React from 'react';
import {
  DollarSign,
  X,
  TrendingUp,
  Receipt,
  Building,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { AppLanguage } from '../../types';

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: number;
  curedCount: number;
  language: AppLanguage;
}

export const FinancialLedgerModal: React.FC<FinanceModalProps> = ({
  isOpen,
  onClose,
  budget,
  curedCount,
  language,
}) => {
  const pt = language === 'pt';

  if (!isOpen) return null;

  const sampleLedger = [
    { desc: 'Reembolso SUS AIH - Alta Clínica UTI (Dona Geralda Souza)', amount: 6800, type: 'revenue', time: '10:45' },
    { desc: 'Reembolso SUS - Tomografia Computadorizada Helicoidal', amount: 380, type: 'revenue', time: '10:20' },
    { desc: 'Reembolso SUS AIH - Internação Enfermaria Respiratória', amount: 1400, type: 'revenue', time: '09:50' },
    { desc: 'Pagamento de Fornecedor: Lote de Oxigênio Criogênico (White Martins)', amount: -4200, type: 'expense', time: '09:15' },
    { desc: 'Reembolso SUS - Radiografia Digital de Tórax & Triagem', amount: 210, type: 'revenue', time: '08:40' },
    { desc: 'Folha de Pagamento Diária do Corpo Clínico & Enfermagem', amount: -2320, type: 'expense', time: '08:00' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {pt ? 'Finanças, Faturamento SUS & Contabilidade Hospitalar' : 'Hospital Finance & SUS Billing Ledger'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt
                  ? 'Livro caixa do hospital com faturamento de AIHs e controle de custos operacionais'
                  : 'Hospital cashbook showing public SUS reimbursements and operational expenditures'}
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

        {/* Financial Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Saldo em Caixa</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              R$ {budget.toLocaleString('pt-BR')}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              {pt ? '✓ Orçamento operacional saudável' : '✓ Healthy operational cash'}
            </span>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Altas Clínicas Faturadas</span>
            <span className="text-2xl font-black text-blue-700 font-mono">
              {curedCount} {pt ? 'pacientes' : 'patients'}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold block mt-1">
              {pt ? 'Procedimentos AIH liquidados' : 'AIH bills closed'}
            </span>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Tabela de Repasse SUS</span>
            <span className="text-2xl font-black text-purple-700 font-mono">
              100% {pt ? 'Ativo' : 'Active'}
            </span>
            <span className="text-[11px] text-purple-600 font-semibold block mt-1">
              {pt ? 'Faturamento automático a cada alta' : 'Auto billing per cured case'}
            </span>
          </div>
        </div>

        {/* Ledger Transaction History */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            {pt ? 'Últimas Transações Financeiras (Extrato em Tempo Real):' : 'Recent Financial Transactions:'}
          </h4>
          <div className="space-y-2 text-xs">
            {sampleLedger.map((tx, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{tx.desc}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Horário: {tx.time}</span>
                </div>
                <span
                  className={`font-black font-mono text-sm whitespace-nowrap ${
                    tx.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {tx.type === 'revenue' ? '+' : ''} R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
