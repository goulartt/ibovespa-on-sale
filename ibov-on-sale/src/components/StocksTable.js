import React, { useMemo, useState } from 'react';
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
  ptBR,
} from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { buildColumns, initialColumnVisibility } from '../lib/columns';
import { FIELDS } from '../lib/fields';

const localeText = ptBR.components.MuiDataGrid.defaultProps.localeText;

function Toolbar() {
  return (
    <GridToolbarContainer sx={{ px: 2, py: 1.5, gap: 1, borderBottom: 1, borderColor: 'divider' }}>
      <GridToolbarQuickFilter placeholder="Buscar ativo ou empresa…" debounceMs={200} sx={{ minWidth: 240, mr: 'auto' }} />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
        csvOptions={{ fileName: 'ibovespa-em-promocao', delimiter: ';', utf8WithBom: true }}
        printOptions={{ disableToolbarButton: true }}
      />
    </GridToolbarContainer>
  );
}

export default function StocksTable({ stocks, loading }) {
  const columns = useMemo(() => buildColumns(FIELDS), []);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => initialColumnVisibility(FIELDS));
  const [pageSize, setPageSize] = useState(25);

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        autoHeight
        rows={stocks}
        columns={columns}
        getRowId={row => row.Ativo}
        loading={loading}
        localeText={localeText}
        components={{ Toolbar }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        initialState={{ sorting: { sortModel: [{ field: 'Ranking', sort: 'asc' }] } }}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[10, 25, 50]}
        rowHeight={56}
        disableSelectionOnClick
        disableColumnMenu
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' },
          '& .MuiDataGrid-columnHeaderTitleContainer': { overflow: 'visible' },
          '& .MuiDataGrid-cell': { fontVariantNumeric: 'tabular-nums', borderColor: 'divider' },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
        }}
      />
    </Box>
  );
}
