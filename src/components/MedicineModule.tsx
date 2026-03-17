import React, { useState } from 'react';
import { Pill, Activity, Clock, AlertCircle, Volume2, Sparkles, Loader2, Stethoscope, Heart, ShieldAlert, Send, Mic, User, MessageSquare, Plus, Bot, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playPronunciation } from '../services/ttsService';
import { generateSignIllustration } from '../services/imageGenService';
import { useLanguage } from '../contexts/LanguageContext';
import { chatWithDoctor } from '../services/geminiService';
import { TSLAvatar } from './TSLAvatar';

interface HealthSign {
  id: string;
  word: string;
  wordSwahili: string;
  description: string;
  descriptionSwahili: string;
  facialExpression?: string;
  facialExpressionSwahili?: string;
  imageUrl: string;
  category: 'symptom' | 'instruction' | 'doctor' | 'emergency' | 'mental' | 'quick';
}

const HEALTH_SIGNS: HealthSign[] = [
  // Symptoms & Ailments (Dalili za Ugonjwa)
  { 
    id: 'm1', 
    word: 'Headache', 
    wordSwahili: 'Kuumwa na kichwa',
    category: 'symptom', 
    description: 'Twist your index fingers near your temples.', 
    descriptionSwahili: 'Zungusha vidole vyako vya shahada karibu na paji la uso.',
    facialExpression: 'Slightly closed eyes and a tensed forehead to show pain.',
    facialExpressionSwahili: 'Macho yaliyofungwa kidogo na paji la uso lililokaza kuonyesha maumivu.',
    imageUrl: 'https://picsum.photos/seed/headache/400/400' 
  },
  { 
    id: 'm2', 
    word: 'Fever', 
    wordSwahili: 'Homa',
    category: 'symptom', 
    description: 'Place the back of your hand on your forehead.', 
    descriptionSwahili: 'Weka nyuma ya mkono wako kwenye paji la uso wako.',
    facialExpression: 'A tired or weak expression with slightly drooping eyelids.',
    facialExpressionSwahili: 'Usemi wa uchovu au udhaifu na kope zilizolamaa kidogo.',
    imageUrl: 'https://picsum.photos/seed/fever/400/400' 
  },
  { 
    id: 'm3', 
    word: 'Cough', 
    wordSwahili: 'Kikohozi',
    category: 'symptom', 
    description: 'Tap your chest with a curved hand.', 
    descriptionSwahili: 'Gonga kifua chako kwa mkono uliopindika.',
    imageUrl: 'https://picsum.photos/seed/cough/400/400' 
  },
  { 
    id: 'm4', 
    word: 'Stomach ache', 
    wordSwahili: 'Maumivu ya tumbo',
    category: 'symptom', 
    description: 'Twist your hands near your stomach area.', 
    descriptionSwahili: 'Zungusha mikono yako karibu na eneo la tumbo.',
    imageUrl: 'https://picsum.photos/seed/stomach/400/400' 
  },
  { 
    id: 'm5', 
    word: 'Dizzy', 
    wordSwahili: 'Kizunguzungu',
    category: 'symptom', 
    description: 'Move your hand in a circular motion around your head.', 
    descriptionSwahili: 'Sogeza mkono wako kwa mwendo wa duara kuzunguka kichwa chako.',
    facialExpression: 'Confused expression and slightly unfocused eyes.',
    facialExpressionSwahili: 'Usemi wa kuchanganyikiwa na macho yasiyotulia kidogo.',
    imageUrl: 'https://picsum.photos/seed/dizzy/400/400' 
  },
  { 
    id: 'm9', 
    word: 'Diarrhea', 
    wordSwahili: 'Kuhara',
    category: 'symptom', 
    description: 'Move your hands downwards from your stomach area repeatedly.', 
    descriptionSwahili: 'Sogeza mikono yako chini kutoka eneo la tumbo lako mara kwa mara.',
    imageUrl: 'https://picsum.photos/seed/diarrhea/400/400' 
  },
  { 
    id: 'm10', 
    word: 'Vomiting', 
    wordSwahili: 'Kutapika',
    category: 'symptom', 
    description: 'Move your hand from your mouth outwards and downwards.', 
    descriptionSwahili: 'Sogeza mkono wako kutoka mdomoni kuelekea nje na chini.',
    imageUrl: 'https://picsum.photos/seed/vomiting/400/400' 
  },
  
  // Talking to Doctor (Mazungumzo na Daktari)
  { 
    id: 'd1', 
    word: 'Doctor', 
    wordSwahili: 'Daktari',
    category: 'doctor', 
    description: 'Tap your wrist with two fingers (like checking a pulse).', 
    descriptionSwahili: 'Gonga mkono wako kwa vidole viwili (kama unakagua mapigo ya moyo).',
    imageUrl: 'https://picsum.photos/seed/doctor/400/400' 
  },
  { 
    id: 'd2', 
    word: 'Pain', 
    wordSwahili: 'Maumivu',
    category: 'doctor', 
    description: 'Twist your index fingers towards each other near the area that hurts.', 
    descriptionSwahili: 'Zungusha vidole vyako vya shahada kuelekeana karibu na eneo linalouma.',
    facialExpression: 'Grimace or wince to emphasize the intensity of the pain.',
    facialExpressionSwahili: 'Kukunja uso au kushtuka ili kusisitiza ukali wa maumivu.',
    imageUrl: 'https://picsum.photos/seed/pain/400/400' 
  },
  { 
    id: 'd3', 
    word: 'Where?', 
    wordSwahili: 'Wapi?',
    category: 'doctor', 
    description: 'Hold your hands out with palms up and move them slightly side to side.', 
    descriptionSwahili: 'Shikilia mikono yako nje na viganja vikiwa juu and uisogeze kidogo upande hadi upande.',
    facialExpression: 'Raised eyebrows and a questioning look.',
    facialExpressionSwahili: 'Nyusi zilizoinuliwa na mwonekano wa kuuliza.',
    imageUrl: 'https://picsum.photos/seed/where/400/400' 
  },

  // Medicine & Instructions (Dawa na Maagizo)
  { 
    id: 'i1', 
    word: 'Morning', 
    wordSwahili: 'Asubuhi',
    category: 'instruction', 
    description: 'Arm moves up like the sun rising.', 
    descriptionSwahili: 'Mkono unasogea juu kama jua linalochomoza.',
    imageUrl: 'https://picsum.photos/seed/morning/400/400' 
  },
  { 
    id: 'i2', 
    word: 'Night', 
    wordSwahili: 'Usiku',
    category: 'instruction', 
    description: 'Hand moves down over the other arm like the sun setting.', 
    descriptionSwahili: 'Mkono unasogea chini juu ya mkono mwingine kama jua linalozama.',
    imageUrl: 'https://picsum.photos/seed/night/400/400' 
  },
  { 
    id: 'i5', 
    word: 'One Tablet', 
    wordSwahili: 'Kidonge kimoja',
    category: 'instruction', 
    description: 'Hold up one finger, then mime taking a small pill.', 
    descriptionSwahili: 'Inua kidole kimoja juu, kisha igiza kumeza kidonge kidogo.',
    imageUrl: 'https://picsum.photos/seed/onepill/400/400' 
  },
  { 
    id: 'i6', 
    word: 'Twice Daily', 
    wordSwahili: 'Mara mbili kwa siku',
    category: 'instruction', 
    description: 'Hold up two fingers, then sign "Day" (arm moving across).', 
    descriptionSwahili: 'Inua vidole viwili juu, kisha weka ishara ya "Siku" (mkono ukisogea kote).',
    imageUrl: 'https://picsum.photos/seed/twice/400/400' 
  },

  // Hospital & Emergency (Hospitali na Dharura)
  { 
    id: 'e1', 
    word: 'Hospital', 
    wordSwahili: 'Hospitali',
    category: 'emergency', 
    description: 'Draw a cross on your shoulder with your index finger.', 
    descriptionSwahili: 'Chora msalaba kwenye bega lako kwa kidole chako cha shahada.',
    imageUrl: 'https://picsum.photos/seed/hospital/400/400' 
  },
  { 
    id: 'e2', 
    word: 'Emergency', 
    wordSwahili: 'Dharura',
    category: 'emergency', 
    description: 'Shake your hand with an "E" shape rapidly.', 
    descriptionSwahili: 'Tikisa mkono wako kwa umbo la "E" haraka.',
    imageUrl: 'https://picsum.photos/seed/emergency/400/400' 
  },
  { 
    id: 'e3', 
    word: 'Help', 
    wordSwahili: 'Msaada',
    category: 'emergency', 
    description: 'Place your flat palm on top of your other fist and move them up together.', 
    descriptionSwahili: 'Weka kiganja chako bapa juu ya ngumi yako nyingine na uisogeze juu pamoja.',
    imageUrl: 'https://picsum.photos/seed/help/400/400' 
  },

  // Mental Health (Afya ya Akili)
  { 
    id: 'mh1', 
    word: 'Mental Health', 
    wordSwahili: 'Afya ya Akili',
    category: 'mental', 
    description: 'Point to your head, then sign "Health" (hands moving from chest outwards).', 
    descriptionSwahili: 'Elekeza kichwani mwako, kisha weka ishara ya "Afya" (mikono ikisogea kutoka kifuani kuelekea nje).',
    imageUrl: 'https://picsum.photos/seed/mentalhealth/400/400' 
  },
  { 
    id: 'mh2', 
    word: 'Sad', 
    wordSwahili: 'Huzuni',
    category: 'mental', 
    description: 'Move your hand down your face.', 
    descriptionSwahili: 'Sogeza mkono wako chini ya uso wako.',
    facialExpression: 'Downcast eyes and a drooping mouth.',
    facialExpressionSwahili: 'Macho yaliyoinama na mdomo uliolamaa.',
    imageUrl: 'https://picsum.photos/seed/sad/400/400' 
  },
  { 
    id: 'mh3', 
    word: 'Anxious', 
    wordSwahili: 'Wasiwasi',
    category: 'mental', 
    description: 'Shake your hands near your chest.', 
    descriptionSwahili: 'Tikisa mikono yako karibu na kifua chako.',
    facialExpression: 'Worried expression with tensed facial muscles.',
    facialExpressionSwahili: 'Usemi wa wasiwasi na misuli ya uso iliyokaza.',
    imageUrl: 'https://picsum.photos/seed/anxious/400/400' 
  },
  // Quick Responses for Patient
  { 
    id: 'q1', 
    word: 'Yes', 
    wordSwahili: 'Ndiyo',
    category: 'quick', 
    description: 'Nod your head while making a fist and moving it up and down.', 
    descriptionSwahili: 'Tikisa kichwa chako huku ukiwa umekunja ngumi na kuisogeze juu and chini.',
    imageUrl: 'https://picsum.photos/seed/yes/400/400' 
  },
  { 
    id: 'q2', 
    word: 'No', 
    wordSwahili: 'Hapana',
    category: 'quick', 
    description: 'Snap your index and middle fingers against your thumb.', 
    descriptionSwahili: 'Gonga vidole vyako vya shahada na vya kati dhidi ya kidole gumba.',
    imageUrl: 'https://picsum.photos/seed/no/400/400' 
  },
  { 
    id: 'q3', 
    word: 'Thank you', 
    wordSwahili: 'Asante',
    category: 'quick', 
    description: 'Move your flat hand from your chin towards the person.', 
    descriptionSwahili: 'Sogeza mkono wako bapa kutoka kwenye kidevu chako kuelekea kwa mtu huyo.',
    imageUrl: 'https://picsum.photos/seed/thanks/400/400' 
  },
  { 
    id: 'q4', 
    word: 'I don\'t understand', 
    wordSwahili: 'Sielewi',
    category: 'quick', 
    description: 'Flick your index finger up near your forehead with a confused look.', 
    descriptionSwahili: 'Sogeza kidole chako cha shahada juu karibu na paji la uso wako ukiwa na mwonekano wa kuchanganyikiwa.',
    imageUrl: 'https://picsum.photos/seed/dontunderstand/400/400' 
  },
];

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'provider' | 'ai';
  timestamp: Date;
  signId?: string;
  tslDescription?: string;
}

