import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, User, Bell, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, preferences, and integrations.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-primary" />
              Configuration Hub
            </CardTitle>
            <CardDescription>
              This is your command center for all things related to your account and the application. More settings will become available here in the future.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User/> Profile</CardTitle>
              <CardDescription>Manage your public profile information.</CardDescription>
            </CardHeader>
             <CardContent>
              <p className="text-muted-foreground">Coming soon.</p>
            </CardContent>
        </Card>
         <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard/> Subscription</CardTitle>
              <CardDescription>View and manage your current subscription plan.</CardDescription>
            </CardHeader>
             <CardContent>
              <p className="text-muted-foreground">Coming soon.</p>
            </CardContent>
        </Card>
        <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell/> Notifications</CardTitle>
              <CardDescription>Configure your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
