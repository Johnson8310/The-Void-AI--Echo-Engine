
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, UserPlus, Heart, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mockPodcasts = [
  {
    id: 1,
    title: "AI & The Future of Work",
    author: "Tech Unfiltered",
    summary: "Exploring how artificial intelligence is reshaping industries and what it means for the future of employment.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "technology abstract",
    likes: 1200,
    comments: 89,
  },
  {
    id: 2,
    title: "The Art of Storytelling",
    author: "Creative Minds",
    summary: "A deep dive into the elements of a compelling narrative, from character development to plot twists.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "writing book",
    likes: 2300,
    comments: 152,
  },
  {
    id: 3,
    title: "Startup Journeys",
    author: "Founder's Fieldnotes",
    summary: "Interviews with successful entrepreneurs sharing their stories of challenge, triumph, and innovation.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "startup business",
    likes: 874,
    comments: 45,
  },
    {
    id: 4,
    title: "A History of Ancient Rome",
    author: "Echoes of Time",
    summary: "Uncover the epic history, influential leaders, and lasting legacy of the Roman Empire in this detailed series.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "roman ruins",
    likes: 5400,
    comments: 320,
  },
  {
    id: 5,
    title: "Wellness Weekly",
    author: "Mind & Body",
    summary: "Actionable tips for improving your mental and physical health, featuring expert advice and practical exercises.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "meditation yoga",
    likes: 980,
    comments: 76,
  },
  {
    id: 6,
    title: "Sci-Fi Shorts",
    author: "Galaxy Gazettes",
    summary: "A collection of short, imaginative science fiction stories that will transport you to other worlds and futures.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "galaxy nebula",
    likes: 3100,
    comments: 250,
  },
];


export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Discover</h1>
        <p className="text-muted-foreground mt-2">
          Explore featured podcasts and get inspired by the community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockPodcasts.map((podcast) => (
          <Card key={podcast.id} className="flex flex-col overflow-hidden group">
             <div className="relative">
                <Image 
                    src={podcast.imageUrl} 
                    alt={podcast.title} 
                    width={600} 
                    height={400} 
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={podcast.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                    <h2 className="text-xl font-bold text-white">{podcast.title}</h2>
                </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="font-medium text-foreground">{podcast.author}</span>
                   <Button variant="outline" size="sm" className="rounded-full">
                        <UserPlus className="mr-2 h-4 w-4"/>
                        Follow
                   </Button>
              </div>
              <p className="text-sm text-muted-foreground flex-1 mb-4">
                {podcast.summary}
              </p>
               <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Heart className="h-4 w-4"/>
                        <span>{podcast.likes.toLocaleString()}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4"/>
                        <span>{podcast.comments.toLocaleString()}</span>
                    </button>
               </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
               <Button asChild className="w-full">
                  <Link href="#">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Listen Now
                  </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <Card className="mt-4 border-dashed">
        <CardHeader>
          <CardTitle>Feature Coming Soon</CardTitle>
          <CardDescription>
            This is a preview of the Discover feed with social features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Soon, you'll be able to make your own projects public and see them featured here, complete with likes, comments, and follows. Stay tuned for updates on community features!</p>
        </CardContent>
      </Card>
    </div>
  );
}
