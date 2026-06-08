'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InputSchema = z.object({
    hustleName: z.string(),
    hustleDescription: z.string(),
    targetMarket: z.string(),
    revenueModel: z.string(),
    uniqueAdvantage: z.string(),
});
export type GeneratePitchDeckInput = z.infer<typeof InputSchema>;

export type GeneratePitchDeckOutput = {
    slides: Array<{
        title: string;
        headline: string;
        bullets: string[];
        speakerNote: string;
    }>;
    elevatorPitch: string;
    tagline: string;
};

export async function generatePitchDeck(input: GeneratePitchDeckInput): Promise<GeneratePitchDeckOutput> {
    const { text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `You are a startup pitch coach. Create a 5-slide pitch deck for "${input.hustleName}" (${input.hustleDescription}).

Target market: ${input.targetMarket}
Revenue model: ${input.revenueModel}
Unique advantage: ${input.uniqueAdvantage}

Slides: 1-Problem, 2-Solution, 3-Target Market, 4-Revenue Model, 5-The Ask

Return ONLY valid JSON, no markdown:
{"slides":[{"title":"Problem","headline":"...","bullets":["...","...","..."],"speakerNote":"..."},{"title":"Solution","headline":"...","bullets":["...","...","..."],"speakerNote":"..."},{"title":"Target Market","headline":"...","bullets":["...","...","..."],"speakerNote":"..."},{"title":"Revenue Model","headline":"...","bullets":["...","...","..."],"speakerNote":"..."},{"title":"The Ask","headline":"...","bullets":["...","...","..."],"speakerNote":"..."}],"elevatorPitch":"...","tagline":"..."}`,
    });

    try {
        const clean = text?.replace(/```json|```/g, '').trim() || '{}';
        return JSON.parse(clean);
    } catch {
        throw new Error('Could not parse pitch deck response.');
    }
}