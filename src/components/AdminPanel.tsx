import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft, Package, Hammer, FileCheck, ShieldAlert, Key, Settings } from 'lucide-react';
import { Product, User } from '../types';

interface AdminPanelProps {
  products: Product[];
  currentUser: User | null;
  onRefreshProducts: () => void;
  onGoToCatalog: () => void;
}

export default function AdminPanel({ products, currentUser, onRefreshProducts, onGoToCatalog }: AdminPanelProps) {
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
    original_price: '',
    features: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
            <span>Gestão do Catálogo (Administrador)</span>
          </h1>
          <p className="text-sm text-slate-500">Cadastre, edite e remova produtos de hardware, licenças, serviços e locações de TI.</p>
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
          <button
            id="admin-btn-create-item"
            onClick={handleOpenCreate}
            className="flex-1 md:flex-none px-4 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>Novo Item</span>
          </button>
        </div>
      </div>

      {/* Alert toasts */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

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
            <option value="software">Software / Licenças</option>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    <option value="software">Software / Licença Digital</option>
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
