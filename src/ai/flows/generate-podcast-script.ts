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
  prompt: `You are a podcast script writer. Your task is to convert the provided document content into a well-structured podcast script.

The entire output must be a single JSON object with a single key, "podcastScript". The value of this key should be a string containing the entire script.

The script should include:
1.  Clear speaker cues (e.g., "Host:", "Expert:", "Narrator:").
2.  Well-defined sections (e.g., intro, main content, outro).
3.  The tone should be engaging and conversational.

Here is an example of the desired output format:
{
  "podcastScript": "Host: Welcome to our show! Today we are discussing the future of AI.\\nExpert: It's a pleasure to be here. The future is both exciting and unpredictable."
}

Now, please process the following document content and generate the podcast script in the specified JSON format.

Document Content:
{{{documentContent}}}

Remember to format your entire response as a single JSON object with the "podcastScript" key. Do not include any text or formatting outside of the JSON object.`,
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
