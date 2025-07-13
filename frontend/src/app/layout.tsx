import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import "./globals.css";
import { UploadProvider } from "@/app/context/uploadContext";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Prospekt-AI - KI-gestützte PDF-Analyse",
    description: "Intelligente Extraktion von Angebotsdaten aus PDF-Prospekten",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="de" suppressHydrationWarning={true} className={inter.variable}>
            <body className={`${inter.className} antialiased bg-background text-foreground transition-colors duration-300 overflow-x-hidden`}>
                <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
                    <SidebarProvider>
                        <div className="fixed top-4 right-4 z-50">
                            <ThemeToggle />
                        </div>
                        <div className="flex min-h-screen w-full overflow-x-hidden">
                            <div className="w-64 flex-shrink-0">
                                <AppSidebar />
                            </div>
                            <main className="flex-1 flex items-center justify-center w-full overflow-x-hidden">
                                <div className="w-full">
                                    <UploadProvider>
                                        {children}
                                    </UploadProvider>
                                </div>
                            </main>
                        </div>
                    </SidebarProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}