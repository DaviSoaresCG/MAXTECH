import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Product, Order, Ticket, User, OrderItem, TicketStatus } from './src/types';

// Simple file-based database for persistence
const DB_PATH = path.join(process.cwd(), 'db.json');

// Initial products matching the specifications
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-lock-1',
    name: 'Fechadura Digital de Sobrepor FD 1000 D MAXTECH',
    description: 'Abertura por senha de até 9 usuários. Praticidade e segurança para controle de acesso em portas de madeira.',
    type: 'hardware',
    price: 269.91,
    original_price: 401.60,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    features: ['Teclado touch luminoso', 'Alimentação por 4 pilhas AA', 'Aviso de pilhas fracas', 'Função não perturbe']
  },
  {
    id: 'prod-lock-2',
    name: 'Fechadura Digital de Sobrepor FR 201 V MAXTECH',
    description: 'Controle de acesso por senha e chaveiro de proximidade (RFID). Perfeita para residências e escritórios.',
    type: 'hardware',
    price: 386.92,
    original_price: 529.90,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    features: ['Cadastro de até 100 chaveiros RFID', 'Cadastro de até 4 senhas', 'Sensor de fechamento automático', 'Alarme anti-arrombamento']
  },
  {
    id: 'prod-lock-3',
    name: 'Fechadura Digital de Embutir FR 221V MAXTECH',
    description: 'Modelo de embutir ideal para portas pivotantes ou convencionais. Display luminoso de alta sensibilidade.',
    type: 'hardware',
    price: 422.92,
    original_price: 599.00,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    features: ['Instalação de embutir', 'Controle por senha ou chaveiro rfid', 'Aviso sonoro de alta temperatura', 'Função senha protegida']
  },
  {
    id: 'prod-lock-4',
    name: 'Fechadura Digital de Sobrepor FR 102 MAXTECH',
    description: 'Excelente custo-benefício. Compacta, de fácil instalação e design elegante e discreto.',
    type: 'hardware',
    price: 242.91,
    original_price: 362.50,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80',
    rating: 4.6,
    features: ['Design slim elegante', 'Suporta até 9 senhas de acesso', 'Teclado de silicone retroiluminado', 'Função travamento automático']
  },
  {
    id: 'prod-cam-1',
    name: 'Câmera de Segurança Inteligente Wi-Fi iM3 MAXTECH',
    description: 'Câmera interna com visão noturna, áudio bidirecional e inteligência artificial para detecção de pessoas.',
    type: 'hardware',
    price: 289.90,
    original_price: 349.90,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    features: ['Resolução Full HD 1080p', 'Interação por voz bidirecional', 'Zoom óptico digital de 16x', 'Gravação em cartão MicroSD ou Nuvem']
  },
  {
    id: 'prod-router-1',
    name: 'Roteador Wi-Fi 6 Giga Dual Band RG 1200 MAXTECH',
    description: 'Mais velocidade, capacidade e menos latência para conectar múltiplos dispositivos ao mesmo tempo.',
    type: 'hardware',
    price: 349.90,
    original_price: 429.00,
    stock: 18,
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    features: ['Tecnologia Wi-Fi 6 de última geração', '4 antenas externas de 5dBi', 'Controle parental via app', 'Portas Gigabit Ethernet']
  },
  {
    id: 'prod-soft-office',
    name: 'Licença Anual Microsoft 365 Personal (Download Digital)',
    description: 'Word, Excel, PowerPoint, Outlook e 1TB de armazenamento seguro em nuvem no OneDrive para 1 usuário.',
    type: 'software',
    price: 299.00,
    stock: 99999, // infinite
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    features: ['Pacote Office Completo', '1TB de OneDrive', 'Atualizações contínuas gratuitas', 'Chave de ativação digital imediata']
  },
  {
    id: 'prod-soft-antivirus',
    name: 'Antivírus Kaspersky Premium (1 Dispositivo / 1 Ano)',
    description: 'Proteção completa contra vírus, malware, ransomware e transações seguras na internet para o seu PC ou celular.',
    type: 'software',
    price: 99.00,
    stock: 99999,
    image_url: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?w=500&auto=format&fit=crop&q=80',
    rating: 4.5,
    features: ['VPN de alta velocidade inclusa', 'Proteção de transações financeiras', 'Filtro de links maliciosos', 'Extremamente leve']
  },
  {
    id: 'prod-srv-format',
    name: 'Serviço de Formatação e Instalação de Sistema Operacional',
    description: 'Formatação física de HD/SSD, instalação de Windows ou Linux com drivers homologados e softwares básicos essenciais.',
    type: 'service',
    price: 120.00,
    stock: 99999,
    image_url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&auto=format&fit=crop&q=80',
    rating: 5.0,
    features: ['Backup prévio de arquivos até 100GB', 'Instalação de Drivers Oficiais', 'Garantia de 90 dias', 'Execução por técnico certificado']
  },
  {
    id: 'prod-srv-net',
    name: 'Instalação e Certificação de Redes Locais e Cabeamento',
    description: 'Passagem de cabos Cat6, clipagem, configuração de roteadores e teste de velocidade com emissão de laudo técnico de cobertura.',
    type: 'service',
    price: 350.00,
    stock: 99999,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    features: ['Passagem até 4 pontos de rede', 'Organização de cabos e rack', 'Testes de velocidade reais', 'Incluso material de consumo básico']
  },
  {
    id: 'prod-rent-note',
    name: 'Aluguel de Notebook Dell Latitude i5 (Preço Diário)',
    description: 'Notebook de alta performance para trabalho remoto ou backup. Processador Core i5, 8GB de RAM e SSD de 256GB.',
    type: 'rental',
    price: 15.00, // diária
    stock: 10, // 10 notebooks em estoque para alugar
    image_url: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    features: ['Processador Intel Core i5', '8GB RAM / 256GB SSD', 'Bateria com autonomia de 6h', 'Suporte técnico incluso no aluguel']
  },
  {
    id: 'prod-rent-desktop',
    name: 'Aluguel de Computador de Mesa Core i7 Workstation (Preço Diário)',
    description: 'Workstation robusta para tarefas que exigem alto processamento de dados ou edição de imagens. Monitor 21.5" incluso.',
    type: 'rental',
    price: 25.00, // diária
    stock: 5,
    image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    features: ['Processador Intel Core i7', '16GB RAM / 512GB SSD', 'Placa de Vídeo Dedicada', 'Monitor Full HD de 21.5 polegadas']
  }
];

