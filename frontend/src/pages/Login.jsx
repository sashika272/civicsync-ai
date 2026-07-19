import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { Building2, Eye, EyeOff, Lock, Mail, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('citizen'); // default role selector
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      if (response.success) {
        setSuccessToast(`Welcome back, ${response.user.name}!`);
        setTimeout(() => {
          navigate(`/${response.user.role}`);
        }, 1200);
      } else {
        setError(response.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 transition-colors duration-300 dark:bg-slate-950">
      
      {/* Top Controls */}
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                CivicSync<span className="text-primary-600">AI</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-left">Smart Governance</p>
            </div>
          </Link>
          <h2 className="mt-6 text-xl font-bold dark:text-white">Sign In to smart city portal</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400">Access your role-based dashboard</p>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 shadow-xl"
        >
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-xs font-semibold text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Email */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-primary-600 hover:text-primary-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-10 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Hint Box for demo accounts */}
            <div className="rounded-2xl bg-primary-500/5 p-4 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              <span className="font-extrabold text-primary-600">💡 SIH Demo Login Credentials:</span>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                <li>Citizen: <code className="bg-slate-100 px-1 dark:bg-slate-800">citizen@civicsync.in</code> / <code className="bg-slate-100 px-1 dark:bg-slate-800">password123</code></li>
                <li>Officer: <code className="bg-slate-100 px-1 dark:bg-slate-800">officer@civicsync.in</code> / <code className="bg-slate-100 px-1 dark:bg-slate-800">password123</code></li>
                <li>Admin: <code className="bg-slate-100 px-1 dark:bg-slate-800">admin@civicsync.in</code> / <code className="bg-slate-100 px-1 dark:bg-slate-800">password123</code></li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs font-semibold text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
              Register here
            </Link>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {successToast && (
          <Toast 
            message={successToast} 
            type="success" 
            onClose={() => setSuccessToast('')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
