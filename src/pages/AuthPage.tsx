import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useAuth, computeRole, saveUserSettings, authMode } from '../context/AuthContext';
import { loginWithEmail, registerWithEmail } from '../services/firebase';
import { User, UserSettings } from '../types';

const studentPin = (import.meta.env.VITE_STUDENT_PIN || '2025').trim();
const adminPin = (import.meta.env.VITE_ADMIN_PIN || '1984').trim();

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pin, setPin] = useState('');
  const { login } = useAuth();
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
          // We need to fetch settings here, but they might not be in local context yet if we just logged in.
          // The AuthContext listener will handle the actual user setting state update, 
          // but here we want to manually trigger 'login' to ensure immediate feedback if needed,
          // although AuthContext listener is the source of truth for Firebase.
          // Actually, with Firebase listener, we might not need to call login() manually in AuthContext if the listener does it.
          // But the original code did both. Let's stick to original logic for safety.
          
          // Wait, original code called login() inside handleSubmit.
          // But AuthContext also has onAuthChange.
          // If onAuthChange fires, it calls setUser.
          // Calling login() also calls setUser.
          // It's redundant but harmless.
          
        } else {
          const cred = await registerWithEmail(trimmedEmail, password);
          const fbUser = cred.user;
          const settings: UserSettings = { aiEnabled: false };
          saveUserSettings(fbUser.uid, settings);
          // Registration success
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
        email: `${name.toLowerCase().replace(/\s+/g, '')}@class.local`,
        name,
        role,
        settings: { aiEnabled: false }
      };
      login(localUser);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 rounded-2xl shadow-2xl border-t-4 border-accent animate-fade-in">
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
          
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>}

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
