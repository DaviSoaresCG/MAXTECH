<div align="center">
  <h1 align="center">🛠️ MAXTECH</h1>
  <p align="center"><b>Plataforma Integrada de E-commerce, Locação de Equipamentos e Central de Suporte de TI</b></p>
  <hr />
</div>

A **MAXTECH** é uma plataforma web completa desenvolvida como projeto acadêmico. Ela integra um e-commerce de soluções tecnológicas de segurança e conectividade, serviços de locação temporária de hardware, contratação de serviços técnicos especializados de TI e uma central de assistência técnica pós-venda (Service Desk) com regras de elegibilidade integradas.

---

## 🚀 Principais Funcionalidades

### 🛒 1. Catálogo Diversificado e Carrinho de Compras
*   **Venda de Hardware:** Câmeras inteligentes, fechaduras digitais e roteadores Wi-Fi 6 com controle de estoque físico automático.
*   **Locação de Equipamentos (Rentals):** Aluguel diário de notebooks corporativos e workstations de alto desempenho com cálculo dinâmico baseado na quantidade de dias.
*   **Contratação de Serviços:** Serviços como formatação física, instalação de sistemas operacionais e cabeamento estruturado de redes.
*   **Desconto no Checkout:** Concessão automática de **10% de desconto** em todos os produtos do carrinho ao selecionar a modalidade de pagamento via **PIX**.
*   **Opções de Envio:** Cálculo automático de frete para entregas físicas ou opção de retirada em mãos.

### 🎫 2. Central de Assistência e Suporte (Service Desk)
*   **Máquina de Estados de Chamados:** Fluxo dinâmico de atendimento e acompanhamento do ciclo de vida dos chamados técnicos (`Aberto` ➔ `Em Andamento` ➔ `Resolvido` ➔ `Fechado`).
*   **Invariante de Elegibilidade (Regra INV-04):** Para garantir o pós-venda idôneo, a abertura de chamados técnicos de suporte está bloqueada para clientes que não possuem no seu histórico de compras nenhum serviço de TI contratado e pago.
*   **Simulador de Perfis:** Um atalho interativo no painel de suporte permite que avaliadores alternem entre a visão de *Cliente* e de *Técnico/Administrador* para inspecionar as transições de status do chamado.

### 🛡️ 3. Painel Administrativo (Admin)
*   **Gerenciamento de Produtos:** Controle total (CRUD) para adicionar, editar ou remover itens do catálogo.
*   **Reposição de Estoque:** Ferramenta dedicada para reabastecimento físico de produtos do tipo *Hardware*.
*   **Logística de Atendimento:** Painel operacional de serviços para despachar equipes técnicas de TI (com registro de nome da equipe e timestamp) e concluir ordens de serviço.
*   **Gestão de Suporte:** Acompanhamento global e encerramento de chamados criados pelos clientes.

---

## 🛠️ Stack Tecnológica

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (estilização moderna e responsiva), Motion (framer-motion para micro-animações) e Lucide React (ícones).
*   **Backend:** Node.js, Express (API RESTful integrada), tsx e esbuild para transpilação/empacotamento de TypeScript.
*   **Persistência:** Banco de dados baseado em arquivo JSON (`db.json`) local para manter o estado da aplicação persistido entre reinicializações sem dependência de serviços externos complexos.

---

## 🐳 Como Executar o Projeto

Você pode executar o projeto localmente com o gerenciador de pacotes `npm` ou de forma isolada utilizando `Docker`.

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 18 ou superior) **OU** [Docker & Docker Compose](https://www.docker.com/)

---

### Método 1: Executando Localmente (Desenvolvimento)

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    *   Este comando iniciará o servidor Express e integrará o middleware do Vite para o frontend.
    *   Acesse o sistema pelo endereço padrão fornecido no terminal (geralmente `http://localhost:3002`).

3.  **Para gerar e testar a build de produção:**
    ```bash
    # Compila o frontend e empacota o backend
    npm run build

    # Executa o servidor de produção compilado na porta 3000 (ou configurada no .env)
    npm run start
    ```

---

### Método 2: Executando via Docker e Docker Compose

O projeto possui um arquivo `Dockerfile` multi-stage otimizado para produção e um arquivo `docker-compose.yml`.

1.  **Suba os containers da aplicação:**
    ```bash
    docker compose up -d
    ```
    *   Este comando construirá a imagem Docker contendo o build otimizado da aplicação e iniciará o container chamado `maxtech_app`.

2.  **Acesse a aplicação:**
    Abra o seu navegador e acesse:
    ```
    http://localhost:3001
    ```
    *(A porta interna do container `3000` está mapeada para a porta externa `3001` no seu computador).*

3.  **Para encerrar a execução:**
    ```bash
    docker compose down
    ```

---

## 🔑 Credenciais para Testes e Demonstração

O banco de dados simulado (`db.json`) é inicializado automaticamente com dois usuários pré-cadastrados para testar os fluxos:

| Perfil | E-mail de Acesso | Senha Padrão | Funcionalidades para Teste |
| :--- | :--- | :--- | :--- |
| **Cliente Comum** | `gabriel@maxtech.com` | `12345678` | Realizar compras, simular aluguel por dias, checkout (PIX/Cartão), verificar ineligibilidade de suporte, abrir chamados após comprar serviços. |
| **Administrador** | `admin@maxtech.com` | `12345678` | Gerenciar catálogo de produtos, reabastecer estoques, despachar equipes técnicas de serviços, e responder chamados de suporte. |

---

## 📂 Estrutura de Pastas Simplificada

```
MAXTECH/
├── dist/                  # Arquivos compilados para produção (frontend e backend)
├── src/                   # Código-fonte do Frontend (React + TypeScript)
│   ├── components/        # Componentes reutilizáveis (AdminPanel, CartModal, SupportView, etc.)
│   ├── types.ts           # Interfaces e tipos globais (Product, Order, Ticket, User)
│   ├── App.tsx            # Ponto de entrada e estado principal da aplicação
│   ├── main.tsx           # Inicialização do React
│   └── index.css          # Estilos globais e configurações Tailwind CSS
├── server.ts              # Servidor Express com APIs REST e banco de dados mock (db.json)
├── db.json                # Banco de dados persistido localmente (gerado na execução)
├── Dockerfile             # Configuração para empacotamento em container
├── docker-compose.yml     # Orquestração do container do projeto
└── package.json           # Dependências e scripts do projeto
```
