# SnapPay - Digital Wallet & Payments (Backend)

The robust, scalable backend for SnapPay, built with NestJS. It handles core financial logic, secure authentication, real-time updates, and asynchronous background processing.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns using NestJS modules.
- **Secure Authentication**: JWT-based auth with Access & Refresh tokens, password hashing with bcrypt.
- **Wallet Engine**: ACID-compliant transactions for deposits, withdrawals, and peer-to-peer transfers.
- **Real-time Updates**: WebSocket integration via Socket.io for instant balance and transaction notifications.
- **Background Tasks**: BullMQ integration for asynchronous processing (e.g., audit logging, email notifications).
- **Audit Logging**: Comprehensive tracking of sensitive activities across the system.
- **Payment Integration**: Paystack integration for fund deposits.
- **API Documentation**: Interactive Swagger/OpenAPI documentation.

## 🛠 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Cache & Queues**: Redis (BullMQ)
- **Real-time**: Socket.io
- **Validation**: Class-validator & Zod
- **Documentation**: Swagger UI

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. Run database migrations:
   Apply the latest schema changes to your PostgreSQL database:
   ```bash
   npm run migration:run
   ```

4. Run the application:
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

### 🗄️ Database Migrations (Advanced)

If you modify the database entities, you can manage schema changes using the built-in TypeORM scripts:

- **Generate a new migration:**
  ```bash
  npm run migration:generate -- src/database/migrations/MigrationName
  ```
- **Revert the last migration:**
  ```bash
  npm run migration:revert
  ```

### 📚 API Documentation

Once the server is running, you can access the Swagger documentation at:
`http://localhost:3001/docs`

## 📁 Project Structure

- `src/config/`: Configuration files for database, JWT, and third-party services.
- `src/modules/`:
  - `auth/`: User registration, login, and token management.
  - `wallet/`: Core wallet logic (balance, deposit, withdraw, transfer).
  - `transactions/`: Transaction history and status tracking.
  - `gateway/`: WebSocket gateways for real-time communication.
  - `queues/`: Background job definitions and processors.
  - `audit/`: System-wide audit logging service.
  - `payment/`: Integration with external payment providers (Paystack).
  - `users/`: User profile management.
- `notifications/`: User notification system.

## 🧪 Testing

SnapPay includes a robust suite of unit tests for core modules to ensure financial logic and authentication flows remain correct.

### Running Tests

- **Run all tests:**
  ```bash
  npm run test
  ```

- **Run tests in watch mode:**
  ```bash
  npm run test:watch
  ```

- **Generate test coverage report:**
  ```bash
  npm run test:cov
  ```

- **Run specific test suite:**
  ```bash
  npx jest src/modules/payment/payment.service.spec.ts
  ```

## 📄 License

This project is licensed under the MIT License.
