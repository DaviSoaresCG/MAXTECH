import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Shield, Info, Plus, Minus, ShoppingCart, Truck, Calendar, Clock, CreditCard, Check, HelpCircle, Key, ShieldCheck, Mail, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, daysOrQty?: number) => void;
  onOpenCart: () => void;
  onProductSelect: (product: Product) => void;
}

export default function ProductDetailView({ product, allProducts, onBack, onAddToCart, onOpenCart, onProductSelect }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'guarantees'>('details');
  const [cep, setCep] = useState('');
  const [shippingResult, setShippingResult] = useState<{ cost: number; days: string } | null>(null);
  const [shippingError, setShippingError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset local states when product changes (e.g., clicking related product)
  useEffect(() => {
    setQuantity(1);
    setRentalDays(7);
    setShippingResult(null);
    setShippingError('');
    setActiveTab('details');
    setCurrentImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const discountPercent = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  // 10% discount on cash payment (PIX)
  const pixPrice = product.price * 0.9;
  const installmentValue = product.price / 6;

  // Calculate total price based on item type
  const totalPrice = product.type === 'rental' 
    ? product.price * rentalDays 
    : product.price * quantity;

  const totalPixPrice = totalPrice * 0.9;

  // Simulated shipping calculator
  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError('');
    setShippingResult(null);

    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setShippingError('Por favor, informe um CEP válido de 8 dígitos.');
      return;
    }

    // Dynamic shipping simulation
    setTimeout(() => {
      if (cleanCep.startsWith('0') || cleanCep.startsWith('1') || cleanCep.startsWith('2')) {
        setShippingResult({ cost: 0, days: '3 a 5 dias úteis (Frete Grátis)' });
      } else {
        setShippingResult({ cost: 24.90, days: '5 a 8 dias úteis' });
      }
    }, 400);
  };

  // Get 4 related products (excluding current) of same type, or fallback to others
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id)
    .sort((a, b) => {
      if (a.type === product.type && b.type !== product.type) return -1;
      if (b.type === product.type && a.type !== product.type) return 1;
      return b.rating - a.rating;
    })
    .slice(0, 4);

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
      case 'software': return 'Software / Licença Digital';
      default: return type;
    }
  };

  const handleAddToCartClick = () => {
    if (product.type === 'rental') {
      onAddToCart(product, rentalDays);
    } else {
      // Loop to add correct quantity
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product);
      }
    }
  };

  const handleBuyNowClick = () => {
    handleAddToCartClick();
    setTimeout(() => {
      onOpenCart();
    }, 150);
  };

  const imageList = (product.images && product.images.length > 0)
    ? product.images
    : [product.image_url];

  return (
    <div id="product-detail-view" className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumbs & Back Button */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          id="detail-btn-back"
          onClick={onBack}
          className="group px-4 py-2 border border-slate-200 hover:border-intelbras-green hover:bg-slate-50 text-slate-600 hover:text-intelbras-green text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar ao Catálogo</span>
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span className="hover:text-intelbras-green cursor-pointer" onClick={onBack}>Catálogo</span>
          <span>/</span>
          <span className="capitalize">{product.type}</span>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[200px] font-bold">{product.name}</span>
        </div>
      </div>

      {/* Main Grid: Left Image, Right Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column - Image Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs flex items-center justify-center relative aspect-square group overflow-hidden">
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-black px-2.5 py-1.5 rounded-lg shadow-sm animate-pulse">
                {discountPercent}% DE DESCONTO
              </div>
            )}
            <img
              src={imageList[currentImageIndex] || 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80'}
              alt={`${product.name} - Imagem ${currentImageIndex + 1}`}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-300"
            />

            {/* Navigation Arrows for Carousel */}
            {imageList.length > 1 && (
              <>
                <button
                  id="carousel-prev-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev === 0 ? imageList.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 hover:bg-white text-slate-800 hover:text-intelbras-green rounded-full shadow-md flex items-center justify-center transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={18} className="stroke-[2.5]" />
                </button>
                <button
                  id="carousel-next-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev === imageList.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 hover:bg-white text-slate-800 hover:text-intelbras-green rounded-full shadow-md flex items-center justify-center transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={18} className="stroke-[2.5]" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-950/40 px-2 py-1 rounded-full backdrop-blur-3xs">
                  {imageList.map((_, idx) => (
                    <button
                      key={idx}
                      id={`carousel-dot-${idx}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        currentImageIndex === idx ? 'bg-white w-3.5' : 'bg-white/40 hover:bg-white/75'
                      }`}
                      aria-label={`Ir para imagem ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Interactive Thumbnails for Carousel */}
          {imageList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  id={`carousel-thumb-${idx}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden bg-white shrink-0 p-1 flex items-center justify-center transition-all ${
                    currentImageIndex === idx 
                      ? 'border-intelbras-green shadow-xs scale-102' 
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - Miniatura ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain rounded-md"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Quick trust badges under image */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-3xs space-y-1">
              <ShieldCheck size={16} className="text-intelbras-green mx-auto" />
              <p className="text-[10px] font-extrabold text-slate-700">100% Seguro</p>
              <p className="text-[9px] text-slate-400">Dados criptografados</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-3xs space-y-1">
              <Truck size={16} className="text-intelbras-green mx-auto" />
              <p className="text-[10px] font-extrabold text-slate-700">Entrega Rápida</p>
              <p className="text-[9px] text-slate-400">Rastreio completo</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-3xs space-y-1">
              <Clock size={16} className="text-intelbras-green mx-auto" />
              <p className="text-[10px] font-extrabold text-slate-700">Suporte 24/7</p>
              <p className="text-[9px] text-slate-400">Atendimento humanizado</p>
            </div>
          </div>
        </div>

        {/* Right column - Product Details & Purchase controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header information */}
          <div className="space-y-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getBadgeClass(product.type)}`}>
              {getTypeText(product.type)}
            </span>

            <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
              {product.name}
            </h1>

            {/* Ratings and Quick specs */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                      className={i < Math.floor(product.rating) ? "text-amber-400" : "text-gray-200"}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-700">{product.rating}</span>
                <span className="text-slate-400">(42 avaliações de clientes)</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <Shield size={14} className="text-slate-400" />
                <span>Garantia de Fábrica MAXTECH</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-150" />

          {/* Pricing Panel */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4 shadow-3xs">
            {/* Main Price Block */}
            <div className="space-y-1.5">
              {product.original_price && (
                <div className="flex items-center gap-2 text-slate-400 text-sm line-through">
                  <span>De {formatCurrency(product.original_price)}</span>
                  <span className="bg-red-50 text-red-500 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
                    Economize {formatCurrency(product.original_price - product.price)}
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-intelbras-green">
                  {formatCurrency(totalPrice)}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {product.type === 'rental' ? ` total para ${rentalDays} dias` : ` à vista no PIX`}
                </span>
              </div>

              {product.type === 'rental' ? (
                <p className="text-xs text-purple-600 font-extrabold flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Taxa diária de {formatCurrency(product.price)} / dia</span>
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-600">
                    Ou em até <strong className="text-slate-800">6x de {formatCurrency(installmentValue)}</strong> sem juros no cartão
                  </p>
                  <p className="text-xs text-intelbras-green font-bold">
                    Aproveite {formatCurrency(pixPrice)} com 10% de desconto adicional pagando no PIX!
                  </p>
                </div>
              )}
            </div>

            {/* Config Panel: Quantity Selector OR Rental Duration */}
            <div className="border-t border-b border-slate-100 py-4 flex flex-wrap items-center justify-between gap-4">
              {product.type === 'rental' ? (
                <div className="space-y-1.5 w-full">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Período de Locação (Dias):</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg shadow-3xs p-1">
                      <button
                        id="detail-rent-dec"
                        onClick={() => setRentalDays(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-md hover:bg-white text-slate-600 hover:text-intelbras-green font-bold text-base flex items-center justify-center transition-all focus:outline-none"
                      >
                        <Minus size={14} />
                      </button>
                      <span id="detail-rent-value" className="px-5 font-black text-sm text-slate-800 min-w-[60px] text-center">
                        {rentalDays} dias
                      </span>
                      <button
                        id="detail-rent-inc"
                        onClick={() => setRentalDays(prev => prev + 1)}
                        className="w-8 h-8 rounded-md hover:bg-white text-slate-600 hover:text-intelbras-green font-bold text-base flex items-center justify-center transition-all focus:outline-none"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">
                      Quanto mais dias alugar, maior sua flexibilidade operacional!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Quantidade:</label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {product.type === 'hardware' 
                        ? `Estoque disponível: ${product.stock} unidades` 
                        : 'Produto digital ou serviço ilimitado'}
                    </p>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg shadow-3xs p-1 w-fit">
                    <button
                      id="detail-qty-dec"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-md hover:bg-white text-slate-600 hover:text-intelbras-green font-bold text-base flex items-center justify-center transition-all focus:outline-none"
                    >
                      <Minus size={14} />
                    </button>
                    <span id="detail-qty-value" className="px-5 font-black text-sm text-slate-800 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      id="detail-qty-inc"
                      onClick={() => setQuantity(prev => {
                        if (product.type === 'hardware' && prev >= product.stock) return prev;
                        return prev + 1;
                      })}
                      disabled={product.type === 'hardware' && quantity >= product.stock}
                      className="w-8 h-8 rounded-md hover:bg-white disabled:opacity-30 text-slate-600 hover:text-intelbras-green font-bold text-base flex items-center justify-center transition-all focus:outline-none"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CTAs / Purchase buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="detail-btn-add-to-cart"
                onClick={handleAddToCartClick}
                className="py-3 px-4 border-2 border-intelbras-green hover:bg-green-50 text-intelbras-green rounded-xl uppercase text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ShoppingCart size={15} strokeWidth={2.5} />
                <span>Adicionar ao Carrinho</span>
              </button>

              <button
                id="detail-btn-buy-now"
                onClick={handleBuyNowClick}
                className="py-3 px-4 bg-intelbras-green hover:bg-intelbras-green-hover text-white rounded-xl uppercase text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Comprar Agora</span>
              </button>
            </div>
          </div>

          {/* Interactive Info Tabs (Details, Shipping Sim, Custom Guarantee info) */}
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-3xs">
            {/* Tab header buttons */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                id="tab-btn-details"
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'details' ? 'border-intelbras-green text-intelbras-green bg-white font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Características
              </button>
              <button
                id="tab-btn-shipping"
                onClick={() => setActiveTab('shipping')}
                className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'shipping' ? 'border-intelbras-green text-intelbras-green bg-white font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Prazo e Entrega
              </button>
              <button
                id="tab-btn-guarantees"
                onClick={() => setActiveTab('guarantees')}
                className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'guarantees' ? 'border-intelbras-green text-intelbras-green bg-white font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Garantias MaxTech
              </button>
            </div>

            {/* Tab contents */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div id="tab-content-details" className="space-y-4 animate-in fade-in duration-100">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Especificações Técnicas:</h4>
                    {product.features && product.features.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {product.features.map((feat, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="text-intelbras-green font-bold shrink-0 mt-0.5">✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Nenhuma especificação disponível para este item.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div id="tab-content-shipping" className="space-y-4 animate-in fade-in duration-100">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A MaxTech realiza envios para todo o território nacional. Oferecemos entrega tradicional via transportadora certificada com total rastreabilidade.
                  </p>

                  {/* CEP Form */}
                  <form onSubmit={handleCalculateShipping} className="flex flex-col sm:flex-row gap-2 max-w-md">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Truck size={14} />
                      </span>
                      <input
                        id="shipping-cep-input"
                        type="text"
                        placeholder="Digite seu CEP (Ex: 01310-100)"
                        value={cep}
                        onChange={e => setCep(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                      />
                    </div>
                    <button
                      id="shipping-btn-calc"
                      type="submit"
                      className="px-4 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white text-xs font-bold rounded-lg transition-colors shadow-3xs"
                    >
                      Calcular Frete
                    </button>
                  </form>

                  {shippingError && (
                    <p className="text-[11px] text-red-500 font-semibold">{shippingError}</p>
                  )}

                  {shippingResult && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Entrega Tradicional (Transportadora):</span>
                        <span className="font-bold text-intelbras-green">
                          {shippingResult.cost === 0 ? 'Grátis' : formatCurrency(shippingResult.cost)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock size={12} className="text-intelbras-green" />
                        <span>Prazo Previsto: <strong className="text-slate-700">{shippingResult.days}</strong></span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'guarantees' && (
                <div id="tab-content-guarantees" className="space-y-4 animate-in fade-in duration-100 text-xs text-slate-600 leading-relaxed">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck size={14} className="text-intelbras-green" />
                        <span>Garantia de Autenticidade</span>
                      </h4>
                      <p className="text-slate-500 text-[11px]">
                        Todos os equipamentos fornecidos pela MAXTECH são 100% originais e acompanham nota fiscal eletrônica, assegurando total garantia de procedência e conformidade regulatória.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1">
                        <Mail size={14} className="text-intelbras-green" />
                        <span>Ativação Digital & Suporte</span>
                      </h4>
                      <p className="text-slate-500 text-[11px]">
                        Para softwares e serviços digitais, as credenciais e códigos de ativação são gerados no momento do faturamento e enviados diretamente para o e-mail de registro de sua conta de forma instantânea.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Quem viu este item também comprou</h2>
          <p className="text-xs text-slate-400">Sugestões personalizadas baseadas no seu interesse atual</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map(prod => {
            const relInstallment = prod.price / 6;
            return (
              <div 
                key={prod.id}
                id={`related-card-${prod.id}`}
                onClick={() => {
                  if (product.id !== prod.id) {
                    onProductSelect(prod);
                  }
                }}
                className="bg-white rounded-xl border border-slate-100 hover:border-intelbras-green p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div>
                  <div className="relative pt-[100%] bg-slate-50 rounded-lg overflow-hidden mb-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mb-2 ${getBadgeClass(prod.type)}`}>
                    {getTypeText(prod.type)}
                  </span>
                  <h3 className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight group-hover:text-intelbras-green transition-colors mb-1.5">
                    {prod.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-50">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-intelbras-green">
                      {formatCurrency(prod.price)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {prod.type === 'rental' ? ' /dia' : ''}
                    </span>
                  </div>
                  {prod.type !== 'rental' && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      6x de {formatCurrency(relInstallment)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
