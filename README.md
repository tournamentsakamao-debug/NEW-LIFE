# Admin's Tournament - Professional eSports Platform

A complete, production-ready tournament management platform built with Next.js 14, Supabase, and TypeScript.

## 🚀 Features

### User Features
- ✅ Unique username & password authentication
- ✅ Real-time wallet system with deposits/withdrawals
- ✅ Browse and join tournaments
- ✅ Secure payment processing
- ✅ End-to-end encrypted chat with admin
- ✅ Transaction history tracking
- ✅ Touch animations & sound effects
- ✅ Mobile-first responsive design

### Admin Features
- ✅ Complete tournament management (CRUD)
- ✅ Transaction approval system
- ✅ User chat management
- ✅ System-wide settings control
- ✅ Maintenance mode toggle
- ✅ Analytics dashboard
- ✅ Luxury tournament badges
- ✅ User ban/unban capabilities

### Security Features
- ✅ Role-based access control (User/Admin)
- ✅ SHA-256 password hashing
- ✅ Race condition prevention on tournament joins
- ✅ SQL injection protection via Supabase RLS
- ✅ Transaction validation & fraud prevention
- ✅ Rate limiting on deposits (24h) and withdrawals (5h)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand
- **UI Components**: Custom luxury-themed components
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Git installed

### Step 1: Clone & Install
```bash
# Clone repository
git clone <your-repo-url>
cd admins-tournament

# Install dependencies
npm install
