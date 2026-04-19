
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, LogIn, LogOut, Send, X, 
  BookOpen, Cpu, Globe, User, Calendar, Tag,
  ChevronRight, Loader2, MessageSquare, Zap,
  Edit, Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { blogService } from '../services/blog.ts';
import { supabase } from '../lib/storage.ts';
import { BlogPost, BlogCategory } from '../lib/types.ts';
import { useToast } from '../context/ToastContext.tsx';
import { executeRecaptcha, loadRecaptcha } from '../lib/recaptcha.ts';
import DecryptedText from '../components/DecryptedText.tsx';

const Blog: React.FC = () => {
  const m = motion as any;
  const toast = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<BlogCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authHoneypot, setAuthHoneypot] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile State
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Editor State
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: BlogCategory.GENERAL
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
    checkUser();
    loadRecaptcha();

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await blogService.getPosts(category === 'All' ? undefined : category);
    setPosts(data);
    setLoading(false);
  };

  const checkUser = async () => {
    const currentUser = await blogService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const profile = await blogService.getProfile(currentUser.id);
      setProfileData(profile);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const res = await blogService.updateProfile({ full_name: profileData.full_name });
    if (res.success) {
      toast.success("Neural Identity updated.");
      setShowProfile(false);
      await checkUser(); // Refresh local profile state
      fetchPosts();      // Refresh posts names
    } else {
      toast.error(`Update Error: ${res.error}`);
    }
    setIsUpdatingProfile(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Honeypot Check
    if (authHoneypot) {
      console.warn("NEURØN Security: Honeypot triggered.");
      return; // Silently fail for bots
    }

    setAuthLoading(true);
    try {
      const email = authEmail.trim();
      // 2. reCAPTCHA Check
      const token = await executeRecaptcha('blog_auth');
      if (!token) {
        throw new Error("Neural verification failed. Are you a bot?");
      }

      if (authPassword.length < 6) {
        throw new Error("Secure Key must be at least 6 characters.");
      }

      if (authMode === 'signUp') {
        if (!authName) throw new Error("Display Name required for new nodes.");
        await blogService.signUp(email, authPassword, authName);
        toast.success("Neural Identity established. Access Grid synchronized.");
      } else {
        await blogService.signIn(email, authPassword);
        toast.success("Neural Link established.");
      }
      setShowAuth(false);
      await checkUser(); // Refresh user and profile state immediately
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      console.error("NEURØN Auth Error:", err);
      // Show the actual message from Supabase (like "Email not confirmed")
      toast.error(`Auth Failure: ${err.error_description || err.message || 'Signal lost.'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await blogService.signOut();
    setUser(null);
    toast.info("Neural Link severed.");
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content || !newPost.excerpt) {
      toast.error("Manifest incomplete. Fill all fields.");
      return;
    }

    setLoading(true);
    const res = isEditing && editingId 
      ? await blogService.updatePost(editingId, newPost)
      : await blogService.createPost(newPost);
      
    if (res.success) {
      toast.success(isEditing ? "Knowledge Node recalibrated." : "Knowledge Node anchored to grid.");
      closeEditor();
      fetchPosts();
    } else {
      toast.error(`Write Error: ${res.error}`);
    }
    setLoading(false);
  };

  const handleEditPost = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    setNewPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category
    });
    setEditingId(post.id);
    setIsEditing(true);
    setShowEditor(true);
  };

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to sever this Knowledge Node? This action is irreversible.")) return;

    setLoading(true);
    const res = await blogService.deletePost(id);
    if (res.success) {
      toast.success("Knowledge Node severed.");
      fetchPosts();
    } else {
      toast.error(`Severance Error: ${res.error}`);
    }
    setLoading(false);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setIsEditing(false);
    setEditingId(null);
    setNewPost({ title: '', content: '', excerpt: '', category: BlogCategory.GENERAL });
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 min-h-screen px-6 pb-40">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[160px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 blur-[160px] rounded-full opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-6">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
            >
              <BookOpen size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400 font-mono">Neural Archive Access</span>
            </m.div>
            
            <h1 className="text-6xl md:text-[7.5rem] font-black tracking-tighter leading-[0.95] text-white uppercase select-none">
              <span className="block opacity-90"><DecryptedText text="KNOWLEDGE" /></span>
              <span className="block mt-[-0.2em]">
                <DecryptedText 
                  text="NODES" 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent italic pr-4"
                />
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="p-3 glass border-white/10 rounded-full text-indigo-400 hover:text-indigo-300 transition-all shadow-lg"
                  title="Profile Metadata"
                >
                  <User size={18} />
                </button>
                <button 
                  onClick={() => setShowEditor(true)}
                  className="px-6 py-3 bg-indigo-600 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={16} /> New Post
                </button>
                <button 
                  onClick={handleSignOut}
                  className="p-3 glass border-white/10 rounded-full text-gray-400 hover:text-red-400 transition-all"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)}
                className="px-6 py-3 glass border-white/10 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <LogIn size={16} /> Author Login
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex p-1 glass border-white/5 rounded-full w-full md:w-auto">
            {['All', BlogCategory.GENERAL, BlogCategory.TECHNICAL].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat as any)}
                className={`flex-1 md:flex-none px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  category === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96 group">
            <input 
              type="text"
              placeholder="Search Archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all font-mono"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em]">Decrypting Archive...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <m.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass group rounded-[2.5rem] border-white/5 overflow-hidden hover:bg-white/[0.03] transition-all duration-500 flex flex-col cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedPost(post)}
              >
                <div className="p-8 flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      post.category === BlogCategory.TECHNICAL ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-purple-500/30 text-purple-400 bg-purple-500/5'
                    }`}>
                      {post.category}
                    </div>
                    {user?.id === post.author_id ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleEditPost(e, post)}
                          className="p-2 glass border-white/10 rounded-full text-indigo-400 hover:text-indigo-300 transition-all"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={(e) => handleDeletePost(e, post.id)}
                          className="p-2 glass border-white/10 rounded-full text-red-500/50 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-500 text-sm font-light leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                      {post.profiles?.full_name?.[0].toUpperCase() || 'A'}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{post.profiles?.full_name || 'Anonymous'}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedPost(post)}
                    className="text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </m.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 space-y-4">
            <Zap className="mx-auto text-gray-800" size={48} />
            <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">No nodes found in this sector.</p>
          </div>
        )}
      </div>

      {/* Post View Modal */}
      <AnimatePresence>
        {selectedPost && (
          <m.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/90 backdrop-blur-2xl overflow-y-auto pt-20 pb-20"
          >
            <m.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-4xl p-10 md:p-16 rounded-[3rem] border-white/10 relative my-auto"
            >
              <button onClick={() => setSelectedPost(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      selectedPost.category === BlogCategory.TECHNICAL ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-purple-500/30 text-purple-400 bg-purple-500/5'
                    }`}>
                      {selectedPost.category}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      {new Date(selectedPost.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase italic">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {selectedPost.profiles?.full_name?.[0].toUpperCase() || 'A'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-white uppercase tracking-widest">{selectedPost.profiles?.full_name || 'Anonymous'}</span>
                      <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Neural Contributor</span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none prose-sm md:prose-base font-light leading-relaxed text-gray-300">
                  <ReactMarkdown>
                    {DOMPurify.sanitize(selectedPost.content)}
                  </ReactMarkdown>
                </div>

                <div className="pt-12 border-t border-white/5 flex justify-between items-center">
                   <div className="flex gap-4">
                      <button className="flex items-center gap-2 text-[10px] font-mono text-gray-500 hover:text-indigo-400 transition-colors">
                        <MessageSquare size={14} /> Discuss Node
                      </button>
                      <button className="flex items-center gap-2 text-[10px] font-mono text-gray-500 hover:text-indigo-400 transition-colors">
                        <Zap size={14} /> Amplify
                      </button>
                   </div>
                   <button 
                    onClick={() => setSelectedPost(null)}
                    className="px-8 py-3 glass border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                   >
                    Close Node
                   </button>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <m.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-6 md:p-12 bg-black/85 backdrop-blur-2xl overflow-y-auto"
          >
            <m.div 
              initial={{ scale: 0.95, y: 30 }} 
              animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-md p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 relative mt-24 mb-12 shadow-2xl"
            >
              <button 
                onClick={() => setShowAuth(false)} 
                className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-5 mb-10">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-[1.25rem] flex items-center justify-center text-indigo-500 mx-auto border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                  <LogIn size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
                    {authMode === 'signIn' ? 'Author Portal' : 'Join Collective'}
                  </h2>
                  <p className="text-gray-400 text-[10px] md:text-xs font-light leading-relaxed max-w-[250px] mx-auto">
                    {authMode === 'signIn' 
                      ? 'Enter your credentials to synchronize with the neural grid.' 
                      : 'Establish your neural identity and join the synthetic collective.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {/* Honeypot field - hidden from humans */}
                <div className="hidden" aria-hidden="true">
                  <input 
                    type="text" 
                    value={authHoneypot} 
                    onChange={(e) => setAuthHoneypot(e.target.value)} 
                    tabIndex={-1} 
                    autoComplete="off" 
                  />
                </div>

                {authMode === 'signUp' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Display Name</label>
                    <input 
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Neural Architect"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-mono text-xs md:text-sm"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Neural Address</label>
                  <input 
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-mono text-xs md:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Secure Key</label>
                  <input 
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-mono text-xs md:text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 md:py-5 bg-indigo-600 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] md:text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {authLoading ? <Loader2 className="animate-spin" /> : <>{authMode === 'signIn' ? <><LogIn size={18} /> Access Grid</> : <><Send size={18} /> Establish Link</>}</>}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}
                    className="text-[9px] font-mono text-gray-600 uppercase tracking-widest hover:text-indigo-400 transition-colors py-2 px-4"
                  >
                    {authMode === 'signIn' ? "New contributor? Join Collective" : "Already established? Author Portal"}
                  </button>
                </div>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <m.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl overflow-y-auto pt-20 pb-20"
          >
            <m.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-4xl p-10 rounded-[3rem] border-white/10 relative my-auto"
            >
              <button onClick={closeEditor} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
              
              <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                {isEditing ? <Edit className="text-indigo-500" size={32} /> : <Plus className="text-indigo-500" size={32} />}
                <h2 className="text-3xl font-black uppercase tracking-widest">{isEditing ? 'Recalibrate Node' : 'Anchor New Node'}</h2>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Node Title</label>
                      <input 
                        required
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        placeholder="The Future of Synthetic Intelligence"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Excerpt (Brief Summary)</label>
                      <textarea 
                        required
                        value={newPost.excerpt}
                        onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                        placeholder="A brief overview of the knowledge node..."
                        rows={3}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 transition-all font-mono text-sm resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Classification</label>
                      <div className="flex gap-4">
                        {[BlogCategory.GENERAL, BlogCategory.TECHNICAL].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewPost({...newPost, category: cat})}
                            className={`flex-1 py-4 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all ${
                              newPost.category === cat ? 'bg-indigo-600 border-indigo-400 text-white' : 'glass border-white/5 text-gray-500'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Manifest Content (Markdown Supported)</label>
                    <textarea 
                      required
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      placeholder="# Heading\n\nYour content here..."
                      className="w-full h-[300px] bg-white/[0.02] border border-white/10 rounded-2xl p-5 outline-none focus:border-indigo-500 transition-all font-mono text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-12 py-5 bg-indigo-600 rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:bg-indigo-500 transition-all shadow-xl flex items-center justify-center gap-4"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>{isEditing ? <Zap size={18} /> : <Plus size={18} />} {isEditing ? 'Recalibrate' : 'Anchor to Grid'}</>}
                  </button>
                </div>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && profileData && (
          <m.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto"
          >
            <m.div 
              initial={{ scale: 0.9, y: 30 }} 
              animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-md p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 relative my-auto shadow-2xl"
            >
              <button 
                onClick={() => setShowProfile(false)} 
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-5 mb-10">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                  <User size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">Neural Identity</h2>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Display Name</label>
                    <input 
                      type="text"
                      required
                      value={profileData.full_name || ''}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      placeholder="Neural Architect"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 outline-none focus:border-indigo-500/50 transition-all font-mono text-xs md:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 px-2">
                    <p className="text-[8px] uppercase text-gray-600 tracking-widest">Neural Link UID</p>
                    <p className="text-[9px] font-mono text-indigo-500/60 truncate">{user?.id}</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-5 bg-indigo-600 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] md:text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                >
                  {isUpdatingProfile ? <Loader2 className="animate-spin" /> : <>Synchronize Profile</>}
                </button>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog;
