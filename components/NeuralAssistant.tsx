import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Sparkles, Bot, User, ExternalLink, 
  Mic, MicOff, Volume2, VolumeX, Loader2 
} from 'lucide-react';
import { getNeuralResponse, NeuralResponse, MessageHistory } from '../services/ai.ts';
import { GoogleGenAI, Modality } from '@google/genai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { uri: string; title: string }[];
}

const NeuralAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Greetings. I am the NEURØN Neural Assistant. How can I assist your evolution today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Audio Decoding Logic
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const encodePCM = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startLiveSession = async () => {
    try {
      setIsLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Simple volume analysis for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setAudioLevel(Math.sqrt(sum / inputData.length));

              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    data: encodePCM(inputData),
                    mimeType: 'audio/pcm;rate=16000'
                  }
                });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
            setIsLiveActive(true);
            setIsLoading(false);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const bytes = decodeBase64(audioData);
              const buffer = await decodeAudioData(bytes, outputCtx);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              const startTime = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are the NEURØN Neural Assistant. Engage in a natural voice conversation with the user. Keep responses concise and cybernetic."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Live Link Failure:", err);
      setIsLoading(false);
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsLiveActive(false);
    setIsVoiceMode(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

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
    setIsLoading(false);
  };

  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      setIsVoiceMode(true);
      startLiveSession();
    } else {
      stopLiveSession();
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
                    {isLiveActive ? 'Live Audio Channel' : 'Grounded Link Active'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleVoiceMode}
                  className={`transition-colors ${isVoiceMode ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {isLiveActive ? <Volume2 size={18} /> : <Mic size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {isVoiceMode ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <div className="relative mb-12">
                     <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-indigo-500 blur-3xl rounded-full"
                     />
                     <div className="relative flex items-end gap-1 h-12">
                        {[1,2,3,4,5,6].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: isLiveActive ? [10, 40, 15, 30, 10] : 4 }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                            className="w-1.5 bg-indigo-500 rounded-full"
                          />
                        ))}
                     </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Neural Voice Active</h3>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    {isLiveActive ? "Listening for your query... Speak naturally." : "Establishing audio bridge..."}
                  </p>
                  <button 
                    onClick={stopLiveSession}
                    className="mt-12 px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Disconnect Link
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                          msg.role === 'user' ? 'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
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
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
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