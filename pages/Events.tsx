import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import DecryptedText from '../components/DecryptedText.tsx';
import { 
  Calendar, MapPin, Users, Award, Sparkles, BookOpen, 
  Clock, Phone, ChevronRight, Share2, Terminal, Compass, 
  Zap, ExternalLink, HelpCircle
} from 'lucide-react';

// Import our beautiful moved images
// @ts-ignore
import event1_1 from '../events/event1_1.jpeg';
// @ts-ignore
import event1_2 from '../events/event1_2.jpeg';
// @ts-ignore
import event1_3 from '../events/event1_3.jpeg';
// @ts-ignore
import event1_4 from '../events/event1_4.jpeg';
// @ts-ignore
import event2_1 from '../events/event2_1.jpeg';
// @ts-ignore
import event2_2 from '../events/event2_2.jpeg';
// @ts-ignore
import event2_3 from '../events/event2_3.jpeg';
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
  category: 'Tech Talk' | 'Competition';
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
    id: 'neuron-inauguration',
    title: 'Official Inauguration of NEURØN – The AI Club',
    tagline: 'Fostering a Community of Practice for Artificial Intelligence',
    category: 'Tech Talk',
    date: '4th February 2026',
    time: 'Flagship Inauguration Program',
    venue: 'Amrita Vishwa Vidyapeetham, Bengaluru Campus',
    featuredImage: event1_1,
    gallery: [
      event1_1,
      event1_2,
      event1_3,
      event1_4
    ],
    description: 'The Official Inauguration marked the formal launch of NEURØN - The Artificial Intelligence Club at Amrita Vishwa Vidyapeetham, Bengaluru Campus. The club’s idea fosters a Community of Practice - the vision of creating an inclusive learning community where students from all disciplines can come together to explore Artificial Intelligence, exchange knowledge, collaborate on projects, and develop practical skills. The event witnessed the participation of approximately 180 students, along with faculty members and institutional leaders. The ceremony was graced by Ms. Shanti Kuropati, Founder and CEO of Seedling Lab, Dr. Manoj, Campus Director, and Dr. Sudhir Patnaik, Head of CIR. The programme began with a welcome address, followed by the ceremonial lamp lighting and keynote addresses highlighting the growing significance of Artificial Intelligence in academia, industry, and society. The NEURØN core team introduced the club\'s vision, mission, and planned activities, focusing on hands-on projects, workshops, hackathons, research initiatives, industry interactions, and responsible AI practices. The event concluded by encouraging students to actively engage in AI-driven learning, interdisciplinary collaboration, and innovation-driven initiatives under the NEURØN community.',
    keyTakeaways: [
      'The inauguration provided students with valuable exposure to Artificial Intelligence and its real-world applications while creating awareness about the club\'s vision and future activities.',
      'Through the addresses delivered by the guest speaker and institutional leaders, students gained insights into the importance of AI in solving practical problems and contributing to society.',
      'The event encouraged curiosity, critical thinking, interdisciplinary collaboration, and lifelong learning while motivating students to participate in technical projects, research, workshops, and hackathons organised under NEURØN.'
    ],
    highlights: [
      'Welcome Address & Ceremonial Lamp Lighting',
      'Keynote on the growing significance of AI in academia, industry, and society',
      'Formal introduction of NEURØN\'s vision, mission, and scheduled pipeline'
    ],
    meta: 'SYS_LAUNCH_4_FEB',
    badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5'
  },
  {
    id: 'neuron-unbox',
    title: 'NEURØN – The Unbox Event',
    tagline: 'Interactive panel discussion on innovation, sovereign systems, and emerging technologies',
    category: 'Tech Talk',
    date: '26th March 2026',
    time: 'Flagship Interactive Panel Session',
    venue: 'Amrita Vishwa Vidyapeetham, Bengaluru Campus',
    featuredImage: event2_3,
    gallery: [
      event2_1,
      event2_2,
      event2_3
    ],
    description: 'The NEURØN Unbox Event was conducted as an interactive panel discussion featuring Dr. Pramod Varma, Co-Founder and Chief Architect at NFH. The event saw the enthusiastic participation of approximately 250 students, along with faculty members and institutional leaders. The session focused on innovation, digital transformation, public technology, governance, entrepreneurship, and the evolving role of Artificial Intelligence in society. Through a series of carefully curated questions, Dr. Pramod Varma shared insights from his experience in building large-scale digital systems and discussed the importance of designing technology with inclusivity, scalability, and long-term societal impact. The discussion concluded with the felicitation of the Chief Guest and encouraged students to actively participate in innovation-driven learning, interdisciplinary collaboration, and responsible AI practices under the NEURØN community.',
    keyTakeaways: [
      'The event provided students with valuable insights into the practical applications of technology, digital public infrastructure, and Artificial Intelligence in addressing real-world challenges.',
      'Participants developed a deeper understanding of how innovation intersects with governance, entrepreneurship, and societal impact.',
      'The discussion encouraged critical thinking, analytical skills, and awareness of the ethical and responsible use of emerging technologies while helping bridge the gap between academic learning and real-world implementation.'
    ],
    highlights: [
      'Interactive panel discussion featuring industry giant Dr. Pramod Varma',
      'Enthusiastic participation of over 250 students, faculty, and campus directors',
      'Bridged key parameters between university theory and high-scale technical systems'
    ],
    workshops: [
      { title: 'NSDC — Bug to Breach', host: 'Cyber Security Unit', desc: 'A thrilling dive into AI-assisted vulnerability testing, penetration testing vectors, and defensive shielding.' },
      { title: 'ACE — AI Retrofit', host: 'Advanced Code Engineering', desc: 'Refitting legacy structures with modern transformer models, local model orchestration, and token optimization.' },
      { title: 'ACROM — AI-Integrated Robotics', host: 'Robotics & 3D Printing Lab', desc: 'Showcase of 3D-printed synthetic kinetic limbs guided by real-time computer vision models.' },
      { title: 'JIDO — AI Automata', host: 'Autonomous Systems Unit', desc: 'Building multi-agent task loops, autonomous triggers, and stateful workflow assistants.' }
    ],
    meta: 'SYSTEM_UNBOX_26_MAR',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'
  },
  {
    id: 'com-ai-cal-escape',
    title: 'ComAIcal Escape',
    tagline: 'AI-Powered Comic Creation & Narrative Visual Competition',
    category: 'Competition',
    date: '21st April 2026',
    time: 'Kalanjali Cultural Fest',
    venue: 'CSE Labs, Amrita Vishwa Vidyapeetham',
    featuredImage: event3_1,
    gallery: [
      event3_1,
      event3_2,
      event3_3
    ],
    description: 'Conducted as part of Kalanjali Cultural Fest, ComAIcal Escape was an AI-powered comic creation competition organised by NEURØN – The AI Club. The competition brought together participants with teams each tasked with creating a five-to-six-page comic using AI tools. Teams first answered AI-related questions to qualify before receiving randomly assigned characters and themes through a wheel spin. Participants were given two hours to create their comics and later presented their work to the judging panel, explaining their storyline, AI workflow, and prompting strategies. The event combined AI image generation with creative storytelling, encouraging participants to think creatively while working within time and content constraints.',
    keyTakeaways: [
      'The competition gave students hands-on experience in using AI tools for visual generation and narrative construction.',
      'Participants learned prompt engineering, AI-assisted image generation, visual storytelling, comic panel composition, teamwork under time pressure, and public presentation of creative work.',
      'The event demonstrated that AI can serve as a powerful creative partner beyond traditional technical applications, giving students a broader understanding of AI\'s role in art and storytelling.'
    ],
    highlights: [
      'Formally hosted as part of the landmark Kalanjali Cultural Fest',
      'High-energy 2-hour narrative design sprint with real-time prompt engineering',
      'Presented active comic slides and prompt workflows to a professional evaluation panel'
    ],
    contacts: [
      { name: 'Tanay Ashish', phone: '8210160750' },
      { name: 'Prajukta', phone: '7008756533' }
    ],
    meta: 'COMIC_ESCAPE_21_APR',
    badgeColor: 'border-pink-500/30 text-pink-400 bg-pink-500/5'
  }
];

