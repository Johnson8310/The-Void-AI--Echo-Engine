// Synthesize Podcast Audio
'use server';
/**
 * @fileOverview Generates the podcast audio file from the edited script using the selected AI voices.
 *
 * - synthesizePodcastAudio - A function that handles the podcast audio synthesis process.
 * - SynthesizePodcastAudioInput - The input type for the synthesizePodcastAudio function.
 * - SynthesizePodcastAudioOutput - The return type for the synthesizePodcastAudioOutput function.
 */

import {z} from 'zod';
import wav from 'wav';
import {elevenlabs} from 'elevenlabs';
import {Readable} from 'stream';

const elevenlabsClient = new elevenlabs({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
});

const SynthesizePodcastAudioInputSchema = z.object({
  script: z.string().describe('The edited script with speaker cues.'),
  // voiceConfig is kept for schema compatibility but will not be used with ElevenLabs for now.
  voiceConfig: z
    .record(
      z.string(),
      z.object({
        voiceName: z
          .string()
          .describe('The name of the AI voice to use for the speaker.'),
      })
    )
    .describe('A map of speaker names to voice configurations.'),
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

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function synthesizePodcastAudio(
  input: SynthesizePodcastAudioInput
): Promise<SynthesizePodcastAudioOutput> {
  const {script} = input;

  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error(
      'ElevenLabs API key is not configured. Please add it to your .env file.'
    );
  }

  const lines = script.split('\n').filter((line) => line.trim() !== '');
  let textToSynthesize = '';

  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_ -]+):\s*(.*)$/);
    if (match) {
      const text = match[2].trim();
      if (text) {
        textToSynthesize += text + '\n';
      }
    } else {
      textToSynthesize += line + '\n';
    }
  }

  if (!textToSynthesize.trim()) {
    throw new Error(
      "The script is empty or could not be parsed into valid speaker segments. Please ensure the script has text to speak."
    );
  }

  try {
    const audioStream = await elevenlabsClient.generate({
      voice: 'Rachel',
      text: textToSynthesize,
      model_id: 'eleven_multilingual_v2',
      output_format: 'pcm_24000',
    });

    const audioBuffer = await streamToBuffer(audioStream as Readable);

    const podcastAudioUri =
      'data:audio/wav;base64,' + (await toWav(audioBuffer));
    return {podcastAudioUri};
  } catch (error: any) {
    console.error('Error with ElevenLabs API:', error);
    throw new Error(`Failed to synthesize audio with ElevenLabs: ${error.message}`);
  }
}

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

    const bufs: any[] = [];
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
