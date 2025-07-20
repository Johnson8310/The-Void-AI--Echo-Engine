import { config } from 'dotenv';
config();

import '@/ai/flows/synthesize-podcast-audio.ts';
import '@/ai/flows/customize-ai-voice.ts';
import '@/ai/flows/generate-podcast-script.ts';