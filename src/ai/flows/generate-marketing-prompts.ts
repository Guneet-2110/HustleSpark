'use server';
/**
 * @fileOverview Generates creative marketing prompts using structured AI output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMarketingPromptsInputSchema = z.object({
  hustleName: z.string(),
  hustleDescription: z.string(),
});
export type GenerateMarketingPromptsInput = z.infer<typeof GenerateMarketingPromptsInputSchema>;

const GenerateMarketingPromptsOutputSchema = z.object({
  marketingPrompts: z.array(z.string()).length(3),
});
export type GenerateMarketingPromptsOutput = z.infer<typeof GenerateMarketingPromptsOutputSchema>;

const marketingPromptsPrompt = ai.definePrompt({
  name: 'marketingPromptsPrompt',
  input: { schema: GenerateMarketingPromptsInputSchema },
  output: { schema: GenerateMarketingPromptsOutputSchema },
  prompt: `Generate exactly 3 high-conversion, creative marketing prompts for the side hustle "{{{hustleName}}}". 
  Context: {{{hustleDescription}}}
  
  These prompts should be designed for social media (Instagram/TikTok/X) to attract initial customers.`,
});

export async function generateMarketingPrompts(input: GenerateMarketingPromptsInput): Promise<GenerateMarketingPromptsOutput> {
  const { output } = await marketingPromptsPrompt(input);
  if (!output) throw new Error("Failed to generate marketing prompts. Please try again.");
  return output;
}
