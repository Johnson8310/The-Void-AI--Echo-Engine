"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Home, PlusCircle, MicVocal, Code, Settings, Bot, Library } from "lucide-react";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/create", label: "Create Podcast", icon: PlusCircle },
  { href: "/projects", label: "My Projects", icon: Library },
  { href: "/voice-lab", label: "Voice Lab", icon: MicVocal },
  { href: "/api-access", label: "API Access", icon: Code },
];

const bottomMenuItems = [
    { href: "/settings", label: "Settings", icon: Settings },
]

export function AppSidebarContent() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl tracking-wider">VOID AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label} className="w-full justify-start">
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
             {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref>
                        <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label} className="w-full justify-start">
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
