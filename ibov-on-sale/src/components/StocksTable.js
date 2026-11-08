import React, { useMemo, useState } from 'react';
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  ptBR,
} from '@mui/x-data-grid';
import { Box, Button, TablePagination } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { buildColumns, initialColumnVisibility, withLabels } from '../lib/columns';
import { FIELDS } from '../lib/fields';
import { downloadCsv, PAGE_SIZE_OPTIONS, paginate, searchRows, sortRows, toCsv } from '../lib/tableData';

const localeText = ptBR.components.MuiDataGrid.defaultProps.localeText;

function Toolbar({ onExport }) {
  return (
    <GridToolbarContainer sx={{ px: 2, py: 1.5, gap: 1, borderBottom: 1, borderColor: 'divider' }}>
      <GridToolbarQuickFilter placeholder="Buscar ativo ou empresa…" debounceMs={200} sx={{ minWidth: 240, mr: 'auto' }} />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <Button size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={onExport}>Exportar CSV</Button>
    </GridToolbarContainer>
  );
}

export default function StocksTable({ stocks, loading, hiddenColumns = [], visibleColumns = null, shownColumns = [], columnLabels }) {
  const fields = useMemo(() => withLabels(FIELDS, columnLabels), [columnLabels]);
  const columns = useMemo(() => buildColumns(fields), [fields]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => initialColumnVisibility(FIELDS, hiddenColumns, visibleColumns, shownColumns));
  const [sortModel, setSortModel] = useState([{ field: 'Ranking', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState({ items: [], quickFilterValues: [] });
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);

  // Search and sort the whole list, then hand only the current page to the grid.
  const visible = useMemo(
    () => sortRows(searchRows(stocks, filterModel.quickFilterValues), sortModel),
    [stocks, filterModel, sortModel],
  );
  const current = paginate(visible, page, pageSize);

  const exportCsv = () => {
    const shown = fields.filter(f => columnVisibilityModel[f.field] !== false);
    downloadCsv(toCsv(visible, shown), 'ibovespa-em-promocao.csv');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        autoHeight
        rows={current.rows}
        columns={columns}
        getRowId={row => row.Ativo}
        loading={loading}
        localeText={localeText}
        components={{ Toolbar }}
        componentsProps={{ toolbar: { onExport: exportCsv } }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={model => { setSortModel(model); setPage(0); }}
        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={model => { setFilterModel(model); setPage(0); }}
        hideFooter
        rowHeight={56}
        disableSelectionOnClick
        disableColumnMenu
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' },
          '& .MuiDataGrid-columnHeaderTitleContainer': { overflow: 'visible' },
          '& .MuiDataGrid-cell': { fontVariantNumeric: 'tabular-nums', borderColor: 'divider' },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
        }}
      />
      <TablePagination
        component="div"
        count={visible.length}
        page={current.page}
        onPageChange={(event, next) => setPage(next)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        onRowsPerPageChange={event => { setPageSize(Number(event.target.value)); setPage(0); }}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        getItemAriaLabel={type => ({ first: 'Primeira página', last: 'Última página', next: 'Próxima página', previous: 'Página anterior' }[type])}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />
    </Box>
  );
}
