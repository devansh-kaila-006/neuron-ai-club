
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bot, Zap, Shield, Code, ChevronRight, Target, Eye, Rocket, BookOpen, 
  Globe, Briefcase, Activity, Radio, Layers, Users, Cpu, Terminal, 
  Lightbulb, GraduationCap, Microscope, Share2
} from 'lucide-react';
import { storage } from '../lib/storage.ts';

const Home: React.FC = () => {
  const [liveStats, setLiveStats] = useState({ total: 0, checkedIn: 0 });

  useEffect(() => {
    storage.getStats().then(s => setLiveStats({ total: s.totalTeams, checkedIn: s.checkedIn }));
    const interval = setInterval(() => {
      storage.getStats().then(s => setLiveStats({ total: s.totalTeams, checkedIn: s.checkedIn }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Live Network Status */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-8 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                Grid Status: {liveStats.total} Squads Syncronized
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
              NEUR<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Ø</span>N
            </h1>
            <p className="text-xl md:text-2xl font-medium text-indigo-300 italic mb-6">
              “Built by students. Driven by curiosity. Powered by AI.”
            </p>
            <p className="text-lg text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              NEURØN is Amrita Vishwa Vidyapeetham’s dedicated Artificial Intelligence Community of Practice (CoP). 
              A collaborative platform for structured learning, experimentation, research, and innovation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-indigo-600 rounded-lg font-bold overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">
                  Uplink to TALOS <ChevronRight className="w-5 h-5" />
                </span>
              </Link>
              <Link
                to="/hackathon"
                className="px-8 py-4 border border-white/10 rounded-lg font-bold hover:bg-white/5 transition-colors"
              >
                System Specs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="px-6 py-20 bg-[#080808]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-10 rounded-3xl border-indigo-500/20"
          >
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-6">
              <Eye size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed italic">
              "To establish a strong, inclusive, and innovative Artificial Intelligence ecosystem at Amrita that empowers students to become skilled AI practitioners, researchers, and responsible technology leaders."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-10 rounded-3xl border-purple-500/20"
          >
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
              <Rocket size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <ul className="text-gray-400 space-y-3">
              <li className="flex gap-3"><ChevronRight className="text-purple-500 shrink-0" size={18}/> Learn AI concepts through practical exposure</li>
              <li className="flex gap-3"><ChevronRight className="text-purple-500 shrink-0" size={18}/> Apply AI across diverse domains</li>
              <li className="flex gap-3"><ChevronRight className="text-purple-500 shrink-0" size={18}/> Share knowledge and experiences</li>
              <li className="flex gap-3"><ChevronRight className="text-purple-500 shrink-0" size={18}/> Innovate responsibly and ethically</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CoP Framework Section */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-indigo-500 font-bold mb-4">The CoP Framework</h2>
            <h3 className="text-4xl font-bold">Community of Practice Pillars</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Layers className="text-blue-400" />, 
                title: "Domain", 
                desc: "Artificial Intelligence, Machine Learning, Data Science, and Intelligent Systems." 
              },
              { 
                icon: <Users className="text-indigo-400" />, 
                title: "Community", 
                desc: "A network of students, faculty mentors, researchers, alumni, and industry professionals." 
              },
              { 
                icon: <Activity className="text-purple-400" />, 
                title: "Practice", 
                desc: "Hands-on projects, workshops, hackathons, research initiatives, and shared resources." 
              },
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-[2.5rem] border-white/5 text-center group hover:border-indigo-500/30 transition-all"
              >
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{pillar.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives Grid */}
      <section className="px-6 py-20 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Strategic Objectives</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: <Globe size={20}/>, text: "Create awareness and interest in AI" },
                  { icon: <GraduationCap size={20}/>, text: "Provide foundational and advanced knowledge" },
                  { icon: <Cpu size={20}/>, text: "Enable hands-on learning through projects" },
                  { icon: <Briefcase size={20}/>, text: "Promote interdisciplinary AI applications" },
                  { icon: <Lightbulb size={20}/>, text: "Encourage innovation" },
                  { icon: <Microscope size={20}/>, text: "Prepare students for AI-related careers" },
                ].map((obj, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 glass rounded-2xl border-white/5">
                    <div className="text-indigo-500 mt-1">{obj.icon}</div>
                    <p className="text-sm text-gray-300 font-medium">{obj.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass p-10 rounded-[3rem] border-indigo-500/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu size={120} /></div>
               <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Terminal className="text-indigo-400"/> Club Activities</h3>
               <ul className="space-y-4">
                 {[
                   "Introductory sessions on AI concepts and tools",
                   "Workshops on Python, ML, and Deep Learning",
                   "Sessions on Vision, Language, and Automation",
                   "Guided mini-projects and build sessions",
                   "Guest lectures by industry experts",
                   "Peer learning circles and mentoring",
                   "Research paper discussions",
                   "Interdisciplinary problem-solving events"
                 ].map((act, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                     {act}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Expected Impact</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Increased AI Awareness",
              "Improved Technical Skills",
              "Strong Research Culture",
              "Interdisciplinary Collaboration",
              "Industry Readiness",
              "Leadership Development"
            ].map((impact, i) => (
              <span key={i} className="px-6 py-3 glass rounded-full border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                {impact}
              </span>
            ))}
          </div>
          <p className="mt-16 text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto italic">
            "By functioning as a Community of Practice, the club will transform curiosity into competence and ideas into impactful solutions."
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
