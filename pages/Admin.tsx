
// Fix: Import React to resolve React namespace usage including React.FC and React.FormEvent
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, Activity, Loader2, RefreshCw, ShieldCheck, Download, 
  CheckCircle2, TrendingUp, LogOut, Scan, X, Flame, ArrowRight,
  AlertCircle, ShieldAlert, Check, Mail, Clock, Key, Lock, Eye, Trash2, Sparkles, Database
} from 'lucide-react';
import jsQR from 'jsqr';
import { storage } from '../lib/storage.ts';
import { authService } from '../services/auth.ts';
import { Team, PaymentStatus, Capsule, CapsuleStatus } from '../lib/types.ts';
import { capsuleService } from '../lib/capsules.ts';
import { commsService } from '../services/comms.ts';
import Skeleton from '../components/Skeleton.tsx';
import { useToast } from '../context/ToastContext.tsx';

const Admin: React.FC = () => {
  // Fix: Cast motion to any to resolve property missing errors in strict environments
  const m = motion as any;
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState({ totalTeams: 0, paidTeams: 0, checkedIn: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanSuccess, setIsScanSuccess] = useState(false);
  const [manualID, setManualID] = useState('');
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'success'}[]>([]);

  // Capsule States
  const [activeTab, setActiveTab] = useState<'squads' | 'capsules'>('squads');
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsuleSearchTerm, setCapsuleSearchTerm] = useState('');
  const [capsuleFilter, setCapsuleFilter] = useState<CapsuleStatus | 'all'>('all');
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [isCapsuleActionLoading, setIsCapsuleActionLoading] = useState<string | null>(null);
  const [isProcessingUnseal, setIsProcessingUnseal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const teamsRef = useRef<Team[]>([]);
  const scanCountRef = useRef(0);

  // Keep teamsRef in sync with state for the scanner loop
  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  const addLog = useCallback((msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [{ msg, time: new Date().toLocaleTimeString(), type }, ...prev].slice(0, 10));
  }, []);

  const handleAuthFailure = useCallback(() => {
    authService.signOut();
    setIsAuthenticated(false);
    toast.error("Session De-authorized.");
  }, [toast]);

  const handleLogout = useCallback(() => {
    authService.signOut();
    setIsAuthenticated(false);
    toast.success("Session Terminated.");
  }, [toast]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsPolling(true);
    
    try {
      const data = await storage.getTeams();
      const s = await storage.getStats();
      setTeams(data);
      setStats(s);
      
      const caps = await capsuleService.getCapsules();
      setCapsules(caps);
    } catch (err: any) {
      if (err.status !== 401) {
        addLog("Grid uplink unstable", 'warn');
      }
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  }, [addLog]);

  const handleCheckIn = useCallback(async (id: string, status: boolean) => {
    // 1. Optimistic UI update for instant feedback
    setTeams(prev => prev.map(t => t.id === id ? { ...t, checkedin: status } : t));
    
    setActionLoading(id);
    try {
      // 2. Persistent update via secure edge function
      await storage.updateCheckIn(id, status);
      
      const team = teamsRef.current.find(t => t.id === id);
      addLog(`${status ? 'Verified' : 'Unverified'}: ${team?.teamname}`, status ? 'success' : 'info');
      if (status) toast.success(`${team?.teamname} Verified.`);
      
      // 3. Sync stats after update
      const newStats = await storage.getStats();
      setStats(newStats);
    } catch (err: any) {
      // Rollback on failure
      setTeams(prev => prev.map(t => t.id === id ? { ...t, checkedin: !status } : t));
      toast.error("Cloud Sync Error: Check-in failed.");
    } finally {
      setActionLoading(null);
    }
  }, [addLog, toast]);

  const handleManualEntry = async () => {
    const rawInput = manualID.trim().toUpperCase();
    if (!rawInput) return;

    let fullID = rawInput;
    if (!rawInput.startsWith('TALOS-')) {
      fullID = `TALOS-${rawInput}`;
    }
    
    const team = teamsRef.current.find(t => t.teamid === fullID);
    if (!team) {
      toast.error(`Sequence ${fullID} not found.`);
      return;
    }

    if (team.checkedin) {
      toast.info(`${team.teamname} already verified.`);
      setIsScannerOpen(false);
    } else {
      setIsScanSuccess(true);
      await handleCheckIn(team.id, true);
      setTimeout(() => {
        setIsScanSuccess(false);
        setIsScannerOpen(false);
        setManualID('');
      }, 1200);
    }
  };

  const tick = useCallback(() => {
    if (!isScannerOpen || isScanSuccess) return;

    scanCountRef.current++;
    if (scanCountRef.current % 2 !== 0) {
      requestRef.current = requestAnimationFrame(tick);
      return;
    }

    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const scale = 0.8;
      const sw = Math.floor(video.videoWidth * scale);
      const sh = Math.floor(video.videoHeight * scale);

      if (canvas.width !== sw || canvas.height !== sh) {
        canvas.width = sw;
        canvas.height = sh;
      }

      ctx.drawImage(video, 0, 0, sw, sh);
      const imageData = ctx.getImageData(0, 0, sw, sh);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        const talosID = code.data.trim().toUpperCase();
        const team = teamsRef.current.find(t => t.teamid === talosID);
        
        if (team) {
          setIsScanSuccess(true);
          
          if (!team.checkedin) {
            handleCheckIn(team.id, true);
          } else {
            addLog(`Already Verified: ${team.teamname}`, 'warn');
          }

          setTimeout(() => {
            setIsScanSuccess(false);
            setIsScannerOpen(false);
          }, 1200);
          return;
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [isScannerOpen, isScanSuccess, handleCheckIn, addLog]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isScannerOpen) {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute("playsinline", "true");
            videoRef.current.play();
            requestRef.current = requestAnimationFrame(tick);
          }
        })
        .catch(err => {
          console.error("Camera Error:", err);
          toast.error("Scanner Link Offline. Use Manual Entry.");
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isScannerOpen, tick, toast]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const s = await authService.getSession();
        if (s) {
          setIsAuthenticated(true);
          await fetchData();
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [fetchData]);

  useEffect(() => {
    if (isAuthenticated) {
      const pollId = setInterval(() => fetchData(true), 20000);
      return () => clearInterval(pollId);
    }
  }, [isAuthenticated, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      // TRIMMING password to avoid accidental whitespace errors
      const res = await authService.signIn(password.trim());
      if (res.success) { 
        setIsAuthenticated(true); 
        setPassword(''); 
        await fetchData(); 
        toast.success("Session Authenticated.");
      } else {
        setLoginError(res.error || "Access Denied");
      }
    } catch (err: any) {
      setLoginError(err.message || "Auth failure");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDownloadCSV = () => {
    if (teams.length === 0) return;
    const headers = ["Team", "ID", "Status", "Checked In", "Lead", "Email", "Phone"];
    const rows = teams.map(t => [t.teamname, t.teamid, t.paymentstatus, t.checkedin ? "Y" : "N", t.members[0]?.name, t.members[0]?.email, t.members[0]?.phone]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.href = url;
    link.download = `TALOS_MANIFEST_${Date.now()}.csv`;
    link.click();
    document.body.removeChild(link);
    toast.success("Manifest exported.");
  };

  // Capsule Management Handlers
  const handleCapsuleStatusUpdate = async (id: string, status: CapsuleStatus) => {
    setIsCapsuleActionLoading(id);
    try {
      const updated = await capsuleService.updateCapsuleStatus(id, status);
      toast.success(`Capsule status changed to ${status.toUpperCase()}`);
      addLog(`Capsule updated to ${status}`, 'success');
      
      // If unsealed/delivered, trigger email dispatch
      if (status === CapsuleStatus.DELIVERED) {
        try {
          await commsService.triggerUnsealDelivery({ capsuleId: id });
          toast.success("Unsealed capsule contents dispatched to owner.");
          addLog(`Unsealed contents delivered for ${updated.capsule_code}`, 'success');
        } catch (commsErr: any) {
          console.warn("Could not dispatch unsealed email:", commsErr);
          toast.info("Capsule delivered, but unsealed email dispatch failed.");
        }
      }

      const caps = await capsuleService.getCapsules();
      setCapsules(caps);
    } catch (err: any) {
      toast.error(err.message || "Failed to update capsule status.");
    } finally {
      setIsCapsuleActionLoading(null);
    }
  };

  const handleCapsuleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to purge this capsule from the archive? This is irreversible.")) return;
    setIsCapsuleActionLoading(id);
    try {
      await capsuleService.deleteCapsule(id);
      toast.success("Capsule successfully purged.");
      addLog("Capsule purged", 'warn');
      const caps = await capsuleService.getCapsules();
      setCapsules(caps);
    } catch (err: any) {
      toast.error("Failed to purge capsule.");
    } finally {
      setIsCapsuleActionLoading(null);
    }
  };

  const handleTriggerAutomatedUnseal = async () => {
    const force = window.confirm(
      "NEURØN AUTOMATION ENGINE\n\nClick OK to FORCE unseal all sealed capsules immediately (For demonstration/testing).\n\nClick Cancel to run the actual calendar temporal check (requires unsealing date July 1st, 2030 to be reached)."
    );
    
    setIsProcessingUnseal(true);
    addLog(force ? "FORCING global unseal delivery sequence..." : "Scanning global grids for unseal-eligible capsules...", "info");
    try {
      const res = await commsService.triggerUnsealDelivery({ forceUnseal: force }) as any;
      if (res.success) {
        if (res.deliveredCount > 0) {
          toast.success(`Successfully unsealed & delivered ${res.deliveredCount} capsules!`);
          addLog(`Automated unseal success: delivered [${res.delivered.join(', ')}]`, 'success');
        } else {
          toast.info("Automation scans complete. Zero capsules met the gate criteria.");
          addLog("Zero unseal-eligible capsules found in scan.", "info");
        }
        // Refresh list
        const caps = await capsuleService.getCapsules();
        setCapsules(caps);
      }
    } catch (err: any) {
      toast.error(`Automated Unseal Failed: ${err.message || 'Service offline'}`);
      addLog(`Automation Error: ${err.message || 'Service offline'}`, 'warn');
    } finally {
      setIsProcessingUnseal(false);
    }
  };

  const handleDownloadCapsulesCSV = () => {
    if (capsules.length === 0) return;
    const headers = ["Capsule Code", "Name", "Enrollment", "Branch", "Email", "Cohort Year", "Status", "Date Sealed"];
    const rows = capsules.map(c => [
      c.capsule_code, 
      c.full_name, 
      c.enrollment_no, 
      c.branch, 
      c.email, 
      c.cohort_year, 
      c.status, 
      c.date_sealed ? new Date(c.date_sealed).toLocaleDateString() : 'N/A'
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.href = url;
    link.download = `NEURON_TIME_CAPSULES_${Date.now()}.csv`;
    link.click();
    document.body.removeChild(link);
    toast.success("Capsules registry exported.");
  };

  const filteredTeams = teams.filter(t => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = t.teamname.toLowerCase().includes(searchStr) || t.teamid.toLowerCase().includes(searchStr);
    if (filter === 'all') return matchesSearch;
    return matchesSearch && t.paymentstatus === (filter === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING);
  });

  const filteredCapsules = capsules.filter(c => {
    const searchStr = capsuleSearchTerm.toLowerCase();
    const matchesSearch = c.full_name.toLowerCase().includes(searchStr) || 
                          c.capsule_code.toLowerCase().includes(searchStr) || 
                          c.enrollment_no.toLowerCase().includes(searchStr) ||
                          c.email.toLowerCase().includes(searchStr);
    if (capsuleFilter === 'all') return matchesSearch;
    return matchesSearch && c.status === capsuleFilter;
  });

  if (isLoading && isAuthenticated === null) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mb-4 mx-auto" size={32} />
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest text-indigo-400">Linking Session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center px-6">
        <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[2.5rem] w-full max-w-md text-center border-indigo-500/20 shadow-2xl">
          <ShieldCheck size={64} className="mx-auto text-indigo-500 mb-8" />
          <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest font-mono">Executive Hub</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="Access Key" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl outline-none focus:border-indigo-500 transition-all font-mono" value={password} onChange={e => setPassword(e.target.value)} />
            {loginError && <p className="text-red-500 text-xs font-mono uppercase">{loginError}</p>}
            <button disabled={isLoggingIn} className="w-full py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 shadow-lg disabled:opacity-50">
              {isLoggingIn ? <Loader2 className="animate-spin mx-auto" /> : "Authorize"}
            </button>
          </form>
        </m.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4 md:px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">Command Center</h1>
              {isPolling && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
            </div>
            <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Registry Sync Live</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeTab === 'squads' ? (
              <>
                <button onClick={() => setIsScannerOpen(true)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 group shadow-lg">
                  <Scan size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Verify QR</span>
                </button>
                <button onClick={handleDownloadCSV} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400" title="Export Squads CSV">
                  <Download size={20} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleDownloadCapsulesCSV} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400" title="Export Capsules CSV">
                  <Download size={20} />
                </button>
              </>
            )}
            <button onClick={() => fetchData()} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400" title="Synchronize Database">
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
            </button>
            <button onClick={handleLogout} className="p-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 transition-all" title="Terminate Session">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8 border-b border-white/5 pb-4 no-print">
          <button 
            onClick={() => { setActiveTab('squads'); setFilter('all'); }}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-2 ${
              activeTab === 'squads' 
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                : 'glass text-gray-400 hover:text-white border-white/5 hover:bg-white/5'
            }`}
          >
            <Users size={16} /> Squad Registrar
          </button>
          <button 
            onClick={() => { setActiveTab('capsules'); setCapsuleFilter('all'); }}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-2 ${
              activeTab === 'capsules' 
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                : 'glass text-gray-400 hover:text-white border-white/5 hover:bg-white/5'
            }`}
          >
            <Sparkles size={16} /> AI Time Capsule
          </button>
        </div>

        {/* Batch Generating Progress Bar */}
        {isBatchGenerating && (
          <m.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8 p-6 glass border-indigo-500/20 bg-indigo-500/5 rounded-3xl space-y-3"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-indigo-400 font-bold flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> COMPILING BATCH AI LETTERS...
              </span>
              <span>{batchProgress.current} / {batchProgress.total} Complete</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </m.div>
        )}

        {/* Dynamic Statistics Grid based on active tab */}
        {activeTab === 'squads' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Users />, label: "Squads", val: stats.totalTeams },
              { icon: <CheckCircle2 />, label: "Paid", val: stats.paidTeams },
              { icon: <Activity />, label: "Verified", val: stats.checkedIn },
              { icon: <TrendingUp />, label: "Revenue", val: `₹${stats.revenue}` },
            ].map((s_stat, i) => (
              <div key={i} className="glass p-6 rounded-3xl border-white/5">
                <div className="flex items-center gap-3 mb-2 opacity-50">
                  <div className="p-1">{s_stat.icon}</div>
                  <p className="text-[10px] uppercase tracking-widest font-bold">{s_stat.label}</p>
                </div>
                <p className="text-2xl font-bold">{isLoading ? '...' : s_stat.val}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <Database />, label: "Submissions", val: capsules.length },
              { icon: <Lock className="text-indigo-400" />, label: "Sealed & Archived", val: capsules.filter(c => c.status === CapsuleStatus.SEALED).length },
              { icon: <Clock />, label: "Active Cohort", val: `2026` },
            ].map((s_stat, i) => (
              <div key={i} className="glass p-6 rounded-3xl border-white/5">
                <div className="flex items-center gap-3 mb-2 opacity-50">
                  <div className="p-1">{s_stat.icon}</div>
                  <p className="text-[10px] uppercase tracking-widest font-bold">{s_stat.label}</p>
                </div>
                <p className="text-2xl font-bold">{isLoading ? '...' : s_stat.val}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {activeTab === 'squads' ? (
              <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative flex-1 w-full">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                     <input placeholder="Filter by Name or TALOS ID..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm outline-none focus:border-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'glass border-white/5 text-gray-500'}`}>All</button>
                    <button onClick={() => setFilter('paid')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'paid' ? 'bg-indigo-600 text-white' : 'glass border-white/5 text-gray-500'}`}>Paid</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/2 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                      <tr><th className="px-8 py-4 text-left">Identity</th><th className="px-8 py-4 text-left">Sync</th><th className="px-8 py-4 text-left">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={3} className="px-8 py-6"><Skeleton className="h-12 w-full" /></td></tr>) : filteredTeams.length === 0 ? (
                        <tr><td colSpan={3} className="px-8 py-20 text-center text-gray-600 font-mono text-xs">No Records Found</td></tr>
                      ) : filteredTeams.map(team => (
                        <tr key={team.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-bold text-sm">{team.teamname}</p>
                            <span className="text-[10px] text-gray-500 font-mono">{team.teamid}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${team.paymentstatus === PaymentStatus.PAID ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{team.paymentstatus}</span>
                          </td>
                          <td className="px-8 py-6">
                             <button 
                               disabled={actionLoading === team.id} 
                               onClick={() => handleCheckIn(team.id, !team.checkedin)} 
                               className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                                 team.checkedin 
                                 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                                 : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                               }`}
                             >
                                {actionLoading === team.id ? <Loader2 size={12} className="animate-spin" /> : team.checkedin ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                                {team.checkedin ? 'Verified' : 'Verify'}
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative flex-1 w-full">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                     <input placeholder="Filter by Name, Code, Enrollment ID or Email..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm outline-none focus:border-indigo-500 font-mono" value={capsuleSearchTerm} onChange={e => setCapsuleSearchTerm(e.target.value)} />
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <button onClick={() => setCapsuleFilter('all')} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${capsuleFilter === 'all' ? 'bg-indigo-600 text-white' : 'glass border-white/5 text-gray-500'}`}>All</button>
                    <button onClick={() => setCapsuleFilter(CapsuleStatus.SUBMITTED)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${capsuleFilter === CapsuleStatus.SUBMITTED ? 'bg-indigo-600 text-white' : 'glass border-white/5 text-gray-500'}`}>New</button>
                    <button onClick={() => setCapsuleFilter(CapsuleStatus.SEALED)} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${capsuleFilter === CapsuleStatus.SEALED ? 'bg-indigo-600 text-white' : 'glass border-white/5 text-gray-500'}`}>Sealed</button>
                    
                    <button 
                      onClick={handleTriggerAutomatedUnseal} 
                      disabled={isProcessingUnseal}
                      className="ml-2 px-3 py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isProcessingUnseal ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                      Run Unseal Automation
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/2 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="px-6 py-4 text-left">Identity</th>
                        <th className="px-6 py-4 text-left">Contact & Academics</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="px-6 py-6"><Skeleton className="h-12 w-full" /></td></tr>) : filteredCapsules.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-600 font-mono text-xs">No Capsules Found</td></tr>
                      ) : filteredCapsules.map(capsule => (
                        <tr key={capsule.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-6">
                            <p className="font-bold text-sm">{capsule.full_name}</p>
                            <span className="text-[10px] text-gray-500 font-mono">{capsule.capsule_code}</span>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-xs text-gray-300 font-mono flex items-center gap-1">
                              <Mail size={10} className="text-indigo-400" /> {capsule.email}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 font-mono">
                              ID: {capsule.enrollment_no} • {capsule.branch}
                            </p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase font-mono ${
                              capsule.status === CapsuleStatus.SUBMITTED 
                                ? 'bg-blue-500/10 text-blue-400' 
                                : 'bg-green-500/10 text-green-400'
                            }`}>
                              {capsule.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {/* Action: Review entry */}
                              <button 
                                onClick={() => setSelectedCapsule(capsule)}
                                className="p-2 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                                title="Review Capsule Entry"
                              >
                                <Eye size={14} />
                              </button>

                              {/* Action: Seal envelope */}
                              {capsule.status === CapsuleStatus.SUBMITTED && (
                                <button 
                                  disabled={isCapsuleActionLoading === capsule.id}
                                  onClick={() => handleCapsuleStatusUpdate(capsule.id, CapsuleStatus.SEALED)}
                                  className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                                  title="Lock & Seal Capsule"
                                >
                                  {isCapsuleActionLoading === capsule.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                                </button>
                              )}

                              {/* Action: Delete */}
                              <button 
                                disabled={isCapsuleActionLoading === capsule.id}
                                onClick={() => handleCapsuleDelete(capsule.id)}
                                className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                title="Purge Capsule"
                              >
                                {isCapsuleActionLoading === capsule.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="glass p-6 rounded-[2rem] border-white/5 h-fit">
             <h3 className="text-[10px] font-bold uppercase font-mono mb-6 flex items-center gap-2 border-b border-white/5 pb-4">Neural Feed</h3>
             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <p className="text-[10px] text-gray-700 italic text-center py-10">Waiting for signals...</p>
                ) : logs.map((log, i) => (
                  <div key={i} className="flex flex-col text-[11px] border-l-2 border-indigo-500/30 pl-3">
                      <p className="text-gray-600 font-mono text-[9px] mb-1">{log.time}</p>
                      <p className={`font-medium ${log.type === 'warn' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>{log.msg}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <AnimatePresence>
          {isScannerOpen && (
            <m.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto"
            >
              <div className="relative w-full max-w-xl glass border-indigo-500/40 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] my-auto">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                       <Scan className="text-white" size={20} />
                     </div>
                     <div>
                       <h2 className="text-xl font-bold uppercase tracking-widest font-mono">NEURAL VERIFIER</h2>
                       <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Optical & Manual Interface</p>
                     </div>
                   </div>
                   <button onClick={() => setIsScannerOpen(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                     <X size={20} />
                   </button>
                </div>
                
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <video ref={videoRef} className="w-full h-full object-cover opacity-80" muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                     <div className="w-72 h-72 border border-indigo-500/30 rounded-3xl relative">
                        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl" />
                        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl" />
                        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl" />
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl" />
                        
                        <m.div 
                          animate={{ y: [0, 280, 0] }} 
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_25px_rgba(79,70,229,1)]"
                        />
                     </div>
                  </div>

                  <AnimatePresence>
                    {isScanSuccess && (
                      <m.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-green-600/90 z-50 flex flex-col items-center justify-center text-white"
                      >
                         <m.div
                           initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                           className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4"
                         >
                            <Check size={48} strokeWidth={3} />
                         </m.div>
                         <h3 className="text-3xl font-black uppercase tracking-widest font-display">Access Granted</h3>
                         <p className="text-[10px] font-mono mt-2 opacity-70">SQUAD_VERIFIED // SESSION_SYNC</p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-10 space-y-8 bg-[#080808]">
                   <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <AlertCircle className="text-indigo-400" size={16} />
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                        Verification instant sync is active. Dashboard will update in real-time.
                      </p>
                   </div>
                   
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 block ml-1">Manual Override Sequence</label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          placeholder="TALOS-XXXXXX" 
                          value={manualID}
                          onChange={(e) => setManualID(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-8 text-2xl font-mono outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all placeholder:text-gray-800"
                        />
                        <button 
                          onClick={handleManualEntry}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all"
                        >
                          <ArrowRight size={24} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                          (Accepts 6-character code directly)
                        </p>
                        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                          ID: {manualID.length}/12
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </m.div>
          )}

          {/* Capsule Letter Review Modal */}
          {selectedCapsule && (
            <m.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <m.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="glass w-full max-w-2xl rounded-3xl border-white/10 bg-[#0c0c0c] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(79,70,229,0.2)]"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wider">Reviewing Capsule Entry</span>
                    <h3 className="text-lg font-bold font-mono text-white">{selectedCapsule.full_name} ({selectedCapsule.capsule_code})</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedCapsule(null)}
                    className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto space-y-6 text-sm text-gray-300 leading-relaxed font-sans custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/2 border border-white/5 rounded-2xl text-xs font-mono">
                    <div>
                      <p className="text-gray-500">EMAIL FOR DELIVERY</p>
                      <p className="text-white mt-1 truncate">{selectedCapsule.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">TARGET DELIVERY YEAR</p>
                      <p className="text-indigo-400 font-bold mt-1">JULY {selectedCapsule.cohort_year + 4}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ACADEMIC BRANCH</p>
                      <p className="text-white mt-1">{selectedCapsule.branch}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CAPSULE STATUS</p>
                      <p className="text-white mt-1 uppercase">{selectedCapsule.status}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest">1. Career & Professional Aspirations (Q1)</h4>
                      <div className="p-4 bg-white/2 border border-white/5 rounded-xl text-xs text-gray-300 font-sans leading-relaxed">
                        {selectedCapsule.q1_answer}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest">2. Technological Landscape Prediction (Q2)</h4>
                      <div className="p-4 bg-white/2 border border-white/5 rounded-xl text-xs text-gray-300 font-sans leading-relaxed">
                        {selectedCapsule.q2_answer}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest">3. Private Warning / Advice to Future Self (Q3)</h4>
                      <div className="p-4 bg-white/2 border border-white/5 rounded-xl text-xs text-gray-300 font-sans leading-relaxed">
                        {selectedCapsule.q3_answer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/2">
                  <button 
                    disabled={isCapsuleActionLoading === selectedCapsule.id}
                    onClick={async () => {
                      setIsCapsuleActionLoading(selectedCapsule.id);
                      try {
                        await commsService.triggerUnsealDelivery({ capsuleId: selectedCapsule.id, forceUnseal: true });
                        toast.success("Capsule unsealed & email delivered successfully.");
                        addLog(`Manual unseal & delivery for ${selectedCapsule.capsule_code}`, 'success');
                        setSelectedCapsule(null);
                        
                        // Reload lists to reflect 'delivered' status
                        const caps = await capsuleService.getCapsules();
                        setCapsules(caps);
                      } catch (commsErr: any) {
                        toast.error(`Unseal Dispatch Failed: ${commsErr.message || 'Offline'}`);
                      } finally {
                        setIsCapsuleActionLoading(null);
                      }
                    }}
                    className="px-5 py-3 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCapsuleActionLoading === selectedCapsule.id ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                    Trigger Unseal Delivery
                  </button>

                  {selectedCapsule.status === CapsuleStatus.SUBMITTED && (
                    <button 
                      onClick={() => {
                        handleCapsuleStatusUpdate(selectedCapsule.id, CapsuleStatus.SEALED);
                        setSelectedCapsule(null);
                      }}
                      className="px-5 py-3 bg-green-600 text-white rounded-xl text-xs font-bold font-mono tracking-widest uppercase hover:bg-green-500 transition-all flex items-center gap-2"
                    >
                      <Lock size={12} /> Lock & Seal Capsule
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedCapsule(null)}
                    className="px-5 py-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all"
                  >
                    Close Reviewer
                  </button>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
