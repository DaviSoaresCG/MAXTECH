/**
 * Types and Interfaces for MaxTech Commerce
 */

export type ProductType = 'hardware' | 'software' | 'service' | 'rental';

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number; // For rentals, this is the daily rate (preço por dia)
  stock: number; // Only relevant for hardware
  image_url: string;
  images?: string[];
  rating: number; // 1.0 to 5.0
  original_price?: number; // For rendering discounts (e.g. 33% OFF)
  features?: string[]; // Bullets of technical specifications
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'completed';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // denormalized for easy rendering
  product_type: ProductType; // denormalized
  product_image: string; // denormalized
  price: number; // price at the time of purchase (or daily rate if rental)
  quantity: number;
  rental_days: number | null; // filled if product_type === 'rental'
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  shipping_cost: number;
  status: OrderStatus;
  address: string;
  payment_method: 'pix' | 'credit_card';
  created_at: string;
  items: OrderItem[];
  delivery_days?: number | null;
  pickup_option?: boolean;
  service_status?: 'pending' | 'dispatched' | 'completed';
  service_team?: string;
  service_dispatched_at?: string;
}

export type TicketCategory = string;

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  user_id: string;
  user_name: string; // denormalized
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface CartItem {
  product: Product;
  quantity: number;
  rental_days: number; // Only used if product.type === 'rental'
}
