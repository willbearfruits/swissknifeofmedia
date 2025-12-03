import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, ChevronRight, MessageSquare, Plus, Edit, Trash2, RefreshCw, Download, FileText, Link as LinkIcon, CheckSquare, Square, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../components/Button';
import { getTutorials, addTutorial, updateTutorial, deleteTutorial, getResources } from '../services/mockDb';
import { Tutorial, Resource, ResourceType } from '../types';
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
  const [showImagePicker, setShowImagePicker] = useState(false);

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
    setShowImagePicker(false);
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
    setShowImagePicker(false);
    setShowModal(true);
  };

  const toggleRelatedResource = (resId: string) => {
    setRelatedIds(prev => 
      prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
    );
  };

  const insertImage = (url: string, alt: string) => {
    const imageMarkdown = `\n![${alt}](${url})\n`;
    setContent(prev => prev + imageMarkdown);
    setShowImagePicker(false);
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

  const imageResources = resources.filter(r => r.type === ResourceType.IMAGE);

  const filteredTutorials = tutorials.filter(t => 
    t.title.toLowerCase().includes(title.toLowerCase()) || 
    t.tags.some(tag => tag.toLowerCase().includes(title.toLowerCase()))
  );

  // Overhauled View: Two modes - "Grid" and "Detail"
  if (selectedTutorial) {
      // Detail View (Reading Mode)
      return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
                <button onClick={() => { setSelectedTutorial(null); setAiResponse(''); }} className="flex items-center text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Workshops
                </button>
                
                {isAdmin && (
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditModal(selectedTutorial)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
                <div className="border-b border-slate-100 pb-6 mb-8">
                    <div className="flex gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            selectedTutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                            selectedTutorial.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {selectedTutorial.difficulty}
                        </span>
                        {selectedTutorial.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">#{tag}</span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{selectedTutorial.title}</h1>
                </div>

                {selectedTutorial.videoUrl && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-lg aspect-video bg-black">
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

                <div className="prose prose-lg max-w-none prose-slate prose-headings:font-bold prose-a:text-primary hover:prose-a:text-accent">
                    {(() => {
                        const html = DOMPurify.sanitize(marked.parse(selectedTutorial.content) as string);
                        return (
                            <article
                                className="tutorial-content"
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        );
                    })()}
                </div>

                {/* Resources Footer */}
                {selectedTutorial.relatedResourceIds && selectedTutorial.relatedResourceIds.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Download className="w-5 h-5 text-accent" /> Downloads & Materials
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {resources
                                .filter(r => selectedTutorial.relatedResourceIds?.includes(r.id))
                                .map(res => (
                                    <a key={res.id} href={res.url.startsWith('/') ? resolvePath(res.url) : res.url} target="_blank" rel="noreferrer" 
                                       className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-accent/50 transition-all group">
                                        <div className="p-3 bg-white rounded-lg shadow-sm text-primary group-hover:text-accent transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-800 truncate">{res.title}</div>
                                            <div className="text-xs text-slate-500">{res.type}</div>
                                        </div>
                                    </a>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* AI Assistant (Fixed Bottom-Right or Inline?) Let's keep it inline at bottom for mobile friendless or fixed FAB? 
                Inline is safer for layout overhaul. 
            */}
            {user?.settings.aiEnabled && (
                <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg"><Zap className="w-5 h-5 text-yellow-400" /></div>
                        <h3 className="font-bold text-lg">AI Teaching Assistant</h3>
                    </div>
                    
                    {aiResponse && (
                        <div className="bg-white/10 p-4 rounded-xl mb-4 text-sm leading-relaxed border border-white/5">
                            <React.Markdown>{aiResponse}</React.Markdown>
                        </div>
                    )}

                    <form onSubmit={handleAskAi} className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Confused? Ask specifically about this tutorial..." 
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:bg-white/10 outline-none transition-all text-sm text-white placeholder-white/30"
                            value={aiQuery}
                            onChange={e => setAiQuery(e.target.value)}
                        />
                        <Button type="submit" isLoading={loadingAi} className="bg-white text-slate-900 hover:bg-white/90 px-6 rounded-xl font-bold">
                            Ask
                        </Button>
                    </form>
                </div>
            )}
        </div>
      );
  }

  // Grid View (List)
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-fade-in relative">
      {isSyncing && (
        <div className="fixed top-20 right-4 bg-white shadow-lg border border-slate-200 p-3 rounded-xl flex items-center gap-3 z-50 animate-bounce-in">
            <RefreshCw className="w-5 h-5 text-accent animate-spin" />
            <div className="text-sm font-medium text-slate-700">Syncing to Cloud...</div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Workshops</h1>
            <p className="text-slate-500">Practical guides for hardware hacking and synthesis.</p>
        </div>
        {isAdmin && (
            <Button onClick={openAddModal} className="shadow-lg shadow-red-200">
                <Plus className="w-5 h-5 mr-2" /> Create Workshop
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map(tut => (
            <div 
                key={tut.id} 
                onClick={() => setSelectedTutorial(tut)}
                className="bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
            >
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                    tut.difficulty === 'Beginner' ? 'bg-green-400' : 
                    tut.difficulty === 'Intermediate' ? 'bg-orange-400' : 'bg-red-500'
                }`} />
                
                <div className="mb-4">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                        tut.difficulty === 'Beginner' ? 'bg-green-50 text-green-600' : 
                        tut.difficulty === 'Intermediate' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                        {tut.difficulty}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">
                        {tut.title}
                    </h3>
                </div>
                
                <div className="flex-1">
                    <p className="text-slate-500 text-sm line-clamp-3">
                        {tut.content.replace(/[#*`]/g, '').slice(0, 150)}...
                    </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-400">
                    <div className="flex gap-2">
                        {tut.tags.slice(0, 2).map(t => <span key={t}>#{t}</span>)}
                    </div>
                    <span className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Start <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                </div>
            </div>
        ))}
      </div>

      {tutorials.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500">No workshops found</h3>
              <p className="text-slate-400">Check back later for new content.</p>
          </div>
      )}

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
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Content (Markdown)</label>
                    <button 
                        type="button"
                        onClick={() => setShowImagePicker(!showImagePicker)}
                        className="text-xs flex items-center gap-1 text-primary hover:text-primaryLight font-medium bg-red-50 px-2 py-1 rounded"
                    >
                        <ImageIcon className="w-3 h-3" /> Insert Image
                    </button>
                </div>
                
                {/* Image Picker Popover */}
                {showImagePicker && (
                    <div className="mb-2 bg-white border border-slate-200 rounded-lg shadow-sm p-2 z-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500">Select from Library</span>
                            <button onClick={() => setShowImagePicker(false)}><X className="w-3 h-3 text-slate-400" /></button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {imageResources.length > 0 ? imageResources.map(img => (
                                <button 
                                    key={img.id} 
                                    onClick={() => insertImage(img.url, img.title)}
                                    className="shrink-0 border border-slate-100 rounded hover:border-accent"
                                    title={img.title}
                                >
                                    {/* We can try to show preview if URL is image, else just icon */}
                                    <div className="w-16 h-16 bg-slate-50 flex items-center justify-center text-xs overflow-hidden">
                                        {img.url.startsWith('/') ? (
                                            <img src={resolvePath(img.url)} alt={img.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="text-[10px] w-16 truncate px-1">{img.title}</div>
                                </button>
                            )) : (
                                <div className="text-xs text-slate-400 italic p-2">No images in Media Library.</div>
                            )}
                        </div>
                        <div className="border-t border-slate-100 pt-2 mt-1">
                            <input 
                                type="text" 
                                placeholder="Or paste URL..." 
                                className="w-full text-xs p-1 border border-slate-200 rounded"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        insertImage(e.currentTarget.value, 'Image');
                                        e.currentTarget.value = '';
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

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
