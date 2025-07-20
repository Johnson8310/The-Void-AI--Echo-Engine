import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, BrainCircuit, Library } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight text-primary">Echo Engine</h1>
        <p className="text-muted-foreground mt-2">Welcome to The Void AI. Transform your documents into engaging podcasts.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PlusCircle className="h-8 w-8 text-primary" />
              New Podcast
            </CardTitle>
            <CardDescription>Start from a document and generate a new podcast script with AI.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <Link href="/create" passHref className="w-full">
              <Button className="w-full">
                Create New Podcast
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Library className="h-8 w-8 text-muted-foreground" />
              My Projects
            </CardTitle>
            <CardDescription>View and manage your saved podcasts.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          </CardContent>
        </Card>
         <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-muted-foreground" />
              Voice Library
            </CardTitle>
            <CardDescription>Explore and manage your custom AI voices.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
