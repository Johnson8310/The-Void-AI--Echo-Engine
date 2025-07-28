
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
import { ElevenLabsClient } from 'elevenlabs';
import {Readable} from 'stream';

const elevenlabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
});

const SynthesizePodcastAudioInputSchema = z.object({
  script: z.string().describe('The edited script with speaker cues.'),
  voiceConfig: z
    .record(z.string(), z.object({voiceId: z.string()}))
    .describe(
      'A map of speaker names to their ElevenLabs voice IDs. A special `__default` key can be used for a single voice.'
    ),
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

interface Segment {
  text: string;
  voiceId: string;
}

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
  const {script, voiceConfig} = input;

  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error(
      'ElevenLabs API key is not configured. Please add it to your .env file.'
    );
  }

  const lines = script.split('\n').filter((line) => line.trim() !== '');
  const segments: Segment[] = [];
  const defaultVoiceId = voiceConfig['__default']?.voiceId;

  if (!defaultVoiceId && Object.keys(voiceConfig).length === 0) {
     throw new Error(
      'No voice configuration provided. Please select a default voice or voices for speakers.'
    );
  }

  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_ -]+):\s*(.*)$/);
    if (match) {
      const speaker = match[1].trim();
      const text = match[2].trim();
      if (text) {
        const voiceId = voiceConfig[speaker]?.voiceId || defaultVoiceId;
        if (!voiceId) {
          throw new Error(`Voice not configured for speaker: ${speaker}`);
        }
        segments.push({ text, voiceId });
      }
    } else if (defaultVoiceId && line.trim()) {
      // Line without a speaker cue, use default voice
      segments.push({ text: line.trim(), voiceId: defaultVoiceId });
    }
  }

  if (segments.length === 0) {
    throw new Error(
      "The script is empty or could not be parsed into valid speaker segments. Please ensure the script has text to speak."
    );
  }

  try {
    const audioBuffers: Buffer[] = [];
    for (const segment of segments) {
      const audioStream = await elevenlabsClient.generate({
        voice: segment.voiceId,
        text: segment.text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'pcm_24000',
      });
      const buffer = await streamToBuffer(audioStream as Readable);
      audioBuffers.push(buffer);
    }

    const combinedBuffer = Buffer.concat(audioBuffers);

    const podcastAudioUri =
      'data:audio/wav;base64,' + (await toWav(combinedBuffer));
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
