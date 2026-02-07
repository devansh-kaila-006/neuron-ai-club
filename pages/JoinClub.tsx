
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Hash, MapPin, Phone, Layers, 
  Send, Loader2, Cpu, CheckCircle, Sparkles,
  Code, Megaphone, Microscope, Palette, 
  Handshake, LayoutPanelLeft, ChevronRight,
  ArrowLeft, Terminal, ShieldCheck, Zap,
  Activity, Fingerprint, Globe, Award,
  Cpu as CpuIcon, Network, Target, Workflow,
  BookOpen, Rocket, BrainCircuit, Hexagon,
  ShieldAlert, GitBranch
} from 'lucide-react';
import { z } from 'zod';
import { supabase } from '../lib/storage.ts';
import { useToast } from '../context/ToastContext.tsx';

const departments = [
  { id: 'Technical', name: "Technical", icon: <Code size={22} />, color: "indigo", desc: "Core AI/ML development & applied problem-solving." },
  { id: 'PR & Marketing', name: "Outreach", icon: <Megaphone size={22} />, color: "purple", desc: "Building awareness & interest in AI across campus." },
  { id: 'Research & Development', name: "R & D", icon: <Microscope size={22} />, color: "cyan", desc: "Deep learning research & academic paper synthesis." },
  { id: 'Design', name: "Creative", icon: <Palette size={22} />, color: "pink", desc: "UI/UX & creative neural visualizers for projects." },
  { id: 'Logistics', name: "Logistics", icon: <LayoutPanelLeft size={22} />, color: "blue", desc: "Event management & tactical operational planning." },
  { id: 'Relations', name: "Relations", icon: <Handshake size={22} />, color: "emerald", desc: "Liaison with industry experts & alumni network." }
];

const perks = [
  { 
    icon: <CpuIcon size={24} className="text-indigo-400" />, 
    title: "Technical Mastery", 
    desc: "Hands-on workshops on Python, Machine Learning, and Deep Learning using modern AI platforms.",
    className: "lg:col-span-2"
  },
  { 
    icon: <Zap size={24} className="text-cyan-400" />, 
    title: "Research Initiatives", 
    desc: "Contribute to cutting-edge research paper discussions and interdisciplinary problem-solving events.",
    className: "lg:col-span-1"
  },
  { 
    icon: <BookOpen size={24} className="text-purple-400" />, 
    title: "Domain Excellence", 
    desc: "Structured guidance in AI principles, ethical considerations, and applied systems design.",
    className: "lg:col-span-1"
  },
  { 
    icon: <Network size={24} className="text-emerald-400" />, 
    title: "Industry Readiness", 
    desc: "Direct interactions with industry experts and preparing for AI-related careers and research.",
    className: "lg:col-span-2"
  }
];

const missionPoints = [
  { 
    id: '01', 
    title: "Practical Exposure", 
    desc: "Learn AI concepts through direct interaction with production-grade neural architectures.",
    tag: "APPLIED_ML",
    icon: <Cpu size={16} />
  },
  { 
    id: '02', 
    title: "Diverse Synergy", 
    desc: "Apply AI across medicine, finance, and engineering to solve complex multi-domain challenges.",
    tag: "CROSS_DOMAIN",
    icon: <GitBranch size={16} />
  },
  { 
    id: '03', 
    title: "Ethical Innovation", 
    desc: "Pioneer the next generation of synthetic intelligence with responsibility and human-centric values.",
    tag: "ALIGNMENT",
    icon: <ShieldAlert size={16} />
  }
];

