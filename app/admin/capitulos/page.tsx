'use client';
import React, { useEffect, useState } from "react";
import ChaptersDataTable from "../../../components/tablaChapters";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from "../../../components/Button";
import Modal from '../../../components/ModalAddCapitulo'; // Asegúrate de importar el modal
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT

export default function Page() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado
    const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para controlar el modal
    const [reloadCounter, setReloadCounter] = useState(0);

    useEffect(() => {
        const token = Cookies.get('access_token');  // Obtener el token de la cookie
    
        if (token) {
            try {
                const decodedToken = jwt_decode.decode(token);
    
                if (decodedToken && typeof decodedToken === 'object') {
                    if (decodedToken.role === 'A') {
                        setAuthorized(true);  // Usuario autorizado
                    } else if (decodedToken.role === 'V') {
                        router.push('/voters/home');
                    } else {
                        setAuthorized(false);  // No está autorizado
                        router.push('/404');  // Redirigir si no es autorizado
                    }
                } else {
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
                <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Gestionar capítulos</h1>
                <Button
                    onClick={handleAddNewProceso}
                    width="w-full sm:w-1/6"
                    background="bg-green-500"
                    hovercolor="hover:bg-green-700"
                >
                    <FontAwesomeIcon icon={faPlus} /> Agregar nuevo capítulo
                </Button>
            </div>
            <hr className="m-5 bg-black" />
            <ChaptersDataTable key={reloadCounter} />

            {/* Renderizar el modal aquí */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleDataUpdate} // Pasar la función de recarga al modal
            />
        </div>
    );
}
