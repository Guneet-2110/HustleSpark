'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateHustleScheduleInputSchema = z.object({
  hustleName: z.string(),
  hustleDescription: z.string(),
  weeksToGenerate: z.number().min(2).max(16).default(4),
});
export type GenerateHustleScheduleInput = z.infer<typeof GenerateHustleScheduleInputSchema>;

const GenerateHustleScheduleOutputSchema = z.object({
  week1: z.array(z.string()).length(7),
  week2: z.array(z.string()).length(7),
  week3: z.array(z.string()).length(7).optional(),
  week4: z.array(z.string()).length(7).optional(),
  week5: z.array(z.string()).length(7).optional(),
  week6: z.array(z.string()).length(7).optional(),
  week7: z.array(z.string()).length(7).optional(),
  week8: z.array(z.string()).length(7).optional(),
  week9: z.array(z.string()).length(7).optional(),
  week10: z.array(z.string()).length(7).optional(),
  week11: z.array(z.string()).length(7).optional(),
  week12: z.array(z.string()).length(7).optional(),
  week13: z.array(z.string()).length(7).optional(),
  week14: z.array(z.string()).length(7).optional(),
  week15: z.array(z.string()).length(7).optional(),
  week16: z.array(z.string()).length(7).optional(),
});
export type GenerateHustleScheduleOutput = z.infer<typeof GenerateHustleScheduleOutputSchema>;

const WEEK_THEMES: Record<number, string> = {
  1: "Setup & Foundations — accounts, tools, pricing basics, branding setup",
  2: "Product Development — building your offer, creating samples, setting prices",
  3: "Marketing & Outreach — getting first customers, social media, direct outreach",
  4: "Launch & Scale — going live, fulfilling orders, getting reviews",
  5: "Growth & Optimization — refine your process, improve your offer based on feedback",
  6: "Revenue Acceleration — upsell existing customers, increase prices, add new services",
  7: "Community Building — build a following, get referrals, create loyalty",
  8: "Systems & Automation — create templates, streamline workflows, save time",
  9: "Brand Expansion — improve branding, professional photos, updated marketing materials",
  10: "Partnerships — reach out to collaborators, local businesses, influencers",
  11: "Customer Retention — follow up with past customers, offer repeat deals",
  12: "Analytics & Review — track what's working, cut what isn't, double down on wins",
  13: "New Revenue Streams — add a new product/service, bundle offers",
  14: "Advanced Marketing — paid ads, email list, content strategy",
  15: "Team & Delegation — outsource tasks, bring in help, scale operations",
  16: "Long-Term Vision — 6-month plan, bigger goals, potential business registration",
};

export async function generateHustleSchedule(input: GenerateHustleScheduleInput): Promise<GenerateHustleScheduleOutput> {
  const weeks = input.weeksToGenerate || 4;
  
  const weekDescriptions = Array.from({ length: weeks }, (_, i) => {
    const weekNum = i + 1;
    return `Week ${weekNum} — ${WEEK_THEMES[weekNum]}`;
  }).join('\n');

  const outputFields = Array.from({ length: weeks }, (_, i) => `week${i + 1}`).join(', ');

  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are an expert business launch coach. Create a highly specific, practical ${weeks}-week daily action plan for launching "${input.hustleName}" — ${input.hustleDescription}.

Each task must be:
- Written in plain, simple language a teenager can understand
- Specific to THIS hustle (not generic advice)
- A single clear action that takes 30-60 minutes max
- Start with an action verb (e.g. "Create", "Message", "Post", "Research", "Set up", "Design")
- Include WHERE to do it or WHO to contact where relevant

Week themes:
${weekDescriptions}

Return exactly 7 tasks per week. Each task should be 1 sentence, clear and direct.

Return ONLY a JSON object with keys ${outputFields}, each being an array of exactly 7 strings.`,
    output: {
      schema: GenerateHustleScheduleOutputSchema,
    },
  });

  if (!output) throw new Error("Could not generate your launch plan. Please try again.");
  return output;
}