interface Database {
  users: User[];
  passwords: Record<string, string>; // user_id -> password
  products: Product[];
  orders: Order[];
  tickets: Ticket[];
}

function loadDatabase(): Database {
  if (!fs.existsSync(DB_PATH)) {
    const db: Database = {
      users: [
        { id: 'usr-customer-1', name: 'Gabriel Alencar', email: 'gabriel@maxtech.com', role: 'customer' },
        { id: 'usr-admin-1', name: 'Administrador MAXTECH', email: 'admin@maxtech.com', role: 'admin' }
      ],
      passwords: {
        'usr-customer-1': '12345678',
        'usr-admin-1': '12345678'
      },
      products: INITIAL_PRODUCTS,
      orders: [],
      tickets: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return db;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure initialized structures
    if (!parsed.users) parsed.users = [];
    if (!parsed.passwords) parsed.passwords = {};
    if (!parsed.products) parsed.products = INITIAL_PRODUCTS;
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.tickets) parsed.tickets = [];
    return parsed;
  } catch (e) {
    console.error("Error reading database file, resetting...", e);
    const db: Database = {
      users: [
        { id: 'usr-customer-1', name: 'Gabriel Alencar', email: 'gabriel@maxtech.com', role: 'customer' },
        { id: 'usr-admin-1', name: 'Administrador MAXTECH', email: 'admin@maxtech.com', role: 'admin' }
      ],
      passwords: {
        'usr-customer-1': '12345678',
        'usr-admin-1': '12345678'
      },
      products: INITIAL_PRODUCTS,
      orders: [],
      tickets: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return db;
  }
}

function saveDatabase(db: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// Start building express server
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Middleware (not strictly necessary since we serve under same port but good for security inside iframe)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Helpers for Authentication based on Bearer Token
  const getAuthenticatedUser = (req: express.Request, db: Database): User | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    return db.users.find(u => u.id === token) || null;
  };

  // Auth Middleware
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const db = loadDatabase();
    const user = getAuthenticatedUser(req, db);
    if (!user) {
      return res.status(401).json({ error: 'Não autorizado. Por favor faça login.' });
    }
    (req as any).user = user;
    next();
  };

  // ----------------- API ROUTES -----------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Register Endpoint
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Por favor preencha todos os campos.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve possuir no mínimo 8 caracteres.' });
    }

    const db = loadDatabase();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const userId = `usr-${Math.random().toString(36).substring(2, 11)}`;
    const newUser: User = {
      id: userId,
      name,
      email: email.toLowerCase(),
      role: 'customer' // default role is customer
    };

    db.users.push(newUser);
    db.passwords[userId] = password;
    saveDatabase(db);

    res.json({ token: userId, user: newUser });
  });

  // Login Endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor preencha e-mail e senha.' });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const storedPassword = db.passwords[user.id];
    if (storedPassword !== password) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    res.json({ token: user.id, user });
  });

  // Me Endpoint
  app.get('/api/auth/me', (req, res) => {
    const db = loadDatabase();
    const user = getAuthenticatedUser(req, db);
    if (!user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    res.json(user);
  });

  // Products Catalog Endpoint
  app.get('/api/products', (req, res) => {
    const db = loadDatabase();
    res.json(db.products);
  });

  // Admin: Create Product
  app.post('/api/products', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
    }
    const { name, description, type, price, stock, image_url, original_price, features } = req.body;
    if (!name || !description || !type || price === undefined) {
      return res.status(400).json({ error: 'Por favor preencha os campos obrigatórios (nome, descrição, tipo e preço).' });
    }

    const db = loadDatabase();
    const newProduct: Product = {
      id: `prod-${Math.random().toString(36).substring(2, 11)}`,
      name,
      description,
      type,
      price: Number(price),
      stock: type === 'hardware' ? Number(stock || 0) : 99999,
      image_url: image_url || 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80',
      rating: 5.0,
      original_price: original_price ? Number(original_price) : undefined,
      features: Array.isArray(features) ? features : (typeof features === 'string' ? (features as string).split(',').map(f => f.trim()).filter(Boolean) : [])
    };

    db.products.push(newProduct);
    saveDatabase(db);
    res.status(201).json(newProduct);
  });

  // Admin: Update Product
  app.put('/api/products/:id', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
    }
    const { id } = req.params;
    const { name, description, type, price, stock, image_url, original_price, features } = req.body;

    const db = loadDatabase();
    const productIndex = db.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const currentProduct = db.products[productIndex];
    const newType = type || currentProduct.type;

    db.products[productIndex] = {
      ...currentProduct,
      name: name || currentProduct.name,
      description: description || currentProduct.description,
      type: newType,
      price: price !== undefined ? Number(price) : currentProduct.price,
      stock: newType === 'hardware' ? Number(stock !== undefined ? stock : currentProduct.stock) : 99999,
      image_url: image_url || currentProduct.image_url,
      original_price: original_price !== undefined ? (original_price ? Number(original_price) : undefined) : currentProduct.original_price,
      features: Array.isArray(features) ? features : (typeof features === 'string' ? (features as string).split(',').map(f => f.trim()).filter(Boolean) : currentProduct.features)
    };

    saveDatabase(db);
    res.json(db.products[productIndex]);
  });

  // Admin: Delete Product
  app.delete('/api/products/:id', authMiddleware, (req, res) => {
    const currentUser = (req as any).user;
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
    }
    const { id } = req.params;

    const db = loadDatabase();
    const productIndex = db.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    db.products.splice(productIndex, 1);
    saveDatabase(db);
    res.json({ success: true, message: 'Produto deletado com sucesso.' });
  });

  // Get orders of authenticated user
  app.get('/api/orders', authMiddleware, (req, res) => {
    const db = loadDatabase();
    const currentUser = (req as any).user;
    
    // Admin gets all orders, standard user gets their own
    if (currentUser.role === 'admin') {
      res.json(db.orders);
    } else {
      const userOrders = db.orders.filter(o => o.user_id === currentUser.id);
      res.json(userOrders);
    }
  });

  // Create Order (Checkout)
  app.post('/api/orders', authMiddleware, (req, res) => {
    const { items, address, payment_method, shipping_cost, delivery_days, pickup_option } = req.body;
    const currentUser = (req as any).user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'O carrinho está vazio.' });
    }
    if (!address || address.trim() === '') {
      return res.status(400).json({ error: 'O endereço de entrega é obrigatório.' });
    }
    if (!['pix', 'credit_card'].includes(payment_method)) {
      return res.status(400).json({ error: 'Método de pagamento inválido.' });
    }

    const db = loadDatabase();

    // Verify stock first (for hardware types) - Under simple lock check
    const orderItemsToCreate: OrderItem[] = [];
    let computedTotal = 0;
    let hasHardware = false;

    for (const item of items) {
      const dbProduct = db.products.find(p => p.id === item.product_id);
      if (!dbProduct) {
        return res.status(404).json({ error: `Produto não encontrado: ${item.product_name}` });
      }

      if (dbProduct.type === 'hardware') {
        hasHardware = true;
        if (dbProduct.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para o produto: ${dbProduct.name}. Disponível: ${dbProduct.stock}, solicitado: ${item.quantity}.` 
          });
        }
      }

      // Calculate line price
      let itemPrice = dbProduct.price;
      
      // Apply 10% PIX discount on the product price if paying via PIX
      if (payment_method === 'pix') {
        itemPrice = itemPrice * 0.9;
      }

      let lineTotal = 0;
      if (dbProduct.type === 'rental') {
        const days = item.rental_days || 1;
        lineTotal = itemPrice * item.quantity * days;
      } else {
        lineTotal = itemPrice * item.quantity;
      }

      computedTotal += lineTotal;

      orderItemsToCreate.push({
        id: `itm-${Math.random().toString(36).substring(2, 11)}`,
        order_id: '', // Will be set after order creation
        product_id: dbProduct.id,
        product_name: dbProduct.name,
        product_type: dbProduct.type,
        product_image: dbProduct.image_url,
        price: itemPrice,
        quantity: item.quantity,
        rental_days: dbProduct.type === 'rental' ? (item.rental_days || 1) : null
      });
    }

    // Apply conditional shipping
    const finalShippingCost = shipping_cost !== undefined ? Number(shipping_cost) : (hasHardware ? 25.00 : 0.00);
    computedTotal += finalShippingCost;

    // Decrement stock under atomic block simulation
    for (const item of items) {
      const dbProduct = db.products.find(p => p.id === item.product_id);
      if (dbProduct && dbProduct.type === 'hardware') {
        dbProduct.stock -= item.quantity;
      }
    }

    const orderId = `ped-${Math.random().toString(36).substring(2, 11)}`;
    
    // Map order ID to items
    const finalItems = orderItemsToCreate.map(itm => ({ ...itm, order_id: orderId }));

    const newOrder: Order = {
      id: orderId,
      user_id: currentUser.id,
      total: computedTotal,
      shipping_cost: finalShippingCost,
      status: 'paid', // Fictional payment instantly approved as per specifications!
      address,
      payment_method,
      created_at: new Date().toISOString(),
      items: finalItems,
      delivery_days: delivery_days !== undefined ? Number(delivery_days) : null,
      pickup_option: !!pickup_option
    };

    db.orders.push(newOrder);
    saveDatabase(db);

    res.json(newOrder);
  });

  // Get tickets of user
  app.get('/api/tickets', authMiddleware, (req, res) => {
    const db = loadDatabase();
    const currentUser = (req as any).user;

    if (currentUser.role === 'admin') {
      res.json(db.tickets);
    } else {
      const userTickets = db.tickets.filter(t => t.user_id === currentUser.id);
      res.json(userTickets);
    }
  });

  // Create Ticket (Support Desk)
  app.post('/api/tickets', authMiddleware, (req, res) => {
    const { title, description, category } = req.body;
    const currentUser = (req as any).user;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Por favor preencha todos os campos do chamado.' });
    }

    if (!['formatting', 'maintenance', 'remote_support', 'network'].includes(category)) {
      return res.status(400).json({ error: 'Categoria de chamado inválida.' });
    }

    const db = loadDatabase();

    // PRD Rule INV-04 Check: Check if user has purchased at least one service type product in a paid order.
    const userOrders = db.orders.filter(o => o.user_id === currentUser.id && (o.status === 'paid' || o.status === 'completed'));
    let boughtService = false;

    for (const order of userOrders) {
      const serviceItem = order.items.find(itm => itm.product_type === 'service');
      if (serviceItem) {
        boughtService = true;
        break;
      }
    }

    if (!boughtService && currentUser.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Invariante de elegibilidade violada (INV-04): Você só pode abrir um chamado de suporte técnico se possuir no seu histórico de pedidos um serviço contratado (ex: Formatação ou Instalação de Redes).' 
      });
    }

    const ticketId = `chm-${Math.random().toString(36).substring(2, 11)}`;
    const newTicket: Ticket = {
      id: ticketId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      title,
      description,
      category,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.tickets.push(newTicket);
    saveDatabase(db);

    res.json(newTicket);
  });

  // Admin: Update ticket status (simulates technical progress)
  app.patch('/api/tickets/:id/status', authMiddleware, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const currentUser = (req as any).user;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Status do chamado inválido.' });
    }

    const db = loadDatabase();
    const ticket = db.tickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    // Standard users can close their own tickets, but admins can transition any ticket to any status.
    const isOwner = ticket.user_id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin && (!isOwner || status !== 'closed')) {
      return res.status(403).json({ error: 'Permissão negada para atualizar o status deste chamado.' });
    }

    ticket.status = status as TicketStatus;
    ticket.updated_at = new Date().toISOString();
    saveDatabase(db);

    res.json(ticket);
  });

  // Admin: Restock products
  app.post('/api/admin/products/:id/restock', authMiddleware, (req, res) => {
    const { quantity } = req.body;
    const { id } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Quantidade de reabastecimento inválida.' });
    }

    const db = loadDatabase();
    const product = db.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (product.type !== 'hardware') {
      return res.status(400).json({ error: 'Apenas produtos do tipo hardware possuem controle de estoque físico.' });
    }

    product.stock += quantity;
    saveDatabase(db);

    res.json(product);
  });

  // ----------------- VITE MIDDLEWARE SETUP -----------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-generate / verify database is initialized
  loadDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
