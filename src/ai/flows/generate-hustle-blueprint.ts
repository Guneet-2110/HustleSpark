'use server';
/**
 * @fileOverview Generates a comprehensive business blueprint using Gemini 1.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateHustleBlueprintInputSchema = z.object({
  hustleName: z.string(),
  hustleDescription: z.string(),
});
export type GenerateHustleBlueprintInput = z.infer<typeof GenerateHustleBlueprintInputSchema>;

const GenerateHustleBlueprintOutputSchema = z.object({
  pricingTip: z.string().describe('A professional, high-margin pricing strategy tip.'),
  marketingIdea: z.string().describe('A creative, high-impact marketing idea to get the first 5 customers.'),
  flyerText: z.string().describe('A punchy, minimal-text headline and sub-headline for a promotional flyer.'),
});
export type GenerateHustleBlueprintOutput = z.infer<typeof GenerateHustleBlueprintOutputSchema>;

const blueprintPrompt = ai.definePrompt({
  name: 'blueprintPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateHustleBlueprintInputSchema },
  output: { schema: GenerateHustleBlueprintOutputSchema },
  prompt: `You are an elite business consultant. For the side hustle "{{{hustleName}}}" ({{{hustleDescription}}}), generate a strategic blueprint.
    
    Generate the following:
    1. A professional, high-margin pricing strategy tip.
    2. A creative, high-impact marketing idea to get the first 5 customers.
    3. A punchy, minimal-text headline and sub-headline for a promotional flyer.`,
});

export async function generateHustleBlueprint(input: GenerateHustleBlueprintInput): Promise<GenerateHustleBlueprintOutput> {
  const { output } = await blueprintPrompt(input);
  if (!output) throw new Error("The AI strategist is busy. Please try again in a moment.");
  return output;
}
