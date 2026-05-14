# 💳 SnapPay: Real-Time Digital Wallet & Payments

SnapPay is a premium, real-time digital wallet platform designed for speed, security, and scalability. It provides a complete backend-first fintech solution that lets users store, move, and track money instantly across a high-performance ecosystem.

Built with a modern, modular architecture, SnapPay enables seamless financial interactions with a "user-first" experience—ensuring every transaction is reflected in real-time without the need for manual refreshes.

---
- **Frontend (Live)**: [https://snap-pay-ashy.vercel.app](https://snap-pay-ashy.vercel.app)
- **API Documentation (Swagger)**: [https://snap-pay-production.up.railway.app/docs](https://snap-pay-production.up.railway.app/docs)

## 🚀 Core Features

- **Instant Wallet Provisioning**: Every user automatically receives a secure digital wallet upon account creation.
- **Seamless Deposits**: Integrated with **Paystack** for fast and secure fund loading.
- **P2P Transfers**: Send money to any SnapPay user in seconds with instant recipient balance updates.
- **Real-Time Synchronicity**: Powered by **WebSockets (Socket.io)** for live transaction and balance notifications.
- **Secure Withdrawals**: Effortlessly move funds from your SnapPay wallet to verified bank accounts.
- **Transaction Intelligence**: Detailed history tracking with status management and filtering.
- **Enterprise-Grade Security**: JWT-based authentication (Access & Refresh tokens) and comprehensive audit logging.
- **Asynchronous Processing**: High-performance background jobs handled via **BullMQ** for audit logs and notifications.

---

## 🏗️ Project Architecture

SnapPay is organized as a monorepo containing both the high-performance backend and the premium frontend client.

### [🖥️ Server (Backend)](./server)
The core engine built with **NestJS**, focusing on ACID-compliant financial logic and security.
- **Tech Stack**: NestJS, PostgreSQL (TypeORM), Redis (BullMQ), Socket.io, Swagger.
- **Documentation**: [Interactive API Docs](http://localhost:3001/docs)

### [🌐 Web (Frontend)](./web)
A sleek, responsive dashboard built with **Next.js 14** for a premium user experience.
- **Tech Stack**: Next.js 14, Tailwind CSS, RTK Query, Framer Motion, Socket.io Client.
- **URL**: [SnapPay Dashboard](http://localhost:3000)

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Database)
- **Redis** (Cache & Queues)

### 2. Installation
Clone the repository and install dependencies in both the `server` and `web` directories:

```bash
# Install Server Dependencies
cd server && npm install

# Install Web Dependencies
cd ../web && npm install
```

### 3. Environment Setup
Configure the `.env` files in both directories based on the provided `.env.example` templates.

### 4. Launching the Platform
Run both components simultaneously for the full experience:

```bash
# Start the Backend Server (from /server)
npm run start:dev

# Start the Frontend App (from /web)
npm run dev
```

---

## 📚 Resources & Links (Live - Production)

- **Frontend Application**: [https://snap-pay-ashy.vercel.app](https://snap-pay-ashy.vercel.app)
- **API Documentation (Swagger)**: [https://snap-pay-production.up.railway.app/docs](https://snap-pay-production.up.railway.app/docs)
- **Backend README**: [Server Details](./server/README.md)
- **Frontend README**: [Web Details](./web/README.md)

---

## 📄 License

SnapPay is licensed under the MIT License.