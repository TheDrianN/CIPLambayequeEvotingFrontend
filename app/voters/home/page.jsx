'use client';
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckToSlot, faChartColumn, faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import jwt_decode from 'jsonwebtoken';
import config from '../../../config';

const fetchData = async (access_token) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/elections/findElectionstatusP`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const responseData = await response.json();
    console.log('Datos recibidos:', responseData);
    return responseData.data.length > 0 ? responseData.data[0] : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

const calculateTimeRemaining = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diff = targetDate - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days} días - ${hours} horas - ${minutes} minutos - ${seconds} segundos`;
};

export default function Page() {
  const [election, setElection] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [timeUntilStart, setTimeUntilStart] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [tokenAccess, setTokenAccess] = useState('');
  const router = useRouter();
  const [error, setError] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(false);
  const [votingFinished, setVotingFinished] = useState(false);

  useEffect(() => {
    const token = Cookies.get('access_token');

    if (token) {
      try {
        const decodedToken = jwt_decode.decode(token);
        setTokenAccess(token);

        if (decodedToken.role === 'V') {
          setAuthorized(true);
        } else if (decodedToken.role === 'A') {
          router.push('/admin/procesoelectoral');
        } else {
          router.push('/404');
        }
      } catch (error) {
        router.push('/404');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const getElectionData = async () => {
      if (authorized && tokenAccess) {
        const data = await fetchData(tokenAccess);
        if (data) {
          setElection(data);

          const now = new Date();
          const startDate = new Date(data.start_date);
          const endDate = new Date(data.end_date);

          if (now < startDate) {
            setVotingEnabled(false);
            setTimeUntilStart(calculateTimeRemaining(data.start_date));
          } else if (now >= startDate && now < endDate) {
            setVotingEnabled(true);
            setTimeRemaining(calculateTimeRemaining(data.end_date));
          } else {
            setVotingEnabled(false);
            setVotingFinished(true);
          }
        } else {
          setError(true);
        }
      }
    };

    getElectionData();
  }, [authorized, tokenAccess]);

  useEffect(() => {
    if (election) {
      const interval = setInterval(() => {
        const now = new Date();
        const startDate = new Date(election.start_date);
        const endDate = new Date(election.end_date);

        if (now < startDate) {
          setVotingEnabled(false);
          setTimeUntilStart(calculateTimeRemaining(election.start_date));
        } else if (now >= startDate && now < endDate) {
          setVotingEnabled(true);
          setTimeRemaining(calculateTimeRemaining(election.end_date));
        } else {
          setVotingEnabled(false);
          setVotingFinished(true);
          clearInterval(interval); // Dejar de actualizar cuando la votación finalice
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [election]);

  const handleClick = (path) => {
    if (votingEnabled) {
      router.push(path);
    }
  };

  if (!authorized) {
    return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
  }

  return (
    <div className="flex mt-10 justify-center h-screen bg-gray-100">
      <div className="text-center">
        {error ? (
          <p>No disponible en este momento</p>
        ) : election ? (
          <>
            <h1 className="text-2xl font-semibold text-center break-words whitespace-normal">{election.title}</h1>
            <p className="mt-2 text-gray-600">
              {votingFinished
                ? "La votación ha finalizado"
                : votingEnabled
                ? `Tiempo restante para votar: ${timeRemaining || 'Finalizado'}`
                : `La votación comenzará en: ${timeUntilStart}`}
            </p>
          </>
        ) : (
          <p>Cargando datos de la elección...</p>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div
            onClick={() => handleClick("votar/" + (election?.id || ''))}
            className={`flex flex-col items-center p-6 bg-white shadow-md rounded-lg ${
              votingEnabled ? 'cursor-pointer hover:bg-gray-200' : 'cursor-not-allowed opacity-50'
            }`}
          >
            <FontAwesomeIcon icon={faCheckToSlot} className="text-yellow-600 text-4xl mb-4" />
            <h3 className="font-medium text-lg">Votar</h3>
          </div>

          <div
            onClick={() => handleClick("resultados")}
            className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faChartColumn} className="text-red-600 text-4xl mb-4" />
            <h3 className="font-medium text-lg">Resultados</h3>
          </div>

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
