import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft, Package, Hammer, FileCheck, ShieldAlert, Key, Settings, Truck, Users, Calendar, Wrench } from 'lucide-react';
import { Product, User, Order } from '../types';

interface AdminPanelProps {
  products: Product[];
  currentUser: User | null;
  orders: Order[];
  onRefreshProducts: () => void;
  onRefreshOrders: () => void;
  onGoToCatalog: () => void;
}

export default function AdminPanel({ products, currentUser, orders, onRefreshProducts, onRefreshOrders, onGoToCatalog }: AdminPanelProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'hardware' as 'hardware' | 'software' | 'service' | 'rental',
    price: '',
    stock: '',
    image_url: '',
    images: '',
    original_price: '',
    features: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'catalog' | 'services'>('catalog');
  
  // Team Dispatch State
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [dispatchTeamName, setDispatchTeamName] = useState('');

  const serviceOrders = Array.isArray(orders) ? orders.filter(order => order.items.some(itm => itm.product_type === 'service')) : [];
  const pendingServicesCount = serviceOrders.filter(o => o.service_status === 'pending').length;

  const handleDispatchTeam = async (orderId: string) => {
    if (!dispatchTeamName || dispatchTeamName.trim() === '') {
      setError('Por favor, informe o nome da equipe ou técnico responsável.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('maxtech_auth_token') || '';
      const res = await fetch(`/api/orders/${orderId}/dispatch-service`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ team_name: dispatchTeamName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao designar equipe de TI.');
      }

      setSuccess(`Equipe "${dispatchTeamName}" enviada para o local com sucesso!`);
      setSelectedOrderForDispatch(null);
      setDispatchTeamName('');
      onRefreshOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteService = async (orderId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('maxtech_auth_token') || '';
      const res = await fetch(`/api/orders/${orderId}/complete-service`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao finalizar o serviço.');
      }

      setSuccess(`Serviço do pedido ${orderId} finalizado com sucesso!`);
      onRefreshOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div id="admin-unauthorized-container" className="max-w-md mx-auto my-12 p-8 bg-white border border-red-200 rounded-2xl shadow-lg text-center space-y-4">
        <ShieldAlert size={48} className="text-red-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800">Acesso Negado</h2>
        <p className="text-sm text-slate-500">Apenas usuários administradores autenticados podem gerenciar os itens do catálogo.</p>
        <button
          id="admin-unauthorized-back"
          onClick={onGoToCatalog}
          className="px-6 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-bold rounded-lg"
        >
          Voltar para a Loja
        </button>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      type: 'hardware',
      price: '',
      stock: '10',
      image_url: '',
      images: '',
      original_price: '',
      features: ''
    });
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      type: prod.type,
      price: prod.price.toString(),
      stock: (prod.stock || 0).toString(),
      image_url: prod.image_url,
      images: prod.images ? prod.images.join(', ') : '',
      original_price: prod.original_price ? prod.original_price.toString() : '',
      features: prod.features ? prod.features.join(', ') : ''
    });
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja excluir este produto do catálogo?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('maxtech_auth_token') || '';
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao deletar item.');
      }

      setSuccess('Item removido com sucesso!');
      onRefreshProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      setError('Por favor preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('maxtech_auth_token') || '';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price),
        stock: formData.type === 'hardware' ? parseInt(formData.stock || '0') : 99999,
        image_url: formData.image_url,
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar requisição.');
      }

      setSuccess(editingProduct ? 'Item atualizado com sucesso!' : 'Novo item criado com sucesso!');
      setIsFormOpen(false);
      onRefreshProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search computation
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || prod.type === filterType;
    return matchesSearch && matchesType;
  });

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'hardware':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'rental':
        return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'service':
        return 'bg-orange-50 text-orange-700 border border-orange-100';
      case 'software':
        return 'bg-teal-50 text-teal-700 border border-teal-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'hardware': return 'Hardware / Equipamento';
      case 'rental': return 'Locação / Aluguel';
      case 'service': return 'Serviço de Instalação';
      case 'software': return 'Software / Licença';
      default: return type;
    }
  };

  return (
    <div id="admin-panel-container" className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Settings className="text-intelbras-green" />
            <span>
              {activeTab === 'catalog' ? 'Gestão do Catálogo (Administrador)' : 'Gestão de Serviços de TI (Administrador)'}
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            {activeTab === 'catalog' 
              ? 'Cadastre, edite e remova produtos de hardware, licenças, serviços e locações de TI.' 
              : 'Gerencie os pedidos de serviços de TI contratados e envie equipes especializadas para o local.'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="admin-btn-back-catalog"
            onClick={onGoToCatalog}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ChevronLeft size={14} />
            <span>Ver Catálogo</span>
          </button>
          {activeTab === 'catalog' && (
            <button
              id="admin-btn-create-item"
              onClick={handleOpenCreate}
              className="flex-1 md:flex-none px-4 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              <span>Novo Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          id="admin-tab-btn-catalog"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'border-intelbras-green text-intelbras-green font-black'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Package size={14} />
          <span>Catálogo de Produtos</span>
        </button>
        <button
          id="admin-tab-btn-services"
          onClick={() => {
            setActiveTab('services');
            onRefreshOrders();
          }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 relative ${
            activeTab === 'services'
              ? 'border-intelbras-green text-intelbras-green font-black'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Wrench size={14} />
          <span>Serviços de TI Pendentes & Equipes</span>
          {pendingServicesCount > 0 && (
            <span className="bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center justify-center">
              {pendingServicesCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={16} />
              </span>
              <input
                id="admin-search-input"
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green focus:ring-1 focus:ring-intelbras-green"
              />
            </div>

            {/* Filter Type */}
            <div className="sm:w-56 flex gap-2 items-center">
              <span className="text-slate-400 shrink-0">
                <Filter size={16} />
              </span>
              <select
                id="admin-filter-type"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-intelbras-green"
              >
                <option value="all">Todas as Categorias</option>
                <option value="hardware">Hardware / Equipamentos</option>
                <option value="service">Serviços Técnicos</option>
                <option value="rental">Aluguel / Locação de TI</option>
              </select>
            </div>
          </div>

          {/* Catalog Items Management Table / Card List */}
          <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-3xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4 w-16">Imagem</th>
                    <th className="p-4">Nome & ID</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4 text-right">Preço</th>
                    <th className="p-4 text-center">Estoque</th>
                    <th className="p-4 text-center w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                        Nenhum item encontrado com os critérios de busca atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded bg-slate-50 border border-slate-100 shrink-0"
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <h4 className="font-bold text-slate-800 leading-snug">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono">ID: {prod.id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getBadgeClass(prod.type)}`}>
                            {getTypeText(prod.type)}
                          </span>
                        </td>
                        <td className="p-4 text-right font-semibold text-slate-800">
                          {prod.type === 'rental' ? (
                            <span>{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/dia</span>
                          ) : (
                            <span>{prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {prod.type === 'hardware' ? (
                            <span className={`font-bold ${prod.stock === 0 ? 'text-red-500' : 'text-slate-600'}`}>
                              {prod.stock} un
                            </span>
                          ) : (
                            <span className="text-slate-400">Ilimitado</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              id={`admin-btn-edit-${prod.id}`}
                              onClick={() => handleOpenEdit(prod)}
                              title="Editar item"
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-intelbras-green transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              id={`admin-btn-delete-${prod.id}`}
                              onClick={() => handleDeleteProduct(prod.id)}
                              title="Excluir item"
                              className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div id="admin-services-panel" className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-3xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Truck size={16} className="text-intelbras-green" />
              <span>Painel de Despacho de Serviços Técnicos de TI</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Todos os pedidos de serviços de TI (ex: Instalação, Formatação, Manutenção, Cabeamento) adquiridos por clientes são listados aqui. 
              Eles aparecem inicialmente com o status <strong className="text-amber-600">Pendente</strong> até que uma equipe técnica especializada seja designada e enviada para o local de atendimento do cliente.
            </p>
          </div>

          {serviceOrders.length === 0 ? (
            <div id="no-services-state" className="bg-white rounded-2xl border border-slate-150 p-12 text-center shadow-3xs space-y-3">
              <Wrench size={40} className="text-slate-300 mx-auto animate-pulse" />
              <h4 className="font-bold text-slate-800 text-sm">Nenhum Pedido de Serviço Contratado</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Não há pedidos de serviços de TI no banco de dados atualmente. Quando um cliente comprar um serviço, ele será exibido aqui para despacho.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {serviceOrders.map((order) => {
                const serviceItems = order.items.filter(itm => itm.product_type === 'service');
                const isPending = order.service_status === 'pending' || !order.service_status;
                const isDispatched = order.service_status === 'dispatched';
                const isCompleted = order.service_status === 'completed';

                let cardBorderClass = 'border-slate-150 bg-white hover:border-slate-250';
                if (isPending) {
                  cardBorderClass = 'border-amber-100 bg-amber-50/10 hover:border-amber-200';
                } else if (isDispatched) {
                  cardBorderClass = 'border-blue-100 bg-blue-50/10 hover:border-blue-200';
                } else if (isCompleted) {
                  cardBorderClass = 'border-emerald-100 bg-emerald-50/10 hover:border-emerald-200';
                }

                return (
                  <div 
                    key={order.id} 
                    id={`service-order-card-${order.id}`}
                    className={`bg-white rounded-xl border p-5 transition-all shadow-3xs flex flex-col md:flex-row gap-5 items-start justify-between ${cardBorderClass}`}
                  >
                    {/* Left: Info details */}
                    <div className="space-y-3 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-800 text-xs uppercase tracking-wider font-mono">
                          PEDIDO: {order.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium ml-2">
                          • {new Date(order.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {/* Status Badge */}
                        <div className="ml-auto md:ml-0">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pendente (Aguardando Equipe)
                            </span>
                          )}
                          {isDispatched && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              Equipe Enviada ao Local
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Serviço Finalizado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Client Details */}
                      <div className="bg-slate-50/80 p-3 rounded-lg text-xs space-y-1.5 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Users size={12} className="text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">Cliente ID:</span>
                          <span className="font-mono">{order.user_id}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <Truck size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800">Endereço de Atendimento:</span>
                            <p className="text-slate-600 font-medium">{order.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Services list inside this order */}
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serviços Contratados:</h4>
                        <div className="space-y-1.5">
                          {serviceItems.map((itm) => (
                            <div key={itm.id} className="flex items-center gap-2 text-xs bg-slate-50/50 p-2 rounded border border-slate-100">
                              <img 
                                src={itm.product_image} 
                                alt={itm.product_name} 
                                className="w-7 h-7 object-cover rounded bg-white border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 truncate">{itm.product_name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">Quantidade: {itm.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Dispatch Action Panel */}
                    <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 shrink-0 self-stretch flex flex-col justify-center">
                      {isPending ? (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Users size={14} className="text-amber-500" />
                            <span>Designar Equipe Técnica</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Insira o nome da equipe ou do técnico que será mandado para realizar o serviço de TI no local.
                          </p>

                          {selectedOrderForDispatch?.id === order.id ? (
                            <div className="space-y-2 animate-in fade-in duration-150">
                              <input
                                id={`dispatch-input-${order.id}`}
                                type="text"
                                placeholder="Ex: Equipe de Redes Sul - Carlos & Ana"
                                value={dispatchTeamName}
                                onChange={(e) => setDispatchTeamName(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                                autoFocus
                              />
                              <div className="flex gap-1.5">
                                <button
                                  id={`dispatch-submit-${order.id}`}
                                  onClick={() => handleDispatchTeam(order.id)}
                                  className="flex-1 py-1.5 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-[11px] font-bold rounded transition-colors"
                                >
                                  Confirmar Envio
                                </button>
                                <button
                                  id={`dispatch-cancel-${order.id}`}
                                  onClick={() => {
                                    setSelectedOrderForDispatch(null);
                                    setDispatchTeamName('');
                                  }}
                                  className="px-2 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[11px] font-bold rounded transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              id={`dispatch-trigger-${order.id}`}
                              onClick={() => {
                                setSelectedOrderForDispatch(order);
                                setDispatchTeamName('');
                              }}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Truck size={14} />
                              <span>Enviar Equipe ao Local</span>
                            </button>
                          )}
                        </div>
                      ) : isDispatched ? (
                        <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-100 text-xs space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center gap-1.5 text-blue-850 font-extrabold">
                            <CheckCircle2 size={14} className="text-blue-500 animate-pulse" />
                            <span>Equipe Despachada!</span>
                          </div>
                          
                          <div className="space-y-1 text-slate-600 text-[11px]">
                            <p>
                              <strong>Equipe:</strong> {order.service_team}
                            </p>
                            {order.service_dispatched_at && (
                              <p className="text-[10px] text-slate-400">
                                <strong>Enviada em:</strong>{' '}
                                {new Date(order.service_dispatched_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>

                          <div className="pt-1.5 border-t border-blue-100/50 flex flex-col gap-2">
                            <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-bold text-center">
                              Status: Em Atendimento
                            </span>
                            
                            <button
                              id={`complete-service-btn-${order.id}`}
                              onClick={() => handleCompleteService(order.id)}
                              className="w-full py-1.5 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-[10px] font-black rounded transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 size={11} />
                              <span>Finalizar Atendimento</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100 text-xs space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span>Serviço Concluído!</span>
                          </div>
                          
                          <div className="space-y-1 text-slate-650 text-[11px]">
                            <p>
                              <strong>Realizado por:</strong> {order.service_team}
                            </p>
                            {order.service_dispatched_at && (
                              <p className="text-[10px] text-slate-400">
                                <strong>Despachado:</strong>{' '}
                                {new Date(order.service_dispatched_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>

                          <div className="pt-1.5 border-t border-emerald-150">
                            <span className="w-full inline-block text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold text-center">
                              Status: Finalizado
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Form Modal Dialog */}
      {isFormOpen && (
        <div id="admin-form-modal" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90%] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col animate-in scale-in duration-150">
            {/* Modal Title */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                {editingProduct ? 'Editar Item do Catálogo' : 'Cadastrar Novo Item'}
              </h3>
              <button
                id="admin-form-close"
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-150 rounded-full transition-colors"
              >
                <XIcon size={18} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Product name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Item *</label>
                <input
                  id="form-item-name"
                  type="text"
                  required
                  placeholder="Ex: Roteador MAXTECH RG 1200 AC"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                />
              </div>

              {/* Product description */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Descrição Comercial *</label>
                <textarea
                  id="form-item-desc"
                  required
                  rows={3}
                  placeholder="Descreva as principais características, termos de uso ou especificações do item."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green resize-none"
                />
              </div>

              {/* Grid 2 Columns (Type & Price) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product type */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Categoria *</label>
                  <select
                    id="form-item-type"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-intelbras-green"
                  >
                    <option value="hardware">Hardware / Equipamento</option>
                    <option value="service">Serviço de Instalação / TI</option>
                    <option value="rental">Locação / Aluguel de TI</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {formData.type === 'rental' ? 'Valor da Locação (R$ / dia) *' : 'Preço de Venda / Instalação (R$) *'}
                  </label>
                  <input
                    id="form-item-price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Ex: 150.00"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                  />
                </div>
              </div>

              {/* Grid 2 Columns (Original price & Stock) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original price (Optional for promotion) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Preço Original Sem Desconto (Opcional - R$)</label>
                  <input
                    id="form-item-original-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Deixa vazio se não houver promoção"
                    value={formData.original_price}
                    onChange={e => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                  />
                </div>

                {/* Stock (Disabled unless hardware) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Estoque Inicial (Somente Hardware)</label>
                  <input
                    id="form-item-stock"
                    type="number"
                    min="0"
                    disabled={formData.type !== 'hardware'}
                    placeholder="Ex: 15"
                    value={formData.type === 'hardware' ? formData.stock : ''}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs disabled:bg-slate-50 focus:outline-none focus:border-intelbras-green"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">URL da Imagem do Item</label>
                <input
                  id="form-item-image"
                  type="url"
                  placeholder="Insira uma URL pública da imagem"
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                />
              </div>

              {/* Additional Carousel Images */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Outras Imagens do Carrossel (URLs separadas por vírgula)</label>
                <input
                  id="form-item-images"
                  type="text"
                  placeholder="Ex: http://url1.com, http://url2.com, http://url3.com"
                  value={formData.images}
                  onChange={e => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                />
              </div>

              {/* Features / Specs as tags list */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Características / Especificações (Separadas por vírgula)</label>
                <input
                  id="form-item-features"
                  type="text"
                  placeholder="Ex: Alta performance, Instalação Grátis, 12 meses de garantia"
                  value={formData.features}
                  onChange={e => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                />
              </div>

              {/* Form buttons */}
              <div className="flex gap-2 pt-2 justify-end border-t border-slate-100">
                <button
                  id="form-btn-cancel"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="form-btn-submit"
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-intelbras-green hover:bg-intelbras-green-hover disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple internal helper icon to bypass imports
function XIcon({ size = 16, className = '' }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
