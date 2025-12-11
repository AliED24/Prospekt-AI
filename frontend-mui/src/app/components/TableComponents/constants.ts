import { HeadCell } from './types';

export const headCells: HeadCell[] = [
    { id: 'productName', label: 'Produktname', numeric: false, width: 130},
    { id: 'storeName', label: 'Wettbewerber', numeric: false, width: 130 },
    { id: 'originalPrice', label: 'Originalpreis', numeric: true, width: 130 },
    { id: 'price', label: 'Angebotspreis', numeric: true, width: 130 },
    { id: 'appPrice', label: 'Apppreis', numeric: true, width: 130 },
    { id: 'offerDateStart', label: 'Gültig von', numeric: false, width: 90 },
    { id: 'offerDateEnd', label: 'Gültig bis', numeric: false, width: 90 },
    { id: 'calenderWeek', label: 'KW', numeric: true, width: 90 },
    { id: 'brand', label: 'Marke', numeric: false, width: 100 },
    { id: 'associatedPdfFile', label: 'PDF-Datei', numeric: false, width: 140 },
];