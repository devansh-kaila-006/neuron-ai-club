
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Sparkles, Bot, User, ExternalLink, 
  Mic, MicOff, Volume2, VolumeX, Loader2, ShieldAlert 
} from 'lucide-react';
import { getNeuralResponse, NeuralResponse, MessageHistory } from '../services/ai.ts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { uri: string; title: string }[];
}

const NeuralAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Greetings. I am the NEURØN Neural Assistant. How can I assist your evolution today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history: MessageHistory[] = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const result: NeuralResponse = await getNeuralResponse(userMsg, history);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.text,
        sources: result.sources 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Neural Uplink Failure: The gateway is currently shielded or offline." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass w-80 md:w-96 h-[500px] mb-4 rounded-3xl border-indigo-500/30 overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-4 bg-indigo-600/20 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">Neural Assistant</p>
                  <p className="text-[10px] text-indigo-400 font-mono uppercase">
                    Secure Edge Tunnel Active
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {isVoiceMode ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <ShieldAlert className="text-amber-500 mb-4" size={48} />
                  <h3 className="text-lg font-bold mb-2">Voice Shield Active</h3>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    Direct browser-to-neural audio channels are disabled to prevent API key exposure. 
                    Upgrade to Secure Relay v2 for encrypted voice.
                  </p>
                  <button 
                    onClick={() => setIsVoiceMode(false)}
                    className="mt-8 px-6 py-2 glass rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-400"
                  >
                    Return to Text Manifest
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          msg.role === 'user' ? 'bg-purple-600' : 'bg-indigo-600'
                        }`}>
                          {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-1">
                              {msg.sources.slice(0, 3).map((s, idx) => (
                                <a 
                                  key={idx} 
                                  href={s.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-white bg-indigo-500/5 border border-indigo-500/20 px-2 py-1 rounded-full transition-colors"
                                >
                                  <ExternalLink size={10} /> {s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                        <Loader2 className="animate-spin text-indigo-500" size={14} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isVoiceMode && (
              <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about AI or TALOS..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs outline-none focus:border-indigo-500 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button 
                      onClick={() => setIsVoiceMode(true)}
                      className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors"
                    >
                      <Mic size={14} />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400/30 no-print"
      >
        <MessageSquare size={28} />
      </motion.button>
    </div>
  );
};

export default NeuralAssistant;
