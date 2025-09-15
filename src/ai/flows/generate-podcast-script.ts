
'use server';

/**
 * @fileOverview A podcast script generator AI agent.
 *
 * - generatePodcastScript - A function that handles the podcast script generation process.
 * - GeneratePodcastScriptInput - The input type for the generatePodcastScript function.
 * - GeneratePodcastScriptOutput - The return type for the generatePodcastScript function.
 */

import {ai} from '@/ai/genkit';
import { gemini15Pro } from '@genkit-ai/googleai';
import {z} from 'genkit';

const GeneratePodcastScriptInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to convert to a podcast script.'),
  tone: z.string().optional().describe('The desired tone for the podcast script (e.g., "Conversational", "Formal", "Humorous").'),
  addMusicAndSfx: z.boolean().optional().describe('Whether to add music and sound effects cues to the script.'),
});
export type GeneratePodcastScriptInput = z.infer<typeof GeneratePodcastScriptInputSchema>;

const ScriptLineSchema = z.object({
  speaker: z.string().describe("The name of the speaker for this line (e.g., 'Host', 'Expert', '[MUSIC]', '[SFX]')."),
  line: z.string().describe("The dialogue for the speaker for this line, or a description of the music/sound effect."),
});
export type ScriptLine = z.infer<typeof ScriptLineSchema>;

const GeneratePodcastScriptOutputSchema = z.object({
  title: z.string().describe('A catchy, engaging title for the podcast episode.'),
  summary: z.string().describe('A brief, one or two-sentence summary of the podcast episode.'),
  script: z.array(ScriptLineSchema).describe("The generated podcast script as an array of speaker and line objects."),
});
export type GeneratePodcastScriptOutput = z.infer<typeof GeneratePodcastScriptOutputSchema>;

export async function generatePodcastScript(input: GeneratePodcastScriptInput): Promise<GeneratePodcastScriptOutput> {
  return generatePodcastScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePodcastScriptPrompt',
  model: gemini15Pro,
  input: {schema: GeneratePodcastScriptInputSchema},
  output: {schema: GeneratePodcastScriptOutputSchema},
  prompt: `You are a podcast producer and script writer. Your task is to take the provided document and turn it into a full podcast episode.

The entire output must be a single JSON object.

Your tasks are:
1.  Create a catchy, engaging title for the podcast episode.
2.  Write a brief, one or two-sentence summary of the episode.
3.  Convert the document content into a well-structured podcast script, returned as an array of objects, where each object has a "speaker" and a "line".

The script should include:
- Clear speaker cues (e.g., "Host", "Expert"). Use at least two different speakers.
- Well-defined sections (e.g., intro, main content, outro).
{{#if tone}}
- The tone should be {{tone}}.
{{else}}
- The tone should be engaging and conversational.
{{/if}}

{{#if addMusicAndSfx}}
- Include cues for background music and sound effects where appropriate. Use "[MUSIC]" or "[SFX]" as the speaker for these cues. For example: { "speaker": "[MUSIC]", "line": "Upbeat electronic intro music fades in." } or { "speaker": "[SFX]", "line": "Sound of a cash register." }.
{{/if}}


Here is an example of the desired output format:
{
  "title": "The Future of Artificial Intelligence",
  "summary": "In this episode, we explore the exciting and unpredictable future of AI with our expert guest.",
  "script": [
    { "speaker": "[MUSIC]", "line": "Upbeat synth intro fades in and then fades to background." },
    { "speaker": "Host", "line": "Welcome to our show! Today we are discussing the future of AI." },
    { "speaker": "Expert", "line": "It's a pleasure to be here. The future is both exciting and unpredictable." },
    { "speaker": "[SFX]", "line": "Gentle chime sound to transition to the main topic." }
  ]
}

Now, please process the following document content and generate the podcast title, summary, and script in the specified JSON format.

Document Content:
{{{documentContent}}}

Remember to format your entire response as a single JSON object. Do not include any text or formatting outside of the JSON object.`,
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
