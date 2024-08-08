import React, { useState, useMemo } from "react";
import CustomDataTable from "./tabla"; // Asegúrate de que la ruta sea correcta
import ActionButtons from "./ActionButtons"


const columns = [
    {
      name: 'Nombre',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Edad',
      selector: row => row.age,
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <ActionButtons 
          onEdit={() => handleEdit(row)} 
          onDelete={() => handleDelete(row)} 
          onView={() => handleView(row)} 
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    // Agrega más columnas según necesites
  ];
  
const data = [
    { id: 1, name: 'Juan', age: 28 },
    { id: 2, name: 'Ana', age: 34 },
    // Agrega más datos según necesites
  ];

// Corrección en la declaración del componente
const ProcesoElectoralDataTable = () => {
  return (
    <CustomDataTable columns={columns} data={data} />
  );
};

export default ProcesoElectoralDataTable;