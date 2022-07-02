import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const API = 'https://ibovespa-on-sale-ibr11mmad-jvgoulartalmeida.vercel.app';

export default function App() {
  const [columns, setColumns] = useState([]);
  const [rows, setRow] = useState([]);

  const [, setIbovFiltered] = useState([]);

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

  const getStocksInfo = async () => {
    return axios.get(`${API}/api/ibovespa/filtered`);
  }

  useEffect(() => {
    const fetchIbov = async () => {
      const { data } = await getStocksInfo();
      console.log(data)
      buildTable(data);
      setIbovFiltered(data);

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