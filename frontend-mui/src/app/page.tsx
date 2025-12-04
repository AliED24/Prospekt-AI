'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { OffersTable, COLORS, OfferDataTypes } from '@/app/components/TableComponents'

import {
    Box,
    Typography,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import { Upload } from '@mui/icons-material';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = 'http://localhost:8080';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OffersPage() {
    // State
    const [offers, setOffers] = useState<OfferDataTypes[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    const fetchOffers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE}/api/offers`);
            if (!response.ok) throw new Error('Fehler beim Laden der Angebote');
            const data = await response.json();
            console.log(data)
            setOffers(data);
        } catch (err: any) {
            setError(err. message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleUploadClick = () => {
        fileInputRef.current?. click();
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

            const response = await fetch(`${API_BASE}/api/upload`, {
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
            const response = await fetch(`${API_BASE}/api/offers/${id}`, {
                method: 'DELETE',
            });

            if (!response. ok) throw new Error('Löschen fehlgeschlagen');

            setOffers((prev) => prev.filter((offer) => offer.id !== id));
            setSuccess('Datensatz erfolgreich gelöscht');
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.background, p: 3 }}>
            <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLORS. foreground }}>
                            Angebotsübersicht
                        </Typography>
                        <Typography variant="body2" sx={{ color: `${COLORS.foreground}99` }}>
                            {offers.length} Angebote insgesamt
                        </Typography>
                    </Box>

                    {/* Upload Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf"
                            style={{ display: 'none' }}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={isUploading ? <CircularProgress size={16} /> : <Upload />}
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            sx={{
                                borderColor: COLORS.accent,
                                color: COLORS.accent,
                                '&:hover': {
                                    borderColor: COLORS. accent,
                                    backgroundColor: `${COLORS.accent}1a`,
                                },
                            }}
                        >
                            {isUploading ? 'Verarbeite...' : 'PDF hochladen'}
                        </Button>
                    </Box>
                </Box>

                {/* Table */}
                <OffersTable
                    data={offers}
                    isLoading={isLoading}
                    onDelete={handleDelete}
                />
            </Box>

            {/* Snackbars */}
            <Snackbar
                open={!! error}
                autoHideDuration={5000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
}