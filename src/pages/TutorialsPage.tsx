import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '../components/Button';
import { getTutorials } from '../services/mockDb';
import { Tutorial } from '../types';
import { generateTutorResponse } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const TutorialsPage = () => {
  const { user } = useAuth();
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
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex gap-6 animate-fade-in">
      {/* Sidebar */}
      <div className="w-80 hidden md:flex flex-col gap-2 overflow-y-auto pr-2 border-r border-slate-200/60">
        <h3 className="font-bold text-lg mb-4 text-slate-800 px-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Workshops
        </h3>
        <div className="space-y-1">
            {tutorials.map(tut => (
            <button
                key={tut.id}
                onClick={() => { setSelectedTutorial(tut); setAiResponse(''); setAiQuery(''); }}
                className={`w-full text-left p-3 rounded-xl transition-all group relative overflow-hidden ${
                    selectedTutorial?.id === tut.id 
                        ? 'bg-gradient-to-r from-primary to-primaryLight text-white shadow-lg shadow-red-200' 
                        : 'hover:bg-white hover:shadow-sm text-slate-600'
                }`}
            >
                <div className="flex justify-between items-start relative z-10">
                    <div className="font-semibold pr-2">{tut.title}</div>
                    {selectedTutorial?.id === tut.id && <ChevronRight className="w-4 h-4 opacity-80" />}
                </div>
                <div className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full font-medium relative z-10 ${
                    selectedTutorial?.id === tut.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                }`}>
                {tut.difficulty}
                </div>
            </button>
            ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {selectedTutorial ? (
          <div className="flex flex-col h-full gap-6">
            {/* Tutorial Content */}
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 overflow-y-auto prose max-w-none custom-scrollbar">
              <h1 className="text-3xl font-bold text-primary mb-6 border-b pb-4 border-slate-100">{selectedTutorial.title}</h1>
              {(() => {
                const html = DOMPurify.sanitize(marked.parse(selectedTutorial.content) as string);
                return (
              <article
                className="tutorial-content font-sans text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: html }}
              />
                );
              })()}
            </div>

            {/* AI Assistant Panel */}
            {user?.settings.aiEnabled ? (
                <div className="bg-white border border-red-100 rounded-2xl p-4 flex flex-col gap-3 shadow-xl shadow-red-500/5 relative z-10">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-accent" />
                        AI Teaching Assistant
                    </div>
                    
                    {aiResponse && (
                        <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl text-slate-700 text-sm max-h-60 overflow-y-auto border border-red-100 shadow-inner custom-scrollbar">
                        <div className="flex gap-2">
                            <MessageSquare className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div>
                                <React.Markdown>{aiResponse}</React.Markdown>
                            </div>
                        </div>
                        </div>
                    )}

                    <form onSubmit={handleAskAi} className="flex gap-2">
                        <input 
                        type="text" 
                        placeholder="Ask about wiring, code, or signal flow..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                        value={aiQuery}
                        onChange={e => setAiQuery(e.target.value)}
                        />
                        <Button type="submit" isLoading={loadingAi} className="bg-primary hover:bg-primaryLight px-6 rounded-xl">
                        Ask
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-400 border border-slate-200 border-dashed">
                    AI Assistant is disabled. Enable it in <Link to="/settings" className="underline hover:text-primary font-medium">Settings</Link>.
                </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                 <BookOpen className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">Ready to Learn?</h3>
            <p className="text-slate-500 max-w-xs text-center">Select a workshop topic from the sidebar to begin your journey.</p>
          </div>
        )}
      </div>
    </div>
  );
};
