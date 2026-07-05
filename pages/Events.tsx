import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import DecryptedText from '../components/DecryptedText.tsx';
import { 
  Calendar, MapPin, Users, Award, Sparkles, BookOpen, 
  Clock, Phone, ChevronRight, Share2, Terminal, Compass, 
  Zap, ArrowRight, Play, ExternalLink, HelpCircle, Flame
} from 'lucide-react';

// Import our beautiful moved images
// @ts-ignore
import event1_1 from '../events/event1_1.jpeg';
// @ts-ignore
import event1_2 from '../events/event1_2.jpeg';
// @ts-ignore
import event1_3 from '../events/event1_3.jpeg';
// @ts-ignore
import event2_1 from '../events/event2_1.jpeg';
// @ts-ignore
import event2_2 from '../events/event2_2.jpeg';
// @ts-ignore
import event2_3 from '../events/event2_3.jpeg';
// @ts-ignore
import event2_4 from '../events/event2_4.jpeg';
// @ts-ignore
import event3_1 from '../events/event3_1.jpeg';
// @ts-ignore
import event3_2 from '../events/event3_2.jpeg';
// @ts-ignore
import event3_3 from '../events/event3_3.jpeg';

interface EventType {
  id: string;
  title: string;
  tagline: string;
  category: 'Summit' | 'Launch' | 'Competition';
  date: string;
  time: string;
  venue: string;
  featuredImage: string;
  gallery: string[];
  description: string;
  keyTakeaways?: string[];
  highlights?: string[];
  workshops?: { title: string; host: string; desc: string }[];
  contacts?: { name: string; phone: string }[];
  regLink?: string;
  meta: string;
  badgeColor: string;
}

const eventsData: EventType[] = [
  {
    id: 'summit-atmanirbhar',
    title: 'AI for Atmanirbhar Bharat',
    tagline: 'Inaugural Pre-Summit & Flagship NEURØN AI Club Launch',
    category: 'Summit',
    date: 'March 2026',
    time: 'Pre-Summit Sessions',
    venue: 'Amrita Vishwa Vidyapeetham, Bengaluru Campus',
    featuredImage: event1_1,
    gallery: [
      event1_1,
      event1_2,
      event1_3
    ],
    description: 'Stepping into the Amrita Vishwa Vidyapeetham, Bengaluru Campus as Chief Guest for the AI for Atmanirbhar Bharat pre-summit, part of India AI Impact 2026, was a truly humbling experience. Looking at the bright, eager faces in the audience reminded us why SeedlingLabs Private Limited began - to create spaces where curiosity meets courage and ideas find the confidence to grow.\n\nOur heartfelt thanks to Manoj P (Ph.D.) – Dean, Amrita School of Business & Campus Director, Bengaluru, and Sudhir Kumar Patnaik PhD – Professor & Centre Director, Corporate & Industry Relations, for graciously hosting us and inaugurating the new AI Club. The energy on campus reaffirmed our belief that India’s AI future is being shaped at institutions like these.',
    keyTakeaways: [
      'Stay grounded like a seed, but realise your true potential by growing and reaching for the stars.',
      'AI innovation is ultimately an expression of human intelligence. The tools are powerful, but it is people who give them purpose.',
      'Three thoughts for the future: Dream big, stay curious, and remain humble.'
    ],
    highlights: [
      'Inauguration of the NEURØN AI Club',
      'Chief Guest address on Digital Public Infrastructure & SeedlingLabs Journey',
      'Interactive sessions with final-year engineering students'
    ],
    meta: 'SUMMIT_SYS_INIT',
    badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5'
  },
  {
    id: 'neuron-unbox',
    title: 'NEURØN’s Unbox Event',
    tagline: 'Inauguration, Club Launch & Tech Workshops',
    category: 'Launch',
    date: '26th March 2026',
    time: '9:00 AM – 3:40 PM',
    venue: 'Amriteshwari Hall & CSE Labs',
    featuredImage: event2_1,
    gallery: [
      event2_1,
      event2_2,
      event2_3,
      event2_4
    ],
    description: 'The official flagship launch event of the Neuron AI Club featured Dr. Pramod Varma—Co-Founder & Chief Architect of India’s Digital Public Infrastructure (Aadhaar, UPI, Beckn)—as the Chief Guest. This grand unboxing marked the beginning of a synthetic intelligence revolution on campus, bringing industry leaders and student innovators together under one grid.',
    highlights: [
      'Inaugural Ceremony by Dr. Pramod Varma',
      'Official Neuron Club Introduction & Ecosystem Reveal',
      'Interactive Panel Discussion on Digital Public Infrastructure & Sovereign AI'
    ],
    workshops: [
      { title: 'NSDC — Bug to Breach', host: 'Cyber Security Unit', desc: 'A thrilling dive into AI-assisted vulnerability testing, penetration testing vectors, and defensive shielding.' },
      { title: 'ACE — AI Retrofit', host: 'Advanced Code Engineering', desc: 'Refitting legacy structures with modern transformer models, local model orchestration, and token optimization.' },
      { title: 'ACROM — AI-Integrated Robotics', host: 'Robotics & 3D Printing Lab', desc: 'Showcase of 3D-printed synthetic kinetic limbs guided by real-time computer vision models.' },
      { title: 'JIDO — AI Automata', host: 'Autonomous Systems Unit', desc: 'Building multi-agent task loops, autonomous triggers, and stateful workflow assistants.' }
    ],
    regLink: 'https://docs.google.com/forms/d/1vd-1d4kZpvvq-YoaMGKh2_RoM05x0afyBSqirPTEgT4/edit',
    meta: 'SYSTEM_UNBOX_INIT',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'
  },
  {
    id: 'com-ai-cal-escape',
    title: 'comAIcal Escape',
    tagline: 'Build Stories with AI — A Gamified Storytelling Challenge',
    category: 'Competition',
    date: '21st April 2026',
    time: '1:30 PM – 3:30 PM',
    venue: 'CSE Lab 1 (5th Floor, E Block)',
    featuredImage: event3_1,
    gallery: [
      event3_1,
      event3_2,
      event3_3
    ],
    description: 'We all use AI tools - but what if you could turn that into a story that actually means something? comAIcal Escape is a highly gamified AI storytelling event where you don’t just create, you earn your narrative assets. Solve logical algorithms, unlock mystery spins, and weave your graphic comic masterwork using state-of-the-art visual models.',
    highlights: [
      'Crack AI-based challenges to unlock characters, settings, and twists',
      'Spin the structural wheels to obtain unpredictable conflict mechanics',
      'Pitch your creations to a jury; top comics printed & preserved in the college library'
    ],
    contacts: [
      { name: 'Tanay Ashish', phone: '8210160750' },
      { name: 'Prajukta', phone: '7008756533' }
    ],
    regLink: 'https://forms.gle/LCmBwCjnwSa3YUy9A',
    meta: 'COMIC_STORY_ENG',
    badgeColor: 'border-pink-500/30 text-pink-400 bg-pink-500/5'
  }
];

