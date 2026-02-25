
'use server';

/**
 * @fileOverview Generates a high-impact promotional flyer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFlyerInputSchema = z.object({
  hustleName: z.string().describe('The name of the side hustle.'),
  flyerText: z.string().describe('Headline and description for the flyer.'),
  email: z.string().optional().describe('The email address for the flyer.'),
  phone: z.string().optional().describe('The phone number for the flyer.'),
});
export type GenerateFlyerInput = z.infer<typeof GenerateFlyerInputSchema>;

const GenerateFlyerOutputSchema = z.object({
  flyerUrl: z
    .string()
    .describe(
      "The data URI of the generated flyer image. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateFlyerOutput = z.infer<typeof GenerateFlyerOutputSchema>;

export async function generateFlyer(input: GenerateFlyerInput): Promise<GenerateFlyerOutput> {
    const contactInfo = [input.email, input.phone].filter(Boolean).join(' | ');
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: `Design a high-impact, professional promotional flyer for the business "${input.hustleName}". 
      Main Hook: "${input.flyerText}". 
      ${contactInfo ? `Contact: ${contactInfo}` : ''}
      
      REQUIREMENTS:
      - Visual-heavy design with MINIMAL text (maximum 10 words total).
      - Professional, commercial advertising aesthetic.
      - High-end photography style related to the service.
      - Bold typography for the headline.
      - Solid, elite color grading and studio lighting.
      - Background should be clean and uncluttered.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Could not generate flyer image. Please try again in a moment.');
    }

    return {
        flyerUrl: media.url,
    };
}
