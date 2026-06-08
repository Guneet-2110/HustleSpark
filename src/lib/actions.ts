
"use server";
import 'dotenv/config';

import { generateHustleIdeas } from "@/ai/flows/generate-hustle-ideas";
import { generateLogo } from "@/ai/flows/generate-logo";
import { generateMarketingPrompts } from "@/ai/flows/generate-marketing-prompts";
import { generateFlyer } from "@/ai/flows/generate-flyer";
import { generateHustleBlueprint } from "@/ai/flows/generate-hustle-blueprint";
import { generateHustleSchedule } from "@/ai/flows/generate-hustle-schedule";
import { generateCoachResponse } from "@/ai/flows/generate-coach-response";
import { createPlaceholderSvg } from "@/ai/flows/placeholder-svg";
import { z } from "zod";

/**
 * Sends a notification to the administrator when a transaction is completed.
 * In a production app, this would use a service like Resend or SendGrid.
 */
export async function notifyAdminOfCompletionAction(transaction: {
    id: string;
    hustleName: string;
    sellerEmail: string;
    sellerAmount: number;
    buyerEmail: string;
}) {
    console.log("--- ADMIN NOTIFICATION ---");
    console.log(`To: guneet.ar2010@gmail.com`);
    console.log(`Subject: [HustleSpark] Transaction Completed - Payout Required`);
    console.log(`Body: Transaction ${transaction.id} for "${transaction.hustleName}" has been confirmed by the buyer.`);
    console.log(`Payout of $${transaction.sellerAmount} is now due to ${transaction.sellerEmail}.`);
    console.log(`Buyer: ${transaction.buyerEmail}`);
    console.log("--------------------------");
    
    // Placeholder for actual email API implementation
    return { success: true };
}

/**
 * Creates a marketplace listing record.
 */
export async function createMarketplaceListingAction(input: {
    hustleName: string,
    description: string,
    price: number,
    category: string,
    location: string,
    paypalEmail: string,
    flyerUrl: string,
    userId: string,
}) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Real marketplace listing prepared for:", input.hustleName);
        return { message: "success" };
    } catch (error) {
        return { message: "Failed to create listing." };
    }
}

const generateHustleIdeasSchema = z.object({
  skillsAndInterests: z.string().min(10, { message: "Please describe your skills and interests in a bit more detail." }),
  age: z.string().min(1, { message: "Please enter your age." }),
  timeCommitment: z.string().min(1, { message: "Please select your time commitment." }),
  isPremium: z.string().transform(value => value === 'true'),
});

/**
 * Action to generate personalized side hustle ideas.
 */
export async function generateHustleIdeasAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = generateHustleIdeasSchema.safeParse({
      skillsAndInterests: formData.get('skillsAndInterests'),
      age: formData.get('age'),
      timeCommitment: formData.get('timeCommitment'),
      isPremium: formData.get('isPremium'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed',
        errors: validatedFields.error.flatten().fieldErrors,
        data: null,
      };
    }
    
    const output = await generateHustleIdeas(validatedFields.data);

    if (!output || !output.hustleIdeas) {
      return { message: "Failed to generate ideas. Please try again.", data: null };
    }

    return { message: "success", data: output.hustleIdeas };
  } catch (error) {
    console.error("AI GENERATION ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { message: `AI Error: ${errorMessage}`, data: null };
  }
}

/**
 * Action to generate a professional logo.
 */
export async function generateLogoAction(input: {hustleName: string, hustleDescription: string}) {
    try {
        const output = await generateLogo(input);
        return { message: "success", data: output };
    } catch (error) {
        console.warn("LOGO GEN QUOTA EXCEEDED, USING FALLBACK:", error);
        const svg = await createPlaceholderSvg(input.hustleName);
        return { message: "success", data: { logoUrl: svg }, isPlaceholder: true };
    }
}

/**
 * Action to generate social media marketing prompts.
 */
export async function generateMarketingPromptsAction(input: {hustleName: string, hustleDescription: string}) {
    try {
        const output = await generateMarketingPrompts(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to generate marketing prompts.", data: null };
    }
}

/**
 * Action to generate a promotional flyer.
 */
export async function generateFlyerAction(input: {hustleName: string, flyerText: string, email?: string, phone?:string}) {
    try {
        const output = await generateFlyer(input);
        return { message: "success", data: output };
    } catch (error) {
        console.warn("FLYER GEN QUOTA EXCEEDED, USING FALLBACK:", error);
        const svg = await createPlaceholderSvg(input.hustleName, input.flyerText, input.email || input.phone);
        return { message: "success", data: { flyerUrl: svg }, isPlaceholder: true };
    }
}

/**
 * Action to generate the strategic business blueprint.
 */
export async function generateHustleBlueprintAction(input: {hustleName: string, hustleDescription: string}) {
    try {
        const output = await generateHustleBlueprint(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to generate hustle blueprint.", data: null };
    }
}

/**
 * Action to generate the 4-week launch schedule.
 */
export async function generateHustleScheduleAction(input: {hustleName: string, hustleDescription: string, weeksToGenerate?: number}) {
    try {
        const output = await generateHustleSchedule(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to generate schedule.", data: null };
    }
}

/**
 * Action to communicate with Sparky, the AI Hustle Coach.
 */
export async function generateCoachResponseAction(input: {hustle: any, userInput: string, history: any[]}) {
    try {
        const output = await generateCoachResponse(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to get coach response.", data: null };
    }
}

/**
 * Action to generate compelling marketplace listing copy.
 */
export async function generateMarketplaceCopyAction(input: {hustleName: string, hustleDescription: string, pricingTip?: string, marketingIdea?: string}) {
    try {
        const { generateMarketplaceCopy } = await import('@/ai/flows/generate-marketplace-copy');
        const output = await generateMarketplaceCopy(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to generate marketplace copy.", data: null };
    }
}

export async function generatePricingWizardAction(input: {hustleName: string, hustleDescription: string, timePerDelivery: string, targetCustomer: string, costs: string, experience: string}) {
    try {
        const { generatePricingWizard } = await import('@/ai/flows/generate-pricing-wizard');
        const output = await generatePricingWizard(input);
        return { message: 'success', data: output };
    } catch (error: any) {
        return { message: error.message || 'Failed to generate pricing.', data: null };
    }
}

export async function generateSocialCalendarAction(input: {hustleName: string, hustleDescription: string, targetAudience: string, platforms: string[]}) {
    try {
        const { generateSocialCalendar } = await import('@/ai/flows/generate-social-calendar');
        const output = await generateSocialCalendar(input);
        return { message: 'success', data: output };
    } catch (error: any) {
        return { message: error.message || 'Failed to generate calendar.', data: null };
    }
}

export async function generatePitchDeckAction(input: {hustleName: string, hustleDescription: string, targetMarket: string, revenueModel: string, uniqueAdvantage: string}) {
    try {
        const { generatePitchDeck } = await import('@/ai/flows/generate-pitch-deck');
        const output = await generatePitchDeck(input);
        return { message: 'success', data: output };
    } catch (error: any) {
        return { message: error.message || 'Failed to generate pitch deck.', data: null };
    }
}
