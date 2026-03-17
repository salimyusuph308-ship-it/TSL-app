import React from 'react';
import { Home, Camera, MessageSquare, ShieldAlert, Languages, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { id: 'home', icon: Home, label: t('Home', 'Mwanzo') },
    { id: 'avatar', icon: User, label: t('Avatar', 'Avatar') },
    { id: 'camera', icon: Camera, label: t('Camera', 'Kamera') },
    { id: 'nurse', icon: MessageSquare, label: t('Doctor', 'Daktari') },
    { id: 'emergency', icon: ShieldAlert, label: t('SOS', 'Dharura') },
  ];

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">A</div>
          <span className="font-black text-xl tracking-tighter">AfyaSign</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            className="bg-stone-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-600 active:scale-95 transition-transform border border-stone-200 flex items-center gap-2"
          >
            <Languages size={14} />
            {language === 'en' ? 'Kiswahili' : 'English'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-stone-100 px-4 pt-3 pb-safe shrink-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-300 relative ${
                  isActive ? 'text-blue-600' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -top-3 left-0 right-0 h-1 bg-blue-600 rounded-b-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
