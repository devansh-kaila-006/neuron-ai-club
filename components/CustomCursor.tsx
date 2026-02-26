
import React, { useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence, useVelocity, useTransform } from 'framer-motion';

/**
 * CustomCursor: The Neural Synthetic Entity (v2.0)
 * Reverted to original UI while keeping NaN and Mobile safety fixes.
 */
const CustomCursor: React.FC = () => {
  const m = motion as any;
  
  // Safe initialization to prevent heavy motion hook errors on mobile first-render
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    }
    return false;
  });

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Position Motion Values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Velocity tracking for high-fidelity reactivity
  const velX = useVelocity(mouseX);
  const velY = useVelocity(mouseY);
  
  // Kinetic Metrics with NaN protection
  const speed = useTransform([velX, velY], ([latestX, latestY]: any[]) => {
    const vx = Number(latestX) || 0;
    const vy = Number(latestY) || 0;
    const s = Math.sqrt(vx * vx + vy * vy);
    return isNaN(s) ? 0 : s;
  });

  const normalizedSpeed = useTransform(speed, [0, 2000], [0, 1], { clamp: true });
  const auraOpacity = useTransform(speed, [0, 500], [0.2, 0.6], { clamp: true });
  
  // Color Spectrum Shift (Indigo to Cyan)
  const cursorColor = useTransform(normalizedSpeed, [0, 1], ["#6366f1", "#22d3ee"]);

  // Physics-based Spring Layers
  const coreX = useSpring(mouseX, { damping: 25, stiffness: 900, mass: 0.1 });
  const coreY = useSpring(mouseY, { damping: 25, stiffness: 900, mass: 0.1 });

  const auraX = useSpring(mouseX, { damping: 45, stiffness: 180, mass: 1 });
  const auraY = useSpring(mouseY, { damping: 45, stiffness: 180, mass: 1 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    if (!isVisible) setIsVisible(true);

    // Throttle hover detection to prevent constant re-renders
    const now = Date.now();
    if (now - (window as any)._lastCursorCheck < 50) return;
    (window as any)._lastCursorCheck = now;

    const target = e.target as HTMLElement;
    if (!target) return;
    
    const isClickable = !!target.closest('a, button, input, select, textarea, [role="button"], .clickable, .group');
    if (isClickable !== isHovering) setIsHovering(isClickable);
  }, [isHovering, isVisible]);

  useEffect(() => {
    if (isMobile) return;
    (window as any)._lastCursorCheck = 0;

    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', () => setIsClicking(true));
    window.addEventListener('mouseup', () => setIsClicking(false));
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', checkMobile);
    };
  }, [handleMouseMove, isMobile]);

  if (isMobile) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-[10000] no-print overflow-hidden transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* 1. KINETIC TELEMETRY HUB */}
      <m.div
        style={{ x: coreX, y: coreY, translateX: '18px', translateY: '18px' }}
        className="absolute flex flex-col gap-0.5 opacity-30 font-mono"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[5px] text-white/40 uppercase tracking-widest">Load</span>
          <m.div className="h-[2px] bg-indigo-500/50 rounded-full" style={{ width: useTransform(normalizedSpeed, [0, 1], [4, 20]) }} />
        </div>
        <span className="text-[6px] text-white/50 tracking-tighter uppercase flex gap-1">
          POS_SENS: <m.span>{useTransform(mouseX, (v) => Math.round(v))}</m.span> / <m.span>{useTransform(mouseY, (v) => Math.round(v))}</m.span>
        </span>
      </m.div>

      {/* 2. NEURAL AURA (Magnetic Perimeter) */}
      <m.div
        style={{ x: auraX, y: auraY, translateX: '-50%', translateY: '-50%', opacity: auraOpacity }}
        animate={{
          scale: isClicking ? 0.8 : (isHovering ? 2 : 1),
          borderColor: isHovering ? 'rgba(34, 211, 238, 0.8)' : 'rgba(255, 255, 255, 0.1)',
        }}
        className="absolute w-12 h-12 border rounded-full flex items-center justify-center"
      >
        <m.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-t-indigo-500/40 border-r-transparent border-b-transparent border-l-transparent rounded-full"
        />
        <m.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-indigo-500/5 rounded-full"
        />
      </m.div>

      {/* 3. THE NUCLEUS & ORBITAL ASSEMBLY */}
      <m.div
        style={{ x: coreX, y: coreY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: isClicking ? 1.4 : (isHovering ? 0.7 : 1) }}
        className="absolute w-6 h-6 z-50 mix-blend-difference flex items-center justify-center"
      >
        <m.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full blur-[0.5px] opacity-60" />
        </m.div>

        <m.div 
          style={{ backgroundColor: cursorColor }}
          className="w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"
        />
        
        <m.div 
          animate={{ rotate: isHovering ? 180 : 0, opacity: isHovering ? 1 : 0.4 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="absolute w-5 h-[0.5px] bg-white/20" />
          <div className="absolute h-5 w-[0.5px] bg-white/20" />
          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-white/40" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-white/40" />
        </m.div>

        <m.div
          animate={{ 
            opacity: isHovering ? 1 : 0, 
            y: isHovering ? -22 : -10,
            scale: isHovering ? 1 : 0.8
          }}
          className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 rounded-sm text-[5px] font-mono text-white whitespace-nowrap flex items-center gap-1.5"
        >
          <m.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>●</m.span>
          {isClicking ? 'PROCESS_IGNITION' : 'NODE_ANCHORED'}
        </m.div>
      </m.div>

      {/* 6. IMPACT SEQUENCE */}
      <AnimatePresence>
        {isClicking && (
          <m.div
            initial={{ 
              x: mouseX.get(), 
              y: mouseY.get(), 
              scale: 0.2, 
              opacity: 1, 
              translateX: '-50%', 
              translateY: '-50%' 
            }}
            animate={{ scale: 8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-10 h-10 border-2 border-cyan-400/50 rounded-full flex items-center justify-center"
          >
             <div className="w-full h-full border border-indigo-500/20 rounded-full scale-50" />
          </m.div>
        )}
      </AnimatePresence>

      <style>{`
        * { cursor: none !important; }
        @media (max-width: 1024px) {
          * { cursor: auto !important; }
        }
        ::selection {
          background: rgba(99, 102, 241, 0.4);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default CustomCursor;
