import { Row } from "@tanstack/react-table";

export function filterDateStartFn<TData>(
    row: Row<TData>,
    columnId: string,
    filterValue: Date | undefined
): boolean {
    if (!filterValue) return true;
    const cellValue = row.getValue(columnId) as Date | undefined;
    if (!(cellValue instanceof Date) || isNaN(cellValue.getTime())) {
        return false;
    }
    return cellValue >= filterValue;
}

export function filterDateEndFn<TData>(
    row: Row<TData>,
    columnId: string,
    filterValue: Date | undefined
): boolean {
    if (!filterValue) return true;
    const cellValue = row.getValue(columnId) as Date | undefined;
    if (!(cellValue instanceof Date) || isNaN(cellValue.getTime())) {
        return false;
    }
    return cellValue <= filterValue;
}
