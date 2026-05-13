# SnapPay - Digital Wallet & Payments (Frontend)

SnapPay is a modern, high-performance fintech application built with Next.js 14. It provides users with a seamless experience for managing their digital wallet, performing transactions, and monitoring their financial activity in real-time.

## 🚀 Features

- **Real-time Dashboard**: Overview of balance and recent transactions with live updates via Socket.io.
- **Secure Authentication**: JWT-based authentication with persistent sessions and automatic token refresh.
- **Wallet Management**: Seamlessly deposit, withdraw, and transfer funds.
- **Transaction History**: Comprehensive history with filtering capabilities.
- **Premium UI/UX**: Built with Tailwind CSS, Framer Motion for smooth animations, and Lucide icons.
- **Type-Safe API Layer**: Integrated with Redux Toolkit (RTK) Query for efficient state management and caching.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**: Redux Toolkit & RTK Query
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Handling**: React Hook Form & Zod
- **Real-time**: Socket.io Client

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm / pnpm / yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components and feature-specific forms.
- `hooks/`: Custom React hooks for global state and socket interaction.
- `lib/`: Utility functions and shared instances (axios, socket).
- `store/`: Redux store configuration, slices, and API definitions.
- `types/`: Global TypeScript definitions.

## 📄 License

This project is licensed under the MIT License.
