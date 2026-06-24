import React from 'react';
import { Calendar, Truck, CreditCard, ChevronRight, CheckCircle2, ShieldAlert, BadgeInfo, CalendarClock, LifeBuoy } from 'lucide-react';
import { Order, OrderItem } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onOpenSupportForService: (serviceName: string, category: 'formatting' | 'maintenance' | 'remote_support' | 'network') => void;
  onGoToCatalog: () => void;
}

export default function OrdersView({ orders, onOpenSupportForService, onGoToCatalog }: OrdersViewProps) {
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to calculate rental coverage progress
  const getRentalPeriodDetails = (createdAtIso: string, rentalDays: number | null) => {
    if (!rentalDays) return null;
    
    const createdTime = new Date(createdAtIso).getTime();
    const rentalDurationMs = rentalDays * 24 * 60 * 60 * 1000;
    const expirationTime = createdTime + rentalDurationMs;
    const now = Date.now();

    const isExpired = now >= expirationTime;
    const remainingMs = Math.max(0, expirationTime - now);
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    
    // Percent calculation
    const elapsedMs = now - createdTime;
    const percentLeft = isExpired ? 0 : Math.max(0, Math.min(100, (remainingMs / rentalDurationMs) * 100));

    return {
      isExpired,
      remainingDays,
      percentLeft,
      expireDate: new Date(expirationTime).toLocaleDateString('pt-BR')
    };
  };

  return (
    <div id="orders-view-container" className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Meus Pedidos e Locações</h1>
          <p className="text-sm text-slate-500">Histórico de compras, vigência de aluguel e status de serviços de TI contratados.</p>
        </div>
        <button
          id="orders-back-to-catalog"
          onClick={onGoToCatalog}
          className="px-4 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          Ir para a Loja
        </button>
      </div>

      {orders.length === 0 ? (
        <div id="orders-empty-state" className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <CalendarClock size={32} />
          </div>
          <h3 className="font-bold text-slate-700 text-base mb-1">Nenhum pedido encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Você ainda não realizou compras no nosso portal. Adicione produtos de hardware, licenças digitais, aluguéis ou serviços na home e finalize o pedido!
          </p>
          <button
            id="orders-empty-state-cta"
            onClick={onGoToCatalog}
            className="px-6 py-2.5 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-extrabold rounded-full shadow-md transition-colors"
          >
            Navegar no Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              id={`order-card-${order.id}`}
              className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 animate-in fade-in"
            >
              {/* Header block */}
              <div className="bg-slate-50 px-4 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <div className="text-slate-500">
                    Pedido: <span className="font-extrabold text-slate-800 uppercase">{order.id}</span>
                  </div>
                  <div className="text-slate-300">|</div>
                  <div className="text-slate-500 flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="text-slate-300">|</div>
                  <div className="text-slate-500 flex items-center gap-1">
                    <CreditCard size={13} />
                    <span className="uppercase font-bold">{order.payment_method === 'pix' ? 'Pix (10% OFF)' : 'Cartão'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-intelbras-green border border-green-100 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <CheckCircle2 size={12} />
                    <span>Pago (Instantâneo)</span>
                  </span>
                </div>
              </div>

              {/* Order content body */}
              <div className="p-4 space-y-4">
                {/* List of items */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => {
                    const rentalDetails = getRentalPeriodDetails(order.created_at, item.rental_days);
                    const isService = item.product_type === 'service';

                    // Match ticket category from name key
                    let serviceCategory: 'formatting' | 'maintenance' | 'remote_support' | 'network' = 'formatting';
                    if (item.product_name.toLowerCase().includes('rede')) {
                      serviceCategory = 'network';
                    } else if (item.product_name.toLowerCase().includes('manutenção') || item.product_name.toLowerCase().includes('limpeza')) {
                      serviceCategory = 'maintenance';
                    } else if (item.product_name.toLowerCase().includes('suporte') || item.product_name.toLowerCase().includes('remoto')) {
                      serviceCategory = 'remote_support';
                    }

                    return (
                      <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 leading-tight">{item.product_name}</h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                              <span>Qtd: {item.quantity}</span>
                              <span>•</span>
                              <span>Preço Unitário: {formatCurrency(item.price)}</span>
                              {item.rental_days && (
                                <>
                                  <span>•</span>
                                  <span className="text-purple-600 font-bold">Contrato: {item.rental_days} dias</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Special widgets for rentals or services */}
                        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                          {/* Total line value */}
                          <div className="text-xs font-extrabold text-slate-800">
                            Subtotal: {formatCurrency(item.price * item.quantity * (item.rental_days || 1))}
                          </div>

                          {/* Rental Active countdown widget */}
                          {rentalDetails && (
                            <div className="w-full sm:w-56 bg-purple-50/50 border border-purple-100 p-2 rounded-lg text-left">
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className={`font-bold ${rentalDetails.isExpired ? 'text-slate-400' : 'text-purple-700 animate-pulse'}`}>
                                  {rentalDetails.isExpired ? 'Contrato: Encerrado' : 'Aluguel Ativo'}
                                </span>
                                <span className="font-extrabold text-slate-600">
                                  {rentalDetails.isExpired ? 'Devolvido' : `${rentalDetails.remainingDays} dias restantes`}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-purple-600 h-full transition-all duration-500" 
                                  style={{ width: `${rentalDetails.percentLeft}%` }}
                                ></div>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-1">Devolução prevista: {rentalDetails.expireDate}</p>
                            </div>
                          )}

                          {/* Quick link button to open support ticket for a Service item */}
                          {isService && (
                            <button
                              id={`open-support-for-${item.id}`}
                              onClick={() => onOpenSupportForService(item.product_name, serviceCategory)}
                              className="text-[10px] font-black text-intelbras-green hover:text-intelbras-green-hover border border-intelbras-green/30 hover:border-intelbras-green bg-white hover:bg-green-50 px-2.5 py-1 rounded-md flex items-center gap-1 transition-all"
                            >
                              <LifeBuoy size={11} />
                              <span>Abrir Chamado de Assistência</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-3 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-600">
                  {/* Delivery address display */}
                  <div className="flex-1 space-y-1.5">
                    <div>
                      <p className="font-bold text-slate-800 mb-0.5">
                        {order.pickup_option ? 'Sede de Retirada Física:' : 'Endereço de Entrega:'}
                      </p>
                      <p className="text-slate-500 leading-relaxed text-[11px]">{order.address}</p>
                    </div>
                    {order.pickup_option ? (
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50/50 border border-emerald-100 px-2 py-1 rounded-md w-fit">
                        <CheckCircle2 size={12} />
                        <span>Pronto para retirada física (Leva até 2 horas)</span>
                      </p>
                    ) : (
                      (order.delivery_days || order.items.some(item => item.product_type === 'hardware' || item.product_type === 'rental')) && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Truck size={12} className="text-intelbras-green" />
                          <span>Prazo previsto: <strong className="text-slate-700">{order.delivery_days || 3} a {(order.delivery_days || 3) + 2} dias úteis</strong></span>
                        </p>
                      )
                    )}
                  </div>

                  {/* Pricing summary breakdown */}
                  <div className="w-full md:w-56 space-y-1 text-right">
                    <div className="flex justify-between md:justify-end gap-4 text-[11px]">
                      <span>{order.pickup_option ? 'Taxa de Retirada:' : 'Taxa de Entrega:'}</span>
                      <span className="font-bold text-slate-700">{order.shipping_cost > 0 ? formatCurrency(order.shipping_cost) : 'Grátis'}</span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-4 text-sm font-black text-slate-800">
                      <span>Total Pago:</span>
                      <span className="text-intelbras-green text-base font-black">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
