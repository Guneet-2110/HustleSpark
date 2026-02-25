'use server';
/**
 * @fileOverview Generates marketing prompts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateMarketingPromptsInputSchema = z.object({
  hustleName: z.string(),
  hustleDescription: z.string(),
});
export type GenerateMarketingPromptsInput = z.infer<typeof GenerateMarketingPromptsInputSchema>;

const GenerateMarketingPromptsOutputSchema = z.object({
  marketingPrompts: z.array(z.string()).length(3),
});
export type GenerateMarketingPromptsOutput = z.infer<typeof GenerateMarketingPromptsOutputSchema>;

export async function generateMarketingPrompts(input: GenerateMarketingPromptsInput): Promise<GenerateMarketingPromptsOutput> {
  const prompt = `Generate exactly 3 creative marketing prompts for the side hustle "${input.hustleName}". 
  These prompts should be usable on social media to attract customers.

  IMPORTANT: Respond ONLY with a raw JSON object. No markdown.
  { "marketingPrompts": ["Prompt 1", "Prompt 2", "Prompt 3"] }`;

  const response = await ai.generate({ prompt });

  try {
    const text = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return GenerateMarketingPromptsOutputSchema.parse(parsed);
  } catch (error) {
    console.error("AI Prompts Error:", response.text);
    throw new Error("Failed to generate marketing prompts.");
  }
}
