import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Activity } from 'lucide-react';
import { Button } from './Button';

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export const ToneGenerator: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Osc 1
  const [freq1, setFreq1] = useState(440);
  const [wave1, setWave1] = useState<OscillatorType>('sine');
  
  // Osc 2 (Modulator or Second Voice)
  const [freq2, setFreq2] = useState(220);
  const [wave2, setWave2] = useState<OscillatorType>('sine');
  const [osc2Mode, setOsc2Mode] = useState<'mix' | 'am' | 'fm'>('mix');
  const [osc2Gain, setOsc2Gain] = useState(0.5); // Amount of mix or modulation

  const [masterVolume, setMasterVolume] = useState(0.5);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    osc1: OscillatorNode;
    gain1: GainNode;
    osc2: OscillatorNode;
    gain2: GainNode;
    masterGain: GainNode;
    analyzer: AnalyserNode;
  } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const stopTone = useCallback(() => {
    if (nodesRef.current) {
      const { osc1, osc2 } = nodesRef.current;
      try {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      } catch (e) { /* ignore */ }
      nodesRef.current = null;
    }
    setIsPlaying(false);
    cancelAnimationFrame(animationRef.current);
  }, []);

  const startTone = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Create Nodes
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const masterGain = ctx.createGain();
    const analyzer = ctx.createAnalyser();

    // Init Values
    osc1.type = wave1;
    osc1.frequency.value = freq1;
    osc2.type = wave2;
    osc2.frequency.value = freq2;
    
    masterGain.gain.value = masterVolume;
    analyzer.fftSize = 2048;

    // Routing Logic
    if (osc2Mode === 'mix') {
        gain1.gain.value = 0.5;
        gain2.gain.value = osc2Gain * 0.5; 
        osc1.connect(gain1);
        gain1.connect(masterGain);
        osc2.connect(gain2);
        gain2.connect(masterGain);
    } else if (osc2Mode === 'am') {
        gain1.gain.value = 0.0; 
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain2.gain.value = osc2Gain; 
        gain2.connect(gain1.gain);
        gain1.connect(masterGain);
    } else if (osc2Mode === 'fm') {
        gain1.gain.value = 1.0;
        osc1.connect(gain1);
        gain1.connect(masterGain);
        osc2.connect(gain2);
        gain2.gain.value = osc2Gain * 1000; 
        gain2.connect(osc1.frequency);
    }

    masterGain.connect(analyzer);
    analyzer.connect(ctx.destination);

    osc1.start();
    osc2.start();

    nodesRef.current = { osc1, gain1, osc2, gain2, masterGain, analyzer };
    setIsPlaying(true);
  }, [freq1, freq2, wave1, wave2, osc2Mode, osc2Gain, masterVolume]);

  // Draw Loop
  useEffect(() => {
    if (!isPlaying || !nodesRef.current || !canvasRef.current) return;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resize only if needed (Performance Fix)
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const { analyzer } = nodesRef.current!;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22d3ee';
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / 2);

        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Grid
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height/2);
      ctx.lineTo(canvas.width, canvas.height/2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  // Parameter Updates during play
  useEffect(() => {
    if (!nodesRef.current || !audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const { osc1, osc2, gain2, masterGain } = nodesRef.current;

    osc1.frequency.setTargetAtTime(freq1, now, 0.02);
    osc2.frequency.setTargetAtTime(freq2, now, 0.02);
    masterGain.gain.setTargetAtTime(masterVolume, now, 0.02);

    if (osc2Mode === 'fm') {
       gain2.gain.setTargetAtTime(osc2Gain * 1000, now, 0.02);
    } else {
       gain2.gain.setTargetAtTime(osc2Gain * (osc2Mode === 'mix' ? 0.5 : 1), now, 0.02);
    }
  }, [freq1, freq2, masterVolume, osc2Gain, osc2Mode]);

  // Waveform Updates
  useEffect(() => {
     if(nodesRef.current) {
         nodesRef.current.osc1.type = wave1;
         nodesRef.current.osc2.type = wave2;
     }
  }, [wave1, wave2]);

  // Topology Change requires restart
  useEffect(() => {
      if (isPlaying) {
          stopTone();
          startTone();
      }
  }, [osc2Mode]); 

  const togglePlay = () => {
    if (isPlaying) stopTone();
    else startTone();
  };

  const WaveSelector = ({ val, set, label }: any) => (
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</span>
        <div className="flex rounded-md shadow-sm border border-slate-200 overflow-hidden bg-slate-100">
            {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map(type => (
                <button
                    key={type}
                    onClick={() => set(type)}
                    className={`flex-1 py-1 px-2 text-[10px] font-medium capitalize transition-colors ${val === type ? 'bg-primary text-white' : 'hover:bg-white text-slate-600'}`}
                    title={type}
                >
                    {type.slice(0,3)}
                </button>
            ))}
        </div>
      </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Dual Osc Synth & Scope
         </h3>
         <div className="flex gap-2">
             <button onClick={() => setOsc2Mode('mix')} className={`px-3 py-1 text-xs font-bold rounded transition-colors ${osc2Mode==='mix' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-200 hover:bg-slate-300'}`}>Mix</button>
             <button onClick={() => setOsc2Mode('fm')} className={`px-3 py-1 text-xs font-bold rounded transition-colors ${osc2Mode==='fm' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-200 hover:bg-slate-300'}`}>FM</button>
             <button onClick={() => setOsc2Mode('am')} className={`px-3 py-1 text-xs font-bold rounded transition-colors ${osc2Mode==='am' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-200 hover:bg-slate-300'}`}>AM</button>
         </div>
      </div>

      <div className="relative bg-slate-900 h-64 w-full">
        <canvas ref={canvasRef} className="w-full h-full block" />
        {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Activity className="w-12 h-12 mb-2 opacity-20" />
                <span className="text-sm font-medium opacity-50">Oscilloscope Offline</span>
            </div>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* OSC 1 */}
        <div className="space-y-4 border-r border-slate-100 pr-4">
            <div className="flex justify-between items-center">
                 <h4 className="font-bold text-primary">Oscillator 1</h4>
                 <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Carrier</span>
            </div>
            <WaveSelector val={wave1} set={setWave1} label="Waveform" />
            <div>
                <label className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>Frequency</span>
                    <span>{freq1} Hz</span>
                </label>
                <input type="range" min="20" max="2000" value={freq1} onChange={e => setFreq1(Number(e.target.value))} className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>

        {/* OSC 2 */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <h4 className="font-bold text-blue-600">Oscillator 2</h4>
                 <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">{osc2Mode === 'mix' ? 'Voice 2' : 'Modulator'}</span>
            </div>
            <WaveSelector val={wave2} set={setWave2} label="Waveform" />
            <div>
                <label className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>Frequency</span>
                    <span>{freq2} Hz</span>
                </label>
                <input type="range" min="1" max="2000" value={freq2} onChange={e => setFreq2(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
             <div>
                <label className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>{osc2Mode === 'mix' ? 'Mix Level' : osc2Mode === 'fm' ? 'FM Depth' : 'AM Depth'}</span>
                    <span>{(osc2Gain * 100).toFixed(0)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.01" value={osc2Gain} onChange={e => setOsc2Gain(Number(e.target.value))} className="w-full accent-purple-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-6">
          <Button onClick={togglePlay} variant={isPlaying ? 'danger' : 'primary'} className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
               {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
          <div className="flex-1">
              <label className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Master Volume</span>
                  <span>{(masterVolume * 100).toFixed(0)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.01" value={masterVolume} onChange={e => setMasterVolume(Number(e.target.value))} className="w-full accent-slate-800 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
      </div>
    </div>
  );
};