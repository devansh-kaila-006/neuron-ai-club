
import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import { 
  Code, Megaphone, Microscope, Palette, 
  LayoutPanelLeft, Handshake, ChevronRight,
  Zap
} from 'lucide-react';

const departments = [
  {
    id: 'tech',
    title: "Technical",
    icon: <Code size={32} />,
    colorClass: "text-indigo-400",
    bgClass: "bg-indigo-500/10",
    glowClass: "shadow-indigo-500/20",
    borderClass: "border-indigo-500/30",
    desc: "Builds and supports AI projects through hands-on development and mentorship. Maintains code practices and helps members turn ideas into working solutions.",
    meta: "CORE_DEV_UNIT"
  },
  {
    id: 'pr',
    title: "PR & Marketing",
    icon: <Megaphone size={32} />,
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    glowClass: "shadow-purple-500/20",
    borderClass: "border-purple-500/30",
    desc: "Handles promotions, social media, and storytelling for the club. Builds NEURØN’s identity and ensures strong outreach and engagement.",
    meta: "IDENTITY_MGMT"
  },
  {
    id: 'rd',
    title: "Research & Development",
    icon: <Microscope size={32} />,
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    glowClass: "shadow-cyan-500/20",
    borderClass: "border-cyan-500/30",
    desc: "Explores AI through research, experiments, and advanced problem-solving. Guides members toward innovation and research-oriented learning.",
    meta: "NEURAL_SYNTHESIS"
  },
  {
    id: 'design',
    title: "Design",
    icon: <Palette size={32} />,
    colorClass: "text-pink-400",
    bgClass: "bg-pink-500/10",
    glowClass: "shadow-pink-500/20",
    borderClass: "border-pink-500/30",
    desc: "Creates posters, visuals, presentations, and branding assets. Shapes the clean, futuristic visual identity of NEURØN.",
    meta: "VISUAL_ENGINE"
  },
  {
    id: 'logistics',
    title: "Logistics & Event Management",
    icon: <LayoutPanelLeft size={32} />,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    glowClass: "shadow-blue-500/20",
    borderClass: "border-blue-500/30",
    desc: "Plans and executes events smoothly from start to finish. Manages coordination, schedules, and on-ground operations.",
    meta: "TACTICAL_OPS"
  },
  {
    id: 'relations',
    title: "Guest Relations",
    icon: <Handshake size={32} />,
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    glowClass: "shadow-emerald-500/20",
    borderClass: "border-emerald-500/30",
    desc: "Manages communication and hospitality for speakers and mentors. Ensures smooth coordination and builds industry and academic connections.",
    meta: "EXTERNAL_UPLINK"
  }
];

const Departments: React.FC = () => {
  // Fix: Cast motion to any to resolve property missing errors in strict environments
  const m = motion as any;

  return (
    <div className="pt-24 min-h-screen px-6 pb-40 flex flex-col items-center bg-transparent relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl w-full">
        <header className="mb-20 space-y-4 text-left">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
          >
            <Zap size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Neural Infrastructure</span>
          </m.div>
          
          <div className="flex flex-col">
            <h3 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] text-white flex flex-col select-none uppercase">
              <span className="block">SQUAD</span>
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic">
                DIVISIONS
              </span>
            </h3>
          </div>
          
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl font-light leading-relaxed pt-6 md:pt-10">
            The specialized operational units that drive the NEURØN ecosystem forward. Each node is critical to our collective intelligence.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, i) => (
            <m.div
              key={dept.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`glass group p-10 rounded-[3.5rem] border-white/5 hover:${dept.borderClass} transition-all duration-700 relative overflow-hidden flex flex-col`}
            >
              {/* Tactical Background Element */}
              <div className={`absolute -right-12 -bottom-12 opacity-[0.02] group-hover:opacity-[0.06] ${dept.colorClass} transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-12`}>
                {React.cloneElement(dept.icon as React.ReactElement<any>, { size: 280, strokeWidth: 0.5 })}
              </div>

              {/* Accent Bar */}
              <div className={`absolute top-0 left-12 right-12 h-[3px] bg-gradient-to-r from-transparent via-${dept.colorClass.split('-')[1]}-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center`} />

              <div className="relative z-10 space-y-8 flex-1">
                <div className="flex items-center justify-between">
                  <div className={`w-20 h-20 ${dept.bgClass} rounded-3xl flex items-center justify-center ${dept.colorClass} group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all duration-500 border border-white/5`}>
                    {dept.icon}
                  </div>
                  <span className={`text-[9px] font-mono font-black text-gray-700 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full group-hover:text-white transition-colors border border-white/5`}>
                    {dept.meta}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-3xl font-black uppercase tracking-tight text-white group-hover:${dept.colorClass} transition-colors duration-500`}>
                    {dept.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-light group-hover:text-gray-300 transition-colors duration-500">
                    {dept.desc}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-[1px] w-8 ${dept.bgClass.replace('/10', '/30')}`} />
                  <span className="text-[8px] font-mono font-black text-gray-700 uppercase tracking-[0.4em]">Active_Operational_Unit</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${dept.bgClass.replace('/10', '/60')} animate-pulse`} />
              </div>

              {/* Decorative Scanline */}
              <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-${dept.colorClass.split('-')[1]}-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left`} />
            </m.div>
          ))}
        </div>

        {/* Action Footer */}
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-16 glass rounded-[5rem] border-indigo-500/10 text-center space-y-10 relative overflow-hidden group/footer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent opacity-0 group-hover/footer:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full mb-8 shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">Ready to join a specific squad?</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-10 font-light">
              Each division operates as a specialized cell within our neural grid. Synchronize your expertise today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                to="/join" 
                className="px-16 py-6 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(79,70,229,0.4)] text-white group/btn"
              >
                Apply Now <ChevronRight size={20} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>
          </div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </m.div>
      </div>
    </div>
  );
};

export default Departments;
