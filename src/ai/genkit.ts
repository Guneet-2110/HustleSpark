import 'dotenv/config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for the HustleSpark application.
 * Configured with Google AI plugin for Gemini capabilities.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