export const MedicineModule: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'symptoms' | 'doctor' | 'instructions' | 'emergency' | 'mental' | 'consultation'>('symptoms');
  const [selectedSign, setSelectedSign] = useState<HealthSign | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Habari! Mimi ni Daktari Msaidizi wa AI. Nitakusaidia kuwasiliana na daktari wako au kuelewa dalili zako kwa Lugha ya Alama.', sender: 'ai', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSigns = HEALTH_SIGNS.filter(s => {
    const matchesSearch = s.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.wordSwahili.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeSubTab === 'symptoms') return s.category === 'symptom';
    if (activeSubTab === 'doctor') return s.category === 'doctor';
    if (activeSubTab === 'instructions') return s.category === 'instruction';
    if (activeSubTab === 'emergency') return s.category === 'emergency';
    if (activeSubTab === 'mental') return s.category === 'mental';
    if (activeSubTab === 'consultation') return s.category === 'quick';
    return false;
  });

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('Speech recognition not supported', 'Utambuzi wa sauti hautegemezwi'));
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'sw-KE';
    recognition.onresult = (event: any) => {
      setSearchQuery(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const handleSendMessage = async (text: string, sender: 'patient' | 'provider' | 'ai') => {
    if (!text.trim()) return;
    
    // Find matching sign from static list for quick feedback
    const matchingSign = HEALTH_SIGNS.find(s => 
      s.word.toLowerCase() === text.toLowerCase() || 
      s.wordSwahili.toLowerCase() === text.toLowerCase()
    );

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      signId: matchingSign?.id
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');

    // If it's a patient or provider message, get AI response
    if (sender !== 'ai') {
      setIsAiLoading(true);
      try {
        const history = updatedMessages.map(m => ({
          role: m.sender === 'ai' ? 'model' as const : 'user' as const,
          parts: [{ text: m.text }]
        }));
        
        const aiResponse = await chatWithDoctor(text, history);
        
        // Extract TSL description if present in the response
        const tslMatch = aiResponse.match(/Ishara ya TSL: \[(.*?)\]/);
        const tslDescription = tslMatch ? tslMatch[1] : undefined;

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          tslDescription
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error("AI Chat Error:", error);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('Speech recognition not supported', 'Utambuzi wa sauti hautegemezwi'));
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'sw-KE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSendMessage(transcript, 'provider');
    };

    recognition.start();
  };


  const handlePlay = async (word: string) => {
    setIsPlaying(true);
    await playPronunciation(word);
    setIsPlaying(false);
  };

  const handleGenerateAI = async () => {
    if (!selectedSign) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateSignIllustration(selectedSign.word, selectedSign.description);
      if (imageUrl) {
        setSelectedSign({
          ...selectedSign,
          imageUrl: imageUrl,
          description: `(AI Generated) ${selectedSign.description}`,
          descriptionSwahili: `(Picha ya AI) ${selectedSign.descriptionSwahili}`
        });
      }
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.status === 429) {
        alert(t('Rate limit exceeded. Please wait a moment and try again.', 'Kikomo cha matumizi kimefikiwa. Tafadhali subiri kidogo na ujaribu tena.'));
      } else {
        alert(t('Failed to generate illustration. Please try again.', 'Imeshindwa kutengeneza picha. Tafadhali jaribu tena.'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-24 bg-gradient-to-b from-emerald-50/50 to-white min-h-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-emerald-900 leading-tight">{t('Afya (Health)', 'Afya')}</h2>
          <p className="text-emerald-600/80 font-medium">{t('TSL for Better Healthcare', 'TSL kwa Huduma Bora za Afya')}</p>
        </div>
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
          <Stethoscope size={32} />
        </div>
      </div>

      {/* Assistant Doctor Character Intro */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
          <Heart size={24} />
        </div>
        <p className="text-xs font-bold text-stone-600 italic">
          {t('"Hello! I am Daktari Msaidizi. I will help you communicate with your doctor."', '"Habari! Mimi ni Daktari Msaidizi. Nitakusaidia kuwasiliana na daktari wako."')}
        </p>
      </div>

      {/* Sub-navigation - Scrollable on mobile */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveSubTab('symptoms')}
            className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeSubTab === 'symptoms' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            <Activity size={18} />
            {t('Symptoms', 'Dalili')}
          </button>
          <button
            onClick={() => setActiveSubTab('doctor')}
            className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeSubTab === 'doctor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            <Stethoscope size={18} />
            {t('Doctor', 'Daktari')}
          </button>
          <button
            onClick={() => setActiveSubTab('instructions')}
            className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeSubTab === 'instructions' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            <Clock size={18} />
            {t('Medicine', 'Dawa')}
          </button>
          <button
            onClick={() => setActiveSubTab('emergency')}
            className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeSubTab === 'emergency' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            <ShieldAlert size={18} />
            {t('Emergency', 'Dharura')}
          </button>
          <button
            onClick={() => setActiveSubTab('mental')}
            className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeSubTab === 'mental' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            <Heart size={18} />
            {t('Mental', 'Akili')}
          </button>
          <button
            onClick={() => setActiveSubTab('consultation')}
            className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeSubTab === 'consultation' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            <MessageSquare size={18} />
            {t('Consultation', 'Mazungumzo')}
          </button>
        </div>

        {activeSubTab !== 'consultation' && (
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder={t('Search health signs...', 'Tafuta ishara za afya...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={startVoiceSearch}
              className="p-3 bg-white border border-emerald-100 rounded-2xl text-emerald-600 shadow-sm active:scale-95 transition-transform"
            >
              <Mic size={20} />
            </button>
          </div>
        )}
      </div>

      {activeSubTab === 'consultation' ? (
        <div className="flex flex-col h-[500px] bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                <Stethoscope size={20} />
              </div>
              <div>
                <h4 className="font-black text-emerald-900 text-sm">{t('Consultation Mode', 'Hali ya Mazungumzo')}</h4>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{t('Live Translation', 'Tafsiri ya Moja kwa Moja')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={12} />
                {t('Tip: Use Facial Expressions', 'Kidokezo: Tumia Sura ya Uso')}
              </div>
              <button 
                onClick={() => setMessages([{ id: Date.now().toString(), text: 'Habari! Mimi ni Daktari Msaidizi wa AI. Nitakusaidia kuwasiliana na daktari wako au kuelewa dalili zako kwa Lugha ya Alama.', sender: 'ai', timestamp: new Date() }])}
                className="text-emerald-600 p-2 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, x: msg.sender === 'patient' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={msg.id}
                className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] space-y-1 ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm ${
                    msg.sender === 'patient' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : msg.sender === 'ai'
                        ? 'bg-blue-600 text-white rounded-tl-none'
                        : 'bg-stone-100 text-stone-800 rounded-tl-none'
                  }`}>
                    {msg.sender === 'ai' && <Bot size={14} className="mb-1 opacity-70" />}
                    {msg.text}
                  </div>
                  {msg.tslDescription && (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-[11px] text-blue-800 font-medium">
                      <p className="font-black uppercase tracking-widest text-[9px] text-blue-400 mb-1">Ishara ya TSL</p>
                      {msg.tslDescription}
                    </div>
                  )}
                  {msg.signId && (
                    <button
                      onClick={() => setSelectedSign(HEALTH_SIGNS.find(s => s.id === msg.signId) || null)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-100 rounded-full text-[10px] font-black text-emerald-600 shadow-sm active:scale-95 transition-transform"
                    >
                      <Sparkles size={12} />
                      {t('View Sign', 'Angalia Ishara')}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {isAiLoading && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="bg-stone-100 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-stone-400" />
                  <span className="text-xs font-bold text-stone-400 italic">AI inafikiria...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Signs for Patient */}
          <div className="p-4 border-t border-emerald-50 bg-stone-50/50">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 px-2">
              {t('Patient Quick Signs', 'Ishara za Haraka za Mgonjwa')}
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {HEALTH_SIGNS.filter(s => s.category === 'quick').map(sign => (
                <button
                  key={sign.id}
                  onClick={() => handleSendMessage(language === 'en' ? sign.word : sign.wordSwahili, 'patient')}
                  className="shrink-0 px-4 py-2 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-700 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                >
                  {t(sign.word, sign.wordSwahili)}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area for Provider */}
          <div className="p-4 bg-white border-t border-emerald-50 flex items-center gap-2">
            <button 
              onClick={startListening}
              className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-stone-100 text-stone-500'}`}
            >
              <Mic size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText, 'provider')}
              placeholder={t('Doctor types here...', 'Daktari anaandika hapa...')}
              className="flex-1 bg-stone-100 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button 
              onClick={() => handleSendMessage(inputText, 'provider')}
              className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Signs Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredSigns.map((sign) => (
              <button
                key={sign.id}
                onClick={() => setSelectedSign(sign)}
                className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center text-center space-y-3 active:scale-95 transition-transform"
              >
                <div className="w-full aspect-square bg-stone-50 rounded-3xl overflow-hidden">
                  <img src={sign.imageUrl} alt={sign.word} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="font-black text-stone-800 text-sm">{t(sign.word, sign.wordSwahili)}</span>
              </button>
            ))}
          </div>

          {/* Emergency Quick Action - Enhanced */}
          <div className="bg-red-500 p-6 rounded-[2.5rem] shadow-xl shadow-red-200 flex items-center gap-4 text-white">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
              <AlertCircle size={32} />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-xl">{t('Need Help?', 'Unahitaji Msaada?')}</h4>
              <p className="text-red-100 text-sm font-medium">{t('Emergency hospital signs.', 'Ishara za dharura za hospitali.')}</p>
            </div>
            <button 
              onClick={() => setActiveSubTab('emergency')}
              className="bg-white text-red-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              {t('Go', 'Nenda')}
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-square bg-stone-100">
                {selectedSign.description.includes('AI Generated') ? (
                  <TSLAvatar 
                    text={selectedSign.word} 
                    tslDescription={selectedSign.description}
                    className="w-full h-full rounded-none" 
                  />
                ) : (
                  <img src={selectedSign.imageUrl} alt={selectedSign.word} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                <button 
                  onClick={() => setSelectedSign(null)}
                  className="absolute top-4 right-4 bg-black/20 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                >
                  ✕
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-stone-900">{t(selectedSign.word, selectedSign.wordSwahili)}</h3>
                  <button 
                    onClick={() => handlePlay(selectedSign.word)}
                    disabled={isPlaying}
                    className={`p-4 rounded-2xl transition-all ${isPlaying ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-600'}`}
                  >
                    <Volume2 size={24} className={isPlaying ? 'animate-pulse' : ''} />
                  </button>
                </div>
                <p className="text-xl text-stone-600 leading-relaxed">
                  {t(selectedSign.description, selectedSign.descriptionSwahili)}
                </p>
                {selectedSign.facialExpression && (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={12} />
                      {t('Facial Expression', 'Sura ya Uso')}
                    </p>
                    <p className="text-sm text-emerald-800 font-bold italic">
                      {t(selectedSign.facialExpression, selectedSign.facialExpressionSwahili)}
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex-1 py-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-2 border border-emerald-100 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {t('AI View', 'Picha ya AI')}
                  </button>
                  <button 
                    onClick={() => setSelectedSign(null)}
                    className="flex-[2] py-4 bg-stone-900 text-white font-bold rounded-2xl active:scale-95 transition-transform"
                  >
                    {t('Got it', 'Sawa')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
