'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Sparkles, User, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { registerWorker } from './actions/auth';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    village: '',
    assignedArea: '',
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push('/dashboard');
      } else {
        alert('Access Denied. Check credentials.');
      }
    } else {
      const result = await registerWorker(formData);
      if (result.success) {
        alert('Welcome aboard! Please sign in.');
        setIsLogin(true);
      } else {
        alert(result.error || 'Registration failed');
      }
    }
    setLoading(false);
  };

  const inputIconMap = {
    email: Mail,
    password: Lock,
    name: User,
    phone: Phone,
    village: MapPin,
    assignedArea: Activity
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">

      {/* Aurora Background Layer */}
      <div className="absolute inset-0 aurora-bg z-0" />

      {/* Decorative Orbs */}
      <motion.div
        animate={{ y: [0, -40, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl z-0 pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 60, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl z-0 pointer-events-none"
      />

      {/* Main Floating Portal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[480px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] p-8 md:p-12 overflow-hidden"
      >
        {/* Card Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-teal-500/30 mb-6"
          >
            <Sparkles className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
            Rural Health AI
          </h1>
          <p className="text-slate-500">
            {isLogin ? 'Secure Access Portal' : 'Join the Network for Good'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          <AnimatePresence mode="wait" initial={false}>
            {!isLogin && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 overflow-hidden"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-minimal pl-12" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input required placeholder="Phone Number" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input-minimal pl-12" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input required placeholder="Village" value={formData.village} onChange={e => setFormData({ ...formData, village: e.target.value })} className="input-minimal pl-12" />
                  </div>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input required placeholder="Area" value={formData.assignedArea} onChange={e => setFormData({ ...formData, assignedArea: e.target.value })} className="input-minimal pl-12" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="input-minimal pl-12"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              required
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="input-minimal pl-12"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium h-14 text-lg mt-4 group"
          >
            {loading ? (
              <span className="loader-pulse" />
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-3">
            {isLogin ? "Don't have an account?" : "Already verified?"}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-teal-600 font-semibold hover:text-teal-700 transition-colors text-sm"
          >
            {isLogin ? "Register as new worker" : "Return to Login"}
          </button>
        </div>
      </motion.div>

      {/* Footer Text */}
      <div className="absolute bottom-6 text-slate-400 text-xs text-center w-full">
        © 2024 Rural Healthcare AI • Enterprise Edition
      </div>
    </div>
  );
}
