import React from 'react';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NoteConverter: React.FC = () => {
  const [freq, setFreq] = React.useState<string>('440');
  const [note, setNote] = React.useState<string>('');

  const freqToNote = (f: number) => {
    const a4 = 440;
    const n = Math.round(12 * Math.log2(f / a4)) + 69;
    const octave = Math.floor(n / 12) - 1;
    const noteIdx = n % 12;
    return `${NOTES[noteIdx]}${octave}`;
  };

  const handleInput = (val: string) => {
    setFreq(val);
    const f = parseFloat(val);
    if (!isNaN(f) && f > 0) {
      setNote(freqToNote(f));
    } else {
      setNote('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h4 className="font-bold text-slate-700 mb-2">Hz to Note</h4>
      <div className="flex gap-2 items-center">
        <input 
          type="number" 
          value={freq} 
          onChange={e => handleInput(e.target.value)} 
          className="w-24 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none font-mono"
        />
        <span className="text-slate-500">Hz =</span>
        <div className="flex-1 text-right font-bold text-2xl text-primary font-mono">
          {note || '?'}
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        A4 = 440Hz. Useful for tuning DSP.
      </div>
    </div>
  );
};
