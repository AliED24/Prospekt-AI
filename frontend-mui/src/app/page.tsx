'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { OffersTable, OfferDataTypes } from '@/app/components/TableComponents';
import { Button, Alert, Snackbar, CircularProgress } from '@mui/material';
import { Upload } from '@mui/icons-material';
import axios from "axios";

export default function OffersPage() {
    const [offers, setOffers] = useState<OfferDataTypes[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchOffers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<OfferDataTypes[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/offers`);
            setOffers(response.data);
            console.log(response.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ?? err?.message ?? 'Fehler beim Laden der Angebote'
            );
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchOffers()
    }, []);

    const handleUploadClick = () => {
        fileInputRef. current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (! file || file.type !== 'application/pdf') {
            setError('Bitte wählen Sie eine gültige PDF-Datei aus.');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Upload fehlgeschlagen');
            setSuccess('PDF erfolgreich verarbeitet');
            await fetchOffers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef. current) fileInputRef.current. value = '';
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/offers/${id}`, {
                method: 'DELETE',
            });
            if (!response. ok) throw new Error('Löschen fehlgeschlagen');
            setOffers((prev) => prev.filter((offer) => offer.id !== id));
            setSuccess('Datensatz erfolgreich gelöscht');
        } catch (err: any) {
            setError(err. message);
            throw err;
        }
    };

    return (
        <div className="min-h-screen bg-bg p-6">
            <div className="max-w-full mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-fg">Angebotsübersicht</h1>
                        <p className="text-sm text-fg/60">{offers.length} Angebote insgesamt</p>
                    </div>

                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="hidden"
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={isUploading ? <CircularProgress size={16} className="!text-accent" /> : <Upload />}
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className="!border-accent !text-accent hover:!bg-accent/10"
                        >
                            {isUploading ?  'Verarbeite...' : 'PDF hochladen'}
                        </Button>
                    </div>
                </div>

                <OffersTable
                    data={offers}
                    isLoading={isLoading}
                    onDelete={handleDelete}
                />
            </div>

            <Snackbar
                open={!! error}
                autoHideDuration={5000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
            </Snackbar>

            <Snackbar
                open={!! success}
                autoHideDuration={3000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
            </Snackbar>
        </div>
    );
}