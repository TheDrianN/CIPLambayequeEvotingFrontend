'use client';

import React, { useEffect, useState } from "react"
import ProcesoElectoralDataTable from "../../../components/tablaProcesoElectoral";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono
import Button from "../../../components/Button"
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT
import Modal from '../../../components/ModalAddProcesoE'; // Asegúrate de importar el modal


export default function ProcesoElectoralPage(){
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado
  const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para controlar el modal
  const [reloadCounter, setReloadCounter] = useState(0);


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
      setIsModalOpen(true);  // Abrir el modal al hacer clic en el botón
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);  // Función para cerrar el modal
  };

  const handleDataUpdate = () => {
    // Cambiar el estado para forzar la recarga de la tabla
    setReloadCounter(reloadCounter + 1);
  };
  if (!authorized) {
    return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
  }

  return (
    <div className="m-5 h-5/6">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className=" text-lg font-medium sm:mb-0 sm:text-xl">Gestionar proceso electoral</h1>
        <Button
          onClick={handleAddNewProceso}
          width="w-full sm:w-1/6"
          background="bg-green-500"
          hovercolor="hover:bg-green-700"
        >
          <FontAwesomeIcon icon={faPlus} /> Agregar nuevo proceso
        </Button>
      </div>
      <hr className="m-5 bg-black" />
      <ProcesoElectoralDataTable key={reloadCounter}/>

      <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleDataUpdate} // Pasar la función de recarga al modal
            />
    </div>
  );
}