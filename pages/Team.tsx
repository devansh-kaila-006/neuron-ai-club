
import React from 'react';
import { motion } from 'framer-motion';
import DecryptedText from '../components/DecryptedText.tsx';
// @ts-ignore
import { ShieldCheck, Cpu, Award, BookOpen, Microscope, Zap, Fingerprint, Star, Globe, Quote, Sparkles } from 'lucide-react';

const Team: React.FC = () => {
  // Fix: Cast motion to any to resolve property missing errors in strict environments
  const m = motion as any;

  const mentors = [
    {
      name: "Dr. Gopalakrishnan E. A.",
      role: "Principal, School of Computing, Bengaluru",
      image: "https://lh3.googleusercontent.com/d/1lZGMhEW5Srs4FOee38wN7B2N-T5eDhtJ",
      bio: "Dr. Gopalakrishnan E. A. specializes in Artificial Intelligence and Complex Systems. His pioneering research in thermoacoustic systems has been cited by the UK Prime Minister's office. A former SFB TRR40 Summer Fellow at TU Munich, his expertise spans Data-Driven Modelling and Nonlinear Dynamics.",
      tag: "CLUB_PATRON",
      credentials: ["Ph.D. IIT Madras", "TU Munich Fellow"],
      interests: ["Complex Systems", "Data Driven AI", "Nonlinear Dynamics"]
    },
    {
      name: "Dr. Manju Venugopalan",
      role: "Assistant Professor (Sl. Gd.), Bengaluru",
      image: "https://lh3.googleusercontent.com/d/1gkYYVLSJda7KzYGNvxErKY0Umzbzwcc1",
      bio: "Dr. Manju Venugopalan has 13 years of teaching experience. Her research interests include Natural Language Processing, Machine Learning, and Big Data Analytics. She is currently exploring multimodal decision systems and NLP in the medical domain.",
      tag: "CLUB_MENTOR",
      credentials: ["Ph.D.", "M.Tech", "MCA"],
      interests: ["NLP", "Machine Learning", "Big Data Analytics"],
      email: "v_manju@blr.amrita.edu"
    }
  ];

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 bg-transparent relative overflow-hidden">
      {/* Neural Ambience */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-24">
        {/* Header Section */}
        <header className="mb-20 space-y-4 text-left">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
          >
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Neural Governance</span>
          </m.div>
          
          <div className="flex flex-col">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] text-white flex flex-col select-none uppercase">
              <span className="block">THE</span>
              <DecryptedText 
                text="COLLECTIVE" 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic"
              />
            </h1>
          </div>
          
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl font-light leading-relaxed pt-6 md:pt-10">
            The strategic leadership steering the NEURØN ecosystem toward research-driven innovation and academic excellence.
          </p>
        </header>

        {/* MENTORS VERTICAL STACK */}
        <section className="flex flex-col gap-8 items-center">
          {mentors.map((mentor, idx) => (
            <m.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass max-w-4xl w-full rounded-[2.5rem] overflow-hidden flex flex-col border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative group bg-black/40"
            >
              {/* Background Grain */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.02] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row h-full">
                {/* Image Container */}
                <div className="md:w-[40%] overflow-hidden relative group/img bg-[#080808] min-h-[300px]">
                  <img 
                    src={mentor.image} 
                    alt={mentor.name} 
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-105 transition-all duration-1000 group-hover:scale-105" 
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
                  
                  {/* Scanning Line */}
                  <m.div 
                    animate={{ y: ['-100%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-px bg-indigo-500/40 z-20 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                  />
                </div>
                
                {/* Content Container */}
                <div className="md:w-[60%] p-8 flex flex-col justify-between relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Fingerprint size={14} className="text-indigo-500" />
                      <span className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[8px] block font-mono">
                        {mentor.tag}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                        {mentor.name}
                      </h2>
                      <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-[0.3em] font-mono leading-relaxed">{mentor.role}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {mentor.credentials.map((cred, i) => (
                        <div key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[7px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Star size={7} className="text-indigo-500" /> {cred}
                        </div>
                      ))}
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed font-light line-clamp-4">
                      {mentor.bio}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex flex-wrap gap-3">
                    {mentor.interests.map((interest, i) => (
                      <div key={i} className="flex items-center gap-2 group/item">
                        <div className="text-indigo-500/60 group-hover/item:text-indigo-400 transition-colors">
                          <Zap size={10} />
                        </div>
                        <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest group-hover/item:text-gray-400 transition-colors">
                          {interest}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </section>

        {/* LEADERSHIP GRID */}
        <section className="mt-32 max-w-4xl mx-auto space-y-12">
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.4em] font-bold">
                Executive Leadership
              </span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Founders & Directorate
            </h2>
          </div>

          {/* Hem Srimanvith Pedda (Founder & President) */}
          <m.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass w-full rounded-[2.5rem] overflow-hidden flex flex-col border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative bg-black/40"
          >
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="p-8 md:p-12 space-y-8">
              {/* Header metadata */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                    <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[8px] font-mono">
                      Founder's Vision
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
                    Hem Srimanvith Pedda
                  </h2>
                  <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-[0.3em] font-mono">
                    Founder & President, NEURØN
                  </p>
                </div>

                {/* Premium Large Portrait */}
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group/portrait self-start md:self-center shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/d/13rzAaXeE2etnwxLVDxKNNMQcSaYHVDhK"
                    alt="Hem Srimanvith Pedda"
                    className="w-full h-full object-cover scale-120 group-hover/portrait:scale-130 grayscale group-hover/portrait:grayscale-0 transition-all duration-700"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-indigo-500/10 mix-blend-color opacity-100 group-hover/portrait:opacity-0 transition-opacity" />
                </div>
              </div>

              {/* Quote Block */}
              <div className="relative">
                <div className="absolute -top-6 -left-4 text-indigo-500/10 select-none pointer-events-none">
                  <Quote size={80} />
                </div>
                <blockquote className="text-gray-300 text-sm md:text-base leading-relaxed font-light italic relative z-10 pl-6 border-l border-indigo-500/20">
                  "At NEURØN, we are not just building models; we are building a playground for the future. Our community was born out of a simple idea: that artificial intelligence shouldn't just be studied in isolation, but experimented with, broken, and reconstructed through pure collective curiosity. We bridge the gap between academic depth and open-source execution, empowering every student to become a pioneer in the next cognitive epoch."
                </blockquote>
              </div>

              {/* Founder info footer */}
              <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between text-xs text-gray-500">
                <div className="flex flex-wrap gap-3">
                  {[
                    "Deep Learning",
                    "Large Language Models",
                    "Multi-Agent Systems"
                  ].map((interest, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Zap size={10} className="text-indigo-500" />
                      <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                        {interest}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                  Est. 2026 // Bengaluru
                </div>
              </div>
            </div>
          </m.div>

          {/* Co-Founders & Technical Directorate Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Rohit Praveen Nair */}
            <m.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="glass rounded-[2rem] overflow-hidden flex flex-col border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative bg-black/40"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />
              
              <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1.5">
                    <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[8px] font-mono block">
                      Co-Founder
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                      Rohit Praveen Nair
                    </h3>
                    <p className="text-gray-500 text-[9px] font-mono uppercase tracking-widest">
                      Co-Founder, NEURØN
                    </p>
                  </div>

                  {/* Premium Large Portrait */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group/portrait self-start sm:self-center lg:self-start shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/d/1dJaWKmPxkOD2kgNygMs7NnB2Snlvwdam"
                      alt="Rohit Praveen Nair"
                      className="w-full h-full object-cover scale-120 group-hover/portrait:scale-130 grayscale group-hover/portrait:grayscale-0 transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-color opacity-100 group-hover/portrait:opacity-0 transition-opacity" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-indigo-500/5 select-none pointer-events-none">
                    <Quote size={40} />
                  </div>
                  <blockquote className="text-gray-300 text-xs md:text-sm leading-relaxed font-light italic relative z-10 pl-4 border-l border-indigo-500/20">
                    "We aim to cultivate a culture where theoretical concepts materialize into scalable open-source intelligence. NEURØN represents the nexus of raw engineering talent and unrestricted creative exploration."
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center text-[8px] font-mono text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {["MLOps & Infra", "Computer Vision", "Distributed Train"].map((interest, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Zap size={8} className="text-indigo-500" />
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>

            {/* Tanay Ashish */}
            <m.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass rounded-[2rem] overflow-hidden flex flex-col border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative bg-black/40"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />
              
              <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1.5">
                    <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[8px] font-mono block">
                      Co-Founder & VP
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                      Tanay Ashish
                    </h3>
                    <p className="text-gray-500 text-[9px] font-mono uppercase tracking-widest">
                      Co-Founder / Vice President, NEURØN
                    </p>
                  </div>

                  {/* Premium Large Portrait */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group/portrait self-start sm:self-center lg:self-start shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/d/1fLU1Djldt657I02XDldvSqJCkUP2nYDe"
                      alt="Tanay Ashish"
                      className="w-full h-full object-cover scale-120 group-hover/portrait:scale-130 grayscale group-hover/portrait:grayscale-0 transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-color opacity-100 group-hover/portrait:opacity-0 transition-opacity" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-indigo-500/5 select-none pointer-events-none">
                    <Quote size={40} />
                  </div>
                  <blockquote className="text-gray-300 text-xs md:text-sm leading-relaxed font-light italic relative z-10 pl-4 border-l border-indigo-500/20">
                    "Collaboration and relentless execution are at the core of NEURØN. By establishing robust technical frameworks and interactive platforms, we enable our members to push the absolute limits of computational creativity."
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center text-[8px] font-mono text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {["RLHF", "Neural Architectures", "Product Strategy"].map((interest, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Zap size={8} className="text-indigo-500" />
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>

            {/* Devansh Kaila */}
            <m.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="glass rounded-[2rem] overflow-hidden flex flex-col border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative bg-black/40"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />
              
              <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-start justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1.5">
                    <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[8px] font-mono block">
                      Tech Lead & Architect
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                      Devansh Kaila
                    </h3>
                    <p className="text-gray-500 text-[9px] font-mono uppercase tracking-widest">
                      Tech Lead // Web & Infra Developer
                    </p>
                  </div>

                  {/* Premium Large Portrait */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group/portrait self-start sm:self-center lg:self-start shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/d/1INCcP8aZDlVXGmPNWUiUiCey5InA4CqD"
                      alt="Devansh Kaila"
                      className="w-full h-full object-cover scale-120 group-hover/portrait:scale-130 grayscale group-hover/portrait:grayscale-0 transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-color opacity-100 group-hover/portrait:opacity-0 transition-opacity" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-indigo-500/5 select-none pointer-events-none">
                    <Quote size={40} />
                  </div>
                  <blockquote className="text-gray-300 text-xs md:text-sm leading-relaxed font-light italic relative z-10 pl-4 border-l border-indigo-500/20">
                    "From bare-metal container routing to building custom interactive platforms like this website, we build the technological spine of NEURØN. Great engineering should feel invisible, yet support absolute, unbounded scale."
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center text-[8px] font-mono text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {["Fullstack Systems", "Cloud Infrastructure", "Reactive UI/UX"].map((interest, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Zap size={8} className="text-indigo-500" />
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </section>

        {/* OFFICE BEARERS GRID */}
        <section className="mt-24 max-w-4xl mx-auto space-y-12">
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.4em] font-bold">
                Club Administration
              </span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Office Bearers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pavithra S (Vice President) */}
            <m.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="glass rounded-[2rem] overflow-hidden flex flex-col border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative bg-black/40"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />
              
              <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1.5">
                    <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[8px] font-mono block">
                      Vice President
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                      Pavithra S
                    </h3>
                    <p className="text-gray-500 text-[9px] font-mono uppercase tracking-widest">
                      Vice President, NEURØN
                    </p>
                  </div>

                  {/* Premium Large Portrait */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group/portrait self-start sm:self-center shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/d/1GvT2vP7eBBO6PrGNlCxRzF3C3cpYV08Y"
                      alt="Pavithra S"
                      className="w-full h-full object-cover scale-120 group-hover/portrait:scale-130 grayscale group-hover/portrait:grayscale-0 transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-color opacity-100 group-hover/portrait:opacity-0 transition-opacity" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-indigo-500/5 select-none pointer-events-none">
                    <Quote size={40} />
                  </div>
                  <blockquote className="text-gray-300 text-xs md:text-sm leading-relaxed font-light italic relative z-10 pl-4 border-l border-indigo-500/20">
                    "Empowering our community of innovators to transform bold concepts into actionable solutions. Through strategic partnerships and streamlined execution, we are shaping the future of AI co-creation."
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center text-[8px] font-mono text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {["Strategic Operations", "AI Integration", "Leadership"].map((interest, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Zap size={8} className="text-indigo-500" />
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>

            {/* Prajukta Behera (Treasurer) */}
            <m.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass rounded-[2rem] overflow-hidden flex flex-col border-white/5 hover:border-indigo-500/20 transition-all duration-700 shadow-2xl relative bg-black/40"
            >
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full pointer-events-none" />
              
              <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1.5">
                    <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[8px] font-mono block">
                      Treasurer
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                      Prajukta Behera
                    </h3>
                    <p className="text-gray-500 text-[9px] font-mono uppercase tracking-widest">
                      Treasurer, NEURØN
                    </p>
                  </div>

                  {/* Premium Large Portrait */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group/portrait self-start sm:self-center shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/d/1x_Fp6QcbqbQaLvK0BqUTMvkLTLt1gGM-"
                      alt="Prajukta Behera"
                      className="w-full h-full object-cover scale-120 group-hover/portrait:scale-130 grayscale group-hover/portrait:grayscale-0 transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 mix-blend-color opacity-100 group-hover/portrait:opacity-0 transition-opacity" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-indigo-500/5 select-none pointer-events-none">
                    <Quote size={40} />
                  </div>
                  <blockquote className="text-gray-300 text-xs md:text-sm leading-relaxed font-light italic relative z-10 pl-4 border-l border-indigo-500/20">
                    "Ensuring the sustainable expansion of NEURØN's technological ambitions. Strategic resource management allows us to fund complex research, high-impact events, and build deep engineering reserves."
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center text-[8px] font-mono text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {["Financial Strategy", "Resource Planning", "Project Audits"].map((interest, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Zap size={8} className="text-indigo-500" />
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </section>

        {/* Global Footer Decoration */}
        <footer className="text-center pt-20 space-y-6">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mx-auto" />
          <p className="text-[9px] font-mono font-black text-gray-800 uppercase tracking-[0.8em]">
            Neural Grid Authorized // Chief Directive
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Team;
