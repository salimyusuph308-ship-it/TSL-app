import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, ImageClassifier } from '@mediapipe/tasks-vision';
import { Camera, RefreshCw, Info, X } from 'lucide-react';
import { DICTIONARY_DATA, DictionaryEntry } from '../data/dictionaryData';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const ObjectScanner: React.FC = () => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [classifier, setClassifier] = useState<ImageClassifier | null>(null);
  const [detectedObject, setDetectedObject] = useState<string | null>(null);
  const [match, setMatch] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isCameraActiveRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let isMounted = true;
    const initClassifier = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
        if (!isMounted) return;
        const imageClassifier = await ImageClassifier.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          maxResults: 1
        });
        if (!isMounted) return;
        setClassifier(imageClassifier);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to init classifier:", err);
        setIsLoading(false);
      }
    };
    initClassifier();
    return () => {
      isMounted = false;
      isCameraActiveRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        isCameraActiveRef.current = true;
        requestAnimationFrame(predictLoop);
      }
    } catch (err) {
      alert(t("Camera access denied.", "Ufikiaji wa kamera umekataliwa."));
    }
  };

  const predictLoop = async () => {
    if (!isCameraActiveRef.current) return;

    if (videoRef.current && classifier && videoRef.current.readyState >= 2) {
      const results = classifier.classifyForVideo(videoRef.current, performance.now());
      if (results.classifications.length > 0 && results.classifications[0].categories.length > 0) {
        const category = results.classifications[0].categories[0];
        if (category.score > 0.4) {
          const objectName = category.categoryName.split(',')[0].toLowerCase();
          setDetectedObject(objectName);
          
          // Check for matches in our dictionary
          const found = DICTIONARY_DATA.find(entry => 
            objectName.includes(entry.word.toLowerCase()) || 
            entry.word.toLowerCase().includes(objectName)
          );
          if (found) setMatch(found);
        }
      }
    }
    
    requestAnimationFrame(predictLoop);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <h3 className="text-2xl font-black text-stone-900">{t('Loading Scanner', 'Inapakia Skani')}</h3>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-50 relative overflow-hidden">
      {!isCameraActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
          <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <Camera size={64} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-stone-900">{t('Object to Sign', 'Kitu kwa Ishara')}</h3>
            <p className="text-stone-500 text-lg font-medium max-w-xs mx-auto">
              {t('Point your camera at an object (like a book or water) to see how to sign it.', 'Elekeza kamera yako kwenye kitu (kama kitabu au maji) ili uone jinsi ya kukiashiria.')}
            </p>
          </div>
          <button 
            onClick={startCamera}
            className="w-full max-w-xs py-6 bg-emerald-600 text-white text-xl font-black rounded-3xl shadow-xl active:scale-95 transition-transform"
          >
            {t('Open Scanner', 'Fungua Skani')}
          </button>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full h-full" />
          
          {/* Scanning Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-white/40 rounded-3xl flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
            </div>
          </div>

          {/* Detection Banner */}
          <div className="absolute top-6 inset-x-6">
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs font-black text-white uppercase tracking-widest">
                  {isOnline ? t('Scanning...', 'Inasgani...') : t('Offline Scan', 'Sgani Nje ya Mtandao')}
                </span>
              </div>
              <button 
                onClick={() => setIsCameraActive(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Result Card */}
          <AnimatePresence>
            {match && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute inset-x-4 bottom-4"
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100">
                  <div className="flex">
                    <div className="w-32 h-32 bg-stone-100 shrink-0">
                      <img 
                        src={match.imageUrl} 
                        alt={match.word} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('Found Match', 'Imepatikana')}</span>
                        <button onClick={() => setMatch(null)} className="text-stone-300"><X size={16} /></button>
                      </div>
                      <h4 className="text-2xl font-black text-stone-900">{t(match.word, match.wordSwahili)}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{t(match.description, match.descriptionSwahili)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMatch(null)}
                    className="w-full py-3 bg-stone-900 text-white text-xs font-black uppercase tracking-widest"
                  >
                    {t('Keep Scanning', 'Endelea Kusgani')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!match && detectedObject && (
            <div className="absolute bottom-10 inset-x-0 flex justify-center">
              <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white">
                <span className="text-sm font-bold text-stone-800 uppercase tracking-tight">
                  {t('Seeing', 'Inaona')}: {detectedObject}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
