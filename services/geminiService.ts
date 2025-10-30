
import { GoogleGenAI, Type } from "@google/genai";
import { HousePreferences, RoomDesign } from '../types';

// IMPORTANT: In a real application, the API key would be handled on a secure backend.
// Here we assume it's available as an environment variable.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const descriptionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      area: {
        type: Type.STRING,
        description: "The name of the house area, e.g., 'Exterior', 'Living Room', 'Kitchen'.",
      },
      description: {
        type: Type.STRING,
        description: "A detailed, evocative description of this specific area of the house.",
      },
    },
    required: ["area", "description"],
  },
};

export const generateHouseDesigns = async (preferences: HousePreferences): Promise<RoomDesign[]> => {
  try {
    const prompt = `
      You are an world-class architect and interior designer creating a concept for a client's dream home.
      Based on the following JSON preferences, generate a detailed and inspiring description for each key area of the house.
      The areas should include: Exterior, Foyer, Living Room, Kitchen, Dining Room, Master Bedroom, and Master Bathroom.
      For each area, describe the architectural style, materials, color palette, furniture, lighting, and overall ambiance in a compelling way.
      Ensure the design is cohesive and reflects all the client's preferences.

      Client Preferences:
      ${JSON.stringify(preferences, null, 2)}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: descriptionSchema,
      },
    });

    const parsedResponse = JSON.parse(result.text);
    return parsedResponse as RoomDesign[];

  } catch (error) {
    console.error("Error generating house design descriptions:", error);
    throw new Error("Failed to generate house design descriptions. Please check your API key and connection.");
  }
};

export const generateImageForDesign = async (designDescription: string, preferences: HousePreferences): Promise<string> => {
    try {
        const prompt = `
            Create a photorealistic, ultra-high-quality architectural visualization.
            Style: ${preferences.style}.
            Color Palette: ${preferences.colorPalette}.
            Description: ${designDescription}.
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
