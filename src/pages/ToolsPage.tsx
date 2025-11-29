import React from 'react';
import { ResistorCalculator } from '../components/ResistorCalculator';
import { CapacitorCalculator } from '../components/CapacitorCalculator';
import { SerialMonitor } from '../components/SerialMonitor';
import { ExternalLink, Cpu, Zap } from 'lucide-react';

const schematics = [
    {
      title: 'Bazz Fuss',
      description: 'Single-transistor fuzz; great beginner build.',
      img: '/media/schematics/bazz-fuss.png',
      link: 'http://home-wrecker.com/bazz.html'
    },
    {
      title: 'Big Muff Pi (stages)',
      description: 'Stage breakdown of the classic Big Muff.',
      img: '/media/schematics/big-muff-stages.png',
      link: 'https://www.electrosmash.com/big-muff-pi-analysis'
    },
    {
      title: 'Daisy Kalimba Web Flasher',
      description: 'Flash Daisy binaries via WebUSB (external tool).',
      img: undefined,
      link: 'https://willbearfruits.github.io/KarplusStrongMachine/web-flasher/index.html'
    }
];

export const ToolsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-8 h-8 text-primary" /> Media Lab Workbench
        </h2>
        <p className="text-slate-600 max-w-2xl">
            Calculators for Filters/LEDs, Flashers for Daisy/ESP32, and Serial Monitors. 
            Everything you need to debug your hardware.
        </p>
      </div>

      {/* Calculators */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
             <ResistorCalculator />
        </div>
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
             <CapacitorCalculator />
        </div>
      </div>

      {/* External Tools */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" /> Schematics & Flashers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schematics.map((item) => (
            <a key={item.title} href={item.link} target="_blank" rel="noreferrer" className="group h-full">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col">
                {item.img ? (
                  <div className="h-48 bg-slate-100 overflow-hidden flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10"></div>
                    <img src={item.img} alt={item.title} className="object-contain h-full w-full p-4 mix-blend-multiply" />
                  </div>
                ) : (
                  <div className="h-48 bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
                    <ExternalLink className="w-8 h-8 mb-2 opacity-50" />
                  </div>
                )}
                <div className="p-5 space-y-2 flex-1 flex flex-col">
                  <div className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{item.title}</div>
                  <div className="text-sm text-slate-600 flex-1">{item.description}</div>
                  <div className="text-xs text-accent font-bold flex items-center gap-1 pt-2">
                    OPEN TOOL <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Serial Monitor */}
      <div className="mt-12">
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <SerialMonitor />
        </div>
      </div>
    </div>
  );
};
