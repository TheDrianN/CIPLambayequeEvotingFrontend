"use client";


import React from "react"
import MiembrosVotantesDataTable from "../../../components/tablaMiembroVotante";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono
import Button from "../../../components/Button"
import SubElectionsDataTable from "../../../components/tablaSubElections"
import { useRouter } from 'next/navigation';

export default function VotantesPage(){
    const router = useRouter();

    const handleAddNewProceso = () => {
      router.push('/admin/subelections/add');
    };

    return (
        <div className="m-5">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h1 className=" text-lg font-medium sm:mb-0 sm:text-xl">Gestionar Sub Elecciones</h1>
            <Button
              onClick={handleAddNewProceso}
              width="w-full sm:w-1/6"
              background="bg-green-500"
              hovercolor="hover:bg-green-700"
            >
              <FontAwesomeIcon icon={faPlus} /> Agregar Nueva Sub Elección
            </Button>
          </div>
          <hr />
          <SubElectionsDataTable/>
          
        </div>
      );
}