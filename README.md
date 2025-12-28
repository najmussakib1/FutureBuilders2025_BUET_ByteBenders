# Rural Healthcare AI Management System

An intelligent healthcare management platform for rural areas that empowers community health workers with AI-driven medical support.

## 🌟 Features

- **AI Risk Assessment**: Powered by Groq AI for instant medical analysis
- **Smart Emergency Response**: Automatic doctor assignment and ambulance dispatch
- **Patient Management**: Complete medical history tracking
- **Real-time Alerts**: Immediate notification system for medical emergencies
- **Interactive Dashboard**: Modern, responsive UI with real-time statistics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Groq API key

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd healthcare-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GROQ_API_KEY`: Your Groq AI API key
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed with sample data
   node prisma/seed.js
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Default Login Credentials

After seeding the database:
- **Email**: `worker@healthcare.com`
- **Password**: `password123`

## 📖 Usage Guide

### For Community Health Workers

1. **Login** with your credentials
2. **Search for patients** using ID, name, or phone number
3. **Create medical alerts** when patients need assistance
4. **AI analyzes** symptoms and medical history
5. **Automatic response** based on risk level:
   - **LOW**: Advice + Doctor consultation scheduled
   - **MEDIUM**: Emergency doctor notification
   - **HIGH**: Ambulance auto-dispatched + Doctor alerted

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Groq SDK (Llama 3.3 70B)
- **Auth**: NextAuth.js
- **UI**: Framer Motion, Lucide Icons

## 📁 Project Structure

```
healthcare-ai/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Sample data
├── src/
│   ├── app/
│   │   ├── actions/       # Server actions
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── patient/       # Patient pages
│   │   └── alert/         # Alert pages
│   ├── components/        # React components
│   └── lib/
│       ├── ai/            # AI risk assessment
│       ├── emergency/     # Emergency response
│       └── prisma.ts      # Prisma client
└── public/                # Static assets
```

## 🔧 Configuration

### Database Setup Options

**Option 1: Local PostgreSQL**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/rural_healthcare"
```

**Option 2: Docker**
```bash
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
DATABASE_URL="postgresql://postgres:password@localhost:5432/rural_healthcare"
```

**Option 3: Cloud (Supabase, Neon, Railway)**
Use the connection string provided by your cloud provider.

## 🤖 AI Configuration

The system uses Groq AI for medical risk assessment. The AI:
- Analyzes patient symptoms and medical history
- Classifies risk as LOW, MEDIUM, or HIGH
- Provides primary care recommendations
- Determines specialist requirements

## 📝 License

MIT License - feel free to use this project for your healthcare initiatives!

## 🙏 Acknowledgments

Built to empower rural healthcare workers and improve access to medical support in underserved communities.
