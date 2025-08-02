
"use client";

import { useEffect, useState } from "react";
import { getPublicProject, Project } from "@/services/project-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bot, Clapperboard, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SharePage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.projectId) {
      getPublicProject(params.projectId)
        .then((proj) => {
          if (proj) {
            setProject(proj);
          } else {
            setError("This podcast is not available. It might be private or has been deleted.");
          }
        })
        .catch(() => setError("An error occurred while trying to load this podcast."))
        .finally(() => setLoading(false));
    }
  }, [params.projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted/20">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted/20">
        <Card className="max-w-md text-center">
            <CardHeader>
                <CardTitle>Oops!</CardTitle>
                <CardDescription>{error || "Could not find the requested podcast."}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Back to Homepage</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="p-4 flex justify-between items-center border-b">
         <Link href="/" className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl tracking-wider">VOID AI</span>
        </Link>
        <Button asChild>
            <Link href="/create">Create Your Own <ExternalLink className="ml-2"/> </Link>
        </Button>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="space-y-6">
            <div className="space-y-2">
                <Badge variant="outline">Podcast Showcase</Badge>
                <h1 className="text-4xl lg:text-5xl font-headline tracking-tight">{project.title}</h1>
                <p className="text-muted-foreground text-lg">
                    Published on {format(new Date(project.updatedAt || project.createdAt), 'MMMM d, yyyy')}
                </p>
            </div>
          
            {project.summary && (
                <p className="text-xl text-muted-foreground font-light border-l-4 border-primary pl-4">{project.summary}</p>
            )}

            {project.audioUrl && (
              <Card className="overflow-hidden shadow-2xl shadow-primary/10">
                <CardContent className="p-4 sm:p-6">
                    <audio controls src={project.audioUrl} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6 pt-6">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clapperboard/> Full Script</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto">
                        {project.script.map((line, index) => (
                            <p key={index}>
                                <strong>{line.speaker}:</strong> {line.line}
                            </p>
                        ))}
                    </CardContent>
                </Card>
                 <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText/> Original Content</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-h-[400px] overflow-y-auto">
                       <p>{project.originalContent}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>

      <footer className="text-center p-8 text-muted-foreground text-sm">
        <p>Generated with The Void AI Echo Engine</p>
      </footer>
    </div>
  );
}
