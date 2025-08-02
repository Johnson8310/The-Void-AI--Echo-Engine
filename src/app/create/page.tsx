
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generatePodcastScript } from "@/ai/flows/generate-podcast-script";
import { synthesizePodcastAudio, SynthesizePodcastAudioInput } from "@/ai/flows/synthesize-podcast-audio";
import { saveProject, getProject, updateProject, Project } from "@/services/project-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, FileText, Download, Play, Wand2, Save, Quote, Info, Smile } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_VOICES } from "@/constants/voices";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type VoiceConfig = Record<string, { voiceName: string }>;
type SynthesisMode = "single" | "multiple";
const TONES = ["Conversational", "Formal", "Humorous", "Dramatic", "Authoritative"];


export default function CreatePodcastPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [projectTitle, setProjectTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [summary, setSummary] = useState("");
  const [script, setScript] = useState("");
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [synthesisMode, setSynthesisMode] = useState<SynthesisMode>("single");
  const [singleVoiceName, setSingleVoiceName] = useState<string>(AI_VOICES[0].value);
  const [tone, setTone] = useState<string>(TONES[0]);


  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId);

  useEffect(() => {
    if (projectId && user) {
      setIsLoadingProject(true);
      getProject(projectId, user.uid)
        .then((project) => {
          if (project) {
            setProjectTitle(project.title);
            setDocumentContent(project.originalContent);
            setSummary(project.summary || "");
            setScript(project.script);
            setVoiceConfig(project.voiceConfig || {});
            setAudioUrl(project.audioUrl);
            if (project.voiceConfig && !project.voiceConfig['__default']) {
              setSynthesisMode("multiple");
            } else if (project.voiceConfig && project.voiceConfig['__default']) {
              setSingleVoiceName(project.voiceConfig['__default'].voiceName)
            }
          } else {
            toast({ title: "Error", description: "Project not found or you don't have access.", variant: "destructive" });
            router.push('/create');
          }
        })
        .catch(err => {
            console.error(err);
            toast({ title: "Error", description: "Failed to load project.", variant: "destructive" });
        })
        .finally(() => setIsLoadingProject(false));
    }
  }, [projectId, user, router, toast]);

  const speakers = useMemo(() => {
    if (!script) return [];
    const speakerRegex = /(^.+?):/gm;
    const matches = script.match(speakerRegex);
    if (!matches) return [];
    const uniqueSpeakers = [...new Set(matches.map(s => s.slice(0, -1).trim()))];
    return uniqueSpeakers;
  }, [script]);

  useEffect(() => {
    // Initialize voice config when speakers are identified
    if (synthesisMode === 'multiple' && speakers.length > 0) {
      const newConfig = { ...voiceConfig };
      let changed = false;
      speakers.forEach(speaker => {
        if (!newConfig[speaker]) {
          newConfig[speaker] = { voiceName: AI_VOICES[0].value };
          changed = true;
        }
      });
      if (changed) {
        setVoiceConfig(newConfig);
      }
    }
  }, [speakers, synthesisMode]);


  const handleGenerateScript = async () => {
    if (!documentContent.trim()) {
      toast({ title: "Error", description: "Document content cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoadingScript(true);
    setScript("");
    setSummary("");
    setAudioUrl(null);
    setVoiceConfig({});
    try {
      const result = await generatePodcastScript({ documentContent, tone });
      setScript(result.podcastScript);
      setProjectTitle(result.title);
      setSummary(result.summary);
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
    setIsLoadingAudio(true);
    setAudioUrl(null);

    let synthesisInput: SynthesizePodcastAudioInput;

    if (synthesisMode === 'single') {
        synthesisInput = {
            script,
            voiceConfig: {
                __default: { voiceName: singleVoiceName }
            }
        };
    } else {
        const missingVoices = speakers.filter(speaker => !voiceConfig[speaker]?.voiceName);
        if (missingVoices.length > 0) {
            toast({ title: "Voice configuration missing", description: `Please select a voice for all speakers: ${missingVoices.join(', ')}`, variant: "destructive" });
            setIsLoadingAudio(false);
            return;
        }
        synthesisInput = {
            script,
            voiceConfig,
        };
    }

    try {
      const response = await fetch('/api/v1/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(synthesisInput),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAudioUrl(result.audioUrl);

      toast({ title: "Success!", description: "Your podcast audio has been generated." });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Audio Synthesis Failed", description: error.message || "An error occurred while synthesizing the audio.", variant: "destructive" });
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
    
    let finalVoiceConfig = voiceConfig;
    if (synthesisMode === 'single') {
        finalVoiceConfig = { '__default': { voiceName: singleVoiceName } };
    }

    try {
        if(projectId) {
            const projectDataToUpdate = {
                title: projectTitle,
                originalContent: documentContent,
                script,
                summary,
                voiceConfig: finalVoiceConfig,
                audioUrl,
            };
            await updateProject(projectId, projectDataToUpdate);
            toast({ title: "Project Updated!", description: `"${projectTitle}" has been updated successfully.` });
            router.push("/projects");
        } else {
            const projectData = {
                title: projectTitle,
                originalContent: documentContent,
                script,
                summary,
                voiceConfig: finalVoiceConfig,
                audioUrl,
                userId: user.uid,
            };
            const newProjectId = await saveProject(projectData);
            toast({ title: "Project Saved!", description: `"${projectTitle}" has been saved successfully.` });
            router.push(`/create?projectId=${newProjectId}`);
        }
    } catch (error) {
        console.error("Failed to save project:", error);
        toast({ title: "Save Failed", description: "An error occurred while saving the project.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  }

  const isSynthesizeDisabled = isLoadingAudio || !script;

  if (isLoadingProject) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">{projectId ? 'Edit Podcast' : 'Create a Podcast'}</h1>
        <p className="text-muted-foreground mt-2">{projectId ? 'Modify your project below.' : 'Follow the steps below to turn your document into a podcast.'}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-4">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/> 1. Provide Your Content</CardTitle>
              <CardDescription>Paste your document content below and our AI will generate a podcast script.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your article, blog post, or any text here..."
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={12}
                className="text-base"
              />
               <div className="space-y-2">
                <Label className="flex items-center gap-2"><Smile className="text-primary"/> Select Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">The AI will generate the script in the selected tone.</p>
              </div>
            </CardContent>
            <CardContent>
              <Button onClick={handleGenerateScript} disabled={isLoadingScript || !documentContent}>
                {isLoadingScript ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Generate Script & Title
              </Button>
            </CardContent>
          </Card>
          
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="text-primary"/> AI-Generated Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{summary}</p>
              </CardContent>
            </Card>
          )}

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
              <CardDescription>Generate your audio with AI voices.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <RadioGroup value={synthesisMode} onValueChange={(v) => setSynthesisMode(v as SynthesisMode)} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Single Voice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple" id="multiple" />
                        <Label htmlFor="multiple">Multi-Voice</Label>
                    </div>
                </RadioGroup>

                {synthesisMode === 'single' ? (
                    <div className="space-y-2">
                      <Label>Select AI Voice</Label>
                      <Select value={singleVoiceName} onValueChange={setSingleVoiceName}>
                        <SelectTrigger>
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
                      <p className="text-sm text-muted-foreground">
                        Choose a single voice for the entire podcast.
                      </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <p className="text-sm text-muted-foreground">
                            Assign a unique voice to each speaker.
                        </p>
                        {speakers.length > 0 ? speakers.map(speaker => (
                            <div key={speaker} className="space-y-2">
                                <Label>{speaker}</Label>
                                <Select
                                    value={voiceConfig[speaker]?.voiceName || ''}
                                    onValueChange={voiceName => setVoiceConfig(prev => ({...prev, [speaker]: {voiceName}}))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select voice for ${speaker}`} />
                                    </Tagger>
                                    <SelectContent>
                                        {AI_VOICES.map((voice) => (
                                            <SelectItem key={voice.value} value={voice.value}>
                                            {voice.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )) : (
                            <p className="text-sm text-center text-muted-foreground py-4">No speakers detected in script. Please add speaker cues like "Host:" or "Speaker 1:".</p>
                        )}
                    </div>
                )}


              <Button onClick={handleSynthesizeAudio} disabled={isSynthesizeDisabled}>
                {isLoadingAudio ? <Loader2 className="animate-spin" /> : <Play />}
                Synthesize Podcast
              </Button>
            </CardContent>
          </Card>

          {(isLoadingAudio || audioUrl || script) && (
            <Card>
              <CardHeader>
                <CardTitle>4. Preview &amp; Export</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 items-center">
                {isLoadingAudio && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <span>Synthesizing...</span>
                  </div>
                )}
                {audioUrl && !isLoadingAudio && (
                  <>
                    <audio controls src={audioUrl} className="w-full">Your browser does not support the audio element.</audio>
                  </>
                )}
                {script && (
                    <div className="w-full flex flex-col gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="project-title">Project Title</Label>
                            <Input id="project-title" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Enter project title" />
                        </div>
                        <Button onClick={handleSaveProject} disabled={isSaving || !projectTitle}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                            {projectId ? 'Update Project' : 'Save Project'}
                        </Button>
                        {audioUrl && (
                          <Button asChild className="w-full" variant="outline">
                          <a href={audioUrl} download={`${projectTitle.replace(/\s/g, '_') || 'podcast'}.wav`}>
                              <Download className="mr-2 h-4 w-4" />
                              Download .wav
                          </a>
                          </Button>
                        )}
                    </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
