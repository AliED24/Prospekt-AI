"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {OfferData} from "@/components/offerDataTableStructure/types/OfferData";
import {columns} from "@/components/offerDataTableStructure/columns";
import {DataTable} from "@/components/ui/data-table";
import {envApi} from "@/utils/api";




export default function Page() {
    const [offers, setOffers] = useState<OfferData[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const response = await envApi.get<OfferData[]>("/api/offers");
                setOffers(response.data);
                console.log("Der Response:",response.data[0])
            } catch (err: any) {
                console.error("Fehler beim Laden der Angebote:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);


    return (
        <div>
            <h1 className="text-3xl font-bold mb-">Angebotsübersicht</h1>
            <div>
                <DataTable columns={columns} data={offers} isLoading={isLoading}/>
            </div>
        </div>
    );
}
