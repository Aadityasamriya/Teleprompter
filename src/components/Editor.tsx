import { useMemo, useState } from 'react';
import { Clock, Download, FileText, FolderOpen, Play, Save, Sparkles, Trash2, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_CONFIG } from '../config';

interface EditorProps {
  script: string;
  setScript: (s: string) => void;
  wpm: number;
  setWpm: (w: number) => void;
  onPlay: () => void;
}

export function Editor({ script, setScript, wpm, setWpm, onPlay }: EditorProps) {
  const [saved, setSaved] = useState(false);
  const [fileName, setFileName] = useState('My Script');

  const wordCount = useMemo(() => script.trim() ? script.trim().split(/\s+/u).length : 0, [script]);
  const characterCount = script.length;
  const estimatedSeconds = Math.max(0, Math.round((wordCount / Math.max(1, wpm)) * 60));
  const estimatedMin = Math.floor(estimatedSeconds / 60);
  const estimatedSec = estimatedSeconds % 60;

  const markChanged = () => setSaved(false);

  const handleSave = () => {
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName.trim() || 'script'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setScript(String(reader.result ?? ''));
      setFileName(file.name.replace(/\.[^.]+$/, '') || 'Imported Script');
      setSaved(false);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClear = () => {
    if (!script || window.confirm('Clear this script? Your saved local copy will not be affected.')) {
      setScript('');
      setSaved(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen w-full px-3 py-4 sm:px-6 sm:py-7 lg:px-10"
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1800px] flex-col">
        <header className="mb-4 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="relative shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-3 shadow-[0_0_35px_rgba(139,92,246,.28)]">
              <Sparkles className="relative z-10 h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold tracking-tight text-white sm:text-2xl">{APP_CONFIG.appName}</h1>
              <p className="truncate text-xs font-medium text-white/40 sm:text-sm">{APP_CONFIG.appTagline}</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[.08] hover:text-white lg:flex-none">
              <Upload className="h-4 w-4" /> Import .txt
              <input type="file" accept=".txt,text/plain" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={handleSave} disabled={!script} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
              <Download className="h-4 w-4" /> {saved ? 'Saved' : 'Export'}
            </button>
            <button onClick={onPlay} disabled={!script.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black shadow-[0_0_35px_rgba(255,255,255,.12)] transition hover:-translate-y-0.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none">
              <Play className="h-4 w-4 fill-current" /> Launch Teleprompter
            </button>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-white/[.07] bg-[#080808] shadow-2xl sm:rounded-[2rem]">
          <div className="flex flex-col border-b border-white/[.06] bg-white/[.025]">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <FolderOpen className="h-4 w-4 shrink-0 text-purple-400" />
                <input value={fileName} onChange={(e) => setFileName(e.target.value)} aria-label="Script name" className="min-w-0 w-full max-w-xs bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/20" placeholder="Script name" />
                <span className="hidden text-xs text-white/25 sm:inline">Local only</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/35 sm:gap-4">
                <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {wordCount.toLocaleString()} words</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {estimatedMin}m {estimatedSec}s</span>
                <span>{characterCount.toLocaleString()} chars</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-white/[.05] px-3 py-3 sm:flex-row sm:items-center sm:px-4">
              <span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/35">Reading speed</span>
              <input aria-label="Words per minute" type="range" min="30" max="400" step="5" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="w-full accent-purple-500 sm:max-w-xs" />
              <output className="w-20 rounded-lg bg-purple-500/10 px-3 py-2 text-center text-xs font-bold text-purple-300">{wpm} WPM</output>
              <button onClick={handleClear} disabled={!script} className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white/35 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-20"><Trash2 className="h-4 w-4" /> Clear</button>
            </div>
          </div>

          <textarea
            value={script}
            onChange={(e) => { setScript(e.target.value); markChanged(); }}
            placeholder={APP_CONFIG.appDescription}
            spellCheck
            className="min-h-[55vh] flex-1 resize-none bg-transparent p-5 text-[1.05rem] leading-8 text-white/90 outline-none placeholder:text-white/20 sm:p-8 sm:text-[1.2rem] sm:leading-9 lg:p-10 lg:text-[1.3rem] lg:leading-10"
          />

          <div className="flex items-center justify-between border-t border-white/[.05] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/25 sm:px-6">
            <span>Everything stays on this device</span>
            <span className="hidden sm:inline">Ctrl/⌘ + Enter to launch</span>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
