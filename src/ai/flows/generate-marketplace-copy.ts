'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketplaceCopyInputSchema = z.object({
    hustleName: z.string(),
    hustleDescription: z.string(),
    pricingTip: z.string().optional(),
    marketingIdea: z.string().optional(),
});

export const generateMarketplaceCopy = async (input: z.infer<typeof MarketplaceCopyInputSchema>) => {
    const { text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `You are an expert marketplace copywriter for HustleSpark, a platform where teen entrepreneurs sell their side hustle services.

Write compelling marketplace copy for "${input.hustleName}" (${input.hustleDescription}).
${input.pricingTip ? `Pricing: ${input.pricingTip}` : ''}
${input.marketingIdea ? `Marketing: ${input.marketingIdea}` : ''}

Write in first person plural (We/Our). Be specific, professional, and persuasive. 2-3 sentences each.

Return ONLY valid JSON, no markdown:
{"aboutUs":"...","whatWeDo":"...","ourGoal":"..."}`,
    });

    try {
        const clean = text?.replace(/```json|```/g, '').trim() || '{}';
        return JSON.parse(clean);
    } catch {
        throw new Error('Could not parse marketplace copy response.');
    }
};
