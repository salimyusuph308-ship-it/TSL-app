import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, GestureRecognizer, DrawingUtils } from '@mediapipe/tasks-vision';
import { AlertCircle, Camera, RefreshCw, Moon, Sun, Volume2, Trash2, Plus, ChevronLeft, Sparkles, Scan, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { playPronunciation } from '../services/ttsService';
import { translateSignLanguage } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

const GESTURE_MAP: Record<string, { en: string, sw: string }> = {
  'Thumb_Up': { en: 'YES / GOOD', sw: 'NDIYO / VEMA' },
  'Thumb_Down': { en: 'NO / BAD', sw: 'HAPANA / MBAYA' },
  'Open_Palm': { en: 'HELLO / STOP', sw: 'HABARI / SIMAMA' },
  'Closed_Fist': { en: 'WAIT', sw: 'SUBIRI' },
  'Pointing_Up': { en: 'LOOK / ONE', sw: 'TAZAMA / MOJA' },
  'Victory': { en: 'PEACE / TWO', sw: 'AMANI / MBILI' },
  'ILoveYou': { en: 'I LOVE YOU', sw: 'NAKUPENDA' }
};

interface CameraTranslatorProps {
  onBack?: () => void;
}

export const CameraTranslator: React.FC<CameraTranslatorProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [sentence, setSentence] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lowLightMode, setLowLightMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const bufferRef = useRef<string[]>([]);
  const BUFFER_SIZE = 15;
  const isCameraActiveRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
        if (!isMounted) return;
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/latest/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        if (!isMounted) return;
        setGestureRecognizer(recognizer);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to initialize MediaPipe:", err);
        setError(t("Could not load AI model. Please check your connection or browser.", "Imeshindwa kupakia modeli ya AI. Tafadhali kagua muunganisho wako au kivinjari."));
        setIsLoading(false);
      }
    };

    initMediaPipe();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      isCameraActiveRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Only run on mount

  const predictLoop = useCallback(() => {
    if (!isCameraActiveRef.current) return;

    if (videoRef.current && gestureRecognizer && videoRef.current.readyState >= 2) {
      const now = performance.now();
      const results = gestureRecognizer.recognizeForVideo(videoRef.current, now);
      
      const canvasCtx = canvasRef.current?.getContext('2d');
      if (canvasCtx && canvasRef.current) {
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const drawingUtils = new DrawingUtils(canvasCtx);
        
        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
              color: lowLightMode ? "#fbbf24" : "#3b82f6",
              lineWidth: 5
            });
            drawingUtils.drawLandmarks(landmarks, {
              color: "#ffffff",
              lineWidth: 2
            });
          }
        }
      }

      if (results.gestures.length > 0) {
        const gesture = results.gestures[0][0].categoryName;
        const score = results.gestures[0][0].score;
        
        bufferRef.current.push(gesture);
        if (bufferRef.current.length > BUFFER_SIZE) {
          bufferRef.current.shift();
        }

        const counts = bufferRef.current.reduce((acc, curr) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const mostFrequent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        
        if (mostFrequent && mostFrequent[1] > BUFFER_SIZE * 0.7) {
          const mapped = GESTURE_MAP[mostFrequent[0]];
          setPrediction(mapped ? t(mapped.en, mapped.sw) : mostFrequent[0]);
          setConfidence(score);
        } else {
          setPrediction(null);
          setConfidence(0);
        }
      } else {
        bufferRef.current = [];
        setPrediction(null);
        setConfidence(0);
      }
    }
    
    requestAnimationFrame(predictLoop);
  }, [gestureRecognizer, lowLightMode, t]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        isCameraActiveRef.current = true;
        
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        };

        requestAnimationFrame(predictLoop);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setError(t("Camera access denied. Please enable camera permissions.", "Ufikiaji wa kamera umekataliwa. Tafadhali wezesha ruhusa za kamera."));
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
    isCameraActiveRef.current = false;
    setPrediction(null);
    bufferRef.current = [];
  };

  const addToSentence = () => {
    if (prediction) {
      setSentence(prev => [...prev, prediction]);
    }
  };

  const removeFromSentence = (index: number) => {
    setSentence(prev => prev.filter((_, i) => i !== index));
  };

  const clearSentence = () => {
    setSentence([]);
    setShowClearConfirm(false);
  };

  const captureFrame = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to the temporary canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // Convert to base64
        return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      }
    }
    return null;
  };

  const scanTSL = async () => {
    if (!isOnline) {
      // Offline fallback: use the current local prediction if available
      if (prediction) {
        if (!sentence.includes(prediction)) {
          setSentence(prev => [...prev, prediction]);
        }
        return;
      }
      // If no prediction, show a temporary message
      setPrediction(t("Offline: Basic signs only", "Nje ya Mtandao: Alama za msingi pekee"));
      setTimeout(() => setPrediction(null), 2000);
      return;
    }

    const base64Image = captureFrame();
    if (!base64Image) return;

    setIsTranslating(true);
    try {
      const result = await translateSignLanguage(base64Image);
      if (result && result !== "Sijui") {
        setPrediction(result);
        setConfidence(0.95);
        // Automatically add to sentence if it's a clear TSL sign
        if (!sentence.includes(result)) {
          setSentence(prev => [...prev, result]);
        }
      } else {
        setPrediction(t("Not recognized", "Haitambuliki"));
        setConfidence(0);
      }
    } catch (err) {
      console.error("TSL Scan Error:", err);
    } finally {
      setIsTranslating(false);
      // Clear prediction after 3 seconds
      setTimeout(() => setPrediction(null), 3000);
    }
  };

  const speakSentence = () => {
    if (sentence.length > 0) {
      playPronunciation(sentence.join(' '));
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full"
        />
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-stone-900">{t('Loading AI Model', 'Inapakia Modeli ya AI')}</h3>
          <p className="text-stone-500 text-lg font-medium">{t('Preparing hospital translator...', 'Inatayarisha mtafsiri wa hospitali...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white">
        <div className="bg-red-100 p-8 rounded-[2.5rem] text-red-500 shadow-xl">
          <AlertCircle size={64} />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-stone-900">{t('Oops!', 'Oi!')}</h3>
          <p className="text-stone-500 text-lg font-medium max-w-xs">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-5 bg-stone-900 text-white font-black rounded-3xl flex items-center gap-3 shadow-2xl active:scale-95 transition-transform"
        >
          <RefreshCw size={24} /> {t('Retry', 'Jaribu tena')}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-900 relative overflow-hidden">
      {!isCameraActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10 bg-white">
          {onBack && (
            <button 
              onClick={onBack}
              className="absolute top-8 left-8 p-4 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-48 bg-blue-100 rounded-[3.5rem] flex items-center justify-center text-blue-600 shadow-2xl shadow-blue-500/10"
          >
            <Camera size={80} />
          </motion.div>
          <div className="space-y-4">
            <h3 className="text-4xl font-black text-stone-900 tracking-tight">{t('Sign to Speech', 'Alama kwenda Sauti')}</h3>
            <p className="text-stone-500 text-xl font-medium max-w-xs mx-auto leading-relaxed">
              {t('Point camera at patient to translate their signs into text and speech.', 'Elekeza kamera kwa mgonjwa ili kutafsiri ishara zao kuwa maandishi na sauti.')}
            </p>
          </div>
          <button 
            onClick={startCamera}
            className="w-full max-w-xs py-7 bg-blue-600 text-white text-2xl font-black rounded-[2.5rem] shadow-2xl shadow-blue-500/30 active:scale-95 transition-transform"
          >
            {t('Start Camera', 'Anza Kamera')}
          </button>
          <div className="flex items-center gap-2 text-stone-400">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-blue-500' : 'bg-amber-500'}`} />
            <p className="text-xs font-bold uppercase tracking-widest">
              {isOnline 
                ? t('AI Hospital Mode Active', 'Hali ya AI ya Hospitali Imewashwa') 
                : t('Offline Mode: Local AI Active', 'Hali ya Nje ya Mtandao: AI ya Ndani Imewashwa')}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative">
          <div className="relative flex-1 bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-all duration-700 ${
                lowLightMode ? 'brightness-150 contrast-125 saturate-150' : ''
              }`}
            />
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none z-10"
            />
            
            <div className="absolute top-8 inset-x-8 flex justify-between items-start z-20">
              <div className="flex gap-3">
                <button 
                  onClick={() => setLowLightMode(!lowLightMode)}
                  className={`p-4 rounded-3xl backdrop-blur-2xl border transition-all shadow-2xl ${
                    lowLightMode 
                      ? 'bg-amber-400 border-amber-200 text-stone-900' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  {lowLightMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>

                <button 
                  onClick={scanTSL}
                  disabled={isTranslating}
                  className={`p-4 rounded-3xl backdrop-blur-2xl border transition-all shadow-2xl flex items-center gap-2 ${
                    isTranslating 
                      ? 'bg-blue-600 border-blue-400 text-white animate-pulse' 
                      : !isOnline 
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                        : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  {isTranslating ? <RefreshCw size={24} className="animate-spin" /> : (isOnline ? <Sparkles size={24} /> : <Scan size={24} />)}
                  <span className="text-xs font-black uppercase tracking-widest pr-2">
                    {isTranslating 
                      ? t('Scanning...', 'Inatambua...') 
                      : !isOnline 
                        ? t('Local Scan', 'Tambua Ndani') 
                        : t('Scan TSL', 'Tambua TSL')}
                  </span>
                </button>
              </div>

              <button 
                onClick={stopCamera}
                className="bg-white/10 backdrop-blur-2xl text-white px-6 py-3 rounded-3xl text-sm font-black uppercase tracking-widest border border-white/20 shadow-2xl"
              >
                {t('Close', 'Funga')}
              </button>
            </div>

            <AnimatePresence>
              {prediction && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                >
                  <div className="bg-blue-600/90 backdrop-blur-2xl border-4 border-white/40 rounded-[3rem] px-12 py-8 text-center shadow-[0_0_50px_rgba(59,130,246,0.4)]">
                    <p className="text-xs font-black text-white/80 uppercase tracking-[0.3em] mb-2">{t('Detected', 'Imetambuliwa')}</p>
                    <h2 className="text-6xl font-black text-white tracking-tighter">
                      {prediction}
                    </h2>
                    <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence * 100}%` }}
                        className="h-full bg-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {prediction && (
              <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30">
                <button 
                  onClick={addToSentence}
                  className="bg-white text-blue-600 p-6 rounded-full shadow-2xl active:scale-90 transition-transform border-8 border-blue-500/20"
                >
                  <Plus size={32} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-stone-900 p-6 space-y-4 z-40 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
                {t('Patient Sentence', 'Sentensi ya Mgonjwa')}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={speakSentence}
                  disabled={sentence.length === 0}
                  className="p-2 text-stone-400 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <Volume2 size={20} />
                </button>
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  disabled={sentence.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl disabled:opacity-20 transition-all active:scale-95"
                >
                  <Trash2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('Clear', 'Futa')}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[60px] items-center">
              {sentence.length === 0 ? (
                <p className="text-stone-600 font-medium italic">
                  {t('Tap + to build patient sentence...', 'Gusa + ili kujenga sentensi ya mgonjwa...')}
                </p>
              ) : (
                <AnimatePresence>
                  {sentence.map((word, i) => (
                    <motion.span 
                      key={`${word}-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="bg-blue-600 text-white pl-4 pr-2 py-2 rounded-2xl text-sm font-black flex items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                      {word}
                      <button 
                        onClick={() => removeFromSentence(i)}
                        className="p-1 bg-white/20 rounded-lg hover:bg-white/40 transition-colors active:scale-90"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Clear Confirmation Dialog */}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-8"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center space-y-8 shadow-2xl"
                >
                  <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-stone-900">{t('Clear Sentence?', 'Futa Sentensi?')}</h3>
                    <p className="text-stone-500 font-medium">{t('Are you sure you want to delete the entire sentence?', 'Je, una uhakika unataka kufuta sentensi nzima?')}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-5 bg-stone-100 text-stone-600 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                    >
                      {t('Cancel', 'Ghairi')}
                    </button>
                    <button 
                      onClick={clearSentence}
                      className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200 active:scale-95 transition-all"
                    >
                      {t('Clear All', 'Futa Zote')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
