import React, { useState, useMemo } from 'react';
import { Activity } from 'lucide-react';

type FilterType = 'lowpass' | 'highpass';

export const FilterCalculator: React.FC = () => {
  const [resistor, setResistor] = useState<number>(1000); // Ohms
  const [capacitor, setCapacitor] = useState<number>(100); // nF (input as nF for UX)
  const [type, setType] = useState<FilterType>('lowpass');

  // Calculate Cutoff Frequency: fc = 1 / (2 * pi * R * C)
  const cutoff = useMemo(() => {
    const cFarads = capacitor * 1e-9;
    if (resistor <= 0 || cFarads <= 0) return 0;
    return 1 / (2 * Math.PI * resistor * cFarads);
  }, [resistor, capacitor]);

  // Generate SVG Path for Bode Plot (Magnitude)
  // X-axis: Logarithmic Frequency (10Hz to 100kHz)
  // Y-axis: Magnitude (dB) (0dB to -40dB)
  const generatePath = () => {
    if (cutoff === 0) return "";
    
    const width = 300;
    const height = 150;
    const points: string[] = [];

    // Log scale helper
    const minFreq = 10;
    const maxFreq = 100000; // 100kHz
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    const scaleX = width / (logMax - logMin);

    for (let x = 0; x <= width; x += 2) {
      // Convert screen x to frequency
      // x = (log(f) - logMin) * scaleX
      // log(f) = x / scaleX + logMin
      const freq = Math.pow(10, x / scaleX + logMin);

      // Magnitude calculation
      // H(f) = 1 / sqrt(1 + (f/fc)^2) for Low Pass
      // H(f) = (f/fc) / sqrt(1 + (f/fc)^2) for High Pass
      let mag = 0;
      if (type === 'lowpass') {
        mag = 1 / Math.sqrt(1 + Math.pow(freq / cutoff, 2));
      } else {
        mag = (freq / cutoff) / Math.sqrt(1 + Math.pow(freq / cutoff, 2));
      }

      // Convert to dB: 20 * log10(mag)
      const db = 20 * Math.log10(mag);
      
      // Map dB to height (0dB = top, -40dB = bottom)
      // Range 0 to -40
      const y = Math.min(height, Math.max(0, (-db / 40) * height)); // Simple scaling
      
      points.push(`${x},${y}`);
    }

    return points.join(" ");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> RC Filter Plotter
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setType('lowpass')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${type === 'lowpass' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Low Pass
            </button>
            <button 
                onClick={() => setType('highpass')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${type === 'highpass' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                High Pass
            </button>
        </div>
      </div>

      {/* Graph */}
      <div className="relative w-full h-40 bg-slate-50 rounded-lg border border-slate-200 mb-6 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none" className="absolute inset-0">
            {/* Grid Lines (Log) */}
            {[100, 1000, 10000].map(f => {
                 const minFreq = 10;
                 const maxFreq = 100000;
                 const logMin = Math.log10(minFreq);
                 const logMax = Math.log10(maxFreq);
                 const x = ((Math.log10(f) - logMin) / (logMax - logMin)) * 300;
                 return <line key={f} x1={x} y1="0" x2={x} y2="150" stroke="#e2e8f0" strokeWidth="1" />;
            })}
             {/* Cutoff Line */}
            {(() => {
                 const minFreq = 10;
                 const maxFreq = 100000;
                 if (cutoff > minFreq && cutoff < maxFreq) {
                     const logMin = Math.log10(minFreq);
                     const logMax = Math.log10(maxFreq);
                     const x = ((Math.log10(cutoff) - logMin) / (logMax - logMin)) * 300;
                     return <line x1={x} y1="0" x2={x} y2="150" stroke="#cbd5e1" strokeDasharray="4" strokeWidth="2" />;
                 }
                 return null;
            })()}

            {/* The Curve */}
            <polyline 
                points={generatePath()} 
                fill="none" 
                stroke={type === 'lowpass' ? '#ef4444' : '#3b82f6'} 
                strokeWidth="3" 
                vectorEffect="non-scaling-stroke"
            />
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-1 left-1 text-[10px] text-slate-400">10Hz</div>
        <div className="absolute bottom-1 right-1 text-[10px] text-slate-400">100kHz</div>
        <div className="absolute top-1 left-1 text-[10px] text-slate-400">0dB</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-bold">
            fc: {cutoff < 1000 ? `${cutoff.toFixed(1)} Hz` : `${(cutoff/1000).toFixed(2)} kHz`}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-6">
        <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Resistor (Ω)</label>
            <input 
                type="number" 
                value={resistor} 
                onChange={(e) => setResistor(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none font-mono text-sm"
            />
            <input 
                type="range" 
                min="10" 
                max="100000" 
                step="10"
                value={resistor}
                onChange={(e) => setResistor(Number(e.target.value))}
                className="w-full mt-2 accent-slate-500 h-1 bg-slate-200 rounded-lg appearance-none"
            />
        </div>
        <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Capacitor (nF)</label>
            <input 
                type="number" 
                value={capacitor} 
                onChange={(e) => setCapacitor(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none font-mono text-sm"
            />
            <input 
                type="range" 
                min="0.1" 
                max="1000" 
                step="0.1"
                value={capacitor}
                onChange={(e) => setCapacitor(Number(e.target.value))}
                className="w-full mt-2 accent-slate-500 h-1 bg-slate-200 rounded-lg appearance-none"
            />
        </div>
      </div>
      
      <div className="mt-6 text-xs text-slate-400 border-t border-slate-100 pt-4">
         Cutoff Frequency (fc) = 1 / (2πRC). At this frequency, signal power is halved (-3dB).
      </div>
    </div>
  );
};
