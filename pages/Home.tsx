
import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import { 
  Zap, Code, ChevronRight, Eye, Rocket, BrainCircuit, 
  Microscope, Network, Compass, Sparkles, 
  Target, Workflow, GraduationCap, Megaphone, Lightbulb,
  Activity, Globe, Users, LayoutGrid, Database, FileText,
  Library, GitBranch, Terminal, BookOpen, ShieldAlert,
  Briefcase, Info, Share2, Layers, ShieldCheck
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden font-display text-white selection:bg-indigo-500/30 pb-32">
      
      {/* 1. IDENTITY & HERO - THE INITIALIZATION */}
      <section className="relative px-6 pt-32 pb-16 md:pt-48 md:pb-24 flex flex-col items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-indigo-600/10 to-transparent blur-[120px] -z-10" />
        
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-1.5 mb-10 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.5em] font-mono">
                Amrita Vishwa Vidyapeetham
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-14 flex justify-center items-center select-none">
              <h1 className="text-7xl md:text-[13rem] font-black leading-none flex items-center justify-center tracking-tighter">
                <span className="z-10 -mr-1 md:-mr-4 drop-shadow-2xl">NEUR</span>
                <span className="relative inline-block text-indigo-500 z-20 scale-[1.05] px-1 md:px-3">
                  Ø
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 blur-3xl bg-indigo-500/40 -z-10"
                  />
                </span>
                <span className="z-10 -ml-1 md:-ml-4 drop-shadow-2xl">N</span>
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg md:text-2xl font-tech tracking-[0.2em] text-gray-400 mb-6 uppercase">
              Artificial Intelligence Community of Practice
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] md:text-sm text-indigo-500/60 mb-12 max-w-2xl mx-auto font-mono uppercase tracking-[0.4em] italic font-bold">
              "Built by students. Driven by curiosity. Powered by AI."
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
              <Link to="/join" className="group relative px-14 py-6 bg-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] overflow-hidden transition-all hover:scale-105 shadow-[0_25px_50px_rgba(79,70,229,0.35)] text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-3">Join The Collective <ChevronRight className="w-4 h-4" /></span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. THE GENESIS (INTRO & ABOUT) - SEAMLESS FLOW */}
      <div className="max-w-7xl mx-auto px-6 space-y-32 md:space-y-48">
        
        {/* Intro Flow */}
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="inline-block px-4 py-1 border-l-2 border-indigo-500 bg-indigo-500/5">
               <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">Initialization_Protocol</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              The AI <span className="text-indigo-500 italic">Evolution</span>
            </h2>
            <div className="space-y-6 text-gray-400 font-light leading-relaxed text-lg">
              <p>
                Artificial Intelligence (AI) has emerged as the most transformative technology of the 21st century, reshaping healthcare, finance, transportation, and scientific research. 
              </p>
              <p>
                While students are exposed to AI tools, many lack structured guidance. <span className="text-white font-bold">NEURØN</span> bridge this gap as Amrita’s dedicated <span className="text-indigo-400 font-tech">Community of Practice (CoP)</span>.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="lg:col-span-5 relative"
          >
             <div className="glass p-10 rounded-[3rem] border-white/5 bg-white/[0.01] relative z-10">
                <Info className="text-indigo-500 mb-6" size={32} />
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Framework</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Student-led and faculty-mentored, NEURØN promotes continuous learning and applied problem-solving. We bring together students from diverse backgrounds to share a common interest in emerging technologies.
                </p>
                <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest italic">
                  <div className="h-px w-8 bg-indigo-500/30" />
                  Uplink Active
                </div>
             </div>
             <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-600/10 blur-[100px] -z-0 rounded-full" />
          </motion.div>
        </div>

        {/* 3. STRATEGIC INTENT (VISION & MISSION) */}
        <div className="grid lg:grid-cols-2 gap-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }} 
             whileInView={{ opacity: 1, y: 0 }} 
             viewport={{ once: true }}
             className="glass p-12 md:p-16 rounded-[4rem] border-indigo-500/10 bg-indigo-500/[0.01] flex flex-col justify-center relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Target size={240} strokeWidth={0.5} />
              </div>
              <h3 className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
                <Compass size={18} /> Strategic Vision
              </h3>
              <p className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tighter text-white">
                To establish a strong, inclusive, and <span className="text-indigo-500 italic">innovative AI ecosystem</span> at Amrita that empowers students as practitioners and leaders.
              </p>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }} 
             whileInView={{ opacity: 1, y: 0 }} 
             transition={{ delay: 0.1 }} 
             viewport={{ once: true }}
             className="glass p-10 md:p-14 rounded-[4rem] border-white/5 bg-white/[0.01] relative overflow-hidden group/mission"
           >
              {/* Mission Header */}
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-[0.5em] flex items-center gap-4">
                  <Rocket size={18} className="text-indigo-500" /> Mission Vector
                </h3>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500/20 group-hover/mission:bg-indigo-500 transition-colors" />
                  ))}
                </div>
              </div>

              {/* Mission List */}
              <div className="grid gap-8">
                {[
                  { 
                    t: "Practical Exposure", 
                    d: "Learn complex AI concepts through hands-on implementation.", 
                    icon: <BookOpen className="text-indigo-400" /> 
                  },
                  { 
                    t: "Diverse Domains", 
                    d: "Apply AI solutions across multi-disciplinary landscapes.", 
                    icon: <Layers className="text-cyan-400" /> 
                  },
                  { 
                    t: "Knowledge Sync", 
                    d: "Collaborative transfer of experiences and insights.", 
                    icon: <Share2 className="text-purple-400" /> 
                  },
                  { 
                    t: "Ethical Innovation", 
                    d: "Responsible problem-solving for a sustainable future.", 
                    icon: <ShieldCheck className="text-emerald-400" /> 
                  }
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-8 group/item">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all duration-500 group-hover/item:border-indigo-500/30 group-hover/item:bg-indigo-500/5 group-hover/item:scale-110">
                      {React.cloneElement(m.icon as React.ReactElement<any>, { size: 20, strokeWidth: 1.5 })}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white block group-hover/item:text-indigo-400 transition-colors">
                        {m.t}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 group-hover/item:text-gray-400 transition-colors">
                        {m.d}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Scanline */}
              <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent group-hover/mission:via-indigo-500 transition-all duration-1000" />
           </motion.div>
        </div>

        {/* 5. CO-P PILLARS (DNA) */}
        <div className="space-y-20">
           <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-[0.6em] mb-4">Neural_Architecture</span>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                CoP <span className="text-indigo-500 italic">PILLARS</span>
              </h2>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { t: "Domain", d: "AI, ML, Data Science, and Intelligent Systems.", icon: <Globe className="text-indigo-500" />, sub: "5.1 Core Focus" },
              { t: "Community", d: "Network of students, mentors, and industry pros.", icon: <Users className="text-purple-500" />, sub: "5.2 Human Grid" },
              { t: "Practice", d: "Hands-on projects, workshops, and research labs.", icon: <Code className="text-cyan-500" />, sub: "5.3 Tactical Layer" },
              { t: "Growth", d: "Sustained innovation and evolutionary community scale.", icon: <Activity className="text-indigo-400" />, sub: "5.4 Neural Pulse" }
            ].map((p, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.98 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                className="glass p-10 rounded-[3rem] border-white/5 bg-transparent hover:bg-white/[0.02] transition-all group"
              >
                <div className="mb-8 p-4 bg-white/[0.03] rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <h4 className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-[0.4em] mb-2">{p.sub}</h4>
                <h4 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">{p.t}</h4>
                <p className="text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 7. ACTIVITIES - TACTICAL HUB (OCTAGONAL ALIGNMENT) */}
        <div className="relative pt-12 flex flex-col items-center">
           <div className="flex flex-col items-center mb-16 text-center">
              <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-[0.6em] mb-4">Tactical_Operations</span>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                CLUB <span className="text-indigo-500 italic">ACTIVITIES</span>
              </h2>
              <p className="mt-6 text-gray-500 max-w-xl text-sm leading-relaxed">
                A perfectly symmetrical synchronization of structured learning, experimentation, and industry bridging.
              </p>
           </div>

           <div className="relative h-[700px] md:h-[900px] w-full flex items-center justify-center">
              {/* Central HUB - Positioned exactly at center of container */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                whileInView={{ scale: 1, opacity: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-32 h-32 md:w-[220px] md:h-[220px] rounded-full border border-indigo-500/20 flex items-center justify-center bg-black/60 backdrop-blur-3xl shadow-[0_0_100px_rgba(79,70,229,0.15)]"
              >
                <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-pulse scale-[1.1]" />
                <span className="text-[6rem] md:text-[11rem] font-black text-indigo-500 select-none leading-none translate-y-[-4px]">Ø</span>
              </motion.div>

              {/* TACTICAL NODES (PERFECT OCTAGONAL POSITIONING AROUND CENTER) */}
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { style: { top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }, icon: <Sparkles />, label: "INTRO SESSIONS", d: "Foundational AI concepts overview" },
                  { style: { top: '21.7%', left: '78.3%', transform: 'translate(-50%, -50%)' }, icon: <Terminal />, label: "TECH WORKSHOPS", d: "Python & Deep Learning implementation" },
                  { style: { top: '50%', left: '90%', transform: 'translate(-50%, -50%)' }, icon: <Layers />, label: "AI PLATFORMS", d: "Computer Vision & Process Automation" },
                  { style: { top: '78.3%', left: '78.3%', transform: 'translate(-50%, -50%)' }, icon: <Rocket />, label: "MINI PROJECTS", d: "Rapid prototype guided build sessions" },
                  { style: { top: '90%', left: '50%', transform: 'translate(-50%, -50%)' }, icon: <Users />, label: "GUEST LECTURES", d: "Direct industry expert tech insights" },
                  { style: { top: '78.3%', left: '21.7%', transform: 'translate(-50%, -50%)' }, icon: <Share2 />, label: "PEER CIRCLES", d: "Collaborative mentoring & sync" },
                  { style: { top: '50%', left: '10%', transform: 'translate(-50%, -50%)' }, icon: <Microscope />, label: "RESEARCH", d: "Case studies & scientific paper synthesis" },
                  { style: { top: '21.7%', left: '21.7%', transform: 'translate(-50%, -50%)' }, icon: <Target />, label: "SOLVING", d: "Competitive ideation & problem events" }
                ].map((n, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={n.style}
                    className="absolute pointer-events-auto group flex flex-col items-center text-center gap-4 w-40 md:w-56 z-40"
                  >
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-transparent border border-white/10 rounded-[2rem] flex items-center justify-center transition-all duration-700 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_40px_rgba(79,70,229,0.25)] relative">
                      {React.cloneElement(n.icon as React.ReactElement<any>, { size: 36, strokeWidth: 1.2, className: "text-gray-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500" })}
                      
                      {/* DETAIL HOVER CARD - Gap increased slightly for better focus and hierarchy */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 opacity-0 group-hover:opacity-100 group-hover:translate-y-[-135%] transition-all duration-500 pointer-events-none z-50">
                        <div className="glass p-8 rounded-[3rem] border-indigo-500/40 bg-[#080808]/98 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/5">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                              {React.cloneElement(n.icon as React.ReactElement<any>, { size: 24 })}
                            </div>
                            <span className="text-sm md:text-xl font-mono font-black text-indigo-300 uppercase tracking-widest leading-none">{n.label}</span>
                          </div>
                          <p className="text-sm md:text-lg text-gray-400 font-light leading-relaxed text-left border-t border-white/5 pt-6">
                            {n.d}
                          </p>
                          <div className="mt-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-indigo-500/60 uppercase tracking-[0.2em]">NODE_OPERATIONAL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ORIGINAL LABEL */}
                    <div className="hidden md:block transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                      <p className="text-sm md:text-lg font-mono font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">{n.label}</p>
                      <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-400 transition-colors leading-tight px-2">{n.d}</p>
                    </div>
                    <div className="md:hidden group-hover:opacity-0 transition-opacity">
                       <p className="text-xs font-mono font-black text-indigo-400 uppercase tracking-[0.15em]">{n.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>

        {/* 8. KNOWLEDGE MODEL (PERSISTENCE) */}
        <div className="relative pt-24">
           <div className="glass p-12 md:p-20 rounded-[4rem] border-white/5 bg-white/[0.01] relative overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                 <div>
                    <div className="flex items-center gap-3 mb-6">
                       <GitBranch className="text-indigo-500" size={24} />
                       <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">Growth_Model</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">Neural Persistence</h3>
                    <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
                      NEURØN maintains a shared knowledge base to ensure long-term community growth and sustained learning.
                    </p>
                    <div className="flex flex-wrap gap-4">
                       {["Code Repositories", "Project Documentation", "Datasets", "Model Libraries", "Tutorials"].map((t, i) => (
                         <div key={i} className="px-5 py-2 rounded-full border border-white/5 text-[9px] font-mono text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/5">
                           {t}
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <Database />, t: "Sync Repos" },
                      { icon: <FileText />, t: "Docs Hub" },
                      { icon: <Network />, t: "Data Grids" },
                      { icon: <Library />, t: "Asset Library" }
                    ].map((item, i) => (
                      <div key={i} className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center gap-4 hover:border-indigo-500/20 transition-all hover:-translate-y-1">
                        <div className="text-indigo-500 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.t}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* 6. OBJECTIVES - GROWTH ENGINE */}
        <div className="space-y-16 pt-24">
           <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-[0.5em] block mb-4">Core_Directives</span>
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">SYSTEM <span className="text-indigo-500 italic">OBJECTIVES</span></h2>
              <div className="h-[1px] w-32 bg-indigo-500/50 mx-auto" />
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "Create Awareness", d: "Building AI interest across campus.", icon: <Megaphone className="text-indigo-500" /> },
              { t: "Knowledge Transfer", d: "Foundational and advanced AI insights.", icon: <GraduationCap className="text-purple-500" /> },
              { t: "Applied Learning", d: "Hands-on projects and laboratory work.", icon: <Code className="text-cyan-500" /> },
              { t: "Cross-Disciplinary", d: "Promoting interdisciplinary AI usage.", icon: <Workflow className="text-emerald-500" /> },
              { t: "Drive Innovation", d: "Encouraging next-gen problem solving.", icon: <Lightbulb className="text-yellow-500" /> },
              { t: "Career Readiness", d: "Preparing for AI careers and research.", icon: <Briefcase className="text-indigo-400" /> }
            ].map((obj, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="glass p-10 rounded-[3rem] border-white/5 flex flex-col gap-6 group hover:border-white/20 transition-all"
              >
                <div className="p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{obj.icon}</div>
                <div>
                  <h4 className="text-xl font-bold uppercase tracking-tight text-white mb-2">{obj.t}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{obj.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 10. EXPECTED IMPACT - THE MATRIX */}
        <div className="pt-32 pb-12 space-y-24">
           <div className="text-center">
              <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-14 leading-none text-white/90">
                IMPACT <span className="text-indigo-500 italic">MATRIX</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                {[
                  "Increased Awareness", 
                  "Improved Skills", 
                  "Strong Research Culture", 
                  "Interdisciplinary Sync", 
                  "Industry Readiness", 
                  "Leadership Development"
                ].map((impact, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: i * 0.05 }}
                    className="px-10 py-5 glass rounded-2xl border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-default shadow-sm"
                  >
                    {impact}
                  </motion.div>
                ))}
              </div>
           </div>

           {/* 11. CONCLUSION - FINAL TRANSMISSION */}
           <div className="text-center space-y-12">
              <div className="w-32 h-2 bg-indigo-500 mx-auto rounded-full shadow-[0_0_25px_rgba(79,70,229,0.6)]" />
              <div className="max-w-4xl mx-auto px-6">
                <p className="text-gray-400 text-xl md:text-4xl font-light leading-[1.3] italic font-tech">
                 "Transforming <span className="text-white font-bold">curiosity</span> into <span className="text-indigo-400 font-bold">competence</span> and ideas into impactful solutions."
                </p>
                <div className="mt-12 text-[10px] font-mono text-gray-700 uppercase tracking-[1em] font-black">
                   TERMINAL_CONNECTED // SYSTEM_HUB_STABLE
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
