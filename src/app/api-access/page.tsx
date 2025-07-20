import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code } from "lucide-react";

export default function ApiAccessPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">API Access</h1>
        <p className="text-muted-foreground mt-2">
          Integrate The Void AI's power into your own applications.
        </p>
      </div>
      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="text-primary" />
            Developer API Coming Soon
          </CardTitle>
          <CardDescription>
            Unlock programmatic access to our voice synthesis engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>We are working on providing robust API access for developers to integrate The Void AI's voice generation capabilities into their own applications and services. Documentation and access keys will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
