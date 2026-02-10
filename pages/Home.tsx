
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import { 
  Zap, Code, ChevronRight, Rocket,
  Microscope, Network, Compass, Sparkles, 
  Target, Workflow, GraduationCap, Megaphone, Lightbulb,
  Activity, Globe, Users, Database, FileText,
  Library, GitBranch, Terminal, BookOpen,
  Briefcase, Info, Share2, Layers, ShieldCheck
} from 'lucide-react';

const SynapseCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();

    const isMobile = window.innerWidth < 768;
    const points: { x: number, y: number, z: number }[] = [];
    const count = isMobile ? 120 : 350; // Dynamic count based on device power
    
    for (let i = 0; i < count; i++) {
      points.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800
      });
    }

    let angleX = 0;
    let angleY = 0;
    let frame: number;

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angleX += 0.0015;
      angleY += 0.002;

      const halfW = canvas.width / 2;
      const halfH = canvas.height / 2;

      points.forEach(p => {
        // Rotate X
        let y1 = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
        let z1 = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
        // Rotate Y
        let x2 = p.x * Math.cos(angleY) - z1 * Math.sin(angleY);
        let z2 = p.x * Math.sin(angleY) + z1 * Math.cos(angleY);

        const perspective = 500 / (500 + z2);
        const px = x2 * perspective + halfW;
        const py = y1 * perspective + halfH;

        if (px > 0 && px < canvas.width && py > 0 && py < canvas.height) {
          const size = Math.max(0.5, 2 * perspective);
          const alpha = Math.max(0, (perspective - 0.4) * 0.6);

          ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      frame = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', updateSize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />;
};

const Home: React.FC = () => {
  const m = motion as any;

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden font-display text-white selection:bg-indigo-500/30 pb-32">
      
      {/* 1. IDENTITY & HERO - THE INITIALIZATION */}
      <section className="relative px-6 pt-32 pb-16 md:pt-48 md:pb-24 flex flex-col items-center">
        <SynapseCore />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-indigo-600/10 to-transparent blur-[120px] -z-10" />
        
        <div className="max-w-6xl mx-auto text-center relative">
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-1.5 mb-10 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.5em] font-mono">
                Amrita Vishwa Vidyapeetham
              </span>
            </m.div>

            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-14 flex justify-center items-center select-none">
              <h1 className="text-7xl md:text-[13rem] font-black leading-none flex items-center justify-center tracking-tighter">
                <span className="z-10 -mr-1 md:-mr-4 drop-shadow-2xl">NEUR</span>
                <span className="relative inline-block text-indigo-500 z-20 scale-[1.05] px-1 md:px-3">
                  Ø
                  <m.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 blur-3xl bg-indigo-500/40 -z-10"
                  />
                </span>
                <span className="z-10 -ml-1 md:-ml-4 drop-shadow-2xl">N</span>
              </h1>
            </m.div>

            <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg md:text-2xl font-tech tracking-[0.2em] text-gray-400 mb-6 uppercase">
              Artificial Intelligence Community of Practice
            </m.p>

            <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] md:text-sm text-indigo-500/60 mb-12 max-w-2xl mx-auto font-mono uppercase tracking-[0.4em] italic font-bold">
              "Built by students. Driven by curiosity. Powered by AI."
            </m.p>
            
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
              <Link to="/join" className="group relative px-14 py-6 bg-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] overflow-hidden transition-all hover:scale-105 shadow-[0_25px_50px_rgba(79,70,229,0.35)] text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">Join The Collective <ChevronRight className="w-4 h-4" /></span>
              </Link>
            </m.div>
          </m.div>
        </div>
      </section>

      {/* 2. THE GENESIS (INTRO & ABOUT) */}
      <div className="max-w-7xl mx-auto px-6 space-y-32 md:space-y-48">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <m.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7 space-y-8">
            <div className="inline-block px-4 py-1 border-l-2 border-indigo-500 bg-indigo-500/5">
               <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">Initialization_Protocol</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              The AI <span className="text-indigo-500 italic">Evolution</span>
            </h2>
            <div className="space-y-6 text-gray-400 font-light leading-relaxed text-lg">
              <p>NEURØN bridges the gap as Amrita’s dedicated <span className="text-indigo-400 font-tech">Community of Practice (CoP)</span>.</p>
            </div>
          </m.div>
          <m.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5 relative">
             <div className="glass p-10 rounded-[3rem] border-white/5 relative z-10">
                <Info className="text-indigo-500 mb-6" size={32} />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Framework</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">Student-led and faculty-mentored, NEURØN promotes continuous learning.</p>
             </div>
          </m.div>
        </div>

        {/* 3. STRATEGIC INTENT */}
        <div className="grid lg:grid-cols-2 gap-8">
           <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass p-12 md:p-16 rounded-[4rem] border-indigo-500/10 bg-indigo-500/[0.01] flex flex-col justify-center relative overflow-hidden group">
              <h3 className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-[0.5em] mb-10 flex items-center gap-4"><Compass size={18} /> Strategic Vision</h3>
              <p className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tighter text-white">To establish a strong, inclusive, and <span className="text-indigo-500 italic">innovative AI ecosystem</span>.</p>
           </m.div>
           <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="glass p-10 md:p-14 rounded-[4rem] border-white/5 bg-white/[0.01] relative overflow-hidden group/mission">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.5em] flex items-center gap-4"><Rocket size={18} className="text-indigo-500" /> Mission Vector</h3>
              </div>
              <div className="grid gap-8">
                {[
                  { t: "Practical Exposure", d: "Hands-on implementation.", icon: <BookOpen className="text-indigo-400" /> },
                  { t: "Diverse Domains", d: "Multi-disciplinary landscape.", icon: <Layers className="text-cyan-400" /> }
                ].map((m_item, i) => (
                  <div key={i} className="flex items-center gap-8 group/item">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all group-hover/item:border-indigo-500/30 group-hover/item:scale-110">
                      {React.cloneElement(m_item.icon as React.ReactElement<any>, { size: 20, strokeWidth: 1.5 })}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white block group-hover/item:text-indigo-400">{m_item.t}</span>
                      <span className="text-[10px] font-medium text-gray-500">{m_item.d}</span>
                    </div>
                  </div>
                ))}
              </div>
           </m.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
