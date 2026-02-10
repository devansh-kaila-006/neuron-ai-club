
// Fix: Import React to resolve React namespace usage including React.FC and React.FormEvent
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, Activity, Loader2, RefreshCw, ShieldCheck, Download, 
  CheckCircle2, TrendingUp, LogOut, Scan, X, Terminal, Flame, ArrowRight,
  AlertCircle, ShieldAlert, Check
} from 'lucide-react';
import jsQR from 'jsqr';
import { storage } from '../lib/storage.ts';
import { authService } from '../services/auth.ts';
import { Team, PaymentStatus } from '../lib/types.ts';
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
    toast.success("Terminal Session Terminated.");
  }, [toast]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsPolling(true);
    
    try {
      const data = await storage.getTeams();
      const s = await storage.getStats();
      setTeams(data);
      setStats(s);
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
        toast.success("Terminal Authenticated.");
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

  const filteredTeams = teams.filter(t => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = t.teamname.toLowerCase().includes(searchStr) || t.teamid.toLowerCase().includes(searchStr);
    if (filter === 'all') return matchesSearch;
    return matchesSearch && t.paymentstatus === (filter === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING);
  });

  if (isLoading && isAuthenticated === null) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mb-4 mx-auto" size={32} />
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest text-indigo-400">Linking Terminal...</p>
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
            <button onClick={() => setIsScannerOpen(true)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 group shadow-lg">
              <Scan size={20} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Verify QR</span>
            </button>
            <button onClick={handleDownloadCSV} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400">
              <Download size={20} />
            </button>
            <button onClick={() => fetchData()} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400">
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
            </button>
            <button onClick={handleLogout} className="p-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>

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

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
