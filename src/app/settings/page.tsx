import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application preferences.
        </p>
      </div>
      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="text-primary" />
            Configuration Hub
          </CardTitle>
          <CardDescription>
            Your command center for all things related to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This area will soon house options for managing your user profile, subscription details, notification preferences, and other application settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
