import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sparkles, Loader2, Stethoscope, HeartPulse, Play, Video, Info, AlertCircle } from 'lucide-react';
import { generateSignIllustration } from '../services/imageGenService';
import { generateSignVideo } from '../services/videoGenService';

interface TSLAvatarProps {
  text: string;
  tslDescription?: string;
  className?: string;
}

export const TSLAvatar: React.FC<TSLAvatarProps> = ({ text, tslDescription, className = "" }) => {
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (typeof window !== 'undefined' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    const fetchImage = async () => {
      if (!text) return;
      setLoading(true);
      setVideoUrl(null); // Reset video for new text
      const result = await generateSignIllustration(text, tslDescription);
      setImage(result);
      setLoading(false);
    };

    fetchImage();
  }, [text, tslDescription]);

  const handleGenerateVideo = async () => {
    if (!text || videoLoading) return;
    
    if (hasApiKey === false) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } else {
        alert("Please connect your API key to generate videos.");
        return;
      }
    }

    setVideoLoading(true);
    try {
      const url = await generateSignVideo(text, tslDescription);
      if (url) {
        setVideoUrl(url);
      } else {
        alert("Failed to generate video. Please try again.");
      }
    } catch (error) {
      console.error("Video generation error:", error);
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] bg-stone-950 flex flex-col items-center justify-center ${className}`}>
      {/* Background Atmosphere */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <Loader2 size={48} className="text-blue-500 animate-spin" />
              <Sparkles size={20} className="absolute -top-2 -right-2 text-blue-400 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">AI Medical Avatar</p>
              <p className="text-stone-500 text-[8px] font-bold uppercase tracking-widest mt-1">Generating Sign Visual...</p>
            </div>
          </motion.div>
        ) : videoUrl ? (
          <motion.div 
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full h-full"
          >
            <video 
              ref={videoRef}
              src={videoUrl} 
              className="w-full h-full object-cover"
              autoPlay 
              loop 
              muted 
              playsInline
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Video Loop</span>
            </div>
          </motion.div>
        ) : image ? (
          <motion.div 
            key="image"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6"
          >
            <div className="relative w-full max-w-[300px] aspect-square">
              <img 
                src={image} 
                alt="TSL Sign" 
                className="w-full h-full object-contain rounded-[2rem] shadow-2xl border-4 border-white/5"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-2 border-white/10">
                <HeartPulse size={24} />
              </div>
            </div>
            
            {/* Video Generation Trigger */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateVideo}
              disabled={videoLoading}
              className={`mt-6 flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all ${
                videoLoading 
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {videoLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating AI Video (Veo)...
                </>
              ) : (
                <>
                  <Video size={16} />
                  Animate with AI Video
                </>
              )}
            </motion.button>
            
            {!hasApiKey && !videoLoading && (
              <p className="mt-3 text-[8px] text-stone-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <Info size={10} /> Requires Paid API Key for Video
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="placeholder"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-40 h-40 bg-white/5 rounded-[3rem] flex items-center justify-center text-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 relative border border-white/5">
              <User size={80} />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
                <Stethoscope size={32} />
              </div>
            </div>
            <div className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg backdrop-blur-sm">
              AI MEDICAL AVATAR
            </div>
            <p className="mt-4 text-stone-500 text-[10px] font-bold uppercase tracking-widest">Waiting for instruction...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning Lines Effect */}
      <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-[scan_4s_linear_infinite] pointer-events-none" />
      
      {/* Corner Accents */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/10 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/10 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/10 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/10 rounded-br-xl pointer-events-none" />
    </div>
  );
};

