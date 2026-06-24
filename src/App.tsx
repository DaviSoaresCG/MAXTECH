import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetailView from './components/ProductDetailView';
import CartModal from './components/CartModal';
import AuthModal from './components/AuthModal';
import OrdersView from './components/OrdersView';
import SupportView from './components/SupportView';
import AdminPanel from './components/AdminPanel';
import { Product, CartItem, Order, Ticket, User } from './types';
import { ShieldAlert, ArrowLeftRight, Check, Sparkles, HelpCircle, Phone, Clock, FileCheck } from 'lucide-react';

export default function App() {
  // Global Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // App navigation and filtering
  const [activeView, setActiveView] = useState<string>('catalog'); // 'catalog' | 'orders' | 'tickets'
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');

  // Domain lists fetched from Express API
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Local Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // UI Drawer / Modal toggles
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Prefilled ticket details (routed from clicking 'Abrir Chamado' inside orders)
  const [prefilledTicketTitle, setPrefilledTicketTitle] = useState('');
  const [prefilledTicketCategory, setPrefilledTicketCategory] = useState<string>('');

  // Floating notifications (toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');

  // Carousel slide state
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Selected product detail page
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const CAROUSEL_SLIDES = [
    {
      title: "Fechaduras Digitais MAXTECH",
      subtitle: "Sua casa segura e sem chaves",
      description: "Aproveite até 33% de desconto nas fechaduras de sobrepor e embutir. Proteção robusta e facilidade de acesso por senha ou chaveiro RFID.",
      buttonText: "Ver Ofertas",
      category: "hardware",
      bgClass: "bg-gradient-to-r from-emerald-900 to-slate-900",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "Locação de Computadores de Alta Performance",
      subtitle: "Sua TI completa sem custos de aquisição",
      description: "Aluguel diário flexível de notebooks e desktops Dell/HP para freelancers e microempresas. Suporte técnico e substituição imediata inclusos.",
      buttonText: "Alugar Notebook",
      category: "rental",
      bgClass: "bg-gradient-to-r from-indigo-950 to-slate-900",
      image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "Assistência Técnica e Instalação de Redes",
      subtitle: "Profissionais certificados com preço fixo tabelado",
      description: "Chega de orçamentos sob consulta! Contrate formatação ou instalação de rede cabeada direto no site e abra chamados de suporte pelo painel.",
      buttonText: "Conhecer Serviços",
      category: "service",
      bgClass: "bg-gradient-to-r from-blue-950 to-slate-900",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
    }
  ];

  // Auto scroll carousel slide
  useEffect(() => {
    if (activeView !== 'catalog') return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeView]);

  // Load current session from localStorage Token
  useEffect(() => {
    const token = localStorage.getItem('maxtech_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(user => {
        setCurrentUser(user);
      })
      .catch(() => {
        localStorage.removeItem('maxtech_auth_token');
      });
    }

    // Load initial products list
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error loading products:", err));

    // Load cached cart items
    const cachedCart = localStorage.getItem('maxtech_cart');
    if (cachedCart) {
      try {
        setCartItems(JSON.parse(cachedCart));
      } catch (e) {
        console.error("Failed to parse cached cart:", e);
      }
    }
  }, []);

  // Fetch orders and support tickets when user session is loaded
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setTickets([]);
      return;
    }

    const token = localStorage.getItem('maxtech_auth_token') || '';
    
    // Fetch orders
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders:", err));

    // Fetch tickets
    fetch('/api/tickets', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error("Error fetching tickets:", err));
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem('maxtech_auth_token', token);
    setCurrentUser(user);
    showToast(`Bem-vindo de volta, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('maxtech_auth_token');
    setCurrentUser(null);
    setActiveView('catalog');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Cart operations
  const handleAddToCart = (product: Product, days?: number) => {
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    let updatedCart: CartItem[] = [];

    if (existingIndex >= 0) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += 1;
      // If it is a rental, update the duration as well
      if (product.type === 'rental' && days) {
        updatedCart[existingIndex].rental_days = days;
      }
    } else {
      updatedCart = [
        ...cartItems,
        {
          product,
          quantity: 1,
          rental_days: product.type === 'rental' ? (days || 7) : 1
        }
      ];
    }

    setCartItems(updatedCart);
    localStorage.setItem('maxtech_cart', JSON.stringify(updatedCart));
    showToast(`"${product.name}" adicionado ao carrinho!`);
  };

  const handleUpdateCartQuantity = (productId: string, qty: number) => {
    const updated = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: qty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('maxtech_cart', JSON.stringify(updated));
  };

  const handleUpdateRentalDays = (productId: string, days: number) => {
    const updated = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, rental_days: days };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('maxtech_cart', JSON.stringify(updated));
  };

  const handleRemoveCartItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product.id !== productId);
    setCartItems(updated);
    localStorage.setItem('maxtech_cart', JSON.stringify(updated));
    showToast('Item removido do carrinho.', 'info');
  };

  const handleCheckoutSuccess = () => {
    // Empty cart state
    setCartItems([]);
    localStorage.removeItem('maxtech_cart');
    showToast('Compra finalizada com sucesso! Seu pagamento foi aprovado.', 'success');

    // Reload products to get updated stock
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));

    // Reload orders
    const token = localStorage.getItem('maxtech_auth_token') || '';
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setActiveView('orders'); // Redirect to portal orders history!
      });
  };

  const handleOpenSupportForService = (serviceName: string, category: string) => {
    setPrefilledTicketTitle(`Assistência: ${serviceName}`);
    setPrefilledTicketCategory(serviceName);
    setActiveView('tickets');
  };

  const handleReloadTickets = () => {
    const token = localStorage.getItem('maxtech_auth_token') || '';
    fetch('/api/tickets', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error("Error reloading tickets:", err));
  };

  const handleRefreshProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error refreshing products:", err));
  };

  const handleRefreshOrders = () => {
    const token = localStorage.getItem('maxtech_auth_token') || '';
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Error refreshing orders:", err));
  };

  // Check if current user has a paid service in history (Rule INV-04)
  const hasServiceInHistory = orders.some(o => 
    (o.status === 'paid' || o.status === 'completed') && 
    o.items.some(item => item.product_type === 'service')
  );

  // Filter products list based on search and category
  const filteredProducts = products.filter(prod => {
    const matchCategory = selectedCategory === 'all' || prod.type === selectedCategory;
    const matchQuery = searchQuery.trim() === '' || 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div id="maxtech-app" className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      
      {/* Dynamic Header Component */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          // clear prefilled parameters when switching
          if (view !== 'tickets') {
            setPrefilledTicketTitle('');
          }
        }}
        zipCode={zipCode}
        onZipCodeChange={setZipCode}
      />

      {/* Main Content Stage */}
      <main className="flex-grow">
        
        {/* VIEW 1: PRODUCT CATALOG & MAIN STORE (Default) */}
        {activeView === 'catalog' && (
          <div>
            {/* Promo Banner / Carousel - Geometric Balance Style */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
              <div 
                id="carousel-banner-wrapper"
                className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[350px] md:h-[350px] border border-gray-100 relative"
              >
                {/* Left side content */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-r from-white to-[#F9F9F9] relative z-10">
                  <span className="text-intelbras-green font-bold text-xs uppercase tracking-widest mb-2 block">
                    {carouselIndex === 0 ? "Lançamento Izy Home" : carouselIndex === 1 ? "Notebooks de Alta Performance" : "Assistência Técnica de TI"}
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-intelbras-dark-green leading-tight mb-4">
                    {carouselIndex === 0 ? "Sua casa inteligente do seu jeito." : CAROUSEL_SLIDES[carouselIndex].title}
                  </h2>
                  <p className="text-gray-500 mb-6 text-xs md:text-sm max-w-md leading-relaxed">
                    {CAROUSEL_SLIDES[carouselIndex].description}
                  </p>
                  
                  <button
                    id={`carousel-slide-cta-${carouselIndex}`}
                    onClick={() => setSelectedCategory(CAROUSEL_SLIDES[carouselIndex].category)}
                    className="bg-intelbras-green text-white px-8 py-3 rounded-md font-bold text-sm w-fit hover:bg-intelbras-green-hover transition-colors shadow-xs active:scale-95"
                  >
                    {CAROUSEL_SLIDES[carouselIndex].buttonText}
                  </button>
                </div>

                {/* Right side graphic panel */}
                <div className="w-full md:w-1/2 bg-[#E9F5F0] relative flex items-center justify-center py-8 md:py-0 shrink-0">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_#00A335_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  {/* Floating decorative geometric circle card */}
                  <div className="w-48 h-48 md:w-56 md:h-56 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center relative z-10 transition-all duration-500 hover:scale-105">
                    <div className="text-center">
                      <div className="text-5xl md:text-6xl animate-bounce">
                        {carouselIndex === 0 ? "🏠" : carouselIndex === 1 ? "💻" : "📞"}
                      </div>
                      <div className="font-extrabold text-intelbras-dark-green mt-2 text-sm md:text-base uppercase tracking-wider">
                        {carouselIndex === 0 ? "Izy Smart" : carouselIndex === 1 ? "MaxTech" : "Suporte 24h"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel dots in the center-left footer of the white area */}
                <div className="absolute bottom-4 left-8 md:left-12 flex items-center gap-2 z-20">
                  {CAROUSEL_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      id={`carousel-dot-${idx}`}
                      onClick={() => setCarouselIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all focus:outline-none ${
                        carouselIndex === idx ? 'bg-intelbras-green w-5' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Benefits Row */}
            <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 text-intelbras-green flex items-center justify-center shrink-0">
                  <Check size={18} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">10% OFF no Pix</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Desconto automático no checkout</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">Suporte 24/7</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assistência técnica disponível</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">Locação Descomplicada</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Substituição rápida de notebooks</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <FileCheck size={18} />
                  </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">Garantia Integrada</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Preço fixo com nota fiscal inclusa</p>
                </div>
              </div>
            </div>

            {/* Catalog Grid Section */}
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                    {selectedCategory === 'all' ? 'Catálogo Completo MaxTech' : `${selectedCategory}s Disponíveis`}
                  </h2>
                  <p className="text-xs text-slate-400">Exibindo {filteredProducts.length} itens do portfólio de tecnologia</p>
                </div>
              </div>

              {/* Grid Wrapper */}
              {filteredProducts.length === 0 ? (
                <div id="catalog-no-results" className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-3xs max-w-lg mx-auto">
                  <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <HelpCircle size={28} />
                  </div>
                  <h3 className="font-bold text-slate-700 mb-1 text-sm">Nenhum produto encontrado</h3>
                  <p className="text-xs text-slate-400">Nossa busca por "{searchQuery}" não encontrou resultados. Tente limpar os filtros ou buscar por palavras-chave como "Fechadura", "Câmera" ou "Aluguel".</p>
                  <button
                    id="catalog-clear-search"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors"
                  >
                    Ver Tudo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                      onProductClick={(clickedProd) => {
                        setSelectedProduct(clickedProd);
                        setActiveView('product-detail');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MEUS PEDIDOS E PORTAL CLIENTE */}
        {activeView === 'orders' && (
          <div className="py-8">
            <OrdersView
              orders={orders}
              onOpenSupportForService={handleOpenSupportForService}
              onGoToCatalog={() => setActiveView('catalog')}
            />
          </div>
        )}

        {/* VIEW 3: CENTRAL DE CHAMADOS / SUPORTE */}
        {activeView === 'tickets' && (
          <div className="py-8">
            <SupportView
              tickets={tickets}
              currentUser={currentUser}
              orders={orders}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              hasServiceInHistory={hasServiceInHistory}
              onGoToServicesCategory={() => {
                setActiveView('catalog');
                setSelectedCategory('service');
              }}
              onReloadTickets={handleReloadTickets}
              prefilledTitle={prefilledTicketTitle}
              prefilledCategory={prefilledTicketCategory}
            />
          </div>
        )}

        {/* VIEW 4: PAINEL ADMINISTRATIVO */}
        {activeView === 'admin' && (
          <div className="py-8 animate-in fade-in duration-150">
            <AdminPanel
              products={products}
              currentUser={currentUser}
              orders={orders}
              onRefreshProducts={handleRefreshProducts}
              onRefreshOrders={handleRefreshOrders}
              onGoToCatalog={() => setActiveView('catalog')}
            />
          </div>
        )}

        {/* VIEW 5: DETALHES DO PRODUTO (PÁGINA DE VISUALIZAÇÃO) */}
        {activeView === 'product-detail' && selectedProduct && (
          <div className="py-6">
            <ProductDetailView
              product={selectedProduct}
              allProducts={products}
              onBack={() => setActiveView('catalog')}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              onProductSelect={(prod) => setSelectedProduct(prod)}
            />
          </div>
        )}

      </main>

      {/* Footer Block - Geometric Balance Style */}
      <footer className="bg-white text-slate-600 border-t border-gray-200 mt-12 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          {/* Column 1: Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-intelbras-dark-green uppercase tracking-tighter">MAXTECH</h3>
            <p className="text-slate-500 leading-relaxed">
              MaxTech Commerce é uma marca líder na venda e locação certificada de equipamentos e serviços integrados de tecnologia.
            </p>
            <div className="flex items-center gap-1.5 text-intelbras-dark-green font-bold mt-2">
              <Phone size={14} className="text-intelbras-green" />
              <span>0800 704 2767</span>
            </div>
          </div>

          {/* Column 2: Quick navigation */}
          <div className="space-y-2">
            <h4 className="text-intelbras-dark-green font-bold uppercase tracking-wider mb-2">Compre por Categoria</h4>
            <ul className="space-y-1.5 text-slate-500 font-medium">
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => { setActiveView('catalog'); setSelectedCategory('hardware'); }}>Fechaduras Digitais</li>
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => { setActiveView('catalog'); setSelectedCategory('hardware'); }}>Câmeras de Segurança</li>
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => { setActiveView('catalog'); setSelectedCategory('service'); }}>Assistência Técnica</li>
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => { setActiveView('catalog'); setSelectedCategory('rental'); }}>Locação de Notebooks</li>
            </ul>
          </div>

          {/* Column 3: Client Area */}
          <div className="space-y-2">
            <h4 className="text-intelbras-dark-green font-bold uppercase tracking-wider mb-2">Área do Cliente</h4>
            <ul className="space-y-1.5 text-slate-500 font-medium">
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => currentUser ? setActiveView('orders') : setIsAuthModalOpen(true)}>Histórico de Compras</li>
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => currentUser ? setActiveView('orders') : setIsAuthModalOpen(true)}>Contratos de Locação</li>
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => currentUser ? setActiveView('tickets') : setIsAuthModalOpen(true)}>Abertura de Chamados</li>
              <li className="hover:text-intelbras-green cursor-pointer transition-colors" onClick={() => setIsAuthModalOpen(true)}>Cadastro e Onboarding</li>
            </ul>
          </div>

          {/* Column 4: Quality seals */}
          <div className="space-y-3">
            <h4 className="text-intelbras-dark-green font-bold uppercase tracking-wider mb-2">Segurança e Garantia</h4>
            <p className="text-slate-500 leading-relaxed">
              Todos os pedidos de hardware e serviços de TI acompanham certificado de garantia. Prazos estritos de devolução baseados no Código do Consumidor.
            </p>
            <div className="flex gap-2">
              <span className="bg-slate-50 border border-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-sm text-[10px] uppercase">
                Compra Protegida
              </span>
              <span className="bg-slate-50 border border-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-sm text-[10px] uppercase">
                ISO 9001
              </span>
            </div>
          </div>
        </div>

        {/* Sub-footer copyright */}
        <div className="border-t border-gray-200 bg-slate-50 py-4 px-4 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} MaxTech Commerce. Desenvolvido com React, Express, Tailwind CSS e TypeScript.
        </div>
      </footer>

      {/* MODAL 1: AUTHENTICATION DIALOG */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* DRAWER 2: HIBRIDO SHOPPING CART SIDE DRAWER */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onUpdateRentalDays={handleUpdateRentalDays}
        onRemoveItem={handleRemoveCartItem}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthModalOpen(true);
        }}
        zipCode={zipCode}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* POPUP FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div 
          id="toast-notification-popover"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastType === 'success' 
              ? 'bg-[#002B0F] border-intelbras-green text-white' 
              : 'bg-slate-900 border-slate-700 text-white'
          }`}
        >
          {toastType === 'success' ? (
            <div className="p-1 bg-intelbras-green rounded-full text-white shrink-0">
              <Check size={14} strokeWidth={3} />
            </div>
          ) : (
            <div className="p-1 bg-slate-800 rounded-full text-white shrink-0">
              <Sparkles size={14} />
            </div>
          )}
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
