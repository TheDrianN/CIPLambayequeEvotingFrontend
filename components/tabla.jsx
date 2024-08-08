import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";

// Definimos los textos en español para la tabla
const customStyles = {
  headRow: {
    style: {
      fontSize: '16px',
      backgroundColor: '#f4f4f4',
    },
  },
  rows: {
    style: {
      fontSize: '14px',
    },
  },
};

const CustomDataTable = ({ columns, data }) => {
  const [filter, setFilter] = useState("");
  const [records, setRecords] = useState(data);

  // Maneja el cambio en el input
  const handleChange = (e) => {
    const filterValue = e.target.value;
    setFilter(filterValue);

    // Filtra los registros basados en el valor del input
    const filteredRecords = data.filter((record) => {
      return Object.values(record).some((value) =>
        value.toString().toLowerCase().includes(filterValue.toLowerCase())
      );
    });

    setRecords(filteredRecords);
  };

  return (
    <div className="mt-3">
      <input className="block rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900  ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-400"
        type="text"
        value={filter}
        onChange={handleChange}
        placeholder="Buscar..."
      />
      
      <DataTable
        columns={columns}
        data={records}
        customStyles={customStyles}
        pagination
        fixedHeader
        paginationComponentOptions={{
          rowsPerPageText: 'Filas por página:',
          rangeSeparatorText: 'de',
          noRowsPerPage: true,
        }}
        noDataComponent="No hay datos disponibles"
      />
    </div>
  );
};

export default CustomDataTable;
