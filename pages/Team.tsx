
import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';

const Team: React.FC = () => {
  const mentor = {
    name: "Dr. Ananya Sharma",
    role: "Faculty Advisor",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    bio: "AI Ethics specialist and Research Lead at Amrita. Dr. Sharma has pioneered multiple neural architecture initiatives across campus.",
    socials: { linkedin: "#", twitter: "#" }
  };

  const core = [
    { 
      name: "Siddharth Verma", 
      role: "Club President", 
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400", 
      social: "@sverma" 
    },
    { 
      name: "Meera Nair", 
      role: "Technical Head", 
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400", 
      social: "@mnair" 
    },
    { 
      name: "Rohan Das", 
      role: "Operations Lead", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400", 
      social: "@rdas" 
    },
    { 
      name: "Isha Kapoor", 
      role: "PR & Outreach", 
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400", 
      social: "@ikapoor" 
    },
  ];

  return (
    <div className="pt-24 min-h-screen px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            The Brains Behind NEURØN
          </motion.h1>
          <p className="text-gray-400">Guided by excellence, building the future of intelligence.</p>
        </div>

        {/* Mentor Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass max-w-4xl mx-auto rounded-3xl overflow-hidden flex flex-col md:flex-row border-indigo-500/30 shadow-2xl"
          >
            <div className="md:w-1/2 overflow-hidden">
              <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" />
            </div>
            <div className="md:w-1/2 p-10 flex flex-col justify-center bg-indigo-600/5">
              <span className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] mb-3 border-l-2 border-indigo-500 pl-3">{mentor.role}</span>
              <h2 className="text-3xl font-bold mb-4">{mentor.name}</h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-sm">{mentor.bio}</p>
              <div className="flex gap-4">
                <a href={mentor.socials.linkedin} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href={mentor.socials.twitter} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Core Team Grid */}
        <section>
          <h2 className="text-xl font-bold mb-12 text-center uppercase tracking-[0.3em] text-gray-500 opacity-50">Executive Council</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {core.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="glass rounded-3xl overflow-hidden p-5 text-center hover:border-indigo-500/50 transition-all duration-500 hover:bg-indigo-500/5 shadow-xl">
                  <div className="relative mb-6 overflow-hidden rounded-2xl">
                    <img src={member.image} alt={member.name} className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors">{member.name}</h3>
                  <p className="text-indigo-400/60 text-xs font-mono mb-6 uppercase tracking-widest">{member.role}</p>
                  <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <Github className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                    <Linkedin className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                    <ExternalLink className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Team;