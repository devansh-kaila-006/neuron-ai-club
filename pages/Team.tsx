
import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Github, Linkedin, Twitter, ExternalLink, ShieldCheck, Cpu, Globe, Zap, Users } from 'lucide-react';

const Team: React.FC = () => {
  const mentor = {
    name: "Dr. Ananya Sharma",
    role: "Faculty Advisor",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    bio: "AI Ethics specialist and Research Lead at Amrita. Dr. Sharma has pioneered multiple neural architecture initiatives across campus, guiding the club's research-first philosophy.",
    socials: { linkedin: "#", twitter: "#" },
    tag: "COUNCIL_OVERSEER"
  };

  const founders = [
    { 
      name: "Siddharth Verma", 
      role: "President & Founder", 
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400", 
      bio: "Neural architect and community lead.",
      social: "@sverma" 
    },
    { 
      name: "Meera Nair", 
      role: "Technical Head & Founder", 
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400", 
      bio: "Systems optimization and R&D lead.",
      social: "@mnair" 
    },
    { 
      name: "Rohan Das", 
      role: "Operations & Founder", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400", 
      bio: "Tactical planning and logistics.",
      social: "@rdas" 
    },
    { 
      name: "Isha Kapoor", 
      role: "Outreach & Founder", 
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400", 
      social: "@ikapoor",
      bio: "PR, marketing and identity management."
    },
  ];

  const officeBearers = [
    { 
      name: "Aryan Sharma", 
      role: "Vice President", 
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400", 
      social: "@asharma" 
    },
    { 
      name: "Ananya Rao", 
      role: "General Secretary", 
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400", 
      social: "@arao" 
    },
    { 
      name: "Kabir Singh", 
      role: "Treasurer", 
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400", 
      social: "@ksingh" 
    },
  ];

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 bg-transparent relative overflow-hidden">
      {/* Decorative Orbs */}
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
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">The Neural Council</span>
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
            The elite minds steering the NEURØN ecosystem toward the singularity. Defined by research, driven by innovation.
          </p>
        </header>

        {/* 1. MENTOR SECTION */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-l-2 border-indigo-500 pl-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">Strategic Advisor</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-[4rem] overflow-hidden flex flex-col md:flex-row border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <Cpu size={280} strokeWidth={0.5} />
            </div>
            
            <div className="md:w-1/2 overflow-hidden relative">
              <img 
                src={mentor.image} 
                alt={mentor.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:bg-gradient-to-l" />
            </div>
            
            <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center relative z-10 space-y-8">
              <div>
                <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block font-mono">
                  {mentor.tag}
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">{mentor.name}</h2>
                <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                  {mentor.role}
                </div>
                <p className="text-gray-400 text-lg leading-relaxed font-light">{mentor.bio}</p>
              </div>
              
              <div className="flex gap-4">
                {[Linkedin, Twitter, Globe].map((Icon, idx) => (
                  <button key={idx} className="w-12 h-12 rounded-2xl glass border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all group/icon">
                    <Icon size={20} className="text-gray-500 group-hover/icon:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. FOUNDERS SECTION */}
        <section className="space-y-16">
          <div className="flex items-center gap-4 border-l-2 border-purple-500 pl-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">Founding Council</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="glass rounded-[3.5rem] overflow-hidden p-8 text-center border-white/5 hover:border-purple-500/30 transition-all duration-700 hover:bg-purple-500/[0.03] shadow-xl flex flex-col h-full">
                  <div className="relative mb-8 overflow-hidden rounded-[2.5rem] aspect-square">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <Linkedin size={16} className="text-white cursor-pointer hover:text-purple-400" />
                      <Github size={16} className="text-white cursor-pointer hover:text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-purple-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-purple-400/60 text-[9px] font-mono font-black uppercase tracking-[0.3em] mb-4">
                      {member.role}
                    </p>
                    <p className="text-gray-500 text-xs font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {member.bio}
                    </p>
                  </div>

                  <div className="pt-6 mt-auto">
                    <div className="h-px w-8 bg-purple-500/20 mx-auto group-hover:w-full transition-all duration-700" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. OFFICE BEARERS SECTION */}
        <section className="space-y-16">
          <div className="flex items-center gap-4 border-l-2 border-cyan-500 pl-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">Executive Office</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/20 to-transparent" />
          </div>

          <div className="grid sm:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {officeBearers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="glass rounded-[3rem] overflow-hidden p-10 text-center border-white/5 hover:border-cyan-500/30 transition-all duration-700 hover:bg-cyan-500/[0.02] shadow-xl">
                  <div className="relative mb-8 flex justify-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-cyan-500/40 transition-all duration-700 p-1 bg-gradient-to-br from-white/5 to-transparent">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 rounded-full" 
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-cyan-400/60 text-[10px] font-mono font-black uppercase tracking-[0.3em] mb-6">
                    {member.role}
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <button className="p-2.5 rounded-xl glass border-white/10 text-gray-600 hover:text-white hover:border-cyan-500/40 transition-all">
                      <Linkedin size={14} />
                    </button>
                    <button className="p-2.5 rounded-xl glass border-white/10 text-gray-600 hover:text-white hover:border-cyan-500/40 transition-all">
                      <Twitter size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Global Footer Decoration */}
        <footer className="text-center pt-24 space-y-6">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mx-auto" />
          <p className="text-[10px] font-mono font-black text-gray-700 uppercase tracking-[0.8em]">
            Neural Council // Grid Authorized
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Team;
