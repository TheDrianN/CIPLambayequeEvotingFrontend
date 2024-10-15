'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import '../globals.css';
import Button from '@/components/Button';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT
import config from '../../config';
import Link from 'next/link';

const fetchUser = async (userid, access_token) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/users/` + userid, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });
    const responseData = await response.json();
    console.log(responseData)
    return responseData.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export default function VotersLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);  // Estado de carga
  const [error, setError] = useState(null);      // Estado de error

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogut = () => {
    Cookies.remove('access_token');  // Elimina la cookie llamada 'access_token'
    window.location.reload(); 
  };

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie

    if (!token) {
      setError('No se encontró el token de acceso');
      setLoading(false);
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwt_decode.decode(token);  // Decodificar el token correctamente
    } catch (err) {
      setError('Error al decodificar el token');
      setLoading(false);
      return;
    }

    const getData = async () => {
      try {
        const data = await fetchUser(decodedToken.sub, token);
        if (data) {
          setName(`${data.names} ${data.surnames}`);
        } else {
          setError('Error al obtener los datos del usuario');
        }
      } catch (err) {
        setError('Error al obtener los datos del usuario');
      } finally {
        setLoading(false);  // Finalizar la carga
      }
    };

    getData();
  }, []);  // Este hook solo se ejecuta una vez al montar el componente

  return (
    <div className="h-screen flex flex-col">
      {/* Botón para abrir/cerrar el menú en pantallas pequeñas */}
      <button
        className="block md:hidden p-4 text-white bg-red-600 focus:outline-none"
        onClick={handleMenuToggle}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* Menú de navegación */}
      <nav
        className={`bg-red-600 w-full text-white flex flex-col md:p-6 transition-transform transform ${
          isMenuOpen ? 'translate-x-0' : 'hidden'
        } md:translate-x-0 w-full md:relative md:flex md:flex-col`}
      >
        <div className="h-14 text-center mb-4">
          <Link href="/voters/home"> {/* Cambia "/ruta-destino" por la ruta deseada */}
            <img
              src="https://www.cip.org.pe/images/LOGO_CIP.png"
              alt="Logo"
              className="mx-auto w-20 h-20 cursor-pointer"
            />
          </Link>
        </div>

        <div className="flex justify-end items-center gap-4 h-7 mt-auto">
          {loading ? (
            <p className="text-center mb-2">Cargando...</p>
          ) : error ? (
            <p className="text-center mb-2">{error}</p>
          ) : (
            <p className="text-center mb-2">{name}</p>
          )}
          <Button
            width="w-1/8"
            background="bg-transparent"
            hovercolor="hover:bg-black"
            onClick={handleLogut}
          >
            <FontAwesomeIcon icon={faRightToBracket} />
          </Button>
        </div>
      </nav>

      {/* Área principal de contenido */}
      <main className="flex-1 p-4 bg-gray-100">{children}</main>
    </div>
  );
}
