'use client';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Bowser from 'bowser'; // Importar Bowser para detectar el navegador
import config from '../../../../config';

// Tipado para SubElection
interface SubElection {
  id: number;
  title: string;
}

// Tipado para los Candidatos
interface Candidate {
  id: number;
  number_list: string;
}

// Función para obtener subelecciones
const fetchDataSubElections = async (id: string): Promise<SubElection[]> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/elections/findSubelectionChapter?election_id=${id}&chapter_id=1`);
    const responseData = await response.json();
    
    return responseData.data && responseData.data.length > 0 ? responseData.data[0].subElections || [] : [];
  } catch (error) {
    console.error('Error fetching subelections:', error);
    return [];
  }
};

// Función para obtener candidatos por subelección
const fetchCandidatesForSubElection = async (subElectionId: number): Promise<Candidate[]> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/group-candidates/findAllCandidatesSubElection/${subElectionId}`);
    const responseData = await response.json();
    
    return responseData.data && responseData.data.length > 0 ? responseData.data : [];
  } catch (error) {
    console.error(`Error fetching candidates for subElection ${subElectionId}:`, error);
    return [];
  }
};

const Page: React.FC<{ params: { id: string } }> = ({ params }) => {
  const [subElections, setSubElections] = useState<SubElection[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number | null }>({});
  const [currentSubElectionIndex, setCurrentSubElectionIndex] = useState(0); // Controlar el índice de la subelección actual
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false); // Mostrar la página de confirmación
  const [candidatesBySubElection, setCandidatesBySubElection] = useState<{ [key: number]: Candidate[] }>({});
  const [latitud, setlatitud] = useState<number | null>(null);
  const [longitud, setlongitud] = useState<number | null>(null);

  // Obtener las subelecciones
  useEffect(() => {
    const fetchSubElections = async () => {
      const result = await fetchDataSubElections(params.id);
      setSubElections(result);

      result.forEach(async (subElection: SubElection) => {
        const candidates = await fetchCandidatesForSubElection(subElection.id);

        // Agregar la opción de Voto en Blanco con id 0
        candidates.push({
          id: 0,
          number_list: '0',
        });

        setCandidatesBySubElection((prev) => ({
          ...prev,
          [subElection.id]: candidates,
        }));
      });
    };

    fetchSubElections();
  }, [params.id]);

  // Manejo de geolocalización
  useEffect(() => {
    if (navigator.geolocation) {
      const options = {
        timeout: 10000,
        maximumAge: 0,
        enableHighAccuracy: true,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setlongitud(longitude);
          setlatitud(latitude);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              Swal.fire('Error', 'Permiso de geolocalización denegado', 'error');
              break;
            case error.POSITION_UNAVAILABLE:
              Swal.fire('Error', 'Ubicación no disponible', 'error');
              break;
            case error.TIMEOUT:
              Swal.fire('Error', 'El tiempo para obtener la ubicación expiró', 'error');
              break;
            default:
              Swal.fire('Error', 'Error desconocido obteniendo la ubicación', 'error');
              break;
          }
          setlongitud(null);
          setlatitud(null);
        },
        options
      );
    } else {
      setlongitud(null);
      setlatitud(null);
    }
  }, []);

  const handleOptionClick = (subElectionId: number, groupCandidateId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [subElectionId]: groupCandidateId,
    }));
  };

  const handleVote = () => {
    const currentSubElection = subElections[currentSubElectionIndex];
    const selectedOption = selectedOptions[currentSubElection.id];

    if (selectedOption === null || selectedOption === undefined) {
      Swal.fire('Error', 'Por favor selecciona una opción antes de continuar.', 'error');
      return;
    }

    if (currentSubElectionIndex < subElections.length - 1) {
      setCurrentSubElectionIndex(currentSubElectionIndex + 1);
    } else {
      setIsConfirmationVisible(true);
    }
  };

  const handleBack = () => {
    if (currentSubElectionIndex > 0) {
      setCurrentSubElectionIndex(currentSubElectionIndex - 1);
    }
  };

  const handleConfirmVote = async () => {
    try {
      // Mostrar Swal de carga
      Swal.fire({
        title: 'Registrando tu voto...',
        html: 'Por favor espera mientras procesamos tu voto.',
        allowOutsideClick: false, // No permitir que el usuario cierre el modal haciendo clic afuera
        didOpen: () => {
          Swal.showLoading(); // Muestra el ícono de carga
        },
      });
  
      // Detectar el navegador usando Bowser
      const browserInfo = Bowser.getParser(window.navigator.userAgent);
      const browserName = browserInfo.getBrowserName(); // Obtener nombre del navegador
  
      const currentDate = new Date();
      const isoDate = currentDate.toISOString();
  
      // Preparar los detalles de la elección
      const electionDetails = {
        elections_id: parseInt(params.id),
        users_id: 1,
        status: 'V',
        browser: browserName, // Nombre del navegador
        latitud: latitud || 'No disponible',
        longitud: longitud || 'No disponible',
        datevote: isoDate,
      };
  
      console.log(electionDetails);
  
      // Enviar la primera solicitud POST a /api/vote-status
      const responseStatus = await fetch(`${config.apiBaseUrl}/api/vote-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(electionDetails),
      });
  
      // Comprobar si la solicitud fue exitosa
      console.log(responseStatus.statusText);
      if (!responseStatus.ok) {
        throw new Error('Error al registrar el estado del voto');
      }
  
      const statusData = await responseStatus.json(); // Obtener los datos de la respuesta, incluyendo el `vote_status_id`
      const vote_status_id = statusData.id; // Asumiendo que el ID del estado del voto es `id`
      console.log(vote_status_id);
  
      // Preparar los votos
      const votes = {
        subelection: subElections.map(subElection => ({
          sub_election_id: subElection.id,
          group_candidates_id: selectedOptions[subElection.id],
          vote_status_id: vote_status_id, // Incluir el vote_status_id obtenido de la primera API
        })),
      };
  
      console.log(votes);
  
      // Enviar los votos por cada subelección
      const votePromises = votes.subelection.map(async (vote) => {
        const responseVote = await fetch(`${config.apiBaseUrl}/api/voting`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vote),
        });
  
        if (!responseVote.ok) {
          throw new Error(`Error al registrar el voto para la subelección ${vote.sub_election_id}`);
        }
  
        return responseVote.json();
      });
  
      // Esperar a que todas las promesas de votación se completen
      await Promise.all(votePromises);
  
      // Cerrar el Swal de carga
      Swal.close();
  
      // Mostrar mensaje de éxito si todo salió bien
      Swal.fire('Confirmado', 'Tu voto ha sido registrado con éxito.', 'success');
    } catch (error) {
      console.error('Error en el proceso de votación:', error);
  
      // Cerrar el Swal de carga si ocurre un error
      Swal.close();
  
      // Mostrar mensaje de error
      Swal.fire('Error', 'Ocurrió un error al registrar tu voto.', 'error');
    }
  };
  

  if (isConfirmationVisible) {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-6">Confirmación de Voto</h1>
        <ul className="mb-6 text-lg">
          {subElections.map((subElection) => (
            <li key={subElection.id} className="mb-4">
              <strong>{subElection.title}</strong>:{' '}
              {selectedOptions[subElection.id] === 0
                ? 'Voto en Blanco'
                : `Lista número ${
                    candidatesBySubElection[subElection.id]?.find(
                      (candidate) => candidate.id === selectedOptions[subElection.id]
                    )?.number_list || 'No seleccionada'
                  }`}
            </li>
          ))}
        </ul>
        <div className="flex justify-between">
          <button onClick={() => setIsConfirmationVisible(false)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-lg">
            Volver
          </button>
          <button onClick={handleConfirmVote} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-lg">
            Confirmar
          </button>
        </div>
      </div>
    );
  }

  const currentSubElection = subElections[currentSubElectionIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold text-center mb-6">Cédula de Votación</h1>

      {currentSubElection ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-center mb-1">{currentSubElection.title}</h2>

          <p className="text-center text-lg text-gray-600 mb-4">
            Selecciona una opción para votar en esta elección (X)
          </p>
          <hr />

          <div className="border rounded-lg mt-2 p-4 bg-white">
            {candidatesBySubElection[currentSubElection.id]?.length > 0 ? (
              candidatesBySubElection[currentSubElection.id].map((groupCandidate) => (
                <div
                  key={groupCandidate.id}
                  className={`flex items-center justify-between border-b last:border-none p-6 cursor-pointer transition-all duration-300 text-lg ${
                    selectedOptions[currentSubElection.id] === groupCandidate.id ? 'bg-red-100 border-red-500' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleOptionClick(currentSubElection.id, groupCandidate.id)}
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex items-center justify-center rounded-lg mr-4 transition-all duration-300 bg-gray-300">
                      <FontAwesomeIcon icon={faUser} className="text-2xl" />
                    </div>
                    <span className="font-medium">
                      {groupCandidate.number_list === '0' ? 'Voto en Blanco' : `Lista número ${groupCandidate.number_list}`}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-center w-16 h-16 text-2xl font-bold border-2 rounded-lg transition-all duration-300 ${
                      selectedOptions[currentSubElection.id] === groupCandidate.id ? 'text-red-600 border-red-600' : 'border-gray-500'
                    }`}
                  >
                    {selectedOptions[currentSubElection.id] === groupCandidate.id ? 'X' : groupCandidate.number_list}
                  </div>
                </div>
              ))
            ) : (
              <p>No hay candidatos disponibles para esta subelección.</p>
            )}
          </div>

          <div className="flex justify-between mt-4">
            {currentSubElectionIndex > 0 && (
              <button onClick={handleBack} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                Volver
              </button>
            )}
            <button onClick={handleVote} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Votar
            </button>
          </div>
        </div>
      ) : (
        <p>Cargando subelección...</p>
      )}
    </div>
  );
};

export default Page;
