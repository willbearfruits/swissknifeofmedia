import React, { useState, useEffect } from 'react';
import { Monitor, Zap, User, Layers, Wrench, Film, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getArtists } from '../services/mockDb';
import { Artist } from '../types';

export const ArtistArchivePage = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Simple polling/retry mechanism to wait for DB init if needed, 
    // or just load what we have.
    const load = () => {
        const data = getArtists();
        setArtists(data);
    };
    load();
    
    // Listen for storage events in case DB updates
    window.addEventListener('storage', load);
    // Also a quick interval to catch the initial async load completion if it happens after mount
    const interval = setInterval(load, 1000); 
    
    return () => {
        window.removeEventListener('storage', load);
        clearInterval(interval);
    };
  }, []);

  const categories = ['Glitch', 'Noise', 'Performance', 'Media Art', 'DIY', 'Film'];

  const filtered = artists.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(filter.toLowerCase()) || a.bio.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = selectedCategory ? a.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-12">
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Archive</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl font-light">
              A living index of New Media pioneers. 
              <br/>Glitch, Noise, Code, and Chaos.
            </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 sticky top-20 z-10 bg-slate-50/90 backdrop-blur py-4 border-b border-slate-200">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search the archives..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white shadow-sm"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'}`}
                >
                    All
                </button>
                {categories.map(c => (
                    <button 
                        key={c}
                        onClick={() => setSelectedCategory(c)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === c ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <p className="text-xl">No records found in the archives.</p>
                <p className="text-sm mt-2">Try a different search term.</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
            ))}
        </div>

      </div>
    </div>
  );
};

const ArtistCard = ({ artist }: { artist: Artist }) => {
    const getIcon = (cat: string) => {
        switch(cat) {
            case 'Glitch': return <Monitor className="w-4 h-4" />;
            case 'Noise': return <Zap className="w-4 h-4" />;
            case 'Performance': return <User className="w-4 h-4" />;
            case 'Media Art': return <Layers className="w-4 h-4" />;
            case 'DIY': return <Wrench className="w-4 h-4" />;
            case 'Film': return <Film className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    return (
        <a 
            href={artist.url} 
            target="_blank" 
            rel="noreferrer"
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-slate-100 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    {getIcon(artist.category)} {artist.category}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-purple-400 transition-colors" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                {artist.name}
            </h3>
            
            <p className="text-slate-500 leading-relaxed flex-grow">
                {artist.bio}
            </p>
        </a>
    );
};
