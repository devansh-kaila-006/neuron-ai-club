
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

/**
 * RouteChangeHandler: Forces a 2-second synchronization delay on every navigation
 */
const RouteChangeHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        setCurrentPath(location.pathname);
        setIsSyncing(false);
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentPath]);

  return (
    <>
      <AnimatePresence>
        {isSyncing && <NeuralPageLoader />}
      </AnimatePresence>
      <div className={isSyncing ? 'hidden' : 'block'}>
        {children}
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [showLegal, setShowLegal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Lock body scroll while loading
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
              <Suspense fallback={<NeuralPageLoader />}>
                <RouteChangeHandler>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/hackathon" element={<Hackathon />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </RouteChangeHandler>
              </Suspense>
            </main>
            
            <NeuralAssistant />
            
            <footer className="relative z-20 py-16 px-6 border-t border-white/5 bg-[#030303]/60 backdrop-blur-md">
              <div className="max-w-7xl mx-auto text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                  <div className="col-span-1 text-left">
                    <div className="text-2xl font-bold tracking-tighter mb-4 font-mono text-indigo-500">NEURØN</div>
                    <p className="text-sm text-gray-500">The premier AI research and innovation student collective at Amrita Vishwa Vidyapeetham.</p>
                  </div>
                  <div className="flex justify-center md:justify-start gap-12">
                    <div className="flex flex-col gap-3 text-left">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Grid Navigation</p>
                      <Link to="/" className="text-xs text-gray-600 hover:text-indigo-400">Hub Hub</Link>
                      <Link to="/hackathon" className="text-xs text-gray-600 hover:text-indigo-400">TALOS 2026</Link>
                      <Link to="/team" className="text-xs text-gray-600 hover:text-indigo-400">The Core Council</Link>
                    </div>
                    <div className="flex flex-col gap-3 text-left">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">System Links</p>
                      <Link to="/register" className="text-xs text-gray-600 hover:text-indigo-400">Registry Manifest</Link>
                      <button onClick={() => setShowLegal(true)} className="text-left text-xs text-gray-600 hover:text-indigo-400">Legal Manifest</button>
                      <Link to="/admin" className="text-xs text-gray-600 hover:text-indigo-400">Terminal Access</Link>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-4">
                    <div className="p-4 glass border-white/5 rounded-2xl max-w-[220px]">
                      <p className="text-[8px] uppercase tracking-tighter text-gray-500 mb-1">Neural Connection</p>
                      <div className="flex items-center gap-2 text-[10px] text-green-500 font-mono">
                        <Shield size={12} /> SECURE GATEWAY ACTIVE
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-[9px] text-gray-700 font-mono uppercase tracking-[0.2em]">
                  <p>© 2026 NEURØN CORE UNIT | ALL RIGHTS RESERVED</p>
                  <p>Designed for the next generation of synthetic intelligence</p>
                </div>
              </div>
            </footer>

            <AnimatePresence>
              {showLegal && (
                /* @ts-ignore - Fixing framer-motion type mismatch */
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
