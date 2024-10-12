'use client';
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckToSlot, faLaptopMedical, faChartColumn, faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT
import config from '../../../config';

// Función para obtener datos iniciales (e.g., todas las elecciones)
const fetchData = async (access_token) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/elections/findElectionstatusP`, {
      method: 'GET',  // Método GET para obtener datos
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,  // Enviar el token en la cabecera de autorización
      },
    });
    
    const responseData = await response.json();
    
    console.log('Datos recibidos:', responseData);
    return responseData.data.length > 0 ? responseData.data[0] : null; // Asegúrate de acceder al primer elemento en "data"
  } catch (error) {
    console.error('Error fetching data:', error);
    return null; // Devuelve null en caso de error
  }
};

// Función para calcular el tiempo restante
const calculateTimeRemaining = (endDate) => {
  const now = new Date();
  const electionEndDate = new Date(endDate);
  const diff = electionEndDate - now;

  if (diff <= 0) return "La elección ha finalizado";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days} días - ${hours} horas - ${minutes} minutos - ${seconds} segundos`;
};

export default function Page() {
  const [election, setElection] = useState(null);  // Estado inicial como null
  const [timeRemaining, setTimeRemaining] = useState('');
  const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado
  const [ tokenAccess, setTokenAccess] = useState('');
  const router = useRouter();
  const [error, setError] = useState(false);  // Nuevo estado para manejar errores


  // Verifica la cookie y decodifica el token para obtener el rol del usuario
  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
  
    if (token) {
      try {
        // Decodificar el token directamente con jwt_decode
        const decodedToken = jwt_decode.decode(token);
        setTokenAccess(token);
        // Verificar si el rol es "V"
        if (decodedToken.role === 'V') {
          setAuthorized(true);  // Usuario autorizado
        }else if(decodedToken.role =='A'){

          router.push('/admin/procesoelectoral');
        } else {
          setAuthorized(false);  // Si hay un error, no está autorizado

          router.push('/404');  // Redirigir si no es autorizado
        }
      } catch (error) {
        router.push('/404');  // Redirigir en caso de error
      }
    } else {
      router.push('/');  // Redirigir si no hay token
    }
  }, [router]);  // Asegúrate de incluir router en las dependencias

  
  // Este useEffect solo hará la consulta a la API una vez cuando el componente se monte
  useEffect(() => {
    const getElectionData = async () => {
      if (authorized && tokenAccess) {  // Verificamos que el usuario esté autorizado y que el token esté disponible
        const data = await fetchData(tokenAccess);  // Enviamos el token en la solicitud
        if (data) {
          console.log('Datos de elección:', data.title); // Verificar los datos recibidos
          setElection(data);
          setTimeRemaining(calculateTimeRemaining(data.end_date)); // Calcula el tiempo restante inicialmente
        } else {
          setError(true); // Si no hay datos o falla la petición, marca error
        }
      }
    };
  
    getElectionData();  // Llamamos a la función para obtener los datos
  }, [authorized, tokenAccess]);  // Aseguramos que se ejecute cuando authorized o tokenAccess cambien

  // Este useEffect manejará el temporizador de actualización cada segundo
  useEffect(() => {
    if (election) {
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(election.end_date));
      }, 1000); // Actualiza el temporizador cada segundo

      // Limpiar el intervalo cuando el componente se desmonta
      return () => clearInterval(interval);
    }
  }, [election]); // El intervalo solo se establece una vez cuando `election` está disponible

  const handleClick = (path) => {
    router.push(path); // Redirige a la ruta especificada
  };

 
  if (!authorized) {
    return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
  }

  return (
    <div className="flex mt-10 justify-center h-screen bg-gray-100">
      <div className="text-center">
      {error ? (  // Si hay un error
          <p>No disponible en este momento</p> // Mensaje en caso de error
        ) : election ? (  // Solo renderizar si `election` no es null
          <>
            <h1 className="text-2xl font-semibold text-center break-words whitespace-normal">{election.title}</h1> {/* Accediendo correctamente al título */}
            <p className="mt-2 text-gray-600">Disponible en {timeRemaining}</p>
          </>
        ) : (
          <p>Cargando datos de la elección...</p> // Mensaje temporal mientras se cargan los datos
        )}

        <div className="mt-8 grid grid-cols-1   sm:grid-cols-3 gap-5">
          {/* Votar */}
          <div
            onClick={() => handleClick("votar/"+ election.id || '')}
            className={`flex flex-col items-center p-6 bg-white shadow-md rounded-lg ${error ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faCheckToSlot} className="text-yellow-600 text-4xl mb-4" />
            <h3 className="font-medium text-lg">Votar</h3>
          </div>


          {/* Resultados */}
          <div
            onClick={() => handleClick("resultados")}
            className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faChartColumn} className="text-red-600 text-4xl mb-4" />
            <h3 className="font-medium text-lg">Resultados</h3>
          </div>

          {/* Encuesta */}
          <div
          onClick={() => window.open("https://forms.gle/p8VR14zF39ufXM4d9", "_blank")}
          className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-200"
        >
          <FontAwesomeIcon icon={faClipboardQuestion} className="text-blue-600 text-4xl mb-4" />
          <h3 className="font-medium text-lg">Encuesta</h3>
        </div>
        </div>
      </div>
    </div>
  );
}
