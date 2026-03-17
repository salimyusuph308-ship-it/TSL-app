import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Users, 
  Video, 
  Phone, 
  Shield, 
  Languages, 
  User, 
  Stethoscope,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mic,
  Heart,
  Baby
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ExpertModuleProps {
  onBack: () => void;
}

export const ExpertModule: React.FC<ExpertModuleProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);

  const specialists = [
    { id: 'interpreter', name: t('TSL Interpreter', 'Mkalimani wa TSL'), role: t('Communication Expert', 'Mtaalamu wa Mawasiliano'), icon: Languages, color: 'bg-purple-600' },
    { id: 'cardio', name: t('Cardiologist', 'Bingwa wa Moyo'), role: t('Heart Specialist', 'Mtaalamu wa Moyo'), icon: Heart, color: 'bg-red-600' },
    { id: 'peds', name: t('Pediatrician', 'Bingwa wa Watoto'), role: t('Child Specialist', 'Mtaalamu wa Watoto'), icon: Baby, color: 'bg-blue-600' },
    { id: 'gyn', name: t('Gynecologist', 'Bingwa wa Akina Mama'), role: t('Women Health', 'Afya ya Akina Mama'), icon: User, color: 'bg-pink-600' }
  ];

  const handleConnect = () => {
    if (!selectedSpecialist) return;
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-stone-100">
        <button 
          onClick={isConnected ? () => setIsConnected(false) : onBack}
          className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t('Expert Consultation', 'Ushauri wa Kitaalamu')}</h2>
          <p className="text-xs font-bold text-purple-500 uppercase tracking-widest">{t('Tele-interpretation & Specialist Service', 'Huduma ya Ukalimani na Mabingwa')}</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto">
        {!isConnected ? (
          <div className="flex-1 flex flex-col space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-2">{t('Select Specialist', 'Chagua Mtaalamu')}</h3>
              <div className="grid grid-cols-1 gap-3">
                {specialists.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialist(spec.id)}
                    className={`p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 text-left ${
                      selectedSpecialist === spec.id ? 'bg-purple-600 border-purple-600 text-white shadow-xl' : 'bg-white border-stone-100 text-stone-900'
                    }`}
                  >
                    <div className={`${selectedSpecialist === spec.id ? 'bg-white/20' : spec.color} p-4 rounded-2xl text-white`}>
                      <spec.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-lg leading-none mb-1">{spec.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedSpecialist === spec.id ? 'text-purple-100' : 'text-stone-400'}`}>
                        {spec.role}
                      </p>
                    </div>
                    {selectedSpecialist === spec.id && <CheckCircle2 size={24} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
              <button 
                onClick={handleConnect}
                disabled={isConnecting || !selectedSpecialist}
                className="w-full py-6 bg-purple-600 text-white text-xl font-black rounded-[2.5rem] shadow-xl shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    {t('Connecting...', 'Inaunganisha...')}
                  </>
                ) : (
                  <>
                    <Video size={24} />
                    {t('Start Video Call', 'Anza Simu ya Video')}
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-stone-400 text-[10px] font-black uppercase tracking-widest">
                <Shield size={14} />
                {t('Secure & Private Connection', 'Muunganisho Salama na Binafsi')}
              </div>
            </div>

            <div className="bg-stone-50 p-6 rounded-[2.5rem] border border-stone-100 w-full text-left space-y-4">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('How it works', 'Jinsi inavyofanya kazi')}</h4>
              <div className="space-y-3">
                {[
                  { icon: Phone, text: t('Instant video connection', 'Uunganisho wa video wa papo hapo') },
                  { icon: Languages, text: t('Real-time interpretation', 'Ukalimani wa wakati halisi') },
                  { icon: Stethoscope, text: t('Certified medical experts', 'Wataalamu wa matibabu walioidhinishwa') }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-stone-600 font-medium">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <step.icon size={16} className="text-purple-500" />
                    </div>
                    <span className="text-sm">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-6">
            {/* 3-Way Video Call Simulation */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* Doctor View */}
              <div className="bg-stone-900 rounded-[2.5rem] relative overflow-hidden border-4 border-stone-100 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <User size={64} className="text-white/20" />
                </div>
                <div className="absolute bottom-4 left-6">
                  <p className="text-white font-black text-xs uppercase tracking-widest">{t('Doctor', 'Daktari')}</p>
                </div>
              </div>

              {/* Patient View */}
              <div className="bg-stone-900 rounded-[2.5rem] relative overflow-hidden border-4 border-stone-100 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <User size={64} className="text-white/20" />
                </div>
                <div className="absolute bottom-4 left-6">
                  <p className="text-white font-black text-xs uppercase tracking-widest">{t('Patient', 'Mgonjwa')}</p>
                </div>
              </div>

              {/* Interpreter View (Large) */}
              <div className="col-span-2 bg-purple-900 rounded-[3rem] relative overflow-hidden border-8 border-purple-100 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Users size={120} className="text-white/20" />
                  </motion.div>
                </div>
                <div className="absolute top-6 right-6 bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {t('Live Interpreter', 'Mkalimani wa Moja kwa Moja')}
                </div>
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-white text-2xl font-black">{t('Sarah Mkalimani', 'Sarah Mkalimani')}</h4>
                  <p className="text-purple-200 font-bold uppercase tracking-widest text-xs">{t('TSL Certified Expert', 'Mtaalamu wa TSL Aliyeidhinishwa')}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 bg-stone-900 rounded-[2.5rem] flex items-center justify-around shadow-2xl">
              <button className="p-5 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
                <Mic size={24} />
              </button>
              <button 
                onClick={() => setIsConnected(false)}
                className="px-10 py-5 bg-red-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-red-500/30 active:scale-95 transition-all"
              >
                {t('End Call', 'Kata Simu')}
              </button>
              <button className="p-5 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
                <MessageSquare size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
