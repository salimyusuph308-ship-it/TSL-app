import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { CameraTranslator } from './components/CameraTranslator';
import { DoctorModule } from './components/DoctorModule';
import { EmergencyModule } from './components/EmergencyModule';
import { HomeScreen } from './components/HomeScreen';
import { ExpertModule } from './components/ExpertModule';
import { HospitalServices } from './components/HospitalServices';
import { PairingScreen } from './components/PairingScreen';
import { Dictionary } from './components/Dictionary';
import { ProfileScreen } from './components/ProfileScreen';
import { SymptomChecker } from './components/SymptomChecker';
import { AvatarModule } from './components/AvatarModule';
import { ChevronLeft } from 'lucide-react';
import { pairingService } from './services/pairingService';
import { playPronunciation } from './services/ttsService';
import { useProfile } from './contexts/ProfileContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState<{id: string, label: string, phrase?: string, time: string, completed: boolean}[]>([]);
  const [instructions, setInstructions] = useState<{id: string, instruction: string, tslDescription?: string, visualIcon?: string, timestamp: string}[]>([]);
  const [isPaired, setIsPaired] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const { profile, addHistoryEntry, trackSignUsage } = useProfile();

  const addRequest = useCallback((label: string, phrase?: string, fromRemote: boolean = false) => {
    const newRequest = {
      id: Math.random().toString(36).substr(2, 9),
      label,
      phrase,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: false
    };
    setRequests(prev => [newRequest, ...prev]);

    // Save to history if local
    if (!fromRemote) {
      addHistoryEntry('request', phrase || label);
    }

    // If paired and this is a local request, send to the other device
    if (isPaired && !fromRemote) {
      pairingService.sendMessage({
        type: 'patient-request',
        label,
        phrase
      });
    }
  }, [isPaired, addHistoryEntry]);

  const addInstruction = useCallback((instruction: string, tslDescription?: string, visualIcon?: string, fromRemote: boolean = false) => {
    const newInstruction = {
      id: Math.random().toString(36).substr(2, 9),
      instruction,
      tslDescription,
      visualIcon,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setInstructions(prev => [newInstruction, ...prev]);

    // Save to history if local
    if (!fromRemote) {
      addHistoryEntry('instruction', instruction, tslDescription);
    }

    if (isPaired && !fromRemote) {
      pairingService.sendMessage({
        type: 'doctor-instruction',
        ...newInstruction
      });
    }
  }, [isPaired, addHistoryEntry]);

  useEffect(() => {
    // Check for room ID in URL (for patient scanning)
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl && !isPaired) {
      setActiveTab('pairing');
    }

    // Listen for real-time messages
    const handleMessage = (e: any) => {
      const message = e.detail;
      console.log("App received real-time message:", message);

      if (message.type === 'patient-request') {
        // Pass fromRemote: true to avoid re-sending the same message back
        addRequest(message.label, message.phrase, true);
        // Auto-play TTS for doctor
        playPronunciation(message.phrase || message.label);
      } else if (message.type === 'doctor-instruction') {
        addInstruction(message.instruction, message.tslDescription, message.visualIcon, true);
        // Auto-play TTS for patient
        playPronunciation(message.instruction);
      }
    };

    window.addEventListener("afyasign:message", handleMessage);
    return () => window.removeEventListener("afyasign:message", handleMessage);
  }, [isPaired, addRequest, addInstruction]);

  useEffect(() => {
    // Request permissions early for better UX as specified in metadata
    const requestPermissions = async () => {
      try {
        // We request both camera and microphone as per metadata.json
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Stop tracks immediately, we just wanted to trigger the permission prompt
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.warn("Hardware permissions not pre-authorized:", err);
      }
    };
    
    requestPermissions();
  }, []);

  const completeRequest = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, completed: true } : req
    ));
  };

  const handlePaired = (id: string) => {
    setRoomId(id);
    setIsPaired(true);
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={setActiveTab} isPaired={isPaired} onPair={() => setActiveTab('pairing')} />;
      case 'profile':
        return <ProfileScreen onBack={() => setActiveTab('home')} />;
      case 'pairing':
        return <PairingScreen onBack={() => setActiveTab('home')} onPaired={handlePaired} />;
      case 'camera':
        return <CameraTranslator onBack={() => setActiveTab('home')} />;
      case 'nurse':
        return <DoctorModule onBack={() => setActiveTab('home')} requests={requests} instructions={instructions} onSendInstruction={addInstruction} onComplete={completeRequest} onConsultExpert={() => setActiveTab('expert')} onRefer={() => setActiveTab('hospital')} onNavigate={setActiveTab} isPaired={isPaired} />;
      case 'emergency':
        return <EmergencyModule onBack={() => setActiveTab('home')} onSendRequest={addRequest} instructions={instructions} requests={requests} onToggleCamera={() => setActiveTab('camera')} onConsultExpert={() => setActiveTab('expert')} onViewHospitalServices={() => setActiveTab('hospital')} />;
      case 'expert':
        return <ExpertModule onBack={() => setActiveTab('home')} />;
      case 'hospital':
        return <HospitalServices onBack={() => setActiveTab('home')} onConsultExpert={() => setActiveTab('expert')} />;
      case 'symptom-checker':
        return <SymptomChecker onBack={() => setActiveTab('home')} />;
      case 'avatar':
        return <AvatarModule onBack={() => setActiveTab('home')} />;
      case 'alphabet':
        return (
          <div className="h-full flex flex-col bg-stone-50 overflow-hidden">
            <div className="bg-white p-4 flex items-center gap-4 border-b border-stone-200">
              <button 
                onClick={() => setActiveTab('home')}
                className="p-2 bg-stone-100 rounded-xl text-stone-600"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">TSL Dictionary</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Dictionary onSignClick={(sign) => trackSignUsage(sign.id)} />
            </div>
          </div>
        );
      default:
        return <HomeScreen onNavigate={setActiveTab} isPaired={isPaired} onPair={() => setActiveTab('pairing')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
