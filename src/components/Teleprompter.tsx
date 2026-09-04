import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, FlipHorizontal, Gauge, Maximize, Minimize, Pause, Play, RotateCcw, Settings2, Target, Volume2, VolumeX, X } from 'lucide-react';
import { motion } from 'motion/react';

interface TeleprompterProps {
  script: string;
  wpm: number;
  onExit: () => void;
}

const FONT_FAMILIES = [
  { label: 'Clean', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { label: 'Classic', value: 'Georgia, serif' },
  { label: 'Creator', value: 'Space Grotesk, ui-sans-serif, system-ui, sans-serif' },
];

export function Teleprompter({ script, wpm, onExit }: TeleprompterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(72);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFocusLine, setShowFocusLine] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showHUD, setShowHUD] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [lineHeight, setLineHeight] = useState(1.35);
  const [textWidth, setTextWidth] = useState(1100);
  const [countdown, setCountdown] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const hudTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = useMemo(() => script.trim() ? script.trim().split(/\s+/u).length : 0, [script]);
  const [progress, setProgress] = useState(0);

  const wakeHUD = () => {
    setShowHUD(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    if (isPlaying) hudTimeoutRef.current = setTimeout(() => setShowHUD(false), 2600);
  };

  useEffect(() => {
    const events = ['mousemove', 'touchstart', 'keydown'];
    events.forEach((event) => window.addEventListener(event, wakeHUD));
    return () => {
      events.forEach((event) => window.removeEventListener(event, wakeHUD));
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (event.code === 'Space') { event.preventDefault(); setIsPlaying((value) => !value); }
      if (event.key.toLowerCase() === 'r') resetScroll();
      if (event.key.toLowerCase() === 'm') setIsFlipped((value) => !value);
      if (event.key === 'ArrowUp') setSpeedMultiplier((value) => Math.min(5, +(value + 0.1).toFixed(1)));
      if (event.key === 'ArrowDown') setSpeedMultiplier((value) => Math.max(0.2, +(value - 0.1).toFixed(1)));
      if (event.key === 'Escape') { if (document.fullscreenElement) document.exitFullscreen(); else onExit(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExit]);

  useEffect(() => {
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, []);

  useEffect(() => {
    if (!isPlaying || countdown > 0) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = null;
      return;
    }
    const scroll = (time: number) => {
      if (lastTimeRef.current !== null && containerRef.current) {
        const delta = Math.min(100, time - lastTimeRef.current);
        const pixelsPerSecond = (wpm / 150) * (fontSize / 72) * 95 * speedMultiplier;
        containerRef.current.scrollTop += (pixelsPerSecond * delta) / 1000;
        const maxScroll = Math.max(1, containerRef.current.scrollHeight - containerRef.current.clientHeight);
        setProgress(Math.min(100, (containerRef.current.scrollTop / maxScroll) * 100));
        if (containerRef.current.scrollTop >= maxScroll - 2) setIsPlaying(false);
      }
      lastTimeRef.current = time;
      animationRef.current = requestAnimationFrame(scroll);
    };
    animationRef.current = requestAnimationFrame(scroll);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, countdown, wpm, fontSize, speedMultiplier]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(0);
        setIsPlaying(true);
      } else {
        setCountdown((value) => value - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const togglePlay = () => {
    if (isPlaying) { setIsPlaying(false); return; }
    setCountdown(3);
    setIsPlaying(false);
    if (soundEnabled) {
      try { void new AudioContext().resume(); } catch { /* Optional browser feature */ }
    }
  };

  const resetScroll = () => {
    if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    setProgress(0);
    setIsPlaying(false);
    setCountdown(0);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* Fullscreen may be unavailable */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-white/5"><div className="h-full bg-purple-500 transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>

      {showFocusLine && <div className="pointer-events-none fixed inset-x-0 top-[34%] z-20 flex h-16 -translate-y-1/2 items-center justify-center"><div className="relative h-full w-full border-y border-purple-400/20 bg-gradient-to-r from-transparent via-purple-500/[.07] to-transparent" /></div>}

      <div ref={containerRef} className="smooth-scroll-container flex-1 overflow-y-auto px-4 py-[30vh] sm:px-8 lg:px-16 xl:px-24" style={{ transform: isFlipped ? 'scaleX(-1)' : undefined }}>
        <article className="mx-auto" style={{ maxWidth: `${textWidth}px`, fontFamily, lineHeight }}>
          {script.split('\n').map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 12)}`} className="mb-[.8em] whitespace-pre-wrap break-words text-center font-semibold tracking-[.01em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.8)]" style={{ fontSize: `clamp(32px, ${fontSize / 10}vw, ${fontSize}px)` }}>{paragraph || '\u00A0'}</p>)}
          <div className="h-[65vh]" aria-hidden="true" />
        </article>
      </div>

      {countdown > 0 && <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm"><div className="font-display text-[clamp(6rem,20vw,16rem)] font-bold tabular-nums text-white drop-shadow-2xl">{countdown}</div></div>}

      <div className={`fixed bottom-4 left-1/2 z-50 w-[calc(100%-1rem)] max-w-5xl -translate-x-1/2 transition-all duration-500 sm:bottom-6 sm:w-auto ${showHUD ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'}`}>
        <div className="rounded-[1.5rem] border border-white/10 bg-[#090909]/90 p-2 shadow-[0_0_60px_rgba(0,0,0,.8)] backdrop-blur-2xl sm:rounded-full sm:p-2.5">
          <div className="flex flex-wrap items-center justify-center gap-1 sm:flex-nowrap sm:gap-2">
            <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Start'} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_25px_rgba(139,92,246,.3)] transition hover:scale-105 active:scale-95 sm:h-16 sm:w-16">{isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-7 w-7 fill-current" />}</button>
            <div className="flex items-center gap-1 rounded-full bg-white/[.05] px-2 py-1.5"><button onClick={() => setSpeedMultiplier((v) => Math.max(.2, +(v - .1).toFixed(1)))} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><ArrowDown className="h-4 w-4" /></button><span className="min-w-14 text-center text-[10px] font-bold uppercase tracking-widest text-white/60"><Gauge className="mx-auto mb-0.5 h-4 w-4" />{speedMultiplier.toFixed(1)}×</span><button onClick={() => setSpeedMultiplier((v) => Math.min(5, +(v + .1).toFixed(1)))} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><ArrowUp className="h-4 w-4" /></button></div>
            <button onClick={resetScroll} title="Restart (R)" className="control-btn"><RotateCcw className="h-5 w-5" /><span>Reset</span></button>
            <button onClick={() => setIsFlipped((v) => !v)} title="Mirror (M)" className={`control-btn ${isFlipped ? 'active-control' : ''}`}><FlipHorizontal className="h-5 w-5" /><span>Mirror</span></button>
            <button onClick={() => setShowFocusLine((v) => !v)} className={`control-btn ${showFocusLine ? 'active-control' : ''}`}><Target className="h-5 w-5" /><span>Focus</span></button>
            <button onClick={() => setSoundEnabled((v) => !v)} className="control-btn">{soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}<span>Sound</span></button>
            <button onClick={() => setShowSettings((v) => !v)} className={`control-btn ${showSettings ? 'active-control' : ''}`}><Settings2 className="h-5 w-5" /><span>Style</span></button>
            <button onClick={toggleFullscreen} className="control-btn">{isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}<span>Screen</span></button>
            <button onClick={onExit} className="control-btn text-red-300 hover:bg-red-500/10 hover:text-red-200"><X className="h-5 w-5" /><span>Exit</span></button>
          </div>
        </div>
      </div>

      {showSettings && <div className="fixed bottom-24 left-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-white/10 bg-[#101010]/95 p-4 shadow-2xl backdrop-blur-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold">Display settings</h2><button onClick={() => setShowSettings(false)}><X className="h-4 w-4 text-white/50" /></button></div><div className="space-y-4 text-xs text-white/60"><label className="block">Text size <input type="range" min="32" max="140" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="mt-2 w-full accent-purple-500" /></label><label className="block">Text width <input type="range" min="600" max="1800" step="50" value={textWidth} onChange={(e) => setTextWidth(Number(e.target.value))} className="mt-2 w-full accent-purple-500" /></label><label className="block">Line spacing <input type="range" min="1.1" max="1.8" step=".05" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="mt-2 w-full accent-purple-500" /></label><label className="block">Font <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-white"><option value={FONT_FAMILIES[0].value}>Clean</option><option value={FONT_FAMILIES[1].value}>Classic</option><option value={FONT_FAMILIES[2].value}>Creator</option></select></label></div></div>}

      <div className="pointer-events-none fixed left-4 top-4 z-40 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/25 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Offline • {wordCount.toLocaleString()} words</div>
    </motion.div>
  );
}
