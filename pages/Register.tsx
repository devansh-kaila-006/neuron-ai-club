
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import { 
  CheckCircle, CreditCard, Loader2, Plus, Trash2, Cpu, ArrowRight, 
  Printer, Mail, RefreshCw, AlertTriangle, ShieldCheck, Search, 
  Database, Save, X, Send, Phone, RotateCcw, FileDown,
  Terminal, User, Hash, Zap, Fingerprint, ShieldAlert, ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { z } from 'zod';
import { storage } from '../lib/storage.ts';
import { TeamMember, Team, PaymentStatus } from '../lib/types.ts';
import { paymentService } from '../services/payments.ts';
import { useToast } from '../context/ToastContext.tsx';
import { getEnv } from '../lib/env.ts';
import { executeRecaptcha, loadRecaptcha } from '../lib/recaptcha.ts';

const memberSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^[0-9]{10}$/, "10-digit number required"),
  role: z.string().min(1, "Role required"),
});

const teamSchema = z.object({
  teamName: z.string().min(3, "Min 3 chars").max(20, "Too long"),
  members: z.array(memberSchema).min(2, "Min 2 members").max(4, "Max 4 members"),
});

const Register: React.FC = () => {
  const m = motion as any;
  const toast = useToast();
  const [step, setStep] = useState(1); 
  const [teamName, setTeamName] = useState('');
  const [nameAvailability, setNameAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [members, setMembers] = useState<TeamMember[]>([
    { name: '', email: '', phone: '', role: 'Lead' },
    { name: '', email: '', phone: '', role: 'Developer' },
  ]);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Pre-load reCAPTCHA
  useEffect(() => {
    loadRecaptcha().catch(err => console.error("Neural Security Warning:", err));
  }, []);

  useEffect(() => {
    if (teamName.length < 3 || isUpdateMode) return setNameAvailability('idle');
    const timer = setTimeout(async () => {
      setNameAvailability('checking');
      const exists = await storage.findTeamByName(teamName);
      setNameAvailability(exists ? 'taken' : 'available');
    }, 500);
    return () => clearTimeout(timer);
  }, [teamName, isUpdateMode]);

  const addMember = () => { if (members.length < 4) setMembers([...members, { name: '', email: '', phone: '', role: 'Developer' }]); };
  const removeMember = (index: number) => { if (members.length > 2) setMembers(members.filter((_, i) => i !== index)); };
  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
    if (errors.members?.[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors.members[index][field];
      setErrors(newErrors);
    }
  };

  const handleProceedToPayment = async () => {
    const result = teamSchema.safeParse({ teamName, members });
    if (!result.success) {
      const formattedErrors: any = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'teamName') formattedErrors.teamName = issue.message;
        if (issue.path[0] === 'members') {
          const idx = issue.path[1] as number;
          const field = issue.path[2] as string;
          if (!formattedErrors.members) formattedErrors.members = [];
          if (!formattedErrors.members[idx]) formattedErrors.members[idx] = {};
          formattedErrors.members[idx][field] = issue.message;
        }
      });
      setErrors(formattedErrors);
      toast.error("Review required fields.");
      return;
    }
    
    if (!isUpdateMode && nameAvailability === 'taken') {
      return setErrors({ teamName: "This squad name is already deployed." });
    }
    
    setErrors({});
    
    if (isUpdateMode && registeredTeam?.paymentstatus === PaymentStatus.PAID) {
      handleDirectUpdate();
    } else {
      setStep(2);
    }
  };

  const handleDirectUpdate = async () => {
    setIsSubmitting(true);
    try {
      const updatedTeam: Team = {
        ...registeredTeam!,
        teamname: teamName,
        members,
        leademail: members[0].email
      };
      await storage.saveTeam(updatedTeam);
      setRegisteredTeam(updatedTeam);
      setStep(3);
      toast.success("Manifest synchronized.");
    } catch (err: any) {
      toast.error(`Sync failure: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    try {
      // Execute reCAPTCHA secure token generation
      let captchaToken = '';
      try {
        captchaToken = await executeRecaptcha('registration');
      } catch (err) {
        console.warn("Security Module: reCAPTCHA failed, proceeding with manual sync.");
      }

      await paymentService.checkout({
        teamName,
        members,
        email: members[0].email,
        phone: members[0].phone,
        onSuccess: async (response: any) => {
          toast.info("Synchronizing with Neural Grid...");
          try {
            const verifyRes = await paymentService.verifyPayment(
              response.razorpay_order_id || null, 
              response.razorpay_payment_id, 
              response.razorpay_signature || null, 
              { teamname: teamName, members, leademail: members[0].email },
              captchaToken
            );
            
            if (verifyRes.success && verifyRes.data) {
              finishRegistration(verifyRes.data);
            } else {
              throw new Error("Verification failed.");
            }
          } catch (err: any) {
            console.warn("Manual Neural Grid Re-sync initiated...");
            const existing = await storage.getTeams();
            const found = existing.find(t => t.razorpaypaymentid === response.razorpay_payment_id);
            if (found) {
              finishRegistration(found);
            } else {
              toast.error(`Verification Sequence Interrupted. Payment ID: ${response.razorpay_payment_id} will be synchronized.`);
            }
          }
        }
      });
    } catch (err: any) {
      toast.error(`Checkout Error: ${err.message}`);
    } finally { setIsSubmitting(false); }
  };

  const finishRegistration = async (team: Team) => {
    setRegisteredTeam(team);
    setStep(3);
    sessionStorage.removeItem('neuron_draft_v4');
    toast.success("Neural Manifest Anchored.");
  };

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 bg-transparent relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[160px] rounded-full opacity-50" />

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center mb-20 no-print">
          <div className="relative flex items-center justify-between w-full max-w-lg">
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-white/5 z-0" />
             <m.div 
               initial={{ width: 0 }}
               animate={{ width: `${((step - 1) / 2) * 100}%` }}
               className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)] z-0" 
             />

             {[1, 2, 3].map(s => (
               <div key={s} className="relative flex flex-col items-center gap-4 z-10">
                 <m.div 
                    animate={{ 
                      scale: step === s ? 1.2 : 1,
                      backgroundColor: step >= s ? 'rgba(79, 70, 229, 1)' : 'rgba(5, 5, 5, 1)',
                      borderColor: step >= s ? 'rgba(129, 140, 248, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-mono font-black text-sm transition-all duration-500 ${step >= s ? 'text-white' : 'text-gray-700'}`}
                 >
                   {step > s ? <CheckCircle size={20} /> : s}
                 </m.div>
                 <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.3em] ${step >= s ? 'text-indigo-400' : 'text-gray-700'}`}>
                   {s === 1 ? 'REGISTRY' : s === 2 ? 'ESCROW' : 'DEPLOYED'}
                 </span>
               </div>
             ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <m.div 
              key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-12"
            >
              <div className="text-center md:text-left">
                 <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
                  >
                    <Terminal size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Mission Initialization Sequence</span>
                  </m.div>
                  
                  <div className="flex flex-col">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] text-white flex flex-col select-none uppercase">
                      <span className="block">{isUpdateMode ? 'MODIFY' : 'SQUAD'}</span>
                      <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic">
                        MANIFEST
                      </span>
                    </h1>
                  </div>

                  <p className="text-gray-500 text-lg md:text-xl max-w-2xl font-light leading-relaxed pt-6 md:pt-10">
                    Provide the operational identity and personnel details for your squad. High-integrity data is required for neural grid anchoring.
                  </p>
              </div>

              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                  <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                      <Zap size={140} strokeWidth={0.5} />
                    </div>
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 block ml-2">Squad Identity Vector</label>
                    <div className="relative">
                      <input 
                        value={teamName} 
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="Ex: CYBER_SYNTH"
                        className={`w-full bg-white/[0.02] border rounded-[2.5rem] p-8 pl-16 outline-none transition-all text-2xl font-black font-tech uppercase tracking-tighter ${errors.teamName ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500 focus:bg-white/[0.04]'}`}
                      />
                      <Hash className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-700" size={24} />
                      {nameAvailability === 'checking' && <Loader2 className="absolute right-7 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={20} />}
                      {nameAvailability === 'available' && <CheckCircle className="absolute right-7 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
                      {nameAvailability === 'taken' && <AlertTriangle className="absolute right-7 top-1/2 -translate-y-1/2 text-red-500" size={20} />}
                    </div>
                    {errors.teamName && <p className="text-[10px] text-red-500 font-mono pl-4 uppercase tracking-widest">{errors.teamName}</p>}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 px-4">
                      <Fingerprint className="text-indigo-500" size={24} /> Personnel Manifest
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {members.map((m_member, i) => (
                        <m.div 
                          key={i} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass p-8 rounded-[3rem] border-white/5 space-y-6 relative group/member"
                        >
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Operator 0{i+1} — {m_member.role}</span>
                             {i > 1 && (
                               <button onClick={() => removeMember(i)} className="p-2 glass rounded-xl text-gray-600 hover:text-red-500 transition-colors">
                                 <Trash2 size={14} />
                               </button>
                             )}
                          </div>
                          
                          <div className="space-y-4">
                            <div className="relative group">
                              <input 
                                placeholder="Name" value={m_member.name} onChange={e => updateMember(i, 'name', e.target.value)}
                                className={`w-full bg-white/[0.03] border rounded-2xl p-4 pl-12 text-xs outline-none transition-all ${errors.members?.[i]?.name ? 'border-red-500/50' : 'border-white/5 focus:border-indigo-500'}`}
                              />
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500" size={14} />
                            </div>
                            <div className="relative group">
                              <input 
                                placeholder="Email" value={m_member.email} onChange={e => updateMember(i, 'email', e.target.value)}
                                className={`w-full bg-white/[0.03] border rounded-2xl p-4 pl-12 text-xs outline-none transition-all ${errors.members?.[i]?.email ? 'border-red-500/50' : 'border-white/5 focus:border-indigo-500'}`}
                              />
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500" size={14} />
                            </div>
                            <div className="relative group">
                              <input 
                                placeholder="Phone" value={m_member.phone} maxLength={10} onChange={e => updateMember(i, 'phone', e.target.value.replace(/\D/g, ''))}
                                className={`w-full bg-white/[0.03] border rounded-2xl p-4 pl-12 text-xs outline-none transition-all ${errors.members?.[i]?.phone ? 'border-red-500/50' : 'border-white/5 focus:border-indigo-500'}`}
                              />
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500" size={14} />
                            </div>
                          </div>
                        </m.div>
                      ))}
                    </div>

                    {members.length < 4 && (
                      <button onClick={addMember} className="w-full py-6 glass border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all group">
                         <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> Append Operator Sequence
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-8 h-fit sticky top-32">
                     <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                           <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase tracking-tight text-white">Registry Hub</h4>
                          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest italic">Authorization Required</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
                           <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">Base Fee</p>
                           <div className="flex justify-between items-end">
                              <span className="text-3xl font-black text-white font-tech">₹1.00</span>
                              <span className="text-[9px] font-mono text-indigo-500/60 uppercase tracking-widest mb-1">Per Squad</span>
                           </div>
                        </div>
                     </div>

                     <button 
                       onClick={handleProceedToPayment} 
                       className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-xs flex items-center justify-center gap-4 shadow-2xl group transition-all duration-500 active:scale-95 ${
                         isUpdateMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-indigo-600 hover:bg-indigo-500'
                       }`}
                     >
                        {isUpdateMode ? <><Save size={20}/> Sync Change</> : <><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /> Start Sync</>}
                     </button>
                  </div>
                </div>
              </div>
            </m.div>
          )}

          {step === 2 && (
            <m.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto space-y-10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-500 mx-auto border border-indigo-500/20">
                   <CreditCard size={32} />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight text-white">Sync Escrow</h2>
                <p className="text-gray-500 font-light text-sm">Escrow link established. Finalize registry payment to anchor your manifest in the neural grid.</p>
              </div>

              <div className="glass p-12 rounded-[4rem] border-indigo-500/20 shadow-2xl space-y-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                
                <div className="text-center space-y-2">
                   <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.5em]">Registry Total</p>
                   <p className="text-7xl font-black text-white font-tech tracking-tighter italic">₹1</p>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={isSubmitting} 
                  className="w-full py-8 bg-indigo-600 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-xs flex items-center justify-center gap-4 hover:bg-indigo-500 shadow-2xl transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <>Initiate Payment <Zap size={18}/></>}
                </button>
              </div>
            </m.div>
          )}

          {step === 3 && (
            <m.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center space-y-12">
               <div className="space-y-4">
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, delay: 0.2 }}
                    className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto border border-green-500/20 mb-8"
                  >
                    <CheckCircle size={48} strokeWidth={1.5} />
                  </m.div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white uppercase italic">
                    DEPLOYED
                  </h1>
               </div>

               <div className="glass p-12 md:p-20 rounded-[4rem] border-white/5 shadow-2xl manifest-card relative bg-[#080808] overflow-hidden">
                  <div className="relative z-10 space-y-12">
                     <div className="flex flex-col items-center gap-6">
                        <div className="bg-white p-10 rounded-[3rem] shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10 group hover:scale-105 transition-transform duration-700">
                           <QRCodeSVG 
                             value={registeredTeam?.teamid || ''} 
                             size={200} 
                             level="H" 
                             includeMargin={false} 
                             fgColor="#000000" 
                             bgColor="#ffffff" 
                           />
                           <div className="mt-8 pt-8 border-t border-gray-100">
                              <p className="text-3xl font-black font-mono tracking-[0.5em] text-black italic">{registeredTeam?.teamid}</p>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 text-left border-t border-white/5 pt-12">
                        <div className="space-y-2">
                           <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Squad_Name</p>
                           <p className="text-xl font-black text-white uppercase italic font-tech tracking-tight">{registeredTeam?.teamname}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Registry_Date</p>
                           <p className="text-xl font-black text-white font-tech italic">{new Date(registeredTeam?.registeredat || Date.now()).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className="pt-10 no-print flex flex-col sm:flex-row justify-center gap-6">
                        <button onClick={() => window.location.href = '/'} className="px-12 py-5 glass border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all">Return Hub</button>
                        <button 
                          onClick={() => window.print()} 
                          className="px-12 py-5 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl"
                        >
                          <FileDown size={18} /> Download Manifest
                        </button>
                     </div>
                  </div>
               </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
