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
  pricingTip: z.string(),
  marketingIdea: z.string(),
  flyerText: z.string(),
});
export type GenerateHustleBlueprintOutput = z.infer<typeof GenerateHustleBlueprintOutputSchema>;

export async function generateHustleBlueprint(input: GenerateHustleBlueprintInput): Promise<GenerateHustleBlueprintOutput> {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are an elite business consultant. For the side hustle "${input.hustleName}" (${input.hustleDescription}), generate a strategic blueprint.
    
    REQUIRED OUTPUT:
    1. A professional, high-margin pricing strategy tip.
    2. A creative, high-impact marketing idea to get the first 5 customers.
    3. A punchy, minimal-text headline and sub-headline for a promotional flyer.

    IMPORTANT: Respond ONLY with a raw JSON object. No markdown, no backticks, no explanations.
    {
      "pricingTip": "Elite consulting advice on pricing...",
      "marketingIdea": "Actionable marketing strategy...",
      "flyerText": "Punchy Headline: Short Sub-headline"
    }`,
  });

  try {
    const text = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return GenerateHustleBlueprintOutputSchema.parse(parsed);
  } catch (error) {
    console.error("AI Blueprint Error:", response.text);
    throw new Error("The AI strategist is busy. Please try again in a moment.");
  }
}
