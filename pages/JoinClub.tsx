
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Hash, MapPin, Calendar, Phone, Layers, 
  Send, Loader2, Cpu, CheckCircle, Sparkles,
  Code, Megaphone, Microscope, Palette, 
  Handshake, LayoutPanelLeft, ChevronRight,
  ArrowLeft, Terminal, ShieldCheck
} from 'lucide-react';
import { z } from 'zod';
import { supabase } from '../lib/storage.ts';
import { useToast } from '../context/ToastContext.tsx';

const applicationSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  regNumber: z.string().min(5, "Invalid Registration Number"),
  branch: z.string().min(2, "Branch required"),
  semester: z.string().min(1, "Semester required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  department: z.string().min(1, "Select a department"),
});

const departments = [
  { id: 'Technical', name: "Technical", icon: <Code size={20} />, desc: "AI/ML engineering & dev" },
  { id: 'PR & Marketing', name: "PR & Marketing", icon: <Megaphone size={20} />, desc: "Brand & outreach" },
  { id: 'Research & Development', name: "R & D", icon: <Microscope size={20} />, desc: "Papers & Deep Learning" },
  { id: 'Design', name: "Design", icon: <Palette size={20} />, desc: "UI/UX & creative assets" },
  { id: 'Logistics & Event Management', name: "Logistics", icon: <LayoutPanelLeft size={20} />, desc: "Planning & operations" },
  { id: 'Guest Relations', name: "Relations", icon: <Handshake size={20} />, desc: "Liaison & networking" }
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
      if (!formData.name) phaseErrors.name = "Full name required";
      if (!formData.regNumber) phaseErrors.regNumber = "Registration ID required";
      if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) phaseErrors.phone = "Valid 10-digit number required";
    } else if (phase === 2) {
      if (!formData.branch) phaseErrors.branch = "Branch information required";
      if (!formData.semester) phaseErrors.semester = "Select your current semester";
    }

    if (Object.keys(phaseErrors).length > 0) {
      setErrors(phaseErrors);
      toast.error("Complete the manifest entries correctly.");
      return false;
    }
    return true;
  };

  const nextPhase = () => {
    if (validatePhase()) {
      setPhase(prev => Math.min(prev + 1, 3));
    }
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
      setErrors({ department: "Selection required" });
      toast.error("Choose an operational vector.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!supabase) throw new Error("Neural Grid Offline");

      const { error } = await supabase
        .from('club_applications')
        .insert([{
          name: formData.name,
          reg_number: formData.regNumber,
          branch: formData.branch,
          semester: formData.semester,
          phone: formData.phone,
          department: formData.department
        }]);

      if (error) throw error;
      setIsSuccess(true);
      toast.success("Collective uplink success.");
    } catch (err: any) {
      toast.error(`Sync Failure: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 flex flex-col items-center">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl"
          >
            {/* Header Content */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
              >
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Collective Recruitment Portal</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                Initialize <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Uplink</span>
              </h1>
              <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Manifest Synchronization Sequence Active</p>
            </div>

            {/* Manifest Card */}
            <div className="glass rounded-[3.5rem] border-white/5 shadow-2xl overflow-hidden relative group">
              {/* Animated Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 z-10 opacity-50" />
              
              <div className="p-8 md:p-14">
                {/* Phase Tracker */}
                <div className="flex justify-between items-center mb-12 px-4">
                  {[1, 2, 3].map(s => (
                    <div key={s} className="flex flex-col items-center gap-3 relative flex-1 last:flex-none">
                      <motion.div 
                        animate={{ 
                          scale: phase === s ? 1.1 : 1,
                          backgroundColor: phase >= s ? 'rgba(99, 102, 241, 1)' : 'rgba(255, 255, 255, 0.05)',
                          borderColor: phase >= s ? '#818cf8' : 'rgba(255, 255, 255, 0.1)'
                        }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white border transition-all z-10"
                      >
                        {phase > s ? <CheckCircle size={20} /> : s}
                      </motion.div>
                      {s < 3 && (
                        <div className="absolute left-[calc(50%+1.5rem)] right-[-50%] top-6 h-[1px] bg-white/5 z-0 overflow-hidden">
                          <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: phase > s ? 1 : 0 }}
                            className="h-full bg-indigo-500 origin-left transition-transform duration-500"
                          />
                        </div>
                      )}
                      <span className={`text-[9px] font-bold uppercase tracking-[0.2em] font-mono ${phase >= s ? 'text-indigo-400' : 'text-gray-600'}`}>
                        {s === 1 ? 'PERSONNEL' : s === 2 ? 'ACADEMIC' : 'OPERATIONAL'}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <AnimatePresence mode="wait">
                    {phase === 1 && (
                      <motion.div 
                        key="phase1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-3 mb-4 opacity-50">
                          <Terminal size={18} className="text-indigo-400" />
                          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">Phase 01: Core Identification</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Identity Signature</label>
                          <div className="relative">
                            <input 
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="FULL NAME"
                              className={`w-full bg-white/[0.03] border rounded-2xl p-5 pl-14 outline-none transition-all focus:bg-white/[0.08] ${errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                            />
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                          </div>
                          {errors.name && <p className="text-[9px] text-red-500 font-mono uppercase pl-2">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Registration ID</label>
                          <div className="relative">
                            <input 
                              name="regNumber"
                              value={formData.regNumber}
                              onChange={handleChange}
                              placeholder="BL.EN.U4..."
                              className={`w-full bg-white/[0.03] border rounded-2xl p-5 pl-14 outline-none transition-all focus:bg-white/[0.08] ${errors.regNumber ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                            />
                            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                          </div>
                          {errors.regNumber && <p className="text-[9px] text-red-500 font-mono uppercase pl-2">{errors.regNumber}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Communication Channel</label>
                          <div className="relative">
                            <input 
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              maxLength={10}
                              placeholder="PHONE NUMBER"
                              className={`w-full bg-white/[0.03] border rounded-2xl p-5 pl-14 outline-none transition-all focus:bg-white/[0.08] ${errors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                            />
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                          </div>
                          {errors.phone && <p className="text-[9px] text-red-500 font-mono uppercase pl-2">{errors.phone}</p>}
                        </div>

                        <button 
                          type="button" 
                          onClick={nextPhase}
                          className="w-full py-5 bg-indigo-600 rounded-[2rem] font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Synchronize Personal Data <ChevronRight size={18} />
                        </button>
                      </motion.div>
                    )}

                    {phase === 2 && (
                      <motion.div 
                        key="phase2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-3 mb-4 opacity-50">
                          <Cpu size={18} className="text-indigo-400" />
                          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">Phase 02: Academic Mapping</h3>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Specialization</label>
                          <div className="relative">
                            <input 
                              name="branch"
                              value={formData.branch}
                              onChange={handleChange}
                              placeholder="BRANCH / DEPT"
                              className={`w-full bg-white/[0.03] border rounded-2xl p-5 pl-14 outline-none transition-all focus:bg-white/[0.08] ${errors.branch ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                            />
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                          </div>
                          {errors.branch && <p className="text-[9px] text-red-500 font-mono uppercase pl-2">{errors.branch}</p>}
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2 block">Manifest Semester</label>
                          <div className="grid grid-cols-4 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, semester: s.toString() }))}
                                className={`p-4 rounded-2xl border font-bold transition-all ${
                                  formData.semester === s.toString() 
                                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105' 
                                  : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          {errors.semester && <p className="text-[9px] text-red-500 font-mono uppercase pl-2">{errors.semester}</p>}
                        </div>

                        <div className="flex gap-4 pt-6">
                          <button 
                            type="button" 
                            onClick={prevPhase}
                            className="w-20 py-5 glass border-white/10 rounded-3xl flex items-center justify-center hover:bg-white/10 transition-all"
                          >
                            <ArrowLeft size={20} />
                          </button>
                          <button 
                            type="button" 
                            onClick={nextPhase}
                            className="flex-1 py-5 bg-indigo-600 rounded-[2rem] font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-500 transition-all"
                          >
                            Proceed to Role <ChevronRight size={18} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {phase === 3 && (
                      <motion.div 
                        key="phase3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-3 mb-4 opacity-50">
                          <Layers size={18} className="text-indigo-400" />
                          <h3 className="text-xs font-bold uppercase tracking-widest font-mono">Phase 03: Operational Vector</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                          {departments.map((dept) => (
                            <button
                              key={dept.id}
                              type="button"
                              onClick={() => selectDepartment(dept.id)}
                              className={`relative p-5 rounded-3xl border text-left transition-all group flex flex-col items-center text-center ${
                                formData.department === dept.id 
                                ? 'bg-indigo-600/10 border-indigo-500 shadow-xl scale-[1.02]' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className={`mb-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                formData.department === dept.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-indigo-400'
                              }`}>
                                {dept.icon}
                              </div>
                              <p className={`text-[11px] font-bold leading-tight transition-colors ${formData.department === dept.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                {dept.name}
                              </p>
                              {formData.department === dept.id && (
                                <motion.div layoutId="active" className="absolute top-2 right-2 text-indigo-400">
                                  <CheckCircle size={14} />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                        {errors.department && <p className="text-[9px] text-red-500 font-mono uppercase pl-2 text-center">{errors.department}</p>}

                        <div className="flex gap-4 pt-6">
                          <button 
                            type="button" 
                            onClick={prevPhase}
                            className="w-20 py-5 glass border-white/10 rounded-3xl flex items-center justify-center hover:bg-white/10 transition-all"
                          >
                            <ArrowLeft size={20} />
                          </button>
                          <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-5 bg-indigo-600 rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:bg-indigo-500 transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Deploy Manifest</>}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-gray-700 font-mono uppercase tracking-[0.3em]">
              Encrypted Tunnel SEC_CHANNEL_09 ACTIVE
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl glass p-16 rounded-[4rem] text-center border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.1)]"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto mb-10 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
            >
              <ShieldCheck size={56} />
            </motion.div>
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">Manifest Anchored</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-12 font-light">
              Your identity sequence is now anchored in the <span className="text-indigo-400 font-bold">NEURØN</span> grid. Prepare for the induction phase.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-12 py-5 bg-indigo-600 rounded-[2rem] font-bold hover:bg-indigo-500 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
            >
              Return to Grid <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JoinClub;
