'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Box,
    Alert,
} from '@mui/material';
import { Delete, Description } from '@mui/icons-material';
import api from '../../lib/api';

interface OfferDataTypes {
    id: number;
    productName?: string;
    storeName?: string;
    originalPrice?: number;
    price?: number;
    appPrice?: number;
    offerDateStart?: string;
    offerDateEnd?: string;
    brand?: string;
    associatedPdfFile?: string;
}

export default function UploadView() {
    const [data, setData] = useState<OfferDataTypes[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfDeleting, setPdfDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Daten laden
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/api/offers');
                setData(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError('Fehler beim Laden der Daten');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Eindeutige PDF-Dateien extrahieren
    const uniquePdfFiles = useMemo(() => {
        const fileMap = new Map<string, { fileName: string; count: number }>();

        data.forEach((item) => {
            if (item.associatedPdfFile && item.associatedPdfFile.trim() !== '') {
                const fileName = item.associatedPdfFile;
                if (fileMap.has(fileName)) {
                    fileMap.set(fileName, {
                        fileName,
                        count: fileMap.get(fileName)!.count + 1
                    });
                } else {
                    fileMap.set(fileName, { fileName, count: 1 });
                }
            }
        });

        return Array.from(fileMap.values()).sort((a, b) => a.fileName.localeCompare(b.fileName));
    }, [data]);

    const deletePdfFile = async (filename: string) => {
        if (!window.confirm(`Alle Einträge mit "${filename}" wirklich löschen?`)) return;

        try {
            setPdfDeleting(filename);
            const payload = { filename };
            console.log('Deleting PDF, payload=', payload);

            const response = await api.delete('/api/offers/file', { data: payload });
            const body = response.data;
            console.log('Delete response body:', body);

            // Daten neu laden nach erfolgreichem Löschen
            const updatedResponse = await api.get('/api/offers');
            setData(updatedResponse.data);

            alert(`Löschen erfolgreich. ${body}`);
        } catch (err: any) {
            console.error('Fehler beim Löschen der PDF-Datei:', err);
            const serverText = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Fehler beim Löschen der PDF-Datei: ${serverText}`);
        } finally {
            setPdfDeleting(null);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-fg)', mb: 0.5 }}>
                    Uploads verwalten
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'rgba(237,237,237,0.6)' }}>
                    {uniquePdfFiles.length} Uploads insgesamt
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    backgroundColor: 'var(--color-bg-light)',
                    border: '1px solid rgba(237,237,237,0.1)',
                    borderRadius: 2,
                }}
            >
                {isLoading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress sx={{ color: 'var(--color-accent)', mb: 2 }} />
                        <Typography sx={{ color: 'var(--color-fg)' }}>
                            Lade Uploads...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ m: 3 }}>
                        {error}
                    </Alert>
                ) : uniquePdfFiles.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Description sx={{
                            fontSize: 48,
                            mb: 2,
                            opacity: 0.3,
                            color: 'var(--color-fg)'
                        }} />
                        <Typography sx={{ color: 'var(--color-fg)', fontSize: '1rem', fontWeight: 500, mb: 1 }}>
                            Keine Uploads gefunden
                        </Typography>
                        <Typography sx={{ color: 'rgba(237,237,237,0.6)', fontSize: '0.875rem' }}>
                            Es wurden noch keine PDF-Dateien hochgeladen.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ p: 3, borderBottom: '1px solid rgba(237,237,237,0.1)' }}>
                            <Typography sx={{ color: 'var(--color-fg)', fontSize: '1rem', fontWeight: 500 }}>
                                Hochgeladene Dateien ({uniquePdfFiles.length})
                            </Typography>
                        </Box>

                        <List sx={{ p: 0 }}>
                            {uniquePdfFiles.map((file, index) => (
                                <ListItem
                                    key={file.fileName}
                                    divider={index < uniquePdfFiles.length - 1}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(237,237,237,0.05)',
                                        },
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label={`delete-${file.fileName}`}
                                            onClick={() => deletePdfFile(file.fileName)}
                                            disabled={pdfDeleting !== null}
                                            sx={{
                                                color: 'var(--color-error)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                },
                                            }}
                                        >
                                            {pdfDeleting === file.fileName ? (
                                                <CircularProgress size={20} sx={{ color: 'var(--color-error)' }} />
                                            ) : (
                                                <Delete fontSize="small" />
                                            )}
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{
                                                    color: 'var(--color-fg)',
                                                    fontWeight: 500,
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {file.fileName}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                sx={{
                                                    color: 'rgba(237,237,237,0.6)',
                                                    fontSize: '0.875rem',
                                                    mt: 0.5,
                                                }}
                                            >
                                                {file.count} Einträge • PDF-Datei
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </Paper>
        </Box>
    );
}
