import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from './Button';

export const TapTempo: React.FC = () => {
  const [bpm, setBpm] = React.useState<number | null>(null);
  const [taps, setTaps] = React.useState<number[]>([]);
  const [lastTap, setLastTap] = React.useState<number>(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap > 2000) {
      setTaps([now]);
      setBpm(null);
    } else {
      const newTaps = [...taps, now];
      if (newTaps.length > 4) newTaps.shift(); // Keep last 4 taps
      setTaps(newTaps);
      
      // Calculate Average BPM
      let intervals = [];
      for(let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i-1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBpm(Math.round(60000 / avgMs));
    }
    setLastTap(now);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
      <h4 className="font-bold text-slate-700 mb-2">Tap Tempo</h4>
      <div className="text-4xl font-mono font-bold text-primary mb-4 h-10">
        {bpm ? bpm : <span className="text-slate-300">---</span>}
        <span className="text-sm text-slate-400 ml-1">BPM</span>
      </div>
      <Button onClick={handleTap} className="w-full h-16 text-lg font-bold uppercase tracking-wider">
        TAP
      </Button>
      <p className="text-xs text-slate-400 mt-2">Tap at least twice...</p>
    </div>
  );
};
