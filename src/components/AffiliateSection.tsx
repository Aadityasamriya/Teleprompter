import { ArrowUpRight } from 'lucide-react';
import { APP_CONFIG } from '../config';

export function AffiliateSection() {
  return (
    <div className="mt-8 mb-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-white">Pro Creator Gear</h3>
        <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">Sponsored</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border border-white/5 bg-white/[0.02] p-2 rounded-3xl">
        {APP_CONFIG.affiliateProducts.map((p, i) => (
          <a key={i} href={p.link} target="_blank" rel="noopener noreferrer" className="relative overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:border-purple-500/30 hover:bg-[#0c0c0e] hover:-translate-y-1 cursor-pointer group shadow-lg">
            <div className="absolute top-0 right-0 p-5 opacity-0 -translate-y-4 translate-x-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 text-purple-400">
               <ArrowUpRight className="w-5 h-5" />
            </div>
            
            <div className="bg-white/5 p-3 rounded-xl mb-5 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300 ring-1 ring-white/10 group-hover:ring-purple-500/50">
              <p.icon className="w-6 h-6 text-white group-hover:text-purple-300 transition-colors" />
            </div>
            
            <h4 className="font-bold text-white text-lg tracking-tight mb-1">{p.title}</h4>
            <p className="text-sm font-medium text-white/40 mb-6">{p.description}</p>
            
            <span className="mt-auto flex items-center justify-between w-full">
              <span className="px-3.5 py-1.5 bg-white/5 rounded-lg text-white font-semibold text-sm group-hover:bg-white/10 transition-colors">
                {p.price}
              </span>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
