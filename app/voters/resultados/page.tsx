'use client';
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckToSlot, faLaptopMedical, faChartColumn, faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import ResultadosElection from "../../../components/Resultados";
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
  
    if (token) {
      try {
        // Decodificar el token directamente con jwt_decode
        const decodedToken = jwt_decode.decode(token);
        if (decodedToken && typeof decodedToken === 'object') {          
          // Verificar si el rol es "V"
          if (decodedToken.role === 'V') {
            setAuthorized(true);  // Usuario autorizado
          } else if (decodedToken.role === 'A') {
            router.push('/admin/procesoelectoral');
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


  return (
    <div className="flex mt-10 justify-center  bg-gray-100">
      <div className="text-center">
        <ResultadosElection/>
      </div>
    </div>
  );
}
