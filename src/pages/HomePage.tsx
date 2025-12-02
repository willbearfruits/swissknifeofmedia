import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '../components/Button';
import { Downloads } from '../components/Downloads';
import { getResources } from '../services/mockDb';
import { ResourceType } from '../types';
import { AsciiSunset } from '../components/AsciiSunset';

export const HomePage = () => {
  const resources = getResources();
  const featured = resources.filter(r => r.isFeatured);

  return (
    <div className="animate-fade-in space-y-12 pb-12">
      {/* Hero */}
      <section className="text-center space-y-6 py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-sm font-bold mb-2 border border-red-200 shadow-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            v2.1 Media Arts Edition
        </div>
        
        <div className="py-8">
            <AsciiSunset />
        </div>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The ultimate toolkit for <strong>New Media Artists</strong> & <strong>Synth Builders</strong>. 
          Manage course materials, calculate filter components, and flash your DIY instruments.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/tutorials">
            <Button size="lg" className="shadow-xl shadow-red-500/20 transform hover:scale-105 transition-all">Start Building</Button>
          </Link>
          <Link to="/tools">
             <Button size="lg" variant="secondary" className="hover:bg-white">Open Workbench</Button>
          </Link>
        </div>
        <div className="max-w-3xl mx-auto mt-10">
          <Downloads />
        </div>
      </section>

      {/* Featured Resources (Course Front) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-accent/10 rounded-lg">
                <Star className="w-5 h-5 text-accent fill-accent" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Featured Course Materials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.length > 0 ? featured.map(res => (
                <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-accent/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-50 to-transparent opacity-50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${res.type === ResourceType.PDF ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {res.type}
                        </span>
                        <a href={res.url} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost">View</Button>
                        </a>
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 mb-2 relative z-10">{res.title}</h3>
                    <p className="text-slate-500 text-sm relative z-10 line-clamp-2">{res.description}</p>
                </div>
            )) : (
                <div className="col-span-full text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 italic">No featured content at the moment.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};