'use client';

import React, { useState, useMemo, ChangeEvent } from 'react';
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
} from '@mui/material';
import { Delete, Search, Download, Description } from '@mui/icons-material';
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

// Gemeinsame Cell Styles
const cellSx = {
    backgroundColor: 'var(--color-bg-light)',
    color: 'var(--color-fg)',
    borderBottom: '1px solid rgba(237,237,237,0.1)',
};

export function OffersTable({ data, isLoading, onDelete }: OffersTableProps) {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof OfferDataTypes>('productName');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

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

    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return data.filter((offer) =>
            offer.productName?. toLowerCase().includes(query) ||
            offer.storeName?.toLowerCase().includes(query) ||
            offer.brand?. toLowerCase().includes(query)
        );
    }, [data, searchQuery]);

    const sortedData = useMemo(() => {
        return [...filteredData]. sort(getComparator(order, orderBy));
    }, [filteredData, order, orderBy]);

    const paginatedData = useMemo(() => {
        return sortedData. slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [sortedData, page, rowsPerPage]);

    return (
        <div>
            {/* Toolbar */}
            <Paper
                elevation={0}
                className="mb-4 p-4 border border-fg/10"
                sx={{ backgroundColor: 'var(--color-bg-light)' }}
            >
                <div className="flex items-center justify-between gap-4">
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
                                    '&. Mui-focused fieldset': { borderColor: 'var(--color-accent)' },
                                },
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
            </Paper>

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                className="max-h-[calc(100vh-300px)] border border-fg/10"
                sx={{ backgroundColor: 'var(--color-bg-light)' }}
            >
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell. numeric ? 'right' : 'left'}
                                    style={{ width: headCell.width }}
                                    sx={{ ... cellSx, fontWeight: 600 }}
                                >
                                    <TableSortLabel
                                        active={orderBy === headCell.id}
                                        direction={orderBy === headCell. id ? order : 'asc'}
                                        onClick={() => handleSort(headCell.id)}
                                        sx={{
                                            color: 'var(--color-fg)',
                                            '&. Mui-active': { color: 'var(--color-accent)' },
                                            '& .MuiTableSortLabel-icon': { color: 'var(--color-accent) !important' },
                                        }}
                                    >
                                        {headCell.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell sx={{ ... cellSx, width: 60 }} />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            Array. from({ length: 10 }). map((_, i) => (
                                <TableRow key={i}>
                                    {headCells.map((_, j) => (
                                        <TableCell key={j} sx={cellSx}>
                                            <Skeleton variant="text" sx={{ bgcolor: 'rgba(237,237,237,0. 15)' }} />
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
                                    sx={{ ... cellSx, py: 8 }}
                                >
                                    <Description sx={{ fontSize: 48, mb: 2, opacity: 0.3, color: 'var(--color-fg)' }} />
                                    <p>Keine Angebote gefunden</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData. map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:hover td': { backgroundColor: 'rgba(237,237,237,0. 05)' } }}
                                >
                                    <TableCell sx={cellSx}>
                                        {row. productName || '-'}
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        {row. storeName || '-'}
                                    </TableCell>
                                    <TableCell align="right" sx={cellSx}>
                                        {formatPrice(row. originalPrice)}
                                    </TableCell>
                                    <TableCell align="right" sx={cellSx}>
                                        <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                                            {formatPrice(row.price)}
                                        </span>
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        {row.offerDateStart || '-'}
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        {row.offerDateEnd || '-'}
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        {row.brand || '-'}
                                    </TableCell>
                                    <TableCell align="center" sx={cellSx}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(row.id)}
                                            disabled={deletingId === row.id}
                                            sx={{ color: 'var(--color-error)' }}
                                        >
                                            {deletingId === row. id ? (
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

            {/* Pagination */}
            <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target. value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[10, 15, 25, 50]}
                labelRowsPerPage="Zeilen pro Seite:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} von ${count}`}
                sx={{
                    backgroundColor: 'var(--color-bg-light)',
                    color: 'var(--color-fg)',
                    borderTop: '1px solid rgba(237,237,237,0. 1)',
                    '& .MuiTablePagination-selectIcon': { color: 'var(--color-fg)' },
                    '& .MuiTablePagination-actions . MuiIconButton-root': { color: 'var(--color-fg)' },
                    '& .MuiTablePagination-actions . Mui-disabled': { color: 'rgba(237,237,237,0. 3)' },
                }}
            />
        </div>
    );
}