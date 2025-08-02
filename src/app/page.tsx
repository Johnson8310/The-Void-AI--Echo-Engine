import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle, MicVocal, Library, Webhook } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-headline tracking-tight text-primary">Echo Engine</h1>
        <p className="text-muted-foreground mt-2">Welcome to The Void AI. Transform your documents into engaging podcasts.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="flex flex-col border-primary/50 shadow-lg shadow-primary/10 xl:col-span-2">
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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Library className="h-8 w-8 text-primary" />
              My Projects
            </CardTitle>
            <CardDescription>View and manage your saved podcasts.</CardDescription>
          </CardHeader>
           <CardContent className="flex-1 flex items-end">
            <Link href="/projects" passHref className="w-full">
                <Button variant="outline" className="w-full">View Projects</Button>
            </Link>
          </CardContent>
        </Card>
         <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Webhook className="h-8 w-8 text-primary" />
              DEV & Pro Tools
            </CardTitle>
            <CardDescription>Integrate with our API and manage your settings.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <Link href="/api-access" passHref className="w-full">
                <Button variant="outline" className="w-full">Access API & Webhooks</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
