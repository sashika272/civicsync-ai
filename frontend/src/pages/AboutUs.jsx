import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <ThemeToggle />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg">
              <Building2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            About CivicSync<span className="text-primary-600">AI</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Smart Governance for the Modern City
          </p>
        </motion.div>

        <div className="space-y-8 text-lg text-slate-700 dark:text-slate-300">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Our Mission</h2>
            <p>
              CivicSync AI bridges the gap between citizens and municipal authorities. We leverage state-of-the-art AI technology to instantly classify, route, and prioritize civic issues, transforming a bureaucratic headache into a streamlined, transparent process.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">How It Works</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Report:</strong> Citizens capture a photo and write a short description.</li>
              <li><strong>AI Analysis:</strong> Our engine auto-categorizes the issue and predicts its severity.</li>
              <li><strong>Resolution:</strong> The appropriate department is immediately notified.</li>
              <li><strong>Tracking:</strong> Real-time status updates keep citizens in the loop.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
