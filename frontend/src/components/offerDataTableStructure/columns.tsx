"use client"

import { ColumnDef } from "@tanstack/react-table"
import {OfferData} from "@/components/offerDataTableStructure/types/OfferData";
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<OfferData>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    ID
                </Button>
            )
        },
    },
    {
        accessorKey: "productName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Produktname
                </Button>
            )
        },
    },
    {
        accessorKey: "brand",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Marke
                </Button>
            )
        },
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Menge
                </Button>
            )
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Preis
                </Button>
            )
        },
    },
    {
        accessorKey: "originalPrice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Normalpreis
                </Button>
            )
        },
    },
    {
        accessorKey: "offerDateStart",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Start
                </Button>
            )
        },
    },
    {
        accessorKey: "offerDateEnd",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Ende
                </Button>
            )
        },
    },
    {
        accessorKey: "storeName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 font-semibold"
                >
                    Einzelhändler
                </Button>
            )
        },
    },

]