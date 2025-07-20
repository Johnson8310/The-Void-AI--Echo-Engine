// Synthesize Podcast Audio
'use server';
/**
 * @fileOverview Generates the podcast audio file from the edited script using the selected AI voices.
 *
 * - synthesizePodcastAudio - A function that handles the podcast audio synthesis process.
 * - SynthesizePodcastAudioInput - The input type for the synthesizePodcastAudio function.
 * - SynthesizePodcastAudioOutput - The return type for the synthesizePodcastAudioOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const SynthesizePodcastAudioInputSchema = z.object({
  script: z.string().describe('The edited script with speaker cues.'),
  voiceConfig: z.record(z.string(), z.object({
    voiceName: z.string().describe('The name of the AI voice to use for the speaker.'),
  })).describe('A map of speaker names to voice configurations.'),
});

export type SynthesizePodcastAudioInput = z.infer<typeof SynthesizePodcastAudioInputSchema>;

const SynthesizePodcastAudioOutputSchema = z.object({
  podcastAudioUri: z.string().describe('The data URI of the generated podcast audio file in WAV format.'),
});

export type SynthesizePodcastAudioOutput = z.infer<typeof SynthesizePodcastAudioOutputSchema>;

export async function synthesizePodcastAudio(input: SynthesizePodcastAudioInput): Promise<SynthesizePodcastAudioOutput> {
  return synthesizePodcastAudioFlow(input);
}

const synthesizePodcastAudioFlow = ai.defineFlow(
  {
    name: 'synthesizePodcastAudioFlow',
    inputSchema: SynthesizePodcastAudioInputSchema,
    outputSchema: SynthesizePodcastAudioOutputSchema,
  },
  async input => {
    const {script, voiceConfig} = input;
    
    // Improved script parsing
    const lines = script.split('\n').filter(line => line.trim() !== '');
    let prompt = '';
    const uniqueSpeakers = new Set<string>();

    for (const line of lines) {
        // Match lines that start with a speaker cue like "Speaker Name:"
        const match = line.match(/^([A-Za-z0-9_ -]+):\s*(.*)$/);
        if (match) {
            const speaker = match[1].trim();
            const text = match[2].trim();
            if (speaker && text) {
                uniqueSpeakers.add(speaker);
                prompt += `${speaker}: ${text}\n`;
            }
        } else {
            // Treat lines without a speaker cue as part of the prompt if they are not just metadata
            if (!line.trim().startsWith('[')) {
                 prompt += `${line}\n`;
            }
        }
    }
    
    if (!prompt.trim()) {
      throw new Error("The script is empty or could not be parsed into valid speaker segments. Please ensure the script format is 'Speaker: Text'.");
    }

    let speechConfig: any;
    const speakersArray = Array.from(uniqueSpeakers);

    if (speakersArray.length > 1) {
        // Multi-speaker logic
        const speakerVoiceConfigs = [];
        for (const speaker of speakersArray) {
            const voice = voiceConfig[speaker]?.voiceName;
            if (!voice) {
              console.warn(`No voice configured for speaker: ${speaker}, skipping.`);
              // If a voice is missing, we might not want to proceed or use a default.
              // For now, we'll continue, but this might result in an API error if the speaker is in the prompt.
              // A better approach might be to throw an error here.
              throw new Error(`No voice configured for speaker: ${speaker}. Please assign a voice on the create page.`);
            }
            speakerVoiceConfigs.push({
                speaker: speaker,
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            });
        }
        speechConfig = { multiSpeakerVoiceConfig: { speakerVoiceConfigs } };
    } else if (speakersArray.length === 1) {
        // Single-speaker logic
        const speaker = speakersArray[0];
        const voice = voiceConfig[speaker]?.voiceName;
        if (!voice) {
            throw new Error(`No voice configured for the only speaker: ${speaker}`);
        }
        speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } };
    } else { // This case handles scripts with no explicit speakers (e.g., a single block of text).
         // Assuming single speaker, but no speaker name is known. Let's find the first configured voice and use it.
         const firstConfiguredVoice = Object.values(voiceConfig)[0]?.voiceName;
         if (!firstConfiguredVoice) {
             throw new Error("The script has no speakers, and no default voice is configured.");
         }
         speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: firstConfiguredVoice } } };
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: speechConfig,
      },
      prompt: prompt,
    });

    if (!media) {
      throw new Error('No media returned from TTS generation.');
    }

    const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
    );

    const podcastAudioUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
    return {podcastAudioUri};
  }
);

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        let bufs = [] as any[];
        writer.on('error', reject);
        writer.on('data', function (d) {
            bufs.push(d);
        });
        writer.on('end', function () {
            resolve(Buffer.concat(bufs).toString('base64'));
        });

        writer.write(pcmData);
        writer.end();
    });
}
