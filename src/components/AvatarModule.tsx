import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Mic, 
  Send, 
  Sparkles, 
  Loader2, 
  Stethoscope, 
  HeartPulse, 
  Info,
  Volume2,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TSLAvatar } from './TSLAvatar';
import { chatWithDoctor } from '../services/geminiService';
import { playPronunciation } from '../services/ttsService';

interface AvatarModuleProps {
  onBack: () => void;
}

export const AvatarModule: React.FC<AvatarModuleProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState<{
    text: string;
    tslDescription?: string;
  } | null>(null);

  const handleSend = async (textOverride?: string) => {
    const textToProcess = textOverride || inputText;
    if (!textToProcess.trim()) return;
    
    setIsAiLoading(true);
    try {
      // Use Gemini to process the instruction and get TSL description
      const response = await chatWithDoctor(textToProcess);
      
      // Extract TSL description if present in the response
      const tslMatch = response.match(/Ishara ya TSL: \[(.*?)\]/);
      const tslDescription = tslMatch ? tslMatch[1] : undefined;
      const cleanInstruction = response.replace(/Ishara ya TSL: \[.*?\]/g, '').trim();
      
      setCurrentInstruction({
        text: cleanInstruction,
        tslDescription: tslDescription
      });
      
      // Auto-play audio
      playPronunciation(cleanInstruction);
    } catch (error) {
      console.error("Avatar Module Error:", error);
    } finally {
      setIsAiLoading(false);
      setInputText('');
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('Speech recognition not supported', 'Utambuzi wa sauti hautegemezwi'));
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'sw-KE';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.start();
  };

  const SUGGESTIONS = [
    { en: 'Take deep breaths', sw: 'Vuta pumzi ndani' },
    { en: 'Open your mouth', sw: 'Fungua mdomo' },
    { en: 'Where does it hurt?', sw: 'Wapi panakuuma?' },
    { en: 'Take this medicine', sw: 'Tumia dawa hii' },
  ];

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 bg-white border-b border-stone-100">
        <button 
          onClick={onBack}
          className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t('AI Medical Avatar', 'Avatar wa Matibabu wa AI')}</h2>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('TSL Interpretation', 'Ufafanuzi wa TSL')}</p>
        </div>
        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
          <Sparkles size={24} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Avatar Display Area */}
        <div className="aspect-[4/5] w-full max-w-md mx-auto relative group">
          <TSLAvatar 
            text={currentInstruction?.text || ""} 
            tslDescription={currentInstruction?.tslDescription}
            className="w-full h-full shadow-2xl"
          />
          
          <AnimatePresence>
            {!currentInstruction && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-black/20 backdrop-blur-[2px] rounded-[2.5rem]"
              >
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-white/20 mb-6">
                  <MessageSquare size={48} />
                </div>
                <p className="text-white font-black uppercase tracking-[0.2em] text-xs mb-2">
                  {t('Ready to Sign', 'Tayari kuashiria')}
                </p>
                <p className="text-white/60 text-sm font-medium">
                  {t('Type or speak a medical instruction to see it in Tanzanian Sign Language.', 'Andika au zungumza maelekezo ya matibabu ili uyaone katika Lugha ya Alama ya Tanzania.')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instruction Details */}
        <AnimatePresence>
          {currentInstruction && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-stone-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Current Instruction', 'Maelekezo ya Sasa')}</p>
                  </div>
                  <button 
                    onClick={() => playPronunciation(currentInstruction.text)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <h3 className="text-3xl font-black text-stone-900 leading-tight">
                  {currentInstruction.text}
                </h3>
                
                {currentInstruction.tslDescription && (
                  <div className="pt-4 border-t border-stone-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{t('TSL Description', 'Maelezo ya TSL')}</p>
                    <p className="text-stone-600 font-medium italic leading-relaxed">
                      "{currentInstruction.tslDescription}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Try these instructions', 'Jaribu maelekezo haya')}</p>
          <div className="grid grid-cols-2 gap-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.en}
                onClick={() => handleSend(t(s.en, s.sw))}
                className="p-4 bg-white border-2 border-stone-100 rounded-2xl text-left hover:border-blue-500 transition-all group"
              >
                <p className="text-sm font-black text-stone-900 group-hover:text-blue-600 transition-colors">{t(s.en, s.sw)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-stone-100 pb-safe">
        <div className="flex gap-3">
          <button 
            onClick={startListening}
            className={`p-6 rounded-[2rem] border-2 transition-all ${
              isListening ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-stone-50 border-stone-100 text-stone-600'
            }`}
          >
            <Mic size={28} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('Type instruction...', 'Andika maelekezo...')}
              className="w-full h-full px-6 py-4 bg-stone-50 border-2 border-stone-100 rounded-[2rem] text-sm font-bold focus:border-blue-500 outline-none transition-all pr-16"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isAiLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-blue-600 text-white rounded-2xl shadow-lg disabled:opacity-50 active:scale-90 transition-transform"
            >
              {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
