"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generatePodcastScript } from "@/ai/flows/generate-podcast-script";
import { synthesizePodcastAudio } from "@/ai/flows/synthesize-podcast-audio";
import { saveProject } from "@/services/project-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { AI_VOICES } from "@/constants/voices";
import { Loader2, Mic, FileText, Download, Play, Wand2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type VoiceConfig = Record<string, { voiceName: string }>;

export default function CreatePodcastPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [projectTitle, setProjectTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [script, setScript] = useState("");
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const speakers = useMemo(() => {
    if (!script) return [];
    const speakerRegex = /(^.+?):/gm;
    const matches = script.match(speakerRegex);
    if (!matches) return [];
    const uniqueSpeakers = [...new Set(matches.map(s => s.slice(0, -1).trim()))];
    return uniqueSpeakers;
  }, [script]);

  useEffect(() => {
    const newConfig: VoiceConfig = {};
    let configUpdated = false;

    speakers.forEach((speaker, index) => {
      if (!voiceConfig[speaker]) {
        newConfig[speaker] = { voiceName: AI_VOICES[index % AI_VOICES.length].value };
        configUpdated = true;
      } else {
        newConfig[speaker] = voiceConfig[speaker];
      }
    });

    if (configUpdated || Object.keys(voiceConfig).length !== speakers.length) {
        setVoiceConfig(newConfig);
    }
  }, [speakers, voiceConfig]);

  const handleGenerateScript = async () => {
    if (!documentContent.trim()) {
      toast({ title: "Error", description: "Document content cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoadingScript(true);
    setScript("");
    setAudioUrl(null);
    setVoiceConfig({});
    try {
      const result = await generatePodcastScript({ documentContent });
      setScript(result.podcastScript);
      if (!projectTitle) {
        setProjectTitle("New Podcast Project");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Script Generation Failed", description: "An error occurred while generating the script.", variant: "destructive" });
    } finally {
      setIsLoadingScript(false);
    }
  };
  
  const handleSynthesizeAudio = async () => {
    if (!script.trim()) {
      toast({ title: "Error", description: "Script cannot be empty.", variant: "destructive" });
      return;
    }
    if (Object.keys(voiceConfig).length !== speakers.length) {
      toast({ title: "Error", description: "Please assign a voice to all speakers.", variant: "destructive" });
      return;
    }
    setIsLoadingAudio(true);
    setAudioUrl(null);
    try {
      const result = await synthesizePodcastAudio({ script, voiceConfig });
      setAudioUrl(result.podcastAudioUri);
      toast({ title: "Success!", description: "Your podcast audio has been generated." });
    } catch (error) {
      console.error(error);
      toast({ title: "Audio Synthesis Failed", description: "An error occurred while synthesizing the audio.", variant: "destructive" });
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSaveProject = async () => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to save a project.", variant: "destructive" });
        return;
    }
    if (!projectTitle.trim()) {
        toast({ title: "Save Error", description: "Project title cannot be empty.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        await saveProject({
            title: projectTitle,
            originalContent: documentContent,
            script,
            voiceConfig,
            audioUrl,
            userId: user.uid,
        });
        toast({ title: "Project Saved!", description: `"${projectTitle}" has been saved successfully.` });
        router.push("/projects");
    } catch (error) {
        console.error("Failed to save project:", error);
        toast({ title: "Save Failed", description: "An error occurred while saving the project.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  }

  const handleVoiceChange = (speaker: string, voiceName: string) => {
    setVoiceConfig(prev => ({ ...prev, [speaker]: { voiceName } }));
  };

  const isSynthesizeDisabled = isLoadingAudio || !script || Object.keys(voiceConfig).length !== speakers.length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Create a Podcast</h1>
        <p className="text-muted-foreground mt-2">Follow the steps below to turn your document into a podcast.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-4">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/> 1. Provide Your Content</CardTitle>
              <CardDescription>Paste your document content below and our AI will generate a podcast script.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your article, blog post, or any text here..."
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={12}
                className="text-base"
              />
            </CardContent>
            <CardContent>
              <Button onClick={handleGenerateScript} disabled={isLoadingScript || !documentContent}>
                {isLoadingScript ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Generate Script
              </Button>
            </CardContent>
          </Card>

          {script && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mic className="text-primary"/> 2. Edit Your Script</CardTitle>
                <CardDescription>Refine the generated script below. You can edit text and speakers.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={25}
                  className="text-base font-mono leading-relaxed"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 sticky top-24 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>3. Production Studio</CardTitle>
              <CardDescription>Assign voices and generate your audio.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {speakers.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Voice Assignment</h3>
                  {speakers.map((speaker) => (
                    <div key={speaker} className="space-y-2">
                      <Label htmlFor={`voice-${speaker}`}>{speaker}</Label>
                      <Select
                        value={voiceConfig[speaker]?.voiceName || ''}
                        onValueChange={(value) => handleVoiceChange(speaker, value)}
                      >
                        <SelectTrigger id={`voice-${speaker}`}><SelectValue placeholder="Select a voice" /></SelectTrigger>
                        <SelectContent>
                          {AI_VOICES.map(voice => <SelectItem key={voice.value} value={voice.value}>{voice.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Generate a script to see voice options.</p>
              )}

              <Separator />

              <Button onClick={handleSynthesizeAudio} disabled={isSynthesizeDisabled}>
                {isLoadingAudio ? <Loader2 className="animate-spin" /> : <Play />}
                Synthesize Podcast
              </Button>
            </CardContent>
          </Card>

          {(isLoadingAudio || audioUrl) && (
            <Card>
              <CardHeader>
                <CardTitle>4. Preview &amp; Export</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 items-center">
                {isLoadingAudio && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <span>Synthesizing audio...</span>
                  </div>
                )}
                {audioUrl && !isLoadingAudio && (
                  <>
                    <audio controls src={audioUrl} className="w-full">Your browser does not support the audio element.</audio>
                    <div className="w-full flex flex-col gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="project-title">Project Title</Label>
                            <Input id="project-title" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Enter project title" />
                        </div>
                        <Button onClick={handleSaveProject} disabled={isSaving || !projectTitle}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                            Save Project
                        </Button>
                        <Button asChild className="w-full" variant="outline">
                        <a href={audioUrl} download={`${projectTitle.replace(/\s/g, '_') || 'podcast'}.wav`}>
                            <Download className="mr-2 h-4 w-4" />
                            Download .wav
                        </a>
                        </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
