# 🏥 Rural Healthcare AI Platform

## 📋 Project Overview

### The Problem

Rural and underserved communities worldwide face critical healthcare challenges:

- **Limited Access to Medical Expertise**: Remote areas often lack qualified doctors and specialists, leaving community health workers to handle complex medical situations without adequate support
- **Delayed Emergency Response**: Without proper coordination systems, ambulance dispatch is inefficient, leading to preventable deaths in critical situations
- **Lack of Real-Time Decision Support**: Health workers must make life-or-death decisions without access to diagnostic tools or expert consultation
- **Poor Patient Record Management**: Paper-based systems lead to lost medical histories, making it difficult to track chronic conditions and treatment outcomes
- **Communication Gaps**: Disconnected stakeholders (workers, doctors, ambulance drivers) result in fragmented care and delayed interventions

### The Solution

The **Rural Healthcare AI Platform** is an intelligent, end-to-end healthcare management system that empowers community health workers with:

- **AI-Powered Risk Assessment**: Instant medical analysis using advanced language models to triage cases and provide treatment recommendations
- **Smart Emergency Coordination**: Automated ambulance dispatch with real-time GPS tracking and multi-segment routing
- **Unified Communication**: Seamless collaboration between health workers, doctors, and ambulance drivers through a centralized platform
- **Automated Documentation**: AI-generated medical records that ensure continuity of care
- **Role-Based Dashboards**: Tailored interfaces for each stakeholder to optimize their workflow

---

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Instant Risk Assessment**: Groq AI (Llama 3.3 70B) analyzes symptoms, vitals, and medical history in real-time
- **Smart Triage System**: Automatic classification of cases as LOW, MEDIUM, or HIGH risk based on severity
- **Treatment Recommendations**: AI-generated primary care advice and specialist requirements
- **Automated Medical Records**: Professional treatment summaries generated on case resolution
- **Predictive Analysis**: Severity scoring (1-10 scale) for prioritization

### 🚑 Smart Emergency Response
- **Multi-Segment Ambulance Routing**: Real-time GPS tracking with Ambulance → Patient → Doctor routing visualization
- **Proximity-Based Assignment**: Automatically dispatches the nearest available ambulance to the doctor's location
- **Live Status Updates**: Real-time driver notes and status visible to all stakeholders
- **Custom Map Markers**: Color-coded markers (Red: Ambulance, Blue: Doctor, Green: Patient) with pulsing animations
- **Route Optimization**: Integrated routing engine for fastest path calculation

### 📍 Real-Time Tracking & Maps
- **Interactive Leaflet Maps**: Full-featured maps with zoom, pan, and marker interactions
- **Worker-Side Tracking**: Community health workers can monitor ambulance location and ETA
- **GPS Integration**: Browser geolocation API for accurate real-time positioning
- **Multi-Point Routing**: Visualizes complete journey from ambulance → patient → doctor
- **Location Pinning**: Precise GPS coordinates for patient registration

### 👥 Role-Based Dashboards

**Community Health Workers:**
- Patient registration with GPS location pinning
- Medical alert creation with symptom tracking
- Real-time ambulance monitoring
- Patient database search (by ID, name, or phone)
- Case notes timeline for doctor collaboration
- "Add New Patient" quick action from search

**Doctors:**
- Incoming alert review and prioritization
- AI risk assessment analysis
- Ambulance dispatch for high-risk cases
- Interactive map tracking of ambulance routes
- Case resolution with AI-generated records
- Clinical notes for worker guidance
- Patient vital signs monitoring

**Ambulance Drivers:**
- Assigned task management
- Real-time GPS location sharing
- Task status updates (En Route, Arrived, Completed)
- Driver notes visible to workers and doctors
- Integrated navigation with route visualization
- Patient and doctor location display

### 🔍 Enhanced Patient Management
- **Quick Search**: Find patients by ID, name, or phone number with instant results
- **Complete Medical History**: Full record of diagnoses, treatments, medications, and notes
- **Smart Registration**: Streamlined patient onboarding with GPS location capture
- **Chronic Disease Tracking**: Monitor allergies, blood group, and ongoing conditions
- **Visit History**: Timestamped records of all medical interactions

