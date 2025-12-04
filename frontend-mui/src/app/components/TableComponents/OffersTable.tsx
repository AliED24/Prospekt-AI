'use client';

import React, { useState, useMemo, ChangeEvent } from 'react';
import {
    Box,
    Paper,
    Typography,
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
} from '@mui/material';
import {
    Delete,
    Search,
    Download,
    Description,
} from '@mui/icons-material';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import { OfferDataTypes, Order } from './types';
import { COLORS, headCells } from './constants';
import { getComparator, formatPrice } from './utils';

// ============================================================================
// TYPES
// ============================================================================

interface OffersTableProps {
    data: OfferDataTypes[];
    isLoading: boolean;
    onDelete: (id: number) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OffersTable({ data, isLoading, onDelete }: OffersTableProps) {
    // State
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof OfferDataTypes>('productName');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ========================================================================
    // HANDLERS
    // ========================================================================

    const handleDelete = async (id: number) => {
        if (! window.confirm('Möchten Sie diesen Datensatz wirklich löschen?')) return;

        try {
            setDeletingId(id);
            await onDelete(id);
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = () => {
        if (! data.length) return;

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX. utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Angebote');
        XLSX.writeFile(workbook, `angebote_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const handleSort = (property: keyof OfferDataTypes) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ?  'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target. value, 10));
        setPage(0);
    };

    // ========================================================================
    // FILTERED & SORTED DATA
    // ========================================================================

    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return data.filter((offer) =>
            offer.productName?. toLowerCase().includes(query) ||
            offer.storeName?.toLowerCase().includes(query) ||
            offer. brand?.toLowerCase().includes(query)
        );
    }, [data, searchQuery]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort(getComparator(order, orderBy));
    }, [filteredData, order, orderBy]);

    const paginatedData = useMemo(() => {
        return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [sortedData, page, rowsPerPage]);

    // ========================================================================
    // STYLES
    // ========================================================================

    const cellStyle = {
        color: COLORS.foreground,
        backgroundColor: COLORS.backgroundLight,
        borderBottom: `1px solid ${COLORS. border}`,
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <Box>
            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: COLORS.backgroundLight,
                    border: `1px solid ${COLORS.border}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: `${COLORS.foreground}66` }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: 300,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: COLORS.background,
                                color: COLORS.foreground,
                                '& fieldset': { borderColor: COLORS.border },
                                '&:hover fieldset': { borderColor: `${COLORS.foreground}66` },
                                '&. Mui-focused fieldset': { borderColor: COLORS.accent },
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: `${COLORS.foreground}66`,
                                opacity: 1,
                            },
                        }}
                    />

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        onClick={handleExport}
                        disabled={! data.length}
                        sx={{
                            borderColor: `${COLORS.foreground}66`,
                            color: COLORS.foreground,
                            '&:hover': {
                                borderColor: COLORS.foreground,
                                backgroundColor: `${COLORS.foreground}1a`,
                            },
                        }}
                    >
                        Excel Export
                    </Button>
                </Box>
            </Paper>

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    maxHeight: 'calc(100vh - 300px)',
                    backgroundColor: COLORS.backgroundLight,
                    border: `1px solid ${COLORS.border}`,
                }}
            >
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell. id}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell. id ? order : false}
                                    sx={{
                                        backgroundColor: COLORS.backgroundLight,
                                        color: COLORS.foreground,
                                        fontWeight: 600,
                                        borderBottom: `1px solid ${COLORS.border}`,
                                        width: headCell.width,
                                    }}
                                >
                                    <TableSortLabel
                                        active={orderBy === headCell. id}
                                        direction={orderBy === headCell. id ? order : 'asc'}
                                        onClick={() => handleSort(headCell.id)}
                                        sx={{
                                            color: `${COLORS.foreground} !important`,
                                            '&. Mui-active': { color: `${COLORS.accent} !important` },
                                            '& .MuiTableSortLabel-icon': { color: `${COLORS.accent} !important` },
                                        }}
                                    >
                                        {headCell.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell
                                align="center"
                                sx={{
                                    backgroundColor: COLORS. backgroundLight,
                                    color: COLORS.foreground,
                                    borderBottom: `1px solid ${COLORS. border}`,
                                    width: 60,
                                }}
                            />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }). map((_, i) => (
                                <TableRow key={i}>
                                    {headCells.map((_, j) => (
                                        <TableCell key={j} sx={cellStyle}>
                                            <Skeleton variant="text" sx={{ bgcolor: `${COLORS.foreground}33` }} />
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ backgroundColor: COLORS.backgroundLight }} />
                                </TableRow>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={headCells.length + 1}
                                    align="center"
                                    sx={{
                                        color: `${COLORS.foreground}99`,
                                        py: 8,
                                        backgroundColor: COLORS.backgroundLight,
                                    }}
                                >
                                    <Description sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                                    <Typography>Keine Angebote gefunden</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:hover': { backgroundColor: `${COLORS.foreground}08` } }}
                                >
                                    {/* Produktname */}
                                    <TableCell sx={cellStyle}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {row.productName || '-'}
                                        </Typography>
                                    </TableCell>

                                    {/* Einzelhändler */}
                                    <TableCell sx={cellStyle}>
                                        {row.storeName || '-'}
                                    </TableCell>

                                    {/* Originalpreis */}
                                    <TableCell align="right" sx={cellStyle}>
                                        {formatPrice(row. originalPrice)}
                                    </TableCell>

                                    {/* Angebotspreis */}
                                    <TableCell align="right" sx={cellStyle}>
                                        <Typography sx={{ color: '#4ade80', fontWeight: 500 }}>
                                            {formatPrice(row.price)}
                                        </Typography>
                                    </TableCell>

                                    {/* Gültig von */}
                                    <TableCell sx={cellStyle}>
                                        {row.offerDateStart || '-'}
                                    </TableCell>

                                    {/* Gültig bis */}
                                    <TableCell sx={cellStyle}>
                                        {row.offerDateEnd || '-'}
                                    </TableCell>

                                    {/* Marke */}
                                    <TableCell sx={cellStyle}>
                                        {row.brand || '-'}
                                    </TableCell>

                                    {/* Delete Button */}
                                    <TableCell align="center" sx={cellStyle}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(row. id)}
                                            disabled={deletingId === row.id}
                                            sx={{ color: '#ef4444' }}
                                        >
                                            {deletingId === row.id ? (
                                                <CircularProgress size={16} />
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

            {/* Pagination */}
            <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 15, 25, 50]}
                labelRowsPerPage="Zeilen pro Seite:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
                sx={{
                    color: COLORS.foreground,
                    backgroundColor: COLORS. backgroundLight,
                    borderTop: `1px solid ${COLORS.border}`,
                    '& .MuiTablePagination-selectIcon': { color: COLORS.foreground },
                    '& .MuiIconButton-root': { color: COLORS. foreground },
                    '& .MuiIconButton-root. Mui-disabled': { color: `${COLORS.foreground}40` },
                    '& . MuiSelect-select': { color: COLORS.foreground },
                }}
            />
        </Box>
    );
}