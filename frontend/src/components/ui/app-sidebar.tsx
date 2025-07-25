'use client';

import { Home, Inbox } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const items = [
    { title: "Home", url: "/", icon: Home },
    { title: "Ergebnisse", url: "/results", icon: Inbox },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarContent className="flex flex-col h-full">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-2xl font-bold">
                        Prospekt-AI
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-4">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="mt-auto p-4 text-xs text-muted-foreground">
                    Entwickelt vom Werkstudenten Ali Alizadeh aus dem Geschäftsbereich IT
                </div>
            </SidebarContent>
        </Sidebar>
    );
}
