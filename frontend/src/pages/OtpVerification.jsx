import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Building2, KeyRound, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const OtpVerification = () => {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email') || '';
  const demoCode = searchParams.get('code') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demoCode) {
      setOtp(demoCode);
    }
  }, [demoCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await verifyOtp(email, otp);
      if (response.success) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.message || 'Verification failed. Please check the code.');
      }
    } catch (err) {
      setError('Server connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 transition-colors duration-300 dark:bg-slate-950">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
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
          <h2 className="mt-6 text-xl font-bold dark:text-white">Enter Security Code</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400">We sent a 6-digit OTP to {email || 'your email'}</p>
        </div>

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

          {demoCode && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ⚡ <strong>Demo mode auto-fill code:</strong> {demoCode}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center block">6-Digit Verification Code</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-4 text-center font-mono text-lg tracking-[0.4em] focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                  placeholder="000000"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Verify & Proceed'
              )}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <Link to="/forgot-password" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to request OTP
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OtpVerification;
