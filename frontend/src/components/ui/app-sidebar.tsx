'use client';

import { Home, Inbox, Zap, Settings } from "lucide-react";
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

const SidebarItems = [
    { title: "Dashboard", url: "/", icon: Home, description: "Übersicht & Upload" },
    { title: "Ergebnisse", url: "/results", icon: Inbox, description: "Verarbeitete Angebote" },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar className="bg-gradient-to-b from-sidebar to-sidebar/95 h-full flex flex-col">
            <SidebarContent className="p-4 flex-1">
                <SidebarGroup>
                    <SidebarGroupLabel className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    Prospekt-AI
                                </h1>
                            </div>
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-3">
                            {SidebarItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={pathname === item.url}
                                        className="group transition-all duration-200 hover:bg-sidebar-accent/50"
                                    >
                                        <Link href={item.url} className="flex items-center gap-3 p-3 rounded-lg">
                                            <div className={`p-2 rounded-lg transition-all duration-200 ${
                                                pathname === item.url 
                                                    ? 'bg-primary text-primary-foreground scale-110' 
                                                    : 'bg-sidebar-accent/50 text-sidebar-accent-foreground group-hover:bg-sidebar-accent'
                                            }`}>
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className={`font-medium ${pathname === item.url ? 'scale-105' : ''}`}>{item.title}</div>
                                                <div className="text-xs text-muted-foreground">{item.description}</div>
                                            </div>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <div className="p-4 text-xs text-muted-foreground">
                Entwickelt vom Werkstudenten Ali Alizadeh aus dem Geschäftsbereich IT
            </div>
        </Sidebar>
    );
}
