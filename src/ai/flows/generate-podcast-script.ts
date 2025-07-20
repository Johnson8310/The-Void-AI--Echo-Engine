'use server';

/**
 * @fileOverview A podcast script generator AI agent.
 *
 * - generatePodcastScript - A function that handles the podcast script generation process.
 * - GeneratePodcastScriptInput - The input type for the generatePodcastScript function.
 * - GeneratePodcastScriptOutput - The return type for the generatePodcastScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePodcastScriptInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to convert to a podcast script.'),
});
export type GeneratePodcastScriptInput = z.infer<typeof GeneratePodcastScriptInputSchema>;

const GeneratePodcastScriptOutputSchema = z.object({
  podcastScript: z
    .string()
    .describe('The generated podcast script with speaker cues and sections.'),
});
export type GeneratePodcastScriptOutput = z.infer<typeof GeneratePodcastScriptOutputSchema>;

export async function generatePodcastScript(input: GeneratePodcastScriptInput): Promise<GeneratePodcastScriptOutput> {
  return generatePodcastScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePodcastScriptPrompt',
  input: {schema: GeneratePodcastScriptInputSchema},
  output: {schema: GeneratePodcastScriptOutputSchema},
  prompt: `You are a podcast script writer. Take the following document content and create a podcast script from it.

Document Content:
{{{documentContent}}}

Make sure to include speaker cues and clearly defined sections.

Podcast Script:`,
});

const generatePodcastScriptFlow = ai.defineFlow(
  {
    name: 'generatePodcastScriptFlow',
    inputSchema: GeneratePodcastScriptInputSchema,
    outputSchema: GeneratePodcastScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
