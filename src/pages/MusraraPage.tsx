import React, { useState } from 'react';
import { Wrench, Terminal, Image, Video, Brain, ExternalLink, Zap, Code, Mic, Palette, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export const MusraraPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">Musrara</span> Toolkit
        </h1>
        <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-light">
          Curated digital weaponry for New Media students. 
          <br/><span className="text-slate-400 text-lg">Bend data. Generate chaos. Build the future.</span>
        </p>
      </div>

      {/* Section 1: Essential Software */}
      <section className="space-y-8">
        <SectionHeader icon={<Wrench className="w-6 h-6" />} title="Standard Issue Kit" subtitle="Essential software for databending and destruction." color="text-blue-600 bg-blue-50" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <SoftwareCard 
                title="Avidemux" 
                desc="The 'Swiss Army Knife' of video glitching. Cut, encode, and break I-frames."
                url="http://avidemux.sourceforge.net/"
                icon={<Video className="w-5 h-5 text-blue-500" />}
            />
            <SoftwareCard 
                title="Hex Fiend" 
                desc="MacOS Hex Editor. Essential for databending raw headers and bodies."
                url="https://hexfiend.com/"
                icon={<Code className="w-5 h-5 text-slate-700" />}
                platform="Mac"
            />
            <SoftwareCard 
                title="HxD" 
                desc="Windows Hex Editor. Robust, fast, and handles massive files."
                url="https://mh-nexus.de/en/hxd/"
                icon={<Code className="w-5 h-5 text-slate-700" />}
                platform="Win"
            />
             <SoftwareCard 
                title="Audacity" 
                desc="Open-source audio editor. Treat data as sound, sound as data."
                url="https://www.audacityteam.org/"
                icon={<Mic className="w-5 h-5 text-orange-500" />}
            />
             <SoftwareCard 
                title="GIMP" 
                desc="GNU Image Manipulation Program. Scriptable open-source alternative to Photoshop."
                url="https://www.gimp.org/"
                icon={<Image className="w-5 h-5 text-green-600" />}
            />
        </div>
      </section>

      {/* Section 2: CLI Agents */}
      <section className="space-y-8">
        <SectionHeader icon={<Terminal className="w-6 h-6" />} title="AI Command Line" subtitle="Interact with LLMs directly from your terminal." color="text-slate-100 bg-slate-800" />

        <div className="bg-slate-900 rounded-2xl p-8 text-slate-300 font-mono text-sm shadow-2xl overflow-hidden relative group border border-slate-700">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Terminal className="w-48 h-48" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <CommandBlock 
                    label="Gemini CLI" 
                    cmd="npm install -g @google/gemini-cli" 
                    desc="Google's multimodal model in your shell."
                    color="text-blue-400"
                />
                <CommandBlock 
                    label="Claude Code" 
                    cmd="npm install -g @anthropic-ai/claude-code" 
                    desc="Anthropic's agentic coding assistant."
                    color="text-orange-400"
                />
                <CommandBlock 
                    label="Codex / Copilot" 
                    cmd="npm i -g @openai/codex" 
                    desc="OpenAI's code completion model."
                    color="text-green-400"
                />
            </div>
        </div>
      </section>

      {/* Section 3: Generative Media */}
      <section className="space-y-8">
        <SectionHeader icon={<Brain className="w-6 h-6" />} title="Generative Synthesis" subtitle="AI models for Image, Video, and Text." color="text-pink-600 bg-pink-50" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ResourceLink 
                title="Leonardo.ai" 
                desc="Fine-tuned artistic image generation models."
                url="https://leonardo.ai/"
                tag="Image"
            />
             <ResourceLink 
                title="Google ImageFX" 
                desc="Imagen 3. Fast, photorealistic, high fidelity."
                url="https://aitestkitchen.withgoogle.com/tools/image-fx"
                tag="Image"
            />
             <ResourceLink 
                title="DALL-E Mini (Craiyon)" 
                desc="The classic lo-fi, surreal image generator."
                url="https://www.craiyon.com/"
                tag="Image"
            />
             <ResourceLink 
                title="RunwayML" 
                desc="Gen-2 & Gen-3 Alpha. The standard for AI video."
                url="https://runwayml.com/"
                tag="Video"
            />
             <ResourceLink 
                title="Ollama" 
                desc="Run Llama 3, Mistral, and Gemma locally."
                url="https://ollama.com/"
                tag="Local AI"
            />
             <ResourceLink 
                title="UbuWeb" 
                desc="The definitive archive of avant-garde media."
                url="https://www.ubu.com/"
                tag="Archive"
            />
             <ResourceLink 
                title="HuggingChat" 
                desc="Open-source chat with Llama 3, Mistral, etc."
                url="https://huggingface.co/chat/"
                tag="LLM"
            />
             <ResourceLink 
                title="Google Project IDX" 
                desc="Full-stack IDE with AI (Firebase Studio)."
                url="https://idx.google.com/"
                tag="Dev"
            />
        </div>
      </section>

      {/* Section 4: Artist Library Link */}
      <section className="space-y-8">
        <SectionHeader icon={<Palette className="w-6 h-6" />} title="The Reference Archive" subtitle="Pioneers of Glitch, Noise, and New Media." color="text-purple-600 bg-purple-50" />
        
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl group hover:shadow-purple-500/20 transition-shadow">
            <div className="relative z-10 max-w-2xl">
                <h3 className="text-3xl font-black mb-4">Enter the Archive</h3>
                <p className="text-purple-100 mb-8 text-lg leading-relaxed">
                    A living index of 35+ artists defining the edge of media art. 
                    Explore the works of Rosa Menkman, Ryoji Ikeda, Nam June Paik, and more.
                </p>
                <Link to="/archive">
                    <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 border-none">
                        Browse the Collection <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </Link>
            </div>
            
            {/* Decorative Background */}
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-purple-500/20 to-transparent" />
            <div className="absolute -right-10 -bottom-10 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                <Palette className="w-64 h-64" />
            </div>
        </div>
      </section>

    </div>
  );
};

