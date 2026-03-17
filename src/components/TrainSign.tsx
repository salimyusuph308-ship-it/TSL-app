import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, RefreshCw, CheckCircle2, Video, ChevronRight, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export const TrainSign: React.FC = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'intro' | 'recording' | 'labeling' | 'success'>('intro');
  const [label, setLabel] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const STEPS = [
    { id: 'intro', label: t('Start', 'Anza') },
    { id: 'recording', label: t('Record', 'Rekodi') },
    { id: 'labeling', label: t('Label', 'Lebo') },
    { id: 'success', label: t('Done', 'Tayari') }
  ];

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep('recording');
    } catch (err) {
      alert(t('Camera access needed to train new signs.', 'Ufikiaji wa kamera unahitajika ili kufunza ishara mpya.'));
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setStep('labeling');
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks([e.data]);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const handleSave = () => {
    if (!label.trim()) return;
    
    const personalSigns = JSON.parse(localStorage.getItem('personal_signs') || '[]');
    personalSigns.push({
      id: Date.now().toString(),
      word: label,
      category: 'personal',
      description: 'Custom user-trained sign.',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('personal_signs', JSON.stringify(personalSigns));
    
    setStep('success');
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  // Dynamic background based on step
  const getBgColor = () => {
    switch (step) {
      case 'recording': return isRecording ? 'bg-red-50/50' : 'bg-stone-50';
      case 'labeling': return 'bg-emerald-50/30';
      case 'success': return 'bg-emerald-50';
      default: return 'bg-white';
    }
  };

  return (
    <div className={`p-6 h-full flex flex-col space-y-6 transition-colors duration-700 ${getBgColor()}`}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-between px-2 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-sm">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                idx <= currentStepIndex 
                  ? 'bg-stone-900 text-white shadow-xl rotate-0' 
                  : 'bg-stone-100 text-stone-400 rotate-12'
              }`}>
                {idx < currentStepIndex ? <CheckCircle2 size={18} /> : idx + 1}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] mt-1 ${
                idx <= currentStepIndex ? 'text-stone-900' : 'text-stone-400'
              }`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 px-2">
                <div className="h-1 rounded-full bg-stone-100 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: idx < currentStepIndex ? '100%' : '0%' }}
                    className="h-full bg-stone-900"
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-10"
          >
            <div className="relative group">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-40 h-40 bg-stone-900 rounded-[3rem] flex items-center justify-center text-white shadow-2xl"
              >
                <Video size={64} />
              </motion.div>
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-4 rounded-2xl shadow-xl border-4 border-white">
                <BrainCircuit size={32} />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-stone-900 tracking-tighter leading-none">{t('Train the AI', 'Funza AI')}</h2>
              <p className="text-stone-500 text-xl font-medium max-w-xs mx-auto leading-relaxed">
                {t('Help us bridge the gap. Record a gesture to expand our community dictionary.', 'Tusaidie kuziba pengo. Rekodi ishara ili kupanua kamusi ya jamii yetu.')}
              </p>
            </div>
            <button 
              onClick={startCamera}
              className="w-full max-w-xs py-7 bg-stone-900 text-white text-2xl font-black rounded-[2.5rem] shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-4 group"
            >
              {t('Get Started', 'Anza Sasa')}
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity }}>
                <ChevronRight size={28} />
              </motion.div>
            </button>
          </motion.div>
        )}

        {step === 'recording' && (
          <motion.div 
            key="recording"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex-1 flex flex-col space-y-8"
          >
            <div className="relative flex-1 bg-stone-900 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              
              {/* Hand Guide Overlay */}
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-64 h-80 border-4 border-dashed border-white/50 rounded-[4rem]"
                  />
                  <p className="absolute bottom-20 text-white/60 font-black text-xs uppercase tracking-[0.3em]">
                    {t('Center your hand here', 'Weka mkono wako hapa katikati')}
                  </p>
                </div>
              )}

              {/* Recording HUD */}
              <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/20">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/40'}`} />
                  <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
                    {isRecording ? t(`Recording ${recordingTime}s`, `Inarekodi ${recordingTime}s`) : t('Ready', 'Tayari')}
                  </span>
                </div>
                
                {isRecording && (
                  <motion.div 
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/40"
                  >
                    REC
                  </motion.div>
                )}
              </div>

              {/* Scanning Line Overlay */}
              {isRecording && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-red-500/30 blur-sm z-10"
                />
              )}

              {/* Progress Bar */}
              {isRecording && (
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((recordingTime / 5) * 100, 100)}%` }}
                    className="h-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  />
                </div>
              )}
            </div>
            
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-stone-900">
                  {isRecording ? t('Keep it steady', 'Iweke thabiti') : t('Ready to record?', 'Tayari kurekodi?')}
                </h3>
                <p className="text-stone-400 font-medium">
                  {t('Perform the sign clearly for 5 seconds.', 'Fanya ishara kwa uwazi kwa sekunde 5.')}
                </p>
              </div>
              
              <button 
                onClick={toggleRecording}
                className={`w-28 h-28 rounded-full border-[10px] flex items-center justify-center transition-all mx-auto shadow-2xl ${
                  isRecording 
                    ? 'bg-white border-red-500 scale-110' 
                    : 'bg-white border-stone-100 hover:scale-105'
                }`}
              >
                <div className={`transition-all duration-300 ${
                  isRecording 
                    ? 'w-10 h-10 bg-red-500 rounded-xl' 
                    : 'w-16 h-16 bg-red-500 rounded-full shadow-xl shadow-red-500/40'
                }`} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'labeling' && (
          <motion.div 
            key="labeling"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col justify-center space-y-12"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 mb-6">
                <Save size={40} />
              </div>
              <h3 className="text-5xl font-black text-stone-900 tracking-tighter leading-none">{t('Label your sign', 'Weka lebo ishara yako')}</h3>
              <p className="text-stone-500 text-xl font-medium leading-relaxed">
                {t('What should we call this gesture?', 'Tuite ishara hii nini?')}
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="text"
                  autoFocus
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={t("e.g. 'Family'", "k.m. 'Familia'")}
                  className="w-full p-10 bg-white border-4 border-stone-100 rounded-[3rem] text-4xl font-black placeholder:text-stone-200 focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all shadow-xl"
                />
                <AnimatePresence>
                  {label.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500"
                    >
                      <CheckCircle2 size={32} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('recording')}
                  className="flex-1 py-7 bg-stone-100 text-stone-600 font-black rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                  <RefreshCw size={24} /> {t('Retake', 'Rudia')}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!label.trim()}
                  className="flex-[2] py-7 bg-emerald-600 text-white text-2xl font-black rounded-[2rem] flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-emerald-500/20 active:scale-95 transition-transform"
                >
                  <Save size={24} /> {t('Save Sign', 'Hifadhi Ishara')}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-10"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40"
              >
                <CheckCircle2 size={64} />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-4 border-2 border-emerald-500 rounded-full"
              />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-stone-900 tracking-tight">{t('Great Work!', 'Kazi Nzuri!')}</h3>
              <p className="text-stone-500 text-xl font-medium">
                <span className="text-emerald-600 font-black">"{label}"</span> {t('is now part of your personal dictionary.', 'sasa ni sehemu ya kamusi yako ya kibinafsi.')}
              </p>
            </div>
            
            <div className="w-full max-w-xs space-y-4">
              <button 
                onClick={() => {
                  setStep('intro');
                  setLabel('');
                }}
                className="w-full py-6 bg-stone-900 text-white text-lg font-black rounded-3xl shadow-xl active:scale-95 transition-transform"
              >
                {t('Train Another Sign', 'Funza Ishara Nyingine')}
              </button>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                {t('Your contributions make SignBridge better', 'Michango yako inafanya SignBridge kuwa bora zaidi')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
