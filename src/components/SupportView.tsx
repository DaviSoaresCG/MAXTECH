import React, { useState } from 'react';
import { LifeBuoy, AlertCircle, Plus, Send, RefreshCw, CheckCircle2, User, HelpCircle, ArrowRight, ShieldAlert, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import { Ticket, TicketCategory, TicketStatus, User as UserType, Order } from '../types';

interface SupportViewProps {
  tickets: Ticket[];
  currentUser: UserType | null;
  orders?: Order[];
  onOpenAuth: () => void;
  hasServiceInHistory: boolean;
  onGoToServicesCategory: () => void;
  onReloadTickets: () => void;
  prefilledTitle?: string;
  prefilledCategory?: string;
}

export default function SupportView({
  tickets,
  currentUser,
  orders = [],
  onOpenAuth,
  hasServiceInHistory,
  onGoToServicesCategory,
  onReloadTickets,
  prefilledTitle = '',
  prefilledCategory = ''
}: SupportViewProps) {
  const [showCreateForm, setShowCreateForm] = useState(prefilledTitle !== '');
  const [title, setTitle] = useState(prefilledTitle);
  const [category, setCategory] = useState<TicketCategory>(prefilledCategory);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Extract unique service names purchased by the user
  const userPaidOrders = orders ? orders.filter(o => o.user_id === currentUser?.id && (o.status === 'paid' || o.status === 'completed')) : [];
  const purchasedServices = Array.from(new Set(
    userPaidOrders.flatMap(o => o.items.filter(itm => itm.product_type === 'service').map(itm => itm.product_name))
  ));

  // Sync state with prefilled values when changed
  React.useEffect(() => {
    if (prefilledTitle) {
      setTitle(prefilledTitle);
      setShowCreateForm(true);
    }
  }, [prefilledTitle]);

  React.useEffect(() => {
    if (prefilledCategory) {
      setCategory(prefilledCategory);
    } else if (purchasedServices.length > 0) {
      setCategory(purchasedServices[0]);
    }
  }, [prefilledCategory, purchasedServices.length]);
  
  // Simulation toggle: lets reviewers pretend to be admin to update ticket statuses
  const [simulationMode, setSimulationMode] = useState(currentUser?.role === 'admin');

  const getCategoryLabel = (cat: TicketCategory) => {
    switch (cat) {
      case 'formatting': return 'Formatação e Instalação de SO';
      case 'maintenance': return 'Manutenção Física / Limpeza';
      case 'remote_support': return 'Suporte Técnico Remoto';
      case 'network': return 'Configuração de Redes e Roteadores';
      default: return cat;
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Aberto
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            Em Andamento
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            Resolvido
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
            Fechado
          </span>
        );
      default:
        return status;
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!hasServiceInHistory && currentUser.role !== 'admin') {
      setFormError('Invariante de elegibilidade violada (INV-04): Você só pode abrir um chamado de suporte técnico se possuir no seu histórico de pedidos um serviço contratado.');
      return;
    }

    if (title.trim() === '' || description.trim() === '') {
      setFormError('Por favor preencha todos os campos do chamado.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ title, description, category })
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Not JSON
      }

      if (!res.ok) {
        throw new Error(data.error || `Erro ${res.status}: Não foi possível abrir o chamado.`);
      }

      // Success
      setTitle('');
      setDescription('');
      setShowCreateForm(false);
      onReloadTickets();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    if (!currentUser) return;
    setActionLoading(ticketId);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Not JSON
      }

      if (!res.ok) {
        throw new Error(data.error || `Erro ${res.status}: Não foi possível atualizar o status.`);
      }

      onReloadTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Check if eligible to open ticket
  const isEligible = hasServiceInHistory || currentUser?.role === 'admin';

  return (
    <div id="support-view-container" className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LifeBuoy className="text-intelbras-green" />
            <span>Central de Assistência e Suporte</span>
          </h1>
          <p className="text-sm text-slate-500">Crie chamados de manutenção física, instalação de redes ou formatação de SO com controle de status integrado.</p>
        </div>
        
        {currentUser && isEligible && !showCreateForm && (
          <button
            id="open-new-ticket-btn"
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Abrir Chamado</span>
          </button>
        )}
      </div>

      {/* Mode Simulation notice block */}
      {currentUser && (
        <div id="admin-simulation-banner" className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Settings className="text-slate-500 animate-spin-slow shrink-0" size={16} />
            <div>
              <span className="font-bold text-slate-700">Simulador de Atendimento:</span>
              <span className="text-slate-500 ml-1">Para testar a máquina de estados de chamados, alterne o modo técnico/admin!</span>
            </div>
          </div>
          <button
            id="toggle-simulation-mode"
            type="button"
            onClick={() => setSimulationMode(!simulationMode)}
            className="flex items-center gap-1.5 font-bold text-intelbras-green hover:text-intelbras-green-hover focus:outline-none"
          >
            {simulationMode ? (
              <>
                <ToggleRight size={24} className="text-intelbras-green" />
                <span>Simulação Admin (Ativa)</span>
              </>
            ) : (
              <>
                <ToggleLeft size={24} className="text-slate-400" />
                <span>Simulação Cliente (Padrão)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Ticket Creation Form Panel */}
      {showCreateForm && (
        <div id="ticket-form-panel" className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm relative animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50">Abertura de Chamado Técnico</h2>
          
          {formError && (
            <div id="ticket-form-error" className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-start gap-2 border border-red-100">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Título do Chamado</label>
                <input
                  id="ticket-form-title"
                  type="text"
                  required
                  placeholder="Ex: Formatação demorada ou Notebook lento"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Categoria de Serviço</label>
                <select
                  id="ticket-form-category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green transition-all"
                >
                  {purchasedServices.length > 0 ? (
                    purchasedServices.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="formatting">Formatação e Instalação de SO (R$ 120,00)</option>
                      <option value="maintenance">Manutenção Física / Limpeza (R$ 180,00)</option>
                      <option value="remote_support">Suporte Técnico Remoto (R$ 249,00)</option>
                      <option value="network">Configuração de Redes e Roteadores (R$ 350,00)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Descrição do Problema</label>
              <textarea
                id="ticket-form-description"
                required
                rows={4}
                placeholder="Detalhe o máximo de informações possível: o que está acontecendo, erros exibidos e urgência..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green resize-none transition-all shadow-inner"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                id="ticket-form-cancel"
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormError('');
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                id="ticket-form-submit"
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-black rounded-lg flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
              >
                <Send size={12} />
                <span>{submitting ? 'Abrindo chamado...' : 'Enviar Chamado'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Not Logged in view */}
      {!currentUser ? (
        <div id="support-anonymous-alert" className="bg-white rounded-2xl border border-gray-150 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <HelpCircle size={32} />
          </div>
          <h3 className="font-bold text-slate-700 text-base mb-1">Acesse sua conta para ver chamados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Você precisa estar logado para visualizar chamados abertos ou registrar novas solicitações de suporte.
          </p>
          <button
            id="support-anonymous-auth-btn"
            onClick={onOpenAuth}
            className="px-6 py-2.5 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-extrabold rounded-full shadow-md transition-all"
          >
            Fazer Login / Cadastrar
          </button>
        </div>
      ) : (
        /* Logged in views */
        <>
          {/* Eligibility Check (Ineligible block) - Rule INV-04 */}
          {!isEligible && (
            <div id="support-ineligibility-warning" className="bg-amber-50 rounded-2xl border border-amber-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in">
              <div className="p-3 bg-amber-100 rounded-full text-amber-600 shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-amber-800 text-sm">Bloqueio de Elegibilidade de Chamados (INV-04)</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Para garantir a idoneidade dos processos de pós-venda, a abertura de chamados técnicos está condicionada à contratação prévia de ao menos um dos nossos serviços listados. Você ainda não adquiriu nenhum serviço de TI elegível.
                </p>
              </div>
              <button
                id="support-purchase-service-cta"
                onClick={onGoToServicesCategory}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-sm transition-colors"
              >
                <span>Contratar Serviço</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Ticket Listing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                Seus Chamados de Suporte ({tickets.length})
              </h2>
              <button
                id="support-reload-btn"
                onClick={onReloadTickets}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-intelbras-green transition-colors focus:outline-none"
                title="Recarregar Chamados"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {tickets.length === 0 ? (
              <div id="tickets-empty-state" className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-slate-400">
                <p className="text-xs">Nenhum chamado de suporte aberto no momento.</p>
                {isEligible && (
                  <button
                    id="tickets-empty-state-cta"
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Abrir Primeiro Chamado
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    id={`ticket-card-${ticket.id}`}
                    className="bg-white rounded-2xl border border-gray-150 p-4 shadow-3xs flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:border-slate-300 animate-in fade-in"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">{ticket.id}</span>
                        <span>•</span>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {getCategoryLabel(ticket.category)}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-800 leading-tight">{ticket.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <User size={10} />
                        <span>Aberto por: {ticket.user_name}</span>
                        <span>•</span>
                        <span>Data de abertura: {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Admin Status Transition Actions */}
                    {simulationMode && (
                      <div id={`ticket-admin-actions-${ticket.id}`} className="bg-slate-50 border border-slate-200 p-3 rounded-xl min-w-[200px] text-left shrink-0 self-start md:self-auto">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                          MÁQUINA DE ESTADO DO CHAMADO
                        </p>

                        <div className="flex flex-col gap-1.5">
                          {ticket.status === 'open' && (
                            <button
                              id={`admin-btn-in-progress-${ticket.id}`}
                              onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                              disabled={actionLoading === ticket.id}
                              className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded shadow-3xs transition-colors"
                            >
                              Atribuir Técnico (Iniciar)
                            </button>
                          )}
                          {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                            <button
                              id={`admin-btn-resolve-${ticket.id}`}
                              onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                              disabled={actionLoading === ticket.id}
                              className="w-full py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-3xs transition-colors"
                            >
                              Resolver Chamado
                            </button>
                          )}
                          {ticket.status !== 'closed' && (
                            <button
                              id={`admin-btn-close-${ticket.id}`}
                              onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                              disabled={actionLoading === ticket.id}
                              className="w-full py-1 bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold rounded shadow-3xs transition-colors"
                            >
                              Encerrar / Arquivar
                            </button>
                          )}
                          {ticket.status === 'closed' && (
                            <div className="text-xs text-slate-400 italic flex items-center gap-1 py-1">
                              <CheckCircle2 size={12} className="text-slate-400" />
                              <span>Ciclo de atendimento concluído</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
