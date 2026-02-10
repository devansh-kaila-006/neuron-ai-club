
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import { 
  Clock, Calendar, MapPin, ChevronDown, ChevronUp, Sparkles, 
  Trophy, Users, Lightbulb, Zap, Rocket, Target, ShieldCheck,
  Activity, Cpu, Network, Terminal, ChevronRight
} from 'lucide-react';

const Hackathon: React.FC = () => {
  // Fix: Cast motion to any to resolve property missing errors in strict environments
  const m = motion as any;
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    // TALOS 2026 Launch: Feb 20, 2026 at 9:00 PM (21:00)
    const targetDate = new Date('2026-02-20T21:00:00');

    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeline = [
    { time: "21:00", task: "Check-in & Networking", desc: "Arrival at Hub, kit distribution.", icon: <Users size={14} /> },
    { time: "22:30", task: "TALOS Opening", desc: "Problem Statement synchronization.", icon: <Zap size={14} /> },
    { time: "23:00", task: "Hacking Starts", desc: "Neural synthesis initialization.", icon: <Cpu size={14} /> },
    { time: "03:00", task: "Midnight Pulse", desc: "Surprise AI challenges & fuel.", icon: <Sparkles size={14} /> },
    { time: "08:00", task: "Sync & Breakfast", desc: "Mentor feedback loops.", icon: <Network size={14} /> },
    { time: "19:00", task: "Code Freeze", desc: "Final manifest commit.", icon: <ShieldCheck size={14} /> },
    { time: "20:30", task: "TALOS Demos", desc: "Pitch & Demonstration.", icon: <Target size={14} /> },
    { time: "22:00", task: "Award Ceremony", desc: "Final conclusion.", icon: <Trophy size={14} /> },
  ];

  const rules = [
    { q: "Who can participate?", a: "TALOS is open to all students across all years and branches. No prior AI experience is required—we provide the roadmap and tools for beginners to bridge the gap." },
    { q: "What is the mission focus?", a: "Participants ideate, design, and prototype AI-driven solutions for real-world scenarios. We prioritize creativity, feasibility, and measurable impact." },
    { q: "What are the judging parameters?", a: "Evaluation centers on idea clarity, efficient usage of AI/ML architectures, and the quality of the final demonstration." },
    { q: "Team configuration?", a: "Squads must consist of 2 to 4 operators. Cross-departmental teams are highly recommended for optimal solution diversity." },
  ];

  const [openRule, setOpenRule] = useState<number | null>(0);

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 bg-transparent relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <section className="relative text-center md:text-left pt-12">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 pointer-events-none select-none">
            <h2 className="text-[12rem] md:text-[20rem] font-black opacity-[0.02] leading-none tracking-tighter text-white uppercase">TALOS</h2>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-12 lg:gap-20">
            <div className="space-y-6 flex-1">
              <m.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
              >
                <Terminal size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Flagship Hackathon Event</span>
              </m.div>
              
              <div className="flex flex-col">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] text-white flex flex-col select-none uppercase">
                  <span className="block">TALOS</span>
                  <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic">
                    2026
                  </span>
                </h1>
              </div>

              <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed pt-6 md:pt-10">
                Ideate, Build, and Pitch the Future of AI. An overnight mission for the next generation of synthetic intelligence practitioners.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <div className="glass p-8 rounded-[3rem] border-indigo-500/20 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/20 group-hover:bg-indigo-500/60 transition-colors" />
                <div className="flex items-center justify-center gap-10">
                   {Object.entries(timeLeft).map(([key, val], i) => (
                     <div key={key} className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-black font-mono tracking-tighter">
                          {val.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-indigo-400 mt-2 font-black">{key}</span>
                     </div>
                   ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Awaiting_Initialization</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tactical Features Bento */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: <Users size={24} />, label: "Open to All Branches", desc: "Cross-departmental collaboration is encouraged.", color: "indigo" },
            { icon: <Lightbulb size={24} />, label: "Beginner Friendly", desc: "No prior ML background required to start.", color: "purple" },
            { icon: <Sparkles size={24} />, label: "Real-world Problems", desc: "Focus on industrial and social impact.", color: "cyan" },
            { icon: <Trophy size={24} />, label: "Final Pitch & Demo", desc: "Showcase your prototype to the board.", color: "emerald" },
          ].map((feature, i) => (
            <m.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[2.5rem] flex flex-col gap-6 hover:bg-white/[0.03] transition-all border-white/5 group hover:border-indigo-500/20"
            >
              <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-white transition-colors border border-white/5 group-hover:border-indigo-500/30`}>
                {feature.icon}
              </div>
              <div className="space-y-2">
                <span className="text-sm font-black uppercase tracking-widest text-white">{feature.label}</span>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">{feature.desc}</p>
              </div>
            </m.div>
          ))}
        </div>

        {/* Roadmap and Info Section */}
        <div className="grid lg:grid-cols-12 gap-16">
          <section className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-12">
               <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                  <Calendar size={24} />
               </div>
               <div>
                 <h2 className="text-3xl font-black uppercase tracking-tight">Mission Schedule</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Sequential Operational Roadmap</p>
               </div>
            </div>

            <div className="space-y-0 relative pl-4 border-l border-white/5">
              {timeline.map((item, i) => (
                <m.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.05 }} 
                  className="relative pl-10 pb-12 last:pb-0 group"
                >
                  <div className="absolute left-[-21px] top-1.5 w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center group-hover:border-indigo-500 transition-colors bg-[#050505] z-10">
                    <div className="text-gray-600 group-hover:text-indigo-400 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-[11px] font-mono font-black text-indigo-400/60 bg-indigo-500/5 px-3 py-1 rounded-full w-fit">
                      {item.time}_HRS
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{item.task}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 font-light leading-relaxed max-w-lg">
                    {item.desc}
                  </p>
                  
                  {i < timeline.length - 1 && (
                    <div className="absolute left-[-1px] top-10 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 to-transparent" />
                  )}
                </m.div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                    <MapPin size={24} />
                 </div>
                 <div>
                   <h2 className="text-3xl font-black uppercase tracking-tight">Neural Hub</h2>
                   <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Tactical Location Data</p>
                 </div>
              </div>
              
              <div className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <MapPin size={120} strokeWidth={1} />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold font-mono text-white">Innovation Hall</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-light">
                    Amrita Vishwa Vidyapeetham<br />
                    Secure Sector 7, Engineering Block<br />
                    Primary Innovation Grid
                  </p>
                  <div className="pt-4">
                    <button 
                      className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-indigo-400 hover:text-white transition-colors"
                    >
                      NAVIGATE TO GRID <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tight px-2">Grid Policies</h2>
              <div className="space-y-4">
                {rules.map((rule, i) => (
                  <div key={i} className="glass rounded-3xl overflow-hidden border-white/5 hover:border-indigo-500/10 transition-colors">
                    <button 
                      onClick={() => setOpenRule(openRule === i ? null : i)} 
                      className="w-full flex items-center justify-between p-7 text-left font-bold hover:bg-white/5 transition-colors group"
                    >
                      <span className="text-sm uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{rule.q}</span>
                      {openRule === i ? <ChevronUp size={18} className="text-indigo-500" /> : <ChevronDown size={18} className="text-gray-600" />}
                    </button>
                    <AnimatePresence>
                      {openRule === i && (
                        <m.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }} 
                          className="overflow-hidden"
                        >
                          <div className="p-7 pt-0 text-xs text-gray-500 leading-relaxed font-light border-t border-white/5 bg-white/[0.01]">
                            {rule.a}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <m.div 
              whileHover={{ scale: 1.02 }}
              className="p-1 glass rounded-[3rem] border-indigo-500/30 overflow-hidden shadow-2xl"
            >
              <Link 
                to="/register" 
                className="w-full py-8 bg-indigo-600 rounded-[2.8rem] flex flex-col items-center justify-center gap-2 hover:bg-indigo-500 transition-all text-white shadow-xl group"
              >
                <span className="text-xs font-black uppercase tracking-[0.5em] ml-[0.5em]">Sync to Manifest</span>
                <span className="text-[8px] font-mono text-white/50 group-hover:text-white/80 uppercase tracking-widest">Registration Sequence Active</span>
              </Link>
            </m.div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Hackathon;