const Events: React.FC = () => {
  const m = motion as any;
  const [activeTab, setActiveTab] = useState<'All' | 'Summit' | 'Launch' | 'Competition'>('All');
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const openEventModal = (event: EventType) => {
    setSelectedEvent(event);
    setActiveImage(event.featuredImage);
  };

  // Interactive Spin Wheel State for comAIcal Escape Playground
  const [wheelState, setWheelState] = useState({
    protagonist: '?',
    genre: '?',
    conflict: '?',
    aiConcept: '?',
    spinning: false
  });

  const spinStoryWheel = () => {
    if (wheelState.spinning) return;
    
    setWheelState(prev => ({ ...prev, spinning: true }));
    
    const protagonists = ['Synthetic Detective', 'Neural Botanist', 'Time-Looping Intern', 'Legacy Chatbot', 'Quantum Archivist'];
    const genres = ['Cyberpunk Noir', 'Solarpunk Mythos', 'Retro-Futuristic Mystery', 'Deep Space Satire', 'Steampunk Rebellion'];
    const conflicts = ['Stray Memory Leak', 'Rogue Feedback Loop', 'Sentient Neural Grid', 'Corrupted Training Data', 'Timeline Anomaly'];
    const concepts = ['RAG (Retrieval-Augmented Gen)', 'Generative Adversarial Nets', 'RLHF (Feedback Training)', 'Zero-Shot Inference', 'Multimodal Synth'];

    let cycles = 0;
    const interval = setInterval(() => {
      setWheelState({
        protagonist: protagonists[Math.floor(Math.random() * protagonists.length)],
        genre: genres[Math.floor(Math.random() * genres.length)],
        conflict: conflicts[Math.floor(Math.random() * conflicts.length)],
        aiConcept: concepts[Math.floor(Math.random() * concepts.length)],
        spinning: true
      });
      cycles++;
      if (cycles > 15) {
        clearInterval(interval);
        setWheelState({
          protagonist: protagonists[Math.floor(Math.random() * protagonists.length)],
          genre: genres[Math.floor(Math.random() * genres.length)],
          conflict: conflicts[Math.floor(Math.random() * conflicts.length)],
          aiConcept: concepts[Math.floor(Math.random() * concepts.length)],
          spinning: false
        });
      }
    }, 100);
  };

  const filteredEvents = activeTab === 'All' 
    ? eventsData 
    : eventsData.filter(e => e.category === activeTab);

  return (
    <div className="pt-32 min-h-screen px-6 pb-40 bg-transparent relative overflow-hidden">
      {/* Aesthetic Cybernetic Ambient Lights */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-20">
        {/* Page Header */}
        <header className="space-y-4 text-left">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
          >
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Neural Timeline</span>
          </m.div>

          <div className="flex flex-col">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] text-white flex flex-col select-none uppercase">
              <span className="block text-gray-500">GRID</span>
              <DecryptedText 
                text="EVENTS" 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic"
              />
            </h1>
            <p className="mt-6 text-gray-500 text-sm md:text-base max-w-xl font-light leading-relaxed">
              Tracking completed operations, pre-summits, and gamified AI hackathons hosted by the NEURØN team at Amrita.
            </p>
          </div>
        </header>

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap gap-3 border-b border-white/5 pb-6">
          {(['All', 'Summit', 'Launch', 'Competition'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500' 
                  : 'glass border-white/5 text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Events Grid / Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {filteredEvents.map((event, index) => (
            <m.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col group hover:border-white/10 hover:bg-white/[0.01] transition-all duration-500 relative"
            >
              {/* Highlight badge */}
              <div className="absolute top-6 left-6 z-20">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${event.badgeColor}`}>
                  {event.category}
                </span>
              </div>

              {/* Cover Image */}
              <div className="relative h-60 md:h-72 w-full overflow-hidden">
                <img
                  src={event.featuredImage}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              </div>

              {/* Info Area */}
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    <Calendar size={12} className="text-indigo-400" />
                    <span>{event.date}</span>
                    <span className="text-white/10">|</span>
                    <MapPin size={12} className="text-indigo-400" />
                    <span className="truncate max-w-[150px]">{event.venue}</span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-gray-400 text-xs font-light leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                  <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                    {event.meta}
                  </span>
                  <button 
                    onClick={() => openEventModal(event)}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  >
                    Explore Node <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        {/* comAIcal Escape Interactive Sandbox */}
        <m.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-[3rem] border-white/10 p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/10"
        >
          {/* Neon filament glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -z-10 animate-pulse" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400">
                <Flame size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">comAIcal escape playground</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                Narrative Core Generator
              </h2>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Experience the core mechanics of <strong className="text-pink-400">comAIcal Escape</strong>. In the real event, students crack computational challenges to trigger randomized narrative constraints, then weave them into a tech comic. Spin our virtual core below to generate your random AI comic prompt!
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  to="/join" 
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                >
                  Join Neuron Club <ArrowRight size={14} />
                </Link>
                <a 
                  href="https://forms.gle/LCmBwCjnwSa3YUy9A" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-6 py-3 glass border-white/10 hover:border-white/20 text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                >
                  View Registry Form <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="glass border-white/10 rounded-[2.5rem] p-6 space-y-6 relative overflow-hidden bg-black/40">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-pink-400 uppercase tracking-widest">
                    <Terminal size={12} /> Narrative core: ACTIVE
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                </div>

                <div className="space-y-4">
                  {/* Wheel categories */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-gray-500 font-mono mb-1">PROTAGONIST</p>
                      <p className={`text-xs font-bold ${wheelState.spinning ? 'text-pink-400 animate-pulse' : 'text-white'}`}>{wheelState.protagonist}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-gray-500 font-mono mb-1">GENRE</p>
                      <p className={`text-xs font-bold ${wheelState.spinning ? 'text-indigo-400 animate-pulse' : 'text-white'}`}>{wheelState.genre}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-gray-500 font-mono mb-1">CONFLICT TYPE</p>
                      <p className={`text-xs font-bold ${wheelState.spinning ? 'text-purple-400 animate-pulse' : 'text-white'}`}>{wheelState.conflict}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-gray-500 font-mono mb-1">AI CORE TOPIC</p>
                      <p className={`text-xs font-bold ${wheelState.spinning ? 'text-cyan-400 animate-pulse' : 'text-white'}`}>{wheelState.aiConcept}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={spinStoryWheel}
                  disabled={wheelState.spinning}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-indigo-600 disabled:from-pink-900 disabled:to-indigo-900 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 font-mono shadow-lg"
                >
                  <Play size={14} className={wheelState.spinning ? 'animate-spin' : ''} />
                  {wheelState.spinning ? 'GENERATING PROMPT...' : 'SPIN STORY CORE'}
                </button>
              </div>
            </div>
          </div>
        </m.section>

        {/* Modal: Interactive Details explorer */}
        <AnimatePresence>
          {selectedEvent && (
            <m.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/90 backdrop-blur-2xl overflow-y-auto"
            >
              <m.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.95, y: 20 }}
                className="glass w-full max-w-4xl p-8 md:p-14 rounded-[3rem] border-white/10 relative my-10 max-h-[85vh] overflow-y-auto custom-scrollbar"
              >
                {/* Close trigger */}
                <button 
                  onClick={() => setSelectedEvent(null)} 
                  className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
                >
                  <XIcon size={24} />
                </button>

                <div className="space-y-10">
                  {/* Tagline & Title */}
                  <div className="space-y-3">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedEvent.badgeColor}`}>
                      {selectedEvent.category}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                      {selectedEvent.title}
                    </h2>
                    <p className="text-sm text-indigo-400 font-mono tracking-wider">{selectedEvent.tagline}</p>
                  </div>

                  {/* Primary Grid metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.01] border border-white/5 rounded-3xl p-6 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">TIMELINE</p>
                        <p className="text-white font-bold">{selectedEvent.date}</p>
                        <p className="text-[10px] text-gray-400">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">COORDINATES</p>
                        <p className="text-white font-bold truncate max-w-[200px]">{selectedEvent.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Terminal size={18} className="text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">STATUS</p>
                        <p className="text-green-400 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          ARCHIVED_SUCCESS
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Featured Cover / Active Image */}
                  <div className="space-y-4">
                    <div className="w-full h-80 md:h-[450px] rounded-[2.5rem] overflow-hidden border border-white/5 relative group bg-black/40">
                      <img 
                        src={activeImage || selectedEvent.featuredImage} 
                        alt={selectedEvent.title} 
                        className="w-full h-full object-cover transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Thumbnails Gallery */}
                    {selectedEvent.gallery && selectedEvent.gallery.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {selectedEvent.gallery.map((imgUrl, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(imgUrl)}
                            className={`relative h-20 w-32 shrink-0 rounded-2xl overflow-hidden border transition-all duration-300 ${
                              (activeImage || selectedEvent.featuredImage) === imgUrl
                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-95'
                                : 'border-white/5 hover:border-white/10 hover:scale-105'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Gallery thumbnail ${i + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Detailed summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-4 text-gray-300 leading-relaxed text-sm font-light">
                        {selectedEvent.description.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>

                      {/* Takeaways / Highlights */}
                      {selectedEvent.keyTakeaways && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold uppercase tracking-widest font-mono text-indigo-400 flex items-center gap-2">
                            <Compass size={14} /> core teachings
                          </h4>
                          <ul className="space-y-3">
                            {selectedEvent.keyTakeaways.map((takeaway, i) => (
                              <li key={i} className="flex gap-3 text-xs text-gray-400 leading-relaxed">
                                <span className="text-indigo-500 shrink-0 font-bold">0{i+1}.</span>
                                <span>{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                      {/* Event highlights checklist */}
                      <div className="glass border-white/5 rounded-3xl p-6 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-purple-400">Highlights</h4>
                        <div className="space-y-3">
                          {selectedEvent.highlights?.map((hl, i) => (
                            <div key={i} className="flex gap-2.5 text-xs text-gray-400 items-start">
                              <span className="text-purple-400 text-[10px] pt-0.5">●</span>
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic action forms link or contacts */}
                      {selectedEvent.regLink && (
                        <div className="glass border-indigo-500/20 rounded-3xl p-6 space-y-4 bg-indigo-950/10">
                          <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-indigo-400 flex items-center gap-2">
                            <Zap size={14} className="animate-pulse" /> Register Node
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Registration portals are archived. Access active registration details here.
                          </p>
                          <a 
                            href={selectedEvent.regLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                          >
                            Explore Registry Form <ExternalLink size={14} />
                          </a>
                        </div>
                      )}

                      {/* Contacts if any */}
                      {selectedEvent.contacts && (
                        <div className="glass border-white/5 rounded-3xl p-6 space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-gray-400">Operation Contacts</h4>
                          <div className="space-y-3">
                            {selectedEvent.contacts.map((contact, i) => (
                              <div key={i} className="flex justify-between items-center text-xs font-mono">
                                <span className="text-gray-400">{contact.name}</span>
                                <a href={`tel:${contact.phone}`} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                  <Phone size={10} /> {contact.phone}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workshops section for unbox event */}
                  {selectedEvent.workshops && (
                    <div className="space-y-6 pt-6 border-t border-white/5">
                      <h3 className="text-lg font-black uppercase tracking-widest font-mono text-cyan-400">
                        Post-Event Synthetic Workshops
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedEvent.workshops.map((ws, i) => (
                          <div key={i} className="glass border-white/5 rounded-2xl p-5 space-y-2 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-white font-mono">{ws.title}</h4>
                              <span className="text-[8px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                                {ws.host}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-light leading-relaxed">{ws.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Close trigger */}
                  <div className="pt-8 border-t border-white/5 flex justify-end">
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold font-mono uppercase tracking-widest transition-all"
                    >
                      Close Node
                    </button>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Internal replacement icon component since Lucide X is generic
const XIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Events;
