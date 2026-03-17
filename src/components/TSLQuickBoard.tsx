import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  User, 
  ShoppingBasket, 
  MessageSquare, 
  Play, 
  Volume2, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { playPronunciation } from '../services/ttsService';

interface TSLButton {
  id: string;
  icon: string;
  gifUrl: string;
  label: string;
  phrase: string;
  color: string;
}

interface TSLQuickBoardProps {
  onSend: (label: string, phrase: string) => void;
  compact?: boolean;
}

export const TSLQuickBoard: React.FC<TSLQuickBoardProps> = ({ onSend, compact = false }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('symptoms');
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  const TSL_DATA: Record<string, TSLButton[]> = {
    symptoms: [
      { id: 'pain', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Face%20with%20head-bandage/Flat/face_with_head-bandage_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Pain', 'Maumivu'), phrase: t('Doctor, I have severe pain.', 'Daktari, nina maumivu makali.'), color: 'bg-amber-50 border-amber-200 text-amber-700' },
      { id: 'fever', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Face%20with%20thermometer/Flat/face_with_thermometer_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Fever', 'Homa'), phrase: t('Doctor, I have a high fever.', 'Daktari, nina homa kali.'), color: 'bg-orange-50 border-orange-200 text-orange-700' },
      { id: 'vomit', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Face%20vomiting/Flat/face_vomiting_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Vomiting', 'Kutapika'), phrase: t('Doctor, I feel like vomiting.', 'Daktari, ninahisi kutapika.'), color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
      { id: 'dizzy', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dizzy%20face/Flat/dizzy_face_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Dizzy', 'Kizunguzungu'), phrase: t('Doctor, I feel dizzy.', 'Daktari, ninahisi kizunguzungu.'), color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
      { id: 'cough', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sneezing%20face/Flat/sneezing_face_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Cough', 'Kikohozi'), phrase: t('Doctor, I have a bad cough and breathing trouble.', 'Daktari, nina kikohozi na shida ya kupumua.'), color: 'bg-blue-50 border-blue-200 text-blue-700' },
      { id: 'blood', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Drop%20of%20blood/Flat/drop_of_blood_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Bleeding', 'Damu'), phrase: t('Doctor, I am bleeding.', 'Daktari, ninatoa damu.'), color: 'bg-rose-50 border-rose-200 text-rose-700' },
      { id: 'headache', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Person%20frowning/Flat/person_frowning_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Headache', 'Kichwa'), phrase: t('Doctor, I have a severe headache.', 'Daktari, ninaumwa kichwa sana.'), color: 'bg-stone-50 border-stone-200 text-stone-700' },
      { id: 'stomach', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Nauseated%20face/Flat/nauseated_face_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Stomachache', 'Tumbo'), phrase: t('Doctor, my stomach hurts a lot.', 'Daktari, tumbo linaniuma sana.'), color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    ],
    body: [
      { id: 'head', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Brain/Flat/brain_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Head', 'Kichwa'), phrase: t('Doctor, my head hurts.', 'Daktari, kichwa kinaniuma.'), color: 'bg-stone-50 border-stone-200 text-stone-700' },
      { id: 'chest', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Heart%20suit/Flat/heart_suit_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Chest/Heart', 'Kifua/Moyo'), phrase: t('Doctor, my chest or heart hurts.', 'Daktari, kifua au moyo unaniuma.'), color: 'bg-red-50 border-red-200 text-red-700' },
      { id: 'stomach', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Stomach/Flat/stomach_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Stomach', 'Tumbo'), phrase: t('Doctor, my stomach hurts.', 'Daktari, tumbo linaniuma.'), color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
      { id: 'limb', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Leg/Flat/leg_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Limb', 'Mkono/Mguu'), phrase: t('Doctor, my arm or leg hurts.', 'Daktari, mkono au mguu unaniuma.'), color: 'bg-amber-50 border-amber-200 text-amber-700' },
      { id: 'eyes', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Eyes/Flat/eyes_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Eyes/Ear', 'Macho/Sikio'), phrase: t('Doctor, my eyes or ears hurt.', 'Daktari, macho au masikio yananiuma.'), color: 'bg-blue-50 border-blue-200 text-blue-700' },
    ],
    needs: [
      { id: 'water', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Droplet/Flat/droplet_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Water', 'Maji'), phrase: t('Doctor, I need water.', 'Daktari, nahitaji maji.'), color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
      { id: 'food', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pot%20of%20food/Flat/pot_of_food_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Food', 'Chakula'), phrase: t('Doctor, I need food.', 'Daktari, nahitaji chakula.'), color: 'bg-orange-50 border-orange-200 text-orange-700' },
      { id: 'toilet', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Toilet/Flat/toilet_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Toilet', 'Choo'), phrase: t('Doctor, I need to use the toilet.', 'Daktari, nahitaji kwenda chooni.'), color: 'bg-stone-50 border-stone-200 text-stone-700' },
      { id: 'medicine', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pill/Flat/pill_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Medicine', 'Dawa'), phrase: t('Doctor, I need my medicine.', 'Daktari, nahitaji dawa zangu.'), color: 'bg-blue-50 border-blue-200 text-blue-700' },
      { id: 'temp', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cold%20face/Flat/cold_face_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Cold/Hot', 'Baridi/Joto'), phrase: t('Doctor, I feel too cold or too hot.', 'Daktari, ninahisi baridi au joto sana.'), color: 'bg-slate-50 border-slate-200 text-slate-700' },
    ],
    feelings: [
      { id: 'yes', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Check%20mark%20button/Flat/check_mark_button_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Yes', 'Ndiyo'), phrase: t('Doctor, yes, I understand.', 'Daktari, ndiyo, naelewa.'), color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
      { id: 'no', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cross%20mark/Flat/cross_mark_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('No', 'Hapana'), phrase: t('Doctor, no, I do not understand.', 'Daktari, hapana, sielewi.'), color: 'bg-red-50 border-red-200 text-red-700' },
      { id: 'scared', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fearful%20face/Flat/fearful_face_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Scared', 'Ninaogopa'), phrase: t('Doctor, I am scared.', 'Daktari, ninaogopa.'), color: 'bg-purple-50 border-purple-200 text-purple-700' },
      { id: 'repeat', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Question%20mark/Flat/question_mark_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('Repeat', 'Rudia'), phrase: t('Doctor, please repeat again.', 'Daktari, tafadhali rudia tena.'), color: 'bg-amber-50 border-amber-200 text-amber-700' },
      { id: 'emergency', icon: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/SOS%20button/Flat/sos_button_flat.png', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxS0L00000/giphy.gif', label: t('SOS', 'Dharura'), phrase: t('Doctor, I need emergency help now!', 'Daktari, nahitaji msaada wa dharura sasa hivi!'), color: 'bg-red-600 border-red-400 text-white' },
    ]
  };

  const tabs = [
    { id: 'symptoms', label: t('Symptoms', 'Dalili'), icon: <Activity size={16} /> },
    { id: 'body', label: t('Body', 'Mwili'), icon: <User size={16} /> },
    { id: 'needs', label: t('Needs', 'Mahitaji'), icon: <ShoppingBasket size={16} /> },
    { id: 'feelings', label: t('Answers', 'Majibu'), icon: <MessageSquare size={16} /> },
  ];

  const handlePress = (btn: TSLButton) => {
    setLastPressed(btn.id);
    playPronunciation(btn.phrase);
    onSend(btn.label, btn.phrase);
    setTimeout(() => setLastPressed(null), 1000);
  };

  return (
    <div className={`flex flex-col h-full bg-white ${compact ? 'p-2' : 'p-4'}`}>
      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-3 overflow-y-auto flex-1 pr-1 custom-scrollbar`}>
        <AnimatePresence mode="wait">
          {TSL_DATA[activeTab].map((btn) => (
            <motion.button
              key={btn.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => handlePress(btn)}
              className={`relative group flex flex-col items-center p-3 rounded-[2rem] border-2 transition-all ${btn.color} ${
                lastPressed === btn.id ? 'scale-95 ring-4 ring-emerald-500/20' : 'hover:shadow-md'
              }`}
            >
              {/* GIF Container */}
              <div className="w-full aspect-square bg-white rounded-2xl mb-2 overflow-hidden relative border border-black/5">
                <img 
                  src={btn.gifUrl} 
                  alt={btn.label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                  <img 
                    src={btn.icon} 
                    alt="" 
                    className="w-5 h-5 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">
                {btn.label}
              </span>

              {/* Success Overlay */}
              <AnimatePresence>
                {lastPressed === btn.id && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-emerald-500/90 rounded-[2rem] flex flex-col items-center justify-center text-white z-10"
                  >
                    <CheckCircle2 size={32} />
                    <span className="text-[8px] font-black uppercase mt-1 tracking-widest">{t('Sent', 'Imetumwa')}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