const Events: React.FC = () => {
  const m = motion as any;
  const [activeTab, setActiveTab] = useState<'All' | 'Tech Talk' | 'Competition'>('All');
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const openEventModal = (event: EventType) => {
    setSelectedEvent(event);
    setActiveImage(event.featuredImage);
  };

  React.useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedEvent]);

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
          {(['All', 'Tech Talk', 'Competition'] as const).map((tab) => (
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
              onClick={() => openEventModal(event)}
              className="glass rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col group hover:border-white/10 hover:bg-white/[0.01] hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 relative cursor-pointer"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      openEventModal(event);
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  >
                    Explore Node <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        {/* Modal: Interactive Details explorer */}
        <AnimatePresence>
          {selectedEvent && (
            <m.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6 bg-black/90 backdrop-blur-2xl overflow-y-auto py-6"
            >
              <m.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.95, y: 20 }}
                className="glass w-full max-w-4xl p-5 sm:p-8 md:p-14 rounded-[1.5rem] sm:rounded-[3rem] border-white/10 relative my-4 sm:my-10 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto custom-scrollbar"
              >
                {/* Close trigger */}
                <button 
                  onClick={() => setSelectedEvent(null)} 
                  className="absolute top-5 right-5 sm:top-8 sm:right-8 text-gray-500 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full z-[110]"
                  aria-label="Close modal"
                >
                  <XIcon size={18} />
                </button>

                <div className="space-y-6 sm:space-y-10">
                  {/* Tagline & Title */}
                  <div className="space-y-3">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedEvent.badgeColor}`}>
                      {selectedEvent.category}
                    </span>
                    <h2 className="text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                      {selectedEvent.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-400 font-mono tracking-wider">{selectedEvent.tagline}</p>
                  </div>

                  {/* Primary Grid metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/[0.01] border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-xs font-mono">
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar size={18} className="text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">TIMELINE</p>
                        <p className="text-white font-bold text-xs sm:text-sm leading-normal">{selectedEvent.date}</p>
                        <p className="text-[10px] text-gray-400">{selectedEvent.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin size={18} className="text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">COORDINATES</p>
                        <p className="text-white font-bold text-xs sm:text-sm leading-normal whitespace-normal break-words">{selectedEvent.venue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <Terminal size={18} className="text-indigo-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">STATUS</p>
                        <p className="text-green-400 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                          ARCHIVED_SUCCESS
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Featured Cover / Active Image */}
                  <div className="space-y-4">
                    <div className="w-full h-48 xs:h-64 sm:h-80 md:h-[450px] rounded-[1.25rem] sm:rounded-[2.5rem] overflow-hidden border border-white/5 relative group bg-black/40">
                      <img 
                        src={activeImage || selectedEvent.featuredImage} 
                        alt={selectedEvent.title} 
                        className="w-full h-full object-cover transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Thumbnails Gallery */}
                    {selectedEvent.gallery && selectedEvent.gallery.length > 1 && (
                      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {selectedEvent.gallery.map((imgUrl, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(imgUrl)}
                            className={`relative h-14 w-24 sm:h-20 sm:w-32 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border transition-all duration-300 ${
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
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-4 text-gray-300 leading-relaxed text-xs sm:text-sm font-light">
                        {selectedEvent.description.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>

                      {/* Takeaways / Highlights */}
                      {selectedEvent.keyTakeaways && (
                        <div className="space-y-4">
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest font-mono text-indigo-400 flex items-center gap-2">
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

                    <div className="lg:col-span-5 space-y-6 sm:space-y-8">
                      {/* Event highlights checklist */}
                      <div className="glass border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
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

                      {/* Contacts if any */}
                      {selectedEvent.contacts && (
                        <div className="glass border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
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
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-widest font-mono text-cyan-400">
                        Post-Event Synthetic Workshops
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {selectedEvent.workshops.map((ws, i) => (
                          <div key={i} className="glass border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start sm:items-center gap-2">
                              <h4 className="text-xs font-bold text-white font-mono">{ws.title}</h4>
                              <span className="text-[8px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full shrink-0">
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
                  <div className="pt-6 sm:pt-8 border-t border-white/5 flex justify-end">
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] sm:text-xs font-bold font-mono uppercase tracking-widest transition-all"
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
