"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../globals.css';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT
import config from '../../config';

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
export default function AdminLayout({ children }) {
    // Cargar la ruta activa desde localStorage o usar la ruta por defecto
    const [activeLink, setActiveLink] = useState('/admin/procesoelectoral');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);  // Estado de carga
    const [error, setError] = useState(null);      // Estado de error

    useEffect(() => {
        // Obtener el valor de activeLink desde localStorage al montar el componente
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

        const storedActiveLink = localStorage.getItem('activeLink');
        if (storedActiveLink) {
            setActiveLink(storedActiveLink);
        }
    }, []);

    // Función para manejar el clic en un enlace
    const handleLinkClick = (path) => {
        setActiveLink(path);
        localStorage.setItem('activeLink', path); // Guardar el enlace activo en localStorage
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="h-screen flex flex-col md:flex-row">
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

            <nav
                className={`bg-red-600 text-white flex flex-col p-4 md:p-6 transition-transform transform ${
                    isMenuOpen ? 'translate-x-0' : 'hidden'
                } md:translate-x-0 md:relative md:flex md:flex-col md:w-1/6`}
            >
                <div className="text-center mb-4">
                    <img src='https://www.cip.org.pe/images/LOGO_CIP.png' alt="Logo" className="mx-auto w-20 h-20" />
                </div>
                <ul className="flex flex-col">
                    <li className="mb-2">
                        <Link href="/admin/capitulos" passHref>
                            <h4
                                onClick={() => handleLinkClick('/admin/capitulos')}
                                className={`block p-2 rounded hover:bg-red-700 font-medium text-lg ${activeLink === '/admin/capitulos' ? 'text-amber-400' : ''}`}
                            >
                                Captitulos
                            </h4>
                        </Link>
                    </li>

                    <li className="mb-2">
                        <Link href="/admin/votantes" passHref>
                            <h4
                                onClick={() => handleLinkClick('/admin/votantes')}
                                className={`block p-2 rounded hover:bg-red-700 font-medium text-lg ${activeLink === '/admin/votantes' ? 'text-amber-400' : ''}`}
                            >
                                Votantes
                            </h4>
                        </Link>
                    </li>

                    <li className="mb-2">
                        <Link href="/admin/rolcandidato" passHref>
                            <h4
                                onClick={() => handleLinkClick('/admin/rolcandidato')}
                                className={`block p-2 rounded hover:bg-red-700 font-medium text-lg ${activeLink === '/admin/rolcandidato' ? 'text-amber-400' : ''}`}
                            >
                                Rol de Candidato
                            </h4>
                        </Link>
                    </li>
                    
                    <li className="mb-2">
                        <Link href="/admin/procesoelectoral" passHref>
                            <h1
                                onClick={() => handleLinkClick('/admin/procesoelectoral')}
                                className={`block p-2 rounded hover:bg-red-700 font-medium text-lg ${activeLink === '/admin/procesoelectoral' ? 'text-amber-400' : ''}`}
                            >
                                Proceso Electoral
                            </h1>
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href="/admin/subelections" passHref>
                            <h1
                                onClick={() => handleLinkClick('/admin/subelections')}
                                className={`block p-2 rounded hover:bg-red-700 font-medium text-lg ${activeLink === '/admin/subelections' ? 'text-amber-400' : ''}`}
                            >
                                Sub Proceso
                            </h1>
                        </Link>
                    </li>

                    <li className="mb-2">
                        <Link href="/admin/candidatos" passHref>
                            <h4
                                onClick={() => handleLinkClick('/admin/candidatos')}
                                className={`block p-2 rounded hover:bg-red-700 font-medium text-lg ${activeLink === '/admin/candidatos' ? 'text-amber-400' : ''}`}
                            >
                                Candidatos
                            </h4>
                        </Link>
                    </li>
                   
                   
                    <li className="mb-2">
                        <Link href="/admin/reportes" passHref>
                            <h4
                                onClick={() => handleLinkClick('/admin/reportes')}
                                className={`block p-2 rounded hover:bg-red-700 font-medium text-lg ${activeLink === '/admin/reportes' ? 'text-amber-400' : ''}`}
                            >
                                Reportes
                            </h4>
                        </Link>
                    </li>
                </ul>
                <div className="mt-auto">
                        {loading ? (
                                <p className="text-center mb-2">Cargando...</p>
                            ) : error ? (
                                <p className="text-center mb-2">{error}</p>
                            ) : (
                                <p className="text-center mb-2">{name}</p>
                            )}
                    <button className="block mx-auto p-2 rounded bg-red-700 hover:bg-red-800">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="w-full flex-1 p-4 bg-slate-100">
                {children}
            </main>
        </div>
    );
}
