import React from 'react';
import {
  Boxes,
  X,
  Truck,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { SupplyItem } from '../../types/hospitalGame';
import { AppLanguage } from '../../types';

interface SuppliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplies: SupplyItem[];
  budget: number;
  onOrderSupply: (supplyId: string, quantity: number, totalCost: number) => void;
  language: AppLanguage;
}

export const LogisticsSuppliesModal: React.FC<SuppliesModalProps> = ({
  isOpen,
  onClose,
  supplies,
  budget,
  onOrderSupply,
  language,
}) => {
  const pt = language === 'pt';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {pt ? 'Logística, Suprimentos & Fornecedores' : 'Logistics, Medical Supplies & Vendors'}
              </h3>
              <p className="text-xs text-slate-500">
                {pt
                  ? 'Controle de estoque crítico de gases medicinais, insumos de UTI e kits de diagnóstico'
                  : 'Critical inventory management for medical gases, ICU pharmaceuticals, and testing reagents'}
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

        {/* Supplies List */}
        <div className="space-y-4">
          {supplies.map((item) => {
            const stockPercent = Math.round((item.currentStock / item.maxCapacity) * 100);
            const isLow = stockPercent < 25;
            const batchSize = item.category === 'oxygen' ? 1000 : item.category === 'ppe' ? 500 : item.category === 'blood_packs' ? 20 : 100;
            const batchCost = batchSize * item.unitCost;
            const canAfford = budget >= batchCost;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLow
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                      {isLow && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                          {pt ? 'ESTOQUE CRÍTICO' : 'CRITICAL LOW'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.supplierName} • Entrega em {item.deliveryDays} dia(s)</span>
                    </span>
                  </div>

                  {/* Stock counter */}
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {item.currentStock.toLocaleString('pt-BR')} / {item.maxCapacity.toLocaleString('pt-BR')} {item.unit}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Custo unitário: R$ {item.unitCost}
                    </span>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
                  <div
                    style={{ width: `${stockPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      stockPercent < 25
                        ? 'bg-rose-500'
                        : stockPercent < 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                {/* Actions: Purchase Batch */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-600">
                    Lote padrão: <strong>+{batchSize} {item.unit}</strong> = <strong>R$ {batchCost.toLocaleString('pt-BR')}</strong>
                  </span>

                  <button
                    onClick={() => onOrderSupply(item.id, batchSize, batchCost)}
                    disabled={!canAfford || item.currentStock >= item.maxCapacity}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 ${
                      !canAfford
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{pt ? 'Comprar Lote de Insumo' : 'Order Supply Batch'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
