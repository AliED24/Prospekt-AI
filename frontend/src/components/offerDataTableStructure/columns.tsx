"use client"

import { ColumnDef, FilterFn } from "@tanstack/react-table"
import { OfferData } from "@/components/offerDataTableStructure/types/OfferData";
import { DateRange } from "@/components/ui/DatePicker";

declare module '@tanstack/table-core' {
    interface FilterFns {
        dateBetween: FilterFn<unknown>
    }
}

export const columns: ColumnDef<OfferData>[] = [
    {
        accessorKey: "id",
        header: "ID",
        size: 70,
    },
    {
        accessorKey: "productName",
        header: "Produktname",
        size: 250,
    },
    {
        accessorKey: "brand",
        header: "Marke",
        size: 120,
    },
    {
        accessorKey: "quantity",
        header: "Menge",
        size: 100,
    },
    {
        accessorKey: "price",
        header: "Preis",
        size: 100,
    },
    {
        accessorKey: "originalPrice",
        header: "Normalpreis",
        size: 120,
    },
    {
        accessorKey: "offerDateStart",
        header: "Angebotsdatum-Start",
        filterFn: "dateBetween",
        size: 160,
    },
    {
        accessorKey: "offerDateEnd",
        header: "Angebotsdatum-Ende",
        filterFn: "dateBetween",
        size: 160,
    },
    {
        accessorKey: "storeName",
        header: "Einzelhändler",
        size: 150,
    },
]