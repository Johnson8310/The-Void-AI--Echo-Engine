
'use server';

/**
 * @fileOverview An AI Sound Coach that analyzes a podcast script and provides production feedback.
 *
 * - analyzeScriptForCoaching - A function that takes a script and returns production notes.
 * - AnalyzeScriptInput - The input type for the analyzeScriptForCoaching function.
 * - AnalyzeScriptOutput - The return type for the analyzeScriptForCoaching function.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnalyzeScriptInputSchema = z.object({
  script: z.string().describe('The podcast script to be analyzed.'),
});
export type AnalyzeScriptInput = z.infer<typeof AnalyzeScriptInputSchema>;

const CoachingNoteSchema = z.object({
    lineNumber: z.number().describe('The approximate line number in the script this note refers to.'),
    note: z.string().describe('The specific coaching suggestion.'),
    category: z.enum(['Pacing', 'Tone', 'SFX', 'Music', 'Engagement']).describe('The category of the suggestion.'),
});

const AnalyzeScriptOutputSchema = z.object({
    coachingNotes: z.array(CoachingNoteSchema).describe("An array of production and coaching notes for the script."),
});
export type AnalyzeScriptOutput = z.infer<typeof AnalyzeScriptOutputSchema>;

export async function analyzeScriptForCoaching(input: AnalyzeScriptInput): Promise<AnalyzeScriptOutput> {
    return analyzeScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'soundCoachPrompt',
    model: gemini15Flash,
    input: { schema: AnalyzeScriptInputSchema },
    output: { schema: AnalyzeScriptOutputSchema },
    prompt: `You are an AI Sound Coach for podcasters. Your task is to analyze the provided script and give actionable feedback to improve the final audio production.

Analyze the script based on the following categories:
-   **Pacing:** Where should the speaker pause? Where should they speed up or slow down?
-   **Tone:** Suggest emotional delivery. Should a line be delivered with more energy, suspense, or humor?
-   **SFX:** Recommend specific sound effects to enhance storytelling.
-   **Music:** Suggest where background music should start, stop, or change in mood.
--  **Engagement:** Suggest ways to make the script more engaging for the listener.

For each piece of feedback, provide the approximate line number it refers to.

Here is an example of the desired JSON output format:
{
  "coachingNotes": [
    { "lineNumber": 2, "category": "Pacing", "note": "Consider adding a brief pause after this line to build suspense." },
    { "lineNumber": 5, "category": "Tone", "note": "Try a more energetic and upbeat tone for this section to engage the listener." },
    { "lineNumber": 8, "category": "SFX", "note": "A subtle 'whoosh' sound effect could transition smoothly into the next topic here." }
  ]
}

Now, please analyze the following script and generate your coaching notes in the specified JSON format.

Script:
{{{script}}}
`,
});

const analyzeScriptFlow = ai.defineFlow(
  {
    name: 'analyzeScriptFlow',
    inputSchema: AnalyzeScriptInputSchema,
    outputSchema: AnalyzeScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
