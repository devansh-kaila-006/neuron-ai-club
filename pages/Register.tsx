
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, CreditCard, Loader2, Plus, Trash2, Cpu, ArrowRight, Printer, Mail, RefreshCw, AlertTriangle, ShieldCheck, Search, Database, Save, X, Send, Phone, RotateCcw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { z } from 'zod';
import { storage } from '../lib/storage.ts';
import { TeamMember, Team, PaymentStatus } from '../lib/types.ts';
import { paymentService } from '../services/payments.ts';
import { commsService } from '../services/comms.ts';
import { useToast } from '../context/ToastContext.tsx';

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
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [lookupID, setLookupID] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

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

  const handleLookup = async () => {
    if (!lookupID.startsWith('TALOS-')) {
      setLookupError("Invalid ID. Format: TALOS-XXXXXX");
      return;
    }
    setIsLookingUp(true);
    setLookupError(null);
    try {
      const team = await storage.findTeamByTALOSID(lookupID);
      if (team) {
        setRegisteredTeam(team);
        setTeamName(team.teamname);
        setMembers(team.members);
        setIsUpdateMode(true);
        setErrors({});
        setLookupID('');
        toast.success("Manifest retrieved.");
      } else {
        setLookupError("Sequence not found.");
      }
    } catch (err) {
      setLookupError("Grid failure.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const cancelUpdate = () => {
    setIsUpdateMode(false);
    setRegisteredTeam(null);
    setTeamName('');
    setMembers([{ name: '', email: '', phone: '', role: 'Lead' }, { name: '', email: '', phone: '', role: 'Developer' }]);
  };

  const handleProceedToPayment = () => {
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
      await paymentService.checkout({
        teamName,
        members,
        email: members[0].email,
        phone: members[0].phone,
        onSuccess: async (response: any) => {
          toast.info("Synchronizing with Neural Grid...");
          try {
            const verifyRes = await paymentService.verifyPayment(
              response.razorpay_order_id, 
              response.razorpay_payment_id, 
              response.razorpay_signature, 
              { teamname: teamName, members, leademail: members[0].email }
            );
            
            if (verifyRes.success && verifyRes.data) {
              finishRegistration(verifyRes.data);
            } else {
              throw new Error("Verification failed.");
            }
          } catch (err: any) {
            console.warn("Retrying direct lookup via PaymentID...");
            // Final fallback: Check if the webhook already handled it
            const existing = await storage.getTeams();
            const found = existing.find(t => t.razorpaypaymentid === response.razorpay_payment_id);
            if (found) {
              finishRegistration(found);
            } else {
              toast.error(`Neural Grid Sync Error: ${err.message}. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
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
    
    setEmailStatus('sending');
    try { 
      await commsService.sendManifestEmail(team); 
      setEmailStatus('sent'); 
    } catch (err) { 
      setEmailStatus('failed');
    }
  };

  return (
    <div className="pt-24 min-h-screen px-6 pb-20 relative bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 max-w-[280px] mx-auto relative no-print">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 -z-0" />
          {[1, 2, 3].map(s => (
            <div key={s} className="relative flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-700 border-2 ${
                step >= s ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'glass border-white/10 text-gray-600'
              }`}>
                {step > s ? <CheckCircle size={18} /> : s}
              </div>
              <span className="text-[10px] mt-2 uppercase tracking-tighter font-mono text-gray-500 opacity-60">
                {s === 1 ? 'Registry' : s === 2 ? 'Escrow' : 'Deployed'}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            /* @ts-ignore - Fixing framer-motion type mismatch */
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
              {!isUpdateMode && (
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Database size={18}/></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Edit Manifest</p>
                    </div>
                    <div className="flex-1 w-full relative">
                      <input 
                        value={lookupID}
                        onChange={e => setLookupID(e.target.value.toUpperCase())}
                        placeholder="TALOS-XXXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-mono outline-none focus:border-indigo-500 transition-all"
                      />
                      {lookupError && <p className="absolute -bottom-5 left-0 text-[8px] text-red-500 font-mono uppercase">{lookupError}</p>}
                    </div>
                    <button 
                      onClick={handleLookup}
                      disabled={isLookingUp}
                      className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2"
                    >
                      {isLookingUp ? <Loader2 size={12} className="animate-spin"/> : <><Search size={12}/> Verify</>}
                    </button>
                  </div>
                </div>
              )}

              <div className="max-w-3xl mx-auto space-y-6">
                <div className="glass p-8 md:p-12 rounded-3xl border-indigo-500/10 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-3">
                      <Cpu className="text-indigo-400" size={28} />
                      <h2 className="text-2xl font-bold tracking-tight">
                        {isUpdateMode ? 'Modify Manifest' : 'Neural Registry'}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                      {isUpdateMode && (
                        <button onClick={cancelUpdate} className="p-2 glass rounded-lg text-gray-500 hover:text-white">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 block">Squad Identity</label>
                    <div className="relative">
                      <input 
                        value={teamName} 
                        onChange={e => setTeamName(e.target.value)}
                        className={`w-full bg-white/5 border rounded-2xl p-5 outline-none transition-all text-lg font-medium ${errors.teamName ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                        placeholder="Ex: CyberDynasty"
                      />
                      {errors.teamName && <p className="text-[10px] text-red-500 mt-2 font-mono uppercase">{errors.teamName}</p>}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Operator Access (Min 2, Max 4)</label>
                    {members.map((m, i) => (
                      <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest">Member 0{i+1} — {m.role}</span>
                          {i > 1 && <button onClick={() => removeMember(i)} className="text-gray-600 hover:text-red-500"><Trash2 size={14} /></button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <input 
                              placeholder="Name" 
                              value={m.name} 
                              onChange={e => updateMember(i, 'name', e.target.value)} 
                              className={`w-full bg-white/[0.05] border rounded-xl p-3 text-sm outline-none transition-all ${errors.members?.[i]?.name ? 'border-red-500/50' : 'border-white/5 focus:border-indigo-500'}`} 
                            />
                            {errors.members?.[i]?.name && <p className="text-[9px] text-red-500 font-mono pl-1 uppercase">{errors.members[i].name}</p>}
                          </div>
                          <div className="space-y-1">
                            <input 
                              placeholder="Email" 
                              value={m.email} 
                              onChange={e => updateMember(i, 'email', e.target.value)} 
                              className={`w-full bg-white/[0.05] border rounded-xl p-3 text-sm outline-none transition-all ${errors.members?.[i]?.email ? 'border-red-500/50' : 'border-white/5 focus:border-indigo-500'}`} 
                            />
                            {errors.members?.[i]?.email && <p className="text-[9px] text-red-500 font-mono pl-1 uppercase">{errors.members[i].email}</p>}
                          </div>
                          <div className="space-y-1">
                            <input 
                              placeholder="Phone" 
                              value={m.phone} 
                              maxLength={10} 
                              onChange={e => updateMember(i, 'phone', e.target.value.replace(/\D/g, ''))} 
                              className={`w-full bg-white/[0.05] border rounded-xl p-3 text-sm outline-none transition-all ${errors.members?.[i]?.phone ? 'border-red-500/50' : 'border-white/5 focus:border-indigo-500'}`} 
                            />
                            {errors.members?.[i]?.phone && <p className="text-[9px] text-red-500 font-mono pl-1 uppercase">{errors.members[i].phone}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {members.length < 4 && (
                      <button onClick={addMember} className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-400 hover:border-indigo-500/50 flex items-center justify-center gap-2">
                        <Plus size={14} /> Add Member
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={handleProceedToPayment} 
                    className={`w-full mt-12 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl group ${
                      isUpdateMode ? 'bg-purple-600' : 'bg-indigo-600'
                    }`}
                  >
                    {isUpdateMode ? <Save size={20}/> : <><ArrowRight size={20}/> Proceed to Escrow</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            /* @ts-ignore - Fixing framer-motion type mismatch */
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-12 rounded-[2.5rem] max-w-md mx-auto border-indigo-500/20 shadow-2xl">
              <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-bold">Escrow Detail</h2><CreditCard className="text-indigo-400" size={28} /></div>
              <div className="bg-white/5 rounded-3xl p-8 mb-10 border border-white/5 text-center">
                <p className="text-5xl font-bold text-white">₹1</p>
              </div>
              <button onClick={handlePayment} disabled={isSubmitting} className="w-full py-5 bg-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Initiate Checkout"}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            /* @ts-ignore - Fixing framer-motion type mismatch */
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-2xl mx-auto">
              <div className="glass p-16 rounded-[3.5rem] border-green-500/20 shadow-2xl manifest-card relative">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-10"><CheckCircle size={48} /></div>
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent uppercase">Deployed</h2>
                <p className="text-gray-400 text-sm mb-6">Squad {registeredTeam?.teamname} sync complete.</p>
                
                <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 mb-10 block">
                  <QRCodeSVG value={registeredTeam?.teamid || ''} size={180} level="H" includeMargin={true} fgColor="#ffffff" bgColor="transparent" />
                  <p className="text-2xl font-bold font-mono tracking-[0.3em] mt-6 text-indigo-400">{registeredTeam?.teamid}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 no-print">
                  <button onClick={() => window.location.href = '/'} className="px-10 py-4 glass rounded-2xl text-sm font-bold">Home Hub</button>
                  <button onClick={() => window.print()} className="px-10 py-4 bg-indigo-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"><Printer size={18} /> Print Manifest</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
