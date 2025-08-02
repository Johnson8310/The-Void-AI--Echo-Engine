"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AI_VOICES } from "@/constants/voices";
import { customizeAiVoice } from "@/ai/flows/customize-ai-voice";

// Mock speakers - in a real app, this might come from a user's script analysis
const MOCK_SPEAKERS = ["Host", "Expert", "Narrator"];

export default function VoiceLabPage() {
  const [voiceSettings, setVoiceSettings] = useState<Record<string, string>>(() => {
    const initialSettings: Record<string, string> = {};
    MOCK_SPEAKERS.forEach(speaker => {
      initialSettings[speaker] = AI_VOICES[0].value;
    });
    return initialSettings;
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVoiceChange = (speakerName: string, voiceName: string) => {
    setVoiceSettings(prev => ({ ...prev, [speakerName]: voiceName }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    toast({ title: "Saving...", description: "Updating voice configurations." });
    try {
      // In a real scenario, you might want to save all changes at once
      // For this example, we'll just show one notification after all calls.
      for (const speakerName in voiceSettings) {
        await customizeAiVoice({
          speakerName,
          voiceName: voiceSettings[speakerName]
        });
      }
      toast({
        title: "Success!",
        description: "Voice settings have been saved.",
      });
    } catch (error) {
      console.error("Failed to save voice settings:", error);
      toast({
        title: "Error",
        description: "Could not save voice settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Voice Lab</h1>
        <p className="text-muted-foreground mt-2">
          Customize and manage the AI voices for your podcast speakers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Speaker Voice Assignment
          </CardTitle>
          <CardDescription>
            Assign a unique AI voice to each speaker role found in your scripts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {MOCK_SPEAKERS.map((speaker) => (
            <div key={speaker} className="flex items-center justify-between gap-4 p-4 border rounded-lg">
              <Label htmlFor={`voice-select-${speaker}`} className="text-lg font-medium">{speaker}</Label>
              <Select
                value={voiceSettings[speaker]}
                onValueChange={(value) => handleVoiceChange(speaker, value)}
              >
                <SelectTrigger id={`voice-select-${speaker}`} className="w-[250px]">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {AI_VOICES.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
        <CardContent>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Save />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
      
       <Card className="mt-4 border-dashed">
        <CardHeader>
          <CardTitle>Coming Soon: Voice Cloning</CardTitle>
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
