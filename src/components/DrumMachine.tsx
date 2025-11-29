import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCw } from 'lucide-react';
import { Button } from './Button';

export const DrumMachine: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  
  // 16 steps
  const [kickPattern, setKickPattern] = useState<boolean[]>(new Array(16).fill(false));
  const [snarePattern, setSnarePattern] = useState<boolean[]>(new Array(16).fill(false));
  const [hatPattern, setHatPattern] = useState<boolean[]>(new Array(16).fill(false));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number>(0);
  const nextNoteTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);

  useEffect(() => {
      // Default Pattern
      const k = [...kickPattern]; k[0]=true; k[4]=true; k[8]=true; k[12]=true;
      setKickPattern(k);
      const s = [...snarePattern]; s[4]=true; s[12]=true;
      setSnarePattern(s);
      const h = [...hatPattern]; for(let i=0;i<16;i+=2) h[i]=true;
      setHatPattern(h);
      
      return () => stop();
  }, []);

  const initAudio = () => {
      if(!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if(audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const playSound = (type: 'kick' | 'snare' | 'hat', time: number) => {
      const ctx = audioCtxRef.current;
      if(!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'kick') {
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
          gain.gain.setValueAtTime(1, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
          osc.start(time);
          osc.stop(time + 0.5);
      } else if (type === 'snare') {
          // Noise buffer ideally, but simple FM synth for now
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, time);
          gain.gain.setValueAtTime(0.7, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
          osc.start(time);
          osc.stop(time + 0.2);
          
          // Noise layer
          const bufferSize = ctx.sampleRate * 0.2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.5, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(time);

      } else if (type === 'hat') {
           // High pass noise
           const bufferSize = ctx.sampleRate * 0.05;
           const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
           const data = buffer.getChannelData(0);
           for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
           
           const noise = ctx.createBufferSource();
           noise.buffer = buffer;
           
           const filter = ctx.createBiquadFilter();
           filter.type = 'highpass';
           filter.frequency.value = 5000;

           const noiseGain = ctx.createGain();
           noiseGain.gain.setValueAtTime(0.3, time);
           noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

           noise.connect(filter);
           filter.connect(noiseGain);
           noiseGain.connect(ctx.destination);
           noise.start(time);
      }
  };

  const scheduler = () => {
      while (nextNoteTimeRef.current < audioCtxRef.current!.currentTime + 0.1) {
          scheduleNote(currentStepRef.current, nextNoteTimeRef.current);
          nextStep();
      }
      schedulerRef.current = window.setTimeout(scheduler, 25);
  };

  const scheduleNote = (beatNumber: number, time: number) => {
      setStep(beatNumber); // Update UI
      if (kickPattern[beatNumber]) playSound('kick', time);
      if (snarePattern[beatNumber]) playSound('snare', time);
      if (hatPattern[beatNumber]) playSound('hat', time);
  };

  const nextStep = () => {
      const secondsPerBeat = 60.0 / bpm;
      const secondsPer16th = secondsPerBeat / 4; // 16th notes
      nextNoteTimeRef.current += secondsPer16th;
      currentStepRef.current = (currentStepRef.current + 1) % 16;
  };

  const play = () => {
      initAudio();
      setPlaying(true);
      currentStepRef.current = 0;
      nextNoteTimeRef.current = audioCtxRef.current!.currentTime;
      scheduler();
  };

  const stop = () => {
      setPlaying(false);
      window.clearTimeout(schedulerRef.current);
  };

  const toggleStep = (pattern: boolean[], setPattern: any, idx: number) => {
      const p = [...pattern];
      p[idx] = !p[idx];
      setPattern(p);
  };

  const StepRow = ({ name, color, pattern, setPattern }: any) => (
      <div className="flex items-center gap-2 mb-2">
          <div className={`w-12 text-xs font-bold text-right ${color}`}>{name}</div>
          <div className="flex flex-1 gap-1 justify-between">
              {pattern.map((active: boolean, i: number) => (
                  <button
                    key={i}
                    onClick={() => toggleStep(pattern, setPattern, i)}
                    className={`w-6 h-8 rounded-sm transition-all ${active ? color.replace('text', 'bg') : 'bg-slate-100 hover:bg-slate-200'} ${step === i && playing ? 'ring-2 ring-black' : ''} ${i % 4 === 0 ? 'ml-1' : ''}`}
                  />
              ))}
          </div>
      </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
       <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-primary" /> 808 Drum Synth
            </h3>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">BPM</span>
                    <input type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="w-16 p-1 border rounded text-center font-mono text-sm" />
                </div>
                <button onClick={playing ? stop : play} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${playing ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {playing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                </button>
            </div>
       </div>

       <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
           <StepRow name="KICK" color="text-red-500" pattern={kickPattern} setPattern={setKickPattern} />
           <StepRow name="SNARE" color="text-blue-500" pattern={snarePattern} setPattern={setSnarePattern} />
           <StepRow name="HAT" color="text-yellow-600" pattern={hatPattern} setPattern={setHatPattern} />
       </div>
    </div>
  );
};
