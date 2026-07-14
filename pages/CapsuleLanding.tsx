import React, { useState, useEffect } from 'react';
// @ts-ignore - Fixing react-router-dom exports false positive
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Clock, Key, Lock, ShieldCheck, Mail, User, BookOpen, 
  Binary, ChevronRight, ChevronLeft, ArrowRight, Database, AlertCircle, RefreshCw
} from 'lucide-react';
import { capsuleService } from '../lib/capsules.ts';
import { commsService } from '../services/comms.ts';
import { CapsuleStatus } from '../lib/types.ts';
import { useToast } from '../context/ToastContext.tsx';

// Configuration for yearly reproducibility
const CURRENT_COHORT_YEAR = 2026;
const GRADUATION_YEAR = CURRENT_COHORT_YEAR + 4; // 2030

const CapsuleLanding: React.FC = () => {
  const m = motion as any;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const codeParam = searchParams.get('code');

  // Core State
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [searchedCapsule, setSearchedCapsule] = useState<any | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    full_name: '',
    enrollment_no: '',
    branch: '',
    email: '',
    q1_answer: '',
    q2_answer: '',
    q3_answer: ''
  });

  // Database Connection Indicator State
  const [isDbFallback, setIsDbFallback] = useState(false);

  // Time remaining countdown for the 2030 sealed release
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Check if capsuleService is operating in fallback/mock mode
    setIsDbFallback(capsuleService.isUsingMock);

    // Dynamic countdown timer targeting July 1st of the Graduation Year
    const targetDate = new Date(`July 1, ${GRADUATION_YEAR} 00:00:00`).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const min = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: min, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle direct lookup via URL parameter ?code=NRNCAP-2026-0001
  useEffect(() => {
    if (codeParam) {
      handleDirectLookup(codeParam);
    }
  }, [codeParam]);

  const handleDirectLookup = async (code: string) => {
    setIsSearching(true);
    try {
      const capsule = await capsuleService.findCapsule(code);
      if (capsule) {
        setSearchedCapsule(capsule);
        setLookupCode(capsule.capsule_code);
        toast.success(`Access granted to capsule sequence ${capsule.capsule_code}.`);
      } else {
        toast.error(`Capsule code ${code} not verified.`);
        setSearchedCapsule(null);
      }
    } catch (err: any) {
      toast.error("Lookup sequence interrupted.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    await handleDirectLookup(lookupCode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.full_name.trim()) return "Full name is required.";
      if (!formData.enrollment_no.trim()) return "Enrollment number is required.";
      if (!formData.branch.trim()) return "Academic branch is required.";
      if (!formData.email.trim()) return "Notification email is required.";
      if (!/\S+@\S+\.\S+/.test(formData.email)) return "Enter a valid email address.";
    } else if (activeStep === 1) {
      if (formData.q1_answer.trim().length < 15) return "Please tell us a bit more about who you want to become (min 15 chars).";
      if (formData.q2_answer.trim().length < 15) return "Please write down your tech predictions for the future (min 15 chars).";
    } else if (activeStep === 2) {
      if (formData.q3_answer.trim().length < 10) return "Please add some words of advice for your future self (min 10 chars).";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const capsule = await capsuleService.submitCapsule({
        full_name: formData.full_name,
        enrollment_no: formData.enrollment_no.toUpperCase(),
        branch: formData.branch,
        email: formData.email.toLowerCase(),
        q1_answer: formData.q1_answer,
        q2_answer: formData.q2_answer,
        q3_answer: formData.q3_answer,
        cohort_year: CURRENT_COHORT_YEAR
      });

      toast.success("Time Capsule successfully sealed.");
      
      // Navigate to the success ticket layout
      navigate('/capsule/success', { state: { capsule } });

    } catch (err: any) {
      toast.error(err.message || "Uplink corrupted. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 min-h-screen pb-24 relative overflow-hidden bg-transparent text-white">
      {/* Background Cyber-Grid Styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* SQL Fallback Banner */}
        {isDbFallback && (
          <m.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 glass border-amber-500/20 bg-amber-500/5 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-300 font-mono leading-relaxed">
              <span className="font-bold text-amber-400">PREVIEW EMULATION ACTIVE:</span> The app is running in client fallback mode with local caching. To persist capsules permanently to your cloud database, run the <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-400">capsules</code> table creation script on your Supabase SQL editor.
            </div>
          </m.div>
        )}

        {/* Dynamic Countdown Header */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold font-mono tracking-widest text-indigo-400 uppercase mb-4">
              <Sparkles size={10} className="animate-pulse" /> NEURØN COHORT SPECIAL
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-400 bg-clip-text text-transparent font-sans mb-6">
              The Time Capsule
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-6">
              Write to your future self. Express your goals, project your technological forecast for the year <span className="text-indigo-400 font-bold">{GRADUATION_YEAR}</span>, and write down private memories. Your entries will be encrypted and safely locked in our digital vault until your graduation date.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">
              <span className="flex items-center gap-1.5"><Lock size={12} className="text-indigo-500" /> AES-256 Encrypted</span>
              <span className="flex items-center gap-1.5"><Key size={12} className="text-indigo-500" /> Digital QR Passport</span>
              <span className="flex items-center gap-1.5"><Database size={12} className="text-indigo-500" /> Supabase Storage</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 relative bg-[#0a0a0a]/80 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 rounded-full group-hover:scale-125 transition-transform duration-1000" />
              <p className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mb-4 font-mono flex items-center gap-2">
                <Clock size={12} className="text-indigo-500 animate-spin-slow" /> HOLOGRAPHIC UNSEALING TIMER
              </p>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                {[
                  { label: 'DAYS', val: timeLeft.days },
                  { label: 'HRS', val: timeLeft.hours },
                  { label: 'MINS', val: timeLeft.minutes },
                  { label: 'SECS', val: timeLeft.seconds }
                ].map((t, idx) => (
                  <div key={idx} className="bg-white/2 border border-white/5 p-2 sm:p-4 rounded-xl sm:rounded-2xl">
                    <span className="text-lg xs:text-xl sm:text-2xl font-black font-mono text-indigo-400 leading-none">
                      {String(t.val).padStart(2, '0')}
                    </span>
                    <p className="text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-wider">{t.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between text-[10px] font-mono text-gray-600">
                <span>SEALED: {CURRENT_COHORT_YEAR}</span>
                <span>RELEASE: JULY {GRADUATION_YEAR}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Workspace (Columns layout) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Module (Form or Look up details) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!searchedCapsule ? (
                // Submit Form Step Engine
                <m.div 
                  key="form-entry"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="glass p-5 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-indigo-500/15 bg-[#080808]/90 shadow-xl relative"
                >
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((step) => (
                        <div 
                          key={step} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            step === activeStep 
                              ? 'w-8 bg-indigo-500' 
                              : step < activeStep 
                                ? 'w-4 bg-indigo-500/40' 
                                : 'w-2 bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      Step {activeStep + 1} of 3
                    </span>
                  </div>

                  <form onSubmit={(e) => e.preventDefault()}>
                    {/* STEP 1: Personal Matrix */}
                    {activeStep === 0 && (
                      <m.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-xl font-bold font-mono tracking-tight mb-2 uppercase text-indigo-400">Personal Matrix</h2>
                          <p className="text-gray-500 text-xs mb-6">Enter your academic identity coordinates accurately.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><User size={16} /></span>
                            <input 
                              type="text" 
                              name="full_name" 
                              placeholder="Full Name" 
                              value={formData.full_name} 
                              onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono"
                            />
                          </div>

                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><Binary size={16} /></span>
                            <input 
                              type="text" 
                              name="enrollment_no" 
                              placeholder="Enrollment ID (e.g., AM.EN.U4CSE23001)" 
                              value={formData.enrollment_no} 
                              onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono uppercase"
                            />
                          </div>

                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><BookOpen size={16} /></span>
                            <input 
                              type="text" 
                              name="branch" 
                              placeholder="Branch / Major Spec" 
                              value={formData.branch} 
                              onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono"
                            />
                          </div>

                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><Mail size={16} /></span>
                            <input 
                              type="email" 
                              name="email" 
                              placeholder="Email Coordinate (for 2030 delivery)" 
                              value={formData.email} 
                              onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono"
                            />
                          </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                          <button 
                            type="button" 
                            onClick={handleNext}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
                          >
                            Proceed to Queries <ChevronRight size={14} />
                          </button>
                        </div>
                      </m.div>
                    )}

                    {/* STEP 2: Visionary Queries */}
                    {activeStep === 1 && (
                      <m.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-xl font-bold font-mono tracking-tight mb-2 uppercase text-indigo-400">Visionary Queries</h2>
                          <p className="text-gray-500 text-xs mb-6">Describe your future self and technological landscape projections.</p>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase font-mono text-gray-400 flex items-center gap-1.5">
                              <span>1. WHO DO YOU WANT TO BECOME BY THE YEAR {GRADUATION_YEAR}?</span>
                            </label>
                            <textarea 
                              name="q1_answer" 
                              rows={3}
                              placeholder="A lead mechanical systems engineer, a pioneering deep-learning researcher, or building your own synthetic startups? Describe your professional mission, technical focus, and life values..." 
                              value={formData.q1_answer} 
                              onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-sans leading-relaxed resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase font-mono text-gray-400 flex items-center gap-1.5">
                              <span>2. BOLDEST TECHNOLOGICAL PREDICTION FOR THE YEAR {GRADUATION_YEAR}?</span>
                            </label>
                            <textarea 
                              name="q2_answer" 
                              rows={3}
                              placeholder="Will consumer biological computers exist? Perfect robotic prostheses? Universal real-time translation? Predict the world state when you graduate..." 
                              value={formData.q2_answer} 
                              onChange={handleInputChange}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-sans leading-relaxed resize-none"
                            />
                          </div>
                        </div>

                        <div className="pt-6 flex flex-col-reverse sm:flex-row justify-between gap-3">
                          <button 
                            type="button" 
                            onClick={handlePrev}
                            className="w-full sm:w-auto glass hover:bg-white/5 text-gray-400 font-bold py-4 px-6 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                          >
                            <ChevronLeft size={14} /> Back
                          </button>
                          <button 
                            type="button" 
                            onClick={handleNext}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
                          >
                            Encrypt Envelope <ChevronRight size={14} />
                          </button>
                        </div>
                      </m.div>
                    )}

                    {/* STEP 3: Cryptographic Reminder */}
                    {activeStep === 2 && (
                      <m.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div>
                          <h2 className="text-xl font-bold font-mono tracking-tight mb-2 uppercase text-indigo-400">Cryptographic Reminder</h2>
                          <p className="text-gray-500 text-xs mb-6">Write down private advice, memories, or warnings. This is never displayed to anyone and stays encrypted until release.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase font-mono text-gray-400 flex items-center gap-1.5">
                            <Lock size={12} className="text-indigo-400" />
                            <span>PRIVATE MEMORY / COMPASS FOR YOUR FUTURE SELF (STAYS ENCRYPTED)</span>
                          </label>
                          <textarea 
                            name="q3_answer" 
                            rows={4}
                            placeholder="Write a message that only you will understand. Mention late-night labs, key breakthroughs, the friendships you cherish, or a reminder to stay focused on why you started..." 
                            value={formData.q3_answer} 
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-sans leading-relaxed resize-none border-dashed border-indigo-500/30"
                          />
                        </div>

                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-3">
                          <ShieldCheck size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                            Upon sealing, your capsule parameters and private reminders (Q3) will be wrapped and sealed securely, bypassing human admin visibility. It will be stored in our cryptographically protected Supabase cluster.
                          </p>
                        </div>

                        <div className="pt-6 flex flex-col-reverse sm:flex-row justify-between gap-3">
                          <button 
                            type="button" 
                            disabled={isSubmitting}
                            onClick={handlePrev}
                            className="w-full sm:w-auto glass hover:bg-white/5 text-gray-400 font-bold py-4 px-6 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                          >
                            <ChevronLeft size={14} /> Back
                          </button>
                          <button 
                            type="button" 
                            disabled={isSubmitting}
                            onClick={handleFormSubmit}
                            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>Sealing Vault <RefreshCw className="animate-spin" size={14} /></>
                            ) : (
                              <>Seal Time Capsule <Send size={14} /></>
                            )}
                          </button>
                        </div>
                      </m.div>
                    )}
                  </form>
                </m.div>
              ) : (
                // Looked up sealed capsule card representation
                <m.div 
                  key="searched-result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass p-8 md:p-12 rounded-[2.5rem] border-indigo-500/20 bg-[#080808]/90 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full -z-10" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5">
                    <div>
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold font-mono tracking-widest text-indigo-400 uppercase mb-2 inline-block">
                        {searchedCapsule.status.toUpperCase()}
                      </span>
                      <h2 className="text-2xl font-bold font-mono text-indigo-400">{searchedCapsule.capsule_code}</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setSearchedCapsule(null);
                        setLookupCode('');
                      }}
                      className="text-xs text-gray-500 hover:text-white font-mono flex items-center gap-1 bg-white/5 px-4 py-2 rounded-xl border border-white/5"
                    >
                      Clear Lookup
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8 text-xs font-mono">
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 text-[9px] uppercase tracking-wider">SEALED IDENTITY</p>
                        <p className="font-bold text-gray-200 text-sm">{searchedCapsule.full_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-[9px] uppercase tracking-wider">ENROLLMENT ID</p>
                        <p className="text-indigo-300">{searchedCapsule.enrollment_no}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 text-[9px] uppercase tracking-wider">ACADEMIC BRANCH</p>
                        <p className="text-gray-300">{searchedCapsule.branch}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-[9px] uppercase tracking-wider">RELEASE YEAR</p>
                        <p className="text-gray-300">July {searchedCapsule.cohort_year + 4}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sealed Vault Representation */}
                  <div className="p-8 bg-black/60 border border-white/5 rounded-3xl text-center space-y-4 relative">
                    <Lock className="text-indigo-500 mx-auto animate-pulse" size={36} />
                    <h3 className="font-mono text-sm font-bold text-indigo-400">CAPSULE SECURELY SEALED</h3>
                    <p className="text-[11px] text-gray-500 font-mono leading-relaxed max-w-md mx-auto">
                      Your capsule is registered and securely sealed in the NEURØN digital archive vault. No further updates are permitted. It will remain locked and automatically delivered to <span className="text-indigo-400 font-bold">{searchedCapsule.email}</span> upon your graduation in July <span className="text-indigo-400 font-bold">{searchedCapsule.cohort_year + 4}</span>.
                    </p>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right sidebar: Lookup Capsule Portal */}
          <div className="lg:col-span-4">
            <div className="glass p-6 rounded-3xl border-white/5 bg-[#0a0a0a]/50 relative">
              <h3 className="text-[10px] font-bold uppercase font-mono tracking-wider mb-4 text-gray-400 flex items-center gap-1.5">
                <Clock size={12} className="text-indigo-500" />
                <span>RETRIEVAL MATRIX</span>
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-mono">
                Already sealed a capsule? Enter your custom code (e.g. <span className="text-indigo-400 font-bold">NRNCAP-2026-0001</span>) below to load your capsule's current security parameters and countdown.
              </p>

              <form onSubmit={handleLookupSubmit} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="NRNCAP-2026-XXXX" 
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-center text-xs font-mono uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold font-mono tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  {isSearching ? 'Synchronizing...' : 'Load Capsule Status'}
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CapsuleLanding;
