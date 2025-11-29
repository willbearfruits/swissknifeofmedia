import React, { useState } from 'react';
import { Upload, Star, Trash2, Download } from 'lucide-react';
import { Button } from '../components/Button';
import { getResources, addResource, deleteResource, toggleFeaturedResource } from '../services/mockDb';
import { Resource, ResourceType } from '../types';
import { useAuth } from '../context/AuthContext';

export const ResourcesPage = () => {
  const { user } = useAuth();
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
            <Button onClick={() => setShowAddModal(true)} className="shadow-md shadow-red-200">
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

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl transform transition-all scale-100">
            <h3 className="text-xl font-bold text-slate-800">Add Resource</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Title</label>
                <input required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Type</label>
                <select className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white" value={newType} onChange={e => setNewType(e.target.value as ResourceType)}>
                  {Object.values(ResourceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">URL</label>
                <input required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
                <textarea required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-accent outline-none h-24" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Save Resource</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
