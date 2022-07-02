import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import statusInvest from 'statusinvest';
import { RECUPERACAO_JUDICIAL } from './recuperacaoJudicial'
import getMediaMovel from './getMediaMovel'

import * as _ from 'lodash';


export default function App() {
  const [columns, setColumns] = useState([]);
  const [rows, setRow] = useState([]);

  const [ibovData, setIbov] = useState([]);
  const [ibovDataFiltered, setIbovFiltered] = useState([]);

  const buildTable = (data) => {
    const columnsData = Object.keys(data[0]).map((value) => ({
      headerName: value,
      field: value
    }));
    const rowData = data.map((value, index) => ({
      ...value,
      id: index + 1
    }))
    setColumns(columnsData)
    setRow(rowData)
  }

  const filterIbovData = async (data) => {

    const filtered = data.filter(stock => {
      return stock['Liquidez Média Diária'] > 1000000 &&
        stock['Margem Ebit'] > 0 &&
        stock['Dividend Yield'] > 6 &&
        stock['Cotação'] < (((stock['Dividend Yield'] / 100) * stock['Cotação']) / 0.06) &&
        !RECUPERACAO_JUDICIAL.includes(stock.Ativo);
    });

    const sorted = _.orderBy(filtered, ['EV/EBIT', 'Liquidez Média Diária'], ['asc', 'desc']);
    const uniqueSorted = _.slice(_.uniqBy(sorted, a => a.Empresa), 0, 50)
    const finalStocks = await Promise.all(uniqueSorted.map(async (item) => {
      const medias = await getMediaMovel(item.Ativo);
      return {
        ...item,
        ...medias
      }
    }))

    buildTable(finalStocks);

    setIbov(data);
    setIbovFiltered(finalStocks)
  }


  useEffect(() => {
    const fetchIbov = async () => {
      const data = await statusInvest.getStocksInfo();
      await filterIbovData(data);
    }

    fetchIbov();
  }, []);

  return (
    <div style={{ height: '50rem', width: '100%' }}>
      <DataGrid rows={rows} columns={columns} autoPageSize={true} pageSize={50}
        rowsPerPageOptions={[50]} />
    </div>
  );
}