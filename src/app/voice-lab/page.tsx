import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

export default function VoiceLabPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Voice Lab</h1>
        <p className="text-muted-foreground mt-2">
          Clone voices and fine-tune emotional styles for your podcasts.
        </p>
      </div>
      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            This is where the magic of voice creation happens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Advanced voice cloning and style transfer capabilities are under development. Stay tuned for powerful new ways to customize your audio content!</p>
        </CardContent>
      </Card>
    </div>
  );
}
