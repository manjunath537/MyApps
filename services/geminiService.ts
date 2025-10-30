import { GoogleGenAI, Modality, Type } from "@google/genai";
import { HousePreferences, RoomDesign, Budget } from '../types';

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
          budgetEstimate: {
            type: Type.STRING,
            description: "A rough cost estimate for this specific room/area, in the local currency."
          }
        },
        required: ["area", "description", "budgetEstimate"],
      },
    },
    trendAnalysis: {
      type: Type.STRING,
      description: "A summary of current architectural and interior design trends for the specified country, relevant to the user's preferences. Provide actionable suggestions in a concise paragraph."
    },
    budget: {
        type: Type.OBJECT,
        properties: {
            overallEstimate: {
                type: Type.STRING,
                description: "The overall estimated cost range for the entire project in the local currency."
            },
            summary: {
                type: Type.STRING,
                description: "A brief summary of the main cost factors for this project."
            }
        },
        required: ["overallEstimate", "summary"]
    }
  },
  required: ["designs", "trendAnalysis", "budget"],
};

export const generateDesignsAndTrends = async (preferences: HousePreferences): Promise<{ designs: RoomDesign[], trendAnalysis: string, budget: Budget }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are a world-class architect, cultural design expert, and quantity surveyor specializing in the architecture of ${preferences.country}.
      Your task is to create a concept for a client's dream home based on their preferences.

      First, generate a detailed and inspiring description for each key area of the house: Exterior, Foyer, Living Room, Kitchen, Dining Room, Master Bedroom, and Master Bathroom.
      For each area, describe the architectural style, materials, color palette, furniture, lighting, and overall ambiance in a compelling way.
      Ensure the design is cohesive and reflects all the client's preferences, while masterfully integrating traditional motifs, local materials, and cultural nuances of ${preferences.country}.

      Second, provide a concise summary of current architectural and interior design trends in ${preferences.country} that are relevant to the client's preferences. This analysis should be a single paragraph and provide actionable suggestions.

      Third, provide a realistic budget projection for this project in the local currency of ${preferences.country}. This should include an overall estimated cost range (e.g., "$500,000 - $650,000 USD") and a brief summary of the main cost factors. For each individual room/area you describe, also provide a rough cost estimate.

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
    return parsedResponse as { designs: RoomDesign[], trendAnalysis: string, budget: Budget };

  } catch (error) {
    console.error("Error generating house design descriptions:", error);
    throw error;
  }
};

export const generateImageForDesign = async (designDescription: string, preferences: HousePreferences): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Generate a hyperrealistic, 8k resolution, architectural photograph of the following space: ${designDescription}.
            The image must be a wide-angle shot, capturing the entire room/space to give a comprehensive and impressive view.
            Style: ${preferences.style}, with authentic cultural influences from ${preferences.country}.
            Color Palette: ${preferences.colorPalette}.
            Lighting: Cinematic, natural light that beautifully illuminates the space, creating a bright, airy, and inviting atmosphere.
            Quality: Absolutely photorealistic, indistinguishable from a professional photograph taken for an elite architectural magazine like Architectural Digest. Rendered with V-Ray-like quality, focusing on intricate material textures, realistic shadows, and perfect light interaction.
            Composition: Ensure the entire space is visible. The camera angle should be chosen to make the room feel spacious and luxurious.
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
        throw error;
    }
};

export const changeImageColor = async (base64ImageData: string, mimeType: string, newColorPrompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: `Subtly and realistically change the primary color scheme of this room to incorporate tones of ${newColorPrompt}, while maintaining the original architecture, furniture, and overall photorealistic quality. Do not add or remove any objects.`,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image was returned from the color change request.");
  } catch (error) {
    console.error("Error changing image color:", error);
    throw error;
  }
};
