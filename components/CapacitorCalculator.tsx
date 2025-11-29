import React, { useState } from 'react';

export const CapacitorCalculator: React.FC = () => {
  const [code, setCode] = useState('104');
  
  const calculate = () => {
    if (code.length < 3) return { pF: 'Invalid', nF: 'Invalid', uF: 'Invalid' };
    
    const digits = parseInt(code.substring(0, 2));
    const multiplier = parseInt(code.substring(2, 3));
    
    if (isNaN(digits) || isNaN(multiplier)) return { pF: 'Invalid', nF: 'Invalid', uF: 'Invalid' };

    const pF = digits * Math.pow(10, multiplier);
    const nF = pF / 1000;
    const uF = nF / 1000;

    return {
      pF: pF.toLocaleString(),
      nF: nF.toString(),
      uF: uF.toString() // Keep precision simple
    };
  };

  const result = calculate();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Capacitor Code Decoder</h3>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-orange-300 rounded-full flex items-center justify-center border-4 border-orange-400 shadow-md mb-4 relative">
            <span className="font-mono text-xl font-bold text-slate-800 opacity-80">{code}</span>
            <div className="absolute -bottom-6 w-1 h-6 bg-gray-400 left-8"></div>
            <div className="absolute -bottom-6 w-1 h-6 bg-gray-400 right-8"></div>
        </div>
        
        <input 
          type="text" 
          maxLength={3}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          className="text-center text-2xl font-mono font-bold w-32 border-b-2 border-slate-300 focus:border-accent outline-none bg-transparent"
          placeholder="104"
        />
        <label className="text-xs text-slate-500 mt-2">Enter 3-digit Code (e.g., 104 for 100nF)</label>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-4 rounded-lg">
        <div>
           <div className="text-sm text-slate-500">pF</div>
           <div className="font-bold text-slate-800">{result.pF}</div>
        </div>
        <div className="border-l border-slate-200">
           <div className="text-sm text-slate-500">nF</div>
           <div className="font-bold text-accentDark">{result.nF}</div>
        </div>
        <div className="border-l border-slate-200">
           <div className="text-sm text-slate-500">µF</div>
           <div className="font-bold text-slate-800">{result.uF}</div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-slate-400">
        Useful for identifying decoupling caps (104) and audio filter caps.
      </div>
    </div>
  );
};