'use server';

/**
 * @fileOverview Generates a professional logo using Nano-Banana Pro (Gemini 2.5 Flash Image).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLogoInputSchema = z.object({
  hustleName: z.string().describe('The name of the side hustle.'),
  hustleDescription: z.string().describe('A brief description of the side hustle.'),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

const GenerateLogoOutputSchema = z.object({
  logoUrl: z
    .string()
    .describe(
      "The data URI of the generated logo image. Expected format: 'data:image/png;base64,<encoded_data>'"
    ),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;

export async function generateLogo(input: GenerateLogoInput): Promise<GenerateLogoOutput> {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { text: `Create a stunning, high-end professional logo for a business called "${input.hustleName}". 
        Description: ${input.hustleDescription}. 
        Design Style: Modern, premium, minimalist vector art. 
        Quality: Ultra-high definition, studio branding quality, clean lines, professional color palette. 
        The logo should look like it was designed by a world-class agency for an elite startup. 
        Include an iconic symbol and the brand name in a modern font. 
        Background: Solid clean background.` }
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Failed to generate logo image.');
    }

    return {
        logoUrl: media.url,
    };
}
