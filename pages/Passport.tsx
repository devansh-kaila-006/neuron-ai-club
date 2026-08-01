import React, { useState, useEffect } from 'react';
// @ts-ignore - Fixing react-router-dom member export false positive
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Shield, Award, Users, Search, Plus, Trash2, Check, Sparkles,
  AlertCircle, ChevronRight, Cpu, Database, Palette, ShieldCheck, Lock, CheckCircle2,
  Copy, ExternalLink, QrCode, UserCheck, Flame, Star, RefreshCw
} from 'lucide-react';
import { passportService, OFFICIAL_PASSPORT_TASKS, STAMP_POINTS, calculatePassportPoints, sanitizeText, validateEnrollmentNo } from '../lib/passports.ts';
import { supabase } from '../lib/storage.ts';
import { TeamPassport, PassportMember, StampTier, PassportTask } from '../lib/types.ts';
import { useToast } from '../context/ToastContext.tsx';
import { GoldStampBadge, SilverStampBadge, BronzeStampBadge } from '../components/StampBadges.tsx';
import DecryptedText from '../components/DecryptedText.tsx';

const TASK_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number | string }>> = {
  Cpu,
  Sparkles,
  Palette,
  Database,
  ShieldCheck,
  Trophy
};

const PassportPage: React.FC = () => {
  const m = motion as any;
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'view' | 'register' | 'leaderboard'>('register');
  const [passports, setPassports] = useState<TeamPassport[]>([]);
  const [selectedPassport, setSelectedPassport] = useState<TeamPassport | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Saved Team Passport in local storage
  const [myTeamCode, setMyTeamCode] = useState<string>(() => {
    return localStorage.getItem('neuron_my_team_passport_code') || '';
  });

  // Registration state
  const [regTeamName, setRegTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle saving my team code
  const handleToggleMyTeam = (code: string) => {
    if (myTeamCode === code) {
      localStorage.removeItem('neuron_my_team_passport_code');
      setMyTeamCode('');
      toast.info('Removed from My Squad preference.');
    } else {
      localStorage.setItem('neuron_my_team_passport_code', code);
      setMyTeamCode(code);
      toast.success(`Saved "${code}" as your squad passport!`);
    }
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/#/passport?code=${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Direct passport link copied to clipboard!');
  };

  // Load Passports (supports silent background sync for live real-time updates)
  const loadPassports = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await passportService.getPassports();
      setPassports(data);

      // Keep selectedPassport updated in real time if currently viewing one
      setSelectedPassport(prev => {
        if (!prev) return null;
        const updated = data.find(p => p.id === prev.id || p.passport_code === prev.passport_code);
        return updated || prev;
      });

      // Check URL search parameter e.g. /passport?code=NRNPASS-2026-0001
      if (!silent) {
        const urlCode = searchParams.get('code');
        const savedCode = localStorage.getItem('neuron_my_team_passport_code');

        if (urlCode) {
          const found = data.find(p => p.passport_code.toUpperCase() === urlCode.trim().toUpperCase());
          if (found) {
            setSelectedPassport(found);
            setSearchCode(found.passport_code);
            setActiveTab('view');
          }
        } else if (savedCode) {
          const found = data.find(p => p.passport_code.toUpperCase() === savedCode.trim().toUpperCase());
          if (found) {
            setSelectedPassport(found);
            setSearchCode(found.passport_code);
          }
        }
      }
    } catch (err: any) {
      if (!silent) toast.error('Failed to retrieve passports catalog.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPassports();

    // 1. Setup periodic live auto-polling every 3 seconds for instant leaderboard updates
    const pollInterval = setInterval(() => {
      loadPassports(true);
    }, 3000);

    // 2. Setup Supabase Realtime channel subscription if active
    let channel: any = null;
    if (supabase) {
      try {
        channel = supabase
          .channel('public:team_passports_live')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'team_passports' },
            () => {
              loadPassports(true);
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription fallback to polling:', e);
      }
    }

    return () => {
      clearInterval(pollInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Handle Lookup / Squad Access with input sanitization & 4-digit auto-append
  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSearch = sanitizeText(searchCode, 50);
    if (!cleanSearch) return;

    const rawQuery = cleanSearch.trim().toUpperCase();
    const currentYear = new Date().getFullYear();

    // Auto-construct full passport code if user enters digits only (e.g., 0001 or 1)
    let autoAppendedCode = '';
    const digitsOnly = rawQuery.replace(/\D/g, '');
    if (digitsOnly.length > 0 && digitsOnly.length <= 4 && /^\d{1,4}$/.test(rawQuery)) {
      autoAppendedCode = `NRNPASS-${currentYear}-${digitsOnly.padStart(4, '0')}`;
    }

    const found = passports.find(p => {
      const pCode = p.passport_code.toUpperCase();
      return (
        pCode === rawQuery ||
        (autoAppendedCode && pCode === autoAppendedCode) ||
        pCode.endsWith(`-${rawQuery}`) ||
        pCode.endsWith(`-${digitsOnly.padStart(4, '0')}`) ||
        p.id.toUpperCase() === rawQuery ||
        p.team_name.toUpperCase() === rawQuery
      );
    });

    if (found) {
      setSelectedPassport(found);
      setMyTeamCode(found.passport_code);
      setSearchCode(found.passport_code);
      localStorage.setItem('neuron_my_team_passport_code', found.passport_code);
      setSearchParams({ code: found.passport_code });
      toast.success(`Accessing squad passport for ${found.team_name} (${found.passport_code})`);
    } else {
      toast.error(`No squad passport found for "${cleanSearch}". Check your 4-digit number or register a new squad.`);
    }
  };

  // Register Team Passport
  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTeamName.trim()) {
      toast.error('Please enter a valid Team Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await passportService.createTeamPassport(regTeamName, []);
      toast.success(`Team Passport created successfully! Passport Code: ${created.passport_code}`);
      
      // Auto save as current squad
      localStorage.setItem('neuron_my_team_passport_code', created.passport_code);
      setMyTeamCode(created.passport_code);

      // Reload list and focus on newly created passport
      await loadPassports();
      setSelectedPassport(created);
      setSearchCode(created.passport_code);
      setSearchParams({ code: created.passport_code });
      setActiveTab('view');

      // Reset form
      setRegTeamName('');
    } catch (err: any) {
      toast.error(err.message || 'Error registering team passport.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Top 3 Teams calculations
  const sortedLeaderboard = [...passports].sort((a, b) => b.total_points - a.total_points);
  const top1 = sortedLeaderboard[0];
  const top2 = sortedLeaderboard[1];
  const top3 = sortedLeaderboard[2];

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen text-white relative">
      {/* Signature Ambient Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-600/15 via-purple-600/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 relative">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 mb-1 sm:mb-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] sm:tracking-[0.4em] font-mono">
            NEURØN EVENT • PASSPORT EXPLORER
          </span>
        </m.div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter font-sans uppercase leading-tight break-words px-2">
          PASSPORT <DecryptedText text="EXPLORER" className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent italic pr-2 sm:pr-4" />
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-gray-400 font-light leading-relaxed px-2">
          The official digital passport & squad tracking system for Passport Explorer! Register your squad, unlock the 5 Core Neural Tasks, receive Gold, Silver, or Bronze stamps, and conquer the leaderboard!
        </p>

        {/* Navigation Tabs - Optimized Mobile Grid / Touch Bar */}
        <div className="grid grid-cols-1 sm:flex sm:flex-row flex-wrap justify-center items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 max-w-xl mx-auto">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] ${
              activeTab === 'view'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'glass text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Shield size={16} className="shrink-0" />
            <span className="truncate">{selectedPassport ? `My Passport (${selectedPassport.team_name})` : 'My Squad Passport'}</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                : 'glass text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Users size={16} className="shrink-0" />
            <span>Register Squad</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg shadow-amber-500/25 border border-amber-400/30'
                : 'glass text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Trophy size={16} className="shrink-0" />
            <span>Leaderboard Standings</span>
          </button>
        </div>
      </div>

      {/* VIEW DIGITAL PASSPORTS TAB */}
      {activeTab === 'view' && (
        <div className="space-y-8">
          {/* Lookup / Change Squad Code Bar */}
          <div className="glass p-5 rounded-2xl border border-white/10 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left w-full md:w-auto">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                  {selectedPassport ? 'Active Squad Session' : 'Access Your Squad Passport'}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedPassport
                    ? `Currently viewing passport for ${selectedPassport.team_name} (${selectedPassport.passport_code})`
                    : 'Enter the last 4 digits (e.g., 0001) or full code (NRNPASS-2026-0001) to view squad stamps.'}
                </p>
              </div>

              <form onSubmit={handleLookup} className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Enter last 4 digits (e.g. 0001)..."
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shrink-0"
                >
                  Access
                </button>
              </form>
            </div>
          </div>

          {/* PASSPORT CARD DISPLAY */}
          {selectedPassport ? (
            <m.div
              key={selectedPassport.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 md:p-10 rounded-[2.5rem] border border-indigo-500/30 relative overflow-hidden shadow-2xl bg-gradient-to-b from-[#0a0c1a]/90 to-[#04050d]/90"
            >
              {/* Decorative Passport Header Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-amber-400 to-purple-600" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-indigo-500/30">
                      NEURØN OFFICIAL SQUAD PASSPORT
                    </span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Trophy size={12} /> Rank Score: {selectedPassport.total_points} PTS
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight font-sans">
                    {selectedPassport.team_name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400 flex-wrap">
                    <span className="text-indigo-400 font-bold">PASSPORT CODE: {selectedPassport.passport_code}</span>
                    <span>•</span>
                    <span>COHORT YEAR: {selectedPassport.cohort_year}</span>
                    <span>•</span>
                    <span>SQUAD SIZE: {selectedPassport.members.length} MEMBERS</span>
                  </div>

                  {/* Actions for Team Members */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => handleToggleMyTeam(selectedPassport.passport_code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
                        myTeamCode === selectedPassport.passport_code
                          ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/20'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-amber-400/50 hover:text-white'
                      }`}
                    >
                      <Star size={14} className={myTeamCode === selectedPassport.passport_code ? 'fill-black' : 'text-amber-400'} />
                      {myTeamCode === selectedPassport.passport_code ? 'My Squad Passport ✓' : 'Save as My Squad'}
                    </button>

                    <button
                      onClick={() => handleCopyLink(selectedPassport.passport_code)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} className="text-indigo-400" />
                      Copy Share Link
                    </button>

                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Trophy size={14} className="text-amber-400" />
                      Leaderboard Standings
                    </button>
                  </div>
                </div>

                {/* Score & Stamp Summary Badge */}
                <div className="p-4 glass rounded-2xl border border-white/10 flex items-center gap-4 bg-black/40">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-indigo-600/30 flex items-center justify-center border border-amber-400/30 text-amber-300 font-black text-xl font-mono">
                    {selectedPassport.total_points}
                  </div>
                  <div className="text-left space-y-1">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Awarded Stamps</div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/30 flex items-center gap-1.5">
                        <GoldStampBadge size={16} />
                        <span>{Object.values(selectedPassport.stamps || {}).filter(s => s === 'gold').length} Gold</span>
                      </span>
                      <span className="px-2.5 py-1 bg-slate-400/20 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-400/30 flex items-center gap-1.5">
                        <SilverStampBadge size={16} />
                        <span>{Object.values(selectedPassport.stamps || {}).filter(s => s === 'silver').length} Silver</span>
                      </span>
                      <span className="px-2.5 py-1 bg-amber-700/20 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-700/30 flex items-center gap-1.5">
                        <BronzeStampBadge size={16} />
                        <span>{Object.values(selectedPassport.stamps || {}).filter(s => s === 'bronze').length} Bronze</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MEMBERS ROSTER (Optional if present) */}
              {selectedPassport.members && selectedPassport.members.length > 0 && (
                <div className="my-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-2">
                      <Users size={14} /> SQUAD MEMBERS ROSTER ({selectedPassport.members.length} VERIFIED)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPassport.members.map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className="p-4 glass rounded-xl border border-white/5 bg-black/40 hover:border-indigo-500/40 transition-all flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs text-indigo-300 shrink-0">
                          0{idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate">{member.name}</div>
                          {member.enrollment_no && (
                            <div className="text-[10px] text-indigo-300 font-mono mt-0.5 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md inline-block">
                              {member.enrollment_no}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5 TASKS DIGITAL PASSPORT STAMPS GRID */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-white font-sans flex items-center gap-2">
                      <Award size={18} className="text-amber-400" /> DIGITAL PASSPORT STAMPS (5 TASKS)
                    </h3>
                    <p className="text-xs text-gray-400 font-light">
                      Each completed task earns a Gold (+10 pts), Silver (+7 pts), or Bronze (+5 pts) stamp assigned by NEURØN organizers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {OFFICIAL_PASSPORT_TASKS.map((task, index) => {
                    const stampTier = selectedPassport.stamps ? selectedPassport.stamps[task.id] : null;
                    const IconComponent = TASK_ICONS[task.iconName || 'Cpu'] || Cpu;

                    return (
                      <div
                        key={task.id}
                        className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                          stampTier === 'gold'
                            ? 'glass bg-gradient-to-b from-amber-500/15 to-black/60 border-amber-400/50 shadow-lg shadow-amber-500/10'
                            : stampTier === 'silver'
                            ? 'glass bg-gradient-to-b from-slate-400/15 to-black/60 border-slate-300/40 shadow-lg shadow-slate-400/10'
                            : stampTier === 'bronze'
                            ? 'glass bg-gradient-to-b from-amber-700/15 to-black/60 border-amber-600/40 shadow-lg shadow-amber-700/10'
                            : 'glass bg-black/30 border-white/5 opacity-80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10">
                              TASK 0{index + 1} • {task.category}
                            </span>
                            <IconComponent size={18} className="text-indigo-400" />
                          </div>

                          <h4 className="text-base font-bold text-white mb-1 leading-snug font-sans">
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-400 font-light leading-relaxed mb-4">
                            {task.description}
                          </p>
                        </div>

                        {/* STAMP EMBLEM */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-gray-500">Stamp Status:</span>

                          {stampTier === 'gold' && (
                            <m.div
                              whileHover={{ scale: 1.05 }}
                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs font-mono uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 border border-yellow-300"
                            >
                              <GoldStampBadge size={20} />
                              <span>GOLD STAMP (+10)</span>
                            </m.div>
                          )}

                          {stampTier === 'silver' && (
                            <m.div
                              whileHover={{ scale: 1.05 }}
                              className="px-4 py-2 bg-gradient-to-r from-slate-300 to-gray-400 text-black font-black text-xs font-mono uppercase tracking-widest rounded-xl shadow-lg shadow-slate-400/30 flex items-center gap-2 border border-white"
                            >
                              <SilverStampBadge size={20} />
                              <span>SILVER STAMP (+7)</span>
                            </m.div>
                          )}

                          {stampTier === 'bronze' && (
                            <m.div
                              whileHover={{ scale: 1.05 }}
                              className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 font-black text-xs font-mono uppercase tracking-widest rounded-xl shadow-lg shadow-amber-800/30 flex items-center gap-2 border border-amber-500/40"
                            >
                              <BronzeStampBadge size={20} />
                              <span>BRONZE STAMP (+5)</span>
                            </m.div>
                          )}

                          {!stampTier && (
                            <div className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-500 font-mono text-xs rounded-lg flex items-center gap-1.5">
                              <Lock size={12} />
                              <span>UNSTAMPED</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </m.div>
          ) : (
            <div className="glass p-12 text-center rounded-3xl border border-white/10 max-w-xl mx-auto space-y-4">
              <Shield size={48} className="mx-auto text-indigo-500/40" />
              <h3 className="text-xl font-bold font-sans">No Team Passport Selected</h3>
              <p className="text-xs text-gray-400">Search for a passport above or register a new team to begin.</p>
            </div>
          )}
        </div>
      )}

      {/* REGISTER TEAM TAB */}
      {activeTab === 'register' && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-12 rounded-[2.5rem] border border-indigo-500/30 max-w-xl mx-auto space-y-8 bg-gradient-to-b from-[#0a0c1a]/90 to-[#04050d]/90 shadow-2xl"
        >
          <div className="border-b border-white/10 pb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-3 border border-indigo-500/30">
              <Users size={12} /> PASSPORT INITIATION
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
              REGISTER TEAM
            </h2>
            <p className="text-xs text-gray-400 font-light mt-1">
              Enter your Team Name to issue your official NEURØN Digital Passport and unlock task stamps.
            </p>
          </div>

          <form onSubmit={handleRegisterTeam} className="space-y-6">
            {/* Team Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold block">
                TEAM NAME *
              </label>
              <input
                type="text"
                required
                value={regTeamName}
                onChange={(e) => setRegTeamName(e.target.value)}
                placeholder="e.g. Synthetix AI, Quantum Core, Neural Hackers..."
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !regTeamName.trim()}
              className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 text-center min-h-[52px]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin shrink-0" />
                  <span>Generating Team Digital Passport...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} className="shrink-0" />
                  <span>Issue Team Digital Passport</span>
                </>
              )}
            </button>
          </form>
        </m.div>
      )}

      {/* TOP 3 LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-12 max-w-5xl mx-auto">
          {/* Top 3 Podiums */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase text-white font-sans tracking-tight">
              NEURØN CHAMPIONS <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">PODIUM</span>
            </h2>
            <p className="text-xs text-gray-400 font-light">
              Declared based on aggregate stamp points earned across all 5 core tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
            {/* 2nd Place Silver Podium */}
            {top2 ? (
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 rounded-3xl border border-slate-400/30 text-center relative overflow-hidden bg-gradient-to-b from-slate-400/10 to-black/80 order-2 md:order-1"
              >
                <div className="w-16 h-16 rounded-full bg-slate-400/20 border border-slate-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-400/20">
                  <SilverStampBadge size={44} />
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-widest">2nd Place Champion</div>
                <h3 className="text-2xl font-black text-white font-sans mt-1 uppercase">{top2.team_name}</h3>
                <div className="text-amber-400 font-mono font-bold text-lg mt-2">{top2.total_points} PTS</div>
                <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-gray-400 font-mono space-y-1">
                  <div>Passport: {top2.passport_code}</div>
                  <div>Members: {top2.members.length} Squad Members</div>
                </div>
              </m.div>
            ) : (
              <div className="glass p-8 text-center rounded-3xl border border-white/5 opacity-40 order-2 md:order-1 flex flex-col items-center gap-2">
                <SilverStampBadge size={36} />
                <span>2nd Place Pending</span>
              </div>
            )}

            {/* 1st Place Gold Podium (Highest elevation) */}
            {top1 ? (
              <m.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass p-8 rounded-3xl border-2 border-amber-400/60 text-center relative overflow-hidden bg-gradient-to-b from-amber-500/20 via-black/90 to-black shadow-2xl shadow-amber-500/20 order-1 md:order-2 md:-translate-y-4"
              >
                <div className="absolute top-3 right-3 px-3 py-1 bg-amber-400 text-black font-mono font-black text-[10px] uppercase rounded-full tracking-widest flex items-center gap-1">
                  <Flame size={12} className="fill-black" /> 1ST PLACE LEADER
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/40 border-2 border-yellow-200">
                  <GoldStampBadge size={56} />
                </div>
                <div className="text-xs font-mono text-amber-300 font-bold uppercase tracking-widest">Grand Gold Winner</div>
                <h3 className="text-3xl font-black text-white font-sans mt-1 uppercase tracking-tight">{top1.team_name}</h3>
                <div className="text-amber-300 font-mono font-black text-2xl mt-2">{top1.total_points} POINTS</div>
                <div className="mt-4 pt-4 border-t border-amber-400/20 text-xs text-gray-300 font-mono space-y-1">
                  <div>Passport: {top1.passport_code}</div>
                  <div>Members: {top1.members.map(m => m.name).join(', ')}</div>
                </div>
              </m.div>
            ) : (
              <div className="glass p-8 text-center rounded-3xl border border-white/5 opacity-40 order-1 md:order-2 flex flex-col items-center gap-2">
                <GoldStampBadge size={44} />
                <span>1st Place Pending</span>
              </div>
            )}

            {/* 3rd Place Bronze Podium */}
            {top3 ? (
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 rounded-3xl border border-amber-700/40 text-center relative overflow-hidden bg-gradient-to-b from-amber-800/10 to-black/80 order-3 md:order-3"
              >
                <div className="w-16 h-16 rounded-full bg-amber-800/30 border border-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-800/20">
                  <BronzeStampBadge size={44} />
                </div>
                <div className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest">3rd Place Champion</div>
                <h3 className="text-2xl font-black text-white font-sans mt-1 uppercase">{top3.team_name}</h3>
                <div className="text-amber-400 font-mono font-bold text-lg mt-2">{top3.total_points} PTS</div>
                <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-gray-400 font-mono space-y-1">
                  <div>Passport: {top3.passport_code}</div>
                  <div>Members: {top3.members.length} Squad Members</div>
                </div>
              </m.div>
            ) : (
              <div className="glass p-8 text-center rounded-3xl border border-white/5 opacity-40 order-3 md:order-3 flex flex-col items-center gap-2">
                <BronzeStampBadge size={36} />
                <span>3rd Place Pending</span>
              </div>
            )}
          </div>

          {/* Full Leaderboard Table */}
          <div className="glass rounded-3xl border border-white/10 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold font-sans uppercase tracking-wider text-white">Full Squad Rankings</h3>
                <p className="text-xs text-gray-400">Click on any team row to inspect their digital stamp passport and member breakdown.</p>
              </div>
              {myTeamCode && (
                <button
                  onClick={() => {
                    const found = passports.find(p => p.passport_code === myTeamCode);
                    if (found) {
                      setSelectedPassport(found);
                      setSearchCode(found.passport_code);
                      setActiveTab('view');
                    } else {
                      toast.error('Saved team passport not found.');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-amber-400 text-black font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all"
                >
                  <Star size={14} className="fill-black" />
                  View My Squad Passport
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4">Passport Code</th>
                    <th className="py-3 px-4 text-center">Stamps Breakdown</th>
                    <th className="py-3 px-4 text-right">Total Score</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-sans">
                  {sortedLeaderboard.map((team, idx) => {
                    const goldCount = Object.values(team.stamps || {}).filter(s => s === 'gold').length;
                    const silverCount = Object.values(team.stamps || {}).filter(s => s === 'silver').length;
                    const bronzeCount = Object.values(team.stamps || {}).filter(s => s === 'bronze').length;
                    const isMySquad = myTeamCode === team.passport_code;

                    return (
                      <tr
                        key={team.id}
                        className={`transition-colors ${
                          isMySquad
                            ? 'bg-amber-500/15 hover:bg-amber-500/20 border-l-4 border-l-amber-400'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-gray-300">
                          {idx === 0 ? (
                            <span className="flex items-center gap-1.5 text-amber-300">
                              <GoldStampBadge size={18} /> #1
                            </span>
                          ) : idx === 1 ? (
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <SilverStampBadge size={18} /> #2
                            </span>
                          ) : idx === 2 ? (
                            <span className="flex items-center gap-1.5 text-amber-600">
                              <BronzeStampBadge size={18} /> #3
                            </span>
                          ) : (
                            <span>#{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            {isMySquad ? (
                              <button
                                onClick={() => {
                                  setSelectedPassport(team);
                                  setSearchCode(team.passport_code);
                                  setActiveTab('view');
                                }}
                                className="hover:text-amber-400 transition-colors text-left font-bold text-amber-300"
                              >
                                {team.team_name}
                              </button>
                            ) : (
                              <span className="text-white font-bold">{team.team_name}</span>
                            )}
                            {isMySquad && (
                              <span className="px-2 py-0.5 bg-amber-400 text-black text-[9px] font-mono font-black rounded uppercase tracking-wider shadow">
                                YOUR SQUAD
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-indigo-400">{team.passport_code}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">{goldCount} G</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-400/20 text-slate-300 font-bold">{silverCount} S</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-800/20 text-amber-500 font-bold">{bronzeCount} B</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-amber-400 text-base">
                          {team.total_points} PTS
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isMySquad ? (
                            <button
                              onClick={() => {
                                setSelectedPassport(team);
                                setSearchCode(team.passport_code);
                                setActiveTab('view');
                              }}
                              className="px-3 py-1 bg-amber-400 text-black font-mono font-bold text-xs rounded-lg transition-all shadow hover:bg-amber-300"
                            >
                              View My Squad →
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-gray-500 flex items-center justify-end gap-1">
                              <Lock size={12} className="text-gray-500" />
                              Private
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassportPage;
