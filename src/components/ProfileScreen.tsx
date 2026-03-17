import React, { useState } from 'react';
import { ChevronLeft, User, Shield, History, Settings, LogOut, Save, Camera, Languages, Type, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useProfile, UserRole } from '../contexts/ProfileContext';
import { useLanguage } from '../contexts/LanguageContext';
import { generateProfileAvatar } from '../services/imageGenService';

interface ProfileScreenProps {
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { profile, updateProfile, history } = useProfile();
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [role, setRole] = useState<UserRole>(profile?.role || 'patient');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || 'en');
  const [fontSize, setFontSize] = useState(profile?.font_size || 'medium');

  const handleSave = async () => {
    await updateProfile({
      name,
      role,
      preferred_language: preferredLanguage,
      font_size: fontSize as any
    });
    setIsEditing(false);
  };

  const handleGenerateAvatar = async () => {
    if (!profile) return;
    setIsGenerating(true);
    try {
      const newAvatar = await generateProfileAvatar(name || profile.name, role || profile.role);
      if (newAvatar) {
        await updateProfile({ avatar: newAvatar });
      }
    } catch (err) {
      console.error("Failed to generate avatar:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b border-stone-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-stone-100 rounded-xl text-stone-600 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-black text-stone-900 tracking-tight">{t('User Profile', 'Wasifu wa Mtumiaji')}</h2>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`p-2 rounded-xl flex items-center gap-2 px-4 font-bold transition-all ${
            isEditing 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'bg-stone-100 text-stone-600'
          }`}
        >
          {isEditing ? (
            <><Save size={18} /> {t('Save', 'Hifadhi')}</>
          ) : (
            <><Settings size={18} /> {t('Edit', 'Hariri')}</>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="relative overflow-hidden rounded-full border-4 border-white shadow-xl w-32 h-32">
              {isGenerating ? (
                <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                  <Loader2 size={32} className="text-blue-600 animate-spin" />
                </div>
              ) : (
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            {isEditing && (
              <button 
                onClick={handleGenerateAvatar}
                disabled={isGenerating}
                className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                title={t('Generate AI Avatar', 'Tengeneza Avatar ya AI')}
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              </button>
            )}
          </div>
          
          {isEditing ? (
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-black text-stone-900 border-b-2 border-blue-500 focus:outline-none text-center bg-transparent"
              placeholder={t('Enter Name', 'Ingiza Jina')}
            />
          ) : (
            <h3 className="text-2xl font-black text-stone-900">{profile.name}</h3>
          )}
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-100 rounded-full text-xs font-black uppercase tracking-widest text-stone-500">
            <Shield size={14} />
            {profile.role === 'professional' ? t('Healthcare Professional', 'Mtaalamu wa Afya') : t('Patient', 'Mgonjwa')}
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-stone-400 uppercase tracking-widest px-2">{t('Settings', 'Mipangilio')}</h4>
          <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
            {/* Role Switch */}
            <div className="p-4 flex items-center justify-between border-b border-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <User size={20} />
                </div>
                <span className="font-bold text-stone-700">{t('Role', 'Wajibu')}</span>
              </div>
              {isEditing ? (
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="bg-stone-100 rounded-lg px-3 py-1 font-bold text-stone-900 focus:outline-none"
                >
                  <option value="patient">{t('Patient', 'Mgonjwa')}</option>
                  <option value="professional">{t('Healthcare Professional', 'Mtaalamu wa Afya')}</option>
                </select>
              ) : (
                <span className="text-stone-500 font-medium capitalize">{profile.role}</span>
              )}
            </div>

            {/* Language */}
            <div className="p-4 flex items-center justify-between border-b border-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Languages size={20} />
                </div>
                <span className="font-bold text-stone-700">{t('Language', 'Lugha')}</span>
              </div>
              {isEditing ? (
                <select 
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="bg-stone-100 rounded-lg px-3 py-1 font-bold text-stone-900 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                </select>
              ) : (
                <span className="text-stone-500 font-medium">{profile.preferred_language === 'en' ? 'English' : 'Kiswahili'}</span>
              )}
            </div>

            {/* Font Size */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Type size={20} />
                </div>
                <span className="font-bold text-stone-700">{t('Font Size', 'Ukubwa wa Maandishi')}</span>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size as any)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs capitalize transition-all ${
                        fontSize === size ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-stone-500 font-medium capitalize">{profile.font_size}</span>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-stone-400 uppercase tracking-widest">{t('Recent History', 'Historia ya Karibuni')}</h4>
            <History size={16} className="text-stone-300" />
          </div>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((entry) => (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-4 rounded-2xl border border-stone-100 flex items-start gap-4"
                >
                  <div className={`p-2 rounded-xl ${entry.type === 'request' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-stone-900 leading-tight">{entry.content}</p>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {entry.tsl_description && (
                      <p className="text-xs text-stone-500 mt-1 italic">{entry.tsl_description}</p>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-stone-400 italic">
                {t('No history yet', 'Bado hakuna historia')}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <LogOut size={20} />
          {t('Sign Out', 'Ondoka')}
        </button>
      </div>
    </div>
  );
};
