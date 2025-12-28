'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Brain, Ambulance, MapPin, Activity, Stethoscope, Users,
  ArrowRight, Sparkles, Lock, Mail, ChevronRight, Truck, Heart
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'worker' | 'doctor' | 'ambulance' | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Risk Assessment',
      description: 'Instant medical analysis using Groq AI (Llama 3.3 70B) for accurate triage',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Ambulance,
      title: 'Smart Ambulance Routing',
      description: 'Multi-segment GPS tracking with proximity-based assignment',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: MapPin,
      title: 'Real-Time Location Tracking',
      description: 'Live ambulance tracking with custom color-coded markers',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Activity,
      title: 'Automated Medical Records',
      description: 'AI-generated patient history on case resolution',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  const loginPortals = [
    {
      role: 'worker' as const,
      title: 'Community Health Worker',
      icon: Users,
      color: 'from-teal-500 to-emerald-500',
      description: 'Register patients, create alerts, and coordinate care'
    },
    {
      role: 'doctor' as const,
      title: 'Medical Doctor',
      icon: Stethoscope,
      color: 'from-indigo-500 to-blue-500',
      description: 'Review cases, provide diagnoses, and dispatch ambulances'
    },
    {
      role: 'ambulance' as const,
      title: 'Ambulance Driver',
      icon: Truck,
      color: 'from-red-500 to-rose-500',
      description: 'Receive tasks, update status, and navigate routes'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    if (result?.ok) {
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      if (session?.user?.role === 'DOCTOR') {
        router.push('/doctor/dashboard');
      } else if (session?.user?.role === 'AMBULANCE') {
        router.push('/ambulance/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      alert('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-blue-400/30 to-teal-400/30 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 shadow-lg mb-6"
          >
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-slate-700">Powered by AI • Saving Lives in Rural Areas</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            Rural Healthcare
            <span className="block bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              AI Platform
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Empowering community health workers with AI-driven medical support,
            smart ambulance routing, and real-time emergency coordination.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Login Portal Selection */}
        {!selectedRole ? (
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-bold text-center text-slate-800 mb-8"
            >
              Select Your Portal
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {loginPortals.map((portal, index) => (
                <motion.button
                  key={portal.role}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRole(portal.role)}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <portal.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{portal.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{portal.description}</p>
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 group-hover:gap-3 transition-all">
                    Login <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/60 shadow-2xl">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1"
              >
                ← Back to portals
              </button>

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${loginPortals.find(p => p.role === selectedRole)?.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                {loginPortals.find(p => p.role === selectedRole)?.icon && (
                  <div className="w-8 h-8 text-white">
                    {(() => {
                      const Icon = loginPortals.find(p => p.role === selectedRole)!.icon;
                      return <Icon className="w-8 h-8" />;
                    })()}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                {loginPortals.find(p => p.role === selectedRole)?.title}
              </h2>
              <p className="text-sm text-slate-600 text-center mb-6">
                Sign in to access your dashboard
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    required
                    type="email"
                    placeholder="Email address"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    required
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-8 text-slate-500 text-sm">
        © 2025 Rural Healthcare AI Platform • Built with ❤️ for underserved communities
      </div>
    </div>
  );
}
