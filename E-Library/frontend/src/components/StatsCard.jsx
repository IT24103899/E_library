import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon, label, value, color }) => {
  // Premium vibrant gradients for each card
  const gradients = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-400 to-teal-600',
    purple: 'from-purple-500 to-fuchsia-600',
    pink: 'from-pink-500 to-rose-600',
    orange: 'from-orange-400 to-rose-500',
    indigo: 'from-indigo-500 to-violet-600'
  };

  // Dedicated intense glow shadows matching the theme
  const shadowColors = {
    blue: 'shadow-blue-500/40 hover:shadow-blue-500/60',
    green: 'shadow-teal-500/40 hover:shadow-teal-500/60',
    purple: 'shadow-fuchsia-500/40 hover:shadow-fuchsia-500/60',
    pink: 'shadow-rose-500/40 hover:shadow-rose-500/60',
    orange: 'shadow-orange-500/40 hover:shadow-orange-500/60',
    indigo: 'shadow-indigo-500/40 hover:shadow-indigo-500/60'
  };

  const bgGradient = gradients[color] || gradients.blue;
  const shadowGlow = shadowColors[color] || shadowColors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between 
        bg-gradient-to-br ${bgGradient} text-white shadow-xl ${shadowGlow} transition-shadow duration-300`}
    >
      {/* Decorative blurred background shapes to add depth */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
      
      {/* Header section with Icon in a sleek glassmorphism wrapper */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-3xl shadow-inline">
          {icon}
        </div>
      </div>
      
      {/* Dynamic Content */}
      <div className="relative z-10 mt-8 mb-1">
        <h3 className="text-white/80 text-xs font-bold tracking-widest uppercase mb-2">{label}</h3>
        <p className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
