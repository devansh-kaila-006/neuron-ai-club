
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralLoaderProps {
  onComplete: () => void;
}

const NeuralLoader: React.FC<NeuralLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'draw' | 'flash' | 'wordmark' | 'exit'>('draw');

  useEffect(() => {
    const sequence = async () => {
      // 1. Drawing the Ø (Precision SVG Path)
      await new Promise(r => setTimeout(r, 2400));
      setPhase('flash');
      
      // 2. High-intensity ignition flash
      await new Promise(r => setTimeout(r, 700));
      setPhase('wordmark');
      
      // 3. Wordmark Assembly (Kinetic Letter Reveal)
      await new Promise(r => setTimeout(r, 3200));
      setPhase('exit');
      
      // 4. Dimensional Handoff
      await new Promise(r => setTimeout(r, 1200));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  // Define SVG Paths for the exact font style from the image
  // Each path is normalized to a 100x100 box for easy scaling
  const paths = {
    N: "M10,90 V10 L90,90 V10",
    E: "M90,10 H10 V90 H90 M10,50 H70",
    U: "M10,10 V90 H90 V10",
    R: "M10,90 V10 H80 Q90,10 90,30 V40 Q90,55 75,55 H10 M60,55 L90,90",
    O_Circle: "M 50,10 A 40,40 0 1,1 50,90 A 40,40 0 1,1 50,10",
    O_Slash: "M 5,95 L 95,5" // Made longer and bigger as requested
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.1,
        filter: 'brightness(3) contrast(1.2) blur(60px)',
        transition: { duration: 1, ease: [0.7, 0, 0.3, 1] }
      }}
      className="fixed inset-0 z-[5000] bg-[#05000a] flex items-center justify-center overflow-hidden pointer-events-auto"
    >
      {/* --- CINEMATIC AMBIENCE --- */}
      <div className="absolute inset-0 z-0 select-none">
        {/* Depth Nebula */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c001a] via-[#1a0033] to-[#05000a]" />
        
        {/* Dynamic Starfield */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }}
              className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full shadow-[0_0_10px_white]"
              style={{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }}
            />
          ))}
        </div>

        {/* Constellation Mesh */}
        <div className="absolute inset-0 opacity-[0.15]">
          <svg width="100%" height="100%">
            {[...Array(12)].map((_, i) => (
              <motion.line
                key={i}
                x1={Math.random() * 100 + '%'}
                y1={Math.random() * 100 + '%'}
                x2={Math.random() * 100 + '%'}
                y2={Math.random() * 100 + '%'}
                stroke="white"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
                transition={{ duration: 15, repeat: Infinity, delay: i * 1 }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* --- CORE ANIMATION --- */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {/* PHASE 1: PRECISION DRAWING */}
          {(phase === 'draw' || phase === 'flash') && (
            <motion.div
              key="draw-phase"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(30px)' }}
              className="relative flex items-center justify-center"
            >
              <svg viewBox="0 0 100 100" className="w-56 h-56 md:w-80 md:h-80 overflow-visible">
                {/* Circle Path */}
                <motion.path
                  d={paths.O_Circle}
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    filter: phase === 'flash' ? 'drop-shadow(0 0 40px #fff)' : 'none'
                  }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
                
                {/* Long Slash Path */}
                <motion.path
                  d={paths.O_Slash}
                  fill="none"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    filter: phase === 'flash' ? 'drop-shadow(0 0 40px #fff)' : 'none'
                  }}
                  transition={{ duration: 0.8, delay: 1.4, ease: "anticipate" }}
                />

                {/* Light Tracer Head */}
                <motion.circle
                  r="2.5"
                  fill="white"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%", opacity: phase === 'draw' ? 1 : 0 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  style={{
                    offsetPath: `path("${paths.O_Circle}")`,
                    filter: 'drop-shadow(0 0 12px #fff)'
                  }}
                />
              </svg>

              {/* Flash Radiance */}
              {phase === 'flash' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.8, 1.6, 2.2] }}
                  transition={{ duration: 0.7 }}
                  className="absolute w-80 h-80 bg-white rounded-full blur-[100px]"
                />
              )}
            </motion.div>
          )}

          {/* PHASE 2: WORDMARK EXPANSION (The "NEURØN" Exact Font) */}
          {phase === 'wordmark' && (
            <motion.div
              key="wordmark-phase"
              className="flex items-center justify-center pointer-events-none"
            >
              <div className="flex items-center gap-3 md:gap-8">
                {/* Left Part: NEUR */}
                <div className="flex gap-3 md:gap-8">
                  {['N', 'E', 'U', 'R'].map((char, i) => (
                    <motion.div
                      key={char}
                      initial={{ opacity: 0, x: 100, scale: 0.5 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        type: "spring", stiffness: 80, damping: 15,
                        delay: 0.4 + i * 0.1 
                      }}
                      className="w-12 h-12 md:w-24 md:h-24 lg:w-32 lg:h-32"
                    >
                      <svg viewBox="0 0 100 100">
                        <path d={paths[char as keyof typeof paths]} fill="none" stroke="white" strokeWidth="10" strokeLinecap="square" />
                      </svg>
                    </motion.div>
                  ))}
                </div>

                {/* Central Identity: Ø */}
                <motion.div
                  initial={{ scale: 1.8, filter: 'brightness(4) blur(15px)' }}
                  animate={{ scale: 1, filter: 'brightness(1) blur(0px)' }}
                  transition={{ duration: 0.9, ease: "anticipate" }}
                  className="w-16 h-16 md:w-28 md:h-28 lg:w-40 lg:h-40 flex items-center justify-center relative"
                >
                  <svg viewBox="0 0 100 100" className="overflow-visible">
                    <path d={paths.O_Circle} fill="none" stroke="#818cf8" strokeWidth="8" />
                    <path d={paths.O_Slash} fill="none" stroke="#818cf8" strokeWidth="10" strokeLinecap="round" className="neon-text" />
                  </svg>
                  <motion.div 
                    animate={{ opacity: [0, 0.4, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-[-20%] bg-indigo-500/30 blur-[40px] rounded-full"
                  />
                </motion.div>

                {/* Right Part: N */}
                <motion.div
                  initial={{ opacity: 0, x: -100, scale: 0.5 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.9 }}
                  className="w-12 h-12 md:w-24 md:h-24 lg:w-32 lg:h-32"
                >
                  <svg viewBox="0 0 100 100">
                    <path d={paths.N} fill="none" stroke="white" strokeWidth="10" strokeLinecap="square" />
                  </svg>
                </motion.div>
              </div>

              {/* Cinematic Scan Sweep */}
              <motion.div
                initial={{ x: '-200%', skewX: -25 }}
                animate={{ x: '300%' }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 1.5 }}
                className="absolute inset-y-[-50%] w-[50%] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-3xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- SYSTEM HUD ELEMENTS --- */}
      <div className="absolute bottom-16 flex flex-col items-center">
        {/* Loading Progress Bar */}
        <div className="w-48 h-[1px] bg-white/5 relative overflow-hidden mb-6">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: phase === 'exit' ? '100%' : '75%' }}
            transition={{ duration: 7, ease: "linear" }}
            className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]"
          />
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>

        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] font-mono tracking-[0.8em] text-indigo-400 uppercase font-black pl-[0.8em]"
        >
          {phase === 'draw' && 'Constructing Synaptic Core'}
          {phase === 'flash' && 'Core Initialized'}
          {phase === 'wordmark' && 'Synchronizing Interface'}
          {phase === 'exit' && 'Protocol Verified'}
        </motion.div>
      </div>

      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
    </motion.div>
  );
};

export default NeuralLoader;
