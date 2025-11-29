import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Activity, Box, Sliders } from 'lucide-react';
import { Button } from './Button';

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
    gain2: GainNode; // Used for mix volume OR modulation depth
    masterGain: GainNode;
    analyzer: AnalyserNode;
  } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopTone();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Parameter Updates
  useEffect(() => {
    if (!nodesRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const { osc1, osc2, gain1, gain2, masterGain } = nodesRef.current;

    osc1.frequency.setTargetAtTime(freq1, now, 0.01);
    osc2.frequency.setTargetAtTime(freq2, now, 0.01);
    masterGain.gain.setTargetAtTime(masterVolume, now, 0.01);

    // Mode handling involves re-routing, so we might need to pause/start or just change gains?
    // WebAudio routing is dynamic. We can disconnect and reconnect.
    // For simplicity in this effect, we handle simple value updates.
    // Mode changes trigger a full restart or complex routing update logic (handled in separate effect).
  }, [freq1, freq2, masterVolume]);

  useEffect(() => {
     if(nodesRef.current) {
         nodesRef.current.osc1.type = wave1;
         nodesRef.current.osc2.type = wave2;
     }
  }, [wave1, wave2]);

  // Re-route when mode changes
  useEffect(() => {
      if (isPlaying) {
          stopTone();
          startTone();
      }
  }, [osc2Mode]); // Restart graph on topology change

  // Update Mod/Mix Depth
  useEffect(() => {
      if (nodesRef.current && audioCtxRef.current) {
          // For AM/Mix: gain2 controls volume. 
          // For FM: gain2 controls frequency deviation (depth).
          const val = osc2Mode === 'fm' ? osc2Gain * 1000 : osc2Gain; 
          nodesRef.current.gain2.gain.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.01);
      }
  }, [osc2Gain, osc2Mode]);


  const startTone = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Create Nodes
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain(); // Osc1 Level (Always 1 for now, handled by Master)
    const gain2 = ctx.createGain(); // Osc2 Level / Mod Depth
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
        // Parallel
        gain1.gain.value = 0.5;
        const mixVal = osc2Gain; // 0-1
        gain2.gain.value = mixVal * 0.5; 

        osc1.connect(gain1);
        gain1.connect(masterGain);
        
        osc2.connect(gain2);
        gain2.connect(masterGain);

    } else if (osc2Mode === 'am') {
        // AM: Osc2 -> Gain1.gain
        // We need to offset gain1 so it oscillates around a value, or standard Ring Mod
        // Standard Ring Mod: Osc1 -> Gain1; Osc2 -> Gain1.gain
        // But Gain node is audiorate.
        
        gain1.gain.value = 0.0; // Base?
        // Actually, for AM/RingMod: Carrier (Osc1) -> GainNode. Modulator (Osc2) -> GainNode.gain
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain2.gain.value = osc2Gain; // Scale modulator
        gain2.connect(gain1.gain); // Modulate amplitude of Osc1
        
        gain1.connect(masterGain);

    } else if (osc2Mode === 'fm') {
        // FM: Osc2 -> Gain2 -> Osc1.frequency
        gain1.gain.value = 1.0;
        
        osc1.connect(gain1);
        gain1.connect(masterGain);
        
        osc2.connect(gain2);
        gain2.gain.value = osc2Gain * 1000; // Mod depth in Hz
        gain2.connect(osc1.frequency);
    }

    masterGain.connect(analyzer);
    analyzer.connect(ctx.destination);

    osc1.start();
    osc2.start();

    nodesRef.current = { osc1, gain1, osc2, gain2, masterGain, analyzer };
    setIsPlaying(true);
    draw();
  };

  const stopTone = () => {
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
  };

  const togglePlay = () => {
    if (isPlaying) stopTone();
    else startTone();
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas internal res matches display
    // (Assuming fixed size in CSS for now, but setting here helps resolution)
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const render = () => {
      if (!isPlaying || !nodesRef.current) return;
      animationRef.current = requestAnimationFrame(render);
      
      const { analyzer } = nodesRef.current;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = '#0f172a'; // Dark Slate Background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22d3ee'; // Cyan
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / 2);

        if(i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

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
    };
    render();
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
            <Activity className="w-5 h-5 text-accent" /> Dual Osc Synth
         </h3>
         <div className="flex gap-2">
             <button onClick={() => setOsc2Mode('mix')} className={`px-2 py-1 text-xs rounded ${osc2Mode==='mix' ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>Mix</button>
             <button onClick={() => setOsc2Mode('fm')} className={`px-2 py-1 text-xs rounded ${osc2Mode==='fm' ? 'bg-purple-500 text-white' : 'bg-slate-200'}`}>FM</button>
             <button onClick={() => setOsc2Mode('am')} className={`px-2 py-1 text-xs rounded ${osc2Mode==='am' ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>AM</button>
         </div>
      </div>

      <div className="relative bg-slate-900 h-40">
        <canvas ref={canvasRef} className="w-full h-full block" />
        {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                Oscilloscope Inactive
            </div>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* OSC 1 */}
        <div className="space-y-4 border-r border-slate-100 pr-4">
            <div className="flex justify-between items-center">
                 <h4 className="font-bold text-primary">Oscillator 1</h4>
                 <span className="text-xs text-slate-400">Carrier</span>
            </div>
            <WaveSelector val={wave1} set={setWave1} label="Waveform" />
            <div>
                <label className="text-xs font-bold text-slate-500">Freq: {freq1} Hz</label>
                <input type="range" min="20" max="1000" value={freq1} onChange={e => setFreq1(Number(e.target.value))} className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none" />
            </div>
        </div>

        {/* OSC 2 */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <h4 className="font-bold text-blue-600">Oscillator 2</h4>
                 <span className="text-xs text-slate-400 capitalize">{osc2Mode === 'mix' ? 'Voice 2' : 'Modulator'}</span>
            </div>
            <WaveSelector val={wave2} set={setWave2} label="Waveform" />
            <div>
                <label className="text-xs font-bold text-slate-500">Freq: {freq2} Hz</label>
                <input type="range" min="1" max="1000" value={freq2} onChange={e => setFreq2(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-200 rounded-lg appearance-none" />
            </div>
             <div>
                <label className="text-xs font-bold text-slate-500">
                    {osc2Mode === 'mix' ? 'Mix Level' : osc2Mode === 'fm' ? 'FM Depth' : 'AM Depth'}
                </label>
                <input type="range" min="0" max="1" step="0.01" value={osc2Gain} onChange={e => setOsc2Gain(Number(e.target.value))} className="w-full accent-purple-500 h-2 bg-slate-200 rounded-lg appearance-none" />
            </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-4">
          <Button onClick={togglePlay} variant={isPlaying ? 'danger' : 'primary'} className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
               {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
          <div className="flex-1">
              <label className="text-xs font-bold text-slate-500">Master Volume</label>
              <input type="range" min="0" max="1" step="0.01" value={masterVolume} onChange={e => setMasterVolume(Number(e.target.value))} className="w-full accent-slate-800 h-2 bg-slate-200 rounded-lg appearance-none" />
          </div>
      </div>
    </div>
  );
};