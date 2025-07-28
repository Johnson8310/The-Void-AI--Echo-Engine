
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ApiAccessPage() {
  const curlExample = `curl -X POST \\
  'YOUR_APP_URL/api/v1/synthesize' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "script": "Host: Hello world! This is a test. Expert: And this is the second speaker.",
    "voiceConfig": {
      "Host": { "voiceName": "algenib" },
      "Expert": { "voiceName": "gacrux" }
    }
  }'`;

  const singleVoiceCurlExample = `curl -X POST \\
  'YOUR_APP_URL/api/v1/synthesize' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "script": "Host: Hello everyone. Welcome to the show.",
    "voiceConfig": {
      "__default": { "voiceName": "zephyr" }
    }
  }'`;
  
  const responseExample = `{
  "audioUrl": "data:audio/wav;base64,UklGRiS..."
}`;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">API Access</h1>
        <p className="text-muted-foreground mt-2">
          Integrate The Void AI's power into your own applications.
        </p>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="text-primary" />
            Text-to-Speech API (Google AI)
          </CardTitle>
          <CardDescription>
            Unlock programmatic access to our multi-voice synthesis engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><Badge>POST</Badge> <span>/api/v1/synthesize</span></h3>
            <p className="text-sm text-muted-foreground">This endpoint converts a script into a WAV audio file, returned as a base64 data URI.</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">Request Body</h3>
            <Card className="bg-background/50">
                <CardContent className="p-4">
                <code className="text-sm font-mono whitespace-pre-wrap">
                    {`{
  "script": "<string>",
  "voiceConfig": {
    "SpeakerName1": { "voiceName": "<string>" },
    "SpeakerName2": { "voiceName": "<string>" },
    "__default": { "voiceName": "<string>" }
  }
}`}
                </code>
                </CardContent>
            </Card>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li><code className="font-mono text-xs bg-muted p-1 rounded">script</code>: The full podcast script. Speaker cues (e.g., "Host:") are required for multi-voice synthesis.</li>
              <li><code className="font-mono text-xs bg-muted p-1 rounded">voiceConfig</code>: An object mapping speaker names from the script to their desired AI voice name.</li>
              <li>Use the special <code className="font-mono text-xs bg-muted p-1 rounded">__default</code> key to specify a single voice for the entire script or for any speakers not explicitly defined in the config.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><Terminal/> Multi-Voice Example (cURL)</h3>
            <div className="bg-card p-4 rounded-md text-sm font-mono overflow-x-auto text-white bg-black">
                <pre><code>{curlExample}</code></pre>
            </div>
          </section>

           <section className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><Terminal/> Single-Voice Example (cURL)</h3>
            <div className="bg-card p-4 rounded-md text-sm font-mono overflow-x-auto text-white bg-black">
                <pre><code>{singleVoiceCurlExample}</code></pre>
            </div>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-semibold">Example Response</h3>
             <div className="bg-card p-4 rounded-md text-sm font-mono overflow-x-auto text-white bg-black">
                <pre><code>{responseExample}</code></pre>
            </div>
            <p className="text-sm text-muted-foreground">The <code className="font-mono text-xs bg-muted p-1 rounded">audioUrl</code> is a base64-encoded data URI that can be used directly in an HTML <code className="font-mono text-xs bg-muted p-1 rounded">&lt;audio&gt;</code> tag.</p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
