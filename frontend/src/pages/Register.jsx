import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { Building2, Eye, EyeOff, Lock, Mail, Phone, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'citizen',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Water Supply',
    'Roads & Potholes',
    'Electricity',
    'Garbage & Sanitation',
    'Streetlights',
    'Traffic & Public Transport'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email) {
      setError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone) {
      setError('Mobile number is required');
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return false;
    }
    if (formData.role === 'officer' && !formData.department) {
      setError('Please select your assigned department');
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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      password: formData.password,
      department: formData.role === 'officer' ? formData.department : null
    };

    try {
      const response = await register(userData);
      if (response.success) {
        setSuccessToast('Account registered successfully!');
        setTimeout(() => {
          navigate(`/${response.user.role}`);
        }, 1200);
      } else {
        setError(response.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 transition-colors duration-300 dark:bg-slate-950">
      
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
          <h2 className="mt-6 text-xl font-bold dark:text-white">Create your Account</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400">Join the smart city reporting system</p>
        </div>

        {/* Card */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Mobile Number</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                  placeholder="Enter 10-digit number"
                  required
                />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Register As</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'citizen', department: '' })}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${formData.role === 'citizen' ? 'border-primary-600 bg-primary-600/10 text-primary-600' : 'border-slate-200 bg-transparent text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900'}`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'officer' })}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${formData.role === 'officer' ? 'border-primary-600 bg-primary-600/10 text-primary-600' : 'border-slate-200 bg-transparent text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900'}`}
                >
                  Govt Officer
                </button>
              </div>
            </div>

            {/* Department selector (if role is officer) */}
            {formData.role === 'officer' && (
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Assigned Department</label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Confirm Password</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-semibold text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
              Sign In
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

export default Register;
