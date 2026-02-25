
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
  hustle: z.any(),
  userInput: z.string(),
  history: z.array(MessageSchema),
});
export type GenerateCoachResponseInput = z.infer<typeof GenerateCoachResponseInputSchema>;

const GenerateCoachResponseOutputSchema = z.object({
  coachResponse: z.string(),
});
export type GenerateCoachResponseOutput = z.infer<typeof GenerateCoachResponseOutputSchema>;

export async function generateCoachResponse(input: GenerateCoachResponseInput): Promise<GenerateCoachResponseOutput> {
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are Sparky, a supportive and expert AI side hustle coach. 
      Current Hustle Context: ${JSON.stringify(input.hustle)}. 
      User Question: "${input.userInput}"

      Instructions:
      1. Provide expert, actionable advice for this specific hustle.
      2. Stay in character as a supportive mentor.
      3. Respond strictly in valid JSON format.

      JSON structure:
      { "coachResponse": "Your expert advice here..." }`,
      history: input.history.map(m => ({ role: m.role, content: [{ text: m.content }] })),
    });

    try {
      const text = response.text.replace(/```json|```/g, '').trim();
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
          if (text.length > 20) return { coachResponse: text };
          throw new Error("Invalid response from AI");
      }
      
      const cleanJson = text.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(cleanJson);
      return GenerateCoachResponseOutputSchema.parse(parsed);
    } catch (error) {
      console.error("AI Coach Error:", response.text);
      return { coachResponse: "Sparky is processing your request. Please try again in a moment." };
    }
}
