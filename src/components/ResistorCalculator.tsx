import React, { useState } from 'react';

const COLORS = [
  { name: 'Black', value: 0, hex: '#000000', text: 'white' },
  { name: 'Brown', value: 1, hex: '#8B4513', text: 'white' },
  { name: 'Red', value: 2, hex: '#DC2626', text: 'white' },
  { name: 'Orange', value: 3, hex: '#EA580C', text: 'white' },
  { name: 'Yellow', value: 4, hex: '#FACC15', text: 'black' },
  { name: 'Green', value: 5, hex: '#16A34A', text: 'white' },
  { name: 'Blue', value: 6, hex: '#2563EB', text: 'white' },
  { name: 'Violet', value: 7, hex: '#7C3AED', text: 'white' },
  { name: 'Grey', value: 8, hex: '#9CA3AF', text: 'black' },
  { name: 'White', value: 9, hex: '#FFFFFF', text: 'black' },
];

const MULTIPLIERS = [
  { name: 'Black', value: 1, hex: '#000000' },
  { name: 'Brown', value: 10, hex: '#8B4513' },
  { name: 'Red', value: 100, hex: '#DC2626' },
  { name: 'Orange', value: 1000, hex: '#EA580C' },
  { name: 'Yellow', value: 10000, hex: '#FACC15' },
  { name: 'Green', value: 100000, hex: '#16A34A' },
  { name: 'Blue', value: 1000000, hex: '#2563EB' },
  { name: 'Gold', value: 0.1, hex: '#FFD700' },
  { name: 'Silver', value: 0.01, hex: '#C0C0C0' },
];

const TOLERANCES = [
  { name: 'Brown', value: 1, hex: '#8B4513' },
  { name: 'Red', value: 2, hex: '#DC2626' },
  { name: 'Green', value: 0.5, hex: '#16A34A' },
  { name: 'Blue', value: 0.25, hex: '#2563EB' },
  { name: 'Violet', value: 0.1, hex: '#7C3AED' },
  { name: 'Gold', value: 5, hex: '#FFD700' },
  { name: 'Silver', value: 10, hex: '#C0C0C0' },
];

export const ResistorCalculator: React.FC = () => {
  const [bands, setBands] = useState<number>(4);
  const [b1, setB1] = useState(1); // Brown
  const [b2, setB2] = useState(0); // Black
  const [b3, setB3] = useState(0); // Black (only for 5 band)
  const [mult, setMult] = useState(100); // Red (x100) -> 1k
  const [tol, setTol] = useState(5); // Gold

  const calculate = () => {
    let base = 0;
    if (bands === 4) {
      base = (b1 * 10) + b2;
    } else {
      base = (b1 * 100) + (b2 * 10) + b3;
    }
    const val = base * mult;
    
    // Format
    if (val >= 1000000) return `${(val / 1000000).toFixed(2).replace(/\.00$/, '')} MΩ`;
    if (val >= 1000) return `${(val / 1000).toFixed(2).replace(/\.00$/, '')} kΩ`;
    return `${val.toFixed(2).replace(/\.00$/, '')} Ω`;
  };

  const BandSelector = ({ label, options, val, setVal }: any) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500 uppercase font-bold">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt: any) => (
          <button
            key={opt.name}
            onClick={() => setVal(opt.value)}
            className={`w-6 h-8 rounded border border-slate-300 shadow-sm transition-transform hover:scale-110 ${val === opt.value ? 'ring-2 ring-slate-900 z-10 scale-110' : ''}`}
            style={{ backgroundColor: opt.hex }}
            title={opt.name}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Resistor Calculator</h3>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setBands(4)} className={`px-3 py-1 rounded text-sm font-medium ${bands === 4 ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>4 Band</button>
          <button onClick={() => setBands(5)} className={`px-3 py-1 rounded text-sm font-medium ${bands === 5 ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>5 Band</button>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-16 bg-[#eecfa1] rounded-full flex items-center justify-center shadow-inner border border-[#d2b48c] overflow-hidden">
            {/* Wires */}
            <div className="absolute -left-10 w-12 h-2 bg-gray-400"></div>
            <div className="absolute -right-10 w-12 h-2 bg-gray-400"></div>
            
            {/* Bands */}
            <div className="flex gap-4 sm:gap-6 z-10">
                <div className="w-3 h-16" style={{ backgroundColor: COLORS.find(c => c.value === b1)?.hex }}></div>
                <div className="w-3 h-16" style={{ backgroundColor: COLORS.find(c => c.value === b2)?.hex }}></div>
                {bands === 5 && <div className="w-3 h-16" style={{ backgroundColor: COLORS.find(c => c.value === b3)?.hex }}></div>}
                <div className="w-3 h-16" style={{ backgroundColor: MULTIPLIERS.find(c => c.value === mult)?.hex }}></div>
                <div className="w-3 h-16 ml-4" style={{ backgroundColor: TOLERANCES.find(c => c.value === tol)?.hex }}></div>
            </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-4xl font-mono font-bold text-slate-900">{calculate()}</div>
        <div className="text-slate-500">± {tol}% Tolerance</div>
        <div className="mt-2 text-xs text-slate-400">
             Common for LED current limiting (220Ω-1kΩ) and Audio Filters.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BandSelector label="Band 1" options={COLORS} val={b1} setVal={setB1} />
        <BandSelector label="Band 2" options={COLORS} val={b2} setVal={setB2} />
        {bands === 5 && <BandSelector label="Band 3" options={COLORS} val={b3} setVal={setB3} />}
        <BandSelector label="Multiplier" options={MULTIPLIERS} val={mult} setVal={setMult} />
        <BandSelector label="Tolerance" options={TOLERANCES} val={tol} setVal={setTol} />
      </div>
    </div>
  );
};