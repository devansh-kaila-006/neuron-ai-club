import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { useLocation } from 'react-router-dom';

/**
 * NeuralPageLoader: Secure Path Resolution
 * 
 * An elite route transition interface.
 * Design Choice: Vertical laser scan, high-contrast monochrome with indigo accents.
 */
const NeuralPageLoader: React.FC = () => {
  const location = useLocation();
  const pathName = location.pathname === '/' ? 'HUB_ROOT' : location.pathname.toUpperCase().replace('/', '');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[4000] bg-[#020202] flex items-center justify-center overflow-hidden"
    >
      {/* Scanning Laser */}
      <motion.div 
        initial={{ y: '-100%' }}
        animate={{ y: '100%' }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-10 shadow-[0_0_20px_#6366f1]"
      />

      {/* Digital Shroud */}
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Central Manifestation */}
      <div className="relative z-20 flex flex-col items-center">
        {/* The Pulsing Core */}
        <div className="w-24 h-24 relative mb-8 flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-indigo-500/30 rounded-lg"
          />
          <motion.span 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-4xl font-black text-indigo-500 font-display"
          >
            Ø
          </motion.span>
        </div>

        {/* Route Details */}
        <div className="text-center font-mono">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-indigo-400 tracking-[0.6em] uppercase mb-2"
          >
            Resolving_Endpoint
          </motion.div>
          <div className="text-xl font-bold tracking-tighter text-white">
            {pathName.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Loading Progress (Fake but high-end) */}
        <div className="mt-8 flex gap-1">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                backgroundColor: ["rgba(99,102,241,0.1)", "rgba(99,102,241,0.8)", "rgba(99,102,241,0.1)"]
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
              className="w-4 h-1 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* CRT Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_15vw_rgba(0,0,0,1)] z-30" />
    </motion.div>
  );
};

export default NeuralPageLoader;
