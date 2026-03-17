import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Adds a WAV header to raw PCM data so it can be played by the browser.
 * Gemini 2.5 TTS returns raw PCM (16-bit, Mono, 24kHz).
 */
function createWavUrl(base64Pcm: string, sampleRate: number = 24000): string {
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = Mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * blockAlign)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channelCount * bytesPerSample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, len, true);

  // Write PCM data
  for (let i = 0; i < len; i++) {
    view.setUint8(44 + i, binaryString.charCodeAt(i));
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export async function playPronunciation(text: string): Promise<void> {
  // Check if we should use Gemini TTS
  const isOnline = navigator.onLine;
  const apiKey = process.env.GEMINI_API_KEY;
  const useGeminiTts = isOnline && !!apiKey && !window.location.hostname.includes('localhost');

  if (useGeminiTts) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioUrl = createWavUrl(base64Audio);
        const audio = new Audio(audioUrl);
        
        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = (e) => {
            URL.revokeObjectURL(audioUrl);
            reject(e);
          };
          audio.play().catch(reject);
        });
      }
    } catch (error) {
      // Log but don't crash, we have a fallback
      console.warn("Gemini TTS failed, falling back to browser speech:", error);
    }
  }

  // Fallback to browser's native TTS
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Detect language (simple heuristic)
      // Swahili often has many 'a', 'e', 'i', 'o', 'u' and specific words
      const swahiliWords = ['nina', 'wewe', 'yeye', 'sisi', 'nini', 'hapa', 'kuna', 'ndiyo', 'hapana', 'maumivu', 'kichwa', 'tumbo'];
      const isSwahili = swahiliWords.some(word => text.toLowerCase().includes(word)) || 
                        /[aeiou]{2,}/.test(text.toLowerCase()); // Swahili has many vowels

      utterance.lang = isSwahili ? 'sw-TZ' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Resolve anyway to not block

      window.speechSynthesis.speak(utterance);
    } else {
      resolve();
    }
  });
}
