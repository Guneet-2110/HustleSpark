'use server';
/**
 * @fileOverview Generates a 4-week daily action plan using Gemini 1.5 Pro.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateHustleScheduleInputSchema = z.object({
  hustleName: z.string(),
  hustleDescription: z.string(),
});
export type GenerateHustleScheduleInput = z.infer<typeof GenerateHustleScheduleInputSchema>;

const GenerateHustleScheduleOutputSchema = z.object({
  week1: z.array(z.string()).length(7).describe('7 specific daily tasks for Setup & Foundations.'),
  week2: z.array(z.string()).length(7).describe('7 specific daily tasks for Product & Pricing Development.'),
  week3: z.array(z.string()).length(7).describe('7 specific daily tasks for Aggressive Marketing & Outreach.'),
  week4: z.array(z.string()).length(7).describe('7 specific daily tasks for Launch & Scaling.'),
});
export type GenerateHustleScheduleOutput = z.infer<typeof GenerateHustleScheduleOutputSchema>;

const schedulePrompt = ai.definePrompt({
  name: 'schedulePrompt',
  model: 'googleai/gemini-1.5-pro',
  input: { schema: GenerateHustleScheduleInputSchema },
  output: { schema: GenerateHustleScheduleOutputSchema },
  prompt: `Create a professional 4-week daily action plan to launch the side hustle "{{{hustleName}}}" ({{{hustleDescription}}}).
  
    Focus on these phases:
    Week 1: Setup & Foundations
    Week 2: Product & Pricing Development
    Week 3: Aggressive Marketing & Outreach
    Week 4: Launch & Scaling

    Provide exactly 7 specific, actionable daily tasks for each of the 4 weeks.`,
});

export async function generateHustleSchedule(input: GenerateHustleScheduleInput): Promise<GenerateHustleScheduleOutput> {
  const { output } = await schedulePrompt(input);
  if (!output) throw new Error("Could not generate your launch plan. Please try again.");
  return output;
}
