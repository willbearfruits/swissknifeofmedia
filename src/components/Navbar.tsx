import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Layers, Terminal, LogOut, Settings, PenTool, CloudUpload, RefreshCw, Sun, Moon, Sparkles, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { syncToGithub } from '../services/githubService';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const isActive = (path: string) => 
    location.pathname === path 
      ? "bg-white/20 text-white shadow-inner font-semibold" 
      : "text-red-100 hover:text-white hover:bg-white/10";

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4 mr-2" /> },
    { path: '/resources', label: 'Library', icon: <Layers className="w-4 h-4 mr-2" /> },
    { path: '/tutorials', label: 'Workshops', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { path: '/archive', label: 'Archive', icon: <Palette className="w-4 h-4 mr-2" /> },
    { path: '/tools', label: 'Workbench', icon: <Terminal className="w-4 h-4 mr-2" /> },
    { path: '/musrara', label: 'Musrara', icon: <Sparkles className="w-4 h-4 mr-2" /> },
  ];

  const handleSync = async () => {
    if (!user?.settings.githubToken) return;
    try {
      setIsSyncing(true);
      await syncToGithub(user.settings.githubToken);
      alert('Successfully synced changes to GitHub!');
    } catch (error) {
      console.error(error);
      alert('Failed to sync. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-primaryLight backdrop-blur-md text-white sticky top-0 z-50 shadow-md border-b border-red-800 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0 font-bold text-xl text-white flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white text-primaryLight rounded-md flex items-center justify-center shadow-md group-hover:rotate-3 transition-transform">
               <PenTool className="h-5 w-5" /> 
            </div>
            <span className="tracking-tight">The Rabbit Hole</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${isActive(link.path)}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'ADMIN' && user.settings.githubToken && (
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2" 
                    title="Sync changes to Cloud"
                  >
                    {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    <span className="text-xs font-medium hidden md:inline">Publish</span>
                  </button>
                )}
                
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/10 text-red-100 hover:text-white transition-colors" title="Toggle Theme">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

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
