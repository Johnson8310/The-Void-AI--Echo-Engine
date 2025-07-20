import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ApiAccessPage() {
  const curlExample = `curl -X POST \\
  'YOUR_APP_URL/api/v1/synthesize' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "script": "Speaker 1: Hello world! This is a test. Speaker 2: And this is the second speaker.",
    "voiceConfig": {
      "Speaker 1": { "voiceName": "algenib" },
      "Speaker 2": { "voiceName": "zephyr" }
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
            Text-to-Speech API
          </CardTitle>
          <CardDescription>
            Unlock programmatic access to our voice synthesis engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><Badge>POST</Badge> <span>/api/v1/synthesize</span></h3>
            <p className="text-sm text-muted-foreground">This endpoint converts a script with speaker cues into a WAV audio file, returned as a base64 data URI.</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">Request Body</h3>
            <Card className="bg-background/50">
                <CardContent className="p-4">
                <code className="text-sm font-mono whitespace-pre-wrap">
                    {`{
  "script": "<string>",
  "voiceConfig": {
    "<SpeakerName>": { "voiceName": "<VoiceModelName>" }
  }
}`}
                </code>
                </CardContent>
            </Card>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li><code className="font-mono text-xs bg-muted p-1 rounded">script</code>: The full podcast script. Use speaker cues like "Speaker Name: message".</li>
              <li><code className="font-mono text-xs bg-muted p-1 rounded">voiceConfig</code>: An object mapping each speaker name from the script to a voice model.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><Terminal/> Example Request (cURL)</h3>
            <div className="bg-card p-4 rounded-md text-sm font-mono overflow-x-auto text-white bg-black">
                <pre><code>{curlExample}</code></pre>
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
