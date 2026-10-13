import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const forceDemoMode = process.env.AI_DEMO_MODE === 'true';

export function isAIAvailable(): boolean {
  return !forceDemoMode && apiKey.trim().length > 0;
}

export function getAIClient(): GoogleGenAI | null {
  if (!isAIAvailable()) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export function getAIModelName(): string {
  return modelName;
}
