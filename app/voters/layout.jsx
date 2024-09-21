"use client";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import '../globals.css';
import Button from '@/components/Button';

export default function votersLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

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
                } md:translate-x-0 w-full md:relative md:flex md:flex-col `}
            >
                <div className=" h-14 text-center mb-4">
                    <img 
                        src='https://www.cip.org.pe/images/LOGO_CIP.png' 
                        alt="Logo" 
                        className="mx-auto w-20 h-20" 
                    />
                </div>
               
                <div className="flex justify-end items-center gap-4 h-7 mt-auto">
                    
                    <p className="text-center  mb-2">Edgard Adriann Delgado Vidarte</p>
                    <Button 
                    width='w-1/8'
                    background='bg-transparent'
                   hovercolor='hover:bg-black'
                    >
                    <FontAwesomeIcon icon={faRightToBracket} />
                 
                    </Button>
                </div>
            </nav>

            {/* Área principal de contenido */}
            <main className="flex-1 p-4 bg-gray-100">
                {children}
            </main>
        </div>
    );
}
