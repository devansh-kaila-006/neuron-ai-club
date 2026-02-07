
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralLoaderProps {
  onComplete: () => void;
}

/**
 * NeuralLoader: Singularity Manifestation
 */
const NeuralLoader: React.FC<NeuralLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'void' | 'ignition' | 'stable'>('void');

  const hudData = useMemo(() => ({
    topL: `SYS_ID: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    topR: `BIT_RATE: ${(Math.random() * 1000).toFixed(2)} GB/S`,
    botL: `LAT: 12.9716 | LON: 77.5946`,
    botR: `KERNEL: NEURAL_OS_V6.0.0`
  }), []);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 600));
      setPhase('ignition');
      await new Promise(r => setTimeout(r, 2000));
      setPhase('stable');
      await new Promise(r => setTimeout(r, 800));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.1,
        transition: { duration: 0.8, ease: [0.7, 0, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[5000] bg-[#050505] flex items-center justify-center overflow-hidden font-display"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
        
        {/* HUD Elements */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-30 font-mono text-[9px] tracking-[0.4em] text-indigo-400 select-none">
          <div className="flex justify-between items-start">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
              {hudData.topL}
            </motion.div>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
              {hudData.topR}
            </motion.div>
          </div>
          <div className="flex justify-between items-end">
            <div>{hudData.botL}</div>
            <div className="text-right">
              <span className="text-white/20 mr-4">SYNC: OK</span>
              {hudData.botR}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-center">
        <div className="relative flex items-center justify-center h-40 md:h-64 lg:h-96">
          <AnimatePresence mode="wait">
            {phase !== 'void' && (
              <motion.div
                key="branding"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center font-black tracking-tighter"
              >
                <span className="text-6xl md:text-9xl lg:text-[12rem] text-white z-10 -mr-2 md:-mr-4">NEUR</span>
                <span className="text-6xl md:text-9xl lg:text-[12rem] text-indigo-500 italic px-2 md:px-6 z-20 drop-shadow-[0_0_40px_rgba(99,102,241,0.3)]">Ø</span>
                <span className="text-6xl md:text-9xl lg:text-[12rem] text-white z-10 -ml-2 md:-ml-4">N</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-hidden mt-8 md:mt-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: phase === 'stable' ? 0 : 20,
              opacity: phase === 'stable' ? 1 : 0
            }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            <span className="text-[10px] font-mono uppercase tracking-[1.5em] text-gray-500 ml-[1.5em]">
              NEURAL HUB AUTHORIZED
            </span>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/5">
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 bg-indigo-500 origin-left"
        />
      </div>
    </motion.div>
  );
};

export default NeuralLoader;
