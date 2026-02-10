
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralLoaderProps {
  onComplete: () => void;
}

/**
 * NeuralLoader: Singularity Manifestation
 * 
 * Optimized for maximum performance during the transition sequence.
 * Uses Variants to coordinate the shutdown of infinite pulses during exit,
 * freeing up GPU resources for the scale/blur effects.
 */
const NeuralLoader: React.FC<NeuralLoaderProps> = ({ onComplete }) => {
  const m = motion as any;
  const [phase, setPhase] = useState<'void' | 'ignition' | 'assembly' | 'sync' | 'stable'>('void');

  const hudData = useMemo(() => ({
    topL: `SYS_ID: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    topR: `BIT_RATE: ${(Math.random() * 1000).toFixed(2)} GB/S`,
    botL: `LAT: 12.9716 | LON: 77.5946`,
    botR: `KERNEL: NEURAL_OS_V5.2.0`
  }), []);

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 600));
      setPhase('ignition');
      await new Promise(r => setTimeout(r, 1000));
      setPhase('assembly');
      await new Promise(r => setTimeout(r, 800));
      setPhase('sync');
      await new Promise(r => setTimeout(r, 700));
      setPhase('stable');
      await new Promise(r => setTimeout(r, 800));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  const letters = "NEURØN".split("");

  // Variants to stop heavy infinite animations during the exit transition
  const containerVariants = {
    initial: { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' },
    exit: { 
      opacity: 0,
      scale: 1.15,
      filter: 'blur(25px) brightness(1.8)',
      transition: { 
        duration: 0.9, 
        ease: [0.22, 1, 0.36, 1], // Quintic ease-out for a snappier feel
        when: "beforeChildren"
      } 
    }
  };

  const coreRingVariants = {
    ignition: { scale: 1, opacity: 1 },
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [0.2, 0.4, 0.2],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    },
    exit: { scale: 1.5, opacity: 0, transition: { duration: 0.5 } }
  };

  return (
    <m.div
      variants={containerVariants}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[5000] bg-[#050505] flex items-center justify-center overflow-hidden font-display will-change-[opacity,transform,filter]"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
        
        <AnimatePresence>
          {phase === 'sync' && (
            <m.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-10"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-40 font-mono text-[9px] tracking-[0.4em] text-indigo-400 select-none">
          <div className="flex justify-between items-start">
            <m.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
              {hudData.topL}
            </m.div>
            <m.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}>
              {hudData.topR}
            </m.div>
          </div>
          <div className="flex justify-between items-end">
            <div>{hudData.botL}</div>
            <div className="text-right">
              <span className="text-white/20 mr-4 uppercase">Link_Active</span>
              {hudData.botR}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-center">
        <div className="relative flex items-center justify-center gap-1 md:gap-4 lg:gap-8 h-40 md:h-64 lg:h-96">
          
          <m.div
            variants={coreRingVariants}
            animate={phase === 'void' ? 'initial' : 'pulse'}
            className="absolute w-32 h-32 md:w-64 md:h-64 border border-indigo-500/15 rounded-full blur-[1px] will-change-transform"
          />

          {letters.map((char, i) => {
            const isCore = char === 'Ø';
            
            return (
              <m.div
                key={i}
                initial={{ opacity: 0, scale: 0.7, y: isCore ? 0 : 15, filter: 'blur(10px)' }}
                animate={{ 
                  opacity: phase === 'void' ? 0 : (isCore ? 1 : (['assembly', 'sync', 'stable'].includes(phase) ? 1 : 0)),
                  scale: phase === 'void' ? 0.7 : 1,
                  y: ['assembly', 'sync', 'stable'].includes(phase) ? 0 : (isCore ? 0 : 15),
                  filter: phase === 'void' ? 'blur(10px)' : (isCore ? 'blur(0px)' : (['assembly', 'sync', 'stable'].includes(phase) ? 'blur(0px)' : 'blur(10px)')),
                  color: isCore ? '#6366f1' : '#ffffff',
                  textShadow: isCore && phase === 'sync' ? '0 0 35px rgba(99,102,241,0.6)' : 'none'
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: isCore ? 0.1 : (i * 0.08),
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className={`text-6xl md:text-9xl lg:text-[14rem] font-black tracking-tighter select-none relative will-change-[opacity,transform,filter]
                  ${isCore ? 'z-30' : 'z-20'}
                `}
              >
                {char}
                {isCore && (
                  <m.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 blur-3xl text-indigo-500/20 pointer-events-none"
                  >
                    {char}
                  </m.div>
                )}
              </m.div>
            );
          })}
        </div>

        <div className="overflow-hidden mt-8 md:mt-12">
          <m.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ 
              y: phase === 'stable' ? 0 : 15,
              opacity: phase === 'stable' ? 1 : 0
            }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[9px] md:text-xs font-mono uppercase tracking-[1.2em] text-gray-600 ml-[1.2em] text-center">
              Amrita AI Collective
            </span>
          </m.div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20vw_rgba(0,0,0,0.9)]" />
      
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-white/5">
        <m.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3.5, ease: "linear" }}
          className="absolute inset-0 bg-indigo-500 origin-left"
        />
      </div>
    </m.div>
  );
};

export default NeuralLoader;
