import React, { useState } from 'react';
import { Mic, Send, Volume2, Sparkles, Loader2, ChevronLeft } from 'lucide-react';
import { DICTIONARY_DATA } from '../data/dictionaryData';
import { generateSignIllustration } from '../services/imageGenService';
import { generateTSLDescription } from '../services/geminiService';
import { playPronunciation } from '../services/ttsService';
import { useLanguage } from '../contexts/LanguageContext';
import { TSLAvatar } from './TSLAvatar';

interface TextToSignProps {
  onBack?: () => void;
  onSend?: (text: string, description?: string) => void;
  embedded?: boolean;
}

export const TextToSign: React.FC<TextToSignProps> = ({ onBack, onSend, embedded = false }) => {
  const { t, language } = useLanguage();
  const [text, setText] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPronunciation = async () => {
    if (!result) return;
    setIsPlaying(true);
    // Always use English for TTS if it's the primary sign language reference, 
    // or we could use the displayed word.
    await playPronunciation(result.word);
    setIsPlaying(false);
  };

  const handleSearch = () => {
    const found = DICTIONARY_DATA.find(
      (entry) => 
        entry.word.toLowerCase() === text.toLowerCase().trim() ||
        entry.wordSwahili.toLowerCase() === text.toLowerCase().trim()
    );
    setResult(found || null);
  };

  const handleGenerateAI = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      // First generate a TSL description to use for both the prompt and the UI
      const aiDescription = await generateTSLDescription(text);
      
      setResult({
        id: 'ai-gen-' + Date.now(),
        word: text,
        wordSwahili: text, // Fallback
        category: 'AI Generated',
        description: aiDescription,
        descriptionSwahili: `Hii ni picha ya AI kwa ajili ya "${text}".`,
        // imageUrl is no longer needed as TSLAvatar handles it
      });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      if (error?.message?.includes('429') || error?.status === 429) {
        alert(t('Rate limit exceeded. Please wait a moment and try again.', 'Kikomo cha matumizi kimefikiwa. Tafadhali subiri kidogo na ujaribu tena.'));
      } else {
        alert(t("An error occurred. Please try again.", "Kuna tatizo limetokea. Tafadhali jaribu tena."));
      }
    } finally {
      setIsGenerating(false);
    }
  };


  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('Speech recognition not supported in this browser.', 'Utambuzi wa sauti hautumiki katika kivinjari hiki.'));
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'en' ? 'en-US' : 'sw-KE';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      const found = DICTIONARY_DATA.find(
        (entry) => 
          entry.word.toLowerCase() === transcript.toLowerCase().trim() ||
          entry.wordSwahili.toLowerCase() === transcript.toLowerCase().trim()
      );
      setResult(found || null);
    };

    recognition.start();
  };

  return (
    <div className={`flex flex-col bg-white ${embedded ? 'h-full' : 'min-h-full'}`}>
      {onBack && (
        <div className="p-6 pb-0 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">{t('Text to Sign', 'Maandishi kwenda Alama')}</h2>
        </div>
      )}
      <div className="p-6 space-y-8 overflow-y-auto flex-1">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-stone-900 leading-tight">{t('Speak or Type to Learn', 'Ongea au Chapa ili Ujifunze')}</h2>
        <p className="text-stone-500 font-medium">{t('Enter a word to see how it\'s signed.', 'Ingiza neno ili uone jinsi linavyoashiriwa.')}</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('Type a word...', 'Chapa neno...')}
            className="w-full p-6 bg-white border-2 border-stone-200 rounded-3xl text-xl font-bold placeholder:text-stone-300 focus:border-emerald-500 outline-none transition-all pr-32"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={startListening}
              className={`p-4 rounded-2xl transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Mic size={24} />
            </button>
            <button
              onClick={handleSearch}
              className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>

      {result ? (
        <div className="bg-white rounded-3xl border-2 border-stone-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="aspect-square bg-stone-50 relative">
            {result.id.startsWith('ai-gen-') ? (
              <TSLAvatar 
                text={result.word} 
                tslDescription={result.description}
                className="w-full h-full rounded-none" 
              />
            ) : (
              <img 
                src={result.imageUrl} 
                alt={result.word} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-sm font-black text-emerald-700 shadow-sm">
                {t(result.category, result.category).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-black text-stone-900">{t(result.word, result.wordSwahili)}</h3>
              <div className="flex items-center gap-2">
                {onSend && (
                  <button 
                    onClick={() => onSend(result.word, result.description)}
                    className="p-3 bg-blue-600 text-white rounded-xl active:scale-90 transition-transform flex items-center gap-2"
                  >
                    <Send size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('Send to Patient', 'Tuma kwa Mgonjwa')}</span>
                  </button>
                )}
                <button 
                  onClick={handlePlayPronunciation}
                  disabled={isPlaying}
                  className={`p-3 rounded-xl transition-all ${
                    isPlaying ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Volume2 size={24} className={isPlaying ? 'animate-pulse' : ''} />
                </button>
              </div>
            </div>
            <p className="text-xl text-stone-600 leading-relaxed">
              {t(result.description, result.descriptionSwahili)}
            </p>
          </div>
        </div>
      ) : text && !isListening ? (
        <div className="p-12 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200 text-center space-y-6">
          <div className="text-4xl">🤔</div>
          <div className="space-y-2">
            <p className="text-stone-500 font-bold">{t('Word not in dictionary yet.', 'Neno halipo kwenye kamusi bado.')}</p>
            <p className="text-stone-400 text-sm">{t(`Would you like to generate an abstract illustration for "${text}"?`, `Je, ungependa kutengeneza picha ya AI kwa ajili ya "${text}"?`)}</p>
          </div>
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {t('Generating...', 'Inatengeneza...')}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                {t('Generate AI Illustration', 'Tengeneza Picha ya AI')}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[
            { en: 'Doctor', sw: 'Daktari' },
            { en: 'Water', sw: 'Maji' },
            { en: 'School', sw: 'Shule' },
            { en: 'Market', sw: 'Sokoni' }
          ].map((item) => (
            <button
              key={item.en}
              onClick={() => {
                setText(t(item.en, item.sw));
                const found = DICTIONARY_DATA.find(e => e.word.toLowerCase() === item.en.toLowerCase());
                setResult(found || null);
              }}
              className="p-6 bg-white border border-stone-200 rounded-2xl text-left hover:border-emerald-500 transition-all group"
            >
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest block mb-1">{t('Try', 'Jaribu')}</span>
              <span className="text-xl font-bold text-stone-800 group-hover:text-emerald-600">{t(item.en, item.sw)}</span>
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
