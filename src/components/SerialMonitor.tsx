import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Terminal, Cpu, Play, Square, Save, RefreshCw, Upload, Usb } from 'lucide-react';
import { SerialPort } from '../types';

export const SerialMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'flasher' | 'dfu'>('monitor');
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [baudRate, setBaudRate] = useState(115200);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const keepReadingRef = useRef(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Flasher State
  const [flashProgress, setFlashProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashStatus, setFlashStatus] = useState('');
  const [flashError, setFlashError] = useState('');
  const [binFile, setBinFile] = useState<File | null>(null);

  // Scroll to bottom on new log
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const connect = async () => {
    if (!('serial' in navigator)) {
      alert("Web Serial API is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    try {
      const selectedPort = await (navigator as any).serial.requestPort();
      await selectedPort.open({ baudRate });
      setPort(selectedPort);
      setIsConnected(true);
      keepReadingRef.current = true;
      readLoop(selectedPort);
      addLog(`Connected to device at ${baudRate} baud.`);
    } catch (err) {
      console.error("Failed to connect:", err);
      addLog(`Error: ${(err as Error).message}`);
    }
  };

  const disconnect = async () => {
    keepReadingRef.current = false;
    if (readerRef.current) {
      await readerRef.current.cancel();
    }
    if (port) {
      await (port as any).close();
    }
    setPort(null);
    setIsConnected(false);
    addLog("Disconnected.");
  };

  const readLoop = async (currentPort: any) => {
    while (currentPort.readable && keepReadingRef.current) {
      const reader = currentPort.readable.getReader();
      readerRef.current = reader;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            const text = new TextDecoder().decode(value);
            addLog(text, true);
          }
        }
      } catch (error) {
        console.error("Read error:", error);
      } finally {
        reader.releaseLock();
      }
    }
  };

  const addLog = (msg: string, append = false) => {
    setLogs(prev => {
      if (append && prev.length > 0) {
        const last = prev[prev.length - 1];
        if (!last.endsWith('\n')) {
          const newLogs = [...prev];
          newLogs[newLogs.length - 1] = last + msg;
          return newLogs;
        }
      }
      return [...prev, msg];
    });
  };

  const clearLogs = () => setLogs([]);

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-logs-${new Date().toISOString()}.txt`;
    a.click();
  };

  const handleFlash = async () => {
    if (!binFile) {
      setFlashError("Select a .bin file first.");
      return;
    }
    if (!('serial' in navigator)) {
      setFlashError("Web Serial not supported in this browser. Try Chrome/Edge.");
      return;
    }
    setFlashError('');
    setIsFlashing(true);
    setFlashProgress(0);
    setFlashStatus('Requesting device...');

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate });
      setFlashStatus('Loading esptool-js...');
      const esptool = await import('esptool-js');
      const Transport = (esptool as any).Transport || (esptool as any).default?.Transport;
      const ESPLoader = (esptool as any).ESPLoader || (esptool as any).default?.ESPLoader;
      if (!Transport || !ESPLoader) {
        throw new Error('esptool-js transport not available. Use ESP Web Flasher as a fallback.');
      }

      const transport = new Transport(port);
      const logger = (msg: string) => addLog(`[flash] ${msg}`);
      const esploader = new ESPLoader(transport, baudRate, baudRate, logger, undefined, false);

      setFlashStatus('Connecting bootloader...');
      await esploader.main_fn();
      setFlashProgress(15);

      const bin = new Uint8Array(await binFile.arrayBuffer());
      setFlashStatus('Flashing firmware...');
      await esploader.flashData(
        [{ data: bin, address: 0x1000 }],
        'keep',
        false,
        false,
        (written: number, total: number) => {
          const pct = Math.floor((written / total) * 100);
          setFlashProgress(pct);
        }
      );

      setFlashProgress(100);
      setFlashStatus('Done. Reset your board.');
      addLog("Firmware Upload Complete.");
      await transport.disconnect?.();
      await port.close?.();
    } catch (error) {
      console.error("Flash error", error);
      setFlashError((error as Error).message || 'Flash failed. Try again or use ESP Web Flasher.');
      addLog(`Flash error: ${(error as Error).message}`);
    } finally {
      setIsFlashing(false);
    }
  };

  const connectDFU = async () => {
    if (!('usb' in navigator)) {
        alert("WebUSB not supported.");
        return;
    }
    try {
        const device = await (navigator as any).usb.requestDevice({ filters: [] });
        alert(`Connected to ${device.productName} in DFU mode`);
    } catch(e) {
        alert("DFU Connection failed or cancelled.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2">
        <button 
            onClick={() => setActiveTab('monitor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'monitor' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Serial Monitor
        </button>
        <button 
            onClick={() => setActiveTab('flasher')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'flasher' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            ESP32 Flasher
        </button>
        <button 
            onClick={() => setActiveTab('dfu')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dfu' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Daisy DFU
        </button>
      </div>

      {activeTab === 'monitor' && (
        <>
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                <Cpu className="text-accent h-6 w-6" />
                <h2 className="font-bold text-slate-800">Connection</h2>
                </div>
                
                <div className="flex items-center gap-2">
                <select 
                    value={baudRate} 
                    onChange={(e) => setBaudRate(Number(e.target.value))}
                    className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                    disabled={isConnected}
                >
                    <option value={9600}>9600</option>
                    <option value={115200}>115200</option>
                    <option value={921600}>921600</option>
                </select>
                
                {!isConnected ? (
                    <Button onClick={connect} size="sm" variant="primary">
                    <Play className="h-4 w-4 mr-1" /> Connect
                    </Button>
                ) : (
                    <Button onClick={disconnect} size="sm" variant="danger">
                    <Square className="h-4 w-4 mr-1" /> Disconnect
                    </Button>
                )}
                </div>
            </div>

            <div className="flex-1 bg-slate-900 p-4 font-mono text-sm overflow-y-auto">
                {logs.length === 0 && (
                <div className="text-slate-500 text-center mt-10">
                    <Terminal className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Ready to connect. Output will appear here.</p>
                </div>
                )}
                {logs.map((log, i) => (
                <div key={i} className="text-green-400 whitespace-pre-wrap break-all">{log}</div>
                ))}
                <div ref={terminalEndRef} />
            </div>

            <div className="bg-slate-100 p-2 border-t border-slate-200 flex justify-end gap-2">
                <Button onClick={clearLogs} size="sm" variant="ghost">
                <RefreshCw className="h-4 w-4 mr-1" /> Clear
                </Button>
                <Button onClick={downloadLogs} size="sm" variant="secondary">
                <Save className="h-4 w-4 mr-1" /> Save Logs
                </Button>
            </div>
        </>
      )}

      {activeTab === 'flasher' && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50">
              <Upload className="w-16 h-16 text-slate-300 mb-6" />
              <h3 className="text-xl font-bold mb-2">Firmware Uploader (ESP32)</h3>
              <p className="text-slate-600 mb-6 text-center max-w-md">
                Select a .bin file and flash via WebSerial. Use Chrome/Edge. If flashing fails, try ESP Web Flasher.
              </p>
              
              <div className="w-full max-w-md bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <input 
                    type="file" 
                    accept=".bin" 
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    onChange={(e) => setBinFile(e.target.files?.[0] || null)}
                  />
                  {binFile && (
                    <div className="text-xs text-slate-500">Selected: {binFile.name}</div>
                  )}
                  
                  {isFlashing && (
                      <div className="space-y-2">
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div className="bg-accent h-2.5 rounded-full transition-all duration-200" style={{ width: `${flashProgress}%` }}></div>
                        </div>
                        <div className="text-xs text-slate-500">{flashStatus || 'Flashing...'}</div>
                      </div>
                  )}
                  {flashError && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{flashError}</div>
                  )}

                  <Button onClick={handleFlash} disabled={isFlashing} className="w-full">
                      {isFlashing ? 'Flashing...' : 'Start Flash'}
                  </Button>
                  <div className="text-xs text-slate-400">
                    Tip: If WebSerial is blocked, use the official ESP Web Flasher: https://espressif.github.io/esp-web-flasher/ with the same .bin.
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'dfu' && (
           <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50">
           <Usb className="w-16 h-16 text-slate-300 mb-6" />
           <h3 className="text-xl font-bold mb-2">Daisy DFU Tool</h3>
           <p className="text-slate-600 mb-6 text-center max-w-md">Put your Daisy device into DFU mode (Hold BOOT, press RESET) and connect via WebUSB.</p>
           
           <Button onClick={connectDFU} variant="primary">
               Connect DFU Device
           </Button>
       </div>
      )}
    </div>
  );
};
