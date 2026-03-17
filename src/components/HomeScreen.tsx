import React from 'react';
import { Camera, MessageSquare, AlertCircle, Heart, ShieldAlert, Stethoscope, Users, Languages, Share2, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProfile } from '../contexts/ProfileContext';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
  isPaired?: boolean;
  onPair?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, isPaired, onPair }) => {
  const { t } = useLanguage();
  const { profile } = useProfile();

  const menuItems = [
    {
      id: 'avatar',
      title: t('AI Medical Avatar', 'Avatar wa Matibabu wa AI'),
      desc: t('TSL Interpretation & Signing', 'Ufafanuzi na Ishara za TSL'),
      icon: User,
      color: 'bg-stone-900',
      shadow: 'shadow-stone-200',
    },
    {
      id: 'camera',
      title: t('Camera Translator', 'Kamera ya Tafsiri'),
      desc: t('Signs to Text/Speech', 'Alama kwenda Maandishi/Sauti'),
      icon: Camera,
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200',
    },
    {
      id: 'nurse',
      title: t('Doctor Input', 'Moduli ya Daktari'),
      desc: t('Speech to Sign Video', 'Sauti kwenda Video ya Alama'),
      icon: MessageSquare,
      color: 'bg-blue-600',
      shadow: 'shadow-blue-200',
    },
    {
      id: 'emergency',
      title: t('Patient Zone', 'Eneo la Mgonjwa'),
      desc: t('Quick TSL Buttons', 'Vitufe vya Haraka vya TSL'),
      icon: ShieldAlert,
      color: 'bg-red-600',
      shadow: 'shadow-red-200',
    },
    {
      id: 'symptom-checker',
      title: t('AI Symptom Checker', 'Mchambuzi wa Dalili wa AI'),
      desc: t('Diagnosis & History Analysis', 'Utambuzi na Uchambuzi wa Historia'),
      icon: Sparkles,
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-200',
    },
    {
      id: 'hospital',
      title: t('Hospital Services', 'Huduma za Hospitali'),
      desc: t('Lab, Pharmacy, RCH & Clinics', 'Maabara, Famasia, RCH na Kliniki'),
      icon: Stethoscope,
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200',
    },
    {
      id: 'expert',
      title: t('Expert Advice', 'Ushauri wa Kitaalamu'),
      desc: t('Remote Specialist Connect', 'Unganishwa na Mtaalamu'),
      icon: Users,
      color: 'bg-purple-600',
      shadow: 'shadow-purple-200',
    },
    {
      id: 'alphabet',
      title: t('TSL Alphabet', 'Alfabeti ya TSL'),
      desc: t('Learn A-Z Signs', 'Jifunze Alama za A-Z'),
      icon: Languages,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-200',
    },
  ];

  return (
    <div className="p-6 space-y-10 pb-24 bg-gradient-to-b from-blue-50/50 to-white min-h-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-stone-900 tracking-tighter leading-none">AfyaSign</h1>
          <p className="text-stone-500 font-medium text-lg">{t('Hospital Communication Assistant', 'Msaidizi wa Mawasiliano Hospitalini')}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('profile')}
              className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-blue-50 overflow-hidden active:scale-90 transition-transform"
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={32} />
              )}
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'AfyaSign',
                    text: 'AfyaSign - Hospital Communication Assistant for Tanzanian Sign Language',
                    url: window.location.origin,
                  });
                } else {
                  onPair?.();
                }
              }}
              className="p-3 bg-white rounded-2xl text-stone-600 shadow-xl border border-stone-100 active:scale-90 transition-transform"
            >
              <Share2 size={24} />
            </button>
          </div>
          <button 
            onClick={onPair}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isPaired 
                ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                : 'bg-blue-600 text-white shadow-lg active:scale-95'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isPaired ? 'bg-emerald-500' : 'bg-white animate-pulse'}`} />
            {isPaired ? t('Paired', 'Vimeunganishwa') : t('Pair Devices', 'Oanisha Vifaa')}
          </button>
        </div>
      </div>

      {profile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Welcome Back', 'Karibu Tena')}</p>
              <p className="font-bold text-stone-900">{profile.name}</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-black text-stone-500 uppercase tracking-widest">
            {profile.role === 'professional' ? t('Pro', 'Mtaalamu') : t('Patient', 'Mgonjwa')}
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onNavigate(item.id)}
            className="w-full group relative overflow-hidden bg-white p-8 rounded-[2.5rem] border-2 border-stone-100 shadow-sm text-left active:scale-95 transition-all hover:border-blue-500/30"
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className={`${item.color} p-6 rounded-3xl text-white shadow-2xl ${item.shadow}`}>
                <item.icon size={36} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-stone-900">{item.title}</h3>
                <p className="text-stone-500 font-medium">{item.desc}</p>
              </div>
            </div>
            {/* Subtle background pattern */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <item.icon size={120} />
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
      </AnimatePresence>

      <div className="bg-blue-50 p-8 rounded-[2.5rem] border-2 border-blue-100/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl text-white">
            <Stethoscope size={20} />
          </div>
          <h4 className="font-black text-blue-900 uppercase tracking-tight">{t('Medical Tip', 'Kidokezo cha Matibabu')}</h4>
        </div>
        <p className="text-blue-800/70 font-medium leading-relaxed italic">
          {t('"Good communication leads to better treatment. Use the Emergency board for instant needs."', '"Mawasiliano mazuri huleta matibabu bora. Tumia ubao wa Dharura kwa mahitaji ya papo hapo."')}
        </p>
      </div>
    </div>
  );
};
