"use client";

import React from "react"
import ProcesoElectoralDataTable from "../../../components/tablaProcesoElectora";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono



export default function ProcesoElectoralPage(){

  return (
    <div className="m-5">
     <div className="flex">
      <h1 className="flex-1 text-lg font-medium">Gestionar Proceso Electoral</h1>
      <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"> <FontAwesomeIcon icon={faPlus} /> Agregar Nuevo Proceso</button>
     </div>
      <hr />
      <ProcesoElectoralDataTable />
    </div>
  );
}