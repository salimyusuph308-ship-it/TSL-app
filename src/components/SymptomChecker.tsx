import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  Stethoscope, 
  MessageSquare,
  ArrowRight,
  ClipboardList,
  History
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ClinicalWizard } from './ClinicalWizard';
import { analyzeSymptoms } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { TSLAvatar } from './TSLAvatar';

interface SymptomCheckerProps {
  onBack: () => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'selection' | 'wizard' | 'analysis'>('selection');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  const handleWizardComplete = async (summary: string) => {
    setPatientData(summary);
    setMode('analysis');
    setIsLoading(true);
    
    try {
      const result = await analyzeSymptoms(summary);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysisResult("Samahani, kuna tatizo limetokea wakati wa uchambuzi. Tafadhali jaribu tena.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 flex items-center gap-4 border-b border-stone-200 z-10">
        <button 
          onClick={mode === 'selection' ? onBack : () => setMode('selection')}
          className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-none">
            {t('AI Symptom Checker', 'Mchambuzi wa Dalili wa AI')}
          </h2>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
            {t('Smart Medical Diagnosis Support', 'Usaidizi wa Utambuzi wa Matibabu')}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {mode === 'selection' && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-3xl font-black leading-tight">
                    {t('Check your symptoms with AI', 'Chunguza dalili zako kwa AI')}
                  </h3>
                  <p className="text-blue-100 font-medium leading-relaxed">
                    {t('Our AI assistant will analyze your medical history and symptoms to provide a preliminary assessment.', 'Msaidizi wetu wa AI atachambua historia yako ya matibabu na dalili ili kutoa tathmini ya awali.')}
                  </p>
                  <button 
                    onClick={() => setMode('wizard')}
                    className="w-full py-5 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {t('Start Assessment', 'Anza Tathmini')}
                    <ArrowRight size={20} />
                  </button>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-white rounded-3xl border-2 border-stone-100 flex items-start gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-stone-900 uppercase tracking-tight text-sm">{t('Important Disclaimer', 'Onyo Muhimu')}</h4>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {t('This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.', 'Chombo hiki ni kwa madhumuni ya habari tu na si mbadala wa ushauri wa kitaalamu wa matibabu, utambuzi, au matibabu.')}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border-2 border-stone-100 flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <History size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-stone-900 uppercase tracking-tight text-sm">{t('Privacy Focused', 'Faragha Kwanza')}</h4>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {t('Your medical data is processed securely and is only used for the current analysis session.', 'Data zako za matibabu zinachakatwa kwa usalama na zinatumiwa tu kwa kikao cha uchambuzi wa sasa.')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'wizard' && (
            <motion.div 
              key="wizard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ClinicalWizard 
                onComplete={handleWizardComplete}
                onCancel={() => setMode('selection')}
              />
            </motion.div>
          )}

          {mode === 'analysis' && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 space-y-6"
            >
              {isLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="relative">
                    <Loader2 size={64} className="text-blue-600 animate-spin" />
                    <Sparkles size={24} className="absolute -top-2 -right-2 text-blue-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                      {t('AI is Analyzing...', 'AI Inachambua...')}
                    </h3>
                    <p className="text-stone-500 text-sm font-medium max-w-xs mx-auto">
                      {t('Processing your symptoms and medical history to provide the best assessment.', 'Inachakata dalili zako na historia ya matibabu ili kutoa tathmini bora.')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-24">
                  <div className="bg-white rounded-[2.5rem] border-2 border-stone-100 shadow-xl overflow-hidden">
                    <div className="h-64 bg-stone-950 relative">
                      <TSLAvatar 
                        text={patientData || 'Medical Assessment'} 
                        className="w-full h-full rounded-none"
                      />
                    </div>
                    <div className="bg-stone-900 p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                          <Stethoscope size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                          {t('AI Assessment Report', 'Ripoti ya Tathmini ya AI')}
                        </h3>
                      </div>
                      <Sparkles className="text-blue-400 animate-pulse" size={20} />
                    </div>
                    
                    <div className="p-8 prose prose-stone max-w-none">
                      <div className="markdown-body">
                        <ReactMarkdown>{analysisResult || ''}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="p-6 bg-stone-50 border-t border-stone-100 flex flex-col gap-3">
                      <button 
                        onClick={() => setMode('wizard')}
                        className="w-full py-4 bg-white border-2 border-stone-200 text-stone-900 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <History size={18} />
                        {t('Retake Assessment', 'Chukua Tathmini Tena')}
                      </button>
                      <button 
                        onClick={onBack}
                        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                      >
                        {t('Done', 'Imekamilika')}
                      </button>
                    </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-red-900 uppercase tracking-tight text-sm">{t('Emergency Notice', 'Taarifa ya Dharura')}</h4>
                      <p className="text-xs text-red-700 leading-relaxed font-medium">
                        {t('If you are experiencing severe chest pain, difficulty breathing, or heavy bleeding, please call emergency services immediately.', 'Ikiwa unapata maumivu makali ya kifua, ugumu wa kupumua, au kutokwa na damu nyingi, tafadhali piga simu huduma za dharura mara moja.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
