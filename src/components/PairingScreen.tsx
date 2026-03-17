import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Scan, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Smartphone,
  Link as LinkIcon,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { pairingService } from '../services/pairingService';

interface PairingScreenProps {
  onBack: () => void;
  onPaired: (roomId: string) => void;
}

export const PairingScreen: React.FC<PairingScreenProps> = ({ onBack, onPaired }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'select' | 'generate' | 'scan'>('select');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    const handleUserJoined = (e: any) => {
      console.log("User joined room:", e.detail);
      setIsPaired(true);
      setTimeout(() => onPaired(roomId!), 1500);
    };

    window.addEventListener("afyasign:user-joined", handleUserJoined);
    return () => window.removeEventListener("afyasign:user-joined", handleUserJoined);
  }, [roomId, onPaired]);

  const handleGenerate = () => {
    const newId = pairingService.generateRoomId();
    setRoomId(newId);
    pairingService.joinRoom(newId);
    setMode('generate');
  };

  const handleScan = () => {
    setMode('scan');
    // Initialize scanner in the next tick to ensure container exists
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 20, 
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        try {
          // Expecting a URL like https://.../?room=ROOMID or just ROOMID
          const url = new URL(decodedText);
          const scannedRoomId = url.searchParams.get("room") || decodedText;
          if (scannedRoomId) {
            pairingService.joinRoom(scannedRoomId);
            setRoomId(scannedRoomId);
            setIsPaired(true);
            scanner.clear();
            setTimeout(() => onPaired(scannedRoomId), 1500);
          }
        } catch (e) {
          // If not a URL, try using the text directly as room ID
          pairingService.joinRoom(decodedText);
          setRoomId(decodedText);
          setIsPaired(true);
          scanner.clear();
          setTimeout(() => onPaired(decodedText), 1500);
        }
      }, (err) => {
        // console.warn(err);
      });
    }, 100);
  };

  const pairingUrl = roomId ? `${window.location.origin}/?room=${roomId}` : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AfyaSign Pairing',
          text: `Pair with my AfyaSign device using this link:`,
          url: pairingUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      pairingService.joinRoom(manualId.trim());
      setRoomId(manualId.trim());
      setIsPaired(true);
      setTimeout(() => onPaired(manualId.trim()), 1500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 flex items-center gap-4 border-b border-stone-200">
        <button 
          onClick={onBack}
          className="p-3 bg-stone-100 rounded-2xl text-stone-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t('Pair Devices', 'Oanisha Vifaa')}</h2>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('Secure Sync', 'Sawazisha kwa Usalama')}</p>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {isPaired ? (
            <motion.div 
              key="paired"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6"
            >
              <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 size={64} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-stone-900">{t('Devices Paired!', 'Vifaa Vimeunganishwa!')}</h3>
                <p className="text-stone-500 font-medium">{t('Redirecting to dashboard...', 'Inahamia kwenye dashibodi...')}</p>
              </div>
            </motion.div>
          ) : mode === 'select' ? (
            <motion.div 
              key="select"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="bg-blue-100 p-8 rounded-[3rem] text-blue-600 inline-block shadow-2xl shadow-blue-500/10">
                <LinkIcon size={64} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-stone-900">{t('Sync Doctor & Patient', 'Sawazisha Daktari na Mgonjwa')}</h3>
                <p className="text-stone-500 font-medium">{t('Choose how you want to pair these devices.', 'Chagua jinsi unavyotaka kuoanisha vifaa hivi.')}</p>
              </div>
              
              <div className="grid gap-4">
                <button 
                  onClick={handleGenerate}
                  className="group flex items-center gap-6 p-6 bg-white border-2 border-stone-100 rounded-[2rem] text-left hover:border-blue-500 transition-all shadow-sm active:scale-95"
                >
                  <div className="bg-blue-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <QrCode size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 uppercase tracking-tight">{t('I am the Doctor', 'Mimi ni Daktari')}</h4>
                    <p className="text-xs text-stone-400 font-bold">{t('Generate a QR code to scan', 'Tengeneza msimbo wa QR wa kuskani')}</p>
                  </div>
                </button>

                <button 
                  onClick={handleScan}
                  className="group flex items-center gap-6 p-6 bg-white border-2 border-stone-100 rounded-[2rem] text-left hover:border-emerald-500 transition-all shadow-sm active:scale-95"
                >
                  <div className="bg-emerald-600 p-4 rounded-2xl text-white group-hover:scale-110 transition-transform">
                    <Scan size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 uppercase tracking-tight">{t('I am the Patient', 'Mimi ni Mgonjwa')}</h4>
                    <p className="text-xs text-stone-400 font-bold">{t('Scan the Doctor\'s QR code', 'Skani msimbo wa QR wa Daktari')}</p>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : mode === 'generate' ? (
            <motion.div 
              key="generate"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm space-y-8"
            >
              <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-[12px] border-blue-50 inline-block">
                <QRCodeSVG value={pairingUrl} size={260} level="H" includeMargin={true} />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-stone-900">{t('Scan this Code', 'Skani Msimbo Huu')}</h3>
                  <p className="text-stone-500 font-medium">{t('Ask the patient to scan this large QR code. Ensure your screen brightness is high.', 'Mwombe mgonjwa askani msimbo huu mkubwa wa QR. Hakikisha mwangaza wa skrini yako ni mkubwa.')}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t('Room ID', 'Kitambulisho cha Chumba')}</p>
                  <p className="text-2xl font-black text-blue-900 tracking-tighter">{roomId}</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg shadow-blue-200"
                  >
                    <Share2 size={16} />
                    {t('Share Link', 'Shiriki Kiungo')}
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-stone-100 text-stone-600 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    {copied ? t('Copied!', 'Imenakiliwa!') : t('Copy Link', 'Nakili Kiungo')}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-blue-500 animate-pulse">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest">{t('Waiting for patient...', 'Inasubiri mgonjwa...') }</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="scan"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="relative">
                <div id="qr-reader" className="overflow-hidden rounded-[2.5rem] border-8 border-emerald-50 shadow-2xl" />
                <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-[2.5rem] pointer-events-none animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-stone-900">{t('Scanning...', 'Inaskani...') }</h3>
                <p className="text-stone-500 font-medium">{t('Point your camera at the Doctor\'s screen. Keep it steady.', 'Elekeza kamera yako kwenye skrini ya Daktari. Iweke imara.')}</p>
              </div>

              <div className="pt-4 border-t border-stone-200">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">{t('Or Enter ID Manually', 'Au Ingiza Kitambulisho kwa Mkono')}</p>
                <form onSubmit={handleManualJoin} className="flex gap-2">
                  <input 
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder={t('Enter Room ID', 'Ingiza ID')}
                    className="flex-1 px-4 py-3 bg-white border-2 border-stone-100 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                    {t('Join', 'Jiunge')}
                  </button>
                </form>
              </div>

              <button 
                onClick={() => setMode('select')}
                className="text-stone-400 font-bold uppercase tracking-widest text-xs hover:text-stone-600 transition-colors"
              >
                {t('Cancel', 'Ghairi')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-white border-t border-stone-100">
        <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-3xl border border-stone-200">
          <div className="bg-blue-500 p-3 rounded-2xl text-white">
            <Smartphone size={24} />
          </div>
          <p className="text-xs font-bold text-stone-600 leading-relaxed">
            {t('Pairing ensures that messages are sent instantly between devices on the same network.', 'Kuoanisha kunahakikisha kwamba ujumbe unatumwa papo hapo kati ya vifaa vilivyo kwenye mtandao mmoja.')}
          </p>
        </div>
      </div>
    </div>
  );
};
