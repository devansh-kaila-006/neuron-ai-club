
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, ChevronRight, Zap, Shield, Cpu, Activity, Search, Globe, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNeuralResponse } from '../services/ai.ts';
import { storage } from '../lib/storage.ts';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'ai' | 'header';
  content: React.ReactNode;
  timestamp: string;
}

const COMMANDS = ['help', 'ls', 'goto', 'whoami', 'talos', 'assistant', 'query', 'clear', 'sudo hack', 'exit', 'neofetch', 'stats', 'scan', 'history'];

const CoreTerminal: React.FC = () => {
  const m = motion as any;
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime] = useState(Date.now());
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect phone/mobile devices to hide the terminal
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addLine = useCallback((content: React.ReactNode, type: TerminalLine['type'] = 'output') => {
    setHistory(prev => [...prev, {
      content,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }].slice(-100));
  }, []);

  const bootSequence = useCallback(async () => {
    if (history.length > 0) return; // Don't reboot if history exists
    setHistory([]);
    addLine('NEURAL_KERNEL_V5.2.0 INITIALIZING...', 'system');
    await new Promise(r => setTimeout(r, 300));
    addLine('DECRYPTING OPERATIONAL DIRECTIVES...', 'system');
    await new Promise(r => setTimeout(r, 200));
    addLine('ESTABLISHING UPLINK TO AMRITA_HUB...', 'system');
    await new Promise(r => setTimeout(r, 400));
    addLine('UPLINK STABLE. WELCOME, OPERATOR.', 'success');
    addLine('TYPE "help" FOR AVAILABLE COMMANDS.', 'system');
  }, [addLine, history.length]);

  useEffect(() => {
    if (isOpen && !isMobile) {
      bootSequence();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, bootSequence, isMobile]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isMobile) return;

    const handleKeydown = (e: KeyboardEvent) => {
      // Toggle with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      // Open with '/' or '~'
      if ((e.key === '/' || e.key === '`') && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.trim().toLowerCase();
      const match = COMMANDS.find(c => c.startsWith(partial));
      if (match) setInput(match);
    }
  };

  const processCommand = async (cmd: string) => {
    const cleanCmd = cmd.trim();
    if (!cleanCmd) return;

    setCommandHistory(prev => [...prev, cleanCmd]);
    setHistoryIndex(-1);
    
    const args = cleanCmd.toLowerCase().split(' ');
    const baseCmd = args[0];

    addLine(<span>operator@neuron:~# {cleanCmd}</span>, 'input');

    switch (baseCmd) {
      case 'help':
        addLine('NEURØN CORE SYSTEM COMMANDS:', 'header');
        addLine('  ls             - List available system nodes');
        addLine('  goto <node>    - Navigate to endpoint');
        addLine('  stats          - live registration metrics');
        addLine('  scan           - Execute network vulnerability sweep');
        addLine('  neofetch       - Display system specifications');
        addLine('  whoami         - User telemetry data');
        addLine('  talos          - Event status manifest');
        addLine('  assistant <q>  - Secure AI query interface');
        addLine('  history        - Show command log');
        addLine('  clear          - Flush terminal buffer');
        addLine('  exit           - Terminate session');
        addLine('SHORTCUTS:', 'header');
        addLine('  Cmd/Ctrl + K   - Toggle Terminal Hub');
        addLine('  / or ~         - Access Terminal from anywhere');
        addLine('  Tab            - Autocomplete command');
        addLine('  Arrows         - Browse command history');
        break;

      case 'ls':
        addLine('ACTIVE_ENDPOINTS:', 'header');
        addLine(
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-2">
            <span className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => navigate('/')}>/hub</span>
            <span className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => navigate('/departments')}>/squads</span>
            <span className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => navigate('/hackathon')}>/talos</span>
            <span className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => navigate('/register')}>/registry</span>
            <span className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => navigate('/join')}>/collective</span>
            <span className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => navigate('/team')}>/core</span>
            <span className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => navigate('/admin')}>/admin_gate</span>
          </div>
        );
        break;

      case 'stats':
        const metrics = await storage.getStats();
        const capacityPercent = Math.min(100, (metrics.paidTeams / 100) * 100);
        const barWidth = 20;
        const filled = Math.floor((capacityPercent / 100) * barWidth);
        const bar = '[' + '='.repeat(filled) + '>'.repeat(filled < barWidth ? 1 : 0) + ' '.repeat(Math.max(0, barWidth - filled - 1)) + ']';
        
        addLine('GRID_METRICS_LIVE:', 'header');
        addLine(`  REGISTRATIONS : ${metrics.totalTeams}`);
        addLine(`  CONFIRMED     : ${metrics.paidTeams}`);
        addLine(`  CHECKED_IN    : ${metrics.checkedIn}`);
        addLine(`  CAPACITY      : ${bar} ${capacityPercent.toFixed(1)}%`);
        addLine(`  REVENUE_GEN   : ₹${metrics.revenue.toLocaleString()}`);
        break;

      case 'neofetch':
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        addLine(
          <div className="flex gap-8 py-2">
            <pre className="text-indigo-500 font-black leading-none select-none">
{`      Ø
     ØØØ
    ØØØØØ
   ØØØØØØØ
    ØØØØØ
     ØØØ
      Ø`}
            </pre>
            <div className="space-y-0.5">
              <p><span className="text-indigo-400 font-bold">operator</span>@<span className="text-indigo-400 font-bold">neuron</span></p>
              <p>-----------------</p>
              <p><span className="text-indigo-400">OS</span>: NeuralOS 5.2.0 x86_64</p>
              <p><span className="text-indigo-400">Host</span>: Amrita_Node_AVV</p>
              <p><span className="text-indigo-400">Kernel</span>: 6.12.0-neuron-lts</p>
              <p><span className="text-indigo-400">Uptime</span>: {Math.floor(uptime/60)}m {uptime%60}s</p>
              <p><span className="text-indigo-400">Packages</span>: 2026 (talos)</p>
              <p><span className="text-indigo-400">Shell</span>: neuron-sh 1.0</p>
              <p><span className="text-indigo-400">CPU</span>: Core_I9_Neural (16) @ 5.2GHz</p>
              <p><span className="text-indigo-400">Memory</span>: 4096MiB / 16384MiB</p>
            </div>
          </div>
        );
        break;

      case 'scan':
        setIsProcessing(true);
        addLine('INITIALIZING NETWORK SCAN...', 'system');
        await new Promise(r => setTimeout(r, 600));
        addLine('0% [....................]', 'output');
        await new Promise(r => setTimeout(r, 400));
        addLine('35% [=======.............]', 'output');
        await new Promise(r => setTimeout(r, 500));
        addLine('68% [=============.......]', 'output');
        await new Promise(r => setTimeout(r, 300));
        addLine('100% [====================]', 'success');
        addLine('SCAN_COMPLETE. 4 NODES DETECTED.', 'success');
        addLine('  - talos-v5-edge (Active)');
        addLine('  - amrita-main-frame (Shielded)');
        addLine('  - razorpay-escrow (Secured)');
        addLine('  - google-neural-gateway (Uplink)');
        setIsProcessing(false);
        break;

      case 'goto':
      case 'cd':
        const target = args[1];
        const routes: Record<string, string> = {
          'hub': '/', 'home': '/', 'squads': '/departments', 'talos': '/hackathon',
          'registry': '/register', 'collective': '/join', 'core': '/team', 'admin': '/admin'
        };
        if (target && routes[target]) {
          addLine(`NAVIGATING TO ${target.toUpperCase()}...`, 'success');
          setTimeout(() => {
            navigate(routes[target]);
            setIsOpen(false);
          }, 600);
        } else {
          addLine(`ERROR: NODE "${target || ''}" NOT FOUND.`, 'error');
        }
        break;

      case 'whoami':
        addLine('TELEMETRY_LOG:', 'header');
        addLine(`  CLIENT_ID : ${Math.random().toString(36).substring(7).toUpperCase()}`);
        addLine(`  LOC_DATA  : 12.9716, 77.5946 (BENGALURU)`);
        addLine(`  PERMS     : LEVEL_3_OPERATOR`);
        addLine(`  UPLINK    : SECURED_VPN_TUNNEL`);
        break;

      case 'history':
        addLine('COMMAND_HISTORY:', 'header');
        commandHistory.forEach((h, i) => addLine(`  ${i + 1}  ${h}`));
        break;

      case 'assistant':
      case 'query':
        const query = args.slice(1).join(' ');
        if (!query) {
          addLine('ERROR: PROVIDE QUERY STRING.', 'error');
          break;
        }
        setIsProcessing(true);
        addLine('UPLINKING TO NEURAL_CORE...', 'system');
        try {
          const res = await getNeuralResponse(query);
          const cleanText = res.text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          addLine(`NEURØN: ${cleanText}`, 'ai');
        } catch (e) {
          addLine('ERROR: UPLINK TIMEOUT.', 'error');
        } finally {
          setIsProcessing(false);
        }
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'sudo':
        if (args[1] === 'hack') {
          addLine('ACCESSING KERNEL EXPLOIT...', 'error');
          document.body.style.filter = 'invert(1) hue-rotate(180deg) blur(2px)';
          setTimeout(() => {
            document.body.style.filter = '';
            addLine('CRITICAL_FAILURE: CORE_SECURITY_ACTIVE.', 'error');
            addLine('ADMIN_BYPASS_ATTEMPT_LOGGED.', 'error');
          }, 1500);
        } else {
          addLine('ERROR: INSUFFICIENT PERMISSIONS.', 'error');
        }
        break;

      case 'exit':
        setIsOpen(false);
        break;

      default:
        addLine(`COMMAND NOT RECOGNIZED: ${baseCmd}. TYPE "help" FOR MANUAL.`, 'error');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    const cmd = input;
    setInput('');
    processCommand(cmd);
  };

  // Completely remove component from rendering if on phone
  if (isMobile) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-8 z-[90] w-12 h-12 glass border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 hover:text-white hover:bg-indigo-600/20 transition-all shadow-xl group"
        title="Open Terminal (Cmd+K)"
      >
        <TerminalIcon size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
          >
            <m.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-4xl h-[600px] bg-[#050505] rounded-3xl border border-indigo-500/30 flex flex-col shadow-[0_0_120px_rgba(79,70,229,0.3)] overflow-hidden"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-indigo-500/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                  </div>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-gray-500">Core_Access_Terminal</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 border border-white/10 rounded font-mono text-[9px] text-gray-500">
                    <Command size={10} /> + K
                  </div>
                  <span className="text-[9px] font-mono text-indigo-500/40 uppercase hidden md:block">Session: {Math.floor((Date.now() - startTime)/1000)}s</span>
                  <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Terminal Content */}
              <div 
                ref={terminalRef}
                className="flex-1 overflow-y-auto p-6 font-mono text-xs md:text-sm space-y-2 selection:bg-indigo-500/30 custom-scrollbar scroll-smooth"
              >
                {history.map((line, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-gray-800 shrink-0 select-none hidden sm:block">[{line.timestamp}]</span>
                    <div className={`
                      break-all whitespace-pre-wrap flex-1
                      ${line.type === 'input' ? 'text-white font-bold' : ''}
                      ${line.type === 'header' ? 'text-indigo-500 font-bold border-b border-indigo-500/10 mb-1 pt-2' : ''}
                      ${line.type === 'system' ? 'text-indigo-400 opacity-80 italic' : ''}
                      ${line.type === 'success' ? 'text-green-500' : ''}
                      ${line.type === 'error' ? 'text-red-500' : ''}
                      ${line.type === 'ai' ? 'text-cyan-400 pl-4 border-l-2 border-cyan-400/20 bg-cyan-400/5 p-2 rounded-r-lg my-2' : ''}
                      ${line.type === 'output' ? 'text-gray-400' : ''}
                    `}>
                      {line.content}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex gap-4 animate-pulse">
                    <span className="text-gray-800 shrink-0 hidden sm:block">[{new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    <div className="text-indigo-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                      NEURAL_UPLINK_PROCESSING...
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="p-4 bg-indigo-500/5 border-t border-white/10 flex items-center gap-3">
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-indigo-500 font-bold">operator@neuron</span>
                  <span className="text-white/40">:</span>
                  <span className="text-cyan-400">~</span>
                  <span className="text-white/40">#</span>
                </div>
                <input 
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  className="w-full bg-transparent outline-none font-mono text-sm text-white placeholder:text-gray-800"
                  placeholder="Execute instruction (press tab for completion)..."
                  autoFocus
                />
                <div className="flex gap-2 items-center text-[8px] font-mono text-gray-700 uppercase tracking-widest hidden sm:flex">
                  <span className="px-1.5 py-0.5 border border-white/5 rounded">Enter</span>
                  <span className="opacity-40">Execute</span>
                </div>
              </form>

              {/* Status Bar */}
              <div className="px-6 py-2 bg-[#020202] border-t border-white/5 flex justify-between items-center text-[8px] font-mono">
                 <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-indigo-500/60 uppercase">
                       <Activity size={10} /> THREADS: 0x4
                    </div>
                    <div className="flex items-center gap-2 text-indigo-500/60 uppercase">
                       <Cpu size={10} /> LOAD: 14.2%
                    </div>
                    <div className="flex items-center gap-2 text-indigo-500/60 uppercase">
                       <Globe size={10} /> LATENCY: 24ms
                    </div>
                 </div>
                 <div className="text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={10} /> Authorized_Uplink // TALOS_NODE_01
                 </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CoreTerminal;
