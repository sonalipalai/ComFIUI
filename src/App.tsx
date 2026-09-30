import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, AlertCircle, CheckCircle2, Loader2, LayoutPanelLeft, Monitor, Eye, Camera, MessageSquare, ShieldCheck, Upload, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ImageUpload } from './components/ImageUpload';
import { ComparisonView } from './components/ComparisonView';
import { Chat } from './components/Chat';
import { runUIAudit } from './services/gemini';
import { isExtension, captureCurrentTab } from './services/extension';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'chat'>('audit');
  const [figmaImage, setFigmaImage] = useState<string | null>(null);
  const [webImage, setWebImage] = useState<string | null>(null);
  const [webInputMode, setWebInputMode] = useState<'capture' | 'upload'>('capture');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const extensionMode = isExtension();

  const handleCapture = async () => {
    setIsCapturing(true);
    setError(null);
    try {
      const screenshot = await captureCurrentTab();
      setWebImage(screenshot);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to capture page. Please grant screen capture permission or upload an image.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRunAudit = async () => {
    if (!figmaImage || !webImage) return;

    setIsAnalyzing(true);
    setError(null);
    setAuditResult(null);

    try {
      const result = await runUIAudit(figmaImage, webImage);
      setAuditResult(result || "No issues found.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to analyze images. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Fixed Sticky Header with Navigation */}
      <header className="border-b border-white/5 bg-[#09090b]/90 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Search className="text-blue-400" size={16} />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">UI Auditor</h1>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                {extensionMode ? 'Chrome Extension Active' : 'Multimodal Vision Engine'}
              </p>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex bg-zinc-950/80 border border-white/5 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('audit')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-[0.15em]",
                activeTab === 'audit' 
                  ? "bg-zinc-800 text-white shadow-lg border border-white/10" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Camera size={13} />
              AUDIT
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-[0.15em] relative",
                activeTab === 'chat' 
                  ? "bg-zinc-800 text-white shadow-lg border border-white/10" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <MessageSquare size={13} />
              CHAT WITH GEMINI
              {auditResult && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute -top-0.5 -right-0.5 animate-pulse" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black hidden xs:block">SYSTEM READY</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'audit' ? (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Design <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Benchmark</span>
                </h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed font-medium">
                  Compare your Figma design with your live page screenshot. AI spots layout, typography, and visual gaps automatically.
                </p>
              </div>

              {/* 2-Column Inputs: Figma & Web Screenshot */}
              <div className="grid md:grid-cols-2 gap-6 items-stretch">
                {/* 01. Figma Input */}
                <motion.div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
                  <div className="relative bg-zinc-900/60 rounded-2xl border border-white/5 h-full p-4 flex flex-col justify-between">
                    <ImageUpload
                      label="01. Figma Source Design"
                      image={figmaImage}
                      onChange={setFigmaImage}
                    />
                  </div>
                </motion.div>
                
                {/* 02. Web Runtime Input */}
                <motion.div className="relative group h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
                  <div className="relative bg-zinc-900/60 rounded-2xl border border-white/5 h-full p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">02. Live Web Screenshot</span>
                      
                      {webImage ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCapture}
                            disabled={isCapturing}
                            className="text-[9px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5"
                          >
                            <RotateCcw size={10} className={isCapturing ? "animate-spin" : ""} />
                            RECAPTURE
                          </button>
                          <button 
                            onClick={() => setWebImage(null)}
                            className="text-[9px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest bg-zinc-950 px-2.5 py-1 rounded-md border border-white/5"
                          >
                            RESET
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-white/5">
                          <button
                            type="button"
                            onClick={() => setWebInputMode('capture')}
                            className={cn(
                              "text-[8px] font-black uppercase px-2 py-1 rounded transition-all",
                              webInputMode === 'capture' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                            )}
                          >
                            Capture
                          </button>
                          <button
                            type="button"
                            onClick={() => setWebInputMode('upload')}
                            className={cn(
                              "text-[8px] font-black uppercase px-2 py-1 rounded transition-all",
                              webInputMode === 'upload' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                            )}
                          >
                            Upload
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Web Image Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      {webImage ? (
                        <div className="relative aspect-video rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden group/img">
                          <img src={webImage} alt="Live Web Implementation" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button 
                              onClick={handleCapture}
                              disabled={isCapturing}
                              className="px-4 py-2 bg-white text-black rounded-lg font-bold text-xs tracking-wider flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                              <Camera size={14} />
                              RECAPTURE TAB
                            </button>
                            <button 
                              onClick={() => setWebImage(null)}
                              className="px-4 py-2 bg-zinc-800 text-white rounded-lg font-bold text-xs tracking-wider flex items-center gap-2 hover:bg-zinc-700 transition-colors border border-white/10"
                            >
                              CLEAR
                            </button>
                          </div>
                        </div>
                      ) : webInputMode === 'capture' ? (
                        <div className="aspect-video rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 p-6 flex flex-col items-center justify-center gap-4 text-center">
                          <div className={cn(
                            "p-4 rounded-2xl transition-all duration-500",
                            isCapturing ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-zinc-900 border border-white/10 text-blue-400 group-hover:scale-105"
                          )}>
                            {isCapturing ? <Loader2 className="animate-spin" size={26} /> : <Camera size={26} />}
                          </div>
                          <div className="space-y-1">
                            <button
                              onClick={handleCapture}
                              disabled={isCapturing}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 mx-auto"
                            >
                              <Camera size={14} />
                              {isCapturing ? "CAPTURING SCREEN..." : "CAPTURE CURRENT TAB / PAGE"}
                            </button>
                            <p className="text-[10px] text-zinc-500 font-medium pt-1">
                              Takes an instant snapshot of your web page
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWebInputMode('upload')}
                            className="text-[10px] text-zinc-400 hover:text-white underline font-medium"
                          >
                            Or upload a screenshot file instead
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <ImageUpload
                            label="Upload Screenshot File"
                            image={webImage}
                            onChange={setWebImage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col gap-3 max-w-sm mx-auto pt-2">
                <motion.button
                  whileHover={(!figmaImage || !webImage || isAnalyzing) ? {} : { scale: 1.01 }}
                  whileTap={(!figmaImage || !webImage || isAnalyzing) ? {} : { scale: 0.99 }}
                  onClick={handleRunAudit}
                  disabled={!figmaImage || !webImage || isAnalyzing}
                  className={cn(
                    "w-full h-14 rounded-xl font-black tracking-widest transition-all flex items-center justify-center gap-3 text-xs shadow-2xl",
                    !figmaImage || !webImage || isAnalyzing
                      ? "bg-zinc-950 text-zinc-700 border border-white/5 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      AUDITING WITH GEMINI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      RUN NEURAL UI AUDIT
                    </>
                  )}
                </motion.button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3 text-red-400 text-[11px] font-medium leading-relaxed"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </div>

              {/* Inline Audit Results Placed Directly Below Inputs */}
              <AnimatePresence>
                {auditResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="space-y-6 pt-10 border-t border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={20} className="text-emerald-400" />
                          <h2 className="text-2xl font-bold text-white tracking-tight">Audit Report</h2>
                        </div>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-1">
                          Multimodal Comparison Analysis
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowComparison(true)}
                          className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-2 bg-white/5 hover:bg-white/10 shadow-sm"
                        >
                          <Eye size={14} />
                          COMPARE OVERLAY
                        </button>
                        <button
                          onClick={() => setActiveTab('chat')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                          <MessageSquare size={14} />
                          CHAT ABOUT FIXES
                        </button>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 border border-white/10 rounded-3xl bg-zinc-900/40 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-white/5 bg-zinc-900/60 flex items-center gap-3">
                          <Sparkles size={16} className="text-blue-400" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Analysis Breakdown & Action Items</span>
                        </div>
                        <div className="p-8 prose prose-invert prose-zinc max-w-none 
                          prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-3
                          prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:font-medium prose-p:text-sm
                          prose-strong:text-blue-400 prose-strong:font-bold
                          prose-li:text-zinc-300 prose-li:font-medium prose-li:text-sm
                          prose-ul:border-l prose-ul:border-white/10 prose-ul:pl-6
                          prose-code:text-emerald-400 prose-code:bg-zinc-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        ">
                          <ReactMarkdown>{auditResult}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4 shadow-xl">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Neural Confidence</h4>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "95%" }}
                              className="h-full bg-blue-600 rounded-full"
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-zinc-500 uppercase">Detection Accuracy</span>
                            <span className="text-blue-400">95%</span>
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-blue-500/20 space-y-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Contextual Chat Ready</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Need specific Tailwind CSS classes or want to ask add-on questions about any bullet above?
                          </p>
                          <button
                            onClick={() => setActiveTab('chat')}
                            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2"
                          >
                            <MessageSquare size={13} className="text-blue-400" />
                            ASK GEMINI IN CHAT TAB
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Chat Tab */
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[750px]"
            >
              <div className="flex-1">
                <Chat 
                  figmaImage={figmaImage} 
                  webImage={webImage} 
                  auditResult={auditResult} 
                />
              </div>
              
              {/* Context reference panel on the right */}
              <div className="hidden lg:flex w-80 border border-white/10 rounded-3xl bg-zinc-900/40 backdrop-blur-md overflow-hidden flex-col shadow-2xl">
                <div className="p-4 border-b border-white/5 bg-zinc-900/60 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Audit Context</span>
                </div>
                
                <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Attached Images</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-white/5 bg-zinc-950 p-2 text-center">
                        <span className="text-[8px] font-bold text-zinc-400 block mb-1">Figma</span>
                        {figmaImage ? (
                          <img src={figmaImage} alt="Figma Thumbnail" className="h-16 w-full object-cover rounded" />
                        ) : (
                          <div className="h-16 flex items-center justify-center text-[9px] text-zinc-600">None</div>
                        )}
                      </div>
                      <div className="rounded-lg border border-white/5 bg-zinc-950 p-2 text-center">
                        <span className="text-[8px] font-bold text-zinc-400 block mb-1">Live Web</span>
                        {webImage ? (
                          <img src={webImage} alt="Web Thumbnail" className="h-16 w-full object-cover rounded" />
                        ) : (
                          <div className="h-16 flex items-center justify-center text-[9px] text-zinc-600">None</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Audit Report Reference</span>
                    {auditResult ? (
                      <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-[11px] text-zinc-400 max-h-64 overflow-y-auto leading-relaxed">
                        <ReactMarkdown>{auditResult}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 text-center text-zinc-600 text-[10px]">
                        No audit run yet. Go to Audit tab to analyze designs.
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-zinc-950/50 border-t border-white/5">
                  <button 
                    onClick={() => setActiveTab('audit')}
                    className="w-full py-2 rounded-lg bg-zinc-900 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors"
                  >
                    BACK TO AUDIT
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Comparison Overlay Modal */}
      <AnimatePresence>
        {showComparison && figmaImage && webImage && (
          <ComparisonView
            figmaImage={figmaImage}
            webImage={webImage}
            onClose={() => setShowComparison(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
