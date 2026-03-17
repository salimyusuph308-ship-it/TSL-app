import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Keyboard, 
  ChevronLeft, 
  Send, 
  Play, 
  Volume2, 
  Sparkles,
  User,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Clock,
  Layout as LayoutIcon,
  Image as ImageIcon,
  History,
  PhoneCall,
  ShieldAlert,
  ClipboardList,
  X,
  Grid,
  Settings,
  Bell,
  Zap as VibrationIcon,
  Languages,
  FlaskConical
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { chatWithDoctor } from '../services/geminiService';
import { playPronunciation } from '../services/ttsService';
import { ClinicalWizard } from './ClinicalWizard';
import { TSLQuickBoard } from './TSLQuickBoard';
import { TextToSign } from './TextToSign';
import { TSLAvatar } from './TSLAvatar';

interface DoctorModuleProps {
  onBack: () => void;
  requests: {id: string, label: string, phrase?: string, time: string, completed: boolean}[];
  instructions: {id: string, instruction: string, tslDescription?: string, visualIcon?: string, timestamp: string}[];
  onSendInstruction: (instruction: string, tslDescription?: string, visualIcon?: string) => void;
  onComplete: (id: string) => void;
  onConsultExpert?: () => void;
  onRefer?: () => void;
  onNavigate?: (tab: string) => void;
  isPaired?: boolean;
}

