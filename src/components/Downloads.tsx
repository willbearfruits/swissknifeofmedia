import React from 'react';
import { Download } from 'lucide-react';
import { Button } from './Button';

const downloads = [
  {
    title: 'Daisy Seed Technical Overview (PDF)',
    description: 'Hardware overview, pin maps, power domains, and peripheral specs for Daisy Seed.',
    path: '/media/electrosmith-daisy-seed-overview.pdf'
  },
  {
    title: 'Bazz Fuss Schematic (PNG)',
    description: 'Single-transistor fuzz circuit reference.',
    path: '/media/schematics/bazz-fuss.png'
  },
  {
    title: 'Big Muff Stages (PNG)',
    description: 'Breakdown of the Big Muff Pi stages.',
    path: '/media/schematics/big-muff-stages.png'
  }
];

export const Downloads: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-slate-800">Downloads</h3>
      </div>
      <div className="space-y-3">
        {downloads.map((d) => (
          <div key={d.title} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
            <div>
              <div className="font-semibold text-slate-800">{d.title}</div>
              <div className="text-sm text-slate-500">{d.description}</div>
            </div>
            <a href={d.path} download>
              <Button size="sm" variant="secondary">Download</Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
