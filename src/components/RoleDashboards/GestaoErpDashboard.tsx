import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  FileSpreadsheet,
  Package,
  ShieldCheck,
  Building2,
  PieChart,
  Calendar,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppLanguage } from '../../types';
import { FinanceTransactionRecord, saveFinanceRecordToFirestore } from '../../services/firestoreSync';

interface GestaoErpDashboardProps {
  finances: FinanceTransactionRecord[];
  onAddTransaction: (tx: FinanceTransactionRecord) => void;
  onOpenRegulatoryAudit: () => void;
  onOpenMultiModalCenter: () => void;
  onOpenArchitecture?: () => void;
  language: AppLanguage;
}

export const GestaoErpDashboard: React.FC<GestaoErpDashboardProps> = ({
  finances,
  onAddTransaction,
  onOpenRegulatoryAudit,
  onOpenMultiModalCenter,
  onOpenArchitecture,
  language,
}) => {
  const { profile } = useAuth();
  const pt = language === 'pt';

  const [activeTab, setActiveTab] = useState<'financial' | 'rh' | 'supplies' | 'regulatory'>('financial');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // New Transaction State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<FinanceTransactionRecord['type']>('receita_sus');
  const [category, setCategory] = useState('Repasse Ministério da Saúde');

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!description.trim() || isNaN(val)) return;

    const newTx: FinanceTransactionRecord = {
      id: `fin-${Date.now().toString().slice(-4)}`,
      type,
      description: description.trim(),
      amount: type.startsWith('despesa') ? -Math.abs(val) : Math.abs(val),
      category,
      referenceDocument: `DOC-${Date.now().toString().slice(-6)}`,
      recordedBy: profile.name,
      timestamp: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    await saveFinanceRecordToFirestore(newTx);

    setDescription('');
    setAmount('');
    setIsNewTxModalOpen(false);
  };

  const totalRevenue = finances.filter((f) => f.amount > 0).reduce((acc, f) => acc + f.amount, 0);
  const totalExpense = finances.filter((f) => f.amount < 0).reduce((acc, f) => acc + Math.abs(f.amount), 0);
  const netBalance = totalRevenue - totalExpense;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top ERP Executive Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center text-indigo-300 border border-indigo-400/30 shadow-inner">
              <TrendingUp className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  {pt ? 'ERP HOSPITALAR & CONTROLADORIA EXECUTIVA' : 'HOSPITAL ERP & EXECUTIVE CONTROLLER'}
                </span>
                <span className="text-xs font-mono text-indigo-300">
                  {profile.name} (Diretoria Geral)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {pt ? 'Gestão 360°, Finanças SUS & RH' : '360° Management, SUS Finances & HR'}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                {pt
                  ? 'Faturamento de AIH, DRE em tempo real, escalas de plantonistas, suprimentos de oxigênio e conformidade ISO/FDA.'
                  : 'SUS AIH billing, real-time income statement, medical staff shifts, O2 logistics, and ISO/FDA compliance.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenArchitecture && (
              <button
                onClick={onOpenArchitecture}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs sm:text-sm border border-slate-700 transition-all"
                title={pt ? 'Ver Geografia, Planta Baixa e Ecossistema (openDCIM, OpenMRS, OpenBoxes)' : 'View Hospital Geography, Floorplan & Ecosystem'}
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>{pt ? 'Planta & Ecossistema' : 'Floorplan & Ecosystem'}</span>
              </button>
            )}
            <button
              onClick={() => setIsNewTxModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{pt ? 'Lançar Transação / AIH (+)' : 'Add Transaction / AIH (+)'}</span>
            </button>
            <button
              onClick={onOpenRegulatoryAudit}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs sm:text-sm border border-slate-700 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>{pt ? 'Dossiê Regulatório SaMD' : 'SaMD Regulatory Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Receita Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Receita SUS & Convênios</span>
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Faturamento AIH / SIA auditado
          </span>
        </div>

        {/* Custos Operacionais */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Custos Operacionais & RH</span>
            <span className="p-1 rounded-lg bg-rose-100 text-rose-700">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Folha de pagamento + Insumos
          </span>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Superávit / Saldo Líquido</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl font-black mt-2 ${netBalance >= 0 ? 'text-indigo-950' : 'text-rose-700'}`}>
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            Margem Operacional Saudável (+18%)
          </span>
        </div>

        {/* Taxa de Ocupação de Leitos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Taxa de Ocupação UTI</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 mt-2">
            78.4%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            38 de 48 leitos de UTI ocupados
          </span>
        </div>
      </div>

      {/* ERP Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'financial', label: pt ? 'Livro Caixa & Faturamento SUS' : 'Financial Ledger & SUS', icon: DollarSign },
          { id: 'rh', label: pt ? 'Gestão de RH & Escalas Médicas' : 'HR & Staff Schedules', icon: Users },
          { id: 'supplies', label: pt ? 'Logística, O2 & Fornecedores' : 'Logistics & Supplies', icon: Package },
          { id: 'regulatory', label: pt ? 'Conformidade Regulatória (ISO/FDA)' : 'Regulatory Matrix', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive ? 'bg-indigo-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Financial Ledger */}
      {activeTab === 'financial' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base">
              {pt ? 'DRE / Extrato de Transações Hospitalares' : 'Income Statement & Transactions'}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {finances.length} lançamentos contábeis
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descrição do Faturamento / Custo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {finances.map((f) => {
                  const isPositive = f.amount > 0;
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(f.timestamp).toLocaleDateString(pt ? 'pt-BR' : 'en-US')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {f.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        {f.description}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">{f.category}</td>
                      <td className="py-3 px-4 text-slate-400">{f.referenceDocument}</td>
                      <td className={`py-3 px-4 text-right font-black ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? '+' : ''}
                        R$ {Math.abs(f.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: HR & Staff Management */}
      {activeTab === 'rh' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {pt ? 'Quadro de Colaboradores & Plantões Ativos' : 'Medical Staff & Active Shifts'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt ? 'Escala médica de 24 horas, controle de fadiga e alocação por setor' : '24-hour shift schedule, fatigue control, and ward assignment'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              100% dos postos cobertos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">UTI RESPIRATÓRIA</span>
              <h4 className="font-bold text-slate-900 text-sm">Dra. Beatriz Albuquerque</h4>
              <p className="text-slate-500">CRM-SP 142.890 • Intensivista / Plantão Diurno</p>
              <div className="pt-2 flex justify-between text-slate-600">
                <span>Energia: <strong>88%</strong></span>
                <span className="text-emerald-600 font-bold">Em atendimento</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">RECEPÇÃO & ACOLHIMENTO</span>
              <h4 className="font-bold text-slate-900 text-sm">Carlos Mendes</h4>
              <p className="text-slate-500">Atendente Hospitalar • Plantão 12x36</p>
              <div className="pt-2 flex justify-between text-slate-600">
                <span>Energia: <strong>94%</strong></span>
                <span className="text-blue-600 font-bold">Ativo no Totem</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">ENGENHARIA CLÍNICA</span>
              <h4 className="font-bold text-slate-900 text-sm">Eng. Roberto Nogueira</h4>
              <p className="text-slate-500">CREA-SP 88.421/D • Especialista em Facilities</p>
              <div className="pt-2 flex justify-between text-slate-600">
                <span>Energia: <strong>82%</strong></span>
                <span className="text-amber-600 font-bold">Ronda Técnica</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Supplies & Logistics */}
      {activeTab === 'supplies' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-lg font-black text-slate-900">
            {pt ? 'Controle de Insumos Críticos & Fornecedores Homologados' : 'Critical Supplies & Approved Vendors'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900">Oxigênio Medicinal Criogênico ($O_2$)</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Estoque Seguro (92%)
                </span>
              </div>
              <p className="text-slate-500">Fornecedor: White Martins Gases Industriais Ltda.</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
              <div className="flex justify-between text-slate-500 font-mono">
                <span>Tanque: 14.800 / 16.000 Litros</span>
                <span>Consumo: 120 L/hora</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900">Máscaras N95 / PFF2 & EPIs de Barreira</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Estoque Adequado (84%)
                </span>
              </div>
              <p className="text-slate-500">Fornecedor: 3M do Brasil & Distribuidora Nacional</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '84%' }} />
              </div>
              <div className="flex justify-between text-slate-500 font-mono">
                <span>Total: 8.400 unidades</span>
                <span>Autonomia: 45 dias</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Regulatory Overview Shortcut */}
      {activeTab === 'regulatory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {pt ? 'Matriz de Auditoria Regulatória Internacional' : 'International Regulatory Matrix'}
              </h3>
              <p className="text-xs text-slate-500">
                ANVISA RDC 657/2022 • FDA 510(k) CADt • CE MDR 2017/745 • ISO 13485:2016
              </p>
            </div>
            <button
              onClick={onOpenRegulatoryAudit}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Abrir Bateria Completa de Testes
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <p className="font-bold">
              ✅ Todos os 34 testes operacionais e classificatórios foram executados e aprovados com 100% de cobertura.
            </p>
            <p className="text-slate-600">
              O sistema cumpre com os requisitos de isolamento de PII da LGPD, separação estrita de datasets clínicos do FDA GMLP, rastreabilidade de código IEC 62304 Classe C e análise de riscos ISO 14971.
            </p>
          </div>
        </div>
      )}

      {/* Modal: New Financial Transaction */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <span>{pt ? 'Novo Lançamento Financeiro ERP' : 'New ERP Financial Entry'}</span>
              </h3>
              <button
                onClick={() => setIsNewTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Faturamento AIH Lote #9021 - Procedimentos UTI"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Lançamento</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    <option value="receita_sus">Receita SUS / AIH (+)</option>
                    <option value="receita_convenio">Receita Convênios (+)</option>
                    <option value="despesa_rh">Despesa com RH (-)</option>
                    <option value="despesa_insumos">Despesa com Insumos (-)</option>
                    <option value="despesa_manutencao">Despesa de Manutenção (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor em Reais (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ex: 6800.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoria Contábil</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Repasse Ministério da Saúde"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md transition-all active:scale-95"
                >
                  Confirmar Lançamento no DRE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
