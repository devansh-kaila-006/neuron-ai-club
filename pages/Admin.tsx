
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trash2, Users, Activity, Loader2, RefreshCw, ShieldCheck, Download, 
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
    setLogs(prev => [{ msg, time: new Date().toLocaleTimeString(), type }, ...prev].slice(0, 5));
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsPolling(true);
    
    try {
      const [data, s] = await Promise.all([
        storage.getTeams().catch(() => []),
        storage.getStats().catch(() => ({ totalTeams: 0, paidTeams: 0, checkedIn: 0, revenue: 0 }))
      ]);
      setTeams(data);
      setStats(s);
    } catch (err) {
      addLog("Grid uplink unstable", 'warn');
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  }, [addLog]);

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
        await fetchData(); 
        toast.success("Executive override successful.");
      } else {
        setLoginError(res.error || "Access Denied");
      }
    } catch (err) {
      setLoginError("Auth uplink failure");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCheckIn = async (id: string, status: boolean) => {
    setActionLoading(id);
    try {
      await storage.updateCheckIn(id, status);
      await fetchData(true);
      const team = teams.find(t => t.id === id);
      addLog(`Status Updated: ${team?.teamName}`, 'success');
    } finally {
      setActionLoading(null);
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
    const matchesSearch = t.teamName.toLowerCase().includes(searchStr) || 
                         t.teamID.toLowerCase().includes(searchStr);
    if (filter === 'all') return matchesSearch;
    return matchesSearch && t.paymentStatus === (filter === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING);
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
              {isPolling && <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} className="w-2 h-2 rounded-full bg-indigo-500" />}
            </div>
            <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Neural Grid Active</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => fetchData()} className="p-3 glass border-white/10 rounded-xl hover:bg-white/5 transition-all text-indigo-400">
              <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
            </button>
            <button onClick={handleLogout} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all">
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
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between">
                <input placeholder="Search Manifests..." className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-sm outline-none focus:border-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/2 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                    <tr><th className="px-8 py-4 text-left">Squad</th><th className="px-8 py-4 text-left">Status</th><th className="px-8 py-4 text-left">Check-In</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={3} className="px-8 py-6"><Skeleton className="h-12 w-full" /></td></tr>) : filteredTeams.map(team => (
                      <tr key={team.id} className="hover:bg-white/2 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-sm">{team.teamName}</p>
                          <span className="text-[10px] text-indigo-400 font-mono">{team.teamID}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${team.paymentStatus === PaymentStatus.PAID ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{team.paymentStatus}</span>
                        </td>
                        <td className="px-8 py-6">
                           <button disabled={actionLoading === team.id} onClick={() => handleCheckIn(team.id, !team.checkedIn)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${team.checkedIn ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500'}`}>{team.checkedIn ? 'Verified' : 'Verify'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="glass p-6 rounded-[2rem] border-white/5">
             <h3 className="text-[10px] font-bold uppercase font-mono mb-6 flex items-center gap-2"><Terminal size={14} className="text-indigo-400" /> Neural Feed</h3>
             <div className="space-y-4">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-[11px] border-l-2 border-indigo-500/30 pl-3">
                    <div><p className="text-gray-500 font-mono text-[9px]">{log.time}</p><p className={log.type === 'warn' ? 'text-red-400' : 'text-gray-300'}>{log.msg}</p></div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
