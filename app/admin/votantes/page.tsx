"use client";


import React, { useEffect, useState } from "react"
import MiembrosVotantesDataTable from "../../../components/tablaMiembroVotante";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono
import Button from "../../../components/Button"
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT


export default function VotantesPage(){
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado

    useEffect(() => {
      const token = Cookies.get('access_token');  // Obtener el token de la cookie
    
      if (token) {
        try {
          // Decodificar el token directamente con jwt_decode
          const decodedToken = jwt_decode.decode(token);
    
          // Verificar si `decodedToken` no es null
          if (decodedToken && typeof decodedToken === 'object') {
            // Verificar si el rol es "V"
            if (decodedToken.role === 'A') {
              setAuthorized(true);  // Usuario autorizado
            } else if (decodedToken.role === 'V') {
              router.push('/voters/home');
            } else {
              setAuthorized(false);  // Si hay un error, no está autorizado
              router.push('/404');  // Redirigir si no es autorizado
            }
          } else {
            // Si `decodedToken` es null o no es un objeto válido
            setAuthorized(false);
            router.push('/404');  // Redirigir en caso de error
          }
        } catch (error) {
          router.push('/404');  // Redirigir en caso de error
        }
      } else {
        router.push('/');  // Redirigir si no hay token
      }
    }, [router]);  // Asegúrate de incluir router en las dependencias
    
    const handleAddNewProceso = () => {
      router.push('/admin/votantes/add');
    };

    if (!authorized) {
      return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
    }

    return (
        <div className="m-5 h-5/6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h1 className=" text-lg font-medium sm:mb-0 sm:text-xl">Gestionar votantes</h1>
            <Button
              onClick={handleAddNewProceso}
              width="w-full sm:w-1/6"
              background="bg-green-500"
              hovercolor="hover:bg-green-700"
            >
              <FontAwesomeIcon icon={faPlus} /> Agregar nuevo votante
            </Button>
          </div>
          <hr className="m-5 bg-black" />
          
          <MiembrosVotantesDataTable />
        </div>
      );
}