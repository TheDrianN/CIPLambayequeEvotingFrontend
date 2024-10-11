import React, { useState,useEffect } from "react";
import DataTable from "react-data-table-component";
import InputField from "../components/InputField";
import Card from "../components/Card";

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
  tableWrapper: {
    style: {
      display: 'block', // Esto asegura que el scroll horizontal se muestre en pantallas pequeñas
      overflowX: 'auto',
      maxWidth: '100%', // Ajusta el ancho máximo a toda la pantalla disponible
      width: '100%', // Asegura que el elemento ocupe todo el ancho disponible
    },
  },
};

const CustomDataTable = ({ columns, data }) => {
  const [filter, setFilter] = useState("");
  const [records, setRecords] = useState(data);

    // Este hook se asegura de que los registros se actualicen cada vez que cambien los datos recibidos en 'data'
    useEffect(() => {
      setRecords(data);  // Actualizamos 'records' con los datos recibidos
    }, [data]);  // Esto se ejecuta cada vez que 'data' cambia

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
    <Card className=" h-full">
      <div className="mt-3">
        <InputField 
          type="text"
          value={filter}
          size="w-1/4"
          onChange={handleChange}
          placeholder="Buscar..."
        />

        <div className="table-responsive">
          <DataTable
            columns={columns}
            data={records}
            customStyles={customStyles}
            pagination
            fixedHeader
            
            
            striped
            compact
            paginationComponentOptions={{
              rowsPerPageText: 'Filas por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: true,
            }}
            noDataComponent="No hay datos disponibles"
            
          />
        </div>
      </div>
    </Card>
  );
};

export default CustomDataTable;
