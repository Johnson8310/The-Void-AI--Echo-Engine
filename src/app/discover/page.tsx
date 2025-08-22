
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, UserPlus, Heart, MessageSquare, Loader2, Compass, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPublicProjects, Project } from "@/services/project-service";

export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPublicProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Discover</h1>
        <p className="text-muted-foreground mt-2">
          Explore featured podcasts and get inspired by the community.
        </p>
      </div>

       {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="mt-8 text-center border-dashed flex flex-col items-center justify-center py-12">
            <CardHeader>
                <Compass className="h-12 w-12 text-muted-foreground mx-auto" />
                <CardTitle>The Stage is Empty</CardTitle>
                <CardDescription>There are no public podcasts yet. Be the first to share your creation!</CardDescription>
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
            <Card key={project.id} className="flex flex-col overflow-hidden group">
              <div className="relative">
                  <Image 
                      src="https://placehold.co/600x400.png"
                      alt={project.title} 
                      width={600} 
                      height={400} 
                      className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="technology abstract"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                      <h2 className="text-xl font-bold text-white">{project.title}</h2>
                  </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    {/* In a real app, you would fetch author details based on project.userId */}
                    <span className="font-medium text-foreground">Anonymous Creator</span>
                    <Button variant="outline" size="sm" className="rounded-full" disabled>
                          <UserPlus className="mr-2 h-4 w-4"/>
                          Follow
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground flex-1 mb-4">
                  {project.summary}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors" disabled>
                          <Heart className="h-4 w-4"/>
                          <span>0</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors" disabled>
                          <MessageSquare className="h-4 w-4"/>
                          <span>0</span>
                      </button>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/share/${project.id}`}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Listen Now
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
