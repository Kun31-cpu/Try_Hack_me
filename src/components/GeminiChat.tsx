import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, Image as ImageIcon, Search, Mic, Video } from 'lucide-react';
import { chatWithGemini, analyzeImage, searchGrounding } from '../services/geminiService';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'search';
  sources?: any[];
}

export const GeminiChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am HackLab AI. How can I help you with your cybersecurity journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithGemini(input, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSearch = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: `Searching for: ${input}`, type: 'search' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const { text, sources } = await searchGrounding(input);
      setMessages(prev => [...prev, { role: 'assistant', content: text, type: 'search', sources }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Search failed. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "fixed bottom-24 right-6 z-[100] bg-app-card border border-app-border rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500",
        isExpanded ? "w-[800px] h-[700px]" : "w-[400px] h-[600px]"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-app-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#a3e635]/10 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#a3e635]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-app-heading uppercase tracking-widest">HackLab AI</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-app-heading/5 rounded-lg transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4 text-zinc-500" /> : <Maximize2 className="w-4 h-4 text-zinc-500" />}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-app-heading/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-3",
            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-blue-500/10" : "bg-[#a3e635]/10"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-blue-500" /> : <Bot className="w-4 h-4 text-[#a3e635]" />}
            </div>
            <div className={cn(
              "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-blue-500 text-white rounded-tr-none" 
                : "bg-black/5 dark:bg-white/5 text-app-heading rounded-tl-none border border-app-border"
            )}>
              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-app-border/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={source.web?.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-black/10 dark:bg-white/10 px-2 py-1 rounded hover:bg-[#a3e635]/20 transition-colors"
                      >
                        {source.web?.title || 'Source'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[#a3e635]/10 rounded-lg flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#a3e635]" />
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none border border-app-border">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-app-border bg-black/5 dark:bg-white/5">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask HackLab AI anything..."
            className="w-full bg-app-card border border-app-border rounded-2xl py-3 pl-4 pr-32 text-sm focus:outline-none focus:ring-2 focus:ring-[#a3e635]/50 resize-none h-12 overflow-hidden"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              onClick={handleSearch}
              title="Search Grounding"
              className="p-2 hover:bg-app-heading/5 rounded-xl transition-colors text-zinc-500 hover:text-[#a3e635]"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSend}
              className="p-2 bg-[#a3e635] text-black rounded-xl hover:bg-[#bef264] transition-colors shadow-lg shadow-[#a3e635]/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-app-heading/5 rounded-lg transition-colors text-zinc-500 hover:text-app-heading">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-app-heading/5 rounded-lg transition-colors text-zinc-500 hover:text-app-heading">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-app-heading/5 rounded-lg transition-colors text-zinc-500 hover:text-app-heading">
              <Video className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Powered by Gemini 3.1 Pro</p>
        </div>
      </div>
    </motion.div>
  );
};
