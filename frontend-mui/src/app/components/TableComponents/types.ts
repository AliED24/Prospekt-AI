export interface OfferDataTypes {
    id: number;
    productName: string;
    productDescription?: string;
    originalPrice?: number | string;
    price?: number | string;
    appPrice?: number | string;
    offerDateStart?: string;
    offerDateEnd?: string;
    storeName?: string;
    associatedPdfFile?: string;
    brand?: string;
    calenderWeek?: number;
    quantity?: string;
    [key: string]: any;
}

export type Order = 'asc' | 'desc';

export interface HeadCell {
    id: keyof OfferDataTypes;
    label: string;
    numeric: boolean;
    width?: number;
}