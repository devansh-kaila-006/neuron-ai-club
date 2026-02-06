
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralLoaderProps {
  onComplete: () => void;
}

const NeuralLoader: React.FC<NeuralLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'singularity' | 'synthesis' | 'manifest' | 'exit'>('singularity');

  useEffect(() => {
    const sequence = async () => {
      // 1. Singularity - The point of origin stabilization
      await new Promise(r => setTimeout(r, 2000));
      setPhase('synthesis');
      
      // 2. Synthesis - Structural assembly and neural mapping
      await new Promise(r => setTimeout(r, 3500));
      setPhase('manifest');
      
      // 3. Manifest - Final identity crystallization
      await new Promise(r => setTimeout(r, 4000));
      setPhase('exit');
      
      // 4. Cleanup and handoff to core UI
      await new Promise(r => setTimeout(r, 1500));
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
        filter: 'brightness(4) blur(60px)',
        transition: { duration: 1.5, ease: [0.7, 0, 0.3, 1] }
      }}
      className="fixed inset-0 z-[5000] bg-[#010101] flex items-center justify-center overflow-hidden pointer-events-auto"
    >
      {/* --- ELITE CINEMATIC BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        
        {/* Multilayered Parallax Starfield */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, Math.random() * 0.8, 0],
                scale: [0, Math.random() * 2, 0],
                y: [0, Math.random() * -30]
              }}
              transition={{ 
                duration: Math.random() * 5 + 3, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{
                width: Math.random() * 2 + 0.5 + 'px',
                height: Math.random() * 2 + 0.5 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>

        {/* Neural Vector Grid (Bottom Perspective) */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 bg-[linear-gradient(to_top,#050505,transparent)]">
          <div 
            className="w-full h-full" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              transform: 'perspective(500px) rotateX(60deg) translateY(50px)',
              transformOrigin: 'bottom'
            }} 
          />
        </div>

        {/* Data Decryption Stream (Left/Right margins) */}
        <div className="absolute inset-y-0 left-6 w-24 opacity-10 flex flex-col gap-1 font-mono text-[6px] overflow-hidden whitespace-nowrap">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: [0, -120] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "linear" }}
            >
              0x{Math.random().toString(16).substring(2, 10).toUpperCase()} &gt;&gt; SYNAPTIC_MAP_LOADED_{i}
            </motion.div>
          ))}
        </div>

        {/* Pulsing Atmospheric Glows */}
        <motion.div 
          animate={{ 
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute inset-0 bg-radial-gradient from-indigo-950/60 via-transparent to-transparent"
        />

        {/* Hexagonal Mesh Overlay */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] mix-blend-overlay" />
      </div>

      {/* --- CENTRAL SYNTHESIS CORE --- */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* Dynamic HUD Technical Circles */}
        <AnimatePresence>
          {phase !== 'singularity' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 4, filter: 'blur(40px)' }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute flex items-center justify-center"
            >
              {/* Spinning technical rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="w-[450px] h-[450px] border border-indigo-500/10 rounded-full"
              >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-indigo-500/40" />
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-indigo-500/40" />
              </motion.div>
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute w-[550px] h-[550px] border-[0.5px] border-white/5 rounded-full"
              >
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-[0.5px] bg-white/20" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-[0.5px] bg-white/20" />
              </motion.div>
              
              {/* Radial Marker Dots */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.1, 0.6, 0.1] }}
                  transition={{ delay: i * 0.15, repeat: Infinity, duration: 2.5 }}
                  className="absolute w-1 h-1 bg-indigo-400 rounded-full"
                  style={{ transform: `rotate(${i * (360/12)}deg) translateY(-230px)` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* THE CORE COMPONENT */}
        <div className="relative flex items-center justify-center">
          
          {/* Phase 1: The Singularity Point */}
          {phase === 'singularity' && (
            <div className="relative flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 2.5, 0.4, 1.2, 1], 
                  opacity: 1,
                  boxShadow: [
                    "0 0 10px #fff",
                    "0 0 100px #6366f1",
                    "0 0 140px #a855f7",
                    "0 0 40px #fff"
                  ]
                }}
                transition={{ duration: 1.8 }}
                className="w-5 h-5 bg-white rounded-full z-20"
              />
              <motion.div 
                animate={{ scale: [1, 25], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="absolute w-5 h-5 bg-indigo-500 rounded-full blur-xl"
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Phase 2: Synthesis - The Null Symbol Birth */}
            {phase === 'synthesis' && (
              <motion.div
                key="symbol-reveal"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(40px)' }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  filter: 'blur(0px)',
                }}
                exit={{ opacity: 0, y: -80, filter: 'blur(25px)', transition: { duration: 0.8 } }}
                className="relative flex items-center justify-center"
              >
                {/* Orbital Rings around Symbol */}
                <motion.div 
                  animate={{ rotateY: 360, rotateX: 45 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[300px] h-[300px] border-[0.5px] border-indigo-500/40 rounded-full"
                  style={{ transformStyle: 'preserve-3d' }}
                />
                <motion.div 
                  animate={{ rotateY: -360, rotateX: -45 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[350px] h-[350px] border-[0.5px] border-purple-500/30 rounded-full"
                  style={{ transformStyle: 'preserve-3d' }}
                />

                <div className="text-[15rem] md:text-[20rem] font-black text-white relative font-mono select-none flex items-center justify-center">
                  <span className="relative z-10 leading-none neon-text">Ø</span>
                  
                  {/* Glitch Shadows */}
                  <motion.span 
                    animate={{ x: [-5, 5, -2], opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.12 }}
                    className="absolute inset-0 text-cyan-400 z-0 pointer-events-none"
                  >Ø</motion.span>
                  <motion.span 
                    animate={{ x: [5, -5, 2], opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.12, delay: 0.06 }}
                    className="absolute inset-0 text-rose-500 z-0 pointer-events-none"
                  >Ø</motion.span>
                  
                  {/* Internal Glow Pulse */}
                  <motion.div 
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 blur-[60px] bg-indigo-500/30 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Phase 3: Manifest - The NEURØN Wordmark */}
            {phase === 'manifest' && (
              <motion.div
                key="wordmark-reveal"
                className="flex items-center gap-2 md:gap-5 text-8xl md:text-[12rem] font-black tracking-tighter font-mono"
              >
                {['N', 'E', 'U', 'R', 'Ø', 'N'].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      y: 100,
                      rotateX: 90,
                      filter: 'blur(40px)',
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      rotateX: 0,
                      filter: 'blur(0px)',
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 90,
                      damping: 18,
                      delay: i * 0.15 
                    }}
                    className={char === 'Ø' ? 'text-indigo-500 neon-text relative px-2' : 'text-white'}
                  >
                    {char}
                    {char === 'Ø' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 blur-[80px] bg-indigo-600/50 rounded-full"
                      />
                    )}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- DYNAMIC SYSTEM LOGS --- */}
        <div className="absolute bottom-[-180px] w-full max-w-3xl px-12">
          <AnimatePresence>
            {(phase === 'synthesis' || phase === 'manifest') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-5"
              >
                <div className="flex justify-between items-end font-mono text-[10px] uppercase tracking-[0.5em]">
                  <div className="space-y-1.5">
                    <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                      &gt;&gt; CALIBRATING_SYNAPTIC_NODES
                    </motion.p>
                    <p className="text-gray-600">NODE_01: <span className="text-indigo-400">AMRITA_SECURE_HUB</span></p>
                  </div>
                  <div className="text-right space-y-1.5">
                    <p className="text-gray-600">AUTH: <span className="text-purple-400">LEVEL_V_ADMIN_CLEARANCE</span></p>
                    <p className="text-indigo-500/60 font-bold">INTEGRITY_SHIELD: 100%_ACTIVE</p>
                  </div>
                </div>

                {/* Technical Progress Bar */}
                <div className="relative w-full h-[4px] bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: phase === 'manifest' ? '100%' : '75%' }}
                    transition={{ duration: 8, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-500 shadow-[0_0_25px_rgba(99,102,241,1)]"
                  />
                  {/* Traveling Pulse Light */}
                  <motion.div 
                     animate={{ left: ['0%', '100%'] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute top-0 w-32 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- PHASE TEXT OVERLAY --- */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <motion.div 
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-[12px] font-mono text-indigo-400 uppercase tracking-[1em] font-black"
        >
          {phase === 'singularity' && "Initializing Digital Origin"}
          {phase === 'synthesis' && "Processing Synaptic Mesh Grid"}
          {phase === 'manifest' && "Access Protocol Securely Verified"}
          {phase === 'exit' && "Gateway Fully Synchronized"}
        </motion.div>
      </div>

      {/* --- CORNER METADATA WIDGETS --- */}
      <div className="absolute top-12 left-12 opacity-40 hidden lg:block select-none">
        <div className="font-mono text-[9px] space-y-3 border-l border-indigo-500/40 pl-5">
          <p>UPLINK_STABILITY: 100.00%</p>
          <p>PACKET_LOSS: 0.00%</p>
          <p>ENCRYPTION: SHIELD_AES-256-GCM</p>
          <p>REGION: IND-AS-S1_AMRITA</p>
          <p>LOAD_BALANCER: ACTIVE</p>
        </div>
      </div>
      <div className="absolute top-12 right-12 opacity-40 hidden lg:block text-right select-none">
        <div className="font-mono text-[9px] space-y-3 border-r border-indigo-500/40 pr-5">
          <p>CPU_CORE_UTIL: 2.15%_V_THREAD</p>
          <p>MEM_SYNC_HASH: VALID</p>
          <p>GRID_LATENCY: 4ms</p>
          <p>IDENT: NEURAL_CORE_U_01</p>
          <p>STATUS: EXECUTING_SYNC</p>
        </div>
      </div>

      {/* --- FULLSCREEN SCANLINE & NOISE --- */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <motion.div 
        animate={{ y: ['-100%', '250%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent z-[101]"
      />
    </motion.div>
  );
};

export default NeuralLoader;
