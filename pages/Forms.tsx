import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { Link } from 'react-router-dom';
import DecryptedText from '../components/DecryptedText.tsx';
import { 
  FileText, CheckCircle2, Sparkles, Send, RotateCcw, 
  FileEdit, Eye, Layers, Plus, Trash2, Download, 
  Copy, Clock, ShieldCheck, HelpCircle, Check, 
  Code, Rocket, UserCheck, MessageSquare, Mic, 
  Cpu, Terminal, ArrowRight, ExternalLink, Calendar,
  ChevronDown, AlertCircle, Database, CheckSquare,
  BookmarkCheck, Star, Sliders, Laptop, Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext.tsx';

// Type definitions for the Forms hub
type FormCategory = 'all' | 'events' | 'projects' | 'recruitment' | 'speakers' | 'feedback';

interface FormTemplateMeta {
  id: string;
  category: FormCategory;
  title: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  estimatedTime: string;
  icon: any;
  status: 'Open Draft' | 'Prototype' | 'Review Ready';
}

const FORM_TEMPLATES: FormTemplateMeta[] = [
  {
    id: 'events',
    category: 'events',
    title: 'Event & Workshop RSVP Pass',
    tagline: 'Reserve your terminal for hands-on deep learning sessions, hackathons, and guest masterclasses.',
    badge: 'Open Registration',
    badgeColor: 'emerald',
    estimatedTime: '2 mins',
    icon: Calendar,
    status: 'Open Draft'
  },
  {
    id: 'projects',
    category: 'projects',
    title: 'Neuron Labs Project & Idea Intake',
    tagline: 'Submit research concepts, autonomous agents, and AI prototype proposals for club incubation.',
    badge: 'Incubator Intake',
    badgeColor: 'indigo',
    estimatedTime: '4 mins',
    icon: Rocket,
    status: 'Open Draft'
  },
  {
    id: 'recruitment',
    category: 'recruitment',
    title: 'Core Team & Wing Application',
    tagline: 'Join Technical, R&D, Outreach, Design, Relations, or Logistics wings for the 2026 tenure.',
    badge: 'Recruitment Draft',
    badgeColor: 'purple',
    estimatedTime: '5 mins',
    icon: UserCheck,
    status: 'Review Ready'
  },
  {
    id: 'speakers',
    category: 'speakers',
    title: 'Speaker & Mentor Expression of Interest',
    tagline: 'Call for researchers, industry leads, and alumni to host talks, paper audits, or fireside AMAs.',
    badge: 'Call for Proposals',
    badgeColor: 'cyan',
    estimatedTime: '3 mins',
    icon: Mic,
    status: 'Prototype'
  },
  {
    id: 'feedback',
    category: 'feedback',
    title: 'Feedback, Requests & Suggestion Box',
    tagline: 'Anonymous or identified critiques, hackathon bug reports, and computational topic requests.',
    badge: 'Community Pulse',
    badgeColor: 'pink',
    estimatedTime: '1 min',
    icon: MessageSquare,
    status: 'Open Draft'
  }
];

export const Forms: React.FC = () => {
  const m = motion as any;
  const toast = useToast();

  // Active view states
  const [activeFormId, setActiveFormId] = useState<string>('events');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<FormCategory>('all');
  const [activeMode, setActiveMode] = useState<'fill' | 'builder' | 'submissions'>('fill');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Submission result state
  const [submittedData, setSubmittedData] = useState<{
    referenceCode: string;
    formTitle: string;
    submittedAt: string;
    data: any;
  } | null>(null);

  // Local submissions history for rough draft evaluation
  const [savedSubmissions, setSavedSubmissions] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('neuron_draft_submissions_log');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ================= Form 1: Event RSVP State =================
  const [eventData, setEventData] = useState({
    fullName: '',
    email: '',
    rollNo: '',
    track: 'Generative AI & Agentic Systems',
    experienceLevel: 'Intermediate',
    needsHardware: false,
    dietaryOrNotes: '',
    agreeTerms: true
  });

  // ================= Form 2: Project Intake State =================
  const [projectData, setProjectData] = useState({
    projectTitle: '',
    leadName: '',
    leadEmail: '',
    teamSize: 'Solo / Looking for Squad',
    domain: 'Agentic Workflows & Multi-Agent LLMs',
    problemStatement: '',
    techStack: 'PyTorch, FastAPI, Next.js, LangGraph',
    githubRepoUrl: '',
    demoLink: '',
    resourceNeed: 'Compute GPUs'
  });

  // ================= Form 3: Recruitment State =================
  const [recruitmentData, setRecruitmentData] = useState({
    candidateName: '',
    rollNumber: '',
    deptYear: 'CSE - 3rd Year',
    contactNumber: '',
    primaryWing: 'Technical (AI/ML & Engineering)',
    secondaryWing: 'Research & Publications',
    portfolioUrl: '',
    statement: '',
    weeklyHours: '6-10 hours'
  });

  // ================= Form 4: Speaker Call State =================
  const [speakerData, setSpeakerData] = useState({
    speakerName: '',
    designation: '',
    organization: '',
    sessionTitle: '',
    sessionFormat: 'Hands-on Technical Workshop (90 min)',
    targetAudience: 'Undergrads & Graduate AI Enthusiasts',
    sessionAbstract: '',
    preferredDateRange: 'Upcoming Weekend Slot'
  });

  // ================= Form 5: Feedback State =================
  const [feedbackData, setFeedbackData] = useState({
    category: 'Event Experience',
    rating: 5,
    message: '',
    isAnonymous: false,
    emailOrHandle: ''
  });

  // ================= Custom Form Builder Sandbox State =================
  const [customFields, setCustomFields] = useState<Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'rating';
    placeholder?: string;
    options?: string[];
    required: boolean;
  }>>([
    { id: 'f1', label: 'Candidate Neural Identifier / Roll No', type: 'text', placeholder: 'AM.EN.U4AIE23001', required: true },
    { id: 'f2', label: 'Primary AI Architecture Interest', type: 'select', options: ['Diffusion Models', 'Large Language Models', 'Vision Transformers', 'Robotics & Control'], required: true },
    { id: 'f3', label: 'Project Technical Blueprint or Vision', type: 'textarea', placeholder: 'Describe the core mathematical or algorithmic hypothesis...', required: false },
    { id: 'f4', label: 'Self-Assessed Proficiency (1-5 Stars)', type: 'rating', required: true },
    { id: 'f5', label: 'Commitment to Open-Source Guidelines', type: 'checkbox', required: true }
  ]);

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'select' | 'checkbox' | 'rating'>('text');

  // Autosave draft state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('neuron_forms_events_draft', JSON.stringify(eventData));
    } catch {}
  }, [eventData]);

  useEffect(() => {
    try {
      localStorage.setItem('neuron_forms_projects_draft', JSON.stringify(projectData));
    } catch {}
  }, [projectData]);

  // Restore drafts on mount
  useEffect(() => {
    try {
      const eDraft = localStorage.getItem('neuron_forms_events_draft');
      if (eDraft) setEventData(JSON.parse(eDraft));

      const pDraft = localStorage.getItem('neuron_forms_projects_draft');
      if (pDraft) setProjectData(JSON.parse(pDraft));
    } catch {}
  }, []);

  // Calculate rough progress %
  const getProgress = (id: string): number => {
    switch (id) {
      case 'events': {
        let filled = 0;
        if (eventData.fullName) filled++;
        if (eventData.email) filled++;
        if (eventData.rollNo) filled++;
        if (eventData.track) filled++;
        return Math.round((filled / 4) * 100);
      }
      case 'projects': {
        let filled = 0;
        if (projectData.projectTitle) filled++;
        if (projectData.leadName) filled++;
        if (projectData.leadEmail) filled++;
        if (projectData.problemStatement) filled++;
        if (projectData.techStack) filled++;
        return Math.round((filled / 5) * 100);
      }
      case 'recruitment': {
        let filled = 0;
        if (recruitmentData.candidateName) filled++;
        if (recruitmentData.rollNumber) filled++;
        if (recruitmentData.contactNumber) filled++;
        if (recruitmentData.statement) filled++;
        return Math.round((filled / 4) * 100);
      }
      case 'speakers': {
        let filled = 0;
        if (speakerData.speakerName) filled++;
        if (speakerData.organization) filled++;
        if (speakerData.sessionTitle) filled++;
        if (speakerData.sessionAbstract) filled++;
        return Math.round((filled / 4) * 100);
      }
      case 'feedback': {
        return feedbackData.message ? 100 : 35;
      }
      default:
        return 50;
    }
  };

  // Helper to load sample mock data for instant rough draft testing
  const handleLoadSample = (formId: string) => {
    if (formId === 'events') {
      setEventData({
        fullName: 'Devansh Kaila',
        email: 'devanshkaila06@gmail.com',
        rollNo: 'AM.EN.U4AIE23042',
        track: 'Generative AI & Agentic Systems',
        experienceLevel: 'Advanced',
        needsHardware: true,
        dietaryOrNotes: 'Excited for PyTorch & vLLM quantization lab!',
        agreeTerms: true
      });
      toast.success('Sample data loaded into Event RSVP draft!');
    } else if (formId === 'projects') {
      setProjectData({
        projectTitle: 'SynapseNet: Autonomous Multi-Agent Kernel',
        leadName: 'Aarav Nair',
        leadEmail: 'aarav.nair@amrita.edu',
        teamSize: 'Squad of 3',
        domain: 'Agentic Workflows & Multi-Agent LLMs',
        problemStatement: 'Solving asynchronous latency bottlenecks in distributed swarm decision-making via lightweight vector consensus.',
        techStack: 'Python 3.12, PyTorch, LangGraph, ChromaDB, FastAPI',
        githubRepoUrl: 'https://github.com/neuron-amrita/synapsenet-agent-kernel',
        demoLink: 'https://synapsenet.neuron.internal',
        resourceNeed: 'Compute GPUs & Research Paper Publication Grants'
      });
      toast.success('Sample data loaded into Neuron Labs Project draft!');
    } else if (formId === 'recruitment') {
      setRecruitmentData({
        candidateName: 'Priya Sundaram',
        rollNumber: 'AM.EN.U4CSE24118',
        deptYear: 'CSE (AI) - 2nd Year',
        contactNumber: '+91 98765 43210',
        primaryWing: 'Technical (AI/ML & Engineering)',
        secondaryWing: 'Research & Publications',
        portfolioUrl: 'https://github.com/priya-sundaram',
        statement: 'Passionate about building scalable AI infrastructure and mentoring junior peers in foundational linear algebra and deep learning.',
        weeklyHours: '8-12 hours'
      });
      toast.success('Sample data loaded into Recruitment draft!');
    } else if (formId === 'speakers') {
      setSpeakerData({
        speakerName: 'Dr. Vikram Raman',
        designation: 'Staff Research Scientist',
        organization: 'DeepMind Technologies / Bangalore Hub',
        sessionTitle: 'State-Space Models & Beyond Transformers in 2026',
        sessionFormat: 'Hands-on Technical Workshop (90 min)',
        targetAudience: 'Undergrads & Graduate AI Enthusiasts',
        sessionAbstract: 'A deep architectural dive into Mamba-3, recurrent state spaces, and linear attention mechanisms with live CUDA benchmarking.',
        preferredDateRange: 'November 2026 Saturday Slot'
      });
      toast.success('Sample data loaded into Speaker Proposal draft!');
    } else if (formId === 'feedback') {
      setFeedbackData({
        category: 'Workshop Topic Request',
        rating: 5,
        message: 'Loved the Passport Explorer gamification! Could we have a full weekend workshop focused on Triton GPU kernel programming?',
        isAnonymous: false,
        emailOrHandle: 'amrita.student@campus.edu'
      });
      toast.success('Sample feedback data loaded!');
    }
  };

  // Reset current active form
  const handleResetForm = (formId: string) => {
    if (formId === 'events') {
      setEventData({
        fullName: '',
        email: '',
        rollNo: '',
        track: 'Generative AI & Agentic Systems',
        experienceLevel: 'Intermediate',
        needsHardware: false,
        dietaryOrNotes: '',
        agreeTerms: true
      });
    } else if (formId === 'projects') {
      setProjectData({
        projectTitle: '',
        leadName: '',
        leadEmail: '',
        teamSize: 'Solo / Looking for Squad',
        domain: 'Agentic Workflows & Multi-Agent LLMs',
        problemStatement: '',
        techStack: '',
        githubRepoUrl: '',
        demoLink: '',
        resourceNeed: 'Compute GPUs'
      });
    } else if (formId === 'recruitment') {
      setRecruitmentData({
        candidateName: '',
        rollNumber: '',
        deptYear: 'CSE - 2nd Year',
        contactNumber: '',
        primaryWing: 'Technical (AI/ML & Engineering)',
        secondaryWing: 'Research & Publications',
        portfolioUrl: '',
        statement: '',
        weeklyHours: '6-10 hours'
      });
    } else if (formId === 'speakers') {
      setSpeakerData({
        speakerName: '',
        designation: '',
        organization: '',
        sessionTitle: '',
        sessionFormat: 'Hands-on Technical Workshop (90 min)',
        targetAudience: 'Undergrads & Graduate AI Enthusiasts',
        sessionAbstract: '',
        preferredDateRange: 'Upcoming Weekend Slot'
      });
    } else if (formId === 'feedback') {
      setFeedbackData({
        category: 'Event Experience',
        rating: 5,
        message: '',
        isAnonymous: false,
        emailOrHandle: ''
      });
    }
    toast.info('Draft fields cleared.');
  };

  // Submit Handler for active form
  const handleSubmitForm = (e: React.FormEvent, formId: string) => {
    e.preventDefault();

    // Generate reference code
    const randCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefix = formId.substring(0, 3).toUpperCase();
    const referenceCode = `NEURON-${prefix}-${randCode}`;

    let payload: any = {};
    let formTitle = '';

    if (formId === 'events') {
      if (!eventData.fullName || !eventData.email) {
        toast.error('Please enter Full Name and Email.');
        return;
      }
      payload = eventData;
      formTitle = 'Event & Workshop RSVP Pass';
    } else if (formId === 'projects') {
      if (!projectData.projectTitle || !projectData.leadName) {
        toast.error('Please enter Project Title and Lead Name.');
        return;
      }
      payload = projectData;
      formTitle = 'Neuron Labs Project & Idea Intake';
    } else if (formId === 'recruitment') {
      if (!recruitmentData.candidateName || !recruitmentData.rollNumber) {
        toast.error('Please enter Candidate Name and Roll Number.');
        return;
      }
      payload = recruitmentData;
      formTitle = 'Core Team & Wing Application';
    } else if (formId === 'speakers') {
      if (!speakerData.speakerName || !speakerData.sessionTitle) {
        toast.error('Please enter Speaker Name and Session Title.');
        return;
      }
      payload = speakerData;
      formTitle = 'Speaker & Mentor Proposal';
    } else if (formId === 'feedback') {
      if (!feedbackData.message) {
        toast.error('Please enter your feedback message.');
        return;
      }
      payload = feedbackData;
      formTitle = 'Community Feedback & Suggestion';
    }

    const newRecord = {
      referenceCode,
      formTitle,
      formId,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
      data: payload
    };

    const updated = [newRecord, ...savedSubmissions];
    setSavedSubmissions(updated);
    try {
      localStorage.setItem('neuron_draft_submissions_log', JSON.stringify(updated));
    } catch {}

    setSubmittedData(newRecord);

    // Trigger visual celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    toast.success(`Draft recorded successfully! Ref: ${referenceCode}`);
  };

  // Add custom field in builder sandbox
  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) {
      toast.error('Enter a field title');
      return;
    }
    const newField = {
      id: `field_${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      options: newFieldType === 'select' ? ['Track 1: Computer Vision', 'Track 2: NLP / LLMs', 'Track 3: Robotics'] : undefined,
      required: true
    };
    setCustomFields([...customFields, newField]);
    setNewFieldLabel('');
    toast.success('Field added to custom form draft!');
  };

  // Delete custom field
  const handleDeleteCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
    toast.info('Field removed.');
  };

  // Copy reference code
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates = activeCategoryFilter === 'all' 
    ? FORM_TEMPLATES 
    : FORM_TEMPLATES.filter(t => t.category === activeCategoryFilter);

  const activeTemplate = FORM_TEMPLATES.find(t => t.id === activeFormId) || FORM_TEMPLATES[0];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-3/4 right-10 w-[500px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= HERO HEADER ================= */}
        <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 bg-gradient-to-r from-black via-indigo-950/20 to-black relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-mono text-xs font-bold uppercase tracking-widest">
                  <Terminal size={14} className="text-indigo-400" /> NEURØN FORMS CENTRAL
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-xs font-semibold">
                  <Sparkles size={12} className="animate-spin" /> PROTOTYPE / ROUGH DRAFT
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-xs">
                  <BookmarkCheck size={12} /> Local Auto-Save Active
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-sans flex items-center gap-3">
                <DecryptedText text="FORMS & INTAKE PORTAL" speed={1.2} />
              </h1>
              
              <p className="text-gray-300 text-sm sm:text-base max-w-2xl mt-3 font-light leading-relaxed">
                The centralized gateway for NEURØN club registrations, research incubator submissions, recruitment evaluations, and community feedback. Test out live draft templates or explore the dynamic builder sandbox below.
              </p>
            </div>

            {/* Quick Navigation Tabs / Mode Selector */}
            <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => { setActiveMode('fill'); setSubmittedData(null); }}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all ${
                  activeMode === 'fill'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                }`}
              >
                <FileEdit size={16} /> Interactive Form Drafts
              </button>

              <button
                onClick={() => { setActiveMode('builder'); setSubmittedData(null); }}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all ${
                  activeMode === 'builder'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                }`}
              >
                <Sliders size={16} /> Dynamic Form Builder (Sandbox)
              </button>

              <button
                onClick={() => { setActiveMode('submissions'); setSubmittedData(null); }}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all ${
                  activeMode === 'submissions'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                }`}
              >
                <Database size={16} /> Submissions Log ({savedSubmissions.length})
              </button>
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT SWITCHER ================= */}
        {activeMode === 'fill' && (
          <div className="space-y-8">
            
            {/* Category Filter Pills & Form Selector Carousel */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {(['all', 'events', 'projects', 'recruitment', 'speakers', 'feedback'] as FormCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                        activeCategoryFilter === cat
                          ? 'bg-white text-black shadow-md'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {cat === 'all' ? 'All Form Templates' : cat}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
                  <span>Selected Template:</span>
                  <span className="text-indigo-400 font-bold">{activeTemplate.title}</span>
                </div>
              </div>

              {/* Form Cards Carousel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  const isSelected = activeFormId === template.id;
                  const progress = getProgress(template.id);

                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        setActiveFormId(template.id);
                        setSubmittedData(null);
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-indigo-950/60 to-black border-indigo-500/60 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                          : 'glass bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                            <Icon size={18} />
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            template.status === 'Open Draft' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            template.status === 'Review Ready' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {template.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white font-sans group-hover:text-indigo-300 transition-colors line-clamp-2">
                          {template.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                          {template.tagline}
                        </p>
                      </div>

                      {/* Progress bar and time */}
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                          <span>{template.estimatedTime}</span>
                          <span className={progress === 100 ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                            {progress}% filled
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================= ACTIVE FORM CONTAINER ================= */}
            <div className="glass p-6 sm:p-10 rounded-3xl border border-white/10 bg-black/70 shadow-2xl relative">
              
              {/* Form Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold">
                      FORM ID: {activeFormId.toUpperCase()}_V1
                    </span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Autosave active
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans mt-1">
                    {activeTemplate.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                    {activeTemplate.tagline}
                  </p>
                </div>

                {/* Draft Quick Tools */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleLoadSample(activeFormId)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-gray-200 flex items-center gap-1.5 transition-all border border-white/10"
                    title="Populate with realistic sample data for quick draft testing"
                  >
                    <Sparkles size={14} className="text-amber-400" /> Fill Sample Data
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetForm(activeFormId)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-xs font-mono font-bold text-gray-400 flex items-center gap-1.5 transition-all border border-white/5"
                    title="Clear current inputs"
                  >
                    <RotateCcw size={14} /> Clear
                  </button>
                </div>
              </div>

              {/* SUCCESS CONFIRMATION MODAL CARD (IF SUBMITTED) */}
              <AnimatePresence>
                {submittedData && (
                  <m.div
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-black to-indigo-950/30 border border-emerald-500/40 mb-8 shadow-2xl relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                          <CheckCircle2 size={16} /> FORM DRAFT RECORDED IN RUNTIME
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          Confirmation: {submittedData.formTitle}
                        </h3>
                        <p className="text-sm text-gray-300 max-w-xl">
                          Your draft response has been verified and registered into local cache storage. Use the reference code below to track or modify this record.
                        </p>
                        
                        <div className="flex items-center gap-3 pt-2">
                          <span className="font-mono text-sm bg-black/80 px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-300 font-bold tracking-wider">
                            {submittedData.referenceCode}
                          </span>
                          <button
                            onClick={() => copyToClipboard(submittedData.referenceCode, 'ref_code')}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                          >
                            {copiedId === 'ref_code' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* QR Pass Preview */}
                      <div className="shrink-0 bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center">
                        <QRCodeSVG
                          value={`https://neuron.amrita.edu/forms/verify?ref=${submittedData.referenceCode}`}
                          size={110}
                          level="M"
                        />
                        <span className="text-[10px] font-mono text-black font-bold uppercase mt-1">
                          PASS TOKEN
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">
                        Timestamp: {submittedData.submittedAt}
                      </span>
                      <button
                        onClick={() => setSubmittedData(null)}
                        className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                      >
                        Submit another draft response →
                      </button>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>

              {/* FORM 1: EVENT RSVP */}
              {activeFormId === 'events' && (
                <form onSubmit={(e) => handleSubmitForm(e, 'events')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={eventData.fullName}
                        onChange={(e) => setEventData({ ...eventData, fullName: e.target.value })}
                        placeholder="e.g. Maya Krishnan"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={eventData.email}
                        onChange={(e) => setEventData({ ...eventData, email: e.target.value })}
                        placeholder="name@amrita.edu or personal email"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Amrita Roll No / Student ID
                      </label>
                      <input
                        type="text"
                        value={eventData.rollNo}
                        onChange={(e) => setEventData({ ...eventData, rollNo: e.target.value })}
                        placeholder="e.g. AM.EN.U4AIE23015"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Selected Masterclass Track
                      </label>
                      <select
                        value={eventData.track}
                        onChange={(e) => setEventData({ ...eventData, track: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Generative AI & Agentic Systems</option>
                        <option>PyTorch Quantization & Edge Deployment</option>
                        <option>Reinforcement Learning from Human Feedback (RLHF)</option>
                        <option>Computer Vision for Autonomous Robotics</option>
                        <option>AI Safety, Interpretability & Red-Teaming</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Self-Assessed Experience Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setEventData({ ...eventData, experienceLevel: lvl })}
                            className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                              eventData.experienceLevel === lvl
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/5'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:border-indigo-500/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={eventData.needsHardware}
                          onChange={(e) => setEventData({ ...eventData, needsHardware: e.target.checked })}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-white block">Need Lab GPU / Hardware Terminal</span>
                          <span className="text-gray-400">Request physical seat on high-performance workstation</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                      Specific Problem You Want Solved / Comments
                    </label>
                    <textarea
                      rows={3}
                      value={eventData.dietaryOrNotes}
                      onChange={(e) => setEventData({ ...eventData, dietaryOrNotes: e.target.value })}
                      placeholder="Tell the workshop leads what you want covered or your current roadblocks..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <span className="text-xs font-mono text-gray-400">
                      ⚡ Immediate QR pass generated upon draft submission
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                    >
                      <Send size={16} /> Submit Event RSVP Draft
                    </button>
                  </div>
                </form>
              )}

              {/* FORM 2: NEURON LABS PROJECT INTAKE */}
              {activeFormId === 'projects' && (
                <form onSubmit={(e) => handleSubmitForm(e, 'projects')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Project / Hypothesis Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={projectData.projectTitle}
                        onChange={(e) => setProjectData({ ...projectData, projectTitle: e.target.value })}
                        placeholder="e.g. Distributed Memory Swarm for Multi-Agent Consensus"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Project Lead Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={projectData.leadName}
                        onChange={(e) => setProjectData({ ...projectData, leadName: e.target.value })}
                        placeholder="Lead Researcher / Developer Name"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Lead Email Contact <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={projectData.leadEmail}
                        onChange={(e) => setProjectData({ ...projectData, leadEmail: e.target.value })}
                        placeholder="lead.contact@domain.com"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Squad Structure
                      </label>
                      <select
                        value={projectData.teamSize}
                        onChange={(e) => setProjectData({ ...projectData, teamSize: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Solo / Looking for Squad</option>
                        <option>Duo (2 Members)</option>
                        <option>Squad of 3</option>
                        <option>Squad of 4 (Full Deployment)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Primary Research Domain
                      </label>
                      <select
                        value={projectData.domain}
                        onChange={(e) => setProjectData({ ...projectData, domain: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Agentic Workflows & Multi-Agent LLMs</option>
                        <option>Computer Vision & 3D Gaussian Splatting</option>
                        <option>Edge AI & Quantized On-Device Inference</option>
                        <option>AI for Healthcare & Bio-informatics</option>
                        <option>Neuro-symbolic Reasoning & Theorem Proving</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                      Problem Statement & Technical Abstract <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={projectData.problemStatement}
                      onChange={(e) => setProjectData({ ...projectData, problemStatement: e.target.value })}
                      placeholder="Outline what problem this project addresses, your proposed algorithmic architecture, and expected output..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Tech Stack / Libraries
                      </label>
                      <input
                        type="text"
                        value={projectData.techStack}
                        onChange={(e) => setProjectData({ ...projectData, techStack: e.target.value })}
                        placeholder="PyTorch, vLLM, Next.js, LangGraph"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        GitHub / Colab Repository
                      </label>
                      <input
                        type="url"
                        value={projectData.githubRepoUrl}
                        onChange={(e) => setProjectData({ ...projectData, githubRepoUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Required Club Support
                      </label>
                      <select
                        value={projectData.resourceNeed}
                        onChange={(e) => setProjectData({ ...projectData, resourceNeed: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Compute GPUs</option>
                        <option>Mentorship & Research Guidance</option>
                        <option>Teammate Recruitment Support</option>
                        <option>Compute + Paper Grants</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <span className="text-xs font-mono text-gray-400">
                      🚀 Selected proposals receive compute grants & booth showcase at Amrita AI Summit
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                    >
                      <Rocket size={16} /> Submit Project Intake Draft
                    </button>
                  </div>
                </form>
              )}

              {/* FORM 3: RECRUITMENT */}
              {activeFormId === 'recruitment' && (
                <form onSubmit={(e) => handleSubmitForm(e, 'recruitment')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recruitmentData.candidateName}
                        onChange={(e) => setRecruitmentData({ ...recruitmentData, candidateName: e.target.value })}
                        placeholder="Your full name"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Roll Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recruitmentData.rollNumber}
                        onChange={(e) => setRecruitmentData({ ...recruitmentData, rollNumber: e.target.value })}
                        placeholder="e.g. AM.EN.U4AIE24001"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Department & Year
                      </label>
                      <select
                        value={recruitmentData.deptYear}
                        onChange={(e) => setRecruitmentData({ ...recruitmentData, deptYear: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>AIE (AI & Data Science) - 1st Year</option>
                        <option>AIE (AI & Data Science) - 2nd Year</option>
                        <option>AIE (AI & Data Science) - 3rd Year</option>
                        <option>CSE - 1st Year</option>
                        <option>CSE - 2nd Year</option>
                        <option>CSE - 3rd Year</option>
                        <option>ECE / EEE / Mechanical / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        WhatsApp Contact Number
                      </label>
                      <input
                        type="tel"
                        value={recruitmentData.contactNumber}
                        onChange={(e) => setRecruitmentData({ ...recruitmentData, contactNumber: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Primary Wing Choice
                      </label>
                      <select
                        value={recruitmentData.primaryWing}
                        onChange={(e) => setRecruitmentData({ ...recruitmentData, primaryWing: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Technical (AI/ML & Engineering)</option>
                        <option>Research & Publications</option>
                        <option>Outreach & PR</option>
                        <option>Creative & UI/UX Design</option>
                        <option>Logistics & Event Operations</option>
                        <option>Corporate & Industry Relations</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Secondary Wing Choice
                      </label>
                      <select
                        value={recruitmentData.secondaryWing}
                        onChange={(e) => setRecruitmentData({ ...recruitmentData, secondaryWing: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Research & Publications</option>
                        <option>Technical (AI/ML & Engineering)</option>
                        <option>Outreach & PR</option>
                        <option>Creative & UI/UX Design</option>
                        <option>Logistics & Event Operations</option>
                        <option>Corporate & Industry Relations</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                      Portfolio / GitHub / LinkedIn / Kaggle URL
                    </label>
                    <input
                      type="url"
                      value={recruitmentData.portfolioUrl}
                      onChange={(e) => setRecruitmentData({ ...recruitmentData, portfolioUrl: e.target.value })}
                      placeholder="https://github.com/your-username"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                      Why NEURØN? What will you create or lead?
                    </label>
                    <textarea
                      rows={3}
                      value={recruitmentData.statement}
                      onChange={(e) => setRecruitmentData({ ...recruitmentData, statement: e.target.value })}
                      placeholder="Share your technical background, projects you have built, or vision for the club..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <span className="text-xs font-mono text-gray-400">
                      ⚡ Shortlisted candidates will be notified for interactive technical interviews
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
                    >
                      <UserCheck size={16} /> Submit Application Draft
                    </button>
                  </div>
                </form>
              )}

              {/* FORM 4: SPEAKER CALL */}
              {activeFormId === 'speakers' && (
                <form onSubmit={(e) => handleSubmitForm(e, 'speakers')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Speaker / Mentor Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={speakerData.speakerName}
                        onChange={(e) => setSpeakerData({ ...speakerData, speakerName: e.target.value })}
                        placeholder="e.g. Dr. Emily Chen"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Designation & Organization <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={speakerData.organization}
                        onChange={(e) => setSpeakerData({ ...speakerData, organization: e.target.value })}
                        placeholder="e.g. AI Research Lead @ Microsoft / IISc"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Proposed Session Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={speakerData.sessionTitle}
                        onChange={(e) => setSpeakerData({ ...speakerData, sessionTitle: e.target.value })}
                        placeholder="e.g. Architecting Distributed LLM Training on Cloud TPUs"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Format
                      </label>
                      <select
                        value={speakerData.sessionFormat}
                        onChange={(e) => setSpeakerData({ ...speakerData, sessionFormat: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Hands-on Technical Workshop (90 min)</option>
                        <option>Keynote Address (45 min)</option>
                        <option>Fireside Chat & Career AMA (60 min)</option>
                        <option>Hackathon Jury & Mentorship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Target Audience
                      </label>
                      <select
                        value={speakerData.targetAudience}
                        onChange={(e) => setSpeakerData({ ...speakerData, targetAudience: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Undergrads & Graduate AI Enthusiasts</option>
                        <option>Advanced Competitive Programmers & ML Researchers</option>
                        <option>Beginner Friendly / Campus-Wide</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                      Brief Session Abstract & Key Takeaways
                    </label>
                    <textarea
                      rows={3}
                      value={speakerData.sessionAbstract}
                      onChange={(e) => setSpeakerData({ ...speakerData, sessionAbstract: e.target.value })}
                      placeholder="Outline key learning milestones, prerequisites, and code repositories..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <span className="text-xs font-mono text-gray-400">
                      🎤 Our events wing provides travel logistics, honors, and audio-visual setups
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                    >
                      <Mic size={16} /> Submit Speaker Proposal
                    </button>
                  </div>
                </form>
              )}

              {/* FORM 5: FEEDBACK */}
              {activeFormId === 'feedback' && (
                <form onSubmit={(e) => handleSubmitForm(e, 'feedback')} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Feedback Topic
                      </label>
                      <select
                        value={feedbackData.category}
                        onChange={(e) => setFeedbackData({ ...feedbackData, category: e.target.value })}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Event Experience</option>
                        <option>Workshop Topic Request</option>
                        <option>Website Bug / Feature Request</option>
                        <option>Passport Explorer Stamp Suggestion</option>
                        <option>General Campus Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                        Overall Rating
                      </label>
                      <div className="flex items-center gap-2 pt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                            className={`p-2 rounded-xl transition-all ${
                              star <= feedbackData.rating 
                                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40 scale-110' 
                                : 'bg-white/5 text-gray-500 border border-white/5'
                            }`}
                          >
                            <Star size={20} className={star <= feedbackData.rating ? 'fill-amber-400 text-amber-400' : ''} />
                          </button>
                        ))}
                        <span className="text-xs font-mono text-amber-400 font-bold ml-2">
                          {feedbackData.rating} / 5
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                      Your Thoughts, Critiques, or Suggestions <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedbackData.message}
                      onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                      placeholder="Be as honest and detailed as possible. We actively iterate based on your feedback..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:border-indigo-500/40 transition-colors">
                        <input
                          type="checkbox"
                          checked={feedbackData.isAnonymous}
                          onChange={(e) => setFeedbackData({ ...feedbackData, isAnonymous: e.target.checked })}
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-white block">Submit Anonymously</span>
                          <span className="text-gray-400">Hide my name and student ID completely</span>
                        </div>
                      </label>
                    </div>

                    {!feedbackData.isAnonymous && (
                      <div>
                        <label className="block text-xs font-mono font-bold text-gray-300 uppercase mb-2">
                          Your Email or Discord Tag (Optional)
                        </label>
                        <input
                          type="text"
                          value={feedbackData.emailOrHandle}
                          onChange={(e) => setFeedbackData({ ...feedbackData, emailOrHandle: e.target.value })}
                          placeholder="e.g. user@amrita.edu or @discord"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                    <span className="text-xs font-mono text-gray-400">
                      💬 Reviewed weekly by the NEURØN Executive Council
                    </span>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all"
                    >
                      <MessageSquare size={16} /> Submit Feedback Draft
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================= DYNAMIC FORM BUILDER (SANDBOX MODE) ================= */}
        {activeMode === 'builder' && (
          <div className="space-y-8">
            <div className="glass p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-black to-black">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                    <Sliders size={14} /> ORGANIZER SANDBOX • DRAFT FORM GENERATOR
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans mt-2">
                    Dynamic Form Builder
                  </h2>
                  <p className="text-sm text-gray-300 max-w-2xl mt-1">
                    Design custom questionnaire drafts on the fly for spontaneous hackathon rounds, challenge tracks, or survey experiments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const schemaStr = JSON.stringify(customFields, null, 2);
                      navigator.clipboard.writeText(schemaStr);
                      toast.success('Form Schema copied to clipboard!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/30 text-cyan-200 font-mono text-xs font-bold flex items-center gap-2"
                  >
                    <Copy size={14} /> Export JSON Schema
                  </button>
                </div>
              </div>

              {/* Add New Field Toolbar */}
              <div className="mt-8 p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col md:flex-row items-center gap-3">
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="New question / prompt title (e.g. HuggingFace Model Link)..."
                  className="flex-1 bg-black/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="bg-black/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="text">Short Text</option>
                  <option value="textarea">Paragraph / Code Block</option>
                  <option value="select">Dropdown Selection</option>
                  <option value="rating">Rating (1-5)</option>
                  <option value="checkbox">Agreement Checkbox</option>
                </select>
                <button
                  onClick={handleAddCustomField}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Plus size={16} /> Add Field
                </button>
              </div>
            </div>

            {/* Builder Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Field Controls */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Configured Form Fields ({customFields.length})
                </h3>
                {customFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 group hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white/10 text-gray-300 font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{field.label}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">
                          Type: {field.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCustomField(field.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Right Column: Live Interactive Form Preview */}
              <div className="lg:col-span-7 glass p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/80">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
                      LIVE RENDERED PREVIEW
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      Dynamic Intake Form Preview
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                    Interactive
                  </span>
                </div>

                <div className="space-y-5">
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-xs font-mono font-bold text-gray-300 uppercase">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder || 'Enter value...'}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                        />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          rows={3}
                          placeholder={field.placeholder || 'Enter description...'}
                          className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white"
                        />
                      )}
                      {field.type === 'select' && (
                        <select className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                          {(field.options || ['Option A', 'Option B']).map((opt, i) => (
                            <option key={i}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'rating' && (
                        <div className="flex gap-2 py-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className="p-2 rounded-xl bg-white/5 border border-white/10 text-amber-400">
                              <Star size={16} className="fill-amber-400" />
                            </div>
                          ))}
                        </div>
                      )}
                      {field.type === 'checkbox' && (
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input type="checkbox" className="accent-cyan-500" defaultChecked />
                          <span className="text-xs text-gray-400">I confirm the stated clause</span>
                        </label>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => toast.success('Mock submission verified against schema!')}
                      className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CheckCircle2 size={16} /> Test Submit Preview Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SUBMISSIONS LOG MODE ================= */}
        {activeMode === 'submissions' && (
          <div className="space-y-6">
            <div className="glass p-6 sm:p-8 rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-950/20 via-black to-black">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-mono text-xs font-bold">
                    <Database size={14} /> LOCAL RUNTIME CACHE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-sans mt-2">
                    Recorded Draft Submissions
                  </h2>
                  <p className="text-sm text-gray-300 max-w-xl mt-1">
                    All test form responses submitted in your current browser session. Useful for verifying intake payloads and export formats.
                  </p>
                </div>

                {savedSubmissions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(savedSubmissions, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `neuron-draft-submissions-${Date.now()}.json`;
                        a.click();
                        toast.success('Downloaded submissions JSON!');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white flex items-center gap-2"
                    >
                      <Download size={14} /> Export JSON
                    </button>
                    <button
                      onClick={() => {
                        setSavedSubmissions([]);
                        localStorage.removeItem('neuron_draft_submissions_log');
                        toast.info('Cleared submission history.');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-mono font-bold flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Clear Log
                    </button>
                  </div>
                )}
              </div>
            </div>

            {savedSubmissions.length === 0 ? (
              <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
                  <Database size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">No Draft Submissions Recorded Yet</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Switch to the "Interactive Form Drafts" tab and click "Fill Sample Data" to simulate your first draft intake response.
                </p>
                <button
                  onClick={() => { setActiveMode('fill'); }}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider"
                >
                  Go to Forms Draft →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedSubmissions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="glass p-6 rounded-2xl border border-white/10 bg-black/60 hover:border-indigo-500/40 transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {sub.referenceCode}
                        </span>
                        <h4 className="text-lg font-bold text-white mt-1.5">{sub.formTitle}</h4>
                        <span className="text-xs font-mono text-gray-400">{sub.submittedAt}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(sub.data, null, 2), `sub_${idx}`)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5"
                      >
                        {copiedId === `sub_${idx}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        Copy Payload
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-black/80 border border-white/5 font-mono text-xs text-gray-300 overflow-x-auto">
                      <pre>{JSON.stringify(sub.data, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Forms;
