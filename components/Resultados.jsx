import React, { useState, useEffect } from 'react';
import BarChart from './BarChart'; // El gráfico de barras
import SelectElections from './SelectElections'; // Selección de elecciones
import Select from './Select'; // Selección para subelecciones
import Swal from 'sweetalert2';
import Card from './Card';

// Función para obtener subelecciones basadas en el ID de la elección
const fetchSubElections = async (electionId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/elections/subelections/${electionId}`);
    const responseData = await response.json();
    return responseData.data;
  } catch (error) {
    console.error('Error fetching subelections data:', error);
    return [];
  }
};

// Función simulada para obtener resultados
const fetchResultados = async (electionId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/voting/${electionId}`);
    const responseData = await response.json();
   
    return responseData.data;
  } catch (error) {
    console.error('Error fetching subelections data:', error);
    return [];
  }
};


const ResultadosElection = () => {
  const [selectedElection, setSelectedElection] = useState('');
  const [subElections, setSubElections] = useState([]);
  const [selectedSubElection, setSelectedSubElection] = useState('');
  const [resultsData, setResultsData] = useState(null);

  // Cargar subelecciones cuando se selecciona una elección
  useEffect(() => {
    if (selectedElection) {
      fetchSubElections(selectedElection).then((data) => {
        const formattedOptions = data.map((subElection) => ({
          label: subElection.title,
          value: subElection.id,
        }));
        setSubElections(formattedOptions);
      });
    }
  }, [selectedElection]);

  const handleElectionChange = (e) => {
    setSelectedElection(e.target.value);
    setSelectedSubElection('');
    setResultsData(null);
  };

  const handleSubElectionChange = (e) => {
    setSelectedSubElection(e.target.value);
  };

  const handleVerResultados = async () => {
    try {
      // Llamamos a la función asincrónica y esperamos su resolución
      const fakeResults = await fetchResultados(selectedSubElection);
  
      // Actualizamos el estado con los resultados obtenidos
      setResultsData(fakeResults);
  
      
    } catch (error) {
      console.error("Error al obtener los resultados:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold text-center mb-6">Resultados de Elecciones</h1>

      {/* Selección de Elecciones y Subelecciones */}
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <div className='w-full md:w-1/2'>
          <SelectElections
            id="election"
            name="election"
            value={selectedElection}
            onChange={handleElectionChange}
          />
        </div>
        <div className='w-full md:w-1/2'>
          <Select
            id="lista"
            name="lista"
            value={selectedSubElection}
            onChange={handleSubElectionChange}
            options={subElections}
          />
        </div>
      </div>

      {/* Botón de Ver Resultados */}
      <div className='flex justify-end'>
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          onClick={handleVerResultados}
        >
          Ver Resultados
        </button>
      </div>

      {/* Mostrar resultados solo si hay datos */}
      {resultsData && (
        <Card className='mt-5'>
          <h2 className="text-lg font-semibold text-start">Resumen de la elección</h2>

          {/* Resumen de la Elección - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-2">
            <div className="p-4 bg-blue-100 rounded-lg shadow-md">
              <h2 className="font-semibold text-lg text-blue-800">Total de votantes hábiles</h2>
              <p className="text-2xl font-bold text-blue-600">{resultsData.electoresHabiles || '000000'}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg shadow-md">
              <h2 className="font-semibold text-lg text-green-800">Total de participación de votantes</h2>
              <p className="text-2xl font-bold text-green-600">{resultsData.participacionMiembros || '000000'}</p>
            </div>
            <div className="p-4 bg-red-100 rounded-lg shadow-md">
              <h2 className="font-semibold text-lg text-red-800">Porcentaje de participación</h2>
              <p className="text-2xl font-bold text-red-600">{resultsData.porcentajeParticipacion || '0%'}</p>
            </div>
          </div>

          {/* Gráfico de barras */}
          <h2 className="text-lg font-semibold text-start">Resultados</h2>
          <div className="mb-8 mt-3">
            <BarChart
              labels={resultsData.candidatos.map(c => c.nombre)}
              data={resultsData.candidatos.map(c => c.porcentaje)}
              className="w-full h-96" // Ajuste de altura para hacer el gráfico más flexible
            />
          </div>

          {/* Resultados detallados en una tabla */}
          <hr className="h-1 bg-black my-4" />
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-start">Resultados detallados de la elección</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border mt-2 border-gray-300 shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border border-gray-300 text-center font-bold">N° Lista</th>
                    <th className="px-4 py-2 border border-gray-300 text-center font-bold">Nombre de Candidato</th>
                    <th className="px-4 py-2 border border-gray-300 text-center font-bold">Votos</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsData.candidatos.map((candidato, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border border-gray-300 text-center">{candidato.numeroLista}</td>
                      <td className="px-4 py-2 border border-gray-300 text-center">{candidato.nombre}</td>
                      <td className="px-4 py-2 border border-gray-300 text-center">{candidato.votos}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan="2" className="px-4 py-2 border border-gray-300 text-center font-semibold">TOTAL DE VOTOS BLANCOS</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{resultsData.votosBlancos}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan="2" className="px-4 py-2 border border-gray-300 text-center font-semibold">TOTAL DE VOTOS EMITIDOS</td>
                    <td className="px-4 py-2 border border-gray-300 text-center">{resultsData.votosEmitidos}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultadosElection;
