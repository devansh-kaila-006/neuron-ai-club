
import React from 'react';
import { motion } from 'framer-motion';
import NeuralMascot from '../components/NeuralMascot.tsx';
import { Shield, Zap, Cpu } from 'lucide-react';

const MascotPage: React.FC = () => {
  const m = motion as any;

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Content */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-6">
              <Cpu size={14} /> SYSTEM_ENTITY_IDENTIFIED
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 font-display">
              Meet <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">NEURØ</span>
            </h1>
            
            <p className="text-xl text-gray-400 font-light leading-relaxed mb-10 max-w-xl">
              The official synthetic intelligence mascot of NEURØN. Designed for the next generation of AI enthusiasts at Amrita University.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="glass p-6 rounded-2xl border-white/5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-bold mb-2">3D Printable</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Engineered with manifold geometry, NEURØ is ready for high-precision filament or resin printing.
                </p>
              </div>
              
              <div className="glass p-6 rounded-2xl border-white/5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold mb-2">Neural Link</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Integrated directly into our chatbot, providing real-time feedback through its holographic visor.
                </p>
              </div>
            </div>
          </m.div>

          {/* Right Side: Large Mascot Display */}
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
            
            {/* Large Mascot */}
            <div className="relative z-10 p-12 glass rounded-[3rem] border-indigo-500/20 shadow-2xl">
              <NeuralMascot size={400} />
            </div>

            {/* Floating Data Points */}
            <m.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass p-4 rounded-2xl border-white/10 backdrop-blur-xl"
            >
              <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Status</p>
              <p className="text-xs text-green-500 font-bold">ONLINE</p>
            </m.div>

            <m.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 glass p-4 rounded-2xl border-white/10 backdrop-blur-xl"
            >
              <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Version</p>
              <p className="text-xs text-indigo-400 font-bold">v2.5.0-ALPHA</p>
            </m.div>
          </m.div>
        </div>
      </div>
    </div>
  );
};

export default MascotPage;
