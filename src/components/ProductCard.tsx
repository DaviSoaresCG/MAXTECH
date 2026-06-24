import React, { useState } from 'react';
import { Star, Shield, Info, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product, days?: number) => void;
  onProductClick?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [rentalDays, setRentalDays] = useState(7); // default rental duration is 7 days

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Determine discount percentage if original price is present
  const discountPercent = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  // Calculate installment values (simulated 6x interest free)
  const installmentValue = product.price / 6;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="bg-white rounded-lg border border-slate-100 hover:border-intelbras-green overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full group"
    >
      {/* Product Image Panel */}
      <div 
        onClick={() => onProductClick?.(product)}
        className="relative pt-[100%] bg-slate-50 overflow-hidden shrink-0 cursor-pointer"
      >
        {/* Custom Badges (Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.type === 'hardware' && product.stock <= 5 && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-xs">
              Últimas unidades! ({product.stock})
            </span>
          )}
          {product.type === 'rental' && (
            <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-xs">
              Locação de Equipamentos
            </span>
          )}
          {product.type === 'service' && (
            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-xs">
              Serviço de TI
            </span>
          )}
          {product.type === 'software' && (
            <span className="bg-teal-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-xs">
              Licença Digital
            </span>
          )}
          {product.id.includes('lock-1') || product.id.includes('cam-1') ? (
            <span className="bg-[#007DFE] text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-xs">
              Lançamento
            </span>
          ) : null}
        </div>

        {/* Discount Badge (Right) */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md shadow-xs animate-pulse">
            {discountPercent}% OFF
          </div>
        )}

        {/* The Image */}
        <img
          src={product.image_url}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div onClick={() => onProductClick?.(product)} className="cursor-pointer">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating) ? "text-amber-400" : "text-gray-200"}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500">{product.rating}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm text-intelbras-dark-green line-clamp-2 leading-tight min-h-[40px] mb-2 group-hover:text-intelbras-green transition-colors">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Action Section */}
        <div className="mt-2 pt-2 border-t border-slate-50">
          {/* Price render */}
          <div className="mb-3">
            {product.original_price && (
              <p className="text-xs text-slate-400 line-through leading-none mb-1">
                De {formatCurrency(product.original_price)}
              </p>
            )}

            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-intelbras-green">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {product.type === 'rental' ? ' / dia' : ' no PIX'}
              </span>
            </div>

            {product.type === 'rental' ? (
              <p className="text-[10px] text-purple-600 font-bold mt-0.5">
                Aluguel mínimo de 1 dia
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-0.5">
                ou em até 6x de {formatCurrency(installmentValue)} sem juros
              </p>
            )}
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.type === 'hardware' ? (
              <>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Frete Grátis
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Compre com instalação
                </span>
              </>
            ) : product.type === 'software' ? (
              <>
                <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  Ativação Digital Imediata
                </span>
              </>
            ) : product.type === 'service' ? (
              <>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Preço Fixo Tabelado
                </span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Garantia de 90 dias
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Suporte Integrado Incluso
                </span>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Substituição Rápida
                </span>
              </>
            )}
          </div>

          {/* Expand Details Trigger */}
          <button
            id={`toggle-details-btn-${product.id}`}
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs text-slate-500 font-semibold hover:text-intelbras-green py-2 px-1 focus:outline-none transition-colors border-b border-dashed border-slate-100 mb-3"
          >
            <span className="flex items-center gap-1">
              <Info size={13} />
              {showDetails ? 'Esconder Especificações' : 'Especificações Técnicas'}
            </span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Details Content */}
          {showDetails && (
            <div id={`product-details-${product.id}`} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1.5 animate-in fade-in duration-150">
              {product.features && product.features.length > 0 ? (
                product.features.map((feat, index) => (
                  <div key={index} className="flex items-start gap-1.5">
                    <span className="text-intelbras-green mt-0.5 font-bold">•</span>
                    <span>{feat}</span>
                  </div>
                ))
              ) : (
                <p>Nenhuma especificação adicional para este item.</p>
              )}
              {product.type === 'hardware' && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                  <Shield size={12} />
                  <span>Produto Original com Garantia MAXTECH</span>
                </div>
              )}
            </div>
          )}

          {/* Special Config for Rentals in catalog */}
          {product.type === 'rental' && (
            <div className="mb-3 bg-purple-50 border border-purple-100 p-2.5 rounded-lg flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-purple-800">Duração do Aluguel:</span>
              <div className="flex items-center gap-1 bg-white border border-purple-200 rounded-md shadow-2xs">
                <button
                  id={`rent-days-dec-${product.id}`}
                  onClick={() => setRentalDays(prev => Math.max(1, prev - 1))}
                  className="px-2 py-0.5 hover:bg-slate-100 rounded-l-md font-bold focus:outline-none"
                >
                  -
                </button>
                <span id={`rent-days-val-${product.id}`} className="px-2 font-extrabold text-slate-800">{rentalDays} dias</span>
                <button
                  id={`rent-days-inc-${product.id}`}
                  onClick={() => setRentalDays(prev => prev + 1)}
                  className="px-2 py-0.5 hover:bg-slate-100 rounded-r-md font-bold focus:outline-none"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart CTA */}
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={() => onAddToCart(product, product.type === 'rental' ? rentalDays : undefined)}
            className="w-full py-2 bg-transparent hover:bg-intelbras-green text-intelbras-green hover:text-white border border-intelbras-green rounded uppercase text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
