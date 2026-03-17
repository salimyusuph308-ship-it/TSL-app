import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Activity, 
  Heart, 
  Wind, 
  Stethoscope, 
  Baby, 
  ClipboardList,
  AlertCircle,
  Copy,
  Check,
  Thermometer,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Play,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BodySystem, ClinicalState, DONPARA_LABELS, DONPARA_SW, SocratesData } from '../types/clinical';
import { TSLAvatar } from './TSLAvatar';

interface ClinicalWizardProps {
  onComplete: (summary: string) => void;
  onCancel: () => void;
}

export const ClinicalWizard: React.FC<ClinicalWizardProps> = ({ onComplete, onCancel }) => {
  const { t } = useLanguage();
  const [state, setState] = useState<ClinicalState>({
    age: 25,
    system: null,
    symptoms: [],
    step: 0,
    exam: {
      donpara: {},
      systemSpecific: {}
    }
  });

  const [copied, setCopied] = useState(false);
  const [showSignFor, setShowSignFor] = useState<string | null>(null);

  const steps = [
    { id: 'info', label: t('Patient Info', 'Maelezo ya Mgonjwa') },
    { id: 'vitals', label: t('Vitals', 'Vipimo vya Muhimu') },
    { id: 'symptoms', label: t('Symptoms', 'Dalili') },
    { id: 'socrates', label: t('Pain Analysis', 'Uchambuzi wa Maumivu'), skip: !state.symptoms.includes('Pain') },
    { id: 'pediatric', label: t('Pediatric', 'Watoto'), skip: state.age >= 12 },
    { id: 'exam', label: t('General Exam', 'Uchunguzi wa Jumla') },
    { id: 'system_exam', label: t('System Exam', 'Uchunguzi wa Mfumo') },
    { id: 'summary', label: t('Summary', 'Muhtasari') }
  ].filter(s => !s.skip);

  const currentStepInfo = steps[state.step];

  const handleNext = () => {
    if (state.step < steps.length - 1) {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const handleBack = () => {
    if (state.step > 0) {
      setState(prev => ({ ...prev, step: prev.step - 1 }));
    } else {
      onCancel();
    }
  };

  const generateSoapNote = () => {
    const s = state;
    const lang = 'en'; // Could be dynamic

    let subjective = `[SUBJECTIVE]\n- Patient Age: ${s.age}\n- Gender: ${s.gender || 'Not specified'}\n- Duration: ${s.exam.systemSpecific.duration || 'N/A'}\n- Symptoms: ${s.symptoms.join(', ')}`;
    if (s.allergies) subjective += `\n- Allergies: ${s.allergies}`;
    if (s.medications) subjective += `\n- Medications: ${s.medications}`;
    if (s.socrates) {
      subjective += `\n- Pain Analysis (SOCRATES):\n  * Site: ${s.socrates.site}\n  * Onset: ${s.socrates.onset}\n  * Character: ${s.socrates.character || 'N/A'}\n  * Radiation: ${s.socrates.radiation || 'N/A'}\n  * Severity: ${s.socrates.severity}/10`;
    }
    if (s.pediatric) {
      subjective += `\n- Pediatric History:\n  * Birth Weight: ${s.pediatric.birthWeight || 'N/A'}\n  * Immunization: ${s.pediatric.immunizationStatus || 'N/A'}\n  * Milestones: ${s.pediatric.milestones || 'N/A'}`;
    }

    let objective = `[OBJECTIVE]`;
    if (s.vitals) {
      objective += `\n- Vitals:\n  * Temp: ${s.vitals.temperature || 'N/A'}°C\n  * HR: ${s.vitals.heartRate || 'N/A'} bpm\n  * RR: ${s.vitals.respiratoryRate || 'N/A'} bpm\n  * BP: ${s.vitals.bloodPressure || 'N/A'}\n  * SpO2: ${s.vitals.spo2 || 'N/A'}%`;
    }

    const donparaFindings = Object.entries(s.exam.donpara)
      .filter(([_, val]) => val)
      .map(([key]) => DONPARA_LABELS[key as keyof typeof DONPARA_LABELS])
      .join(', ');

    objective += `\n- General Exam (DONPARA): ${donparaFindings || 'Normal'}`;
    if (s.system) {
      const systemFindings = Object.entries(s.exam.systemSpecific)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
      objective += `\n- Systemic Exam (${s.system}): ${systemFindings || 'Normal'}`;
    }

    const assessment = `[ASSESSMENT]\n- Suspected ${s.system || 'general'} system involvement based on ${s.symptoms[0] || 'presentation'}.`;
    const plan = `[PLAN]\n1. Further investigations for ${s.system || 'underlying cause'}.\n2. Symptomatic management.`;

    return `${subjective}\n\n${objective}\n\n${assessment}\n\n${plan}`;
  };

  const soapNote = useMemo(() => generateSoapNote(), [state]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(soapNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderStep = () => {
    switch (currentStepInfo.id) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Gender', 'Jinsia')}</label>
              <div className="flex gap-3">
                {(['Male', 'Female', 'Other'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setState(prev => ({ ...prev, gender: g }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-wider transition-all ${
                      state.gender === g ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-stone-100 text-stone-600'
                    }`}
                  >
                    {t(g, g === 'Male' ? 'Mwanaume' : g === 'Female' ? 'Mwanamke' : 'Nyingine')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Patient Age', 'Umri wa Mgonjwa')}</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0" max="100" 
                  value={state.age} 
                  onChange={(e) => setState(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-2xl font-black text-blue-600 w-12">{state.age}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Allergies', 'Mzio')}</label>
                <input 
                  type="text" 
                  placeholder={t('Any allergies?', 'Mzio wowote?')}
                  className="w-full p-3 bg-stone-50 border-2 border-stone-100 rounded-xl text-xs font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, allergies: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Medications', 'Dawa')}</label>
                <input 
                  type="text" 
                  placeholder={t('Current meds?', 'Dawa unazotumia?')}
                  className="w-full p-3 bg-stone-50 border-2 border-stone-100 rounded-xl text-xs font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, medications: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Body System', 'Mfumo wa Mwili')}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['CNS', 'CVS', 'Respiratory', 'GU', 'MSK', 'Skin'] as BodySystem[]).map(sys => (
                  <button
                    key={sys}
                    onClick={() => setState(prev => ({ ...prev, system: sys }))}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      state.system === sys ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-stone-100 text-stone-600'
                    }`}
                  >
                    {sys === 'CNS' && <Zap size={18} />}
                    {sys === 'CVS' && <Heart size={18} />}
                    {sys === 'Respiratory' && <Wind size={18} />}
                    {sys === 'MSK' && <Activity size={18} />}
                    {sys === 'Skin' && <Sparkles size={18} />}
                    {sys === 'GU' && <Stethoscope size={18} />}
                    <span className="font-black text-xs uppercase">{sys}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'vitals':
        return (
          <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Thermometer size={12} /> {t('Temp (°C)', 'Joto')}
                </label>
                <input 
                  type="number" step="0.1"
                  placeholder="36.5"
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, vitals: { ...(prev.vitals || {}), temperature: parseFloat(e.target.value) } }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Heart size={12} /> {t('HR (bpm)', 'Mapigo ya Moyo')}
                </label>
                <input 
                  type="number"
                  placeholder="72"
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, vitals: { ...(prev.vitals || {}), heartRate: parseInt(e.target.value) } }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Wind size={12} /> {t('RR (bpm)', 'Upumuaji')}
                </label>
                <input 
                  type="number"
                  placeholder="16"
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, vitals: { ...(prev.vitals || {}), respiratoryRate: parseInt(e.target.value) } }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} /> {t('SpO2 (%)', 'Oksijeni')}
                </label>
                <input 
                  type="number"
                  placeholder="98"
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, vitals: { ...(prev.vitals || {}), spo2: parseInt(e.target.value) } }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> {t('Blood Pressure', 'Shinikizo la Damu')}
                </label>
                <input 
                  type="text"
                  placeholder="120/80"
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, vitals: { ...(prev.vitals || {}), bloodPressure: e.target.value } }))}
                />
              </div>
            </div>
          </div>
        );

      case 'symptoms':
        return (
          <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Duration of Symptoms', 'Muda wa Dalili')}</label>
              <input 
                type="text" 
                placeholder={t('e.g. 3 days, 1 week', 'mfano. siku 3, wiki 1')}
                className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                onChange={(e) => setState(prev => ({ ...prev, exam: { ...prev.exam, systemSpecific: { ...prev.exam.systemSpecific, duration: e.target.value } } }))}
              />
            </div>
            <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Select Symptoms', 'Chagua Dalili')}</label>
            <div className="grid grid-cols-2 gap-3">
              {['Pain', 'Fever', 'Cough', 'Shortness of Breath', 'Vomiting', 'Diarrhea', 'Weakness'].map(sym => (
                <div key={sym} className="relative group">
                  <button
                    onClick={() => {
                      const syms = state.symptoms.includes(sym) 
                        ? state.symptoms.filter(s => s !== sym)
                        : [...state.symptoms, sym];
                      setState(prev => ({ ...prev, symptoms: syms }));
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      state.symptoms.includes(sym) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-stone-100 text-stone-600'
                    }`}
                  >
                    <span className="font-black text-[10px] uppercase">{sym}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSignFor(sym);
                    }}
                    className="absolute -top-2 -right-2 p-2 bg-stone-900 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Play size={12} className="fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'socrates':
        return (
          <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
              <AlertCircle className="text-amber-600" />
              <p className="text-xs font-bold text-amber-800">{t('SOCRATES Pain Assessment', 'Uchambuzi wa Maumivu (SOCRATES)')}</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> {t('Site', 'Sehemu')}
                </label>
                <input 
                  type="text" 
                  placeholder={t('Where is the pain?', 'Wapi panakuuma?')}
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, socrates: { ...(prev.socrates || {} as SocratesData), site: e.target.value } }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> {t('Onset', 'Mwanzo')}
                </label>
                <input 
                  type="text" 
                  placeholder={t('When did it start?', 'Ilianza lini?')}
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, socrates: { ...(prev.socrates || {} as SocratesData), onset: e.target.value } }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> {t('Character', 'Aina ya Maumivu')}
                </label>
                <input 
                  type="text" 
                  placeholder={t('Dull, sharp, burning?', 'Butu, kali, au kuungua?')}
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, socrates: { ...(prev.socrates || {} as SocratesData), character: e.target.value } }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <ArrowRight size={12} /> {t('Radiation', 'Usambaji')}
                </label>
                <input 
                  type="text" 
                  placeholder={t('Does it move anywhere?', 'Je, yanahamia kwingine?')}
                  className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                  onChange={(e) => setState(prev => ({ ...prev, socrates: { ...(prev.socrates || {} as SocratesData), radiation: e.target.value } }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} /> {t('Severity (1-10)', 'Ukali (1-10)')}
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="10" 
                    className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    onChange={(e) => setState(prev => ({ ...prev, socrates: { ...(prev.socrates || {} as SocratesData), severity: parseInt(e.target.value) } }))}
                  />
                  <span className="text-xl font-black text-red-600">{state.socrates?.severity || 5}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pediatric':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Baby className="text-blue-600" />
              <p className="text-xs font-bold text-blue-800">{t('Pediatric History', 'Historia ya Mtoto')}</p>
            </div>
            <div className="space-y-4">
              <input 
                type="text" placeholder={t('Birth Weight', 'Uzito wa Kuzaliwa')}
                className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                onChange={(e) => setState(prev => ({ ...prev, pediatric: { ...(prev.pediatric || {}), birthWeight: e.target.value } }))}
              />
              <input 
                type="text" placeholder={t('Immunization Status', 'Hali ya Chanjo')}
                className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                onChange={(e) => setState(prev => ({ ...prev, pediatric: { ...(prev.pediatric || {}), immunizationStatus: e.target.value } }))}
              />
              <input 
                type="text" placeholder={t('Developmental Milestones', 'Hatua za Ukuaji')}
                className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-sm font-medium"
                onChange={(e) => setState(prev => ({ ...prev, pediatric: { ...(prev.pediatric || {}), milestones: e.target.value } }))}
              />
            </div>
          </div>
        );

      case 'exam':
        return (
          <div className="space-y-6">
            <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('General Exam (DONPARA)', 'Uchunguzi wa Jumla (DONPARA)')}</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(DONPARA_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    const donpara = { ...state.exam.donpara, [key]: !state.exam.donpara[key] };
                    setState(prev => ({ ...prev, exam: { ...prev.exam, donpara } }));
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    state.exam.donpara[key] ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-100 text-stone-600'
                  }`}
                >
                  <span className="font-black text-xs uppercase">{key}: {t(label, DONPARA_SW[key as keyof typeof DONPARA_SW])}</span>
                  {state.exam.donpara[key] && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        );

      case 'system_exam':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <Stethoscope className="text-emerald-600" />
              <p className="text-xs font-bold text-emerald-800">{t(`${state.system} Physical Exam`, `Uchunguzi wa ${state.system}`)}</p>
            </div>
            
            {state.system === 'Respiratory' && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Auscultation Points', 'Sehemu za Kusikiliza')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Crackles', 'Wheeze', 'Stridor', 'Normal'].map(sound => (
                    <button
                      key={sound}
                      onClick={() => {
                        const systemSpecific = { ...state.exam.systemSpecific, lungSound: sound };
                        setState(prev => ({ ...prev, exam: { ...prev.exam, systemSpecific } }));
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        state.exam.systemSpecific.lungSound === sound ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-stone-100 text-stone-600'
                      }`}
                    >
                      <span className="font-black text-xs uppercase">{sound}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state.system !== 'Respiratory' && (
              <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-[2rem]">
                <p className="text-stone-400 text-sm font-medium">{t('System-specific exam form loading...', 'Fomu ya uchunguzi wa mfumo inapakia...')}</p>
              </div>
            )}
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <div className="bg-stone-900 p-6 rounded-[2rem] text-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">{t('SOAP Note Summary', 'Muhtasari wa SOAP Note')}</h3>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed opacity-90">
                {soapNote}
              </pre>
            </div>
            <button 
              onClick={() => onComplete(soapNote)}
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <CheckCircle2 size={24} />
              {t('Save & Close', 'Hifadhi na Funga')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Progress Bar */}
      <div className="h-1.5 bg-stone-100 flex">
        {steps.map((s, idx) => (
          <div 
            key={s.id}
            className={`flex-1 transition-all duration-500 ${idx <= state.step ? 'bg-blue-600' : 'bg-transparent'}`}
          />
        ))}
      </div>

      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-stone-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">{currentStepInfo.label}</h2>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              {t('Step', 'Hatua')} {state.step + 1} {t('of', 'ya')} {steps.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <ClipboardList size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepInfo.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sign Overlay */}
      <AnimatePresence>
        {showSignFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="relative aspect-video bg-stone-900 flex items-center justify-center">
                <TSLAvatar 
                  text={showSignFor}
                  className="w-full h-full rounded-none"
                />
                
                <button 
                  onClick={() => setShowSignFor(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-3xl font-black text-stone-900 mb-2">{showSignFor}</h3>
                <p className="text-stone-500 font-medium mb-6">{t('Tanzanian Sign Language (TSL)', 'Lugha ya Alama ya Tanzania (TSL)')}</p>
                <button 
                  onClick={() => setShowSignFor(null)}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
                >
                  {t('Close', 'Funga')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {currentStepInfo.id !== 'summary' && (
        <div className="p-6 bg-stone-50 border-t border-stone-100">
          <button 
            onClick={handleNext}
            className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {t('Continue', 'Endelea')}
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