### 📊 Case Management & Collaboration
- **Real-Time Case Notes**: Timeline-based communication between workers and doctors
- **Status Tracking**: PENDING → ASSESSED → ESCALATED → RESOLVED workflow
- **Emergency Escalation**: Automatic doctor assignment for high-risk cases
- **Collaborative Care**: Shared visibility across all stakeholders
- **Audit Trail**: Complete history of all actions and decisions

---

## 🛠️ Technology Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router and Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[React 19](https://react.dev/)** - UI library with latest features
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling framework
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations and transitions
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Database
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints
- **[Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** - Type-safe server mutations
- **[Prisma ORM](https://www.prisma.io/)** - Modern database toolkit with type safety
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[@prisma/adapter-pg](https://www.npmjs.com/package/@prisma/adapter-pg)** - PostgreSQL adapter for Prisma
- **[pg](https://www.npmjs.com/package/pg)** - PostgreSQL client for Node.js

### Authentication & Security
- **[NextAuth.js v4](https://next-auth.js.org/)** - Complete authentication solution
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing
- **[Zod](https://zod.dev/)** - Schema validation and type inference

### AI & Machine Learning
- **[Groq SDK](https://www.npmjs.com/package/groq-sdk)** - Ultra-fast AI inference
- **[Llama 3.3 70B](https://www.llama.com/)** - Advanced language model for medical analysis
- **Custom AI Prompts** - Specialized medical risk assessment and record generation

### Maps & Geolocation
- **[Leaflet](https://leafletjs.com/)** - Open-source interactive maps
- **[React Leaflet](https://react-leaflet.js.org/)** - React bindings for Leaflet
- **[Leaflet Routing Machine](https://www.lrm.control.io/)** - Route visualization and navigation
- **[@types/leaflet](https://www.npmjs.com/package/@types/leaflet)** - TypeScript definitions
- **[@types/leaflet-routing-machine](https://www.npmjs.com/package/@types/leaflet-routing-machine)** - Routing TypeScript definitions
- **Browser Geolocation API** - Real-time GPS tracking

### Data Visualization
- **[Recharts](https://recharts.org/)** - Composable charting library for analytics

### Utilities
- **[lodash.debounce](https://www.npmjs.com/package/lodash.debounce)** - Input debouncing for search
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Environment variable management

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[eslint-config-next](https://www.npmjs.com/package/eslint-config-next)** - Next.js ESLint configuration
- **TypeScript 5** - Static type checking

---

## 🚀 How to Run

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **PostgreSQL** database ([Installation Guide](https://www.postgresql.org/download/))
- **Groq API Key** ([Get one here](https://console.groq.com))

### Installation Steps

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

   Edit `.env` and configure the following:
   ```env
   # Database Connection
   DATABASE_URL="postgresql://user:password@localhost:5432/rural_healthcare"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
   
   # Groq AI API Key
   GROQ_API_KEY="your-groq-api-key-here"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database (creates tables)
   npx prisma db push
   
   # Seed with sample data (creates test users and demo data)
   npm run seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After seeding, you can login with these test accounts:

**Community Health Worker:**
- Email: `worker@healthcare.com`
- Password: `password123`

**Doctor:**
- Email: `doctor@healthcare.com`
- Password: `password123`

**Ambulance Driver:**
- Email: `ambulance@healthcare.com`
- Password: `password123`

### Database Setup Options

**Option 1: Local PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql

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

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rural_healthcare"
```

**Option 3: Cloud Providers**
- **[Supabase](https://supabase.com/)**: Free PostgreSQL with connection pooling
- **[Neon](https://neon.tech/)**: Serverless PostgreSQL
- **[Railway](https://railway.app/)**: One-click PostgreSQL deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 👨‍💻 Developer

**Md. Najmus Sakib**

- 🎓 **Education**: Computer Science & Engineering, BUET (Bangladesh University of Engineering and Technology)
- 🤖 **Specialization**: AI/ML Developer | Full Stack Developer
- 💡 **Passion**: Building intelligent solutions that leverage artificial intelligence to solve real-world problems in healthcare and underserved communities
- 🌟 **Expertise**: 
  - AI/ML: LLM integration, prompt engineering, intelligent systems
  - Full Stack: Next.js, React, TypeScript, Node.js, PostgreSQL
  - Healthcare Tech: Medical AI, emergency response systems, geospatial applications

---

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

