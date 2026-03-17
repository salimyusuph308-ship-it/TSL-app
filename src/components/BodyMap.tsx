import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Check, 
  X, 
  Play, 
  Info,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TSLAvatar } from './TSLAvatar';

interface BodyPart {
  id: string;
  name: string;
  nameSw: string;
  path: string;
  view: 'front' | 'back' | 'side';
  layer?: 'general' | 'pregnancy' | 'skin';
  tslPhrase: string;
  tslPhraseSw: string;
}

const BODY_PARTS: BodyPart[] = [
  // FRONT VIEW
  { 
    id: 'head', 
    name: 'Head', 
    nameSw: 'Kichwa', 
    path: 'M 100 20 a 15 15 0 1 1 0.1 0 Z', 
    view: 'front',
    tslPhrase: 'My head hurts', 
    tslPhraseSw: 'Kichwa kinauma' 
  },
  { 
    id: 'chest', 
    name: 'Chest', 
    nameSw: 'Kifua', 
    path: 'M 85 45 h 30 v 25 h -30 Z', 
    view: 'front',
    tslPhrase: 'My chest hurts', 
    tslPhraseSw: 'Kifua kinauma' 
  },
  { 
    id: 'stomach', 
    name: 'Stomach', 
    nameSw: 'Tumbo', 
    path: 'M 85 75 h 30 v 25 h -30 Z', 
    view: 'front',
    tslPhrase: 'My stomach hurts', 
    tslPhraseSw: 'Tumbo linauma' 
  },
  { 
    id: 'left-arm', 
    name: 'Left Arm', 
    nameSw: 'Mkono wa Kushoto', 
    path: 'M 70 45 h 10 v 40 h -10 Z', 
    view: 'front',
    tslPhrase: 'My left arm hurts', 
    tslPhraseSw: 'Mkono wa kushoto unauma' 
  },
  { 
    id: 'right-arm', 
    name: 'Right Arm', 
    nameSw: 'Mkono wa Kulia', 
    path: 'M 120 45 h 10 v 40 h -10 Z', 
    view: 'front',
    tslPhrase: 'My right arm hurts', 
    tslPhraseSw: 'Mkono wa kulia unauma' 
  },
  { 
    id: 'left-leg', 
    name: 'Left Leg', 
    nameSw: 'Mguu wa Kushoto', 
    path: 'M 85 105 h 12 v 60 h -12 Z', 
    view: 'front',
    tslPhrase: 'My left leg hurts', 
    tslPhraseSw: 'Mguu wa kushoto unauma' 
  },
  { 
    id: 'right-leg', 
    name: 'Right Leg', 
    nameSw: 'Mguu wa Kulia', 
    path: 'M 103 105 h 12 v 60 h -12 Z', 
    view: 'front',
    tslPhrase: 'My right leg hurts', 
    tslPhraseSw: 'Mguu wa kulia unauma' 
  },

  // BACK VIEW
  { 
    id: 'back-head', 
    name: 'Back of Head', 
    nameSw: 'Kichogo', 
    path: 'M 100 20 a 15 15 0 1 1 0.1 0 Z', 
    view: 'back',
    tslPhrase: 'Back of my head hurts', 
    tslPhraseSw: 'Kichogo kinauma' 
  },
  { 
    id: 'upper-back', 
    name: 'Upper Back', 
    nameSw: 'Mabega/Mgongo wa Juu', 
    path: 'M 85 45 h 30 v 25 h -30 Z', 
    view: 'back',
    tslPhrase: 'My upper back hurts', 
    tslPhraseSw: 'Mgongo wa juu unauma' 
  },
  { 
    id: 'lower-back', 
    name: 'Lower Back', 
    nameSw: 'Kiuno/Mgongo wa Chini', 
    path: 'M 85 75 h 30 v 25 h -30 Z', 
    view: 'back',
    tslPhrase: 'My lower back hurts', 
    tslPhraseSw: 'Kiuno kinauma' 
  },

  // SIDE VIEW
  { 
    id: 'side-head', 
    name: 'Side of Head', 
    nameSw: 'Upande wa Kichwa', 
    path: 'M 95 20 a 15 15 0 1 1 0.1 0 Z', 
    view: 'side',
    tslPhrase: 'Side of my head hurts', 
    tslPhraseSw: 'Upande wa kichwa unauma' 
  },
  { 
    id: 'side-torso', 
    name: 'Side/Flank', 
    nameSw: 'Ubavu', 
    path: 'M 95 45 h 15 v 55 h -15 Z', 
    view: 'side',
    tslPhrase: 'My side hurts', 
    tslPhraseSw: 'Ubavu unauma' 
  },

  // PREGNANCY LAYER
  { 
    id: 'fetus-position', 
    name: 'Fetus Position', 
    nameSw: 'Nafasi ya Mtoto', 
    path: 'M 80 80 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0', 
    view: 'front',
    layer: 'pregnancy',
    tslPhrase: 'Baby movement/position', 
    tslPhraseSw: 'Mchezo/Nafasi ya mtoto' 
  },
  { 
    id: 'labor-pain', 
    name: 'Labor Pain', 
    nameSw: 'Uchungu wa Uzazi', 
    path: 'M 85 100 h 30 v 10 h -30 Z', 
    view: 'front',
    layer: 'pregnancy',
    tslPhrase: 'I am in labor', 
    tslPhraseSw: 'Nina uchungu wa uzazi' 
  },

  // SKIN LAYER
  { 
    id: 'skin-lesion', 
    name: 'Skin Lesion/Spot', 
    nameSw: 'Kidonda/Doa la Ngozi', 
    path: 'M 98 50 a 4 4 0 1 0 4 0 a 4 4 0 1 0 -4 0', 
    view: 'front',
    layer: 'skin',
    tslPhrase: 'Skin spot/lesion here', 
    tslPhraseSw: 'Doa/kidonda cha ngozi hapa' 
  },
  { 
    id: 'skin-burn', 
    name: 'Skin Burn', 
    nameSw: 'Ngozi Kuungua', 
    path: 'M 120 60 h 8 v 15 h -8 Z', 
    view: 'front',
    layer: 'skin',
    tslPhrase: 'Sunburn/Skin burn', 
    tslPhraseSw: 'Ngozi imeungua' 
  },
];

