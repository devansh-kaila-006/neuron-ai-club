
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, Activity, Loader2, RefreshCw, ShieldCheck, Download, 
  CheckCircle2, TrendingUp, LogOut, Scan, X, Terminal, Flame
} from 'lucide-react';
import jsQR from 'jsqr';
import { storage } from '../lib/storage.ts';
import { authService } from '../services/auth.ts';
import { Team, PaymentStatus } from '../lib/types.ts';
import Skeleton from '../components/Skeleton.tsx';
import { useToast } from '../context/ToastContext.tsx';

const Admin: React.FC = () => {
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
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'success'}[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [{ msg, time: new Date().toLocaleTimeString(), type }, ...prev].slice(0, 10));
  }, []);

  // SECURITY FIX: Automatic Logout on 401
  const handleAuthFailure = useCallback(() => {
    authService.signOut();
    setIsAuthenticated(false);
    toast.error("Session De-authorized: Invalid or expired access key.");
  }, [toast]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsPolling(true);
    
    try {
      // In this hardened version, storage calls will fail with 401 if the token is wrong
      const [data, s] = await Promise.all([
        storage.getTeams().catch(err => {
          if (err.status === 401) handleAuthFailure();
          throw err;
        }),
        storage.getStats().catch(err => {
          if (err.status === 401) handleAuthFailure();
          throw err;
        })
      ]);
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
  }, [addLog, handleAuthFailure]);

  const handleCheckIn = async (id: string, status: boolean) => {
    setActionLoading(id);
    try {
      await storage.updateCheckIn(id, status);
      await fetchData(true);
      const team = teams.find(t => t.id === id);
      addLog(`${status ? 'Verified' : 'Unverified'}: ${team?.teamname}`, status ? 'success' : 'info');
      if (status) toast.success(`Checked in: ${team?.teamname}`);
    } catch (err: any) {
      if (err.status === 401) handleAuthFailure();
      else toast.error("Check-in sync failure.");
    } finally {
      setActionLoading(null);
    }
  };

  const tick = useCallback(() => {
    if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        const talosID = code.data.trim().toUpperCase();
        addLog(`QR Detected: ${talosID}`, 'info');
        
        const team = teams.find(t => t.teamid === talosID);
        if (team) {
          if (!team.checkedin) {
            handleCheckIn(team.id, true);
            setIsScannerOpen(false);
          } else {
            addLog(`Already Verified: ${team.teamname}`, 'warn');
            toast.info(`${team.teamname} is already checked in.`);
            setIsScannerOpen(false);
          }
        } else {
          toast.error("Unrecognized Manifest ID.");
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [teams, handleCheckIn, addLog, toast]);

  useEffect(() => {
    if (isScannerOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute("playsinline", "true");
            videoRef.current.play();
            requestRef.current = requestAnimationFrame(tick);
          }
        })
        .catch(err => {
          console.error("Camera Access Failed:", err);
          toast.error("Optics Malfunction: Camera access denied.");
          setIsScannerOpen(false);
        });
    } else {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
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
      const res = await authService.signIn(password);
      if (res.success) { 
        setIsAuthenticated(true); 
        setPassword(''); 
        // Verification happens here:
        await fetchData(); 
        toast.success("Executive override successful.");
      } else {
        setLoginError(res.error || "Access Denied");
      }
    } catch (err: any) {
      setLoginError(err.message || "Auth uplink failure");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDownloadCSV = () => {
    if (teams.length === 0) {
      toast.error("Manifest empty. No data to export.");
      return;
    }

    const headers = ["Team Name", "TALOS ID", "Status", "Checked In", "Lead Name", "Lead Email", "Lead Phone", "Members Count"];
    const rows = teams.map(t => [
      t.teamname,
      t.teamid,
      t.paymentstatus,
      t.checkedin ? "Yes" : "No",
      t.members[0]?.name || "N/A",
      t.members[0]?.email || "N/A",
      t.members[0]?.phone || "N/A",
      t.members.length
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TALOS_2026_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addLog("Manifest Exported (CSV)", 'success');
    toast.success("Manifest downloaded.");
  };

  const handlePurge = async () => {
    if (window.confirm("CRITICAL: This will permanently purge the entire neural manifest. Proceed?")) {
      setIsLoading(true);
      try {
        await storage.clearAllData();
        addLog("SYSTEM WIPE COMPLETE", 'warn');
        toast.error("Grid Manifest Purged.");
        await fetchData();
      } catch (err: any) {
        if (err.status === 401) handleAuthFailure();
        else toast.error(`Purge Failed: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setIsLoading(false);
    toast.info("Terminal session terminated.");
  };

  const filteredTeams = teams.filter(t => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = t.teamname.toLowerCase().includes(searchStr) || 
                         t.teamid.toLowerCase().includes(searchStr);
    if (filter === 'all') return matchesSearch;
    return matchesSearch && t.paymentstatus === (filter === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING);
  });

  if (isLoading && isAuthenticated === null) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mb-4 mx-auto" size={32} />
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">Uplinking Terminal...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center px-6">
        {/* @ts-ignore - Fixing framer-motion type mismatch */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[2.5rem] w-full max-w-md text-center border-indigo-500/20 shadow-2xl">
          <ShieldCheck size={64} className="mx-auto text-indigo-500 mb-8" />
          <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest font-mono">Executive Terminal</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="Access Key" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl outline-none focus:border-indigo-500 transition-all font-mono" value={password} onChange={e => setPassword(e.target.value)} />
            {loginError && <p className="text-red-500 text-xs font-mono uppercase">{loginError}</p>}
            <button disabled={isLoggingIn} className="w-full py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg disabled:opacity-50">
              {isLoggingIn ? <Loader2 className="animate-spin mx-auto" /> : "Authorize Link"}
            </button>
          </form>
        </motion.div>
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
              {/* @ts-ignore - Fixing framer-motion type mismatch */}
              {isPolling && <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} className="w-2 h-2 rounded-full bg-indigo-500" />}
            </div>
            <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Neural Grid Active</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsScannerOpen(true)} className="p-3 bg-indigo-600 border border-indigo-400/30 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 group shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Scan size={20} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Scan Manifest</span>
            </button>
            <button onClick={handleDownloadCSV} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400 flex items-center gap-2 group">
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Export CSV</span>
            </button>
            <button onClick={() => fetchData()} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400">
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
            </button>
            <button onClick={handlePurge} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2">
              <Flame size={20} />
            </button>
            <button onClick={handleLogout} className="p-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: <Users className="text-blue-400" />, label: "Squads", val: stats.totalTeams },
            { icon: <CheckCircle2 className="text-green-400" />, label: "Paid", val: stats.paidTeams },
            { icon: <Activity className="text-purple-400" />, label: "Check-ins", val: stats.checkedIn },
            { icon: <TrendingUp className="text-emerald-400" />, label: "Revenue", val: `₹${stats.revenue}` },
          ].map((s, i) => (
            <div key={i} className="glass p-6 rounded-3xl border-white/5">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-white/5 rounded-xl">{s.icon}</div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{s.label}</p>
              </div>
              <p className="text-2xl font-bold">{isLoading ? '...' : s.val}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                   <input placeholder="Search Manifests..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm outline-none focus:border-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'glass border-white/5 text-gray-500'}`}>All</button>
                  <button onClick={() => setFilter('paid')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${filter === 'paid' ? 'bg-green-600 text-white' : 'glass border-white/5 text-gray-500'}`}>Paid</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/2 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                    <tr><th className="px-8 py-4 text-left">Squad</th><th className="px-8 py-4 text-left">Status</th><th className="px-8 py-4 text-left">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={3} className="px-8 py-6"><Skeleton className="h-12 w-full" /></td></tr>) : filteredTeams.length === 0 ? (
                      <tr><td colSpan={3} className="px-8 py-20 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">No Manifests Found</td></tr>
                    ) : filteredTeams.map(team => (
                      <tr key={team.id} className="hover:bg-white/2 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-sm group-hover:text-indigo-400 transition-colors">{team.teamname}</p>
                          <span className="text-[10px] text-gray-500 font-mono">{team.teamid}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${team.paymentstatus === PaymentStatus.PAID ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{team.paymentstatus}</span>
                        </td>
                        <td className="px-8 py-6">
                           <button disabled={actionLoading === team.id} onClick={() => handleCheckIn(team.id, !team.checkedin)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${team.checkedin ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                              {actionLoading === team.id ? <Loader2 size={12} className="animate-spin" /> : team.checkedin ? <CheckCircle2 size={12} /> : null}
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
             <h3 className="text-[10px] font-bold uppercase font-mono mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Terminal size={14} className="text-indigo-400" /> Neural Feed</h3>
             <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <p className="text-[10px] text-gray-700 italic text-center py-10">Uplink Quiet...</p>
                ) : logs.map((log, i) => (
                  /* @ts-ignore - Fixing framer-motion type mismatch */
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-3 text-[11px] border-l-2 border-indigo-500/30 pl-3">
                    <div className="flex-1">
                      <p className="text-gray-600 font-mono text-[9px] mb-1">{log.time}</p>
                      <p className={`font-medium ${log.type === 'warn' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>{log.msg}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        <AnimatePresence>
          {isScannerOpen && (
            /* @ts-ignore - Fixing framer-motion type mismatch */
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
            >
              <div className="relative w-full max-w-lg glass border-indigo-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <Scan className="text-indigo-500" />
                     <h2 className="text-xl font-bold uppercase tracking-widest font-mono">Neural Scanner</h2>
                   </div>
                   <button onClick={() => setIsScannerOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
                </div>
                
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                     <div className="w-64 h-64 border-2 border-indigo-500/50 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -translate-x-1 -translate-y-1 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 translate-x-1 -translate-y-1 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -translate-x-1 translate-y-1 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 translate-x-1 translate-y-1 rounded-br-lg" />
                        {/* @ts-ignore - Fixing framer-motion type mismatch */}
                        <motion.div 
                          animate={{ y: [0, 240, 0] }} 
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)]"
                        />
                     </div>
                  </div>
                </div>
                <div className="p-8 bg-white/2 text-center">
                   <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                     Place QR manifest within scanning zone
                   </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;