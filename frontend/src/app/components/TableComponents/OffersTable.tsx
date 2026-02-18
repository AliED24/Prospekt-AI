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

// ============================================================================
// STYLING KONSTANTEN
// ============================================================================

const cellSx = {
    backgroundColor: 'var(--color-bg-light)',
    color: 'var(--color-fg)',
    borderBottom: `1px solid var(--color-border-light)`,
    padding: '12px 12px',
    height: '64px',
    minHeight: '64px',
    verticalAlign: 'middle',
    maxWidth: 0,
    overflow: 'hidden',
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

interface TableRowData {
    type: 'header' | 'data';
    data: OfferDataTypes | null;
    groupKey?: string;
    count?: number;
    isExpanded?: boolean; // Neu: Zeigt ob die Gruppe expandiert ist
}

export function OffersTable({ data, isLoading, onDelete }: OffersTableProps) {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof OfferDataTypes>('productName');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedKW, setSelectedKW] = useState<number | ''>('');
    const [selectedStore, setSelectedStore] = useState<string>('');

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

    const availableKWs = useMemo(() => {
        const kwSet = new Set<number>();
        data.forEach((offer) => {
            if (offer.calenderWeek && offer.calenderWeek > 0) {
                kwSet.add(offer.calenderWeek);
            }
        });
        return Array.from(kwSet).sort((a, b) => a - b);
    }, [data]);

    const availableStores = useMemo(() => {
        const storeSet = new Set<string>();
        data.forEach((offer) => {
            if (offer.storeName) {
                storeSet.add(offer.storeName);
            }
        });
        return Array.from(storeSet).sort();
    }, [data]);

    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return data.filter((offer) => {
            const matchesSearch = offer.productName?.toLowerCase().includes(query) ||
                offer.storeName?.toLowerCase().includes(query) ||
                offer.brand?.toLowerCase().includes(query);

            const matchesKW = selectedKW === '' || offer.calenderWeek === selectedKW;
            const matchesStore = selectedStore === '' || offer.storeName === selectedStore;

            return matchesSearch && matchesKW && matchesStore;
        });
    }, [data, searchQuery, selectedKW, selectedStore]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort(getComparator(order, orderBy));
    }, [filteredData, order, orderBy]);

    const groupedData = useMemo(() => {
        const groups: Record<string, OfferDataTypes[]> = {};
        sortedData.forEach((item) => {
            const key = `${item.productName || 'Unbenannt'}__${item.quantity || ''}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });
        return groups;
    }, [sortedData]);

    // ÄNDERUNG: Behalte Informationen über expandierte Gruppen bei jeder Zeile
    const tableRows = useMemo(() => {
        const rows: TableRowData[] = [];
        Object.entries(groupedData).forEach(([groupKey, items]) => {
            const isExpanded = expandedProducts.has(groupKey);

            if (items.length === 1) {
                rows.push({
                    type: 'data',
                    data: items[0],
                    isExpanded: false,
                });
            } else {
                // Header-Zeile
                rows.push({
                    type: 'header',
                    data: null,
                    groupKey,
                    count: items.length,
                    isExpanded,
                });

                // Daten-Zeilen (nur wenn expandiert)
                if (isExpanded) {
                    items.forEach(item => {
                        rows.push({
                            type: 'data',
                            data: item,
                            isExpanded: true,
                        });
                    });
                }
            }
        });
        return rows;
    }, [groupedData, expandedProducts]);

    const paginatedData = useMemo(() => {
        return tableRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [tableRows, page, rowsPerPage]);

    const toggleProductExpansion = (groupKey: string) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(groupKey)) {
            newExpanded.delete(groupKey);
        } else {
            newExpanded.add(groupKey);
        }
        setExpandedProducts(newExpanded);
    };

    const renderCellContent = (headCell: typeof headCells[0], rowData: TableRowData) => {
        const row = rowData.data;
        if (!row) return null;

        const value = row[headCell.id];

        if (headCell.id === 'productDescription') {
            return (
                <span style={{ whiteSpace: 'normal', wordBreak: 'break-word', display: 'block' }}>
                    {value || '-'}
                </span>
            );
        }

        // @ts-ignore
        if (['originalPrice', 'price', 'appPrice'].includes(headCell.id)) {
            return (
                <span
                    style={
                        headCell.id !== 'originalPrice'
                            ? { color: 'var(--color-success)', fontWeight: 500 }
                            : undefined
                    }
                >
                    {formatPrice(value)}
                </span>
            );
        }

        if (headCell.id === 'calenderWeek') {
            return value || '-';
        }

        const maxLengths: Record<string, number> = {
            storeName: 12,
            quantity: 18,
            brand: 10,
            associatedPdfFile: 15,
        };
        const maxLength = maxLengths[headCell.id as string] || 20;
        return <TruncatedText text={typeof value === 'string' ? value : value?.toString?.() ?? ''} maxLength={maxLength} />;
    };

    const renderHeaderCell = (headCell: typeof headCells[0], rowData: TableRowData) => {
        if (headCell.id === 'productName' && rowData.groupKey && rowData.count) {
            const isExpanded = expandedProducts.has(rowData.groupKey);
            const grammatur = rowData.groupKey.split('__')[1];
            const productName = rowData.groupKey.split('__')[0];
            const displayText = `${productName}${grammatur ? `, ${grammatur}` : ''} (${rowData.count})`;

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                    <IconButton
                        size="small"
                        onClick={() => toggleProductExpansion(rowData.groupKey!)}
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
                        <TruncatedText text={displayText} maxLength={40} />
                    </Box>
                </Box>
            );
        }
        return null;
    };

    const getRowBackgroundColor = (rowData: TableRowData) => {
        if (rowData.type === 'header') {
            return 'var(--color-bg-header-dark)';
        }
        if (rowData.isExpanded && rowData.type === 'data') {
            return 'var(--color-bg-expanded-light)';
        }
        return 'transparent';
    };

    return (
        <div>
            <Paper
                elevation={0}
                className="mb-4 p-4 border"
                sx={{
                    backgroundColor: 'var(--color-bg-light)',
                    borderColor: 'var(--color-border-light)',
                }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
                                            <Search sx={{ color: 'var(--color-fg)', opacity: 0.5 }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        backgroundColor: 'var(--color-bg)',
                                        color: 'var(--color-fg)',
                                        '& fieldset': { borderColor: 'var(--color-border-light)' },
                                        '&:hover fieldset': { borderColor: 'var(--color-border-hover)' },
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
                                Wettbewerber
                            </InputLabel>
                            <Select
                                value={selectedStore}
                                label="Wettbewerber"
                                onChange={(e) => setSelectedStore(e.target.value)}
                                sx={{
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-fg)',
                                    '& fieldset': { borderColor: 'var(--color-border-light)' },
                                    '&:hover fieldset': { borderColor: 'var(--color-border-hover)' },
                                    '&.Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
                                    '& .MuiSelect-icon': { color: 'var(--color-fg)' },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Alle Wettbewerber</em>
                                </MenuItem>
                                {availableStores.map((store) => (
                                    <MenuItem key={store} value={store}>
                                        {store}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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
                                    '& fieldset': { borderColor: 'var(--color-border-light)' },
                                    '&:hover fieldset': { borderColor: 'var(--color-border-hover)' },
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
                                borderColor: 'var(--color-border-light)',
                                color: 'var(--color-fg)',
                                '&:hover': {
                                    borderColor: 'var(--color-fg)',
                                    backgroundColor: 'var(--color-bg)',
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
                className="max-h-[calc(100vh-300px)] border"
                sx={{
                    backgroundColor: 'var(--color-bg-light)',
                    borderColor: 'var(--color-border-light)',
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
                                    sx={{ ...cellSx, fontWeight: 600, whiteSpace: 'normal' }}
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
                                            <Skeleton variant="text" sx={{ bgcolor: 'var(--color-border-light)' }} />
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
                            paginatedData.map((rowData, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    sx={{
                                        '&:hover td': { backgroundColor: 'var(--color-bg)' },
                                        verticalAlign: 'middle',
                                        backgroundColor: getRowBackgroundColor(rowData),
                                    }}
                                >
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.numeric ? 'right' : 'left'}
                                            sx={{
                                                ...cellSx,
                                                width: headCell.width,
                                                minWidth: headCell.width,
                                                maxWidth: headCell.width,
                                                overflow: headCell.id === 'productDescription' ? 'visible' : 'hidden',
                                                whiteSpace: headCell.id === 'productDescription' ? 'normal' : 'nowrap',
                                                textOverflow: headCell.id === 'productDescription' ? 'unset' : 'ellipsis',
                                                fontWeight: rowData.type === 'header' ? 600 : 'normal',
                                                backgroundColor: getRowBackgroundColor(rowData),
                                            }}
                                        >
                                            {rowData.type === 'header' ? renderHeaderCell(headCell, rowData) : renderCellContent(headCell, rowData)}
                                        </TableCell>
                                    ))}
                                    <TableCell
                                        align="center"
                                        sx={{
                                            ...cellSx,
                                            width: 60,
                                            minWidth: 60,
                                            maxWidth: 60,
                                            backgroundColor: getRowBackgroundColor(rowData),
                                        }}
                                    >
                                        {rowData.type === 'data' && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(rowData.data!.id)}
                                                disabled={deletingId === rowData.data!.id}
                                                sx={{ color: 'var(--color-error)' }}
                                            >
                                                {deletingId === rowData.data!.id ? (
                                                    <CircularProgress size={16} sx={{ color: 'var(--color-error)' }} />
                                                ) : (
                                                    <Delete fontSize="small" />
                                                )}
                                            </IconButton>
                                        )}
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
                    borderTop: `1px solid var(--color-border-light)`,
                    '& .MuiTablePagination-selectIcon': { color: 'var(--color-fg)' },
                    '& .MuiTablePagination-actions .MuiIconButton-root': { color: 'var(--color-fg)' },
                    '& .MuiTablePagination-actions .Mui-disabled': { color: 'var(--color-border-light)' },
                }}
            />
        </div>
    );
}