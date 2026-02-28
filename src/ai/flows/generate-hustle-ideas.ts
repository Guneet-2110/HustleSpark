'use server';
/**
 * @fileOverview Generates personalized side hustle ideas using Gemini 2.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const HustleTrackerDataSchema = z.object({
  status: z.enum(['Not Started', 'In Progress', 'Launched']).optional().default('Not Started'),
  earningsGoal: z.number().optional().default(1000),
  launchDate: z.date().nullable().optional().default(null),
  progress: z.number().optional().default(0),
  earnings: z.array(z.object({ month: z.string(), earnings: z.number() })).optional().default([]),
  checkedTasks: z.array(z.string()).optional().default([]),
});

const HustleIdeaSchema = z.object({
  name: z.string().describe('Name of the side hustle.'),
  description: z.string().describe('A brief, compelling description.'),
});

export type HustleIdea = z.infer<typeof HustleIdeaSchema> & {
  pricingTip?: string;
  marketingIdea?: string;
  flyerText?: string;
  logoUrl?: string;
  flyerUrl?: string;
  marketingPrompts?: string[];
  trackerData?: z.infer<typeof HustleTrackerDataSchema>;
  schedule?: any;
  coachHistory?: any;
};

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

const ideasPrompt = ai.definePrompt({
  name: 'ideasPrompt',
  input: { schema: GenerateHustleIdeasInputSchema },
  output: { schema: GenerateHustleIdeasOutputSchema },
  prompt: `Generate exactly 3 creative and profitable side hustle ideas for a user.
    User Profile: Skills & Interests: {{{skillsAndInterests}}}, Age: {{{age}}}, Time Commitment: {{{timeCommitment}}}.`,
});

const ideasFlow = ai.defineFlow(
  {
    name: 'ideasFlow',
    inputSchema: GenerateHustleIdeasInputSchema,
    outputSchema: GenerateHustleIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await ideasPrompt(input);
    if (!output) throw new Error('Failed to generate hustle ideas. Please try again.');

    const hustlesWithTracker = output.hustleIdeas.map((hustle: any) => ({
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

    return { hustleIdeas: hustlesWithTracker };
  }
);

export async function generateHustleIdeas(input: GenerateHustleIdeasInput): Promise<GenerateHustleIdeasOutput> {
  return ideasFlow(input);
}
