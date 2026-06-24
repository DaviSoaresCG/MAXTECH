import React, { useState } from 'react';
import { Search, ShoppingCart, User as UserIcon, MapPin, LogOut, FileText, LifeBuoy, Settings, Check } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  zipCode: string;
  onZipCodeChange: (zip: string) => void;
}

export default function Header({
  currentUser,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  activeView,
  onViewChange,
  zipCode,
  onZipCodeChange
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCepInput, setShowCepInput] = useState(false);
  const [cepValue, setCepValue] = useState(zipCode || '');

  const handleCepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cepValue.trim().length >= 8) {
      onZipCodeChange(cepValue);
      setShowCepInput(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Top Banner (Promo) - Geometric Balance Style */}
      <div className="bg-intelbras-dark-green text-white px-8 py-2 flex justify-between items-center text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <span>Para Você</span>
          <span className="hidden sm:inline-block text-[#00A335]">|</span>
          <span className="hidden sm:inline-block text-[#00A335] font-bold">⚡ OFERTA: 10% DE DESCONTO COM PIX</span>
        </div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-intelbras-green" onClick={() => { onViewChange('catalog'); onCategorySelect('all'); }}>Empresas</span>
          <span className="cursor-pointer hover:text-intelbras-green" onClick={() => { onViewChange('catalog'); onCategorySelect('all'); }}>Projetos</span>
          <span className="cursor-pointer hover:text-intelbras-green" onClick={() => onViewChange('tickets')}>Suporte</span>
          <span className="cursor-pointer hover:text-intelbras-green" onClick={() => { onViewChange('catalog'); onCategorySelect('all'); }}>Onde Comprar</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo Section - Geometric Balance Style */}
        <div 
          id="brand-logo"
          onClick={() => {
            onViewChange('catalog');
            onCategorySelect('all');
          }}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 bg-intelbras-green rounded-sm flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="text-2xl font-bold tracking-tighter text-intelbras-dark-green uppercase">
            intelbras
          </span>
          <span className="text-xs font-bold text-slate-400 self-end mb-1 ml-1 uppercase tracking-widest border-l border-slate-200 pl-2">
            MaxTech
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative">
            <input
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="O que você está procurando?"
              className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green transition-all shadow-inner"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
              <Search size={18} />
            </span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-6 text-slate-700">
          {/* ZIP Code (CEP) Selector */}
          <div className="hidden md:flex items-center gap-2 relative">
            <MapPin className="text-intelbras-green shrink-0" size={20} />
            <div className="text-left text-xs">
              <p className="text-slate-400 font-medium">Informar seu CEP</p>
              <button 
                id="header-cep-button"
                onClick={() => setShowCepInput(!showCepInput)}
                className="font-bold text-slate-800 hover:text-intelbras-green transition-colors text-xs"
              >
                {zipCode ? `CEP: ${zipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2')}` : 'Selecionar'}
              </button>
            </div>

            {/* CEP Floating Input */}
            {showCepInput && (
              <div id="cep-popover" className="absolute top-12 left-0 w-60 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <form onSubmit={handleCepSubmit}>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Digite seu CEP para calcular o frete:</p>
                  <div className="flex gap-2">
                    <input
                      id="cep-popover-input"
                      type="text"
                      maxLength={8}
                      placeholder="Ex: 01001000"
                      value={cepValue}
                      onChange={e => setCepValue(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                    />
                    <button
                      id="cep-popover-submit"
                      type="submit"
                      className="px-3 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Ok
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Apenas hardware possui custo de frete fixo de R$ 25,00. Outros itens são isentos!</p>
                </form>
              </div>
            )}
          </div>

          {/* User Profile / Auth */}
          <div className="relative">
            {currentUser ? (
              <div>
                <button
                  id="user-profile-menu-trigger"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:text-intelbras-green transition-colors py-1.5 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-intelbras-green/10 flex items-center justify-center text-intelbras-green font-bold text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block text-xs">
                    <p className="text-slate-400 font-medium">Olá, Bem-vindo!</p>
                    <p className="font-bold text-slate-800 line-clamp-1">{currentUser.name.split(' ')[0]}</p>
                  </div>
                </button>

                {/* Profile Floating Menu */}
                {showProfileMenu && (
                  <div id="profile-popover-menu" className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-sm text-slate-800 line-clamp-1">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{currentUser.email}</p>
                      <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 rounded-full font-bold uppercase ${
                        currentUser.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-intelbras-green'
                      }`}>
                        {currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                      </span>
                    </div>

                    <button
                      id="menu-goto-catalog"
                      onClick={() => {
                        onViewChange('catalog');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        activeView === 'catalog' ? 'bg-slate-50 text-intelbras-green font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShoppingCart size={14} />
                      <span>Comprar Produtos</span>
                    </button>

                    <button
                      id="menu-goto-orders"
                      onClick={() => {
                        onViewChange('orders');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        activeView === 'orders' ? 'bg-slate-50 text-intelbras-green font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <FileText size={14} />
                      <span>Meus Pedidos</span>
                    </button>

                    <button
                      id="menu-goto-support"
                      onClick={() => {
                        onViewChange('tickets');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                        activeView === 'tickets' ? 'bg-slate-50 text-intelbras-green font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <LifeBuoy size={14} />
                      <span>Central de Chamados</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        id="menu-goto-admin"
                        onClick={() => {
                          onViewChange('admin');
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
                          activeView === 'admin' ? 'bg-slate-50 text-intelbras-green font-semibold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Settings size={14} className="text-emerald-600" />
                        <span className="font-bold text-emerald-600">Painel do Administrador</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      id="logout-button"
                      onClick={() => {
                        onLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-auth-trigger"
                onClick={onOpenAuth}
                className="flex items-center gap-2 hover:text-intelbras-green transition-colors focus:outline-none group text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-intelbras-green/10 group-hover:text-intelbras-green transition-colors">
                  <UserIcon size={18} />
                </div>
                <div className="text-xs">
                  <p className="text-slate-400 font-medium">Olá, Bem-vindo!</p>
                  <p className="font-bold text-slate-800 group-hover:text-intelbras-green transition-colors">Entrar / Criar Conta</p>
                </div>
              </button>
            )}
          </div>

          {/* Cart Icon */}
          <button
            id="header-cart-trigger"
            onClick={onOpenCart}
            className="relative p-2 text-slate-700 hover:text-intelbras-green transition-colors focus:outline-none flex items-center"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span id="cart-badge-count" className="absolute -top-1 -right-1 bg-intelbras-green text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-header / Category Bar */}
      <div className="bg-[#F8FAFC] border-t border-slate-100 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 no-scrollbar scroll-smooth">
          {/* Main Categories Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              id="cat-tab-all"
              onClick={() => {
                onViewChange('catalog');
                onCategorySelect('all');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === 'all' && activeView === 'catalog'
                  ? 'bg-intelbras-green text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Todos os Produtos
            </button>
            <button
              id="cat-tab-hardware"
              onClick={() => {
                onViewChange('catalog');
                onCategorySelect('hardware');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === 'hardware' && activeView === 'catalog'
                  ? 'bg-intelbras-green text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Fechaduras e Hardwares
            </button>

            <button
              id="cat-tab-service"
              onClick={() => {
                onViewChange('catalog');
                onCategorySelect('service');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === 'service' && activeView === 'catalog'
                  ? 'bg-intelbras-green text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Serviços de TI
            </button>
            <button
              id="cat-tab-rental"
              onClick={() => {
                onViewChange('catalog');
                onCategorySelect('rental');
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                selectedCategory === 'rental' && activeView === 'catalog'
                  ? 'bg-intelbras-green text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Locação de Equipamentos
            </button>
          </div>

          {/* Quick Info Accents matching Intelbras screen */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 font-bold shrink-0">
            <span className="flex items-center gap-1.5 text-intelbras-green">
              <Check size={14} strokeWidth={3} />
              <span>10% OFF no PIX</span>
            </span>
            <span>|</span>
            <span className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => { onViewChange('tickets'); }}>
              Suporte Técnico Garantido
            </span>
            <span>|</span>
            <span className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => { onViewChange('orders'); }}>
              Acompanhar Entrega
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
