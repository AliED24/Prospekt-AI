"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {OfferData} from "@/components/offerDataTableStructure/types/OfferData";
import {columns} from "@/components/offerDataTableStructure/columns";
import {DataTable} from "@/components/ui/data-table";




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
        <div>
            <h1 className="text-3xl font-bold mb-">Angebotsübersicht</h1>
            <div className="">
                <DataTable columns={columns} data={offers}/>
            </div>
        </div>
    );
}
