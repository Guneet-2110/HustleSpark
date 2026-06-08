'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InputSchema = z.object({
    hustleName: z.string(),
    hustleDescription: z.string(),
    timePerDelivery: z.string(),
    targetCustomer: z.string(),
    costs: z.string(),
    experience: z.string(),
});
export type GeneratePricingWizardInput = z.infer<typeof InputSchema>;

export type GeneratePricingWizardOutput = {
    basic: { price: number; label: string; includes: string[]; deliveryTime: string };
    standard: { price: number; label: string; includes: string[]; deliveryTime: string };
    premium: { price: number; label: string; includes: string[]; deliveryTime: string };
    reasoning: string;
    positioningTip: string;
};

export async function generatePricingWizard(input: GeneratePricingWizardInput): Promise<GeneratePricingWizardOutput> {
    const { text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `You are an expert pricing strategist for teen entrepreneurs. Create a 3-tier pricing structure for "${input.hustleName}" (${input.hustleDescription}).

Time per delivery: ${input.timePerDelivery}
Target customer: ${input.targetCustomer}
Costs: ${input.costs}
Experience: ${input.experience}

Return ONLY valid JSON, no markdown:
{"basic":{"price":25,"label":"Starter","includes":["item1","item2","item3"],"deliveryTime":"1-2 days"},"standard":{"price":50,"label":"Growth","includes":["item1","item2","item3","item4"],"deliveryTime":"2-3 days"},"premium":{"price":100,"label":"Elite","includes":["item1","item2","item3","item4","item5"],"deliveryTime":"3-5 days"},"reasoning":"...","positioningTip":"..."}`,
    });

    try {
        const clean = text?.replace(/```json|```/g, '').trim() || '{}';
        return JSON.parse(clean);
    } catch {
        throw new Error('Could not parse pricing response.');
    }
}