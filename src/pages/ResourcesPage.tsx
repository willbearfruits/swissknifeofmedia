import React, { useState } from 'react';
import { Upload, Star, Trash2, Download, Edit, FileText, Link as LinkIcon, FolderOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { getResources, addResource, deleteResource, toggleFeaturedResource, updateResource } from '../services/mockDb';
import { Resource, ResourceType } from '../types';
import { useAuth } from '../context/AuthContext';
import { resolvePath } from '../utils/pathUtils';

export const ResourcesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [resources, setResources] = useState<Resource[]>(getResources());
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Resource Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>(ResourceType.LINK);
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  
  // Input Mode State
  const [inputMode, setInputMode] = useState<'url' | 'file'>('url');

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

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setType(ResourceType.LINK);
    setUrl('');
    setDesc('');
    setInputMode('url');
    setShowModal(true);
  };

  const openEditModal = (res: Resource) => {
    setEditingId(res.id);
    setTitle(res.title);
    setType(res.type);
    setUrl(res.url);
    setDesc(res.description);
    setInputMode(res.url.startsWith('/media/') ? 'file' : 'url');
    setShowModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Auto-fill details
      const fileName = file.name;
      // Use resolvePath if you want to preview, but for storage we keep the relative path '/media/...'
      // Actually, let's store the clean relative path. The rendering component uses resolvePath if needed, 
      // OR we store it resolved? 
      // Looking at mockDb.ts, it stores `resolvePath('/media/...')`.
      // But resolvePath depends on import.meta.env.BASE_URL. 
      // If we store it resolved, it might double-resolve if we aren't careful.
      // mockDb.ts usage: `url: resolvePath('/media/electrosmith-daisy-seed-overview.pdf')`
      // So we should store it as `/media/filename` and let the consumer resolve it? 
      // Wait, mockDb stores the *result* of resolvePath. 
      // Let's just store `/media/${fileName}` and let the consuming link handle it, 
      // OR wrap it with resolvePath here. 
      // Let's stick to the pattern: store the *final* URL.
      
      setUrl(resolvePath(`/media/${fileName}`));

      if (!editingId) {
        if (!title) setTitle(fileName.split('.')[0].replace(/[_-]/g, ' '));
        
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') setType(ResourceType.PDF);
        else if (['c', 'cpp', 'h', 'py', 'js', 'ts', 'json'].includes(ext || '')) setType(ResourceType.CODE);
        else setType(ResourceType.FILE);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing
      updateResource(editingId, {
        title,
        type,
        url,
        description: desc
      });
    } else {
      // Create new
      const newRes: Resource = {
        id: Date.now().toString(),
        title,
        type,
        url,
        description: desc,
        tags: ['New'],
        dateAdded: new Date().toISOString().split('T')[0],
        isFeatured: false
      };
      addResource(newRes);
    }

    setResources(getResources());
    setShowModal(false);
    setTitle(''); setUrl(''); setDesc(''); setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Media Library</h2>
            <p className="text-slate-500 mt-1">Schematics, code snippets, and reference docs.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search..." 
            className="px-4 py-2 border border-slate-300 rounded-lg flex-1 md:w-64 focus:ring-2 focus:ring-accent outline-none transition-all"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {isAdmin && (
            <Button onClick={openAddModal} className="shadow-md shadow-red-200">
              <Upload className="h-4 w-4 mr-2" /> Add
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(res => (
          <div key={res.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-accent transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-xs font-bold px-2 py-1 rounded border ${res.type === ResourceType.PDF ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                  {res.type}
                </span>
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">{res.title}</h3>
                {res.isFeatured && <Star className="w-4 h-4 text-accent fill-accent" />}
              </div>
              <p className="text-slate-600 text-sm mb-2 max-w-3xl">{res.description}</p>
              <div className="flex gap-2">
                {res.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{t}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <a href={res.url} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm" className="w-full md:w-auto">
                    <Download className="w-4 h-4 mr-2 opacity-50" /> Download
                </Button>
              </a>
              {isAdmin && (
                <>
                    <button 
                        onClick={() => handleToggleFeatured(res.id)} 
                        className={`p-2 rounded hover:bg-slate-100 transition-colors ${res.isFeatured ? 'text-accent' : 'text-slate-300 hover:text-accent'}`}
                        title="Toggle Featured"
                    >
                        <Star className={`w-4 h-4 ${res.isFeatured ? 'fill-accent' : ''}`} />
                    </button>
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(res)} title="Edit">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(res.id)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400">No resources found matching "{filter}"</p>
            </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl transform transition-all scale-100">
            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Resource' : 'Add Resource'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Title</label>
                <input required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Resource Source</label>
                <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
                  <button 
                    type="button"
                    onClick={() => setInputMode('url')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${inputMode === 'url' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LinkIcon className="w-4 h-4" /> External URL
                  </button>
                  <button 
                    type="button"
                    onClick={() => setInputMode('file')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${inputMode === 'file' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <FolderOpen className="w-4 h-4" /> Local File
                  </button>
                </div>
                
                {inputMode === 'url' ? (
                  <input required={!editingId} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileSelect}
                    />
                    <div className="pointer-events-none">
                      <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Select file to link</p>
                      <p className="text-xs text-slate-400 mt-1">We'll use the filename to generate the link.</p>
                    </div>
                  </div>
                )}
                {inputMode === 'file' && url && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                        <strong>Note:</strong> Ensure <code>{url.split('/').pop()}</code> is committed to <code>public/media/</code> in your repository.
                    </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Type</label>
                <select className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white" value={type} onChange={e => setType(e.target.value as ResourceType)}>
                  {Object.values(ResourceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
                <textarea required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none h-24" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">{editingId ? 'Update Resource' : 'Save Resource'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
