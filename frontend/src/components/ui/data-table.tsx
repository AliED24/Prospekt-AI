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
import { Download, Trash2 } from "lucide-react"
import { OfferData } from "@/components/offerDataTableStructure/types/OfferData"
import { envApi } from "@/utils/api"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DataTableProps<TData extends object, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    onDataChange?: (updatedData: TData[]) => void
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DataTable<TData extends object, TValue>({
                                                            columns,
                                                            data,
                                                            isLoading,
                                                            onDataChange,
                                                        }: DataTableProps<TData, TValue>) {
    // ========================================================================
    // STATE
    // ========================================================================

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
    const [tableData, setTableData] = React. useState<TData[]>(data)
    const [isDeleting, setIsDeleting] = React.useState(false)

    // ========================================================================
    // EFFECTS
    // ========================================================================

    // Sync tableData mit props data
    React.useEffect(() => {
        setTableData(data)
    }, [data])

    // ========================================================================
    // FUNCTIONS
    // ========================================================================

    /**
     * Löscht einen Datensatz per API und aktualisiert die lokale State
     * @param id - Die ID des zu löschenden Datensatzes
     */
    const handleDelete = async (id: number | string) => {
        // Bestätigungsdialog
        if (! window.confirm("Möchten Sie diesen Datensatz wirklich löschen?")) {
            return
        }

        setIsDeleting(true)
        try {
            // API Call zum Löschen
            await envApi.delete<OfferData[]>(`/api/offers/${id}`)

            // Entferne aus lokalem State
            const updatedData = tableData.filter((item) => (item as any).id !== id)
            setTableData(updatedData)

            // Benachrichtige Parent Komponente
            onDataChange?.(updatedData)
        } catch (error) {
            console.error("Fehler beim Löschen:", error)
            alert("Fehler beim Löschen des Datensatzes!")
        } finally {
            setIsDeleting(false)
        }
    }

    /**
     * Exportiert alle Daten als Excel Datei
     */
    const exportToExcel = () => {
        const offers = tableData as OfferData[]

        // Prüfe ob Daten vorhanden
        if (! offers.length) {
            console.error("Keine Daten zum Exportieren verfügbar")
            return
        }

        // Konvertiere zu Excel Sheet
        const worksheet = XLSX.utils.json_to_sheet(offers)

        // Setze Spaltenbreiten
        const columnWidths = Object.keys(offers[0]).map((key) => ({
            wch: Math.min(50, Math.max(15, key.length)),
        }))
        worksheet["!cols"] = columnWidths

        // Erstelle Workbook und speichere
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Angebote")
        XLSX.writeFile(workbook, `angebote_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
    }

    const columnsWithDelete = React.useMemo(() => {
        return [
            ... columns,
            {
                id: "delete",
                header: "", // Leerer Header
                cell: ({ row }: any) => (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete((row.original as any).id)}
                        disabled={isDeleting}
                        title="Löschen"
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                ),
                size: 50,
            } as ColumnDef<TData, TValue>,
        ]
    }, [columns, isDeleting, tableData])

    // ========================================================================
    // TABLE SETUP
    // ========================================================================

    const table = useReactTable({
        data: tableData,
        columns: columnsWithDelete,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            // Benutzerdefinierter Filter für Datumsbereiche
            dateBetween: (row, columnId, filterValue: DateRange | undefined) => {
                if (! filterValue?. from && !filterValue?.to) return true

                const dateStr = row.getValue(columnId) as string
                if (!dateStr) return true

                try {
                    // Parse Datum im Format DD.MM.YYYY
                    const [day, month, year] = dateStr.split(".")
                    if (! day || !month || !year) return true

                    const date = new Date(+year, +month - 1, +day)
                    date.setHours(0, 0, 0, 0)

                    const filterStart = filterValue.from ? new Date(filterValue.from) : null
                    const filterEnd = filterValue.to ? new Date(filterValue.to) : null

                    if (filterStart) filterStart.setHours(0, 0, 0, 0)
                    if (filterEnd) filterEnd.setHours(0, 0, 0, 0)

                    // Prüfe ob Datum im Bereich liegt
                    if (filterStart && filterEnd) {
                        return date >= filterStart && date <= filterEnd
                    }
                    if (filterStart) {
                        return date >= filterStart
                    }
                    if (filterEnd) {
                        return date <= filterEnd
                    }
                } catch (error) {
                    console.error("Datum Parsing Fehler:", error)
                    return true
                }
                return true
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

    // ========================================================================
    // EFFECTS - Datum Filter
    // ========================================================================

    React.useEffect(() => {
        if (dateRange?. from || dateRange?.to) {
            table.getColumn("offerDateStart")?.setFilterValue(dateRange)
            table.getColumn("offerDateEnd")?.setFilterValue(dateRange)
        } else {
            table.getColumn("offerDateStart")?.setFilterValue(undefined)
            table.getColumn("offerDateEnd")?.setFilterValue(undefined)
        }
    }, [dateRange, table])

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="space-y-4">
            {/* ================================================================= */}
            {/* TOP BAR: Filter & Export */}
            {/* ================================================================= */}

            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-4">
                    {/* Produktname Filter */}
                    <Input
                        placeholder="Nach Produktname filtern..."
                        value={(table.getColumn("productName")?.getFilterValue() as string) ??  ""}
                        onChange={(e) => table.getColumn("productName")?.setFilterValue(e.target.value)}
                        className="max-w-sm"
                    />

                    {/* Datum Range Filter */}
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>

                {/* Excel Export Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToExcel}
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Excel Export
                </Button>
            </div>

            {/* ================================================================= */}
            {/* TABLE */}
            {/* ================================================================= */}

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    {/* HEADER */}
                    <TableHeader className="sticky top-0 bg-background">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{ width: header.getSize() }}
                                        // Delete-Header sticky machen
                                        className={
                                            header.column.id === "delete"
                                                ? "sticky right-0 bg-background z-20 text-center"
                                                : ""
                                        }
                                    >
                                        {header. isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/* BODY */}
                    <TableBody className="divide-y divide-gray-500">
                        {/* LOADING STATE */}
                        {isLoading
                            ? Array.from({ length: 10 }). map((_, i) => (
                                <TableRow key={i}>
                                    {columnsWithDelete.map((col, j) => (
                                        <TableCell key={j} style={{ width: col.size }}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : // Delete Button
                            table.getRowModel().rows.length
                                ? table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                style={{ width: cell.column.getSize() }}
                                                className={
                                                    cell.column.id === "delete"
                                                        ?  "sticky right-0 bg-background z-10 text-center"
                                                        : ""
                                                }
                                            >
                                                {cell.column.id === "delete" ? (
                                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                                ) : (
                                                    <div className="truncate" title={String(cell.getValue())}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : // EMPTY STATE
                                (
                                    <TableRow>
                                        <TableCell colSpan={columnsWithDelete.length} className="h-24 text-center">
                                            Keine Ergebnisse.
                                        </TableCell>
                                    </TableRow>
                                )}
                    </TableBody>
                </Table>
            </div>

            {/* ================================================================= */}
            {/* PAGINATION */}
            {/* ================================================================= */}
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Seite {table.getState().pagination. pageIndex + 1} von {table.getPageCount()}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={! table.getCanPreviousPage() || isDeleting}
                    >
                        Zurück
                    </Button>


                    <div className="flex items-center justify-center text-sm font-medium">
                        {Array.from({ length: table.getPageCount() }, (_, i) => {
                            const currentPage = table.getState().pagination.pageIndex
                            const shouldShow =
                                i < 2 || i === table.getPageCount() - 1 || (i >= currentPage - 1 && i <= currentPage + 1)

                            if (! shouldShow) {
                                // Zeige "..." vor Sprung
                                if (i === 2 || i === table.getPageCount() - 2) {
                                    return (
                                        <span key={i} className="mx-1">
                                            ...
                                        </span>
                                    )
                                }
                                return null
                            }
                            return (
                                <Button
                                    key={i}
                                    variant={currentPage === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => table.setPageIndex(i)}
                                    disabled={isDeleting}
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
                        disabled={! table.getCanNextPage() || isDeleting}
                    >
                        Weiter
                    </Button>
                </div>
            </div>
        </div>
    )
}