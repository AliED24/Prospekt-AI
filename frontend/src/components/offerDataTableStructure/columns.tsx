"use client"

import { ColumnDef } from "@tanstack/react-table"
import {OfferData} from "@/components/offerDataTableStructure/types/OfferData";

export const columns: ColumnDef<OfferData>[] = [
    {
        accessorKey: "id",
        header: "id",
    },
    {
        accessorKey: "productName",
        header: "Produktname",
    },
    {
        accessorKey: "brand",
        header: "Marke",
    },
    {
        accessorKey: "quantity",
        header: "Menge",
    },
    {
        accessorKey: "price",
        header: "Preis",
    },
    {
        accessorKey: "originalPrice",
        header: "Normalpreis",
    },
    {
        accessorKey: "offerDateStart",
        header: "Angebotsdatum-Start",
    },
    {
        accessorKey: "offerDateEnd",
        header: "Angebotsdatum-Ende",
    },
    {
        accessorKey: "storeName",
        header: "Einzelhändler",
    },

]