import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

export interface Activity {
  id: string;
  title: string;
  instructions: string[];
  supplies: string[];
  safety: string;
  messLevel: "Low" | "Medium" | "Messy";
  benefit: string;
  ageGroup: string;
}

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure it is set in your environment secrets.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateActivities(params: {
  age: string;
  time: string;
  energy: string;
  location: string;
  effort: string;
  noSupplies: boolean;
  independent: boolean;
}): Promise<Activity[]> {
  const ai = getAI();
  const prompt = `Quickly generate 5 toddler activities for ${params.age}.
    Context: ${params.time}, ${params.energy} energy, ${params.location}, ${params.effort} effort.
    Modes: NoSupplies=${params.noSupplies}, Independent=${params.independent}.
    JSON array: title, instructions(3-5), supplies, safety, messLevel(Low/Medium/Messy), benefit, ageGroup.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              supplies: { type: Type.ARRAY, items: { type: Type.STRING } },
              safety: { type: Type.STRING },
              messLevel: { type: Type.STRING },
              benefit: { type: Type.STRING },
              ageGroup: { type: Type.STRING },
            },
            required: ["title", "instructions", "supplies", "safety", "messLevel", "benefit", "ageGroup"],
          },
        },
      },
    });

    const activities = JSON.parse(response.text || "[]");
    return activities.map((a: any) => ({
      ...a,
      id: Math.random().toString(36).substr(2, 9),
    }));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate activities. Please try again.");
  }
}

export async function generateMeltdownActivity(): Promise<Activity> {
  const ai = getAI();
  const prompt = `Quickly generate 1 toddler meltdown calming activity. JSON: title, instructions(3), supplies, safety, messLevel, benefit, ageGroup.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            supplies: { type: Type.ARRAY, items: { type: Type.STRING } },
            safety: { type: Type.STRING },
            messLevel: { type: Type.STRING },
            benefit: { type: Type.STRING },
            ageGroup: { type: Type.STRING },
          },
          required: ["title", "instructions", "supplies", "safety", "messLevel", "benefit", "ageGroup"],
        },
      },
    });

    const activity = JSON.parse(response.text || "{}");
    return {
      ...activity,
      id: "meltdown-" + Date.now(),
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate calming activity.");
  }
}
