import { GoogleGenAI } from "@google/genai";
import { withRetry } from "./apiUtils";

export async function generateSignVideo(word: string, description?: string): Promise<string | null> {
  try {
    // Check if user has selected an API key (required for Veo)
    if (typeof window !== 'undefined' && window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        console.warn("No API key selected for Veo video generation");
        return null;
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `A professional medical avatar (doctor or nurse) clearly performing a Tanzanian Sign Language (TSL) gesture for the instruction: "${word}". ${description ? `Movement: ${description}.` : ''} The background is a clean, minimalist hospital setting. The lighting is bright and professional. The avatar is friendly and focused on the camera. High quality 3D animation style.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '1:1'
      }
    });

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max (10s intervals)
    
    while (!operation.done && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      attempts++;
    }

    if (!operation.done) {
      console.error("Video generation timed out");
      return null;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    // Fetch the video with the API key
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) throw new Error("Failed to download video");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating video:", error);
    return null;
  }
}
