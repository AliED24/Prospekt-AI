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
import * as XLSX from 'xlsx'

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
    const [sorting, setSorting] = React.useState<SortingState>([{id: "id", desc: true}])
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
            sorting: [{id: "id", desc: true}],
        },
    })

    const exportToXLSX = () => {
        const filteredData = table.getFilteredRowModel().rows.map(row => row.original)
        const worksheet = XLSX.utils.json_to_sheet(filteredData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Angebote")
        
        const fileName = `angebote_${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(workbook, fileName)
    }

    return (
        <div className="w-full max-w-8xl"> {/* Maximale Breite begrenzt */}
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Nach Produktname filtern..."
                    value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("productName")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Button onClick={exportToXLSX} variant="outline">
                    Als Excel exportieren
                </Button>
            </div>
            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="sticky top-0 ">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="w-[120px] max-w-[120px] px-2"
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
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {columns.map((_, cellIndex) => (
                                            <TableCell key={cellIndex} className="w-[120px] max-w-[120px] px-2">
                                                <Skeleton className="h-4 w-[100px]" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="w-[160px] max-w-[160px] px-2"
                                            >
                                                <div
                                                    className="truncate text-sm"
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
                        {Array.from({ length: table.getPageCount() }, (_, i) => {
                            const currentPage = table.getState().pagination.pageIndex;
                            const showPage = i < 2 ||
                                i === table.getPageCount() - 1 ||
                                (i >= currentPage - 1 && i <= currentPage + 1);

                            if (!showPage) {
                                if (i === 2 || i === table.getPageCount() - 2) {
                                    return <span key={i} className="mx-1">...</span>;
                                }
                                return null;
                            }

                            return (
                                <Button
                                    key={i}
                                    variant={currentPage === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => table.setPageIndex(i)}
                                    className="mx-0.5 w-7 h-7 p-0"
                                >
                                    {i + 1}
                                </Button>
                            );
                        })}
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