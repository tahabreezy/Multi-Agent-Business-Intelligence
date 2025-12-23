
import { GoogleGenAI, Type } from "@google/genai";
import { AgentType, Verdict, ClarifyingQuestions } from "./types";

const API_KEY = process.env.API_KEY || "";

export const generateAgentResponse = async (
  type: AgentType,
  idea: string,
  location: string,
  context?: string
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  let systemInstruction = "";
  let prompt = "";
  let model = "gemini-3-flash-preview";
  let tools: any[] = [];
  let responseMimeType: string | undefined = undefined;
  let responseSchema: any = undefined;
  let thinkingConfig: any = undefined;

  switch (type) {
    case AgentType.OPTIMIST:
      systemInstruction = "You are the 'Eternal Optimist'. Find growth, scalability, and massive upside.";
      prompt = `Analyze: "${idea}" in "${location}". Focus on why it WILL work. (200 words max)`;
      break;
    case AgentType.SKEPTIC:
      systemInstruction = "You are the 'Ruthless Skeptic'. Focus on unit economic failures and market risks.";
      prompt = `Critique: "${idea}" in "${location}". Context: ${context}. Identify 3 ways this goes bankrupt.`;
      break;
    case AgentType.SOCIAL_LISTENER:
      systemInstruction = "You are the 'Social Media Listener'. Monitor TikTok, Twitter, and Reddit trends for this industry.";
      prompt = `Search for current social sentiment and viral trends related to "${idea}" in "${location}". Is this "trending" or "cringe"? Provide a data-driven pulse check.`;
      tools = [{ googleSearch: {} }];
      break;
    case AgentType.AD_ANALYST:
      systemInstruction = "You are the 'Ad-Spend Analyst'. Estimate Customer Acquisition Cost (CAC) using Google Ads metrics.";
      prompt = `Search for estimated CPC (Cost Per Click) and competition levels for keywords related to "${idea}" in "${location}". Estimate CAC for a startup in this space.`;
      tools = [{ googleSearch: {} }];
      break;
    case AgentType.JUDGE:
      systemInstruction = "You are the 'Pragmatic Judge'. Synthesize all inputs. Use Google Search for the final grounding.";
      prompt = `Final Synthesis for "${idea}" in "${location}". 
      Inputs: ${context}
      Provide a structured verdict including social sentiment and ad estimates.`;
      tools = [{ googleSearch: {} }];
      responseMimeType = "application/json";
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          viabilityScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          keyRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
          socialSentiment: { type: Type.STRING },
          estimatedCAC: { type: Type.STRING },
        },
        required: ["viabilityScore", "summary", "keyRisks", "keyOpportunities", "marketTrends", "socialSentiment", "estimatedCAC"],
      };
      break;
    case AgentType.SUPREME_COURT:
      model = "gemini-3-pro-preview";
      systemInstruction = "You are the 'Supreme Court of Business'. Use deep chain-of-thought logic to break ties and provide the definitive strategic ruling.";
      prompt = `RULING REQUIRED: Deeply analyze the conflict between the Optimist, Skeptic, and Analysts for the project "${idea}". 
      Context: ${context}
      What is the final, logically superior path forward?`;
      thinkingConfig = { thinkingBudget: 16000 };
      break;
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      tools,
      responseMimeType,
      responseSchema,
      thinkingConfig,
    },
  });

  if (type === AgentType.JUDGE) {
    const verdict: Verdict = JSON.parse(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Market Source",
        uri: chunk.web?.uri || "",
      }))
      .filter((s: any) => s.uri) || [];
    return { ...verdict, sources };
  }
  
  return response.text;
};

export const generateClarifyingQuestions = async (idea: string, location: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the business idea "${idea}" in "${location}", generate 3 critical clarifying questions that a high-end consultant would ask to determine feasibility.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["questions"]
      }
    }
  });
  
  const data: ClarifyingQuestions = JSON.parse(response.text || '{"questions": []}');
  return data.questions;
};
