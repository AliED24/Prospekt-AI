import { HeadCell } from './types';

export const headCells: HeadCell[] = [
    { id: 'productName', label: 'Produktname', numeric: false, width: 180 },
    { id: 'storeName', label: 'Wettbewerber', numeric: false, width: 110 },
    { id: 'productDescription', label: 'Produktbeschreibung', numeric: false, width: 155 },
    { id: 'originalPrice', label: 'Originalpreis', numeric: true, width: 95 },
    { id: 'price', label: 'Angebotspreis', numeric: true, width: 95 },
    { id: 'appPrice', label: 'Apppreis', numeric: true, width: 85 },
    { id: 'offerDateStart', label: 'Gültig von', numeric: false, width: 90 },
    { id: 'offerDateEnd', label: 'Gültig bis', numeric: false, width: 90 },
    { id: 'calenderWeek', label: 'KW', numeric: true, width: 60 },
    { id: 'brand', label: 'Marke', numeric: false, width: 100 },
    { id: 'associatedPdfFile', label: 'PDF-Datei', numeric: false, width: 140 },
];