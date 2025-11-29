import React, { useState, useEffect, useContext, createContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, BookOpen, Layers, Terminal, LogOut, Upload, Settings, Zap, Star, PenTool } from 'lucide-react';
import { Button } from './components/Button';
import { SerialMonitor } from './components/SerialMonitor';
import { ResistorCalculator } from './components/ResistorCalculator';
import { CapacitorCalculator } from './components/CapacitorCalculator';
import { getResources, addResource, deleteResource, getTutorials, toggleFeaturedResource } from './services/mockDb';
import { Resource, ResourceType, Tutorial, User, UserSettings } from './types';
import { generateTutorResponse } from './services/geminiService';
import { loginWithEmail, registerWithEmail, logout as firebaseLogout, onAuthChange, isFirebaseEnabled } from './services/firebase';

const adminAllowlist = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const studentPin = (import.meta.env.VITE_STUDENT_PIN || '2025').trim();
const adminPin = (import.meta.env.VITE_ADMIN_PIN || '1984').trim();
const authMode: 'firebase' | 'pin' = isFirebaseEnabled ? 'firebase' : 'pin';

const computeRole = (email?: string): 'ADMIN' | 'STUDENT' => {
  if (!email) return 'STUDENT';
  const normalized = email.toLowerCase();
  if (adminAllowlist.includes(normalized) || normalized.includes('admin')) {
    return 'ADMIN';
  }
  return 'STUDENT';
};

const userSettingsKey = (userId: string) => `eduhub_settings_${userId}`;

const getUserSettings = (userId: string): UserSettings => {
  try {
    const stored = localStorage.getItem(userSettingsKey(userId));
    if (stored) return JSON.parse(stored) as UserSettings;
  } catch (error) {
    console.error('Failed to parse settings', error);
  }
  return { aiEnabled: false };
};

const saveUserSettings = (userId: string, settings: UserSettings) => {
  localStorage.setItem(userSettingsKey(userId), JSON.stringify(settings));
};

