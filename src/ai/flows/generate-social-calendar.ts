'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InputSchema = z.object({
    hustleName: z.string(),
    hustleDescription: z.string(),
    targetAudience: z.string(),
    platforms: z.array(z.string()),
});
export type GenerateSocialCalendarInput = z.infer<typeof InputSchema>;

export type GenerateSocialCalendarOutput = {
    posts: Array<{
        day: number;
        platform: string;
        type: string;
        caption: string;
        hashtags: string[];
        bestTime: string;
    }>;
    strategy: string;
    topTip: string;
};

export async function generateSocialCalendar(input: GenerateSocialCalendarInput): Promise<GenerateSocialCalendarOutput> {
    const { text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `You are a social media strategist for teen entrepreneurs. Create a 30-day social media content calendar for "${input.hustleName}" (${input.hustleDescription}).

Target audience: ${input.targetAudience}
Platforms: ${input.platforms.join(', ')}

Generate exactly 30 posts. Each post needs: day (1-30), platform, type (Promotional/Educational/Behind the Scenes/Engagement), caption, hashtags (5 items without #), bestTime.

Also include: strategy (overall approach, 1-2 sentences), topTip (single best advice).

Return ONLY valid JSON, no markdown, no explanation:
{"posts":[{"day":1,"platform":"Instagram","type":"Promotional","caption":"...","hashtags":["tag1","tag2","tag3","tag4","tag5"],"bestTime":"6-8 PM"}],"strategy":"...","topTip":"..."}`,
    });

    try {
        const clean = text?.replace(/```json|```/g, '').trim() || '{}';
        return JSON.parse(clean);
    } catch {
        throw new Error('Could not parse social calendar response.');
    }
}