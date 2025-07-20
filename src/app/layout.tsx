import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import SiteHeader from '@/components/site-header';
import { AppSidebarContent } from '@/components/layout/app-sidebar-content';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'The Void AI: Echo Engine',
  description: 'AI-powered podcast generation from your documents.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Impact&family=Arial&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <SidebarProvider>
            <div className="relative flex min-h-screen">
              <Sidebar>
                <AppSidebarContent />
              </Sidebar>
              <SidebarInset className="flex flex-1 flex-col bg-background">
                <SiteHeader />
                <main className="flex-1 p-4 sm:p-6">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