const JoinClub: React.FC = () => {
  const toast = useToast();
  const [phase, setPhase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    branch: '',
    semester: '',
    phone: '',
    department: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validatePhase = () => {
    let phaseErrors: any = {};
    if (phase === 1) {
      if (!formData.name) phaseErrors.name = "ID Required";
      if (!formData.regNumber) phaseErrors.regNumber = "Reg Required";
      if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) phaseErrors.phone = "10-digit link required";
    } else if (phase === 2) {
      if (!formData.branch) phaseErrors.branch = "Node Required";
      if (!formData.semester) phaseErrors.semester = "Cycle Required";
    }

    if (Object.keys(phaseErrors).length > 0) {
      setErrors(phaseErrors);
      toast.error("Calibration required. Check manifest data.");
      return false;
    }
    return true;
  };

  const nextPhase = () => {
    if (validatePhase()) setPhase(prev => Math.min(prev + 1, 3));
  };

  const prevPhase = () => setPhase(prev => Math.max(prev - 1, 1));

  const selectDepartment = (dept: string) => {
    setFormData(prev => ({ ...prev, department: dept }));
    if (errors.department) {
      const newErrors = { ...errors };
      delete newErrors.department;
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department) {
      setErrors({ department: "Vector required" });
      toast.error("Select an operational department.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!supabase) throw new Error("Neural Grid Offline");
      const { error } = await supabase.from('club_applications').insert([{
        name: formData.name,
        reg_number: formData.regNumber,
        branch: formData.branch,
        semester: formData.semester,
        phone: formData.phone,
        department: formData.department
      }]);
      if (error) throw error;
      setIsSuccess(true);
      toast.success("Synchronized successfully. Welcome to the Collective.");
    } catch (err: any) {
      toast.error(`Sync Failure: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 flex flex-col items-center bg-[#050505]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[160px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[160px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="max-w-7xl w-full">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="recruitment-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-12 gap-12 lg:gap-20"
            >
              {/* Left Column: Vision & Benefits */}
              <div className="lg:col-span-5 space-y-12">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
                  >
                    <BrainCircuit size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">NEURØN Recruitment Sequence</span>
                  </motion.div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                    SYNC TO THE <br />
                    <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic">COLLECTIVE</span>
                  </h1>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-lg font-light">
                    Join Amrita's dedicated Artificial Intelligence Community of Practice (CoP). We transform curiosity into competence and ideas into impactful solutions.
                  </p>
                </div>

                {/* Benefits Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {perks.map((perk, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass p-6 rounded-[2.5rem] border-white/5 group hover:bg-white/[0.04] transition-all duration-500 ${perk.className}`}
                    >
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {perk.icon}
                      </div>
                      <h4 className="font-bold text-lg mb-2">{perk.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-light">{perk.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Mission Manifesto Section - Advanced UI */}
                <div className="space-y-6 relative">
                  <div className="flex items-center justify-between mb-2 px-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                      <Hexagon className="text-indigo-500 fill-indigo-500/10" size={24} />
                      Mission Hub
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       Grid_Operational
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {missionPoints.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="glass group/mission p-6 rounded-[2rem] border-white/5 relative overflow-hidden transition-all duration-500 hover:border-indigo-500/20 hover:bg-indigo-500/[0.02]"
                      >
                        {/* Background Geometric Detail */}
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/mission:opacity-10 transition-opacity">
                          {m.icon}
                        </div>
                        
                        <div className="flex gap-6 items-start relative z-10">
                          {/* Point Index Bubble */}
                          <div className="shrink-0 flex flex-col items-center gap-3 pt-1">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-white/5 flex items-center justify-center text-[10px] font-mono font-bold text-indigo-400 group-hover/mission:bg-indigo-500 group-hover/mission:text-white transition-all duration-500 shadow-xl">
                              {m.id}
                            </div>
                            {i < missionPoints.length - 1 && (
                              <div className="w-px h-12 bg-gradient-to-b from-indigo-500/30 to-transparent" />
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-tech text-xs uppercase tracking-[0.2em] text-white group-hover/mission:text-indigo-400 transition-colors">
                                {m.title}
                              </h4>
                              <span className="text-[8px] font-mono px-2 py-0.5 rounded-full border border-white/5 text-gray-600 group-hover/mission:text-gray-400 transition-colors">
                                {m.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-light group-hover/mission:text-gray-300 transition-colors">
                              {m.desc}
                            </p>
                          </div>
                        </div>

                        {/* Hover Decorative Line */}
                        <motion.div 
                          className="absolute bottom-0 left-0 h-[2px] bg-indigo-500"
                          initial={{ width: 0 }}
                          whileHover={{ width: '100%' }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div className="glass p-5 rounded-[2rem] border-indigo-500/10 flex items-center justify-center gap-4">
                     <Terminal className="text-indigo-400" size={16} />
                     <p className="text-[10px] text-gray-500 font-mono italic">
                       Transforming <span className="text-white">curiosity</span> into <span className="text-indigo-400">impactful solutions</span>.
                     </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Multi-Step Application */}
              <div className="lg:col-span-7">
                <div className="glass rounded-[4rem] border-white/5 shadow-[0_0_80px_rgba(99,102,241,0.05)] overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                  
                  <div className="p-8 md:p-14 relative z-10">
                    {/* Phase Navigator */}
                    <div className="flex justify-between items-center mb-16">
                      {[1, 2, 3].map(s => (
                        <div key={s} className="flex flex-col items-center gap-3 relative flex-1 last:flex-none">
                          <motion.div 
                            animate={{ 
                              scale: phase === s ? 1.1 : 1,
                              backgroundColor: phase >= s ? 'rgba(99, 102, 241, 1)' : 'rgba(255, 255, 255, 0.03)',
                              borderColor: phase >= s ? 'rgba(129, 140, 248, 0.5)' : 'rgba(255, 255, 255, 0.08)'
                            }}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white border transition-all z-10"
                          >
                            {phase > s ? <CheckCircle size={24} /> : s}
                          </motion.div>
                          {s < 3 && (
                            <div className="absolute left-[calc(50%+1.5rem)] right-[-50%] top-7 h-[1px] bg-white/5 z-0">
                              <motion.div 
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: phase > s ? 1 : 0 }}
                                className="h-full bg-indigo-500 origin-left transition-transform duration-700"
                              />
                            </div>
                          )}
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${phase >= s ? 'text-indigo-400' : 'text-gray-700'}`}>
                            {s === 1 ? 'PERSONNEL' : s === 2 ? 'ACADEMIC' : 'DEPLOY'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                      <AnimatePresence mode="wait">
                        {phase === 1 && (
                          <motion.div 
                            key="p1" 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                          >
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-2">Identity Signature</label>
                              <div className="relative group">
                                <input 
                                  name="name" value={formData.name} onChange={handleChange} placeholder="FULL NAME"
                                  className={`w-full bg-white/[0.01] border rounded-[2rem] p-6 pl-14 outline-none transition-all focus:bg-white/[0.03] font-mono text-sm ${errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                                />
                                <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-2">Registry Number</label>
                              <div className="relative group">
                                <input 
                                  name="regNumber" value={formData.regNumber} onChange={handleChange} placeholder="BL.EN.U4..."
                                  className={`w-full bg-white/[0.01] border rounded-[2rem] p-6 pl-14 outline-none transition-all focus:bg-white/[0.03] font-mono text-sm ${errors.regNumber ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                                />
                                <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-2">Communication Channel</label>
                              <div className="relative group">
                                <input 
                                  name="phone" value={formData.phone} onChange={handleChange} maxLength={10} placeholder="PHONE NUMBER"
                                  className={`w-full bg-white/[0.01] border rounded-[2rem] p-6 pl-14 outline-none transition-all focus:bg-white/[0.03] font-mono text-sm ${errors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                                />
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                              </div>
                            </div>

                            <button type="button" onClick={nextPhase} className="w-full py-6 bg-indigo-600 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3">
                              Continue Calibration <ChevronRight size={18} />
                            </button>
                          </motion.div>
                        )}

                        {phase === 2 && (
                          <motion.div 
                            key="p2" 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                          >
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-2">Academic Node</label>
                              <div className="relative group">
                                <input 
                                  name="branch" value={formData.branch} onChange={handleChange} placeholder="BRANCH / SPECIALIZATION"
                                  className={`w-full bg-white/[0.01] border rounded-[2rem] p-6 pl-14 outline-none transition-all focus:bg-white/[0.03] font-mono text-sm ${errors.branch ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                                />
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-2 block">Iteration Cycle</label>
                              <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, semester: s.toString() }))}
                                    className={`p-5 rounded-2xl border font-mono text-sm transition-all ${
                                      formData.semester === s.toString() 
                                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105 z-10' 
                                      : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                              <button type="button" onClick={prevPhase} className="w-24 py-6 glass border-white/10 rounded-[2rem] flex items-center justify-center hover:bg-white/10 transition-all text-gray-400">
                                <ArrowLeft size={24} />
                              </button>
                              <button type="button" onClick={nextPhase} className="flex-1 py-6 bg-indigo-600 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-indigo-500 transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3">
                                Validate Manifest <ChevronRight size={18} />
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {phase === 3 && (
                          <motion.div 
                            key="p3" 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                          >
                            <div className="space-y-2">
                               <h3 className="text-xl font-bold uppercase tracking-tight">Deployment Vector</h3>
                               <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">Select your operational unit</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {departments.map((dept) => (
                                <button
                                  key={dept.id}
                                  type="button"
                                  onClick={() => selectDepartment(dept.id)}
                                  className={`relative p-6 rounded-[2.5rem] border text-left transition-all group overflow-hidden ${
                                    formData.department === dept.id 
                                    ? 'bg-indigo-600/10 border-indigo-500 shadow-xl scale-[1.02]' 
                                    : 'bg-white/[0.01] border-white/5 hover:border-white/15'
                                  }`}
                                >
                                  <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                    formData.department === dept.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-600 group-hover:text-indigo-400'
                                  }`}>
                                    {dept.icon}
                                  </div>
                                  <p className={`text-xs font-black uppercase tracking-widest transition-colors mb-1 ${formData.department === dept.id ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                    {dept.name}
                                  </p>
                                  <p className="text-[9px] text-gray-700 leading-tight group-hover:text-gray-500 transition-colors line-clamp-2">{dept.desc}</p>
                                </button>
                              ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                              <button type="button" onClick={prevPhase} className="w-24 py-6 glass border-white/10 rounded-[2rem] flex items-center justify-center hover:bg-white/10 transition-all text-gray-400">
                                <ArrowLeft size={24} />
                              </button>
                              <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex-1 py-6 bg-indigo-600 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-[0_20px_50px_rgba(79,70,229,0.4)] flex items-center justify-center gap-4 group"
                              >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Commit Manifest</>}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl glass p-16 rounded-[4rem] text-center border-emerald-500/20 shadow-2xl relative mx-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/30" />
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
                className="w-28 h-28 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto mb-10"
              >
                <ShieldCheck size={64} strokeWidth={1.5} />
              </motion.div>
              <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">Manifest Anchored</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-12 font-light">
                Your credentials have been verified and bridged to the <span className="text-indigo-400 font-bold">NEURØN</span> collective. Prepare for initial contact.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full px-12 py-5 bg-indigo-600 rounded-3xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 group shadow-xl"
              >
                Return to Grid <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JoinClub;
