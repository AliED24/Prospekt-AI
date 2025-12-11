// frontend-mui/src/app/components/Sidebar.tsx
'use client';

import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Home,
    CloudUpload,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
        description: "Übersicht & Upload"
    },
    {
        title: "Uploads",
        url: "/uploadView",
        icon: CloudUpload,
        description: "Uploads verwalten"
    }
];

interface SidebarProps {
    width?: number;
}

export function Sidebar({ width = 230 }: SidebarProps) {
    const pathname = usePathname();

    const sidebarContent = (
        <div className="w-full h-full bg-[#2f3234] flex flex-col ">
            {/* Header */}
            <div className="px-3 py-5">
                <h1 className=" text-left ml-1 text-base font-bold text-[#fce531]">
                    Prospekt-AI
                </h1>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-1">
                <List disablePadding>
                    {SidebarItems.map((item) => {
                        const isActive = pathname === item.url;
                        const IconComponent = item.icon;
                        return (
                            <ListItem key={item.title} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    href={item.url}
                                    className={`
                                        rounded
                                        ${isActive ? 'bg-[#fce531]/15' : ''}
                                    `}
                                >
                                    <ListItemIcon className="min-w-0 mr-2">
                                        <span className={`
                                            p-1.5 rounded flex items-center justify-center
                                            ${isActive
                                            ? 'bg-[#fce531] text-[#2a2a2a]'
                                            : 'bg-white/8 text-[#ededed]'
                                        }
                                        `}>
                                            <IconComponent style={{ fontSize: 12 }} />
                                        </span>
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <span className={`
                                                text-xs font-medium
                                                ${isActive ? 'text-[#fce531]' : 'text-[#ededed]'}
                                            `}>
                                                {item.title}
                                            </span>
                                        }
                                        secondary={
                                            <span className="text-xs text-[#ededed]/60">
                                                {item.description}
                                            </span>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </div>

            {/* Footer Bereich für Login/Logout */}
            <div className="p-2 border-t border-[#ededed]/10">
                {/* Hier kommt Login/Logout Benutzerverwaltung */}
            </div>
        </div>
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: width,
                    boxSizing: 'border-box',
                    border: 'none',
                    boxShadow: '1px 0 1px',

                },
            }}
        >
            {sidebarContent}
        </Drawer>
    );
}
