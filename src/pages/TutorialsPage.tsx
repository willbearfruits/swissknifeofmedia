import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, ChevronRight, MessageSquare, Plus, Edit, Trash2, RefreshCw, Download, FileText, Link as LinkIcon, CheckSquare, Square, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { getTutorials, addTutorial, updateTutorial, deleteTutorial, getResources } from '../services/mockDb';
import { Tutorial, Resource } from '../types';
import { generateTutorResponse } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { syncToGithub } from '../services/githubService';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Import the style
import { resolvePath } from '../utils/pathUtils';

export const TutorialsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [tags, setTags] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [relatedIds, setRelatedIds] = useState<string[]>([]);

  useEffect(() => {
    setTutorials(getTutorials());
    setResources(getResources());
  }, []);

  // Highlight code whenever selectedTutorial changes
  useEffect(() => {
    if (selectedTutorial) {
       setTimeout(() => {
         document.querySelectorAll('pre code').forEach((block) => {
           hljs.highlightElement(block as HTMLElement);
         });
       }, 100);
    }
  }, [selectedTutorial]);

  const refreshTutorials = () => {
    setTutorials(getTutorials());
    setResources(getResources());
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !selectedTutorial) return;
    
    setLoadingAi(true);
    const resp = await generateTutorResponse(aiQuery, selectedTutorial.content, user?.settings.geminiKey);
    setAiResponse(resp);
    setLoadingAi(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDifficulty('Beginner');
    setTags('');
    setVideoUrl('');
    setContent('# New Tutorial\n\nStart writing here...');
    setRelatedIds([]);
    setShowModal(true);
  };

  const openEditModal = (tut: Tutorial) => {
    setEditingId(tut.id);
    setTitle(tut.title);
    setDifficulty(tut.difficulty);
    setTags(tut.tags.join(', '));
    setVideoUrl(tut.videoUrl || '');
    setContent(tut.content);
    setRelatedIds(tut.relatedResourceIds || []);
    setShowModal(true);
  };

  const toggleRelatedResource = (resId: string) => {
    setRelatedIds(prev => 
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    
    const tutData: any = {
      title,
      difficulty: difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      tags: tagArray,
      videoUrl,
      content,
      relatedResourceIds: relatedIds
    };

    if (editingId) {
      updateTutorial(editingId, tutData);
      if (selectedTutorial?.id === editingId) {
        setSelectedTutorial(prev => prev ? { ...prev, ...tutData } : null);
      }
    } else {
      const newTut: Tutorial = {
        id: Date.now().toString(),
        ...tutData,
        isFeatured: false
      };
      addTutorial(newTut);
    }

    refreshTutorials();
    setShowModal(false);

    if (user?.settings.githubToken) {
        try {
            setIsSyncing(true);
            await syncToGithub(user.settings.githubToken);
        } catch (e) {
            alert('Saved locally, but failed to sync to GitHub. Check your Token.');
            console.error(e);
        } finally {
            setIsSyncing(false);
        }
    }
  };

  const handleDelete = async () => {
    if (selectedTutorial && confirm(`Delete tutorial "${selectedTutorial.title}"?`)) {
      deleteTutorial(selectedTutorial.id);
      setSelectedTutorial(null);
      refreshTutorials();

      if (user?.settings.githubToken) {
        try {
            setIsSyncing(true);
            await syncToGithub(user.settings.githubToken);
        } catch (e) {
            alert('Deleted locally, but failed to sync to GitHub.');
            console.error(e);
        } finally {
            setIsSyncing(false);
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex gap-6 animate-fade-in relative">
      {isSyncing && (
        <div className="fixed top-20 right-4 bg-white shadow-lg border border-slate-200 p-3 rounded-xl flex items-center gap-3 z-50 animate-bounce-in">
            <RefreshCw className="w-5 h-5 text-accent animate-spin" />
            <div className="text-sm font-medium text-slate-700">Syncing to Cloud...</div>
        </div>
      )}
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex-col gap-2 overflow-y-auto pr-2 border-r border-slate-200/60 ${selectedTutorial ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Workshops
            </h3>
            {isAdmin && (
                <button onClick={openAddModal} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-primary" title="Add Tutorial">
                    <Plus className="w-5 h-5" />
                </button>
            )}
        </div>
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
      <div className={`flex-1 flex-col h-full overflow-hidden relative ${selectedTutorial ? 'flex' : 'hidden md:flex'}`}>
        {selectedTutorial ? (
          <div className="flex flex-col h-full gap-6">
            {/* Tutorial Content */}
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start border-b pb-4 border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedTutorial(null)} className="md:hidden p-1 -ml-2 text-slate-500 hover:text-primary">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-primary m-0">{selectedTutorial.title}</h1>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditModal(selectedTutorial)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                    </div>
                  )}
              </div>
              
              {selectedTutorial.videoUrl && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-lg aspect-video bg-black">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={selectedTutorial.videoUrl} 
                    title={selectedTutorial.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose max-w-none prose-slate prose-pre:bg-slate-800 prose-pre:text-white prose-pre:rounded-xl prose-headings:text-slate-800">
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

              {/* Related Resources Section */}
              {selectedTutorial.relatedResourceIds && selectedTutorial.relatedResourceIds.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-accent" /> Downloads & Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources
                      .filter(r => selectedTutorial.relatedResourceIds?.includes(r.id))
                      .map(res => (
                        <div key={res.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-accent transition-colors group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white rounded-lg border border-slate-100">
                              {res.type === 'PDF' ? <FileText className="w-5 h-5 text-red-500" /> : 
                               res.type === 'LINK' ? <LinkIcon className="w-5 h-5 text-blue-500" /> :
                               <Download className="w-5 h-5 text-slate-500" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-700 truncate">{res.title}</div>
                              <div className="text-xs text-slate-400">{res.type}</div>
                            </div>
                          </div>
                          <a href={res.url.startsWith('/') ? resolvePath(res.url) : res.url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="secondary">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}
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

      {/* Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 space-y-4 shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Tutorial' : 'New Tutorial'}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Title</label>
                        <input required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Difficulty</label>
                        <select className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Video URL</label>
                    <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Tags</label>
                    <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" value={tags} onChange={e => setTags(e.target.value)} />
                </div>
                
                {/* Related Resources Selector */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Attach Resources</label>
                    <div className="h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                        {resources.map(res => (
                            <div 
                                key={res.id} 
                                onClick={() => toggleRelatedResource(res.id)}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer select-none transition-colors ${relatedIds.includes(res.id) ? 'bg-white border border-accent shadow-sm' : 'hover:bg-white'}`}
                            >
                                {relatedIds.includes(res.id) ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4 text-slate-400" />}
                                <span className="text-sm text-slate-700 truncate">{res.title}</span>
                            </div>
                        ))}
                        {resources.length === 0 && <div className="text-xs text-slate-400 p-2">No resources found. Add them in the Library first.</div>}
                    </div>
                </div>
            </div>

            <div className="flex flex-col h-full">
                <label className="block text-sm font-medium mb-1 text-slate-700">Content (Markdown)</label>
                <textarea required className="w-full flex-1 border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none font-mono text-sm" value={content} onChange={e => setContent(e.target.value)} />
                
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSave}>{editingId ? 'Update' : 'Save'}</Button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
