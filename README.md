#Watch on youtube!! (click below thumbnail)
[![Watch on YouTube](https://img.youtube.com/vi/OTKaebtMpnc/0.jpg)](https://www.youtube.com/watch?v=OTKaebtMpnc)

# 🏥 Rural Healthcare AI Platform

An intelligent, AI-powered healthcare management system designed to empower community health workers in rural and underserved areas with real-time medical support, smart emergency coordination, and automated patient care.

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Instant Risk Assessment**: Groq AI (Llama 3.3 70B) analyzes symptoms and medical history in real-time
- **Automated Medical Records**: AI-generated patient history and treatment summaries on case resolution
- **Smart Triage**: Automatic classification of cases as LOW, MEDIUM, or HIGH risk

### 🚑 AI powered Smart Emergency Response
- **Multi-Segment Ambulance Routing**: Real-time GPS tracking with Ambulance → Patient → Doctor routing
- **Proximity-Based Assignment**: Automatically dispatches nearest available ambulance to doctor's location
- **Live Status Updates**: Driver notes and real-time status visible to all stakeholders
- **Custom Map Markers**: Color-coded markers (Red: Ambulance, Blue: Doctor, Green: Patient) with pulsing animations

### 📍 Real-Time Tracking
- **Interactive Maps**: Leaflet-based maps with routing visualization
- **Worker-Side Tracking**: Community health workers can monitor ambulance location and status
- **GPS Integration**: Browser geolocation API for accurate real-time positioning

### 👥 Role-Based Dashboards
- **Community Health Workers**: Patient registration, alert creation, ambulance tracking
- **Doctors**: Case review, diagnosis, ambulance dispatch, resolution
- **Ambulance Drivers**: Task management, status updates, route navigation

### 🔍 Enhanced Patient Management
- **Quick Search**: Find patients by ID, name, or phone number
- **Medical History**: Complete record of diagnoses, treatments, and notes
- **Smart Registration**: "Add New Patient" shortcut directly from search results

### 🔍 AI routing agent
- **Fastest routing**: Fastest routing for ambulance support using AI
- **Dynamic location updates**: Updates on digital location tracker


## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database
- **Groq API Key** ([Get one here](https://console.groq.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/najmussakib1/FutureBuilders2025_BUET_ByteBenders.git
   cd FutureBuilders2025_BUET_ByteBenders/healthcare-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/rural_healthcare"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
   
   # Groq AI
   GROQ_API_KEY="your-groq-api-key-here"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed with sample data (creates test users and data)
   npm run seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After seeding, you can login with:

**Community Health Worker:**
- Email: `worker@healthcare.com`
- Password: `password123`

**Doctor:**
- Email: `doctor@healthcare.com`
- Password: `password123`

**Ambulance Driver:**
- Email: `ambulance@healthcare.com`
- Password: `password123`

## 📖 Usage Guide

### For Community Health Workers

1. **Login** via the Worker portal
2. **Search for patients** using the Patient Database
3. **Register new patients** with GPS location pinning
4. **Create medical alerts** when patients need assistance
5. **Monitor ambulance** location and status in real-time
6. **Collaborate** with doctors via case notes timeline

### For Doctors

1. **Login** via the Doctor portal
2. **Review incoming alerts** on your dashboard
3. **Analyze AI risk assessment** and patient vitals
4. **Dispatch ambulances** for high-risk cases
5. **Track ambulance routes** on interactive maps
6. **Resolve cases** with AI-generated medical records
7. **Add clinical notes** for worker guidance

### For Ambulance Drivers

1. **Login** via the Ambulance portal
2. **View assigned tasks** with patient and doctor locations
3. **Share real-time GPS location** automatically
4. **Update task status** (En Route, Arrived, Completed)
5. **Add driver notes** visible to workers and doctors
6. **Navigate routes** using the integrated map

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet
- **Leaflet Routing Machine** - Route visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Server Actions** - Type-safe server mutations
- **NextAuth.js** - Authentication
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database

### AI & External Services
- **Groq SDK** - AI inference (Llama 3.3 70B)
- **Browser Geolocation API** - Real-time GPS tracking

## 📁 Project Structure

```
healthcare-ai/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── actions/           # Server actions
│   │   │   ├── alert.ts       # Alert management
│   │   │   ├── ambulance.ts   # Ambulance operations
│   │   │   ├── auth.ts        # Authentication
│   │   │   ├── doctor.ts      # Doctor operations
│   │   │   ├── patient.ts     # Patient management
│   │   │   └── worker.ts      # Worker operations
│   │   ├── api/
│   │   │   └── auth/          # NextAuth configuration
│   │   ├── alert/[id]/        # Alert detail pages
│   │   ├── ambulance/         # Ambulance dashboard
│   │   ├── dashboard/         # Worker dashboard
│   │   ├── doctor/            # Doctor dashboard
│   │   ├── patient/           # Patient pages
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── alert/             # Alert components
│   │   ├── layout/            # Layout components
│   │   ├── maps/              # Map components
│   │   └── patient/           # Patient components
│   └── lib/
│       ├── ai/                # AI risk assessment
│       ├── emergency/         # Emergency response logic
│       └── prisma.ts          # Prisma client
└── public/                    # Static assets
```

## 🔧 Configuration

### Database Setup Options

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Create database
createdb rural_healthcare

# Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/rural_healthcare"
```

**Option 2: Docker**
```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rural_healthcare \
  -p 5432:5432 \
  -d postgres

DATABASE_URL="postgresql://postgres:password@localhost:5432/rural_healthcare"
```

**Option 3: Cloud Providers**
- **Supabase**: Free PostgreSQL with connection pooling
- **Neon**: Serverless PostgreSQL
- **Railway**: One-click PostgreSQL deployment

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Application URL (http://localhost:3000 for dev) | ✅ |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | ✅ |
| `GROQ_API_KEY` | Groq AI API key for risk assessment | ✅ |

## 🤖 AI Configuration

The system uses **Groq AI** with the **Llama 3.3 70B** model for:

- **Risk Assessment**: Analyzes symptoms, vitals, and medical history
- **Classification**: Categorizes cases as LOW, MEDIUM, or HIGH risk
- **Recommendations**: Provides primary care advice and specialist requirements
- **Medical Records**: Generates professional treatment summaries

### Risk Classification Guidelines

- **LOW**: Minor ailments, manageable with basic care
- **MEDIUM**: Concerning symptoms requiring urgent attention within hours
- **HIGH**: Life-threatening conditions requiring immediate ambulance dispatch

## 🗺️ Map Features

- **Custom Markers**: 
  - 🔴 Red (pulsing): Ambulance
  - 🔵 Blue: Doctor
  - 🟢 Green: Patient
- **Multi-Segment Routing**: Visualizes Ambulance → Patient → Doctor path
- **Real-Time Updates**: Ambulance location updates automatically
- **Interactive Controls**: Zoom, pan, and marker popups

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Docker

```bash
# Build image
docker build -t healthcare-ai .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e GROQ_API_KEY="your-api-key" \
  healthcare-ai
```

## 📝 License

MIT License - feel free to use this project for your healthcare initiatives!

## 🙏 Acknowledgments

Built with ❤️ to empower rural healthcare workers and improve access to medical support in underserved communities.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made for Future Builders Hackathon 2025 by Team ByteBenders (BUET)**
