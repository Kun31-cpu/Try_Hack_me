import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { cn } from '../lib/utils';

export const GeminiLive = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are HackLab AI, a helpful cybersecurity mentor. You are having a real-time voice conversation with a user. Keep your responses concise and helpful.",
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startAudioCapture();
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              playAudio(base64Audio);
            }
            if (message.serverContent?.interrupted) {
              stopPlayback();
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopAudioCapture();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsConnecting(false);
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to connect to Live API:", error);
      setIsConnecting(false);
    }
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = convertFloat32ToPcm16(inputData);
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average / 128);
      };
    } catch (error) {
      console.error("Failed to start audio capture:", error);
    }
  };

  const stopAudioCapture = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
  };

  const convertFloat32ToPcm16 = (buffer: Float32Array) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = Math.min(1, buffer[i]) * 0x7FFF;
    }
    return buf;
  };

  const playAudio = (base64Data: string) => {
    // Basic audio playback implementation
    const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
    audio.play();
  };

  const stopPlayback = () => {
    // Stop any ongoing audio playback
  };

  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      startSession();
    }
    return () => {
      if (isConnected) {
        sessionRef.current?.close();
        stopAudioCapture();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-md bg-app-card border border-app-border rounded-[40px] p-8 flex flex-col items-center text-center relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-zinc-500" />
        </button>

        <div className="mb-12">
          <div className="w-24 h-24 bg-[#a3e635]/10 rounded-full flex items-center justify-center relative">
            <div 
              className="absolute inset-0 bg-[#a3e635]/20 rounded-full animate-ping" 
              style={{ animationDuration: '3s', transform: `scale(${1 + audioLevel})` }}
            />
            <Sparkles className="w-12 h-12 text-[#a3e635]" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-app-heading mb-2 tracking-tight">
          {isConnecting ? 'Connecting...' : isConnected ? 'Listening...' : 'Ready to Talk'}
        </h2>
        <p className="text-zinc-500 font-medium mb-12">
          {isConnected ? 'Go ahead, ask me anything about cybersecurity.' : 'Start a real-time voice conversation with HackLab AI.'}
        </p>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl",
              isMuted ? "bg-red-500 text-white" : "bg-white/5 text-zinc-500 hover:bg-white/10"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={isConnected ? () => sessionRef.current?.close() : startSession}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl",
              isConnected ? "bg-red-500 text-white" : "bg-[#a3e635] text-black"
            )}
          >
            {isConnected ? <X className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <button className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:bg-white/10 transition-all shadow-xl">
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-12 w-full">
          <div className="flex justify-center gap-1 h-8 items-center">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: isConnected ? [8, Math.random() * 32 + 8, 8] : 8 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5 + Math.random() * 0.5,
                  ease: "easeInOut"
                }}
                className="w-1 bg-[#a3e635] rounded-full opacity-50"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
