import React, { useState } from 'react';
import {
  Wrench,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  Droplets,
  Wind,
  PlusCircle,
  FileCheck,
  Building2,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppLanguage } from '../../types';
import { MaintenanceOrderRecord, saveMaintenanceOrderToFirestore } from '../../services/firestoreSync';

interface ManutencaoDashboardProps {
  orders: MaintenanceOrderRecord[];
  onAddOrder: (order: MaintenanceOrderRecord) => void;
  onUpdateOrderStatus: (id: string, status: MaintenanceOrderRecord['status']) => void;
  language: AppLanguage;
}

export const ManutencaoDashboard: React.FC<ManutencaoDashboardProps> = ({
  orders,
  onAddOrder,
  onUpdateOrderStatus,
  language,
}) => {
  const { profile } = useAuth();
  const pt = language === 'pt';

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form state
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentType, setEquipmentType] = useState<MaintenanceOrderRecord['equipmentType']>('tomografo');
  const [locationRoom, setLocationRoom] = useState('Centro de Imagem - Sala 01');
  const [priority, setPriority] = useState<MaintenanceOrderRecord['priority']>('alta');
  const [description, setDescription] = useState('');

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim()) return;

    const newOrder: MaintenanceOrderRecord = {
      id: `os-${Date.now().toString().slice(-4)}`,
      equipmentName: equipmentName.trim(),
      equipmentType,
      locationRoom,
      priority,
      status: 'aberta',
      description: description.trim() || 'Manutenção preventiva e aferição de segurança elétrica',
      reportedBy: profile.name,
      technicianAssigned: 'Eng. Roberto Nogueira',
      nextCalibrationDate: '2026-12-15',
      createdAt: new Date().toISOString(),
    };

    onAddOrder(newOrder);
    await saveMaintenanceOrderToFirestore(newOrder);

    setEquipmentName('');
    setDescription('');
    setIsNewOrderModalOpen(false);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterPriority === 'all') return true;
    return o.priority === filterPriority;
  });

  const criticalOrders = orders.filter((o) => o.priority === 'critica').length;
  const inProgress = orders.filter((o) => o.status === 'em_andamento').length;
  const calibrated = orders.filter((o) => o.status === 'calibrado' || o.status === 'concluida').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-stone-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 border border-white/20 shadow-inner">
              <Wrench className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  {pt ? 'ENGENHARIA CLÍNICA & FACILITIES' : 'CLINICAL ENGINEERING & FACILITIES'}
                </span>
                <span className="text-xs font-mono text-amber-200">
                  {profile.crmOrCoren || 'CREA-SP 88.421/D'} • {profile.name}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {pt ? 'Manutenção, Calibração & Utilidades' : 'Maintenance, Calibration & Utilities'}
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
                {pt
                  ? 'Controle de ordens de serviço (OS), tomógrafo, aparelho de raio-x, usina criogênica de O2 e geradores.'
                  : 'Service orders control, CT scanner, X-Ray unit, cryogenic O2 plant, and power backup.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-stone-900 hover:bg-amber-50 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-700" />
            <span>{pt ? 'Abrir Ordem de Serviço (+)' : 'New Service Order (+)'}</span>
          </button>
        </div>
      </div>

      {/* Critical Facilities Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Usina de O2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Usina de O2 Criogênico</span>
            <Droplets className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900">4.5 bar</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pressão Estável • Nível: 92%</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Tanque: 14.800 L • Autonomia: 96h
          </div>
        </div>

        {/* Gerador Elétrico */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Geradores de Emergência</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900">750 kVA</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pronto / Standby (100% Diesel)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Último teste em carga: 14/10 (Aprovado)
          </div>
        </div>

        {/* Pressão Negativa & HEPA */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filtros HEPA & Exaustão</span>
            <Wind className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900">-15 Pa</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pressão Negativa Ativa (Ala C)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Diferencial de pressão conforme NBR 7256
          </div>
        </div>

        {/* Tomógrafo & RX Status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Parque Radiológico</span>
            <Cpu className="w-5 h-5 text-teal-600" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900">98.5%</div>
            <div className="text-xs text-blue-600 font-bold flex items-center gap-1">
              <span>Disponibilidade Operacional</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            1 Tomógrafo + 2 RX Digitais Ativos
          </div>
        </div>
      </div>

      {/* Orders Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-2">Filtrar OS:</span>
          {[
            { id: 'all', label: 'Todas as Ordens' },
            { id: 'critica', label: 'Críticas' },
            { id: 'alta', label: 'Alta Prioridade' },
            { id: 'preventiva', label: 'Preventivas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPriority(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterPriority === tab.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-400">
          {filteredOrders.length} ordens de serviço cadastradas
        </span>
      </div>

      {/* Service Orders Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const isCritical = order.priority === 'critica';
          const isDone = order.status === 'concluida' || order.status === 'calibrado';

          return (
            <div
              key={order.id}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                isCritical ? 'border-rose-300 ring-2 ring-rose-500/20 shadow-sm' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : order.priority === 'alta'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    OS #{order.id} • {order.priority}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'em_andamento'
                        ? 'bg-cyan-100 text-cyan-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base mb-1">
                  {order.equipmentName}
                </h3>
                <p className="text-xs text-slate-500 mb-2">{order.locationRoom}</p>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3">
                  {order.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    Responsável: {order.technicianAssigned}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Próx. Calibração: {order.nextCalibrationDate}
                  </span>
                </div>

                {!isDone ? (
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'concluida')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluir</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Certificado</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Service Order */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Nova Ordem de Serviço (Engenharia Clínica)</span>
              </h3>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Equipamento *</label>
                <input
                  type="text"
                  required
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="Ex: Desfibrilador Bifásico Mindray BeneHeart D6"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Ativo</label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    <option value="tomografo">Tomógrafo Computadorizado</option>
                    <option value="raio_x">Aparelho de Raio-X Digital</option>
                    <option value="ecg">Eletrocardiógrafo 12D</option>
                    <option value="ventilador">Ventilador Mecânico UTI</option>
                    <option value="usina_o2">Usina de Oxigênio Criogênico</option>
                    <option value="gerador_eletrico">Gerador Elétrico Diesel</option>
                    <option value="ar_pressao_negativa">Climatização / HEPA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    <option value="critica">Crítica (Interrupção de Atendimento)</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="preventiva">Preventiva Periódica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Localização / Ala / Sala</label>
                <input
                  type="text"
                  value={locationRoom}
                  onChange={(e) => setLocationRoom(e.target.value)}
                  placeholder="Ex: Centro de Diagnóstico - Sala 02"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Problema ou Procedimento</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Calibração anual do detector com emissão de laudo radiométrico conforme CNEN..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow-md transition-all active:scale-95"
                >
                  Registrar Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
