import { CartItem } from '../types';

export interface ShippingEstimation {
  price: number;
  days: number;
  formattedDays: string;
  region: string;
}

/**
 * Calculates dynamic shipping costs and expected delivery days based on Brazilian CEP rules.
 */
export function estimateShipping(zip: string, items: CartItem[], pickupOption: boolean): ShippingEstimation {
  // If we only have software or service, it's always free and instant delivery
  const hasPhysical = items.some(item => item.product.type === 'hardware' || item.product.type === 'rental');
  
  if (!hasPhysical) {
    return {
      price: 0,
      days: 0,
      formattedDays: 'Entrega imediata (Digital / Suporte)',
      region: 'Todo o Brasil'
    };
  }

  // If pickupOption is true and the user opted to pick up rentals (and we only have rentals, or we choose to pickup),
  // we can handle pickup. Note: if they choose pickup and there's hardware, they still pay shipping for hardware.
  // Let's refine: if pickupOption is true, shipping for rental items is R$ 0. If they have hardware too, they pay hardware shipping.
  const hasHardware = items.some(item => item.product.type === 'hardware');
  
  if (pickupOption && !hasHardware) {
    return {
      price: 0,
      days: 1,
      formattedDays: 'Retirada na loja física (Disponível em 2 horas)',
      region: 'Loja Física MaxTech'
    };
  }

  const cleanZip = zip.replace(/\D/g, '');
  if (cleanZip.length < 8) {
    return {
      price: hasHardware ? 25.00 : 15.00, // Fallback default
      days: 3,
      formattedDays: '3 dias úteis',
      region: 'A consultar'
    };
  }

  // Region lookup based on first digit of CEP:
  const firstDigit = parseInt(cleanZip.charAt(0), 10);
  const lastDigit = parseInt(cleanZip.charAt(7), 10);

  let basePrice = 12.90;
  let multiplier = 2.00;
  let baseDays = 2;
  let region = 'Sudeste';

  switch (firstDigit) {
    case 0:
      basePrice = 11.90;
      multiplier = 0.80;
      baseDays = 1;
      region = 'Grande São Paulo';
      break;
    case 1:
      basePrice = 14.95;
      multiplier = 1.20;
      baseDays = 2;
      region = 'Interior de São Paulo';
      break;
    case 2:
      basePrice = 18.50;
      multiplier = 1.60;
      baseDays = 3;
      region = 'Rio de Janeiro / Espírito Santo';
      break;
    case 3:
      basePrice = 19.10;
      multiplier = 1.50;
      baseDays = 3;
      region = 'Minas Gerais';
      break;
    case 4:
      basePrice = 23.80;
      multiplier = 2.20;
      baseDays = 4;
      region = 'Bahia / Sergipe';
      break;
    case 5:
      basePrice = 25.50;
      multiplier = 2.50;
      baseDays = 5;
      region = 'Pernambuco / Paraíba / Rio Grande do Norte / Alagoas';
      break;
    case 6:
      basePrice = 31.00;
      multiplier = 3.50;
      baseDays = 6;
      region = 'Norte (Ceará / Maranhão / Pará / Amazonas)';
      break;
    case 7:
      basePrice = 21.00;
      multiplier = 2.00;
      baseDays = 4;
      region = 'Centro-Oeste / Distrito Federal';
      break;
    case 8:
      basePrice = 16.50;
      multiplier = 1.40;
      baseDays = 2;
      region = 'Paraná / Santa Catarina';
      break;
    case 9:
      basePrice = 18.00;
      multiplier = 1.80;
      baseDays = 3;
      region = 'Rio Grande do Sul';
      break;
  }

  // Dynamic formula: base price + (last CEP digit * multiplier)
  let calculatedPrice = basePrice + (lastDigit * multiplier);
  let calculatedDays = baseDays + (lastDigit % 3);

  // If there's hardware and rental, maybe add a small multiplier
  if (hasHardware && items.some(item => item.product.type === 'rental' && !pickupOption)) {
    calculatedPrice += 5.00;
  }

  return {
    price: Math.round(calculatedPrice * 100) / 100,
    days: calculatedDays,
    formattedDays: `${calculatedDays} a ${calculatedDays + 2} dias úteis`,
    region
  };
}
