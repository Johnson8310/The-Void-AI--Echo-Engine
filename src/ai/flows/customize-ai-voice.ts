'use server';

/**
 * @fileOverview This file defines a Genkit flow for customizing AI voices for different speakers in a podcast.
 *
 * It allows users to select from a variety of AI voices to tailor the sound and feel of their content.
 *
 * - customizeAiVoice - The main function that orchestrates the voice customization process.
 * - CustomizeAiVoiceInput - The input type for the customizeAiVoice function.
 * - CustomizeAiVoiceOutput - The output type for the customizeAiVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the customizeAiVoice function.
const CustomizeAiVoiceInputSchema = z.object({
  speakerName: z.string().describe('The name of the speaker to customize.'),
  voiceName: z.string().describe('The desired AI voice name for the speaker.'),
});

export type CustomizeAiVoiceInput = z.infer<typeof CustomizeAiVoiceInputSchema>;

// Define the output schema for the customizeAiVoice function.
const CustomizeAiVoiceOutputSchema = z.object({
  speakerName: z.string().describe('The name of the speaker.'),
  voiceName: z.string().describe('The selected AI voice name.'),
});

export type CustomizeAiVoiceOutput = z.infer<typeof CustomizeAiVoiceOutputSchema>;

// Define the main function that will be called from the client.
export async function customizeAiVoice(input: CustomizeAiVoiceInput): Promise<CustomizeAiVoiceOutput> {
  return customizeAiVoiceFlow(input);
}

// Define the Genkit prompt to confirm the voice customization.
const customizeAiVoicePrompt = ai.definePrompt({
  name: 'customizeAiVoicePrompt',
  input: {schema: CustomizeAiVoiceInputSchema},
  output: {schema: CustomizeAiVoiceOutputSchema},
  prompt: `You are an AI voice customization assistant.

You have customized the voice for speaker "{{speakerName}}" to "{{voiceName}}".

Please confirm the customization details.`,
});

// Define the Genkit flow for customizing the AI voice.
const customizeAiVoiceFlow = ai.defineFlow(
  {
    name: 'customizeAiVoiceFlow',
    inputSchema: CustomizeAiVoiceInputSchema,
    outputSchema: CustomizeAiVoiceOutputSchema,
  },
  async input => {
    const {output} = await customizeAiVoicePrompt(input);
    return output!;
  }
);
