import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  ChevronLeft, 
  Camera,
  Activity,
  User,
  ShoppingBasket,
  MessageSquare,
  Play,
  Volume2,
  Sparkles,
  X,
  Check,
  ClipboardList,
  Grid,
  Info,
  Languages,
  PhoneCall,
  Stethoscope,
  Accessibility
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { playPronunciation } from '../services/ttsService';
import { ClinicalWizard } from './ClinicalWizard';
import { TSLQuickBoard } from './TSLQuickBoard';
import { TextToSign } from './TextToSign';
import { BodyMap } from './BodyMap';
import { TSLAvatar } from './TSLAvatar';
import { SymptomChecker } from './SymptomChecker';

interface EmergencyModuleProps {
  onBack: () => void;
  onSendRequest: (label: string, phrase?: string) => void;
  instructions: {id: string, instruction: string, tslDescription?: string, visualIcon?: string, timestamp: string}[];
  requests: {id: string, label: string, phrase?: string, time: string, completed: boolean}[];
  onToggleCamera?: () => void;
  onConsultExpert?: () => void;
  onViewHospitalServices?: () => void;
}

export const EmergencyModule: React.FC<EmergencyModuleProps> = ({ 
  onBack, 
  onSendRequest, 
  instructions, 
  requests, 
  onToggleCamera,
  onConsultExpert,
  onViewHospitalServices
}) => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<'tools' | 'tsl' | 'clinical' | 'instructions' | 'text-to-sign' | 'body-map'>('tools');
  const [lastPressed, setLastPressed] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [lastViewedInstructionId, setLastViewedInstructionId] = useState<string | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const incomingInstruction = instructions[0];

  useEffect(() => {
    if (incomingInstruction && incomingInstruction.id !== lastViewedInstructionId) {
      setHasNewMessage(true);
      setCurrentView('instructions');
    }
  }, [incomingInstruction?.id, lastViewedInstructionId]);

  useEffect(() => {
    const handleMessage = (e: any) => {
      const message = e.detail;
      if (message.type === 'request-tsl-input') {
        setCurrentView('tsl');
      }
    };

    window.addEventListener("afyasign:message", handleMessage);
    return () => window.removeEventListener("afyasign:message", handleMessage);
  }, []);

  const closeMessage = () => {
    setHasNewMessage(false);
    if (incomingInstruction) {
      setLastViewedInstructionId(incomingInstruction.id);
    }
  };

  const openMessage = () => {
    if (incomingInstruction) {
      setHasNewMessage(true);
    }
  };

  const handlePress = (id: string, label: string, phrase: string) => {
    setLastPressed(id);
    
    if (id === 'emergency') {
      // Trigger vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      
      // Trigger 5s pulse animation
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 5000);
    }

    playPronunciation(phrase);
    onSendRequest(label, phrase);
    setTimeout(() => setLastPressed(null), 1000);
  };

  const handleQuickReact = (label: string, phrase: string) => {
    onSendRequest(label, phrase);
    playPronunciation(phrase);
    closeMessage();
  };

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 border-b border-stone-200 z-10">
          <button 
            onClick={onConsultExpert}
            className="p-2 bg-purple-100 text-purple-600 rounded-xl active:scale-90 transition-transform"
          >
            <PhoneCall size={20} />
          </button>
          <button 
            onClick={onBack}
            className="p-2 bg-stone-100 rounded-xl text-stone-600 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-stone-900 tracking-tight leading-none">{t('Patient Zone', 'Eneo la Mgonjwa')}</h2>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{t('Quick Communication', 'Mawasiliano ya Haraka')}</p>
        </div>
        {incomingInstruction && (
          <button 
            onClick={openMessage}
            className={`bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${hasNewMessage ? 'opacity-0 scale-0' : 'opacity-100 scale-100 animate-bounce shadow-lg shadow-blue-200'}`}
          >
            <Sparkles size={14} />
            {t('View Message', 'Ona Ujumbe')}
          </button>
        )}
      </div>

      {/* Categories Tabs */}
      <div className="bg-white p-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-stone-100 z-10">
        <button
          onClick={() => setCurrentView('tools')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
            currentView === 'tools' ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-500'
          }`}
        >
          <Grid size={16} />
          {t('Tools', 'Vifaa')}
        </button>
        <button
          onClick={() => setCurrentView('symptom-checker' as any)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
            currentView === ('symptom-checker' as any) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          <Sparkles size={16} />
          {t('AI Checker', 'Mchambuzi wa AI')}
        </button>
        <button
          onClick={() => setCurrentView('clinical')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
            currentView === 'clinical' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600'
          }`}
        >
          <ClipboardList size={16} />
          {t('Assessment', 'Uchunguzi')}
        </button>
        <button
          onClick={() => setCurrentView('body-map')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
            currentView === 'body-map' ? 'bg-orange-600 text-white shadow-lg' : 'bg-orange-50 text-orange-600'
          }`}
        >
          <Accessibility size={16} />
          {t('Body Map', 'Ramani ya Mwili')}
        </button>
        <button
          onClick={() => setCurrentView('tsl')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
            currentView === 'tsl' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          <Activity size={16} />
          {t('TSL Board', 'Bodi ya TSL')}
        </button>
        <button
          onClick={() => setCurrentView('instructions')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
            currentView === 'instructions' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-50 text-purple-600'
          }`}
        >
          <Info size={16} />
          {t('Instructions', 'Maelekezo')}
          {incomingInstruction && !hasNewMessage && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />}
        </button>
        <button
          onClick={onViewHospitalServices}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all bg-blue-50 text-blue-600"
        >
          <Stethoscope size={16} />
          {t('Hospital', 'Hospitali')}
        </button>
        <button
          onClick={() => setCurrentView('text-to-sign')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
            currentView === 'text-to-sign' ? 'bg-amber-600 text-white shadow-lg' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <Languages size={16} />
          {t('Text to Sign', 'Maandishi kwenda Alama')}
        </button>
      </div>

      {/* Main Content Area (70%) */}
      <div className="flex-1 overflow-y-auto p-4 relative bg-white">
        <AnimatePresence mode="wait">
          {currentView === 'clinical' && (
            <motion.div 
              key="clinical"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col"
            >
              <ClinicalWizard 
                onComplete={(summary) => {
                  onSendRequest(t('Clinical Summary', 'Muhtasari wa Kitabibu'), summary);
                  setCurrentView('tools');
                }}
                onCancel={() => setCurrentView('tools')}
              />
            </motion.div>
          )}

          {currentView === ('symptom-checker' as any) && (
            <motion.div 
              key="symptom-checker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col"
            >
              <SymptomChecker 
                onBack={() => setCurrentView('tools')}
              />
            </motion.div>
          )}

          {currentView === 'body-map' && (
            <motion.div 
              key="body-map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col"
            >
              <BodyMap 
                onSendRequest={onSendRequest}
                onBack={() => setCurrentView('tools')}
              />
            </motion.div>
          )}

          {currentView === 'tsl' && (
            <motion.div 
              key="tsl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <TSLQuickBoard onSend={onSendRequest} />
            </motion.div>
          )}

          {currentView === 'instructions' && (
            <motion.div 
              key="instructions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col space-y-6"
            >
              <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                {/* Integrated Consultation History */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">{t('Consultation History', 'Historia ya Ushauri')}</h3>
                  
                  {/* Combine requests and instructions into a single timeline */}
                  {(() => {
                    const timeline = [
                      ...requests.map(r => ({ ...r, type: 'request' as const })),
                      ...instructions.map(i => ({ ...i, type: 'instruction' as const, time: i.timestamp }))
                    ].sort((a, b) => {
                      // Simple sort by time string (not perfect but works for same-day)
                      return b.time.localeCompare(a.time);
                    });

                    if (timeline.length === 0) {
                      return (
                        <div className="h-40 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                          <div className="text-stone-200">
                            <Info size={32} />
                          </div>
                          <p className="text-stone-400 text-xs font-medium">{t('No history yet.', 'Bado hakuna historia.')}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {timeline.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: item.type === 'request' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-2xl border-2 transition-all ${
                              item.type === 'request' 
                                ? 'bg-white border-blue-50 ml-8' 
                                : 'bg-purple-50 border-purple-100 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                item.type === 'request' ? 'text-blue-600' : 'text-purple-600'
                              }`}>
                                {item.type === 'request' ? t('You', 'Wewe') : t('Doctor', 'Daktari')}
                              </span>
                              <span className="text-[10px] font-bold text-stone-400">{item.time}</span>
                            </div>
                            <p className="text-sm font-bold text-stone-900">
                              {item.type === 'request' ? item.label : (item as any).instruction}
                            </p>
                            {item.type === 'instruction' && (item as any).tslDescription && (
                              <div className="mt-2 p-2 bg-white/50 rounded-xl border border-purple-100">
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{t('Sign', 'Alama')}</p>
                                <p className="text-xs font-bold italic text-purple-900">"{(item as any).tslDescription}"</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'text-to-sign' && (
            <motion.div 
              key="text-to-sign"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <TextToSign embedded />
            </motion.div>
          )}

          {currentView === 'tools' && (
            <motion.div 
              key="tools"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCurrentView('clinical')}
                  className="p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 flex flex-col items-center gap-3 text-center active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{t('Clinical Wizard', 'Mchawi wa Kitabibu')}</p>
                    <p className="text-xs font-bold text-stone-600">{t('Step-by-step assessment', 'Uchunguzi wa hatua kwa hatua')}</p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('body-map')}
                  className="p-6 bg-orange-50 rounded-[2rem] border-2 border-orange-100 flex flex-col items-center gap-3 text-center active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Accessibility size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{t('Body Map', 'Ramani ya Mwili')}</p>
                    <p className="text-xs font-bold text-stone-600">{t('Point to pain areas', 'Onyesha sehemu inayouma')}</p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('tsl')}
                  className="p-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center gap-3 text-center active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t('TSL Board', 'Bodi ya TSL')}</p>
                    <p className="text-xs font-bold text-stone-600">{t('Quick sign phrases', 'Maneno ya haraka ya alama')}</p>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentView('text-to-sign')}
                  className="p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100 flex flex-col items-center gap-3 text-center active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Languages size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{t('Text to Sign', 'Maandishi kwenda Alama')}</p>
                    <p className="text-xs font-bold text-stone-600">{t('Type to see signs', 'Andika uone alama')}</p>
                  </div>
                </button>
              </div>

              <div className="bg-stone-50 p-6 rounded-[2rem] border-2 border-dashed border-stone-200 text-center">
                <p className="text-stone-400 text-xs font-medium">{t('More tools coming soon...', 'Vifaa zaidi vinakuja hivi karibuni...')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Doctor's Rich Card Overlay */}
        <AnimatePresence>
          {hasNewMessage && incomingInstruction && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-4 bottom-4 z-50"
            >
              <div className="bg-stone-950 rounded-[3rem] overflow-hidden border-[8px] border-white shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col h-[500px]">
                {/* 1. Visual Sign Area (Top 50%) */}
                <div className="h-1/2 relative">
                  <TSLAvatar 
                    text={incomingInstruction.instruction} 
                    tslDescription={incomingInstruction.tslDescription}
                    className="w-full h-full"
                  />
                  
                  <button 
                    onClick={closeMessage}
                    className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors z-20"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* 2. Instruction Area (Bottom 50%) */}
                <div className="h-1/2 bg-white p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Doctor Instruction', 'Maelekezo ya Daktari')}</p>
                    </div>
                    <h3 className="text-4xl font-black text-stone-900 leading-[1.1] tracking-tight">
                      {incomingInstruction.instruction}
                    </h3>
                  </div>

                  {incomingInstruction.tslDescription && (
                    <div className="bg-blue-50 border-2 border-blue-100 p-5 rounded-3xl">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-2">{t('How to Sign (TSL)', 'Jinsi ya Kuonyesha (TSL)')}</p>
                      <p className="text-blue-900 font-bold text-sm leading-relaxed italic">
                        "{incomingInstruction.tslDescription}"
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => playPronunciation(incomingInstruction.instruction)}
                        className="flex-1 py-5 bg-stone-100 text-stone-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Volume2 size={20} />
                        {t('Repeat', 'Rudia')}
                      </button>
                      <button 
                        onClick={closeMessage}
                        className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                      >
                        <Check size={20} />
                        {t('Understood', 'Nimeelewa')}
                      </button>
                    </div>

                    {/* Quick React Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleQuickReact(t('Yes', 'Ndiyo'), t('Yes, I understand.', 'Ndiyo, nimeelewa.'))}
                        className="py-3 bg-blue-50 text-blue-600 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all border border-blue-100"
                      >
                        {t('Yes', 'Ndiyo')}
                      </button>
                      <button 
                        onClick={() => handleQuickReact(t('No', 'Hapana'), t('No, I dont understand.', 'Hapana, sijaelewa.'))}
                        className="py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all border border-red-100"
                      >
                        {t('No', 'Hapana')}
                      </button>
                      <button 
                        onClick={() => handleQuickReact(t('Pain', 'Maumivu'), t('I am in pain.', 'Nina maumivu.'))}
                        className="py-3 bg-amber-50 text-amber-600 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all border border-amber-100"
                      >
                        {t('Pain', 'Maumivu')}
                      </button>
                      <button 
                        onClick={() => handleQuickReact(t('Thanks', 'Asante'), t('Thank you, doctor.', 'Asante, daktari.'))}
                        className="py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all border border-emerald-100"
                      >
                        {t('Thanks', 'Asante')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Interaction Zone (30%) */}
      <div className="p-4 bg-white border-t border-stone-200 space-y-3 z-10">
        {/* Emergency Panic Button */}
        <button 
          onClick={() => handlePress('emergency', t('EMERGENCY', 'DHARURA'), t('I need help immediately!', 'Nahitaji msaada haraka sana!'))}
          className={`w-full flex items-center justify-center gap-3 p-6 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xl active:scale-[0.98] transition-all shadow-xl ${isPulsing ? 'animate-pulse ring-8 ring-red-500/50 scale-105' : 'animate-none'}`}
        >
          <AlertCircle size={28} />
          {t('HELP NOW', 'MSAADA SASA')}
        </button>
      </div>
    </div>
  );
};
