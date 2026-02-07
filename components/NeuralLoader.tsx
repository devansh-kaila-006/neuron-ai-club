import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralLoaderProps {
  onComplete: () => void;
}

/**
 * NeuralLoader: Singularity Manifestation
 * 
 * An elite, high-fidelity branding sequence. 
 * This version focuses on a single, grand assembly of the NEURØN identity.
 * It uses gravitational typography where the 'Ø' acts as the core ignition point.
 */
const NeuralLoader: React.FC<NeuralLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'void' | 'ignition' | 'assembly' | 'sync' | 'stable'>('void');

  // Generate random data strings for the HUD once to avoid re-renders
  const hudData = useMemo(() => ({
    topL: `SYS_ID: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    topR: `BIT_RATE: ${(Math.random() * 1000).toFixed(2)} GB/S`,
    botL: `LAT: 12.9716 | LON: 77.5946`,
    botR: `KERNEL: NEURAL_OS_V5.2.0`
  }), []);

  useEffect(() => {
    const sequence = async () => {
      // Step 1: Void to Ignition (The center point sparks)
      await new Promise(r => setTimeout(r, 800));
      setPhase('ignition');
      
      // Step 2: Assembly (Letters materialize around the core)
      await new Promise(r => setTimeout(r, 1200));
      setPhase('assembly');
      
      // Step 3: Synchronization (A data sweep confirms the link)
      await new Promise(r => setTimeout(r, 1000));
      setPhase('sync');
      
      // Step 4: Stable (Final branding hold)
      await new Promise(r => setTimeout(r, 800));
      setPhase('stable');
      
      // Step 5: Exit
      await new Promise(r => setTimeout(r, 1000));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  const letters = "NEURØN".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.2,
        filter: 'blur(40px) brightness(2)',
        transition: { duration: 1.2, ease: [0.7, 0, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[5000] bg-[#050505] flex items-center justify-center overflow-hidden font-display"
    >
      {/* Background: Quantum Fluctuations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
        
        {/* Scanning Beam (Active during Sync) */}
        <AnimatePresence>
          {phase === 'sync' && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-10"
            />
          )}
        </AnimatePresence>

        {/* HUD Elements */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-40 font-mono text-[9px] tracking-[0.4em] text-indigo-400 select-none">
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
              <span className="text-white/20 mr-4">STATUS: OK</span>
              {hudData.botR}
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding Manifestation */}
      <div className="relative z-20 flex flex-col items-center">
        <div className="relative flex items-center justify-center gap-1 md:gap-4 lg:gap-8 h-40 md:h-64 lg:h-96">
          
          {/* Gravitational Core Ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: phase === 'void' ? 0 : [1, 1.2, 1],
              opacity: phase === 'void' ? 0 : 1
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-32 h-32 md:w-64 md:h-64 border border-indigo-500/20 rounded-full blur-[2px]"
          />

          {letters.map((char, i) => {
            const isCore = char === 'Ø';
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5, y: isCore ? 0 : 20, filter: 'blur(20px)' }}
                animate={{ 
                  opacity: phase === 'void' ? 0 : (isCore ? 1 : (phase === 'assembly' || phase === 'sync' || phase === 'stable' ? 1 : 0)),
                  scale: phase === 'void' ? 0.5 : 1,
                  y: phase === 'assembly' || phase === 'sync' || phase === 'stable' ? 0 : (isCore ? 0 : 20),
                  filter: phase === 'void' ? 'blur(20px)' : (isCore ? 'blur(0px)' : (phase === 'assembly' || phase === 'sync' || phase === 'stable' ? 'blur(0px)' : 'blur(20px)')),
                  color: isCore ? '#6366f1' : '#ffffff',
                  textShadow: isCore && phase === 'sync' ? '0 0 40px rgba(99,102,241,0.8)' : 'none'
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: isCore ? 0.2 : (i * 0.1),
                  ease: [0.16, 1, 0.3, 1] 
                }}
                className={`text-6xl md:text-9xl lg:text-[14rem] font-black tracking-tighter select-none relative
                  ${isCore ? 'z-30' : 'z-20'}
                `}
              >
                {char}
                
                {/* Individual Letter Glow / Shard Effect */}
                {isCore && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 blur-3xl text-indigo-500/30 pointer-events-none"
                  >
                    {char}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Unified Tagline Reveal */}
        <div className="overflow-hidden mt-8 md:mt-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: phase === 'stable' ? 0 : 20,
              opacity: phase === 'stable' ? 1 : 0
            }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[1.5em] text-gray-500 ml-[1.5em] text-center">
              Amrita Artificial Intelligence Collective
            </span>
          </motion.div>
        </div>
      </div>

      {/* Atmospheric Vignette & Film Grain */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20vw_rgba(0,0,0,1)]" />
      
      {/* Bottom Loading Bar (Minimalist) */}
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