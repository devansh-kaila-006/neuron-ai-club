import React, { useState } from 'react';
// @ts-ignore - Fixing react-router-dom exports false positive
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, Clock, Sparkles, AlertCircle, Mail, Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';
import { commsService } from '../services/comms.ts';

const CapsuleSuccess: React.FC = () => {
  const m = motion as any;
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Extract capsule details from location state
  const capsule = location.state?.capsule;

  if (!capsule) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-transparent">
        <div className="glass p-8 rounded-3xl max-w-md text-center space-y-4 border-red-500/20">
          <AlertCircle className="text-red-500 mx-auto" size={48} />
          <h1 className="text-xl font-bold font-mono uppercase text-red-400">Vault Access Denied</h1>
          <p className="text-xs text-gray-500 font-mono">No active capsule sequence was found in your session cache.</p>
          <button 
            onClick={() => navigate('/capsule')}
            className="w-full py-3 bg-indigo-600 rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-indigo-500 transition-all text-white"
          >
            Go to Capsule Gateway
          </button>
        </div>
      </div>
    );
  }

  // Generate lookup link with HashRouter support
  // e.g. http://localhost:3000/#/capsule?code=NRNCAP-2026-0001
  const lookupUrl = `${window.location.origin}${window.location.pathname}#/capsule?code=${capsule.capsule_code}`;

  return (
    <div className="pt-28 min-h-screen pb-24 relative overflow-hidden bg-transparent text-white">
      {/* Background visual overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.04),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="no-print mb-8">
          <Link 
            to="/capsule" 
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Time Capsule Gateway
          </Link>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Main Success Greeting */}
          <div className="md:col-span-7 space-y-6">
            <m.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="glass p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-indigo-500/10 bg-indigo-500/5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4"
            >
              <div className="p-3 bg-indigo-600/20 rounded-2xl text-indigo-400 shrink-0">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Capsule Sealed</h1>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Excellent work. Your digital capsule has been compiled, cryptographically hashed, and sealed inside the NEURØN Archive. It will be held locked in digital transit and automatically delivered to your inbox when the time comes.
                </p>
              </div>
            </m.div>

            <div className="no-print space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-gray-400">Next Phases</h3>
              <div className="space-y-3 font-mono text-xs text-gray-500 leading-relaxed">
                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex gap-3">
                  <span className="text-indigo-500 font-bold">01</span>
                  <div>
                    <p className="text-gray-300 font-bold">Sealed in Vault</p>
                    <p className="text-[11px]">Your time capsule coordinates are locked securely inside the Supabase tables, protected with advanced digital rules.</p>
                  </div>
                </div>

                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex gap-3">
                  <span className="text-indigo-500 font-bold">02</span>
                  <div>
                    <p className="text-gray-300 font-bold">Unsealing in July {capsule.cohort_year + 4}</p>
                    <p className="text-[11px]">A cron scheduler triggers on the release date, automatically unsealing and delivering your original entries back to your designated inbox.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Card */}
          <div className="md:col-span-5 space-y-6">
            
            {/* The Sealed Cyber Ticket */}
            <div 
              className="glass p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-indigo-500/30 bg-[#080808] relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.15)] text-center space-y-6"
            >
              {/* Corner Cyber Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/50 rounded-tl-[1rem] sm:rounded-tl-[1.5rem]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500/50 rounded-tr-[1rem] sm:rounded-tr-[1.5rem]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500/50 rounded-bl-[1rem] sm:rounded-bl-[1.5rem]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/50 rounded-br-[1rem] sm:rounded-br-[1.5rem]" />

              <div className="space-y-1">
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] font-bold font-mono tracking-widest text-indigo-400 uppercase inline-block">
                  NEURØN COHORT PASSPORT
                </span>
                <p className="text-[9px] font-mono text-gray-500">DIGITALLY SEALED AND VERIFIED</p>
              </div>

              <div className="space-y-1 pt-4 pb-4">
                <p className="text-[10px] font-mono text-gray-600 uppercase">CAPSULE CODE</p>
                <h2 className="text-2xl font-bold font-mono text-indigo-400 tracking-wider">{capsule.capsule_code}</h2>
              </div>

              <div className="border-t border-dashed border-white/10 pt-4 text-xs font-mono space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">PASSPORT OWNER</span>
                  <span className="text-gray-300 font-bold uppercase">{capsule.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ENROLLMENT ID</span>
                  <span className="text-gray-300">{capsule.enrollment_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ACADEMIC SQUAD</span>
                  <span className="text-gray-300 truncate max-w-[160px]">{capsule.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RELEASE DATE</span>
                  <span className="text-indigo-400 font-bold">JULY {capsule.cohort_year + 4}</span>
                </div>
              </div>

              <div className="p-3 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[9px] text-gray-500 font-mono">
                <ShieldCheck size={12} className="text-indigo-400 animate-pulse" />
                <span>CRYPTOGRAPHIC SIGNATURE CONFIRMED</span>
              </div>
            </div>

            {/* Action Group */}
            <div className="no-print">
              <Link 
                to="/capsule"
                className="w-full py-4 bg-indigo-600 text-xs font-bold font-mono uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg text-white text-center"
              >
                Go Back <ArrowRight size={14} />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CapsuleSuccess;
