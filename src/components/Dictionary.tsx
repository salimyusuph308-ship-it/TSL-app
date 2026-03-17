import React, { useState, useMemo } from 'react';
import { DICTIONARY_DATA, DictionaryEntry } from '../data/dictionaryData';
import { Search, HeartPulse, GraduationCap, Sprout, ShoppingCart, Info, AlertCircle, Scale, Sparkles, Loader2, Volume2, Mic, Languages, Clock } from 'lucide-react';
import { generateSignIllustration } from '../services/imageGenService';
import { generateTSLDescription } from '../services/geminiService';
import { playPronunciation } from '../services/ttsService';
import { useLanguage } from '../contexts/LanguageContext';
import { useProfile } from '../contexts/ProfileContext';
import { TSLAvatar } from './TSLAvatar';

interface DictionaryProps {
  onSignClick?: (entry: DictionaryEntry) => void;
}

export const Dictionary: React.FC<DictionaryProps> = ({ onSignClick }) => {
  const { t } = useLanguage();
  const { frequentSigns } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handlePlayPronunciation = async () => {
    if (!selectedEntry) return;
    setIsPlaying(true);
    await playPronunciation(selectedEntry.word);
    setIsPlaying(false);
  };

  const handleGenerateAI = async () => {
    if (!selectedEntry) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateSignIllustration(selectedEntry.word, selectedEntry.description);
      if (imageUrl) {
        setSelectedEntry({
          ...selectedEntry,
          imageUrl: imageUrl,
          description: `(AI Generated Illustration) ${selectedEntry.description}`,
          descriptionSwahili: `(Picha ya AI) ${selectedEntry.descriptionSwahili}`
        });
      }
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.status === 429) {
        alert(t('Rate limit exceeded. Please wait a moment and try again.', 'Kikomo cha matumizi kimefikiwa. Tafadhali subiri kidogo na ujaribu tena.'));
      } else {
        alert(t('Failed to generate illustration. Please try again.', 'Imeshindwa kutengeneza picha. Tafadhali jaribu tena.'));
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
    recognition.lang = useLanguage().language === 'en' ? 'en-US' : 'sw-KE';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.start();
  };

  const categories = [
    { id: 'alphabet', label: t('Alphabet', 'Alfabeti'), icon: Languages },
    { id: 'health', label: t('Health', 'Afya'), icon: HeartPulse },
    { id: 'school', label: t('School', 'Shule'), icon: GraduationCap },
    { id: 'farming', label: t('Farming', 'Kilimo'), icon: Sprout },
    { id: 'market', label: t('Market', 'Sokoni'), icon: ShoppingCart },
    { id: 'emergency', label: t('Emergency', 'Dharura'), icon: AlertCircle },
    { id: 'legal', label: t('Legal', 'Sheria'), icon: Scale },
  ];

  const filteredData = DICTIONARY_DATA.filter((entry) => {
    const matchesSearch = entry.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.wordSwahili.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? entry.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  const frequentEntries = useMemo(() => {
    if (!frequentSigns || frequentSigns.length === 0) return [];
    return frequentSigns
      .map(fs => DICTIONARY_DATA.find(d => d.id === fs.sign_id))
      .filter(Boolean) as DictionaryEntry[];
  }, [frequentSigns]);

  const handleEntryClick = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    onSignClick?.(entry);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Search Bar */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder={t('Search words...', 'Tafuta maneno...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-stone-200 rounded-2xl text-lg focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={startListening}
          className={`p-4 rounded-2xl border-2 transition-all ${
            isListening ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white border-stone-200 text-stone-600'
          }`}
        >
          <Mic size={24} />
        </button>
      </div>

      {/* Frequently Used */}
      {frequentEntries.length > 0 && !searchQuery && !activeCategory && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock size={14} className="text-stone-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-stone-400">
              {t('Frequently Used', 'Inayotumika Mara kwa Mara')}
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {frequentEntries.map((entry) => (
              <button
                key={`freq-${entry.id}`}
                onClick={() => handleEntryClick(entry)}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-50 overflow-hidden">
                  <img src={entry.imageUrl} alt={entry.word} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[10px] font-bold text-stone-700">{t(entry.word, entry.wordSwahili)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                isActive 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                  : 'bg-white border-stone-100 text-stone-600'
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-100' : 'bg-stone-50'}`}>
                <Icon size={20} />
              </div>
              <span className="font-bold text-sm">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400">
            {activeCategory ? t(`${activeCategory} Words`, `Maneno ya ${activeCategory}`) : t('All Words', 'Maneno Yote')}
          </h2>
          {activeCategory === 'alphabet' && (
            <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-full uppercase tracking-widest">
              {t('Includes Vowels', 'Inajumuisha Irabu')}
            </span>
          )}
        </div>
        {filteredData.map((entry) => (
          <button
            key={entry.id}
            onClick={() => handleEntryClick(entry)}
            className={`w-full flex items-center justify-between p-5 bg-white rounded-2xl border transition-transform active:scale-[0.98] ${
              entry.category === 'alphabet' && ['A', 'E', 'I', 'O', 'U'].includes(entry.word)
                ? 'border-amber-200 shadow-sm bg-amber-50/30'
                : 'border-stone-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-stone-800">{t(entry.word, entry.wordSwahili)}</span>
                {entry.category === 'alphabet' && ['A', 'E', 'I', 'O', 'U'].includes(entry.word) && (
                  <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    {t('Vowel', 'Irabu')}
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-400 uppercase font-bold tracking-tighter">{t(entry.category, entry.category)}</span>
            </div>
            <Info className="text-stone-300" size={20} />
          </button>
        ))}
      </div>

      {/* Detail Modal (Simple Overlay) */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="relative aspect-square bg-stone-100">
              {selectedEntry.description.includes('AI Generated') ? (
                <TSLAvatar 
                  text={selectedEntry.word} 
                  tslDescription={selectedEntry.description}
                  className="w-full h-full rounded-none" 
                />
              ) : (
                <img 
                  src={selectedEntry.imageUrl} 
                  alt={selectedEntry.word}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <button 
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black text-stone-900">{t(selectedEntry.word, selectedEntry.wordSwahili)}</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePlayPronunciation}
                    disabled={isPlaying}
                    className={`p-3 rounded-xl transition-all ${
                      isPlaying ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <Volume2 size={24} className={isPlaying ? 'animate-pulse' : ''} />
                  </button>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {t(selectedEntry.category, selectedEntry.category)}
                  </span>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed text-lg">
                {t(selectedEntry.description, selectedEntry.descriptionSwahili)}
              </p>
              
              {selectedEntry.facialExpression && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-1">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} />
                    {t('Facial Expression', 'Sura ya Uso')}
                  </p>
                  <p className="text-sm text-emerald-800 font-bold italic">
                    {t(selectedEntry.facialExpression, selectedEntry.facialExpressionSwahili)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="flex-1 py-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 border border-emerald-100"
                >
                  {isGenerating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  <span className="text-sm">{t('AI Illustration', 'Picha ya AI')}</span>
                </button>
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="flex-[2] py-4 bg-stone-900 text-white font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  {t('Got it', 'Sawa')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
