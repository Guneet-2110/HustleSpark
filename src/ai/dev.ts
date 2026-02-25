'use server';

// This file is the entrypoint for Genkit's development server.
// It should import all of the flows that you want to be available in the developer UI.
import '@/ai/flows/generate-hustle-ideas.ts';
import '@/ai/flows/generate-logo.ts';
import '@/ai/flows/generate-marketing-prompts.ts';
import '@/ai/flows/generate-flyer.ts';
import '@/ai/flows/generate-hustle-blueprint.ts';
import '@/ai/flows/generate-hustle-schedule.ts';
import '@/ai/flows/generate-coach-response.ts';
