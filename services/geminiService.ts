import { GoogleGenAI, Type } from "@google/genai";
import { HousePreferences, RoomDesign } from '../types';

// IMPORTANT: In a real application, the API key would be handled on a secure backend.
// Here we assume it's available as an environment variable.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const descriptionAndTrendsSchema = {
  type: Type.OBJECT,
  properties: {
    designs: {
      type: Type.ARRAY,
      description: "A list of detailed descriptions for each area of the house.",
      items: {
        type: Type.OBJECT,
        properties: {
          area: {
            type: Type.STRING,
            description: "The name of the house area, e.g., 'Exterior', 'Living Room', 'Kitchen'.",
          },
          description: {
            type: Type.STRING,
            description: "A detailed, evocative description of this specific area of the house, incorporating cultural and stylistic elements.",
          },
        },
        required: ["area", "description"],
      },
    },
    trendAnalysis: {
      type: Type.STRING,
      description: "A summary of current architectural and interior design trends for the specified country, relevant to the user's preferences. Provide actionable suggestions in a concise paragraph."
    }
  },
  required: ["designs", "trendAnalysis"],
};

export const generateDesignsAndTrends = async (preferences: HousePreferences): Promise<{ designs: RoomDesign[], trendAnalysis: string }> => {
  try {
    const prompt = `
      You are a world-class architect and cultural design expert specializing in the architecture of ${preferences.country}.
      Your task is to create a concept for a client's dream home based on their preferences.

      First, generate a detailed and inspiring description for each key area of the house: Exterior, Foyer, Living Room, Kitchen, Dining Room, Master Bedroom, and Master Bathroom.
      For each area, describe the architectural style, materials, color palette, furniture, lighting, and overall ambiance in a compelling way.
      Ensure the design is cohesive and reflects all the client's preferences, while masterfully integrating traditional motifs, local materials, and cultural nuances of ${preferences.country}.

      Second, provide a concise summary of current architectural and interior design trends in ${preferences.country} that are relevant to the client's preferences. This analysis should be a single paragraph and provide actionable suggestions.

      Client Preferences:
      ${JSON.stringify(preferences, null, 2)}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: descriptionAndTrendsSchema,
      },
    });

    const parsedResponse = JSON.parse(result.text);
    return parsedResponse as { designs: RoomDesign[], trendAnalysis: string };

  } catch (error) {
    console.error("Error generating house design descriptions:", error);
    throw new Error("Failed to generate house design descriptions. Please check your API key and connection.");
  }
};

export const generateImageForDesign = async (designDescription: string, preferences: HousePreferences): Promise<string> => {
    try {
        const prompt = `
            Create a photorealistic, ultra-high-quality architectural visualization.
            The design must reflect the '${preferences.style}' architectural style as interpreted in ${preferences.country}.
            Incorporate elements appropriate for the culture and climate of ${preferences.country}.
            Color Palette: ${preferences.colorPalette}.
            Description for this specific area: ${designDescription}.
            The image should be bright, inviting, and look like a professional architectural rendering from a top design magazine. Use cinematic lighting and 8k resolution detail.
        `;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '16:9'
            }
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        // Return a placeholder or throw an error
        return "https://picsum.photos/1920/1080";
    }
};

const dataUrlToBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

export const generateVideoForDesign = async (designDescription: string, preferences: HousePreferences, imageB64DataUrl: string): Promise<string> => {
    try {
        if (!window.aistudio || !await window.aistudio.hasSelectedApiKey()) {
            throw new Error("API key not selected. Please select an API key to generate videos.");
        }

        const aiWithUserKey = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            Create a cinematic, photorealistic 3D fly-through video of this space, which is located in ${preferences.country}.
            The style should be ${preferences.style} with a ${preferences.colorPalette} color palette, respecting the local culture.
            The video should start from the provided image and slowly pan around the room, showing more details based on this description: ${designDescription}.
            Make it feel like a professional architectural visualization video. Keep it short, around 5-7 seconds.
        `;
        
        const imageBytes = dataUrlToBase64(imageB64DataUrl);

        let operation = await aiWithUserKey.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: imageBytes,
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Polling for the result
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await aiWithUserKey.operations.getVideosOperation({ operation: operation });
        }

        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
            const downloadLink = operation.response.generatedVideos[0].video.uri;
            const videoUrlWithKey = `${downloadLink}&key=${process.env.API_KEY}`;
            
            const response = await fetch(videoUrlWithKey);
            if (!response.ok) {
                throw new Error(`Failed to fetch video: ${response.statusText}`);
            }
            const videoBlob = await response.blob();
            return URL.createObjectURL(videoBlob);
        } else {
            throw new Error("Video generation completed, but no video URI was returned.");
        }

    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
          throw new Error("Your API key is invalid or lacks permissions. Please select a valid key and try again.");
        }
        throw new Error("Failed to generate video. This is an experimental feature and may not always succeed.");
    }
};