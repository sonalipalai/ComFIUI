import React from 'react';
import { motion } from 'motion/react';
import { X, LayoutPanelLeft, Monitor, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface ComparisonViewProps {
  figmaImage: string;
  webImage: string;
  onClose: () => void;
}

export function ComparisonView({ figmaImage, webImage, onClose }: ComparisonViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#060608]/95 backdrop-blur-2xl flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      {/* Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-[#09090b]/80 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
              <Eye className="text-blue-400" size={16} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">Visual Comparison</h2>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Heuristic Sync</p>
            <p className="text-[10px] text-zinc-400 font-medium">Comparing Figma vs Rendered Workspace</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-all shadow-xl"
        >
          <X size={20} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-8 md:p-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full max-w-[1800px] mx-auto">
          {/* Figma Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-5 h-full min-h-0"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <LayoutPanelLeft className="text-blue-400" size={14} />
                </div>
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.2em]">01. Figma Design</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 font-bold">SOURCE_ALPHA</span>
            </div>
            <div className="flex-1 bg-[#09090b] rounded-3xl border border-white/5 overflow-hidden relative shadow-2xl group">
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
              <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar scroll-smooth">
                <motion.img 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  src={figmaImage} 
                  alt="Figma Design" 
                  className="max-w-none w-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg"
                />
              </div>
            </div>
          </motion.div>

          {/* Web Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-5 h-full min-h-0"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Monitor className="text-violet-400" size={14} />
                </div>
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.2em]">02. Live Render</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600 font-bold">BUILD_LATEST</span>
            </div>
            <div className="flex-1 bg-[#09090b] rounded-3xl border border-white/5 overflow-hidden relative shadow-2xl group">
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
              <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar scroll-smooth">
                <motion.img 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  src={webImage} 
                  alt="Web Implementation" 
                  className="max-w-none w-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="h-16 border-t border-white/5 flex items-center justify-between px-10 shrink-0 bg-[#09090b]/40 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Pixel Perfection</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Layout Integrity</p>
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] animate-pulse">
          SIMULTANEOUS INSPECTION MODE
        </p>
        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <span>Scroll to Compare</span>
          <div className="flex gap-1">
            <div className="w-4 h-1 rounded-full bg-zinc-800" />
            <div className="w-8 h-1 rounded-full bg-blue-500" />
            <div className="w-4 h-1 rounded-full bg-zinc-800" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
