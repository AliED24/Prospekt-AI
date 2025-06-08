"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"

import { Skeleton } from "@/components/ui/skeleton"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
}

export function DataTable<TData, TValue>({columns, data, isLoading}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 15,
            },
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Nach Produktname filtern..."
                    value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("productName")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <div>
                    <Table className="h-full">
                        <TableHeader className="sticky bg-gray-100">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="w-[150px] max-w-[150px]" // Feste Breite für Header
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200">
                            {isLoading ? (
                                // Skeleton Loading
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {columns.map((_, cellIndex) => (
                                            <TableCell key={cellIndex} className="w-[160px] max-w-[160px]">
                                                <Skeleton className="h-4 w-[140px]" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                // Normale Daten-Anzeige
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="w-[160px] max-w-[160px]"
                                            >
                                                <div
                                                    className="truncate"
                                                    title={cell.getValue() as string}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                // Keine Ergebnisse
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Keine Ergebnisse.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Seite {table.getState().pagination.pageIndex + 1} von{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Zurück
                    </Button>
                    <div className="flex items-center justify-center text-sm font-medium">
                        {Array.from({ length: table.getPageCount() }, (_, i) => (
                            <Button
                                key={i}
                                variant={table.getState().pagination.pageIndex === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => table.setPageIndex(i)}
                                className="mx-1 w-8"
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Weiter
                    </Button>
                </div>
            </div>
        </div>
    )
}