
'use server';
/**
 * @fileOverview Generates the podcast audio file from the edited script using the selected AI voices.
 *
 * - synthesizePodcastAudio - A function that handles the podcast audio synthesis process.
 * - SynthesizePodcastAudioInput - The input type for the synthesizePodcastAudio function.
 * - SynthesizePodcastAudioOutput - The return type for the synthesizePodcastAudioOutput function.
 */

import {z} from 'zod';

const SynthesizePodcastAudioInputSchema = z.object({
  script: z.string().describe('The edited script with speaker cues.'),
  voiceId: z.string().describe('The ElevenLabs voice ID to use for synthesis.'),
});

export type SynthesizePodcastAudioInput = z.infer<
  typeof SynthesizePodcastAudioInputSchema
>;

const SynthesizePodcastAudioOutputSchema = z.object({
  podcastAudioUri: z
    .string()
    .describe(
      'The data URI of the generated podcast audio file in WAV format.'
    ),
});

export type SynthesizePodcastAudioOutput = z.infer<
  typeof SynthesizePodcastAudioOutputSchema
>;

export async function synthesizePodcastAudio(
  input: SynthesizePodcastAudioInput
): Promise<SynthesizePodcastAudioOutput> {
    const { script, voiceId } = input;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        throw new Error("ElevenLabs API key is not configured.");
    }
    if (!script.trim()) {
        throw new Error("Script cannot be empty.");
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
        },
        body: JSON.stringify({
            text: script,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: true,
            }
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("ElevenLabs API Error:", errorBody);
        throw new Error(`Failed to synthesize audio with ElevenLabs: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    
    return { podcastAudioUri: `data:audio/mpeg;base64,${audioBase64}` };
}
