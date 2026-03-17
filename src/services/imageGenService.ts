import { GoogleGenAI } from "@google/genai";
import { DICTIONARY_DATA } from "../data/dictionaryData";
import { generateTSLDescription } from "./geminiService";
import { withRetry } from "./apiUtils";

export async function generateSignIllustration(word: string, description?: string): Promise<string | null> {
  try {
    // Create a new instance right before the call to use the latest key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set");
      return null;
    }
    const ai = new GoogleGenAI({ apiKey });

    // Try to get a description if not provided
    let finalDescription = description;
    if (!finalDescription) {
      const found = DICTIONARY_DATA.find(
        entry => entry.word.toLowerCase() === word.toLowerCase() || 
                 entry.wordSwahili.toLowerCase() === word.toLowerCase()
      );
      if (found) {
        finalDescription = `Sign for ${word}: ${found.description}`;
      } else {
        // Fallback to AI generated description
        finalDescription = await generateTSLDescription(word);
      }
    }

    const prompt = `A professional medical avatar (doctor or nurse) performing a sign language gesture for: "${word}". Context: ${finalDescription}. Style: 3D rendered, friendly, minimalist, clean background, high quality. Focus on upper body and hands.`;

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });
    }, 3, 2000); // 3 retries, starting with 2s delay

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    // If it's a quota error, we might want to reset the key selection state in the app
    // but we can't do that easily from here. The UI will catch the error.
    if (error?.message?.includes('429') || error?.status === 429 || JSON.stringify(error).includes('429')) {
      throw new Error("Quota exceeded. Please ensure you have a paid API key connected.");
    }
    return null;
  }
}

export async function generateProfileAvatar(name: string, role: string): Promise<string | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `A professional profile picture of a ${role === 'professional' ? 'doctor' : 'patient'} named ${name} from Tanzania. Style: 3D rendered, friendly, minimalist, clean background, high quality. The person should look approachable and professional.`;

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });
    }, 2, 2000);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating profile avatar:", error);
    return null;
  }
}

export async function generateCustomAvatar(prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });
    }, 2, 2000);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating custom avatar:", error);
    return null;
  }
}
