import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import {Sidebar} from "@/app/components/Sidebar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Prospekt-AI - KI-gestützte PDF-Analyse",
    description: "Intelligente Extraktion von Angebotsdaten aus PDF-Prospekten",
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <body>
                <div style={{ display: 'flex' }}>
                    <Sidebar />
                    <main style={{ flex: 1 }}>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
