import { HeadCell } from './types';

export const headCells: HeadCell[] = [
    { id: 'productName', label: 'Produktname', numeric: false, width: 200 },
    { id: 'storeName', label: 'Einzelhändler', numeric: false, width: 120 },
    { id: 'originalPrice', label: 'Originalpreis', numeric: true, width: 100 },
    { id: 'price', label: 'Angebotspreis', numeric: true, width: 100 },
    { id: 'offerDateStart', label: 'Gültig von', numeric: false, width: 100 },
    { id: 'offerDateEnd', label: 'Gültig bis', numeric: false, width: 100 },
    { id: 'brand', label: 'Marke', numeric: false, width: 120 },
];