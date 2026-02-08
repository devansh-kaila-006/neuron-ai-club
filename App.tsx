import React, { useState, Suspense, lazy, useEffect } from 'react';
// @ts-ignore - Fixing react-router-dom member export false positive
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import NeuralAssistant from './components/NeuralAssistant.tsx';
import NeuralBackground from './components/NeuralBackground.tsx';
import NeuralLoader from './components/NeuralLoader.tsx';
import NeuralPageLoader from './components/NeuralPageLoader.tsx';
import ProductionErrorBoundary from './components/ProductionErrorBoundary.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import ToastContainer from './components/ToastContainer.tsx';
import { Shield, X, Scale, Lock, RefreshCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy loaded page components
const Home = lazy(() => import('./pages/Home.tsx'));
const Team = lazy(() => import('./pages/Team.tsx'));
const Hackathon = lazy(() => import('./pages/Hackathon.tsx'));
const Register = lazy(() => import('./pages/Register.tsx'));
const Admin = lazy(() => import('./pages/Admin.tsx'));
const JoinClub = lazy(() => import('./pages/JoinClub.tsx'));
const Departments = lazy(() => import('./pages/Departments.tsx'));

/**
 * RouteChangeHandler: Orchestrates path transitions with a non-blocking neural scan.
 * Unified with Suspense to prevent placeholder flickering during lazy loading.
 */
const RouteChangeHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastPath, setLastPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== lastPath) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        setLastPath(location.pathname);
        setIsSyncing(false);
      }, 600); // Optimized for feel vs visual feedback
      return () => clearTimeout(timer);
    }
  }, [location.pathname, lastPath]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isSyncing && <NeuralPageLoader />}
      </AnimatePresence>
      <div className={`transition-all duration-700 ${isSyncing ? 'blur-sm saturate-0' : 'blur-0 saturate-100'}`}>
        <Suspense fallback={<NeuralPageLoader />}>
          {children}
        </Suspense>
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [showLegal, setShowLegal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Lock body scroll while initial loading sequence is active
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLoading]);

  return (
    <ProductionErrorBoundary>
      <ToastProvider>
        <Router>
          <div className="min-h-screen text-white relative bg-[#050505]">
            <AnimatePresence mode="wait">
              {isLoading && (
                <NeuralLoader onComplete={() => setIsLoading(false)} />
              )}
            </AnimatePresence>

            <NeuralBackground />
            <Navbar />
            <ToastContainer />
            
            <main className="relative z-10 bg-transparent min-h-[80vh]">
              <RouteChangeHandler>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/hackathon" element={<Hackathon />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/join" element={<JoinClub />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/departments" element={<Departments />} />
                </Routes>
              </RouteChangeHandler>
            </main>
            
            <NeuralAssistant />
            
            <footer className="relative z-20 py-16 px-6 border-t border-white/5 bg-[#030303]/90 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                  <div className="col-span-1 text-left">
                    <div className="text-2xl font-bold tracking-tighter mb-4 font-mono text-indigo-500">NEURØN</div>
                    <p className="text-sm text-gray-500 font-light">The flagship Artificial Intelligence Community of Practice at Amrita Vishwa Vidyapeetham.</p>
                  </div>
                  
                  {/* Navigation & Sketch Group - Span 2 columns to allow the image more horizontal freedom */}
                  <div className="md:col-span-2 flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-12 items-start relative">
                    <div className="flex flex-col gap-3 text-left">
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Grid Navigation</p>
                      <Link to="/" className="text-xs text-gray-600 hover:text-indigo-400">Hub Hub</Link>
                      <Link to="/hackathon" className="text-xs text-gray-600 hover:text-indigo-400">TALOS 2026</Link>
                      <Link to="/departments" className="text-xs text-gray-600 hover:text-indigo-400">Squad Divisions</Link>
                      <Link to="/team" className="text-xs text-gray-600 hover:text-indigo-400">The Core Council</Link>
                      <Link to="/join" className="text-xs text-gray-600 hover:text-indigo-400 font-bold text-indigo-400">Join the Club</Link>
                    </div>
                    
                    <div className="flex flex-col gap-3 text-left">
                      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">System Links</p>
                      <Link to="/register" className="text-xs text-gray-600 hover:text-indigo-400">Registry Manifest</Link>
                      <button onClick={() => setShowLegal(true)} className="text-left text-xs text-gray-600 hover:text-indigo-400">Legal Manifest</button>
                      <Link to="/admin" className="text-xs text-gray-600 hover:text-indigo-400">Terminal Access</Link>
                    </div>

                    {/* Architectural Blueprint Component - Further Right, Reduced Size, White Glow */}
                    <div className="flex items-center self-center ml-auto md:ml-48 opacity-80 hover:opacity-100 transition-all duration-1000 pointer-events-none select-none relative group/blueprint min-w-[200px] md:min-w-[360px] min-h-[120px] md:min-h-[220px]">
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotateY: [-3, 3, -3],
                          rotateX: [1, -1, 1]
                        }}
                        transition={{ 
                          duration: 12, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="relative w-full flex justify-end"
                      >
                        <img 
                          src="https://lh3.googleusercontent.com/d/1vdS01wW-7hwDaKG77TK4juDo4gW-FySb" 
                          alt="Amrita Infrastructure Manifest" 
                          className="h-36 md:h-60 lg:h-72 w-auto object-contain grayscale brightness-[2.5] contrast-[1.5] saturate-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-1000"
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {/* Scanning Line Effect - Subtle White */}
                        <motion.div 
                          animate={{ y: ['-5%', '105%', '-5%'] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-x-0 h-[1.5px] bg-white/40 blur-[2px] z-10"
                        />
                        {/* White Holographic Atmosphere */}
                        <motion.div 
                          animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.95, 1.05, 0.95] }}
                          transition={{ duration: 7, repeat: Infinity }}
                          className="absolute inset-0 bg-white/5 blur-[100px] rounded-full -z-10"
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="col-span-1 flex flex-col items-center md:items-end gap-4">
                    <div className="p-4 glass border-white/5 rounded-2xl max-w-[220px]">
                      <p className="text-[8px] uppercase tracking-tighter text-gray-500 mb-1">Neural Connection</p>
                      <div className="flex items-center gap-2 text-[10px] text-green-500 font-mono">
                        <Shield size={12} /> SECURE GATEWAY ACTIVE
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[9px] text-gray-800 font-mono uppercase tracking-[0.2em]">
                  <p>© 2026 NEURØN CORE UNIT | ALL RIGHTS RESERVED</p>
                  <p>Designed for the next generation of synthetic intelligence</p>
                </div>
              </div>
            </footer>

            <AnimatePresence>
              {showLegal && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="fixed inset-0 z-[1000] flex items-center justify-center px-6 bg-black/90 backdrop-blur-2xl overflow-y-auto"
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    className="glass w-full max-w-2xl p-8 md:p-12 rounded-[2.5rem] relative my-10 border-indigo-500/20 shadow-2xl"
                  >
                    <button onClick={() => setShowLegal(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
                    <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                      <Scale className="text-indigo-500" size={32} />
                      <h2 className="text-3xl font-bold uppercase tracking-widest font-mono">NEURAL MANIFEST</h2>
                    </div>
                    
                    <div className="space-y-10 text-xs text-gray-400 leading-relaxed font-light">
                      <section>
                        <div className="flex items-center gap-2 mb-3"><Lock className="text-indigo-400" size={14} /><h3 className="text-white font-bold uppercase tracking-widest">Privacy Protocol</h3></div>
                        <p>NEURØN handles Personally Identifiable Information (PII) as high-security assets. Data is purged 60 days post-event unless explicitly opted into the communication grid.</p>
                      </section>
                      <section>
                        <div className="flex items-center gap-2 mb-3"><Shield size={14} className="text-indigo-400" /><h3 className="text-white font-bold uppercase tracking-widest">Participation Standards</h3></div>
                        <p>Registration implies adherence to the Amrita Ethics Framework. NEURØN reserves the right to de-authorize any squad engaged in plagiarism.</p>
                      </section>
                      <section>
                        <div className="flex items-center gap-2 mb-3"><RefreshCcw className="text-indigo-400" size={14} /><h3 className="text-white font-bold uppercase tracking-widest">Refund Policy</h3></div>
                        <p>Registry fees are applied to compute allocations. Refunds are only authorized if the TALOS event is cancelled by the CORE unit.</p>
                      </section>
                    </div>
                    
                    <button onClick={() => setShowLegal(false)} className="w-full mt-12 py-5 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl">
                      Acknowledge & Synchronize
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Router>
      </ToastProvider>
    </ProductionErrorBoundary>
  );
};

export default App;