import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Type, FlipHorizontal, ArrowUp, ArrowDown, RotateCcw, Target, Mic } from 'lucide-react';
import { motion } from 'motion/react';

interface TeleprompterProps {
  script: string;
  wpm: number;
  onExit: () => void;
}

export function Teleprompter({ script, wpm, onExit }: TeleprompterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(72);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFocusLine, setShowFocusLine] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showHUD, setShowHUD] = useState(true);
  const [voiceControl, setVoiceControl] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Auto-hide HUD logic
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const wakeHUD = () => {
      setShowHUD(true);
      clearTimeout(timeout);
      
      if (isPlaying) {
        timeout = setTimeout(() => {
          setShowHUD(false);
        }, 3000);
      }
    };

    wakeHUD();
    
    window.addEventListener('mousemove', wakeHUD);
    window.addEventListener('touchstart', wakeHUD);
    window.addEventListener('keydown', wakeHUD);
    
    return () => {
      window.removeEventListener('mousemove', wakeHUD);
      window.removeEventListener('touchstart', wakeHUD);
      window.removeEventListener('keydown', wakeHUD);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Voice Command logic
  useEffect(() => {
    if (!voiceControl) return;

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice control is not supported in your browser.");
      setVoiceControl(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript.toLowerCase().trim();
      
      console.log("Voice Command Recognized:", text);

      if (text.includes('play') || text.includes('start') || text.includes('resume')) {
        setIsPlaying(true);
      } else if (text.includes('pause') || text.includes('stop') || text.includes('wait')) {
        setIsPlaying(false);
      } else if (text.includes('faster') || text.includes('speed up')) {
        setSpeedMultiplier(s => Math.min(s + 0.5, 5));
      } else if (text.includes('slower') || text.includes('slow down')) {
        setSpeedMultiplier(s => Math.max(s - 0.5, 0.2));
      } else if (text.includes('reset') || text.includes('restart') || text.includes('top')) {
        if (containerRef.current) containerRef.current.scrollTop = 0;
      }
    };
    
    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      // Restart on error if keeping it on
      if (e.error !== 'not-allowed') {
        setTimeout(() => {
          try { recognition.start(); } catch {}
        }, 1000);
      } else {
        setVoiceControl(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [voiceControl]);

  // Auto-scroll logic utilizing requestAnimationFrame for perfect smoothness
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = null;
      return;
    }

    const scroll = (time: number) => {
      if (lastTimeRef.current !== null && containerRef.current) {
        const delta = time - lastTimeRef.current;
        
        // Dynamic speed calculation based on WPM, font size, and user multiplier
        // 150 WPM defaults to ~100px/sec at font size 72.
        const baseSpeed = (wpm / 150) * (fontSize / 72) * 90;
        const pixelsToScroll = (baseSpeed * speedMultiplier * delta) / 1000;
        
        containerRef.current.scrollTop += pixelsToScroll;
      }
      lastTimeRef.current = time;
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, wpm, fontSize, speedMultiplier]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const resetScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Focus Line Overlay */}
      {showFocusLine && (
        <div className="fixed top-[30%] inset-x-0 h-16 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto h-full border-y border-purple-500/30 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-purple-500" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-purple-500" />
          </div>
        </div>
      )}

      {/* Scrollable Prompter Area */}
      <div 
        ref={containerRef}
        className="flex-grow overflow-y-auto px-6 md:px-24 py-32 smooth-scroll-container"
        style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }}
      >
        <div 
          className="max-w-5xl mx-auto"
          style={{ 
             fontSize: `${fontSize}px`, 
             lineHeight: 1.4,
             paddingBottom: '80vh', // Allow scrolling past the last line until it goes off screen
             paddingTop: '20vh'
          }}
        >
          {script.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-10 text-white font-semibold whitespace-pre-wrap tracking-wide drop-shadow-md">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Floating Controls HUD */}
      <div 
        className={`fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-[95vw] sm:w-auto max-w-[700px] bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 p-3 sm:p-4 rounded-[2rem] sm:rounded-full flex flex-wrap sm:flex-nowrap justify-center items-center gap-2 sm:gap-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 ${showHUD ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
      >
        
        <button 
          onClick={togglePlay} 
          className="p-4 sm:p-5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all hover:scale-110 active:scale-95"
        >
          {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
        </button>

        <div className="h-10 w-px bg-white/10 mx-1 hidden sm:block" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] sm:text-[10px] uppercase text-white/40 font-bold tracking-widest">Speed x{speedMultiplier.toFixed(1)}</span>
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            <button onClick={() => setSpeedMultiplier(Math.max(0.2, speedMultiplier - 0.1))} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={() => setSpeedMultiplier(speedMultiplier + 0.1)} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="h-10 w-px bg-white/10 mx-1 hidden sm:block" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] sm:text-[10px] uppercase text-white/40 font-bold tracking-widest">Text Size</span>
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            <button onClick={() => setFontSize(Math.max(32, fontSize - 4))} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
              <Type className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => setFontSize(Math.min(140, fontSize + 4))} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
              <Type className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="h-10 w-px bg-white/10 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center mt-2 sm:mt-0">
          <button 
            onClick={resetScroll} 
            className="p-3 rounded-2xl transition-colors flex flex-col items-center gap-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            title="Restart from top"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[9px] uppercase font-bold tracking-widest hidden sm:block">Reset</span>
          </button>

          <button 
            onClick={() => setIsFlipped(!isFlipped)} 
            className={`p-3 rounded-2xl transition-colors flex flex-col items-center gap-1.5 ${isFlipped ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Mirror for physical teleprompter"
          >
            <FlipHorizontal className="w-5 h-5" />
            <span className="text-[9px] uppercase font-bold tracking-widest hidden sm:block">Mirror</span>
          </button>

          <button 
            onClick={() => setShowFocusLine(!showFocusLine)} 
            className={`p-3 rounded-2xl transition-colors flex flex-col items-center gap-1.5 ${showFocusLine ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Toggle Focus Line"
          >
            <Target className="w-5 h-5" />
            <span className="text-[9px] uppercase font-bold tracking-widest hidden sm:block">Focus</span>
          </button>

          <button 
            onClick={() => setVoiceControl(!voiceControl)} 
            className={`p-3 rounded-2xl transition-colors flex flex-col items-center gap-1.5 ${voiceControl ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50 relative overflow-hidden' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Voice Commands (Play, Pause, Faster, Slower, Reset)"
          >
            {voiceControl && <div className="absolute inset-0 bg-green-500/20 animate-pulse pointer-events-none" />}
            <Mic className="w-5 h-5 relative z-10" />
            <span className="text-[9px] uppercase font-bold tracking-widest hidden sm:block relative z-10">Voice</span>
          </button>

          <div className="h-10 w-px bg-white/10 mx-1" />

          <button onClick={onExit} className="p-3 text-red-400 hover:bg-red-500/20 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1.5 hover:scale-105 active:scale-95">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[9px] uppercase font-bold tracking-widest hidden sm:block">Exit</span>
          </button>
        </div>

      </div>
    </motion.div>
  )
}
