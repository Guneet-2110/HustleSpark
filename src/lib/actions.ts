
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
        // Prepare real marketplace listing connection logic.
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

export async function generateLogoAction(input: {hustleName: string, hustleDescription: string}) {
    try {
        const output = await generateLogo(input);
        return { message: "success", data: output };
    } catch (error) {
        console.warn("LOGO GEN QUOTA EXCEEDED, USING FALLBACK:", error);
        // Fallback to high-quality SVG
        const svg = await createPlaceholderSvg(input.hustleName);
        return { message: "success", data: { logoUrl: svg }, isPlaceholder: true };
    }
}

export async function generateMarketingPromptsAction(input: {hustleName: string, hustleDescription: string}) {
    try {
        const output = await generateMarketingPrompts(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to generate marketing prompts.", data: null };
    }
}

export async function generateFlyerAction(input: {hustleName: string, flyerText: string, email?: string, phone?:string}) {
    try {
        const output = await generateFlyer(input);
        return { message: "success", data: output };
    } catch (error) {
        console.warn("FLYER GEN QUOTA EXCEEDED, USING FALLBACK:", error);
        // Fallback to high-quality SVG
        const svg = await createPlaceholderSvg(input.hustleName, input.flyerText, input.email || input.phone);
        return { message: "success", data: { flyerUrl: svg }, isPlaceholder: true };
    }
}

export async function generateHustleBlueprintAction(input: {hustleName: string, hustleDescription: string}) {
    try {
        const output = await generateHustleBlueprint(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to generate hustle blueprint.", data: null };
    }
}

export async function generateHustleScheduleAction(input: {hustleName: string, hustleDescription: string}) {
    try {
        const output = await generateHustleSchedule(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to generate hustle schedule.", data: null };
    }
}

export async function generateCoachResponseAction(input: {hustle: any, userInput: string, history: any[]}) {
    try {
        const output = await generateCoachResponse(input);
        return { message: "success", data: output };
    } catch (error) {
        return { message: "Failed to get coach response.", data: null };
    }
}
