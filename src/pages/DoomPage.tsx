import React, { useEffect, useRef } from 'react';

export const DoomPage = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Focus iframe on load
        if(iframeRef.current) iframeRef.current.focus();
    }, []);

    return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
            <iframe 
                ref={iframeRef}
                src="https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fdoom.jsdos?anonymous=1"
                className="w-full h-full border-none"
                title="Doom"
                allow="autoplay; gamepad; keyboard-lock" // Keyboard lock is key for Doom
            />
            <div className="absolute bottom-4 right-4 text-xs text-white/20 font-mono">IDKFA</div>
        </div>
    );
};