interface BodyMapProps {
  onBack: () => void;
  onSendRequest: (label: string, phrase?: string) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({ onBack, onSendRequest }) => {
  const { t, language } = useLanguage();
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [showTSL, setShowTSL] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back' | 'side'>('front');
  const [activeLayer, setActiveLayer] = useState<'general' | 'pregnancy' | 'skin'>('general');
  const [symptomDetails, setSymptomDetails] = useState<Record<string, { intensity: number, duration: string, type: string }>>({});

  const togglePart = (id: string) => {
    setSelectedParts(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      } else {
        // Initialize details for new part
        setSymptomDetails(details => ({
          ...details,
          [id]: { intensity: 5, duration: 'today', type: 'sharp' }
        }));
        return [...prev, id];
      }
    });
  };

  const updateDetail = (id: string, field: string, value: any) => {
    setSymptomDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSend = () => {
    if (selectedParts.length === 0) return;
    
    const partsSummary = selectedParts.map(id => {
      const part = BODY_PARTS.find(p => p.id === id);
      const details = symptomDetails[id] || { intensity: 5, duration: 'today', type: 'sharp' };
      const name = language === 'sw' ? part?.nameSw : part?.name;
      
      const durationLabel = {
        'today': language === 'sw' ? 'Leo' : 'Today',
        'days': language === 'sw' ? 'Siku 2-3' : '2-3 Days',
        'week': language === 'sw' ? 'Wiki 1' : '1 Week',
        'long': language === 'sw' ? 'Muda mrefu' : 'Long time'
      }[details.duration as keyof typeof durationLabel];

      const typeLabel = {
        'sharp': language === 'sw' ? 'Kali' : 'Sharp',
        'dull': language === 'sw' ? 'Butu' : 'Dull',
        'burning': language === 'sw' ? 'Inayochoma' : 'Burning',
        'throbbing': language === 'sw' ? 'Inayodunda' : 'Throbbing'
      }[details.type as keyof typeof typeLabel];

      return `${name} (${typeLabel}, ${t('Intensity', 'Ukali')}: ${details.intensity}/10, ${t('Duration', 'Muda')}: ${durationLabel})`;
    }).join('; ');

    const summary = language === 'sw' 
      ? `Maelezo ya Maumivu (${activeLayer}): ${partsSummary}`
      : `Pain Details (${activeLayer}): ${partsSummary}`;

    onSendRequest(t('Body Map Selection', 'Uchaguzi wa Ramani ya Mwili'), summary);
    onBack();
  };

  const currentTSLPart = BODY_PARTS.find(p => p.id === showTSL);

  // Filter parts based on view and active layer
  const visibleParts = BODY_PARTS.filter(p => {
    if (p.view !== view) return false;
    if (p.layer && p.layer !== activeLayer) return false;
    if (!p.layer && activeLayer !== 'general') {
        // Only show general parts in pregnancy/skin if they make sense
        // For simplicity, we show all general parts in all layers if they match the view
        return true;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 border-b border-stone-200">
        <button 
          onClick={onBack}
          className="p-2 bg-stone-100 rounded-xl text-stone-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-black text-stone-900 tracking-tight leading-none">
            {t('Interactive Body Map', 'Ramani ya Mwili')}
          </h2>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
            {t('Tap where it hurts', 'Gusa sehemu inayouma')}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {/* Layer Toggle */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-4 w-full max-w-[320px]">
          <button
            onClick={() => setActiveLayer('general')}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeLayer === 'general' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
            }`}
          >
            {t('General', 'Kawaida')}
          </button>
          <button
            onClick={() => setActiveLayer('pregnancy')}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeLayer === 'pregnancy' ? 'bg-pink-100 text-pink-700 shadow-sm' : 'text-stone-400'
            }`}
          >
            {t('Pregnancy', 'Ujauzito')}
          </button>
          <button
            onClick={() => setActiveLayer('skin')}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeLayer === 'skin' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-stone-400'
            }`}
          >
            {t('Skin/Albinism', 'Ngozi')}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-6 w-full max-w-[240px]">
          <button
            onClick={() => setView('front')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'front' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
            }`}
          >
            {t('Front', 'Mbele')}
          </button>
          <button
            onClick={() => setView('back')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'back' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
            }`}
          >
            {t('Back', 'Nyuma')}
          </button>
          <button
            onClick={() => setView('side')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              view === 'side' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
            }`}
          >
            {t('Side', 'Ubavu')}
          </button>
        </div>

        {/* SVG Body Map */}
        <div className="relative w-full max-w-[300px] aspect-[1/2] bg-white rounded-[3rem] shadow-xl border-8 border-stone-100 p-4 flex items-center justify-center">
          <svg 
            viewBox="60 10 80 160" 
            className="w-full h-full drop-shadow-md"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}
          >
            {/* Base Body Outline */}
            <path 
              d={view === 'side' 
                ? "M 100 20 a 15 15 0 1 1 0.1 0 Z M 95 45 h 15 v 55 h -15 Z M 95 105 h 15 v 60 h -15 Z" 
                : "M 100 20 a 15 15 0 1 1 0.1 0 Z M 85 45 h 30 v 55 h -30 Z M 70 45 h 10 v 40 h -10 Z M 120 45 h 10 v 40 h -10 Z M 85 105 h 12 v 60 h -12 Z M 103 105 h 12 v 60 h -12 Z"
              } 
              fill={activeLayer === 'skin' ? '#fff7ed' : '#f5f5f4'} 
              stroke={activeLayer === 'skin' ? '#ffedd5' : '#e7e5e4'} 
              strokeWidth="1"
            />

            {/* Pregnancy Belly Overlay */}
            {activeLayer === 'pregnancy' && view === 'front' && (
                <circle cx="100" cy="85" r="18" fill="#fce7f3" stroke="#fbcfe8" strokeWidth="1" opacity="0.5" />
            )}

            {/* Interactive Parts */}
            {visibleParts.map((part) => {
              const isSelected = selectedParts.includes(part.id);
              return (
                <g key={part.id} onClick={() => togglePart(part.id)} className="cursor-pointer">
                  <motion.path
                    d={part.path}
                    initial={false}
                    animate={{
                      fill: isSelected 
                        ? (part.layer === 'pregnancy' ? '#db2777' : part.layer === 'skin' ? '#d97706' : '#f97316') 
                        : (part.layer === 'pregnancy' ? '#fdf2f8' : part.layer === 'skin' ? '#fffbeb' : '#ffffff'),
                      stroke: isSelected 
                        ? (part.layer === 'pregnancy' ? '#9d174d' : part.layer === 'skin' ? '#92400e' : '#ea580c') 
                        : (part.layer === 'pregnancy' ? '#fbcfe8' : part.layer === 'skin' ? '#fef3c7' : '#d6d3d1'),
                      strokeWidth: isSelected ? 2 : 1,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="transition-colors duration-200"
                  />
                  {isSelected && (
                    <motion.circle
                      cx={part.id === 'head' || part.id === 'side-head' || part.id === 'back-head' ? 100 : part.id.includes('left') ? 80 : part.id.includes('right') ? 120 : 100}
                      cy={part.id.includes('head') ? 35 : part.id.includes('chest') || part.id.includes('back') ? 57 : part.id.includes('stomach') || part.id === 'fetus-position' ? 87 : part.id.includes('arm') ? 65 : 135}
                      r="4"
                      fill={part.layer === 'pregnancy' ? '#db2777' : part.layer === 'skin' ? '#d97706' : '#ea580c'}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Selection Info Overlay */}
          <div className="absolute top-4 right-4">
            <div className="bg-stone-900/5 backdrop-blur-sm p-2 rounded-2xl flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-[8px] font-black uppercase text-stone-500">{t('Selected', 'Imechaguliwa')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Parts Chips */}
        <div className="w-full mt-8 space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <AnimatePresence>
              {selectedParts.map(id => {
                const part = BODY_PARTS.find(p => p.id === id);
                return (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setShowTSL(id)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-black border border-orange-200 shadow-sm active:scale-95 transition-all"
                  >
                    {language === 'sw' ? part?.nameSw : part?.name}
                    <Play size={12} className="fill-current" />
                    <X 
                      size={14} 
                      className="ml-1 opacity-50 hover:opacity-100" 
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePart(id);
                      }}
                    />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {selectedParts.length === 0 && (
            <div className="text-center py-8 text-stone-400">
              <Activity size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs font-medium">{t('No parts selected yet', 'Bado hakuna sehemu iliyochaguliwa')}</p>
            </div>
          )}
        </div>
      </div>

      {/* TSL Video Overlay (Modal) */}
      <AnimatePresence>
        {showTSL && currentTSLPart && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="relative aspect-video bg-stone-900 flex items-center justify-center">
                <TSLAvatar 
                  text={language === 'sw' ? currentTSLPart.tslPhraseSw : currentTSLPart.tslPhrase}
                  className="w-full h-full rounded-none"
                />
                
                <button 
                  onClick={() => setShowTSL(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      {t('Symptom Description', 'Maelezo ya Dalili')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-3 h-3 rounded-full ${i < 3 ? 'bg-red-500' : 'bg-stone-200'}`} 
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-stone-900 leading-tight">
                  {language === 'sw' ? currentTSLPart.tslPhraseSw : currentTSLPart.tslPhrase}
                </h3>

                {/* Intensity Slider */}
                <div className="pt-4 space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      {t('Pain Intensity', 'Ukali wa Maumivu')}
                    </p>
                    <p className="text-xl font-black text-orange-600">
                      {(symptomDetails[showTSL]?.intensity || 5)}/10
                    </p>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={symptomDetails[showTSL]?.intensity || 5}
                    onChange={(e) => updateDetail(showTSL, 'intensity', parseInt(e.target.value))}
                    className="w-full h-2 bg-stone-100 rounded-full appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-stone-400 uppercase tracking-tighter">
                    <span>{t('Low', 'Kidogo')}</span>
                    <span>{t('Medium', 'Wastani')}</span>
                    <span>{t('Severe', 'Sana')}</span>
                  </div>
                </div>

                {/* Duration Selection */}
                <div className="pt-4 space-y-3">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    {t('Duration', 'Muda wa Maumivu')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'today', label: t('Today', 'Leo') },
                      { id: 'days', label: t('2-3 Days', 'Siku 2-3') },
                      { id: 'week', label: t('1 Week', 'Wiki 1') },
                      { id: 'long', label: t('Long time', 'Muda mrefu') }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateDetail(showTSL, 'duration', opt.id)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          symptomDetails[showTSL]?.duration === opt.id 
                            ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                            : 'bg-stone-50 text-stone-500 border-stone-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type of Pain */}
                <div className="pt-4 space-y-3">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    {t('Type of Pain', 'Aina ya Maumivu')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'sharp', label: t('Sharp', 'Kali') },
                      { id: 'dull', label: t('Dull', 'Butu') },
                      { id: 'burning', label: t('Burning', 'Inayochoma') },
                      { id: 'throbbing', label: t('Throbbing', 'Inayodunda') }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateDetail(showTSL, 'type', opt.id)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          symptomDetails[showTSL]?.type === opt.id 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                            : 'bg-stone-50 text-stone-500 border-stone-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowTSL(null)}
                    className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
                  >
                    {t('Close', 'Funga')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <div className="p-4 bg-white border-t border-stone-200">
        <button 
          onClick={handleSend}
          disabled={selectedParts.length === 0}
          className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-lg ${
            selectedParts.length > 0 
              ? 'bg-orange-600 text-white shadow-orange-200' 
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Check size={24} />
          {t('Send to Doctor', 'Tuma kwa Daktari')}
        </button>
      </div>
    </div>
  );
};
