"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <Link href="/" className="hidden items-center gap-2 md:flex">
          <Bot className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl tracking-wider">VOID AI</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost">Log In</Button>
        <Button>Sign Up</Button>
      </div>
    </header>
  );
}
