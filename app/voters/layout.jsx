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
        className={`bg-red-600 w-full text-white flex flex-col md:flex-row items-center justify-between md:p-6 transition-transform transform ${
          isMenuOpen ? 'block' : 'hidden'
        } md:flex md:translate-x-0`}
      >
        {/* Logo alineado a la izquierda */}
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/voters/home">
            <img
              src="https://www.cip.org.pe/images/LOGO_CIP.png"
              alt="Logo"
              className="w-16 h-16 md:w-20 md:h-20 cursor-pointer"
            />
          </Link>
        </div>
  
        {/* Opciones de navegación en columna en móviles y fila en pantallas grandes */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Link href="/voters/home" className="hover:text-yellow-400 py-2 font-medium px-4 rounded-lg text-sm md:text-lg">
            Inicio
          </Link>
          <Link href="/voters/mis-datos" className="hover:text-yellow-400 font-medium py-2 px-4 rounded-lg text-sm md:text-lg">
            Mis Datos
          </Link>
        </div>
  
        {/* Información de usuario alineada a la derecha */}
        <div className="flex items-center gap-4">
          {loading ? (
            <p className="text-center text-sm md:text-lg">Cargando...</p>
          ) : error ? (
            <p className="text-center text-sm md:text-lg">{error}</p>
          ) : (
            <p className="text-center text-sm md:text-lg">{name}</p>
          )}
          <Button
            width="w-1/8"
            background="bg-transparent"
            hovercolor="hover:bg-black"
            onClick={handleLogut}
          >
            <FontAwesomeIcon icon={faRightToBracket} size="lg" />
          </Button>
        </div>
      </nav>
  
      {/* Área principal de contenido */}
      <main className="flex-1 p-4 bg-gray-100">{children}</main>
    </div>
  );
  
}
