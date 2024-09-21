'use client'
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckToSlot, faLaptopMedical, faChartColumn, faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleClick = (path) => {
    router.push(path); // Redirige a la ruta especificada
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Proceso Electoral 2024 - 2027</h1>
        <p className="mt-2 text-gray-600">
          Disponible en 64 días - 24 horas - 30 minutos - 50 segundos
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-6">
          {/* Votar */}
          <div
            onClick={() => handleClick("/votar")}
            className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faCheckToSlot} className="text-yellow-600 text-4xl mb-4" />
            <h3 className="font-medium text-lg">Votar</h3>
          </div>

          {/* Practicar */}
          <div
            onClick={() => handleClick("/practicar")}
            className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faLaptopMedical} className="text-black text-4xl mb-4" />
            <h3 className="font-medium text-lg">Practicar</h3>
          </div>

          {/* Resultados */}
          <div
            onClick={() => handleClick("/resultados")}
            className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faChartColumn} className="text-red-600 text-4xl mb-4" />
            <h3 className="font-medium text-lg">Resultados</h3>
          </div>

          {/* Encuesta */}
          <div
            onClick={() => handleClick("/encuesta")}
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
