import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, ChatMessage } from '../services/gemini';
import { cn } from '../lib/utils';

interface ChatProps {
  figmaImage: string | null;
  webImage: string | null;
  auditResult: string | null;
}

export function Chat({ figmaImage, webImage, auditResult }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hello! I'm your UI Audit assistant. I have full context of your Figma design, live web screenshot, and audit findings. Ask me for specific CSS/Tailwind fixes, layout corrections, or design adjustments!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage({
        messages: updatedMessages,
        figmaImage,
        webImage,
        auditResult,
      });
      setMessages(prev => [...prev, { role: 'model', content: reply || "I've processed your request." }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: `⚠️ Failed to get response: ${error?.message || 'Please check your connection and try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] border border-white/10 rounded-3xl bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <MessageSquare size={18} className="text-blue-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-tight block">AI Assistant</span>
            <span className="text-xs font-bold text-white tracking-wide">DESIGN CONTEXT ENABLED</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">READY</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                msg.role === 'user' 
                  ? "bg-zinc-800 border-white/10 text-zinc-300" 
                  : "bg-blue-600/10 border-blue-500/30 text-blue-400"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "space-y-1",
                msg.role === 'user' ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm font-medium leading-relaxed prose prose-invert prose-zinc max-w-none shadow-xl",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white" 
                    : "bg-zinc-800/80 border border-white/5 text-zinc-300"
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bot size={20} />
              </div>
              <div className="bg-zinc-800/80 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-400" size={18} />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-zinc-900/60 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about CSS fixes, layout changes..."
            className="w-full h-14 bg-zinc-900/80 border border-white/10 rounded-2xl pl-6 pr-14 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 top-2 h-10 w-10 rounded-xl flex items-center justify-center transition-all",
              !input.trim() || isLoading
                ? "text-zinc-700 bg-zinc-900/50"
                : "text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            )}
          >
            <Send size={18} />
          </button>
        </form>
        <p className="mt-3 text-[10px] text-zinc-600 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles size={10} />
          Contextually aware of your UI audit
        </p>
      </div>
    </div>
  );
}
