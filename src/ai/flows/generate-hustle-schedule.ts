'use server';
/**
 * @fileOverview Generates a 4-week daily action plan using Gemini 2.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateHustleScheduleInputSchema = z.object({
  hustleName: z.string(),
  hustleDescription: z.string(),
});
export type GenerateHustleScheduleInput = z.infer<typeof GenerateHustleScheduleInputSchema>;

const GenerateHustleScheduleOutputSchema = z.object({
  week1: z.array(z.string()).length(7),
  week2: z.array(z.string()).length(7),
  week3: z.array(z.string()).length(7),
  week4: z.array(z.string()).length(7),
});
export type GenerateHustleScheduleOutput = z.infer<typeof GenerateHustleScheduleOutputSchema>;

export async function generateHustleSchedule(input: GenerateHustleScheduleInput): Promise<GenerateHustleScheduleOutput> {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Create a professional 4-week daily action plan to launch the side hustle "${input.hustleName}" (${input.hustleDescription}).
  
    Each week must focus on a specific phase:
    Week 1: Setup & Foundations
    Week 2: Product & Pricing Development
    Week 3: Aggressive Marketing & Outreach
    Week 4: Launch & Scaling

    Provide exactly 7 specific, actionable daily tasks for each of the 4 weeks.

    IMPORTANT: Respond ONLY with a raw JSON object. No markdown, no explanations.
    {
      "week1": ["Day 1 task", "Day 2 task", ...],
      "week2": ["Day 1 task", ...],
      "week3": ["Day 1 task", ...],
      "week4": ["Day 1 task", ...]
    }`,
  });

  try {
    const text = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return GenerateHustleScheduleOutputSchema.parse(parsed);
  } catch (error) {
    console.error("AI Schedule Error:", response.text);
    throw new Error("Could not generate your launch plan. Please try again.");
  }
}
