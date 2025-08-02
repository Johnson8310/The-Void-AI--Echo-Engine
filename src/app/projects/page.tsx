
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getProjects, Project } from "@/services/project-service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, PlusCircle, Mic, FileText, Edit, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getProjects(user.uid)
        .then(setProjects)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">My Projects</h1>
        <p className="text-muted-foreground mt-2">
          View, edit, and manage your saved podcast projects.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : !user ? (
        <Card className="mt-8 text-center">
            <CardHeader>
                <CardTitle>Please Log In</CardTitle>
                <CardDescription>You need to be logged in to view your projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/login">Log In</Link>
                </Button>
            </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card className="mt-8 text-center border-dashed flex flex-col items-center justify-center py-12">
            <CardHeader>
                <CardTitle>No Projects Yet</CardTitle>
                <CardDescription>You haven&apos;t saved any podcasts. Let&apos;s create one!</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/create"><PlusCircle/>Create New Podcast</Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{project.title}</CardTitle>
                <CardDescription>
                  Saved {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {project.summary && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mt-1 shrink-0" /> 
                      <p className="flex-1">{project.summary}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" /> 
                    <span>{project.originalContent ? `${project.originalContent.substring(0, 50)}...` : 'No original content.'}</span>
                </div>
                {project.audioUrl && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mic className="h-4 w-4" /> 
                        <span>Audio generated</span>
                    </div>
                )}
              </CardContent>
              <CardFooter>
                 <Button asChild variant="outline" className="w-full">
                    <Link href={`/create?projectId=${project.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Project
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