export const DoctorModule: React.FC<DoctorModuleProps> = ({ onBack, requests, instructions, onSendInstruction, onComplete, onConsultExpert, onRefer, onNavigate, isPaired }) => {
  const { t, language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<{ 
    instruction: string, 
    tslDescription?: string, 
    visualIcon?: string,
    timestamp: string
  } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showClinicalWizard, setShowClinicalWizard] = useState(false);
  const [showTextToSign, setShowTextToSign] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{id: string, label: string, phrase?: string, time: string, completed: boolean} | null>(null);
  const [patientViewTab, setPatientViewTab] = useState<'instruction' | 'tsl'>('instruction');
  const [showSettings, setShowSettings] = useState(false);
  const [sosSound, setSosSound] = useState<'default' | 'siren' | 'pulse' | 'none'>('default');
  const [sosVibration, setSosVibration] = useState<'short' | 'long' | 'double' | 'none'>('double');

  useEffect(() => {
    // Play alert sound/vibration when a new request arrives
    const lastRequest = requests[0];
    if (lastRequest && !lastRequest.completed) {
      playSosAlert();
    }
  }, [requests.length]);

  const playSosAlert = () => {
    if (sosSound !== 'none') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (sosSound === 'siren') {
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
          oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.5);
          oscillator.frequency.linearRampToValueAtTime(440, audioCtx.currentTime + 1.0);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 1.0);
        } else if (sosSound === 'pulse') {
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.4);
        } else {
          // Default
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);
        }
      } catch (e) {
        console.error("SOS Sound failed:", e);
      }
    }

    if (sosVibration !== 'none' && 'vibrate' in navigator) {
      if (sosVibration === 'short') navigator.vibrate(200);
      else if (sosVibration === 'long') navigator.vibrate(1000);
      else if (sosVibration === 'double') navigator.vibrate([200, 100, 200]);
    }
  };

  useEffect(() => {
    // Listen for incoming instructions if this is the patient device
    const handleMessage = (e: any) => {
      const message = e.detail;
      if (message.type === 'doctor-instruction') {
        setCurrentResponse({
          instruction: message.instruction,
          tslDescription: message.tslDescription,
          visualIcon: message.visualIcon,
          timestamp: message.timestamp
        });
        setPreviewMode(true);
        setPatientViewTab('instruction');
        playPronunciation(message.instruction);
      }
    };

    window.addEventListener("afyasign:message", handleMessage);
    return () => window.removeEventListener("afyasign:message", handleMessage);
  }, []);

  const QUICK_PHRASES = [
    { label: t('Breathe In', 'Vuta Pumzi'), text: t('Please take a deep breath.', 'Tafadhali vuta pumzi ndani sana.'), aid: '🫁' },
    { label: t('Open Mouth', 'Fungua Kidomo'), text: t('Open your mouth wide.', 'Fungua mdomo wako vizuri.'), aid: '👄' },
    { label: t('Show Pain', 'Onyesha Maumivu'), text: t('Show me exactly where it hurts.', 'Nionyeshe hasa wapi panakuuma.'), aid: '📍' },
    { label: t('Need Surgery', 'Upasuaji'), text: t('You will need a small surgery.', 'Utahitaji kufanyiwa upasuaji mdogo.'), aid: '🏥' },
    { label: t('No Problem', 'Huna Shida'), text: t('Everything looks fine, no problem.', 'Kila kitu kinaonekana sawa, huna shida.'), aid: '✅' },
    { label: t('Rest Well', 'Pumzika'), text: t('You need to rest completely.', 'Unahitaji kupumzika kabisa.'), aid: '🛌' },
    { label: t('Drink Water', 'Kunywa Maji'), text: t('You need to drink plenty of water.', 'Unahitaji kunywa maji mengi.'), aid: '💧' },
    { label: t('Take Medicine', 'Tumia Dawa'), text: t('Take this medicine three times a day.', 'Tumia dawa hii mara tatu kwa siku.'), aid: '💊' },
    { label: t('Wait Here', 'Subiri Hapa'), text: t('Please wait here for a moment.', 'Tafadhali subiri hapa kwa muda.'), aid: '⏳' },
    { label: t('Follow Me', 'Nifuate'), text: t('Please follow me to the next room.', 'Tafadhali nifuate kwenye chumba kingine.'), aid: '🚶' },
    { label: t('Lie Down', 'Lala Chini'), text: t('Please lie down on the bed.', 'Tafadhali lala kitandani.'), aid: '🛌' },
    { label: t('Sit Up', 'Keti Juu'), text: t('Please sit up straight.', 'Tafadhali keti wima.'), aid: '🪑' },
  ];

  const handleSend = async (textOverride?: string, aidOverride?: string) => {
    const textToProcess = textOverride || inputText;
    if (!textToProcess.trim()) return;
    
    setIsAiLoading(true);
    try {
      const response = await chatWithDoctor(textToProcess);
      
      const tslMatch = response.match(/Ishara ya TSL: \[(.*?)\]/);
      const tslDescription = tslMatch ? tslMatch[1] : undefined;
      const cleanInstruction = response.replace(/Ishara ya TSL: \[.*?\]/g, '').trim();
      
      const newResponse = {
        instruction: cleanInstruction,
        tslDescription: tslDescription,
        visualIcon: aidOverride,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCurrentResponse(newResponse);
      setPreviewMode(true);
      setPatientViewTab('instruction');
      
      // Use the centralized instruction sender
      onSendInstruction(cleanInstruction, tslDescription, aidOverride);
      
      // Visual feedback for doctor
      if (isPaired) {
        playSuccessSound();
      }
    } catch (error) {
      console.error("Doctor Input Error:", error);
    } finally {
      setIsAiLoading(false);
      setInputText('');
    }
  };

  const requestTslInput = () => {
    if (isPaired) {
      import('../services/pairingService').then(({ pairingService }) => {
        pairingService.sendMessage({
          type: 'request-tsl-input'
        });
      });
      playSuccessSound();
      setPatientViewTab('tsl');
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('Speech recognition not supported', 'Utambuzi wa sauti hautegemezwi'));
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'sw-KE';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.start();
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.05); 

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error("Audio feedback failed:", e);
    }
  };

  const handleComplete = (id: string) => {
    playSuccessSound();
    onComplete(id);
  };

  const handleReply = (req: any) => {
    setInputText(`${t('Regarding', 'Kuhusu')} ${req.label}: `);
    setSelectedRequest(null);
    // Focus the textarea - we'll need a ref for this
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-stone-100">
        <button 
          onClick={onBack}
          className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t('Doctor Module', 'Moduli ya Daktari')}</h2>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('Comprehensive Patient Care', 'Huduma Kamili ya Mgonjwa')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-stone-100 text-stone-600 rounded-2xl active:scale-90 transition-transform"
          >
            <Settings size={24} />
          </button>
          <button 
            onClick={() => setShowClinicalWizard(true)}
            className="p-3 bg-blue-100 text-blue-600 rounded-2xl active:scale-90 transition-transform flex items-center gap-2"
          >
            <ClipboardList size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{t('Wizard', 'Mchawi')}</span>
          </button>
          <button 
            onClick={() => onNavigate?.('symptom-checker')}
            className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl active:scale-90 transition-transform flex items-center gap-2"
          >
            <Sparkles size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{t('AI Analysis', 'Uchambuzi wa AI')}</span>
          </button>
          <button 
            onClick={() => setShowTextToSign(true)}
            className="p-3 bg-amber-100 text-amber-600 rounded-2xl active:scale-90 transition-transform flex items-center gap-2"
          >
            <Languages size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{t('Sign', 'Alama')}</span>
          </button>
          <button 
            onClick={onRefer}
            className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl active:scale-90 transition-transform flex items-center gap-2"
          >
            <FlaskConical size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{t('Refer', 'Rufaa')}</span>
          </button>
          <button 
            onClick={onConsultExpert}
            className="p-3 bg-purple-100 text-purple-600 rounded-2xl active:scale-90 transition-transform"
          >
            <PhoneCall size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                      <Settings size={24} />
                    </div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">{t('SOS Alert Settings', 'Mipangilio ya Tahadhari ya SOS')}</h3>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="p-2 bg-stone-100 rounded-xl text-stone-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Sound Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-stone-400" />
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Alert Sound', 'Sauti ya Tahadhari')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(['default', 'siren', 'pulse', 'none'] as const).map(sound => (
                        <button
                          key={sound}
                          onClick={() => setSosSound(sound)}
                          className={`p-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest ${
                            sosSound === sound ? 'bg-blue-600 border-blue-600 text-white' : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        >
                          {sound}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vibration Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <VibrationIcon size={16} className="text-stone-400" />
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Vibration Pattern', 'Mtindo wa Mtetemo')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(['short', 'long', 'double', 'none'] as const).map(pattern => (
                        <button
                          key={pattern}
                          onClick={() => setSosVibration(pattern)}
                          className={`p-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest ${
                            sosVibration === pattern ? 'bg-blue-600 border-blue-600 text-white' : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`}
                        >
                          {pattern}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-stone-50">
                  <button 
                    onClick={() => {
                      playSosAlert();
                      setShowSettings(false);
                    }}
                    className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    {t('Test & Save', 'Jaribu na Hifadhi')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showClinicalWizard && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col"
            >
              <ClinicalWizard 
                onComplete={(summary) => {
                  handleSend(summary, '📝');
                  setShowClinicalWizard(false);
                }}
                onCancel={() => setShowClinicalWizard(false)}
              />
            </motion.div>
          )}

          {showTextToSign && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col"
            >
              <TextToSign 
                onBack={() => setShowTextToSign(false)} 
                onSend={(text, desc) => {
                  onSendInstruction(text, desc);
                  setShowTextToSign(false);
                }}
              />
            </motion.div>
          )}

          {selectedRequest && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              >
                <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-stone-900 tracking-tight">{selectedRequest.label}</h3>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{selectedRequest.time}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="p-2 bg-stone-100 rounded-xl text-stone-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                  <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-stone-700">
                      {(selectedRequest as any).phrase || selectedRequest.label}
                    </pre>
                  </div>
                </div>

                <div className="p-8 bg-stone-50 flex gap-3">
                  {!selectedRequest.completed && (
                    <button 
                      onClick={() => handleReply(selectedRequest)}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={20} />
                      {t('Reply', 'Jibu')}
                    </button>
                  )}
                  {!selectedRequest.completed && (
                    <button 
                      onClick={() => {
                        handleComplete(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={20} />
                      {t('Mark Done', 'Kamilisha')}
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    {t('Close', 'Funga')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Request Queue Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Patient Requests', 'Maombi ya Mgonjwa')}</h3>
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-[10px] font-black">
              {requests.filter(r => !r.completed).length} {t('Active', 'Inatumika')}
            </span>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {requests.length === 0 ? (
                <p className="text-stone-400 text-sm italic py-4">{t('No active requests', 'Hakuna maombi yanayotumika')}</p>
              ) : (
                requests.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      req.completed ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-blue-50 shadow-sm'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <div className={`p-2 rounded-xl ${req.completed ? 'bg-stone-200 text-stone-400' : 'bg-blue-100 text-blue-600'}`}>
                        <Clock size={16} />
                      </div>
                      <div>
                        <motion.p 
                          animate={{ 
                            textDecoration: req.completed ? 'line-through' : 'none',
                            color: req.completed ? '#a8a29e' : '#1c1917'
                          }}
                          className="font-black text-sm"
                        >
                          {req.label}
                        </motion.p>
                        <p className="text-[10px] font-bold text-stone-400">{req.time}</p>
                      </div>
                    </div>
                    
                    {!req.completed ? (
                      <button 
                        onClick={() => handleComplete(req.id)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 active:scale-90 transition-all"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-emerald-500"
                      >
                        <CheckCircle2 size={20} />
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {instructions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Sent Instructions', 'Maelekezo Yaliyotumwa')}</h3>
              <div className="space-y-3">
                {instructions.map((inst) => (
                  <motion.div 
                    key={inst.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border-2 border-purple-50 bg-purple-50/30 flex items-center gap-4"
                  >
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                      <Send size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm text-stone-900 leading-tight">
                        {inst.instruction}
                      </p>
                      <p className="text-[10px] font-bold text-stone-400 mt-1">{inst.timestamp}</p>
                    </div>
                    {inst.visualIcon && <span className="text-xl">{inst.visualIcon}</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Phrases Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('Quick Phrases', 'Maneno ya Haraka')}</h3>
            <button 
              onClick={requestTslInput}
              disabled={!isPaired}
              className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 disabled:opacity-50 transition-all"
            >
              <Grid size={14} />
              {t('Request TSL Input', 'Omba Ingizo la TSL')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase.label}
                onClick={() => handleSend(phrase.text, phrase.aid)}
                className="p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-left hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{phrase.aid}</span>
                  <span className="text-xs font-black text-stone-900 uppercase tracking-tight">{phrase.label}</span>
                </div>
                <p className="text-[10px] text-stone-400 font-medium line-clamp-1">{phrase.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="p-6 space-y-4 bg-blue-50/30 border-t border-stone-100">
          <div className="flex gap-3">
            <button 
              onClick={startListening}
              className={`flex-1 flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all space-y-2 ${
                isListening ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-white border-stone-100 text-stone-600'
              }`}
            >
              <Mic size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('Speak', 'Zungumza')}</span>
            </button>
            <div className="flex-[2] flex flex-col gap-2">
              <div className="relative flex-1">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('Type instructions...', 'Andika maelekezo...')}
                  className="w-full h-full p-6 bg-white border-2 border-stone-100 rounded-[2rem] text-sm font-medium focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isAiLoading}
                  className="absolute right-4 bottom-4 p-4 bg-blue-600 text-white rounded-2xl shadow-lg disabled:opacity-50 active:scale-90 transition-transform"
                >
                  {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section (For Patient) */}
        <div className="p-6 flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPatientViewTab('instruction')}
                className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${patientViewTab === 'instruction' ? 'text-blue-600 border-blue-600' : 'text-stone-400 border-transparent'}`}
              >
                {t('Instruction View', 'Muonekano wa Maelekezo')}
              </button>
              <button 
                onClick={() => setPatientViewTab('tsl')}
                className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${patientViewTab === 'tsl' ? 'text-blue-600 border-blue-600' : 'text-stone-400 border-transparent'}`}
              >
                {t('TSL Board View', 'Muonekano wa Bodi ya TSL')}
              </button>
            </div>
            {currentResponse && patientViewTab === 'instruction' && (
              <button 
                onClick={() => playPronunciation(currentResponse.instruction)}
                className="text-blue-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <Volume2 size={16} /> {t('Replay', 'Rudia')}
              </button>
            )}
          </div>

          <div className="flex-1 bg-stone-950 rounded-[3rem] overflow-hidden relative flex flex-col border-[12px] border-stone-100 shadow-2xl">
            <AnimatePresence mode="wait">
              {patientViewTab === 'tsl' ? (
                <motion.div 
                  key="tsl-board"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full bg-white"
                >
                  <TSLQuickBoard onSend={(label, phrase) => {
                    // In preview mode, just show feedback
                    playSuccessSound();
                  }} compact />
                </motion.div>
              ) : currentResponse ? (
                <motion.div 
                  key="response"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* 1. Visual Sign Area (Top 50%) */}
                  <div className="h-1/2 relative">
                    <TSLAvatar 
                      text={currentResponse.instruction} 
                      tslDescription={currentResponse.tslDescription}
                      className="w-full h-full"
                    />
                  </div>

                  {/* 2. Instruction & TSL Area (Bottom 50%) */}
                  <div className="h-1/2 bg-white p-8 flex flex-col justify-between">
                    {/* Main Instruction */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Doctor Instruction', 'Maelekezo ya Daktari')}</p>
                      </div>
                      <h3 className="text-4xl font-black text-stone-900 leading-[1.1] tracking-tight">
                        {currentResponse.instruction}
                      </h3>
                    </div>

                    {/* TSL Description Box */}
                    {currentResponse.tslDescription && (
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-blue-50 border-2 border-blue-100 p-5 rounded-3xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                          <LayoutIcon size={40} className="text-blue-600" />
                        </div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-2">{t('How to Sign (TSL)', 'Jinsi ya Kuonyesha (TSL)')}</p>
                        <p className="text-blue-900 font-bold text-sm leading-relaxed italic">
                          "{currentResponse.tslDescription}"
                        </p>
                      </motion.div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => playPronunciation(currentResponse.instruction)}
                        className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Volume2 size={16} />
                        {t('Repeat Audio', 'Rudia Sauti')}
                      </button>
                      <button 
                        onClick={onConsultExpert}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-95 transition-all"
                      >
                        <PhoneCall size={16} />
                        {t('Interpreter', 'Mkalimani')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center space-y-6 p-12 text-center"
                >
                  <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-white/10 border border-white/5">
                    <MessageSquare size={56} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-black uppercase tracking-[0.3em] text-xs">
                      {t('Waiting', 'Inasubiri')}
                    </p>
                    <p className="text-stone-500 font-medium text-sm">
                      {t('Instructions will appear here for the patient.', 'Maelekezo yataonekana hapa kwa ajili ya mgonjwa.')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
