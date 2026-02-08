
import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { ShieldCheck, Cpu, Award, BookOpen, Microscope, Zap, ChevronRight } from 'lucide-react';

const Team: React.FC = () => {
  const mentor = {
    name: "Dr. Gopalakrishnan E. A.",
    role: "Principal, School of Computing, Bengaluru",
    subRole: "Professor, School of Computing",
    image: "https://lh3.googleusercontent.com/d/1lZGMhEW5Srs4FOee38wN7B2N-T5eDhtJ",
    bio: "Dr. Gopalakrishnan E. A. obtained his Ph.D. from IIT Madras and is a distinguished academic leader specializing in Artificial Intelligence and Complex Systems. His pioneering research in thermoacoustic systems has been cited by the UK Prime Minister's office in governance policy documents. A former SFB TRR40 Summer Fellow at TU Munich and Visiting Scientist, his expertise spans Data-Driven Modelling, Nonlinear Dynamics, and Robust Early Warning Indicators for engineering systems.",
    tag: "PRINCIPAL_DIRECTIVE",
    credentials: ["Ph.D. IIT Madras", "TU Munich Fellow", "Nature Scientific Reports Author"]
  };

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 bg-transparent relative overflow-hidden">
      {/* Neural Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-32">
        {/* Header Section */}
        <header className="text-center md:text-left space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
          >
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Neural Governance</span>
          </motion.div>
          
          <div className="flex flex-col">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] text-white flex flex-col select-none uppercase">
              <span className="block">THE</span>
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic">
                COLLECTIVE
              </span>
            </h1>
          </div>
          
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl font-light leading-relaxed pt-6 md:pt-10">
            The elite leadership steering the NEURØN ecosystem. Guided by world-class academic excellence and research-driven innovation.
          </p>
        </header>

        {/* 1. MENTOR/PRINCIPAL SECTION */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-l-2 border-indigo-500 pl-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">Chief Mentor</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-[4rem] overflow-hidden flex flex-col lg:flex-row border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative group bg-black/40"
          >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
               <Cpu size={320} strokeWidth={0.5} />
            </div>
            
            {/* Image Container */}
            <div className="lg:w-2/5 overflow-hidden relative min-h-[400px]">
              <img 
                src={mentor.image} 
                alt={mentor.name} 
                className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 group-hover:scale-105" 
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent hidden lg:block" />
            </div>
            
            {/* Content Container */}
            <div className="lg:w-3/5 p-12 md:p-16 lg:p-24 flex flex-col justify-center relative z-10 space-y-10">
              <div className="space-y-6">
                <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px] block font-mono">
                  {mentor.tag}
                </span>
                
                <div className="space-y-2">
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">
                    {mentor.name}
                  </h2>
                  <div className="flex flex-col gap-1">
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">{mentor.role}</span>
                    <span className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">{mentor.subRole}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {mentor.credentials.map((cred, idx) => (
                    <div key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-gray-400 uppercase tracking-wider">
                      {cred}
                    </div>
                  ))}
                </div>

                <p className="text-gray-400 text-lg leading-relaxed font-light max-w-2xl">
                  {mentor.bio}
                </p>
              </div>

              {/* Research Interest Tags */}
              <div className="pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { icon: <Microscope size={16} />, text: "Complex Systems" },
                  { icon: <Zap size={16} />, text: "Data Driven AI" },
                  { icon: <BookOpen size={16} />, text: "Nonlinear Dynamics" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group/item">
                    <div className="text-indigo-500 group-hover/item:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest group-hover/item:text-gray-400 transition-colors">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Research Excellence Stats (Contextual to Mentor) */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { label: "Research Citations", value: "Google Scholar", desc: "Wide industrial & academic impact." },
            { label: "Global Fellowship", value: "TU Munich", desc: "International research synergy." },
            { label: "Policy Impact", value: "UK Govt Citation", desc: "Governance-level AI recognition." }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-10 rounded-[3rem] border-white/5 hover:border-indigo-500/10 transition-all text-center group"
            >
              <Award className="mx-auto mb-6 text-indigo-500 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] mb-2">{stat.label}</h4>
              <p className="text-2xl font-black text-white mb-2">{stat.value}</p>
              <p className="text-xs text-gray-600 italic">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Global Footer Decoration */}
        <footer className="text-center pt-24 space-y-6">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mx-auto" />
          <p className="text-[10px] font-mono font-black text-gray-700 uppercase tracking-[0.8em]">
            Neural Grid Authorized // Office of the Principal
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Team;
