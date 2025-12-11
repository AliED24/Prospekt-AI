'use client';

import React, { useState, useMemo } from 'react';

import {
    Paper,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    IconButton,
    Skeleton,
    CircularProgress,
    InputAdornment,
    Box,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Delete, Search, Download, Description, ExpandMore, ChevronRight } from '@mui/icons-material';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import { OfferDataTypes, Order } from './types';
import { headCells } from './constants';
import { getComparator, formatPrice } from './utils';

interface OffersTableProps {
    data: OfferDataTypes[];
    isLoading: boolean;
    onDelete: (id: number) => Promise<void>;
}

const cellSx = {
    backgroundColor: 'var(--color-bg-light)',
    color: 'var(--color-fg)',
    borderBottom: '1px solid rgba(237,237,237,0.1)',
    padding: '8px 12px',
    height: '48px',
    maxWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const TruncatedText = ({ text, maxLength = 20 }: { text: string; maxLength?: number }) => {
    if (!text || text.length <= maxLength) {
        return <span>{text || '-'}</span>;
    }

    return (
        <Tooltip title={text} arrow placement="top">
            <span style={{ cursor: 'help' }}>
                {text.substring(0, maxLength)}...
            </span>
        </Tooltip>
    );
};

export function OffersTable({ data, isLoading, onDelete }: OffersTableProps) {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof OfferDataTypes>('productName');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedKW, setSelectedKW] = useState<number | ''>('');

    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    const handleDelete = async (id: number) => {
        if (!window.confirm('Möchten Sie diesen Datensatz wirklich löschen?')) return;
        try {
            setDeletingId(id);
            await onDelete(id);
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = () => {
        if (!data.length) return;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Angebote');
        XLSX.writeFile(workbook, `angebote_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const handleSort = (property: keyof OfferDataTypes) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Eindeutige KW-Werte extrahieren
    const availableKWs = useMemo(() => {
        const kwSet = new Set<number>();
        data.forEach((offer) => {
            if (offer.calenderWeek && offer.calenderWeek > 0) {
                kwSet.add(offer.calenderWeek);
            }
        });
        return Array.from(kwSet).sort((a, b) => a - b);
    }, [data]);

    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return data.filter((offer) => {
            const matchesSearch = offer.productName?.toLowerCase().includes(query) ||
                offer.storeName?.toLowerCase().includes(query) ||
                offer.brand?.toLowerCase().includes(query);

            const matchesKW = selectedKW === '' || offer.calenderWeek === selectedKW;

            return matchesSearch && matchesKW;
        });
    }, [data, searchQuery, selectedKW]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort(getComparator(order, orderBy));
    }, [filteredData, order, orderBy]);

    const groupedData = useMemo(() => {
        const groups: Record<string, OfferDataTypes[]> = {};
        sortedData.forEach((item) => {
            const key = item.productName || 'Unbenannt';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });
        return groups;
    }, [sortedData]);

    const tableRows = useMemo(() => {
        const rows: OfferDataTypes[] = [];
        Object.entries(groupedData).forEach(([productName, items]) => {
            if (items.length === 1) {
                rows.push(items[0]);
            } else {
                rows.push(items[0]);
                if (expandedProducts.has(productName)) {
                    items.slice(1).forEach(item => {
                        rows.push(item);
                    });
                }
            }
        });
        return rows;
    }, [groupedData, expandedProducts]);

    const paginatedData = useMemo(() => {
        return tableRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [tableRows, page, rowsPerPage]);

    const toggleProductExpansion = (productName: string) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productName)) {
            newExpanded.delete(productName);
        } else {
            newExpanded.add(productName);
        }
        setExpandedProducts(newExpanded);
    };

    return (
        <div>
            <Paper
                elevation={0}
                className="mb-4 p-4 border border-fg/10"
                sx={{ backgroundColor: 'var(--color-bg-light)' }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <TextField
                            size="small"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[300px]"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: 'var(--color-fg)', opacity: 0.4 }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        backgroundColor: 'var(--color-bg)',
                                        color: 'var(--color-fg)',
                                        '& fieldset': { borderColor: 'rgba(237,237,237,0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(237,237,237,0.3)' },
                                        '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
                                    },
                                },
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel
                                sx={{
                                    color: 'var(--color-fg)',
                                    '&.Mui-focused': { color: 'var(--color-accent)' }
                                }}
                            >
                                KW auswählen
                            </InputLabel>
                            <Select
                                value={selectedKW}
                                label="KW auswählen"
                                onChange={(e) => setSelectedKW(e.target.value as number | '')}
                                sx={{
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-fg)',
                                    '& fieldset': { borderColor: 'rgba(237,237,237,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(237,237,237,0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
                                    '& .MuiSelect-icon': { color: 'var(--color-fg)' },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Alle KW</em>
                                </MenuItem>
                                {availableKWs.map((kw) => (
                                    <MenuItem key={kw} value={kw}>
                                        KW {kw}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Download />}
                            onClick={handleExport}
                            disabled={!data.length}
                            sx={{
                                borderColor: 'rgba(237,237,237,0.4)',
                                color: 'var(--color-fg)',
                                '&:hover': {
                                    borderColor: 'var(--color-fg)',
                                    backgroundColor: 'rgba(237,237,237,0.1)',
                                },
                            }}
                        >
                            Excel Export
                        </Button>

                    </div>
                </div>
            </Paper>

            <TableContainer
                component={Paper}
                elevation={0}
                className="max-h-[calc(100vh-300px)] border border-fg/10"
                sx={{
                    backgroundColor: 'var(--color-bg-light)',
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}
            >
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    style={{ width: headCell.width, minWidth: headCell.width, maxWidth: headCell.width }}
                                    sx={{ ...cellSx, fontWeight: 600 }}
                                >
                                    <TableSortLabel
                                        active={orderBy === headCell.id}
                                        direction={orderBy === headCell.id ? order : 'asc'}
                                        onClick={() => handleSort(headCell.id)}
                                        sx={{
                                            color: 'var(--color-fg)',
                                            '&.Mui-active': { color: 'var(--color-accent)' },
                                            '& .MuiTableSortLabel-icon': { color: 'var(--color-accent) !important' },
                                        }}
                                    >
                                        {headCell.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell sx={{ ...cellSx, width: 60, minWidth: 60, maxWidth: 60 }} />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    {headCells.map((_, j) => (
                                        <TableCell key={j} sx={cellSx}>
                                            <Skeleton variant="text" sx={{ bgcolor: 'rgba(237,237,237,0.15)' }} />
                                        </TableCell>
                                    ))}
                                    <TableCell sx={cellSx} />
                                </TableRow>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={headCells.length + 1}
                                    align="center"
                                    sx={{ ...cellSx, py: 8 }}
                                >
                                    <Description sx={{ fontSize: 48, mb: 2, opacity: 0.3, color: 'var(--color-fg)' }} />
                                    <p>Keine Angebote gefunden</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:hover td': { backgroundColor: 'rgba(237,237,237,0.05)' } }}
                                >
                                    <TableCell sx={{ ...cellSx, width: 180 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                                            {(() => {
                                                const productName = row.productName || 'Unbenannt';
                                                const productGroup = groupedData[productName];
                                                const isMultiple = productGroup && productGroup.length > 1;
                                                const isFirstInGroup = isMultiple && productGroup[0].id === row.id;
                                                const isExpanded = expandedProducts.has(productName);
                                                
                                                if (isMultiple && isFirstInGroup) {
                                                    const displayText = `${productName} (${productGroup.length})`;
                                                    return (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => toggleProductExpansion(productName)}
                                                                sx={{
                                                                    p: 0,
                                                                    minWidth: 'auto',
                                                                    mr: 0.5,
                                                                    color: 'var(--color-accent)',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {isExpanded ? (
                                                                    <ExpandMore fontSize="small" />
                                                                ) : (
                                                                    <ChevronRight fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                                                                <TruncatedText text={displayText} maxLength={18} />
                                                            </Box>
                                                        </>
                                                    );
                                                } else {
                                                    return <TruncatedText text={row.productName || ''} maxLength={22} />;
                                                }
                                            })()}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, width: 110 }}>
                                        <TruncatedText text={row.storeName || ''} maxLength={12} />
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, width: 95 }}>
                                        {formatPrice(row.originalPrice)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, width: 95 }}>
                                        <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                                            {formatPrice(row.price)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, width: 85 }}>
                                        <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                                            {formatPrice(row.appPrice)}
                                        </span>
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, width: 90 }}>
                                        {row.offerDateStart || '-'}
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, width: 90 }}>
                                        {row.offerDateEnd || '-'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, width: 60 }}>
                                        {row.calenderWeek || '-'}
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, width: 100 }}>
                                        <TruncatedText text={row.brand || ''} maxLength={10} />
                                    </TableCell>
                                    <TableCell sx={{ ...cellSx, width: 140 }}>
                                        <TruncatedText text={row.associatedPdfFile || ''} maxLength={15} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ ...cellSx, width: 60 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(row.id)}
                                            disabled={deletingId === row.id}
                                            sx={{ color: 'var(--color-error)' }}
                                        >
                                            {deletingId === row.id ? (
                                                <CircularProgress size={16} sx={{ color: 'var(--color-error)' }} />
                                            ) : (
                                                <Delete fontSize="small" />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={tableRows.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[10, 15, 25, 50]}
                labelRowsPerPage="Zeilen pro Seite:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
                sx={{
                    backgroundColor: 'var(--color-bg-light)',
                    color: 'var(--color-fg)',
                    borderTop: '1px solid rgba(237,237,237,0.1)',
                    '& .MuiTablePagination-selectIcon': { color: 'var(--color-fg)' },
                    '& .MuiTablePagination-actions .MuiIconButton-root': { color: 'var(--color-fg)' },
                    '& .MuiTablePagination-actions .Mui-disabled': { color: 'rgba(237,237,237,0.3)' },
                }}
            />
        </div>
    );
}
