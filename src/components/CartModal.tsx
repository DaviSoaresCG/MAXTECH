import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, Truck, CreditCard, Check, ShieldCheck, AlertCircle, Store, MapPin } from 'lucide-react';
import { CartItem, Product, User } from '../types';
import { estimateShipping } from '../utils/shipping';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onUpdateRentalDays: (productId: string, days: number) => void;
  onRemoveItem: (productId: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  zipCode: string;
  onCheckoutSuccess: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateRentalDays,
  onRemoveItem,
  currentUser,
  onOpenAuth,
  zipCode,
  onCheckoutSuccess
}: CartModalProps) {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickupOption, setPickupOption] = useState(false);
  const [localZip, setLocalZip] = useState(zipCode || '');

  // Keep local CEP in sync with global CEP
  useEffect(() => {
    if (zipCode) {
      setLocalZip(zipCode);
    }
  }, [zipCode]);

  // Check if there are physical products (hardware or rentals)
  const hasRental = cartItems.some(item => item.product.type === 'rental');
  const hasHardware = cartItems.some(item => item.product.type === 'hardware');

  // Auto-fill address for store pick up if active and there is no other hardware
  useEffect(() => {
    if (pickupOption && !hasHardware) {
      setAddress('Retirada na Loja Física MaxTech (Rua Marechal Deodoro, 120 - Centro, Florianópolis/SC - CEP 88010-020)');
    } else if (address.startsWith('Retirada na Loja')) {
      setAddress('');
    }
  }, [pickupOption, hasHardware]);

  // Reset error when cart list changes
  useEffect(() => {
    setError('');
  }, [cartItems]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calculate dynamic shipping cost and delivery days
  const shippingEstimation = estimateShipping(localZip, cartItems, pickupOption);
  const shippingCost = shippingEstimation.price;
  const deliveryDays = shippingEstimation.days;
  const formattedDays = shippingEstimation.formattedDays;

  // Calculate prices
  let subtotalOriginal = 0;
  let subtotalPixDiscounted = 0;

  cartItems.forEach(item => {
    const isRental = item.product.type === 'rental';
    const multiplier = isRental ? item.rental_days : 1;
    
    const originalLinePrice = item.product.price * item.quantity * multiplier;
    const pixLinePrice = (item.product.price * 0.9) * item.quantity * multiplier;

    subtotalOriginal += originalLinePrice;
    subtotalPixDiscounted += pixLinePrice;
  });

  const activeSubtotal = paymentMethod === 'pix' ? subtotalPixDiscounted : subtotalOriginal;
  const activeTotal = activeSubtotal + shippingCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (address.trim() === '') {
      setError('Por favor digite um endereço de entrega completo ou selecione a retirada física.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            rental_days: item.product.type === 'rental' ? item.rental_days : null
          })),
          address,
          payment_method: paymentMethod,
          shipping_cost: shippingCost,
          delivery_days: deliveryDays > 0 ? deliveryDays : null,
          pickup_option: pickupOption
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar o pedido.');
      }

      onCheckoutSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      {/* Click outside target */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Cart Content Drawer */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-intelbras-dark-green p-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="text-lg font-bold tracking-tight">Seu Carrinho</h2>
            <span className="bg-white/20 px-2 py-0.5 text-xs font-black rounded-full text-white">{cartItems.length}</span>
          </div>
          <button
            id="close-cart-drawer"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div id="cart-error-alert" className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-start gap-2 border border-red-100">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div id="cart-empty-state" className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <ShoppingBag size={32} />
              </div>
              <h3 className="font-bold text-slate-700 mb-1">Seu carrinho está vazio</h3>
              <p className="text-xs px-10">Adicione fecho de portas, câmeras, serviços de instalação ou locações de notebooks para começar!</p>
              <button
                id="cart-return-to-catalog"
                onClick={onClose}
                className="mt-6 px-5 py-2 bg-intelbras-green hover:bg-intelbras-green-hover text-white font-extrabold text-xs rounded-full shadow-md transition-colors"
              >
                Voltar ao Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, index) => {
                const isRental = item.product.type === 'rental';
                const lineMultiplier = isRental ? item.rental_days : 1;
                const unitPrice = paymentMethod === 'pix' ? (item.product.price * 0.9) : item.product.price;
                const lineTotal = unitPrice * item.quantity * lineMultiplier;

                return (
                  <div
                    key={index}
                    id={`cart-item-${item.product.id}`}
                    className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 relative animate-in fade-in"
                  >
                    {/* Image */}
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg bg-white border border-slate-150 shrink-0"
                    />

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">Tipo: {item.product.type}</p>
                      
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs font-bold text-intelbras-green">
                          {formatCurrency(unitPrice)}
                        </span>
                        {isRental && <span className="text-[10px] text-slate-400">/ dia</span>}
                      </div>

                      {/* Rental Days config inside cart */}
                      {isRental && (
                        <div className="mt-2 bg-purple-50/80 border border-purple-100/50 p-1.5 rounded-md flex items-center justify-between text-[11px] gap-2">
                          <span className="font-semibold text-purple-800">Dias de aluguel:</span>
                          <div className="flex items-center gap-1 bg-white border border-purple-200 rounded">
                            <button
                              id={`cart-item-days-dec-${item.product.id}`}
                              type="button"
                              onClick={() => onUpdateRentalDays(item.product.id, Math.max(1, item.rental_days - 1))}
                              className="px-1.5 py-0.5 hover:bg-slate-100 rounded-l text-[10px] font-bold focus:outline-none"
                            >
                              -
                            </button>
                            <span id={`cart-item-days-val-${item.product.id}`} className="px-1.5 font-bold text-slate-800">{item.rental_days}d</span>
                            <button
                              id={`cart-item-days-inc-${item.product.id}`}
                              type="button"
                              onClick={() => onUpdateRentalDays(item.product.id, item.rental_days + 1)}
                              className="px-1.5 py-0.5 hover:bg-slate-100 rounded-r text-[10px] font-bold focus:outline-none"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Quantity Selector and delete button */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                        <div className="flex items-center bg-white border border-slate-200 rounded shadow-3xs">
                          <button
                            id={`cart-item-qty-dec-${item.product.id}`}
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 hover:bg-slate-100 rounded-l text-xs font-bold focus:outline-none text-slate-500"
                          >
                            -
                          </button>
                          <span id={`cart-item-qty-val-${item.product.id}`} className="px-2 text-xs font-extrabold text-slate-800">{item.quantity}</span>
                          <button
                            id={`cart-item-qty-inc-${item.product.id}`}
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-slate-100 rounded-r text-xs font-bold focus:outline-none text-slate-500"
                          >
                            +
                          </button>
                        </div>

                        <button
                          id={`cart-item-remove-${item.product.id}`}
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal value display for line */}
                    <div className="absolute top-3 right-3 text-right text-xs font-extrabold text-slate-800">
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shipping details, address and checkout Panel (Only if cart has items) */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 bg-slate-50 p-4 shrink-0 space-y-3 max-h-[60%] overflow-y-auto">
            {/* CEP Calculator inside Cart */}
            <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1.5 shadow-3xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin size={13} className="text-intelbras-green" />
                  <span>Cálculo de Frete (CEP)</span>
                </span>
                {localZip && localZip.length === 8 && (
                  <span className="text-[9px] bg-emerald-50 text-intelbras-green border border-emerald-100 px-1.5 py-0.5 rounded font-bold uppercase">
                    {shippingEstimation.region}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  id="cart-cep-input"
                  type="text"
                  maxLength={8}
                  placeholder="Ex: 01001000"
                  value={localZip}
                  onChange={e => setLocalZip(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-intelbras-green"
                />
              </div>
              {localZip && localZip.length === 8 && (
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Entrega estimada:</span>
                  <span className="font-bold text-slate-700">{formattedDays}</span>
                </div>
              )}
            </div>

            {/* Rental Pickup Option */}
            {hasRental && (
              <div className="bg-emerald-50/50 border border-emerald-100/60 p-3 rounded-lg space-y-1.5">
                <p className="text-xs font-bold text-intelbras-dark-green flex items-center gap-1">
                  <Store size={13} className="text-intelbras-green" />
                  <span>Retirada de Locações</span>
                </p>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    id="cart-pickup-checkbox"
                    type="checkbox"
                    checked={pickupOption}
                    onChange={(e) => setPickupOption(e.target.checked)}
                    className="mt-0.5 rounded text-intelbras-green focus:ring-intelbras-green border-gray-200"
                  />
                  <div className="text-[10px] text-slate-600 leading-tight">
                    <span className="font-semibold block">Buscar / Retirar na loja física</span>
                    <span className="text-slate-400">Isenção do frete das locações. Retirada em Florianópolis/SC.</span>
                  </div>
                </label>
              </div>
            )}

            {/* Calculation summary */}
            <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-150 shadow-3xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">{formatCurrency(subtotalOriginal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Truck size={14} className="text-intelbras-green" />
                  <span>Frete {pickupOption ? '(Retirada na Loja)' : ''}</span>
                </span>
                <span className="font-bold text-slate-800">
                  {shippingCost > 0 ? formatCurrency(shippingCost) : 'Grátis'}
                </span>
              </div>
              {paymentMethod === 'pix' && (
                <div className="flex justify-between text-intelbras-green font-bold text-[11px]">
                  <span>Desconto 10% OFF no PIX</span>
                  <span>-{formatCurrency(subtotalOriginal - subtotalPixDiscounted)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 my-1.5"></div>
              <div className="flex justify-between text-sm text-slate-900 font-extrabold">
                <span>Valor Total</span>
                <span id="cart-total-value" className="text-base text-intelbras-green font-black">{formatCurrency(activeTotal)}</span>
              </div>
            </div>

            {/* Address input */}
            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {pickupOption && !hasHardware ? 'Sede de Retirada Física' : 'Endereço de Entrega Completo'}
                </label>
                <textarea
                  id="checkout-address-input"
                  required
                  rows={2}
                  disabled={pickupOption && !hasHardware}
                  placeholder={pickupOption && !hasHardware ? '' : "Rua, Número, Bairro, Cidade, Estado - CEP"}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white disabled:bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-intelbras-green/20 focus:border-intelbras-green resize-none transition-all shadow-inner"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Forma de Pagamento Simulado</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="checkout-pay-pix"
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-intelbras-light-bg border-intelbras-green text-intelbras-green shadow-3xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Check size={14} />
                    <span>Pix (10% OFF)</span>
                  </button>
                  <button
                    id="checkout-pay-cc"
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'bg-intelbras-light-bg border-intelbras-green text-intelbras-green shadow-3xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Cartão Crédito</span>
                  </button>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                id="cart-submit-checkout"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-intelbras-green hover:bg-intelbras-green-hover disabled:bg-slate-300 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
              >
                <ShieldCheck size={18} />
                <span>
                  {loading 
                    ? 'Processando transação...' 
                    : currentUser 
                      ? 'Finalizar Pedido (Simulação)' 
                      : 'Fazer Login para Comprar'}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
