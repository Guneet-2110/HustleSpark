'use server';
/**
 * @fileOverview A side hustle AI coach powered by Gemini 2.5 Flash.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const GenerateCoachResponseInputSchema = z.object({
  hustle: z.object({
    name: z.string(),
    description: z.string(),
  }),
  userInput: z.string(),
  history: z.array(MessageSchema),
});
export type GenerateCoachResponseInput = z.infer<typeof GenerateCoachResponseInputSchema>;

const GenerateCoachResponseOutputSchema = z.object({
  coachResponse: z.string().describe('Expert, actionable advice for the side hustle.'),
});
export type GenerateCoachResponseOutput = z.infer<typeof GenerateCoachResponseOutputSchema>;

const coachPrompt = ai.definePrompt({
  name: 'coachPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateCoachResponseInputSchema },
  output: { schema: GenerateCoachResponseOutputSchema },
  prompt: `You are Sparky, a supportive and expert AI side hustle coach. 
  
  Current Hustle: {{{hustle.name}}}
  Context: {{{hustle.description}}}
  
  User Question: "{{{userInput}}}"

  Instructions:
  1. Provide expert, actionable advice specifically for this business.
  2. Stay in character as a supportive and motivating mentor.
  3. Keep the advice practical and focused on the next steps for growth.`,
});

export async function generateCoachResponse(input: GenerateCoachResponseInput): Promise<GenerateCoachResponseOutput> {
  const { output } = await coachPrompt(input, {
    history: input.history.map(m => ({
      role: m.role,
      content: [{ text: m.content }],
    })),
  });

  if (!output) {
    return { coachResponse: "Sparky is processing your request. Please try again in a moment." };
  }

  return output;
}
