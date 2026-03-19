'use server';
/**
 * @fileOverview Generates a comprehensive business blueprint using Gemini 2.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateHustleBlueprintInputSchema = z.object({
  hustleName: z.string(),
  hustleDescription: z.string(),
});
export type GenerateHustleBlueprintInput = z.infer<typeof GenerateHustleBlueprintInputSchema>;

const GenerateHustleBlueprintOutputSchema = z.object({
  aboutUs: z.string().describe('A compelling brand story and origin for the business.'),
  whatWeDo: z.string().describe('Detailed description of the services and value provided.'),
  ourGoal: z.string().describe('The core mission and impact the venture aims to achieve.'),
  pricingTip: z.string().describe('A professional, high-margin pricing strategy tip.'),
  marketingIdea: z.string().describe('A creative, high-impact marketing idea to get the first 5 customers.'),
  flyerText: z.string().describe('A punchy, minimal-text headline and sub-headline for a promotional flyer.'),
});
export type GenerateHustleBlueprintOutput = z.infer<typeof GenerateHustleBlueprintOutputSchema>;

const blueprintPrompt = ai.definePrompt({
  name: 'blueprintPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateHustleBlueprintInputSchema },
  output: { schema: GenerateHustleBlueprintOutputSchema },
  prompt: `You are an elite business consultant. For the side hustle "{{{hustleName}}}" ({{{hustleDescription}}}), generate a strategic blueprint.
    
    Generate the following specifically:
    1. "About Us": A professional and inspiring brand story.
    2. "What We Do": A clear breakdown of the services or products.
    3. "Our Goal": The primary mission and purpose of the brand.
    4. A professional, high-margin pricing strategy tip.
    5. A creative, high-impact marketing idea to get the first 5 customers.
    6. A punchy, minimal-text headline and sub-headline for a promotional flyer.`,
});

export async function generateHustleBlueprint(input: GenerateHustleBlueprintInput): Promise<GenerateHustleBlueprintOutput> {
  const { output } = await blueprintPrompt(input);
  if (!output) throw new Error("The AI strategist is busy. Please try again in a moment.");
  return output;
}
