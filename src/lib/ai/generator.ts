import { getAIClient, getAIModelName, isAIAvailable } from './client';
import { buildPlanGenerationPrompt } from './prompts';
import { generateDemoPlan } from './demo-provider';
import { PlanGenerationInput, AIGeneratedPlan, aiGeneratedPlanSchema } from '../validations';

export async function generatePreparationPlan(
  input: PlanGenerationInput
): Promise<AIGeneratedPlan & { isDemo: boolean }> {
  // If no AI key or demo mode forced, immediately use demo provider
  if (!isAIAvailable()) {
    const plan = generateDemoPlan(input);
    return { ...plan, isDemo: true };
  }

  const aiClient = getAIClient();
  if (!aiClient) {
    const plan = generateDemoPlan(input);
    return { ...plan, isDemo: true };
  }

  const prompt = buildPlanGenerationPrompt(input);
  const preferredModel = getAIModelName();
  const modelsToTry = Array.from(
    new Set([preferredModel, 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash-lite'])
  );

  for (const model of modelsToTry) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(responseText);
      const validated = aiGeneratedPlanSchema.parse(parsed);

      return {
        ...validated,
        isDemo: false,
        aiDisclaimer: `Generated dynamically via Google Gemini API (${model}) with structured schema validation.`,
      };
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed:`, err.message || err);
    }
  }

  console.warn('All Gemini model attempts failed or timed out. Falling back to deterministic demo plan.');
  const fallback = generateDemoPlan(input);
  return {
    ...fallback,
    isDemo: true,
    aiDisclaimer: 'Switched to Demo Mode fallback: The live AI service could not be reached or returned an invalid schema.',
  };
}
