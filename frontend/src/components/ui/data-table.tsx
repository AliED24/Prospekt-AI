"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
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
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { DateRange, DatePickerWithRange } from "@/components/ui/DatePicker"
import { Skeleton } from "@/components/ui/skeleton"
import { Download } from "lucide-react"
import { OfferData } from "@/components/offerDataTableStructure/types/OfferData"

interface DataTableProps<TData extends object, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
}

export function DataTable<TData extends object, TValue>({
    columns,
    data,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

    // Vereinfachte Excel-Export Funktion
    const exportToExcel = () => {
        // Sicherstellen, dass wir die Daten als OfferData[] haben
        const offers = data as OfferData[]
        if (!offers.length) {
            console.error('Keine Daten zum Exportieren verfügbar')
            return
        }

        // Erstelle ein Arbeitsblatt mit allen Daten
        const worksheet = XLSX.utils.json_to_sheet(offers)
        
        // Formatiere die Spaltenbreiten
        const columnWidths = Object.keys(offers[0]).map(key => ({ 
            wch: Math.min(50, Math.max(15, key.length)) 
        }))
        worksheet['!cols'] = columnWidths
        
        // Erstelle und speichere die Excel-Datei
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Angebote")
        XLSX.writeFile(workbook, `angebote_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    }

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            dateBetween: (row, columnId, filterValue: DateRange | undefined) => {
                if (!filterValue?.from && !filterValue?.to) return true;
                
                const dateStr = row.getValue(columnId) as string;
                if (!dateStr) return true;
                
                try {
                    // Parse das aktuelle Datum
                    const [day, month, year] = dateStr.split('.');
                    if (!day || !month || !year) return true;
                    
                    const date = new Date(+year, +month - 1, +day);
                    date.setHours(0, 0, 0, 0);
                    
                    const filterStart = filterValue.from ? new Date(filterValue.from) : null;
                    const filterEnd = filterValue.to ? new Date(filterValue.to) : null;
                    
                    if (filterStart) filterStart.setHours(0, 0, 0, 0);
                    if (filterEnd) filterEnd.setHours(0, 0, 0, 0);
                    
                    // Prüfe ob das Datum im Filterbereich liegt
                    if (filterStart && filterEnd) {
                        return date >= filterStart && date <= filterEnd;
                    }
                    if (filterStart) {
                        return date >= filterStart;
                    }
                    if (filterEnd) {
                        return date <= filterEnd;
                    }
                } catch (error) {
                    console.error('Datum Parsing Fehler:', error);
                    return true;
                }
                return true;
            },
        },
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: { pageSize: 15 },
        },
    })

    // Filter by date range
    React.useEffect(() => {
        if (dateRange?.from || dateRange?.to) {
            // Wende den Filter auf beide Datumsspalten an
            table.getColumn('offerDateStart')?.setFilterValue(dateRange);
            table.getColumn('offerDateEnd')?.setFilterValue(dateRange);
        } else {
            table.getColumn('offerDateStart')?.setFilterValue(undefined);
            table.getColumn('offerDateEnd')?.setFilterValue(undefined);
        }
    }, [dateRange, table]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-4">
                    <Input
                        placeholder="Nach Produktname filtern..."
                        value={(table.getColumn('productName')?.getFilterValue() as string) ?? ''}
                        onChange={e => table.getColumn('productName')?.setFilterValue(e.target.value)}
                        className="max-w-sm"
                    />
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToExcel}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Excel Export
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 bg-background">
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((col, j) => (
                                        <TableCell key={j} style={{ width: col.size }}>
                                            <Skeleton className="h-4 w-[100px]" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                            <div className="truncate" title={String(cell.getValue())}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Keine Ergebnisse.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
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
                            const cur = table.getState().pagination.pageIndex
                            const show = i < 2 || i === table.getPageCount() - 1 || (i >= cur - 1 && i <= cur + 1)
                            if (!show) {
                                if (i === 2 || i === table.getPageCount() - 2) return <span key={i} className="mx-1">...</span>
                                return null
                            }
                            return (
                                <Button
                                    key={i}
                                    variant={cur === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => table.setPageIndex(i)}
                                    className="mx-1 min-w-[32px]"
                                >
                                    {i + 1}
                                </Button>
                            )
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
