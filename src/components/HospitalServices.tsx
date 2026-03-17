import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  FlaskConical, 
  Pill, 
  Baby, 
  Syringe, 
  Stethoscope, 
  Activity, 
  Heart, 
  Eye, 
  Zap,
  ArrowRight,
  ClipboardCheck,
  Clock,
  MapPin,
  PhoneCall,
  Search
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HospitalServicesProps {
  onBack: () => void;
  onConsultExpert?: () => void;
}

export const HospitalServices: React.FC<HospitalServicesProps> = ({ onBack, onConsultExpert }) => {
  const { t } = useLanguage();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const modules = [
    {
      id: 'lab',
      title: t('Laboratory', 'Maabara'),
      desc: t('Blood tests, results & diagnostics', 'Vipimo vya damu na majibu'),
      icon: FlaskConical,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      items: [
        { label: t('Full Blood Count', 'Kipimo cha Damu (FBC)'), status: 'Ready' },
        { label: t('Malaria Test', 'Kipimo cha Malaria'), status: 'Pending' },
        { label: t('Urinalysis', 'Kipimo cha Mkojo'), status: 'Ready' }
      ]
    },
    {
      id: 'pharmacy',
      title: t('Pharmacy', 'Famasia'),
      desc: t('Prescriptions & medication pickup', 'Dawa na maelekezo ya matumizi'),
      icon: Pill,
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      items: [
        { label: t('Amoxicillin 500mg', 'Amoxicillin 500mg'), status: 'Collected' },
        { label: t('Paracetamol', 'Paracetamol'), status: 'Ready for Pickup' }
      ]
    },
    {
      id: 'rch',
      title: t('RCH Services', 'Huduma za RCH'),
      desc: t('Reproductive & Child Health', 'Afya ya Uzazi na Mtoto'),
      icon: Baby,
      color: 'bg-pink-600',
      lightColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      items: [
        { label: t('Antenatal Clinic', 'Kliniki ya Wajawazito'), status: 'Next: Monday' },
        { label: t('Child Vaccination', 'Chanjo za Watoto'), status: 'Up to date' }
      ]
    },
    {
      id: 'treatment',
      title: t('Injection & Dressing', 'Sindano na Vidonda'),
      desc: t('Wound care & injection services', 'Huduma ya vidonda na sindano'),
      icon: Syringe,
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      items: [
        { label: t('Wound Dressing', 'Kusafisha Kidonda'), status: 'Daily' },
        { label: t('Tetanus Injection', 'Sindano ya Pepopunda'), status: 'Completed' }
      ]
    },
    {
      id: 'specialist',
      title: t('Specialized Clinics', 'Huduma za Kibingwa'),
      desc: t('Cardiology, Dental, Eye & more', 'Moyo, Meno, Macho na zaidi'),
      icon: Stethoscope,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      clinics: [
        { name: t('Cardiology', 'Moyo'), icon: Heart },
        { name: t('Ophthalmology', 'Macho'), icon: Eye },
        { name: t('Dental', 'Meno'), icon: Activity },
        { name: t('Neurology', 'Mishipa ya Fahamu'), icon: Zap }
      ],
      hospitals: [
        { name: 'Muhimbili (MNH)', location: 'Dar es Salaam' },
        { name: 'KCMC', location: 'Moshi' },
        { name: 'Bugando', location: 'Mwanza' },
        { name: 'Benjamin Mkapa', location: 'Dodoma' }
      ]
    }
  ];

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 flex items-center gap-4 border-b border-stone-200 z-10">
        <button 
          onClick={selectedModule ? () => setSelectedModule(null) : onBack}
          className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-none">
            {selectedModule ? modules.find(m => m.id === selectedModule)?.title : t('Hospital Services', 'Huduma za Hospitali')}
          </h2>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
            {selectedModule ? t('Service Details', 'Maelezo ya Huduma') : t('All Departments', 'Idara Zote')}
          </p>
        </div>
        {onConsultExpert && (
          <button 
            onClick={onConsultExpert}
            className="p-3 bg-purple-100 text-purple-600 rounded-2xl active:scale-90 transition-transform"
          >
            <PhoneCall size={24} />
          </button>
        )}
      </div>

      {/* Search Bar */}
      {!selectedModule && (
        <div className="p-6 bg-white border-b border-stone-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              placeholder={t('Search services...', 'Tafuta huduma...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {!selectedModule ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-4"
            >
              {filteredModules.map((module, idx) => (
                <motion.button
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedModule(module.id)}
                  className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 shadow-sm text-left flex items-center gap-6 group hover:border-blue-500/30 transition-all active:scale-[0.98]"
                >
                  <div className={`${module.color} p-5 rounded-3xl text-white shadow-xl group-hover:scale-110 transition-transform`}>
                    <module.icon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-stone-900">{module.title}</h3>
                    <p className="text-stone-400 text-xs font-medium leading-tight">{module.desc}</p>
                  </div>
                  <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </motion.button>
              ))}

              {/* Expert Consultation Card */}
              <button
                onClick={onConsultExpert}
                className="mt-4 bg-stone-900 p-8 rounded-[2.5rem] text-white flex flex-col gap-6 relative overflow-hidden group active:scale-[0.98] transition-all"
              >
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500 p-2 rounded-xl">
                      <PhoneCall size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">{t('Expert Connect', 'Unganishwa na Mtaalamu')}</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">{t('Specialist Consultation', 'Ushauri wa Kibingwa')}</h3>
                  <p className="text-stone-400 text-sm font-medium leading-relaxed max-w-[240px]">
                    {t('Direct video call with specialists from Muhimbili and other referral hospitals.', 'Simu ya video ya moja kwa moja na mabingwa kutoka Muhimbili na hospitali nyingine.')}
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-purple-400 font-black uppercase tracking-widest text-[10px]">
                  {t('Start Consultation', 'Anza Ushauri')} <ArrowRight size={14} />
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PhoneCall size={180} />
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {modules.find(m => m.id === selectedModule)?.items && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-2">{t('Current Status', 'Hali ya Sasa')}</h3>
                  {modules.find(m => m.id === selectedModule)?.items?.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border-2 border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${modules.find(m => m.id === selectedModule)?.lightColor} ${modules.find(m => m.id === selectedModule)?.textColor} rounded-xl flex items-center justify-center`}>
                          <ClipboardCheck size={20} />
                        </div>
                        <span className="font-bold text-stone-900">{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        item.status === 'Ready' || item.status === 'Completed' || item.status === 'Up to date'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedModule === 'specialist' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {modules.find(m => m.id === 'specialist')?.clinics?.map((clinic, idx) => (
                      <button key={idx} className="bg-white p-6 rounded-[2rem] border-2 border-stone-100 flex flex-col items-center gap-4 hover:border-purple-500 transition-all group">
                        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <clinic.icon size={32} />
                        </div>
                        <span className="font-black text-xs uppercase tracking-tight text-stone-900">{clinic.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-2">{t('Referral Hospitals', 'Hospitali za Rufaa')}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {modules.find(m => m.id === 'specialist')?.hospitals?.map((hosp, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-3xl border-2 border-stone-100 flex items-center justify-between group hover:border-blue-500 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <MapPin size={20} />
                            </div>
                            <div>
                              <p className="font-black text-sm text-stone-900">{hosp.name}</p>
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{hosp.location}</p>
                            </div>
                          </div>
                          <button className="p-2 bg-stone-50 text-stone-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 flex items-start gap-4">
                <div className="bg-blue-500 p-2 rounded-xl text-white">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-black text-blue-900 uppercase tracking-tight text-xs">{t('Operating Hours', 'Muda wa Kazi')}</h4>
                  <p className="text-blue-800/70 text-xs font-medium mt-1">
                    {t('Mon - Fri: 08:00 AM - 04:00 PM', 'Jumatatu - Ijumaa: Saa 2:00 Asubuhi - Saa 10:00 Jioni')}
                  </p>
                </div>
              </div>

              <div className="bg-stone-900 p-6 rounded-[2rem] text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tight text-xs text-stone-500">{t('Location', 'Mahali')}</h4>
                    <p className="font-bold text-sm">Block B, Level 2</p>
                  </div>
                </div>
                <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-2">{t('Recent Activity', 'Shughuli za Karibuni')}</h3>
                <div className="bg-white rounded-[2rem] border-2 border-stone-100 overflow-hidden">
                  {[
                    { date: '28 Feb', action: t('Lab Results Uploaded', 'Majibu ya Maabara Yamewekwa'), type: 'lab' },
                    { date: '26 Feb', action: t('Pharmacy Prescription', 'Dawa ya Famasia'), type: 'pharmacy' },
                    { date: '20 Feb', action: t('Specialist Consultation', 'Ushauri wa Kibingwa'), type: 'specialist' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4 border-b border-stone-50 last:border-0">
                      <div className="text-[10px] font-black text-stone-400 w-12">{item.date}</div>
                      <div className="flex-1 text-xs font-bold text-stone-900">{item.action}</div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
