import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Play, Award, Brain, Star, Zap, Volume2, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { LEARNING_DATA, Lesson, LearningSign } from '../data/learningData';
import { playPronunciation } from '../services/ttsService';

type ViewState = 'dashboard' | 'lesson' | 'quiz' | 'complete';

export const LearningAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const [view, setView] = useState<ViewState>('dashboard');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizOptions, setQuizOptions] = useState<LearningSign[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem('tsl_learning_progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const saveProgress = (lessonId: string) => {
    const newProgress = { ...progress, [lessonId]: 100 };
    setProgress(newProgress);
    localStorage.setItem('tsl_learning_progress', JSON.stringify(newProgress));
  };

  const startLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentSignIndex(0);
    setView('lesson');
  };

  const nextSign = () => {
    if (currentLesson && currentSignIndex < currentLesson.signs.length - 1) {
      setCurrentSignIndex(currentSignIndex + 1);
    } else {
      startQuiz();
    }
  };

  const startQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    generateQuizOptions(0);
    setView('quiz');
  };

  const generateQuizOptions = (index: number) => {
    if (!currentLesson) return;
    const correctSign = currentLesson.signs[index];
    const otherSigns = LEARNING_DATA.flatMap(l => l.signs).filter(s => s.id !== correctSign.id);
    const shuffledOthers = [...otherSigns].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [...shuffledOthers, correctSign].sort(() => 0.5 - Math.random());
    setQuizOptions(options);
  };

  const handleQuizAnswer = (selectedSignId: string) => {
    if (!currentLesson) return;
    const correctSign = currentLesson.signs[quizIndex];
    if (selectedSignId === correctSign.id) {
      setQuizScore(quizScore + 1);
    }

    if (quizIndex < currentLesson.signs.length - 1) {
      const nextIdx = quizIndex + 1;
      setQuizIndex(nextIdx);
      generateQuizOptions(nextIdx);
    } else {
      saveProgress(currentLesson.id);
      setView('complete');
    }
  };

  const handlePlay = async (word: string) => {
    setIsPlaying(true);
    await playPronunciation(word);
    setIsPlaying(false);
  };

  return (
    <div className="p-6 pb-24 min-h-full bg-stone-50">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-stone-900 tracking-tight">
                {t('Learning Path', 'Njia ya Kujifunza')}
              </h2>
              <p className="text-stone-500 font-medium">
                {t('Master TSL step by step with interactive lessons.', 'Mudu TSL hatua kwa hatua na masomo ya mwingiliano.')}
              </p>
            </div>

            <div className="grid gap-4">
              {LEARNING_DATA.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => startLesson(lesson)}
                  className="bg-white p-6 rounded-[2.5rem] border-2 border-stone-100 shadow-sm flex items-center gap-6 text-left hover:border-emerald-500 transition-all group active:scale-98"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    progress[lesson.id] === 100 ? 'bg-emerald-500' : 'bg-stone-900'
                  }`}>
                    {progress[lesson.id] === 100 ? <CheckCircle2 size={32} /> : <BookOpen size={32} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-stone-900">{t(lesson.title, lesson.titleSwahili)}</h3>
                    <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">{lesson.signs.length} {t('Signs', 'Ishara')}</p>
                    <div className="mt-3 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${progress[lesson.id] || 0}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-stone-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>

            {/* Daily Challenge Card */}
            <div className="bg-amber-500 p-8 rounded-[3rem] text-white shadow-xl shadow-amber-500/20 space-y-4 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3">
                <Zap size={24} className="fill-current" />
                <h4 className="font-black uppercase tracking-widest text-xs">{t('Daily Challenge', 'Changamoto ya Kila Siku')}</h4>
              </div>
              <h3 className="text-3xl font-black leading-tight">{t('Learn 5 Signs Today!', 'Jifunze Ishara 5 Leo!')}</h3>
              <button className="bg-white text-amber-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                {t('Start Now', 'Anza Sasa')}
              </button>
            </div>
          </motion.div>
        )}

        {view === 'lesson' && currentLesson && (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button onClick={() => setView('dashboard')} className="p-3 bg-white rounded-2xl border border-stone-100 shadow-sm text-stone-500">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h3 className="text-2xl font-black text-stone-900">{t(currentLesson.title, currentLesson.titleSwahili)}</h3>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
                  {t('Step', 'Hatua')} {currentSignIndex + 1} {t('of', 'ya')} {currentLesson.signs.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] border-2 border-stone-100 shadow-xl overflow-hidden">
              <div className="aspect-square bg-stone-50 relative group">
                <img 
                  src={currentLesson.signs[currentSignIndex].imageUrl} 
                  alt={currentLesson.signs[currentSignIndex].word}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-full shadow-2xl">
                    <Play size={40} className="text-emerald-600 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-4xl font-black text-stone-900">
                    {t(currentLesson.signs[currentSignIndex].word, currentLesson.signs[currentSignIndex].wordSwahili)}
                  </h4>
                  <button 
                    onClick={() => handlePlay(currentLesson.signs[currentSignIndex].word)}
                    disabled={isPlaying}
                    className={`p-4 rounded-2xl transition-all ${isPlaying ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-600'}`}
                  >
                    <Volume2 size={24} className={isPlaying ? 'animate-pulse' : ''} />
                  </button>
                </div>
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Hand Gesture', 'Ishara ya Mkono')}</p>
                    <p className="text-lg text-stone-600 leading-relaxed font-medium italic">
                      {t(currentLesson.signs[currentSignIndex].description, currentLesson.signs[currentSignIndex].descriptionSwahili)}
                    </p>
                  </div>
                  
                  {currentLesson.signs[currentSignIndex].facialExpression && (
                    <div className="pt-4 border-t border-stone-200 space-y-1">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} />
                        {t('Facial Expression', 'Sura ya Uso')}
                      </p>
                      <p className="text-lg text-emerald-700 leading-relaxed font-bold italic">
                        {t(currentLesson.signs[currentSignIndex].facialExpression, currentLesson.signs[currentSignIndex].facialExpressionSwahili)}
                      </p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={nextSign}
                  className="w-full py-6 bg-stone-900 text-white text-xl font-black rounded-3xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3"
                >
                  {currentSignIndex === currentLesson.signs.length - 1 ? t('Start Quiz', 'Anza Chemsha Bongo') : t('Next Sign', 'Ishara Inayofuata')}
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'quiz' && currentLesson && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                <Brain size={16} />
                {t('Quiz Mode', 'Hali ya Chemsha Bongo')}
              </div>
              <h3 className="text-4xl font-black text-stone-900 leading-tight">
                {t('What does this sign mean?', 'Ishara hii inamaanisha nini?')}
              </h3>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden max-w-xs mx-auto">
                <div 
                  className="h-full bg-purple-500 transition-all duration-500" 
                  style={{ width: `${((quizIndex + 1) / currentLesson.signs.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-[3rem] border-2 border-stone-100 shadow-xl max-w-sm mx-auto overflow-hidden">
              <img 
                src={currentLesson.signs[quizIndex].imageUrl} 
                alt="Quiz" 
                className="w-full aspect-square object-cover rounded-[2.5rem]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {quizOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleQuizAnswer(option.id)}
                  className="w-full p-6 bg-white border-2 border-stone-100 rounded-3xl text-xl font-black text-stone-800 hover:border-purple-500 hover:bg-purple-50 transition-all active:scale-98 shadow-sm"
                >
                  {t(option.word, option.wordSwahili)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'complete' && currentLesson && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-12"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40"
              >
                <Award size={80} />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-6 border-4 border-emerald-500 rounded-full"
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-stone-900 tracking-tighter leading-none">{t('Lesson Complete!', 'Somo Limekamilika!')}</h3>
              <p className="text-stone-500 text-xl font-medium max-w-xs mx-auto">
                {t('You scored', 'Umepata')} <span className="text-emerald-600 font-black">{quizScore}/{currentLesson.signs.length}</span> {t('in the quiz. Keep it up!', 'kwenye chemsha bongo. Endelea hivyo!')}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={() => setView('dashboard')}
                className="w-full py-6 bg-stone-900 text-white text-xl font-black rounded-3xl shadow-xl active:scale-95 transition-transform"
              >
                {t('Back to Lessons', 'Rudi kwenye Masomo')}
              </button>
              <button 
                onClick={() => startQuiz()}
                className="w-full py-6 bg-white text-stone-900 border-2 border-stone-100 font-black rounded-3xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> {t('Retry Quiz', 'Rudia Chemsha Bongo')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
