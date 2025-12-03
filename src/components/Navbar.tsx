import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Layers, Terminal, LogOut, Settings, PenTool, CloudUpload, RefreshCw, Sun, Moon, Sparkles, Palette, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { syncToGithub } from '../services/githubService';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
          
          {/* Desktop Nav */}
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

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                {user.role === 'ADMIN' && user.settings.githubToken && (
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2 hidden md:flex" 
                    title="Sync changes to Cloud"
                  >
                    {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    <span className="text-xs font-medium">Publish</span>
                  </button>
                )}
                
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/10 text-red-100 hover:text-white transition-colors" title="Toggle Theme">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="hidden md:flex items-center gap-2">
                    <Link to="/settings" className="p-2 rounded-full hover:bg-black/10 text-red-100 hover:text-white transition-colors" title="Settings">
                    <Settings className="w-5 h-5" />
                    </Link>
                    <button onClick={logout} className="p-2 text-red-100 hover:text-white hover:bg-black/10 rounded-full" title="Logout">
                    <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
                <span className="text-sm text-red-200">Not logged in</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && user && (
        <div className="md:hidden bg-primary border-t border-white/10 px-4 pt-2 pb-4 space-y-1 absolute w-full left-0 shadow-xl animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors flex items-center ${isActive(link.path)}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 my-2 pt-2 space-y-1">
                <Link to="/settings" className="block px-3 py-3 rounded-lg text-base font-medium text-red-100 hover:bg-white/10 flex items-center">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                </Link>
                {user.role === 'ADMIN' && user.settings.githubToken && (
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-red-100 hover:bg-white/10 flex items-center"
                    >
                        {isSyncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CloudUpload className="w-4 h-4 mr-2" />}
                        Publish Changes
                    </button>
                )}
                <button 
                    onClick={logout}
                    className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-red-100 hover:bg-white/10 flex items-center"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
            </div>
        </div>
      )}
    </nav>
  );
};
