
export function parseGermanDateString(dateStr: string | undefined | null): Date | undefined {
    if (!dateStr) return undefined;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return undefined;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (
        isNaN(day) || isNaN(month) || isNaN(year) ||
        month < 1 || month > 12 ||
        day < 1 || day > 31
    ) {
        console.warn(`Ungültiges Datum: "${dateStr}"`);
        return undefined;
    }
    // JS-Monat 0-basiert:
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) {
        console.warn(`Parsed Date invalid: "${dateStr}"`);
        return undefined;
    }
    return d;
}
