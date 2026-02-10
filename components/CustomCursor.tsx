
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence, useVelocity, useTransform } from 'framer-motion';

/**
 * CustomCursor: The Neural Synthetic Entity (v2.1 - Safety Optimized)
 */
const CustomCursor: React.FC = () => {
  const m = motion as any;
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Position Motion Values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Velocity tracking
  const velX = useVelocity(mouseX);
  const velY = useVelocity(mouseY);
  const speed = useTransform([velX, velY], ([lx, ly]: any[]) => 
    Math.sqrt(Math.pow(lx || 0, 2) + Math.pow(ly || 0, 2))
  );
  
  const normalizedSpeed = useTransform(speed, [0, 2000], [0, 1]);
  const auraOpacity = useTransform(speed, [0, 500], [0.2, 0.6]);
  const cursorColor = useTransform(normalizedSpeed, [0, 1], ["#6366f1", "#22d3ee"]);

  // Physics-based Spring Layers
  const coreX = useSpring(mouseX, { damping: 25, stiffness: 900, mass: 0.1 });
  const coreY = useSpring(mouseY, { damping: 25, stiffness: 900, mass: 0.1 });
  const auraX = useSpring(mouseX, { damping: 45, stiffness: 180, mass: 1 });
  const auraY = useSpring(mouseY, { damping: 45, stiffness: 180, mass: 1 });

  // Synaptic Chain Shards
  const s1X = useSpring(mouseX, { damping: 25, stiffness: 150, mass: 0.5 });
  const s1Y = useSpring(mouseY, { damping: 25, stiffness: 150, mass: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (typeof window === 'undefined') return;
    
    let tx = e.clientX;
    let ty = e.clientY;

    const target = e.target as HTMLElement;
    // Safety check: Ensure target exists and has closest method (some SVG nodes might behave differently)
    if (target && typeof target.closest === 'function') {
      const interactive = target.closest('a, button, .clickable, .group, input, select, textarea');
      const isClickable = !!interactive;
      
      if (interactive) {
        const rect = interactive.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = centerX - tx;
        const dy = centerY - ty;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          tx += dx * 0.3;
          ty += dy * 0.3;
        }
      }
      if (isClickable !== isHovering) setIsHovering(isClickable);
    }

    mouseX.set(tx);
    mouseY.set(ty);
  }, [isHovering, mouseX, mouseY]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    const setClickTrue = () => setIsClicking(true);
    const setClickFalse = () => setIsClicking(false);
    window.addEventListener('mousedown', setClickTrue);
    window.addEventListener('mouseup', setClickFalse);
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', setClickTrue);
      window.removeEventListener('mouseup', setClickFalse);
      window.removeEventListener('resize', checkMobile);
    };
  }, [handleMouseMove]);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] no-print overflow-hidden">
      {/* HUD Metrics */}
      <m.div style={{ x: coreX, y: coreY, xTranslate: '18px', yTranslate: '18px' }} className="absolute flex flex-col gap-0.5 opacity-30 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-[5px] text-white/40 uppercase tracking-widest">Load</span>
          <m.div className="h-[2px] bg-indigo-500/50 rounded-full" style={{ width: useTransform(normalizedSpeed, [0, 1], [4, 20]) }} />
        </div>
        <span className="text-[6px] text-white/50 tracking-tighter uppercase flex gap-1">
          KINETIC: <m.span>{useTransform(speed, (v) => Math.round(v))}</m.span>
        </span>
      </m.div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <m.line x1={coreX} y1={coreY} x2={s1X} y2={s1Y} stroke="white" strokeWidth="0.5" />
      </svg>

      {/* Aura */}
      <m.div
        style={{ x: auraX, y: auraY, translateX: '-50%', translateY: '-50%', opacity: auraOpacity }}
        animate={{ scale: isClicking ? 0.8 : (isHovering ? 2 : 1), borderColor: isHovering ? '#22d3ee' : 'rgba(255,255,255,0.1)' }}
        className="absolute w-12 h-12 border rounded-full flex items-center justify-center"
      >
        <m.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-t-indigo-500/40 border-transparent rounded-full" />
      </m.div>

      {/* Nucleus */}
      <m.div
        style={{ x: coreX, y: coreY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: isClicking ? 1.4 : (isHovering ? 0.7 : 1) }}
        className="absolute w-6 h-6 z-50 mix-blend-difference flex items-center justify-center"
      >
        <m.div style={{ backgroundColor: cursorColor }} className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
        <m.div animate={{ rotate: isHovering ? 180 : 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-5 h-[0.5px] bg-white/20" />
          <div className="absolute h-5 w-[0.5px] bg-white/20" />
        </m.div>
      </m.div>

      <AnimatePresence>
        {isClicking && (
          <m.div
            initial={{ x: mouseX.get(), y: mouseY.get(), scale: 0.2, opacity: 1, translateX: '-50%', translateY: '-50%' }}
            animate={{ scale: 8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute w-10 h-10 border-2 border-cyan-400/50 rounded-full"
          />
        )}
      </AnimatePresence>

      <style>{`
        * { cursor: none !important; }
        @media (max-width: 1024px) { * { cursor: auto !important; } }
      `}</style>
    </div>
  );
};

export default CustomCursor;
