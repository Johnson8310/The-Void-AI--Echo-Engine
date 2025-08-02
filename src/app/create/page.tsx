
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generatePodcastScript, GeneratePodcastScriptOutput, ScriptLine } from "@/ai/flows/generate-podcast-script";
import { SynthesizePodcastAudioInput } from "@/ai/flows/synthesize-podcast-audio";
import { analyzeScriptForCoaching, AnalyzeScriptOutput } from "@/ai/flows/sound-coach";
import { saveProject, getProject, updateProject } from "@/services/project-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mic, FileText, Download, Play, Wand2, Save, Quote, Info, Smile, Plus, Music, Sparkles, SlidersHorizontal, BrainCircuit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_VOICES } from "@/constants/voices";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SceneBuilder } from "@/components/scene-builder";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type VoiceConfig = Record<string, { voiceName: string }>;
type SynthesisMode = "single" | "multiple";
const TONES = ["Conversational", "Formal", "Humorous", "Dramatic", "Authoritative"];

const PRESETS = [
  { id: 'solo', name: 'Solo Monologue', tone: 'Conversational', addMusicAndSfx: false, description: "A single-speaker narrative." },
  { id: 'interview', name: 'Interview', tone: 'Conversational', addMusicAndSfx: true, description: "A Q&A between a host and guest." },
  { id: 'news', name: 'News Report', tone: 'Formal', addMusicAndSfx: true, description: "A structured, informative report." },
  { id: 'story', name: 'Audio Drama', tone: 'Dramatic', addMusicAndSfx: true, description: "A rich, story-driven performance." },
];

export default function CreatePodcastPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [projectTitle, setProjectTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [summary, setSummary] = useState("");
  const [script, setScript] = useState<ScriptLine[]>([]);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [synthesisMode, setSynthesisMode] = useState<SynthesisMode>("single");
  const [singleVoiceName, setSingleVoiceName] = useState<string>(AI_VOICES[0].value);
  const [tone, setTone] = useState<string>(TONES[0]);
  const [addMusicAndSfx, setAddMusicAndSfx] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [coachingNotes, setCoachingNotes] = useState<AnalyzeScriptOutput['coachingNotes']>([]);

  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (projectId && user) {
      setIsLoadingProject(true);
      getProject(projectId, user.uid)
        .then((project) => {
          if (project) {
            setProjectTitle(project.title);
            setDocumentContent(project.originalContent);
            setSummary(project.summary || "");
            setScript(project.script || []);
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
    const uniqueSpeakers = [...new Set(script.map(line => line.speaker).filter(s => s && !s.startsWith('[')).map(s => s.trim()).filter(Boolean))];
    return uniqueSpeakers;
  }, [script]);

  useEffect(() => {
    // Initialize voice config when speakers are identified
    if (synthesisMode === 'multiple' && speakers.length > 0) {
      const newConfig = { ...voiceConfig };
      let changed = false;
      speakers.forEach((speaker) => {
        if (!newConfig[speaker]) {
          newConfig[speaker] = { voiceName: AI_VOICES[0].value };
          changed = true;
        }
      });
      if (changed) {
        setVoiceConfig(newConfig);
      }
    }
  }, [speakers, synthesisMode, voiceConfig]);


  const handleGenerateScript = async () => {
    if (!documentContent.trim()) {
      toast({ title: "Error", description: "Document content cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoadingScript(true);
    setScript([]);
    setSummary("");
    setAudioUrl(null);
    setVoiceConfig({});
    setCoachingNotes([]);
    try {
      const result: GeneratePodcastScriptOutput = await generatePodcastScript({ documentContent, tone, addMusicAndSfx });
      setScript(result.script);
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
    const scriptText = script.map(line => `${line.speaker}: ${line.line}`).join('\n');
    if (!scriptText.trim()) {
      toast({ title: "Error", description: "Script cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoadingAudio(true);
    setAudioUrl(null);

    let synthesisInput: SynthesizePodcastAudioInput;

    if (synthesisMode === 'single') {
        synthesisInput = {
            script: scriptText,
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
            script: scriptText,
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

  const handleAnalyzeScript = async () => {
    const scriptText = script.map(line => `${line.speaker}: ${line.line}`).join('\n');
    if (!scriptText.trim()) {
      toast({ title: "Error", description: "Script cannot be empty.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    try {
        const result = await analyzeScriptForCoaching({ script: scriptText });
        setCoachingNotes(result.coachingNotes);
        toast({ title: "Analysis Complete", description: "The AI coach has provided feedback." });
    } catch (error) {
        console.error("Failed to analyze script:", error);
        toast({ title: "Analysis Failed", description: "Could not get feedback from the AI coach.", variant: "destructive" });
    } finally {
        setIsAnalyzing(false);
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
  };

  const handleAddScene = () => {
    setScript(prev => [...prev, { speaker: speakers[0] || "New Speaker", line: "" }]);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
        setTone(preset.tone);
        setAddMusicAndSfx(preset.addMusicAndSfx);
        setActivePreset(presetId);
    }
  };


  const isSynthesizeDisabled = isLoadingAudio || script.length === 0;

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
              <CardDescription>Paste your document content below. Use a preset for quick setup or configure manually.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your article, blog post, or any text here..."
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={8}
                className="text-base"
              />
              <div className="space-y-3">
                 <Label className="flex items-center gap-2"><SlidersHorizontal className="text-primary"/> Podcast Presets</Label>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PRESETS.map(preset => (
                        <Button
                            key={preset.id}
                            variant={activePreset === preset.id ? "default" : "outline"}
                            onClick={() => handleSelectPreset(preset.id)}
                            className="h-auto flex-col items-start p-3 text-left"
                        >
                            <div className="font-bold">{preset.name}</div>
                            <div className="text-xs font-normal text-muted-foreground">{preset.description}</div>
                        </Button>
                    ))}
                 </div>
              </div>
              <div className="flex flex-wrap gap-6 border-t pt-4">
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
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Music className="text-primary"/> Audio Enhancements</Label>
                   <div className="flex items-center space-x-2">
                    <Switch id="music-sfx" checked={addMusicAndSfx} onCheckedChange={setAddMusicAndSfx} />
                    <Label htmlFor="music-sfx">Auto-generate Music & SFX</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">The AI will add music and sound effect cues.</p>
                </div>
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

          {script.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Mic className="text-primary"/> 2. Edit Your Script</div>
                    <Button variant="outline" size="sm" onClick={handleAddScene}><Plus className="mr-2"/> Add Scene</Button>
                </CardTitle>
                <CardDescription>Refine the generated script below. You can edit text, change speakers, and drag to reorder scenes.</CardDescription>
              </CardHeader>
              <CardContent>
                <SceneBuilder scenes={script} setScenes={setScript} speakers={speakers} />
              </CardContent>
            </Card>
          )}

          {script.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> AI Sound Coach</CardTitle>
                    <CardDescription>Get feedback from our AI on how to improve your podcast's delivery and production.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleAnalyzeScript} disabled={isAnalyzing}>
                        {isAnalyzing ? <Loader2 className="animate-spin"/> : <Sparkles />}
                        Analyze Script
                    </Button>
                    {coachingNotes.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {coachingNotes.map((note, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                                    <span className="font-bold text-primary">{note.category} (Line ~{note.lineNumber}):</span> {note.note}
                                </div>
                            ))}
                        </div>
                    )}
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

          {(isLoadingAudio || audioUrl || script.length > 0) && (
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
                {script.length > 0 && (
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
