import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const API = 'https://ibovespa-on-sale-k4yd3ybyo-jvgoulartalmeida.vercel.app';

const buildTable = (data) => {
  const columnsData = Object.keys(data[0]).map((value) => ({
    headerName: value,
    field: value
  }));
  const rowData = data.map((value, index) => ({
    ...value,
    id: index + 1
  }));
  return { columnsData, rowData };
};

export default function App() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const getStocksInfo = async () => {
    try {
      const response = await axios.get(`${API}/api/ibovespa/filtered`);
      return response.data;
    } catch (error) {
      setError('Ocorreu um erro ao buscar os dados. Por favor, tente novamente mais tarde.');
      return [];
    }
  };
  useEffect(() => {
    const fetchIbov = async () => {
      try {
        const data = await getStocksInfo();
        const { columnsData, rowData } = buildTable(data);
        setColumns(columnsData);
        setRows(rowData);
      } catch (error) {
        setError('Ocorreu um erro ao buscar os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIbov();
  }, []);

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (

    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ height: 'calc(100% - 40px)', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoPageSize={true}
          pageSize={50}
          rowsPerPageOptions={[50]}
          disableColumnMenu
          responsiveLayout="autoSizeColumns"
        />
      </div>
      <div style={{ height: '40px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '16px' }}>
        Powered by João Goulart
      </div>
    </div>
  );
}