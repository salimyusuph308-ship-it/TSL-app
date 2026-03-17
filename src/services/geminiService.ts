import { GoogleGenAI } from "@google/genai";
import { withRetry } from "./apiUtils";

const SYSTEM_INSTRUCTION = `Wewe ni msaidizi wa AI maalum wa mazungumzo ya afya kwa watumiaji wa Lugha ya Alama ya Tanzania (TSL / Lugha ya Alama Tanzania). Lugha yako kuu na ya msingi ni Kiswahili – tumia Kiswahili kila wakati kwa maelezo, maelekezo, na majibu ya maandishi. Usitumie Kiingereza isipokuwa kama maelezo ya ziada yanahitajika.

Kanuni muhimu:
1. Input inaweza kuwa: 
   - Maandishi ya Kiswahili (kutoka kwa daktari au mgonjwa anayesema/kuandika).
   - Au maelezo ya ishara za TSL (kama app ina camera recognition, tumia maelezo kama "mgonjwa ameonyesha ishara ya 'kichwa kinaniuma'").

2. Output lazima iwe:
   - Kiswahili rahisi na wazi (kwa maandishi na sauti ikiwa inahitajika).
   - Maelezo ya ishara za TSL kwa kila sentensi muhimu (tumia muundo huu: "Ishara ya TSL: [maelezo mafupi ya ishara, k.m. mkono wa kulia karibu na kichwa + sura ya maumivu]").
   - Ikiwa inawezekana, pendekeza avatar au video ya ishara (k.m. "Avatar aonyeshe ishara hii polepole").

3. Muktadha: Mazungumzo ya afya tu (dalili, maumivu, dawa, hospitali, daktari, maagizo ya dawa, dharura, n.k.). Kuwa na huruma, sahihi, na salama. Usitoe ushauri wa kimatibabu – sema "Tafadhali wasiliana na daktari kwa uchunguzi sahihi."

4. Muundo wa majibu:
   - Kwanza: Tafsiri / ufahamu wa input kwa Kiswahili.
   - Pili: Majibu au swali linalofuata kwa Kiswahili.
   - Tatu: Maelezo ya ishara za TSL zinazohusiana (k.m. kwa sentensi muhimu).
   - Nne: Pendekeza hatua zaidi au maneno muhimu ya afya.

Mifano ya maneno ya kawaida ya afya (tumia hii kama msingi wa TSL):
- Nina homa → Ishara ya TSL: Mkono wa mbele forehead + sura ya joto / uchovu.
- Kichwa kinaniuma → Ishara ya TSL: Mkono wa kulia karibu na kichwa + ishara ya maumivu (kukunja uso).
- Nina maumivu ya tumbo → Ishara ya TSL: Mkono kwenye tumbo + sura ya maumivu.
- Nina kikohozi → Ishara ya TSL: Mkono mbele mdomo + ishara ya kukohoa.
- Dawa → Ishara ya TSL: Mkono kama kunywa kidonge au sindano.
- Daktari → Ishara ya TSL: Mkono karibu na sikio + ishara ya stethoscope.
- Hospitali → Ishara ya TSL: Mkono kama jengo + ishara ya kitanda au msalaba.

Kwa input yoyote, jibu kwa Kiswahili pekee kama lugha kuu, na uongeze maelezo ya TSL ili app iweze kuonyesha avatar au video. Kuwa mfupi, wazi, na msaidizi sana kwa mgonjwa au mhudumu wa afya.`;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please connect your API key.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function translateSignLanguage(base64Image: string) {
  try {
    const ai = getAI();
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: "Tafsiri ishara hii ya Lugha ya Alama ya Tanzania (TSL) inayohusiana na afya. Jibu kwa neno moja au sentensi fupi sana ya Kiswahili pekee (k.m. 'Ninaumwa tumbo', 'Homa', 'Daktari'). Ikiwa huwezi kuitambua, jibu 'Sijui'.",
            },
          ],
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.4,
        },
      });
    });

    return response.text?.trim() || "Sijui";
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    if (error?.message?.includes('429')) {
      return "Quota exceeded. Check API key.";
    }
    return "Sijui";
  }
}

export async function chatWithDoctor(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history,
    });

    const result = await withRetry(async () => {
      return await chat.sendMessage({ message: message });
    });
    return result.text;
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    if (error?.message?.includes('429')) {
      return "Samahani, tumefikia kikomo cha matumizi ya AI kwa sasa. Tafadhali hakikisha umeunganisha API key yako.";
    }
    return "Samahani, kuna tatizo la kiufundi. Tafadhali jaribu tena baadae.";
  }
}

export async function generateTSLDescription(word: string) {
  try {
    const ai = getAI();
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Describe how to sign the word "${word}" in Tanzanian Sign Language (TSL). Provide a brief, one-sentence description of the hand movements and facial expressions. Format your response exactly like this: "Sign for ${word}: [description]".`,
        config: {
          temperature: 0.2,
        },
      });
    });
    return response.text?.trim() || `Sign for ${word}: [No description available]`;
  } catch (error) {
    console.error("Error generating TSL description:", error);
    return `Sign for ${word}: [Error generating description]`;
  }
}

export async function analyzeSymptoms(patientData: any) {
  try {
    const ai = getAI();
    const prompt = `Wewe ni msaidizi wa AI wa matibabu (Medical AI Assistant). Chambua data ifuatayo ya mgonjwa na utoe:
1. Muhtasari wa hali ya mgonjwa (Patient Summary).
2. Uwezekano wa utambuzi (Differential Diagnosis) - orodhesha 3-5 uwezekano.
3. Mapendekezo ya vipimo vya ziada (Recommended Tests).
4. Ishara za hatari (Red Flags) zinazohitaji dharura.
5. Onyo kali (Disclaimer): "Huu si ushauri wa kitaalamu wa matibabu. Tafadhali mshauri daktari mara moja."

Data ya Mgonjwa:
${JSON.stringify(patientData, null, 2)}

Jibu kwa Kiswahili pekee, ukitumia muundo wa kitaalamu lakini rahisi kueleweka. Tumia Markdown kwa muundo mzuri.`;

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3,
        },
      });
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini Symptom Analysis Error:", error);
    return "Samahani, imeshindwa kuchambua dalili kwa sasa. Tafadhali jaribu tena baadae.";
  }
}
