import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import {devLogger} from 'genkit/dev';

export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({
      apiVersion: 'v1beta',
    }),
    devLogger(),
  ],
  logSinks: [devLogger],
  enableTracingAndMetrics: true,
  flowStateStore: 'firebase',
  traceStore: 'firebase',
});
