const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_MODEL = 'gemini-2.5-flash';

const MATCH_SYSTEM_PROMPT = `You are a football match finder AI assistant.
Your job is to briefly analyze the user's query and explain in 2-3 concise sentences what criteria you're using to find suitable matches (time, location, format, skill level, etc.).
Be conversational, analytical and helpful. Respond in the same language as the user's query (Vietnamese or English).
Do NOT list actual matches — just explain your reasoning process.`;

const PLAYER_SYSTEM_PROMPT = `You are a football player finder AI assistant.
Your job is to briefly analyze the user's query and explain in 2-3 concise sentences what criteria you're using to find suitable players (position, ELO, win streak, community score, availability, etc.).
Be conversational, analytical and helpful. Respond in the same language as the user's query (Vietnamese or English).
Do NOT list actual players — just explain your reasoning process.`;

export type GeminiMode = 'match' | 'player';

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);



export async function getAIThinkingText(
  query: string,
  mode: GeminiMode,
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const systemPrompt = mode === 'match' ? MATCH_SYSTEM_PROMPT : PLAYER_SYSTEM_PROMPT;
  const fullPrompt = `${systemPrompt}\n\nUser query: "${query}"`; 
  try {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL , 
    generationConfig: {
      temperature: 1, 
      maxOutputTokens: 800,
    },  
   });

  const results = await model.generateContent(fullPrompt);
  const response = results.response;
  if (!response) return null;
  const text = response.text();
  return text?.trim() || null;
  } catch (error) {
    console.log('error Gemini', error);
    return null;
  }
}
