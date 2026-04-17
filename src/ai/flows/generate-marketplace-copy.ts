'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketplaceCopyInputSchema = z.object({
    hustleName: z.string(),
    hustleDescription: z.string(),
    pricingTip: z.string().optional(),
    marketingIdea: z.string().optional(),
});

const MarketplaceCopyOutputSchema = z.object({
    aboutUs: z.string(),
    whatWeDo: z.string(),
    ourGoal: z.string(),
});

export const generateMarketplaceCopy = ai.defineFlow(
    {
        name: 'generateMarketplaceCopy',
        inputSchema: MarketplaceCopyInputSchema,
        outputSchema: MarketplaceCopyOutputSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt: `You are an expert marketplace copywriter for HustleSpark, a platform where entrepreneurs sell their side hustle strategies.

Write compelling, professional marketplace copy for a venture listing. The copy should be:
- Engaging and persuasive to potential buyers
- Specific to this hustle (not generic)
- Professional but approachable
- Written in first person plural ("We", "Our")
- Concise but impactful (2-4 sentences each)

Hustle Name: ${input.hustleName}
Description: ${input.hustleDescription}
${input.pricingTip ? `Pricing Strategy: ${input.pricingTip}` : ''}
${input.marketingIdea ? `Marketing Approach: ${input.marketingIdea}` : ''}

Generate three sections:

1. "About Us" - Who we are and what makes this venture unique. Focus on the creator's passion and expertise.

2. "What We Do" - The specific services, products, or value this venture delivers. Be concrete and specific.

3. "Our Goal" - The mission and vision. What problem are we solving and who are we helping?

Return ONLY a JSON object with keys: aboutUs, whatWeDo, ourGoal`,
            output: {
                schema: MarketplaceCopyOutputSchema,
            },
        });

        return output!;
    }
);