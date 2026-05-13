import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Sparkles,
  Shield,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

const featureItems = [
  {
    title: 'Share your best tutorials',
    description: 'Publish step-by-step guides, code snippets, and reviews with a single click.',
    icon: <Sparkles className="h-5 w-5 text-white" />,
    color: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Grow your audience',
    description: 'Get discovered by tech enthusiasts and start meaningful conversations.',
    icon: <MessageCircle className="h-5 w-5 text-white" />,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Secure account access',
    description: 'Login safely with token-based auth and keep your profile in sync.',
    icon: <Shield className="h-5 w-5 text-white" />,
    color: 'from-emerald-500 to-teal-500',
  },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', formData);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-7xl mx-auto grid gap-10 xl:grid-cols-[1.2fr_0.8fr] items-center">
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-4xl bg-linear-to-br from-indigo-700 via-violet-700 to-sky-500 p-12 text-white shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_40%)] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] font-semibold text-white/90 mb-8">
              <Zap className="h-4 w-4" />
              Fast access to TechTalks
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
              Login to build, browse, and contribute to the brightest tech community.
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-10">
              Join a platform built for engineers who want to share tutorials, product reviews, and technical insights.
              The more you contribute, the more your audience grows.
            </p>

            <div className="space-y-4">
              {featureItems.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  className={`flex w-full items-center gap-4 rounded-3xl border border-white/20 bg-white/10 p-4 text-left transition-all duration-300 ${activeFeature === index ? 'shadow-xl border-white/40 bg-white/20' : 'hover:border-white/30 hover:bg-white/15'}`}
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-3xl bg-linear-to-br ${feature.color}`}>
                    {feature.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{feature.title}</p>
                    <p className="text-sm text-indigo-100/80">{feature.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
                <p className="text-xs uppercase tracking-[0.24em] text-indigo-100/70">Active users</p>
                <p className="text-3xl font-bold mt-3">12.8k</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 border border-white/10">
                <p className="text-xs uppercase tracking-[0.24em] text-indigo-100/70">Reviews published</p>
                <p className="text-3xl font-bold mt-3">4.3k</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-4xl bg-white border border-gray-200 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.2)] p-8 sm:p-10"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-indigo-600 font-black">Login</p>
              <h2 className="text-3xl font-extrabold text-slate-900">Welcome back to TechTalks</h2>
            </div>
            <div className="inline-flex items-center rounded-3xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Secure auth
            </div>
          </div>

          <div className="grid gap-4 mb-8 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fast setup</p>
              <p className="mt-2 text-sm text-slate-600">Sign in and start publishing in seconds.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Interactive feed</p>
              <p className="mt-2 text-sm text-slate-600">See top posts, learn from others, and engage with content.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-700 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative rounded-3xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full rounded-3xl border-none bg-transparent py-4 pl-12 pr-4 text-slate-900 outline-none"
                  placeholder="hello@techtalks.io"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative rounded-3xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full rounded-3xl border-none bg-transparent py-4 pl-12 pr-24 text-slate-900 outline-none"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-3.5 text-sm font-semibold text-indigo-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="inline-block animate-spin h-5 w-5" /> : 'Sign in securely'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New to TechTalks?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
