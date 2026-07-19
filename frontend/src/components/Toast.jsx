import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const borders = {
    success: 'border-emerald-500/20 bg-white/95 dark:bg-slate-900/95',
    error: 'border-red-500/20 bg-white/95 dark:bg-slate-900/95',
    info: 'border-blue-500/20 bg-white/95 dark:bg-slate-900/95'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${borders[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
