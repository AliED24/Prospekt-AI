"use client";

import { useState, useEffect } from "react";
import axios from "axios";


interface OfferData {
    id: number;
    productName: string;
    brand: string;
    quantity?: string;
    price: string;
    originalPrice: string;
    offerDate: string;
}

export default function Page() {
    const [offers, setOffers] = useState<OfferData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchOffers = async () => {
            try {
                setLoading(true);
                const response = await axios.get<OfferData[]>("http://localhost:8080/api/offers");
                setOffers(response.data);
            } catch (err: any) {
                console.error("Fehler beim Laden der Angebote:", err);
                setError("Angebotsdaten konnten nicht geladen werden.");
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Angebotsübersicht</h1>

        </div>
    );
}
