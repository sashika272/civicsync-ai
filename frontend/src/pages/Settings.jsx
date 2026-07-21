import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Save, ArrowLeft, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';

const Settings = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Updating profile...' });
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      } else {
        setStatus({ type: 'error', msg: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error.' });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatus({ type: 'error', msg: 'Passwords do not match' });
      setTimeout(() => setStatus(null), 3000);
      return;
    }
    setStatus({ type: 'loading', msg: 'Updating password...' });
    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', msg: data.message || 'Failed to update password' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error.' });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {status && status.type !== 'loading' && <Toast message={status.msg} type={status.type} onClose={() => setStatus(null)} />}
      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to={`/${user?.role || ''}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-red-500 flex items-center gap-2 font-bold px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-8">Account Settings</motion.h1>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><User className="h-6 w-6" /></div>
              <h2 className="text-xl font-bold">Profile Details</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input required type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input required type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-500">Email Address (Cannot be changed)</label>
                <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-70 cursor-not-allowed" />
              </div>
              <button disabled={status?.type === 'loading'} type="submit" className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-center gap-2 transition-all">
                <Save className="h-5 w-5" /> Save Profile
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl"><Lock className="h-6 w-6" /></div>
              <h2 className="text-xl font-bold">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Current Password</label>
                <input required type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">New Password</label>
                <input required type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                <input required type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <button disabled={status?.type === 'loading'} type="submit" className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90 font-bold flex items-center justify-center gap-2 transition-all">
                <Lock className="h-5 w-5" /> Update Password
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
