import { Play, Settings2, Sparkles, FileText, Clock, Trash2, Copy, CheckCircle2, Wand2, Loader2, Sparkle } from 'lucide-react';
import { AffiliateSection } from './AffiliateSection';
import { motion, AnimatePresence } from 'motion/react';
import { APP_CONFIG } from '../config';
import { useState } from 'react';

interface EditorProps {
  script: string;
  setScript: (s: string) => void;
  wpm: number;
  setWpm: (w: number) => void;
  onPlay: () => void;
}

export function Editor({ script, setScript, wpm, setWpm, onPlay }: EditorProps) {
  const [copied, setCopied] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  // Calculate estimated time safely
  const wpmValue = wpm > 0 ? wpm : 150;
  const estimatedMin = Math.floor(wordCount / wpmValue);
  const estimatedSec = Math.round((wordCount % wpmValue) / (wpmValue / 60));

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your script?')) {
      setScript('');
    }
  };

  const handleAIEnhance = async (mode: string) => {
    if (!script.trim()) return;
    setIsAiProcessing(true);
    setShowAiMenu(false);
    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, mode })
      });
      if (!response.ok) throw new Error('AI request failed');
      const data = await response.json();
      if (data.result) {
        setScript(data.result);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to enhance script. Please try again.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <motion.div
       initial={{ opacity: 0, scale: 0.98 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 1.02 }}
       transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
       className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col min-h-screen font-sans"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-6 relative z-10 w-full">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] ring-1 ring-white/10 relative overflow-hidden group shrink-0">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" />
          </div>
          <div className="flex-grow">
            <h1 className="text-xl sm:text-3xl font-display font-bold tracking-tight text-white mb-0.5 truncate">
              {APP_CONFIG.appName}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-white/40 tracking-wide truncate">{APP_CONFIG.appTagline}</p>
          </div>
        </div>
        
        <button
          onClick={onPlay}
          disabled={!script.trim()}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-white text-black hover:bg-gray-100 disabled:bg-white/5 disabled:text-white/20 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none shrink-0"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-transform group-hover:scale-110 disabled:scale-100" />
          <span>Launch Studio</span>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow mb-16 bg-[#080808] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden shadow-black/50">
        
        {/* Integrated Stats & Action Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between border-b border-white/5 bg-white/[0.02]">
          
          {/* Stats Segment */}
          <div className="flex flex-wrap sm:flex-nowrap items-center divide-x divide-white/5 border-b lg:border-b-0 border-white/5 w-full lg:w-auto">
            <div className="flex items-center gap-3 px-6 py-4 flex-1 sm:flex-none">
              <FileText className="w-4 h-4 text-white/40 shrink-0" />
              <div className="flex flex-col items-start -space-y-0.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Words</span>
                <span className="text-sm font-bold text-white">{wordCount}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-4 flex-1 sm:flex-none">
              <Clock className="w-4 h-4 text-white/40 shrink-0" />
              <div className="flex flex-col items-start -space-y-0.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Est. Time</span>
                <span className="text-sm font-bold text-white">{estimatedMin}m {estimatedSec}s</span>
              </div>
            </div>
          </div>
          
          {/* Controls Segment */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-white/5 w-full lg:w-auto">
            
            <div className="flex items-center justify-between sm:justify-start gap-4 px-6 py-4 group">
              <div className="flex items-center gap-3">
                <Settings2 className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="flex flex-col items-start -space-y-0.5">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pacing</span>
                  <span className="text-sm font-bold text-purple-400 w-[60px]">{wpm} WPM</span>
                </div>
              </div>
              
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-full sm:w-32 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-3 sm:py-4 bg-white/[0.01] sm:bg-transparent relative">
               
               {/* AI Menu Container */}
               <div className="relative">
                 <button
                   onClick={() => setShowAiMenu(!showAiMenu)}
                   disabled={!script || isAiProcessing}
                   className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white/40 uppercase tracking-wider hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white/40"
                   title="AI Magic Tools"
                 >
                   {isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Wand2 className="w-4 h-4" />}
                   <span className="sm:hidden lg:inline">{isAiProcessing ? 'Thinking...' : 'AI Magic'}</span>
                 </button>
                 
                 <AnimatePresence>
                   {showAiMenu && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute top-full lg:-top-2 lg:-translate-y-full right-0 mt-2 lg:mt-0 mb-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                     >
                        <div className="flex flex-col py-1">
                          <button onClick={() => handleAIEnhance('fix')} className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"><Sparkle className="w-3.5 h-3.5 text-purple-400" /> Polish & Fix</button>
                          <button onClick={() => handleAIEnhance('shorten')} className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"><Sparkle className="w-3.5 h-3.5 text-purple-400" /> Make Shorter</button>
                          <button onClick={() => handleAIEnhance('expand')} className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"><Sparkle className="w-3.5 h-3.5 text-purple-400" /> Expand detail</button>
                          <button onClick={() => handleAIEnhance('engaging')} className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"><Sparkle className="w-3.5 h-3.5 text-purple-400" /> Make Engaging</button>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
               
               <button 
                 onClick={handleClear} 
                 disabled={!script}
                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white/40 uppercase tracking-wider hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white/40"
                 title="Clear Script"
               >
                 <Trash2 className="w-4 h-4" />
                 <span className="sm:hidden lg:inline">Clear</span>
               </button>
               <button 
                 onClick={handleCopy} 
                 disabled={!script}
                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white/40 uppercase tracking-wider hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white/40"
                 title="Copy Script"
               >
                 {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                 <span className="sm:hidden lg:inline">{copied ? 'Copied' : 'Copy'}</span>
               </button>
            </div>
          </div>

        </div>

        {/* Text Area */}
        <div className="relative flex-grow flex flex-col group">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder={APP_CONFIG.appDescription}
            className="flex-grow w-full min-h-[400px] h-auto p-6 sm:p-10 bg-transparent text-[1.15rem] sm:text-[1.35rem] text-white/90 placeholder-white/20 focus:outline-none resize-none leading-relaxed custom-scrollbar relative z-10"
          />
        </div>
      </div>

      <AffiliateSection />
    </motion.div>
  )
}
