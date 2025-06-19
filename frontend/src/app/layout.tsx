import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import "./globals.css";
import {UploadProvider} from "@/app/context/uploadContext";
import {ThemeProvider} from "next-themes";

const inter = Inter({
    subsets: ["latin"],
});

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
        <body
            className={`
          ${inter.className} antialiased`}
        >
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
            <SidebarProvider>
                <div className="flex min-h-screen min-w-screen">
                    <AppSidebar/>
                    <main className="flex-1 p-4 flex items-center justify-center ">
                        <UploadProvider>
                            {children}
                        </UploadProvider>
                    </main>
                </div>
            </SidebarProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}