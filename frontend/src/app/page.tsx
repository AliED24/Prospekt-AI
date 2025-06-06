'use client';
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface OfferData {
 id: bigint;
 productName?: string;
 brand?: string;
 quantity?: string;
 price?: string;
 originalPrice: string;
 offerDate: string;
}

interface Angebotsliste {
    offer_data: OfferData[];
}

export default function Home() {
    const [fileData, setFileData] = useState<Angebotsliste>({ offer_data: []});

    useEffect(() => {
        // Hier kommt die Logik für die Dateiverarbeitung
    }, []);

    return (
        <div className="flex flex-col items-center">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-center mb-8">Willkommen bei Prospekt-AI</h1>
                <p className="text-lg text-center mb-4">Ein KI-gestützter Assistent zur automatisierten Extraktion von Angebotsdaten aus PDF-Prospekten.</p>
                <p className="text-center mb-6">Bitte laden sie Prospekt im PDF-Format hoch.</p>
                <div className="flex justify-center">
                    <Button>
                        <Upload className="mr-2" />
                        <span>Hochladen</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}