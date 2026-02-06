
// Fix: Import React to resolve React namespace usage
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, MapPin, ChevronDown, ChevronUp, Sparkles, Trophy, Users, Lightbulb } from 'lucide-react';

const Hackathon: React.FC = () => {
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
    { time: "09:00 PM", task: "Check-in & Networking", desc: "Arrive at Amrita Innovation Hall, collect your kits." },
    { time: "10:30 PM", task: "TALOS Opening", desc: "Briefing and Problem Statement reveal." },
    { time: "11:00 PM", task: "Hacking Starts", desc: "Focus on creativity and real-world relevance." },
    { time: "03:00 AM", task: "Midnight Pulse", desc: "Surprise AI challenges and snacks." },
    { time: "08:00 AM", task: "Sync & Breakfast", desc: "Quick progress check with mentors." },
    { time: "01:00 PM", task: "Build Refinement", desc: "Polish your AI usage and presentation." },
    { time: "07:00 PM", task: "Code Freeze", desc: "Final pushes to submission portal." },
    { time: "08:30 PM", task: "TALOS Demos", desc: "Final pitch and demonstration to review panel." },
    { time: "10:00 PM", task: "Award Ceremony", desc: "Celebrating the best AI solutions." },
  ];

  const rules = [
    { q: "Who can participate?", a: "NEURØN and TALOS are open to students from all departments and academic years. No prior AI experience is required! It is designed to be beginner-friendly." },
    { q: "What is the focus of TALOS?", a: "Student teams ideate, design, and develop AI-based solutions to real-world challenges within a limited time frame. The focus is on creativity, feasibility, and impact." },
    { q: "What are the judging criteria?", a: "Emphasis is placed on idea clarity, effective AI usage, and the quality of your solution presentation. Technical complexity is valued but must serve the solution's impact." },
    { q: "Team requirements?", a: "Teams must consist of 2 to 4 members. We highly encourage cross-department collaboration to bring diverse perspectives." },
  ];

  const [openRule, setOpenRule] = useState<number | null>(0);

  return (
    <div className="pt-24 min-h-screen px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <section className="text-center mb-16">
          {/* @ts-ignore - Fixing framer-motion type mismatch */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tighter">
              TALOS
            </h1>
            <p className="text-2xl font-bold text-white mb-2">Flagship Overnight AI Hackathon</p>
            <p className="text-gray-400 italic">"Ideate, Build, and Pitch the Future of AI."</p>
          </motion.div>
        </section>

        <section className="mb-20 text-center">
          {/* @ts-ignore - Fixing framer-motion type mismatch */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full border-indigo-500/20 mb-8">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">COUNTDOWN TO FEB 20, 2026</span>
          </motion.div>
          <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto">
            {Object.entries(timeLeft).map(([key, val]) => (
              <div key={key} className="glass p-4 rounded-2xl relative overflow-hidden group">
                <div className="text-3xl md:text-5xl font-bold text-white mb-1 relative z-10">{val.toString().padStart(2, '0')}</div>
                <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest relative z-10">{key}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {[
            { icon: <Users />, label: "Open to All Branches" },
            { icon: <Lightbulb />, label: "Beginner Friendly" },
            { icon: <Sparkles />, label: "Real-world Problems" },
            { icon: <Trophy />, label: "Final Pitch & Demo" },
          ].map((feature, i) => (
            <div key={i} className="glass p-6 rounded-2xl text-center flex flex-col items-center gap-3 group hover:border-indigo-500/30 transition-all">
              <div className="text-indigo-400 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{feature.label}</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          <section>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Calendar className="text-indigo-500" /> TALOS Roadmap
            </h2>
            <div className="space-y-0 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {timeline.map((item, i) => (
                /* @ts-ignore - Fixing framer-motion type mismatch */
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative pl-10 pb-10 last:pb-0">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full glass border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(79,70,229,0.4)]">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <div className="text-sm font-bold text-indigo-400 mb-1">{item.time}</div>
                  <h3 className="text-lg font-bold mb-1">{item.task}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <MapPin className="text-indigo-500" /> Venue Information
            </h2>
            <div className="glass p-6 rounded-2xl mb-12 border-indigo-500/20">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <MapPin className="text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-1 font-mono">NEURØN HUB</h3>
                  <p className="text-sm text-gray-400">Innovation Hall, Amrita Vishwa Vidyapeetham</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-8">Event Policies</h2>
            <div className="space-y-4">
              {rules.map((rule, i) => (
                <div key={i} className="glass rounded-xl overflow-hidden">
                  <button onClick={() => setOpenRule(openRule === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left font-bold hover:bg-white/5 transition-colors">
                    <span>{rule.q}</span>
                    {openRule === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <AnimatePresence>
                    {openRule === i && (
                      /* @ts-ignore - Fixing framer-motion type mismatch */
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-5 pt-0 text-sm text-gray-400 border-t border-white/5 bg-white/5">
                          {rule.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Hackathon;
