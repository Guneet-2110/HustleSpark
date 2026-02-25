'use server';
/**
 * @fileOverview Generates personalized side hustle ideas using Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const HustleTrackerDataSchema = z.object({
  status: z.enum(['Not Started', 'In Progress', 'Launched']).optional().default('Not Started'),
  earningsGoal: z.number().optional().default(1000),
  launchDate: z.date().nullable().optional().default(null),
  progress: z.number().optional().default(0),
  earnings: z.array(z.object({ month: z.string(), earnings: z.number() })).optional().default([]),
  checkedTasks: z.array(z.string()).optional().default([]),
});

const HustleIdeaSchema = z.object({
  name: z.string(),
  description: z.string(),
  pricingTip: z.string().optional(),
  marketingIdea: z.string().optional(),
  flyerText: z.string().optional(),
  logoUrl: z.string().optional(),
  flyerUrl: z.string().optional(),
  marketingPrompts: z.array(z.string()).optional(),
  trackerData: HustleTrackerDataSchema.optional(),
  schedule: z.any().optional(),
  coachHistory: z.any().optional(),
});

export type HustleIdea = z.infer<typeof HustleIdeaSchema>;
export type HustleTrackerData = z.infer<typeof HustleTrackerDataSchema>;

const GenerateHustleIdeasInputSchema = z.object({
  skillsAndInterests: z.string(),
  age: z.string(),
  timeCommitment: z.string(),
  isPremium: z.boolean(),
});
export type GenerateHustleIdeasInput = z.infer<typeof GenerateHustleIdeasInputSchema>;

const GenerateHustleIdeasOutputSchema = z.object({
  hustleIdeas: z.array(HustleIdeaSchema).max(3),
});
export type GenerateHustleIdeasOutput = z.infer<typeof GenerateHustleIdeasOutputSchema>;

export async function generateHustleIdeas(input: GenerateHustleIdeasInput): Promise<GenerateHustleIdeasOutput> {
  const response = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Generate exactly 3 creative and profitable side hustle ideas for a user.
    User Profile: Skills & Interests: ${input.skillsAndInterests}, Age: ${input.age}, Time Commitment: ${input.timeCommitment}.

    IMPORTANT: You must respond ONLY with a raw JSON object. No markdown, no backticks, no explanations.
    The JSON structure must be: { "hustleIdeas": [{ "name": "...", "description": "..." }] }`,
  });

  try {
    const text = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    
    const hustlesWithTracker = (parsed.hustleIdeas || []).map((hustle: any) => ({
      ...hustle,
      trackerData: {
        status: 'Not Started',
        earningsGoal: 1000,
        launchDate: null,
        progress: 0,
        earnings: [
            { month: 'Week 1', earnings: 0 },
            { month: 'Week 2', earnings: 0 },
            { month: 'Week 3', earnings: 0 },
            { month: 'Week 4', earnings: 0 },
        ],
        checkedTasks: [],
      },
    }));

    return GenerateHustleIdeasOutputSchema.parse({ hustleIdeas: hustlesWithTracker });
  } catch (error) {
    console.error("AI Generation Error:", response.text);
    throw new Error('Failed to generate hustle ideas. Please try again.');
  }
}
