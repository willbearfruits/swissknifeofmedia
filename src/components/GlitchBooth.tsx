import React, { useState } from 'react';
import { Upload, RefreshCw, Download, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const GlitchBooth = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [glitchedImage, setGlitchedImage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [processing, setProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        setGlitchedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const glitchImage = async () => {
    if (!originalImage) return;
    setProcessing(true);

    try {
      // Pixel Sorting / Datamosh Effect
      const width = 800; // Assuming a fixed width for processing or get actual width if possible.
      // Ideally we need the actual image dimensions. 
      // Let's load the image into an Image object first to get dimensions.
      
      // Re-implementing to use Canvas API for easier pixel manipulation
      const img = new Image();
      img.src = originalImage;
      await new Promise(resolve => img.onload = resolve);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      
      // Glitch: Pixel Sorting
      const threshold = 100 - intensity; // Lower intensity = higher threshold = fewer sorts
      
      for (let row = 0; row < canvas.height; row++) {
        if (Math.random() * 100 > threshold) {
           // Sort this row
           const start = row * canvas.width * 4;
           const end = start + canvas.width * 4;
           const rowPixels = [];
           
           for (let i = start; i < end; i += 4) {
             rowPixels.push({
               r: pixels[i],
               g: pixels[i+1],
               b: pixels[i+2],
               a: pixels[i+3],
               l: pixels[i] * 0.299 + pixels[i+1] * 0.587 + pixels[i+2] * 0.114
             });
           }
           
           // Sort by luminance
           rowPixels.sort((a, b) => b.l - a.l);
           
           // Write back
           let pIndex = 0;
           for (let i = start; i < end; i += 4) {
             pixels[i] = rowPixels[pIndex].r;
             pixels[i+1] = rowPixels[pIndex].g;
             pixels[i+2] = rowPixels[pIndex].b;
             pixels[i+3] = rowPixels[pIndex].a;
             pIndex++;
           }
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      setGlitchedImage(canvas.toDataURL('image/jpeg'));

    } catch (e) {
      console.error("Glitch failed", e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl text-slate-300 relative overflow-hidden group h-full">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <AlertTriangle className="w-6 h-6 text-pink-500" />
                <div>
                    <h3 className="text-xl font-black text-white tracking-tighter">PIXEL_SORTER_v1</h3>
                    <p className="text-xs text-slate-500 font-mono">BROWSER_BASED_BIT_CRUSHING</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Controls */}
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-pink-500/50 transition-colors bg-slate-800/50">
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="glitch-upload" />
                        <label htmlFor="glitch-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-slate-500" />
                            <span className="text-sm font-bold">Drop Image / Click to Upload</span>
                            <span className="text-xs text-slate-600">JPG/PNG only</span>
                        </label>
                    </div>

                    {originalImage && (
                        <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-slate-800">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>SORT_THRESHOLD</span>
                                    <span>{intensity}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="100" 
                                    value={intensity} 
                                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>
                            <Button onClick={glitchImage} className="w-full bg-pink-600 hover:bg-pink-700 text-white border-none" disabled={processing}>
                                {processing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                                SORT_PIXELS
                            </Button>
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="bg-black rounded-xl border border-slate-800 flex items-center justify-center min-h-[250px] relative overflow-hidden">
                    {glitchedImage ? (
                        <img src={glitchedImage} alt="Glitched" className="max-w-full max-h-[300px] object-contain hover:scale-105 transition-transform duration-75" />
                    ) : originalImage ? (
                        <img src={originalImage} alt="Original" className="max-w-full max-h-[300px] object-contain opacity-50 grayscale" />
                    ) : (
                        <div className="text-slate-700 flex flex-col items-center gap-2">
                            <ImageIcon className="w-12 h-12 opacity-20" />
                            <span className="text-xs font-mono">NO_SIGNAL_DETECTED</span>
                        </div>
                    )}
                    
                    {glitchedImage && (
                        <a href={glitchedImage} download={`sorted_${Date.now()}.jpg`} className="absolute bottom-4 right-4">
                            <Button size="sm" variant="secondary" className="shadow-xl">
                                <Download className="w-4 h-4 mr-2" /> SAVE
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
