"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:justify-end">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost">Log In</Button>
        <Button>Sign Up</Button>
      </div>
    </header>
  );
}