// --- Helper Components ---

const SectionHeader = ({ icon, title, subtitle, color, noBorder }: any) => (
    <div className={`flex items-center gap-4 ${!noBorder ? 'border-b border-slate-200 pb-4' : ''}`}>
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
    </div>
);

const CommandBlock = ({ label, cmd, desc, color }: any) => (
    <div className="space-y-3">
        <h3 className={`font-bold text-lg flex items-center gap-2 ${color}`}>
            {label}
        </h3>
        <p className="text-xs text-slate-500">{desc}</p>
        <div className="bg-black/40 p-4 rounded-lg border border-slate-700/50 flex justify-between items-center group hover:border-slate-500 transition-colors">
            <code className="text-slate-300 font-mono text-xs break-all">{cmd}</code>
            <CopyButton text={cmd} />
        </div>
    </div>
);

const SoftwareCard = ({ title, desc, url, icon, platform }: any) => (
    <a href={url} target="_blank" rel="noreferrer" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-purple-50 transition-colors ring-1 ring-slate-100 group-hover:ring-purple-100">
                {icon}
            </div>
            {platform && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                    {platform}
                </span>
            )}
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
            {title}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </a>
);

const ResourceLink = ({ title, desc, url, tag }: any) => (
    <a href={url} target="_blank" rel="noreferrer" className="flex flex-col h-full bg-white p-5 rounded-xl border border-slate-200 hover:border-pink-300 hover:shadow-lg transition-all group">
        <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-1 rounded-full border border-pink-100">
                {tag}
            </span>
            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-pink-400 transition-colors" />
        </div>
        <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-xs text-slate-500 flex-grow">{desc}</p>
    </a>
);

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = React.useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy} 
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
            title="Copy to clipboard"
        >
            {copied ? 'COPIED' : 'COPY'}
        </button>
    );
};
