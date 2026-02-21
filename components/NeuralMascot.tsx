
import React from 'react';
import { motion } from 'framer-motion';

interface NeuralMascotProps {
  className?: string;
  size?: number;
  showWaveform?: boolean;
  isAnimated?: boolean;
}

const NeuralMascot: React.FC<NeuralMascotProps> = ({ 
  className = "", 
  size = 64, 
  showWaveform = false,
  isAnimated = true 
}) => {
  const m = motion as any;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]"
      >
        {/* Gradients & Filters */}
        <defs>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="jointGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="visorGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#262626" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground Shadow */}
        <m.ellipse
          cx="50"
          cy="96"
          rx="24"
          ry="4"
          fill="rgba(0,0,0,0.5)"
          animate={isAnimated ? {
            rx: [24, 20, 24],
            opacity: [0.5, 0.3, 0.5]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Backpack / Propulsion Unit */}
        <m.g
          animate={isAnimated ? { y: [0, 2, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <rect x="30" y="50" width="40" height="25" rx="8" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.5" />
          <circle cx="35" cy="70" r="3" fill="#6366f1" fillOpacity="0.5" />
          <circle cx="65" cy="70" r="3" fill="#6366f1" fillOpacity="0.5" />
        </m.g>

        {/* Main Body */}
        <m.g
          animate={isAnimated ? {
            y: [0, 2, 0]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          {/* Torso Shell */}
          <rect
            x="25"
            y="48"
            width="50"
            height="34"
            rx="17"
            fill="url(#bodyGradient)"
            stroke="#4338ca"
            strokeWidth="0.5"
          />
          
          {/* Mechanical Panel Lines */}
          <path d="M25 60 H 75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <path d="M50 48 V 82" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          
          {/* Chest Armor Plate */}
          <path
            d="M32 54 Q 50 50, 68 54 L 62 72 Q 50 78, 38 72 Z"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
          />

          {/* Power Core Reactor */}
          <circle cx="50" cy="63" r="8" fill="url(#coreGlow)" />
          <circle cx="50" cy="63" r="3" fill="#fff" filter="url(#neonGlow)" />
          <path d="M44 63 H 56 M 50 57 V 69" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.5" />
        </m.g>

        {/* Head Unit */}
        <m.g
          animate={isAnimated ? {
            y: [0, -3, 0],
            rotate: [-1.5, 1.5, -1.5]
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Mechanical Ears / Sensors */}
          <path d="M20 25 L 28 30 V 40 L 20 45 Z" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.5" />
          <path d="M80 25 L 72 30 V 40 L 80 45 Z" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.5" />
          <circle cx="24" cy="35" r="1.5" fill="#a855f7" filter="url(#neonGlow)" />
          <circle cx="76" cy="35" r="1.5" fill="#a855f7" filter="url(#neonGlow)" />

          {/* Main Helmet Shell */}
          <circle
            cx="50"
            cy="35"
            r="29"
            fill="url(#headGradient)"
            stroke="#4338ca"
            strokeWidth="0.5"
          />

          {/* Visor Housing with Bezel */}
          <rect x="24" y="22" width="52" height="24" rx="12" fill="#312e81" stroke="#4338ca" strokeWidth="0.5" />
          <rect
            x="27"
            y="25"
            width="46"
            height="18"
            rx="9"
            fill="url(#visorGlass)"
            stroke="#a855f7"
            strokeWidth="1"
          />

          {/* Visor Text: NEURØN */}
          <g filter="url(#neonGlow)">
            <text
              x="50"
              y="37"
              textAnchor="middle"
              fill="#a855f7"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="monospace"
              letterSpacing="0.2"
              className="select-none"
            >
              NEURØN
            </text>
            
            {/* Scanning Line */}
            <m.rect
              x="28"
              y="26"
              width="44"
              height="0.5"
              fill="#a855f7"
              fillOpacity="0.6"
              animate={isAnimated ? {
                y: [0, 16, 0],
                opacity: [0, 1, 0]
              } : {}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          </g>
        </m.g>

        {/* Arms with Shoulder Joints */}
        <m.g
          animate={isAnimated ? {
            rotate: [-8, 8, -8],
            y: [0, 1, 0]
          } : {}}
          style={{ originX: '50%', originY: '55%' }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Shoulders */}
          <circle cx="20" cy="55" r="5" fill="url(#jointGradient)" stroke="#4338ca" strokeWidth="0.5" />
          <circle cx="80" cy="55" r="5" fill="url(#jointGradient)" stroke="#4338ca" strokeWidth="0.5" />
          
          {/* Forearms */}
          <rect x="15" y="58" width="10" height="16" rx="5" fill="url(#bodyGradient)" stroke="#4338ca" strokeWidth="0.5" />
          <rect x="75" y="58" width="10" height="16" rx="5" fill="url(#bodyGradient)" stroke="#4338ca" strokeWidth="0.5" />
          
          {/* Hands / Grippers */}
          <path d="M15 74 Q 15 80, 20 80 Q 25 80, 25 74" stroke="#4338ca" strokeWidth="1" fill="none" />
          <path d="M75 74 Q 75 80, 80 80 Q 85 80, 85 74" stroke="#4338ca" strokeWidth="1" fill="none" />
        </m.g>

        {/* Legs with Knee Joints */}
        <m.g
          animate={isAnimated ? {
            y: [0, 1.5, 0]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          {/* Thighs */}
          <rect x="32" y="78" width="12" height="10" rx="5" fill="url(#jointGradient)" stroke="#4338ca" strokeWidth="0.5" />
          <rect x="56" y="78" width="12" height="10" rx="5" fill="url(#jointGradient)" stroke="#4338ca" strokeWidth="0.5" />
          
          {/* Feet */}
          <rect x="30" y="86" width="16" height="6" rx="3" fill="url(#bodyGradient)" stroke="#4338ca" strokeWidth="0.5" />
          <rect x="54" y="86" width="16" height="6" rx="3" fill="url(#bodyGradient)" stroke="#4338ca" strokeWidth="0.5" />
        </m.g>
      </svg>
    </div>
  );
};

export default NeuralMascot;
