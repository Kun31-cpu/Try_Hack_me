import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Search, 
  Mic, 
  Upload, 
  Download, 
  Play, 
  RefreshCw,
  Layout,
  Maximize2,
  ChevronRight,
  Zap,
  Bot,
  FileText
} from 'lucide-react';
import { generateImage, generateVideo, analyzeImage, searchGrounding } from '../services/geminiService';
import { cn } from '../lib/utils';

export const AILab = ({ addToast }: { addToast: (m: string, t?: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'analyze' | 'search'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt, imageSize, aspectRatio);
      setResult(url);
      addToast('Image generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate image.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const url = await generateVideo(prompt, selectedImage || undefined);
      setResult(url);
      addToast('Video generation started. This may take a minute.', 'info');
    } catch (error) {
      addToast('Failed to generate video.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage || !prompt) return;
    setIsGenerating(true);
    try {
      const analysis = await analyzeImage(selectedImage.split(',')[1], prompt);
      setResult(analysis);
      addToast('Image analyzed successfully!', 'success');
    } catch (error) {
      addToast('Failed to analyze image.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#a3e635]/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#a3e635]" />
            </div>
            <span className="text-xs font-black text-[#a3e635] uppercase tracking-[0.3em]">Experimental</span>
          </div>
          <h1 className="text-6xl font-black text-app-heading tracking-tighter">AI Innovation Lab</h1>
          <p className="text-zinc-500 mt-4 max-w-2xl font-medium leading-relaxed">
            Push the boundaries of cybersecurity with our next-gen AI tools. Generate assets, analyze threats, and automate your workflow using Gemini 3.1.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'image', label: 'Image Generation', icon: ImageIcon, desc: 'Create visuals from text' },
            { id: 'video', label: 'Video Generation', icon: Video, desc: 'Veo 3.1 Video Engine' },
            { id: 'analyze', label: 'Vision Analysis', icon: Bot, desc: 'Analyze images & documents' },
            { id: 'search', label: 'Search Grounding', icon: Search, desc: 'Real-time web data' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setResult(null); }}
              className={cn(
                "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group",
                activeTab === tab.id 
                  ? "bg-[#a3e635] text-black shadow-xl shadow-[#a3e635]/20" 
                  : "bg-app-card border border-app-border text-zinc-500 hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                activeTab === tab.id ? "bg-black/10" : "bg-app-heading/5 group-hover:bg-app-heading/10"
              )}>
                <tab.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{tab.label}</p>
                <p className={cn(
                  "text-[10px] font-medium",
                  activeTab === tab.id ? "text-black/60" : "text-zinc-500"
                )}>{tab.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-8">
          <div className="bg-app-card border border-app-border rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Controls */}
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      activeTab === 'image' ? "A futuristic hacker workstation with neon lights..." :
                      activeTab === 'video' ? "A cinematic drone shot of a data center..." :
                      "Describe what you want to analyze or search for..."
                    }
                    className="w-full h-32 bg-black/5 dark:bg-black/20 border border-app-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#a3e635]/50 resize-none"
                  />
                </div>

                {activeTab === 'image' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Resolution</label>
                      <select 
                        value={imageSize}
                        onChange={(e) => setImageSize(e.target.value as any)}
                        className="w-full bg-black/5 dark:bg-black/20 border border-app-border rounded-xl px-4 py-2 text-xs font-bold"
                      >
                        <option value="1K">1K (Standard)</option>
                        <option value="2K">2K (High)</option>
                        <option value="4K">4K (Ultra)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Aspect Ratio</label>
                      <select 
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/20 border border-app-border rounded-xl px-4 py-2 text-xs font-bold"
                      >
                        <option value="1:1">1:1 (Square)</option>
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="4:3">4:3 (Classic)</option>
                        <option value="21:9">21:9 (Ultrawide)</option>
                      </select>
                    </div>
                  </div>
                )}

                {(activeTab === 'video' || activeTab === 'analyze') && (
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Reference Image (Optional)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={onImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={cn(
                        "w-full h-40 border-2 border-dashed border-app-border rounded-2xl flex flex-col items-center justify-center transition-all",
                        selectedImage ? "bg-black/5" : "hover:bg-black/5"
                      )}>
                        {selectedImage ? (
                          <img src={selectedImage} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Click or drag to upload</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={
                    activeTab === 'image' ? handleGenerateImage :
                    activeTab === 'video' ? handleGenerateVideo :
                    handleAnalyzeImage
                  }
                  disabled={isGenerating || !prompt}
                  className="w-full py-4 bg-[#a3e635] hover:bg-[#bef264] text-black font-black rounded-2xl transition-all shadow-xl shadow-[#a3e635]/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </>
                  )}
                </button>
              </div>

              {/* Preview */}
              <div className="bg-black/5 dark:bg-black/20 border border-app-border rounded-3xl flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col"
                    >
                      {activeTab === 'image' && (
                        <div className="relative group w-full h-full">
                          <img src={result} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button className="p-3 bg-white text-black rounded-xl hover:scale-110 transition-transform">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-white text-black rounded-xl hover:scale-110 transition-transform">
                              <Maximize2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                      {activeTab === 'video' && (
                        <video src={result} controls className="w-full h-full object-contain" />
                      )}
                      {activeTab === 'analyze' && (
                        <div className="p-8 overflow-y-auto max-h-[400px] text-sm leading-relaxed font-medium text-zinc-300">
                          {result}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-8"
                    >
                      <div className="w-16 h-16 bg-app-heading/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Layout className="w-8 h-8 text-zinc-700" />
                      </div>
                      <h3 className="text-lg font-black text-app-heading mb-2">Preview Area</h3>
                      <p className="text-xs text-zinc-500 font-medium">Your generated content will appear here.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Prompt Engineering', desc: 'Be specific about style, lighting, and composition for better results.', icon: FileText },
              { title: 'Vision Power', desc: 'Upload screenshots of code or errors for instant AI-powered debugging.', icon: Bot },
              { title: 'Video Magic', desc: 'Veo 3.1 can animate static images. Try uploading a reference photo.', icon: Video }
            ].map((tip, i) => (
              <div key={i} className="bg-app-card border border-app-border rounded-2xl p-6">
                <div className="w-10 h-10 bg-app-heading/5 rounded-xl flex items-center justify-center mb-4">
                  <tip.icon className="w-5 h-5 text-zinc-500" />
                </div>
                <h4 className="text-sm font-black text-app-heading mb-2 uppercase tracking-widest">{tip.title}</h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