// --- Auth Context ---

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  updateSettings: (s: UserSettings) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {}, updateSettings: () => {} });

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authMode === 'firebase') {
      const unsub = onAuthChange((firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          return;
        }
        const role = computeRole(firebaseUser.email);
        const settings = getUserSettings(firebaseUser.uid);
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role,
          settings,
        });
      });
      return () => unsub();
    } else {
      const stored = localStorage.getItem('eduhub_current_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse user from storage', error);
          localStorage.removeItem('eduhub_current_user');
        }
      }
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    if (authMode === 'pin') {
      localStorage.setItem('eduhub_current_user', JSON.stringify(u));
    }
  };

  const logout = () => {
    if (authMode === 'firebase') {
      firebaseLogout();
    }
    if (authMode === 'pin') {
      localStorage.removeItem('eduhub_current_user');
    }
    setUser(null);
  };

  const updateSettings = (s: UserSettings) => {
    if (user) {
      const updatedUser = { ...user, settings: s };
      setUser(updatedUser);
      saveUserSettings(user.id, s);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Navbar ---

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "bg-white/20 text-white shadow-inner font-semibold" : "text-red-100 hover:text-white hover:bg-white/10";

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4 mr-2" /> },
    { path: '/resources', label: 'Library', icon: <Layers className="w-4 h-4 mr-2" /> },
    { path: '/tutorials', label: 'Workshops', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { path: '/tools', label: 'Workbench', icon: <Terminal className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="bg-primaryLight backdrop-blur-md text-white sticky top-0 z-50 shadow-md border-b border-red-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0 font-bold text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-primaryLight rounded-md flex items-center justify-center shadow-md">
               <PenTool className="h-5 w-5" /> 
            </div>
            SwissKnife<span className="opacity-80 font-normal">OfMedia</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${isActive(link.path)}`}
              >
                <div className="flex items-center">{link.icon} {link.label}</div>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/settings" className="p-2 rounded-full hover:bg-black/10 text-red-100 hover:text-white transition-colors" title="Settings">
                  <Settings className="w-5 h-5" />
                </Link>
                {user.role === 'ADMIN' && (
                    <span className="px-2 py-1 text-xs font-bold bg-white text-primaryLight border border-white/20 rounded shadow-sm">ADMIN</span>
                )}
                <button onClick={logout} className="p-2 text-red-100 hover:text-white hover:bg-black/10 rounded-full" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
                <span className="text-sm text-red-200">Not logged in</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Auth Page ---

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('');
  const { login } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (authMode === 'firebase') {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail || !password) {
        setError('Email and password are required.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      try {
        setIsSubmitting(true);
        if (isLogin) {
          const cred = await loginWithEmail(trimmedEmail, password);
          const fbUser = cred.user;
          const settings = getUserSettings(fbUser.uid);
          login({
            id: fbUser.uid,
            email: fbUser.email || trimmedEmail,
            name: fbUser.displayName || trimmedEmail.split('@')[0],
            role: computeRole(fbUser.email || trimmedEmail),
            settings,
          });
        } else {
          const cred = await registerWithEmail(trimmedEmail, password);
          const fbUser = cred.user;
          const settings: UserSettings = { aiEnabled: false };
          saveUserSettings(fbUser.uid, settings);
          login({
            id: fbUser.uid,
            email: fbUser.email || trimmedEmail,
            name: fbUser.displayName || trimmedEmail.split('@')[0],
            role: computeRole(fbUser.email || trimmedEmail),
            settings,
          });
          setPassword('');
          setEmail('');
        }
      } catch (err) {
        console.error('Auth error', err);
        const message = (err as Error).message || 'Something went wrong. Please try again.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const enteredPin = pin.trim();
      const name = displayName.trim() || 'Student';
      if (!enteredPin) {
        setError('Enter the class PIN.');
        return;
      }
      const role = enteredPin === adminPin ? 'ADMIN' : enteredPin === studentPin ? 'STUDENT' : null;
      if (!role) {
        setError('Invalid PIN. Ask your instructor for today’s PIN.');
        return;
      }
      const localUser: User = {
        id: `local-${Date.now()}`,
        email: `${name.toLowerCase().replace(/\\s+/g, '')}@class.local`,
        name,
        role,
        settings: { aiEnabled: false }
      };
      login(localUser);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl shadow-2xl border-t-4 border-accent">
        <h2 className="text-3xl font-bold text-primary mb-2 text-center">
          {authMode === 'firebase' ? (isLogin ? 'Media Lab Access' : 'Join the Workshop') : 'Enter Class PIN'}
        </h2>
        <p className="text-slate-500 text-center mb-8">
          {authMode === 'firebase'
            ? isLogin ? 'Access your synth & art tools' : 'Create your creative profile'
            : 'Use the classroom PIN to get started. Admins use the instructor PIN.'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'firebase' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="artist@studio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="Student name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class PIN</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="Enter PIN from instructor"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                />
              </div>
            </>
          )}
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button 
            type="submit" 
            className="w-full py-3 text-lg shadow-lg shadow-red-500/30"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {authMode === 'firebase' ? (isLogin ? 'Enter Lab' : 'Register') : 'Enter Lab'}
          </Button>
        </form>

        {authMode === 'firebase' && (
          <div className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? "New to the workshop? " : "Already have access? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-accent font-bold hover:underline">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Views ---

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const resources = getResources();
  const featured = resources.filter(r => r.isFeatured);

  return (
    <div className="animate-fade-in space-y-12 pb-12">
      {/* Hero */}
      <section className="text-center space-y-6 py-20 px-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-sm font-bold mb-2 border border-red-200">
            v2.1 Media Arts Edition
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight">
          Create. <span className="text-accent">Synthesize.</span> Perform.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The Swiss Army Knife for <strong>New Media Artists</strong> & <strong>Synth Builders</strong>. 
          Manage course materials, calculate filter components, and flash your DIY instruments.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/tutorials">
            <Button size="lg" className="shadow-xl shadow-red-500/20">Start Building</Button>
          </Link>
          <Link to="/tools">
             <Button size="lg" variant="secondary">Open Workbench</Button>
          </Link>
        </div>
      </section>

      {/* Featured Resources (Course Front) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <h2 className="text-2xl font-bold text-slate-800">Featured Course Materials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.length > 0 ? featured.map(res => (
                <div key={res.id} className="bg-white p-6 rounded-2xl shadow-md border border-red-50 hover:border-accent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-100 to-transparent opacity-50 rounded-bl-full -mr-8 -mt-8"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${res.type === ResourceType.PDF ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        {res.type}
                        </span>
                        <a href={res.url} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost">View</Button>
                        </a>
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 mb-2 relative z-10">{res.title}</h3>
                    <p className="text-slate-500 text-sm relative z-10">{res.description}</p>
                </div>
            )) : (
                <p className="text-slate-400 italic">No featured content at the moment.</p>
            )}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
    const { user, updateSettings } = useContext(AuthContext);
    const [aiEnabled, setAiEnabled] = useState(user?.settings.aiEnabled || false);
    const [geminiKey, setGeminiKey] = useState(user?.settings.geminiKey || '');
    const [openaiKey, setOpenaiKey] = useState(user?.settings.openaiKey || '');
    const [claudeKey, setClaudeKey] = useState(user?.settings.claudeKey || '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        updateSettings({
            aiEnabled,
            geminiKey,
            openaiKey,
            claudeKey
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">User Settings</h2>
            
            <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-red-50/30">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" /> AI Lab Assistant
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-slate-600">Enable AI Tutor in Workshops</label>
                        <button 
                            onClick={() => setAiEnabled(!aiEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${aiEnabled ? 'bg-accent' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${aiEnabled ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500">
                        When enabled, an AI chat interface will appear in the tutorial section to help with code and circuit debugging. 
                        You must provide at least one API key below.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
                        <input 
                            type="password" 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-accent focus:border-accent" 
                            value={geminiKey} 
                            onChange={e => setGeminiKey(e.target.value)} 
                            placeholder="AIza..." 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ChatGPT API Key</label>
                        <input 
                            type="password" 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-accent focus:border-accent" 
                            value={openaiKey} 
                            onChange={e => setOpenaiKey(e.target.value)} 
                            placeholder="sk-..." 
                            disabled 
                        />
                         <p className="text-xs text-slate-400 mt-1">ChatGPT support coming soon.</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Claude API Key</label>
                        <input 
                            type="password" 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-accent focus:border-accent" 
                            value={claudeKey} 
                            onChange={e => setClaudeKey(e.target.value)} 
                            placeholder="sk-ant..." 
                            disabled 
                        />
                        <p className="text-xs text-slate-400 mt-1">Claude support coming soon.</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 flex justify-end">
                    <Button onClick={handleSave} className="w-32">
                        {saved ? 'Saved!' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const ResourcesPage = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const [resources, setResources] = useState<Resource[]>(getResources());
  const [filter, setFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Resource Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ResourceType>(ResourceType.LINK);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filtered = resources.filter(r => 
    r.title.toLowerCase().includes(filter.toLowerCase()) || 
    r.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (confirm('Delete this resource?')) {
      deleteResource(id);
      setResources(getResources());
    }
  };

  const handleToggleFeatured = (id: string) => {
      toggleFeaturedResource(id);
      setResources(getResources());
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: Resource = {
      id: Date.now().toString(),
      title: newTitle,
      type: newType,
      url: newUrl,
      description: newDesc,
      tags: ['New'],
      dateAdded: new Date().toISOString().split('T')[0],
      isFeatured: false
    };
    addResource(newRes);
    setResources(getResources());
    setShowAddModal(false);
    setNewTitle(''); setNewUrl(''); setNewDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Media Library</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search schematics, code, docs..." 
            className="px-4 py-2 border border-slate-300 rounded-lg flex-1 md:w-64 focus:ring-2 focus:ring-accent outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {isAdmin && (
            <Button onClick={() => setShowAddModal(true)}>
              <Upload className="h-4 w-4 mr-2" /> Add
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(res => (
          <div key={res.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-accent transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-xs font-bold px-2 py-1 rounded ${res.type === ResourceType.PDF ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                  {res.type}
                </span>
                <h3 className="font-bold text-lg text-slate-800">{res.title}</h3>
                {res.isFeatured && <Star className="w-4 h-4 text-accent fill-accent" />}
              </div>
              <p className="text-slate-600 text-sm mb-2">{res.description}</p>
              <div className="flex gap-2">
                {res.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{t}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={res.url} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm">Download</Button>
              </a>
              {isAdmin && (
                <>
                    <button 
                        onClick={() => handleToggleFeatured(res.id)} 
                        className={`p-2 rounded hover:bg-slate-100 ${res.isFeatured ? 'text-accent' : 'text-slate-400'}`}
                        title="Toggle Featured"
                    >
                        <Star className={`w-4 h-4 ${res.isFeatured ? 'fill-accent' : ''}`} />
                    </button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(res.id)}>Delete</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold">Add Resource</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="w-full border p-2 rounded focus:ring-accent" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border p-2 rounded" value={newType} onChange={e => setNewType(e.target.value as ResourceType)}>
                  {Object.values(ResourceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input required className="w-full border p-2 rounded" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required className="w-full border p-2 rounded" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TutorialsPage = () => {
  const { user } = useContext(AuthContext);
  const [tutorials] = useState<Tutorial[]>(getTutorials());
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !selectedTutorial) return;
    
    setLoadingAi(true);
    // Pass user's key preference
    const resp = await generateTutorResponse(aiQuery, selectedTutorial.content, user?.settings.geminiKey);
    setAiResponse(resp);
    setLoadingAi(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex gap-6">
      <div className="w-1/4 hidden md:flex flex-col gap-2 overflow-y-auto pr-2 border-r border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Workshops</h3>
        {tutorials.map(tut => (
          <button
            key={tut.id}
            onClick={() => { setSelectedTutorial(tut); setAiResponse(''); setAiQuery(''); }}
            className={`text-left p-3 rounded-lg transition-all ${selectedTutorial?.id === tut.id ? 'bg-primary text-white shadow-lg transform scale-105' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
          >
            <div className="font-medium">{tut.title}</div>
            <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${selectedTutorial?.id === tut.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
              {tut.difficulty}
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedTutorial ? (
          <div className="flex flex-col h-full gap-6">
            <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-slate-200 overflow-y-auto prose max-w-none">
              <h1 className="text-3xl font-bold text-primary mb-6">{selectedTutorial.title}</h1>
              <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">{selectedTutorial.content}</div>
            </div>

            {user?.settings.aiEnabled ? (
                <div className="bg-white border border-red-200 rounded-xl p-4 flex flex-col gap-4 shadow-lg shadow-red-100">
                <div className="flex items-center gap-2 text-primary font-bold">
                    <Zap className="w-4 h-4 text-accent" />
                    AI Teaching Assistant
                </div>
                
                {aiResponse && (
                    <div className="bg-red-50 p-4 rounded-lg text-slate-700 text-sm max-h-40 overflow-y-auto border border-red-100">
                    {aiResponse}
                    </div>
                )}

                <form onSubmit={handleAskAi} className="flex gap-2">
                    <input 
                    type="text" 
                    placeholder="Ask about wiring, code, or signal flow..." 
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-300 outline-none transition-shadow"
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    />
                    <Button type="submit" isLoading={loadingAi} className="bg-primary hover:bg-primaryLight">
                    Ask
                    </Button>
                </form>
                </div>
            ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-400 border border-slate-200 border-dashed">
                    AI Assistant is disabled. Enable it in <Link to="/settings" className="underline hover:text-primary">Settings</Link>.
                </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <BookOpen className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-xl font-light">Select a workshop topic to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Media Lab Workbench</h2>
        <p className="text-slate-600">Calculators for Filters/LEDs, Flashers for Daisy/ESP32, and Serial Monitors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ResistorCalculator />
        <CapacitorCalculator />
      </div>

      <div className="mt-8">
        <SerialMonitor />
      </div>
    </div>
  );
};

// --- App Root ---

const AppContent = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans">
      <Navbar />
      <main className="pb-12">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
