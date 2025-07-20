// Synthesize Podcast Audio
'use server';
/**
 * @fileOverview Generates the podcast audio file from the edited script using the selected AI voices.
 *
 * - synthesizePodcastAudio - A function that handles the podcast audio synthesis process.
 * - SynthesizePodcastAudioInput - The input type for the synthesizePodcastAudio function.
 * - SynthesizePodcastAudioOutput - The return type for the synthesizePodcastAudio function.
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

    // Split the script into segments based on speaker cues.
    const segments = script.split(/\n(?=[A-Za-z0-9 ]+:)/);

    let multiSpeakerVoiceConfig = {
        speakerVoiceConfigs: [] as any
    }
    let prompt = '';
    for (const segment of segments) {
      const [speaker, text] = segment.split(/:(.*)/s).map(s => s.trim());
      if (!speaker || !text) {
        continue;
      }

      const voice = voiceConfig[speaker]?.voiceName;
      if (!voice) {
        console.warn(`No voice configured for speaker: ${speaker}, skipping segment.`);
        continue;
      }

      multiSpeakerVoiceConfig.speakerVoiceConfigs.push({
        speaker: speaker,
        voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
        },
      });

      prompt += `${speaker}: ${text}\n`;
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            multiSpeakerVoiceConfig: multiSpeakerVoiceConfig,
        },
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

