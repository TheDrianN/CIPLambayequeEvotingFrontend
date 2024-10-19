import React, { useState, useEffect } from "react";
import CustomDataTable from "./tabla"; // Asegúrate de que la ruta sea correcta
import ActionButtons from "./ActionButtons";
import { useRouter } from 'next/navigation';
import SelectElections from './SelectElections';
import Swal from 'sweetalert2';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import ModalEdit from './ModalEditSubElection';  // Importa el componente del modal que creaste

// Función para obtener subelecciones basadas en el ID de la elección
const fetchSubElections = async (electionId,access_token) => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/elections/subelections/${electionId}`,{
            method: 'GET',  // Método GET para obtener datos
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,  // Enviar el token en la cabecera de autorización
            },
        });
        const responseData = await response.json();
        console.log('Datos recibidos2:', responseData); // Imprime los datos en la consola
        return responseData.data; // Devuelve solo la lista de datos
    } catch (error) {
        console.error('Error fetching subelections data:', error);
        return []; // Devuelve un array vacío en caso de error
    }
};

// Función para obtener datos iniciales (e.g., todas las elecciones)
const fetchData = async (access_token) => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/sub-elections?limit=10&page=1`,{
            method: 'GET',  // Método GET para obtener datos
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,  // Enviar el token en la cabecera de autorización
            },
        });
        const responseData = await response.json();
        console.log('Datos recibidosA:', responseData.data); // Imprime los datos en la consola
        return responseData.data; // Devuelve solo la lista de datos
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Devuelve un array vacío en caso de error
    }
};

const SubElectionsDataTable = () => {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [selectedElection, setSelectedElection] = useState(''); // Estado para el ID de la elección seleccionada
    const [ tokenAccess, setTokenAccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para el modal
    const [chapterToEdit, setChapterToEdit] = useState(null); // Estado para el capítulo que se va a editar

    useEffect(() => {
        const token = Cookies.get('access_token');  // Obtener el token de la cookie
        setTokenAccess(token);

      }, []);  // Asegúrate de incluir router en las dependencias

    // Función para manejar el cambio en el select de elecciones
    const handleElectionChange = async (electionId) => {
        const election_Id = event.target.value; // Extraer el valor del evento
        setSelectedElection(election_Id);
        console.log('select', election_Id)
        setLoading(true); // Iniciar carga cuando se selecciona una nueva elección
        const token = Cookies.get('access_token');  // Obtener el token de la cookie
        try {
            const data = await fetchSubElections(election_Id,token);
            setData(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Función para obtener datos y actualizar el estado
        const token = Cookies.get('access_token');  // Obtener el token de la cookie

        const getInitialData = async () => {
            try {
                const data = await fetchData(token);
                setData(data); // Asignar las elecciones a un estado para el select
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        getInitialData();
    }, []);

    const handleEdit = (row) => {
        setChapterToEdit(row.id);  // Guardar el ID del capítulo que se va a editar
        setIsModalOpen(true);  // Abrir el modal
    };
  
    const handleCloseModal = () => {
        setIsModalOpen(false);  // Cerrar el modal
        setChapterToEdit(null); // Limpiar el capítulo seleccionado
    };
  
    const handleSuccessEdit = async () => {
        setIsModalOpen(false);  // Cerrar el modal después de la edición
        try {
            // Volver a cargar los datos desde la API
            const updatedData = await fetchData(tokenAccess);
            setData(updatedData);  // Actualizar el estado de los datos
        } catch (error) {
            console.error('Error al recargar los datos:', error);
        }
    };

    const handleDelete = async (row) => {
        // Mostrar alerta de confirmación
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar el item con ID ${row.id}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        // Si el usuario confirma
        if (result.isConfirmed) {
            try {
                // Enviar solicitud a la API para eliminar
                const response = await fetch(`${config.apiBaseUrl}/api/elections/${row.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
                    },
                });

                const responseBody = await response.json(); // Obtener el cuerpo de la respuesta

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: `El item con ID ${row.id} ha sido eliminado.`,
                    });
                    // Aquí puedes actualizar el estado o la UI para reflejar la eliminación
                    window.location.reload();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al eliminar',
                        text: JSON.stringify(responseBody.message),
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de red',
                    text: error.message,
                });
            }
        }
    };

    const handleView = (row) => {
        router.push(`/admin/procesoelectoral/${row.id}`);
    };

    const columns = [
        {
            name: 'ID',
            selector: row => row.id, // Muestra el ID del subelection
            sortable: true,
            width:'80px',
        },
        {
            name: 'Elección',
            selector: row => row.election.title, // Muestra el título del proceso
            sortable: true,
        },
        {
            name: 'Capitulo',
            selector: row => row.chapter_name || 'N/A', // Muestra el título del proceso
            sortable: true,
        },
        {
            name: 'Titulo',
            selector: row => row.title, // Muestra el título del proceso
            sortable: true,
        },
        
        {
            name: 'Acciones',
            cell: (row) => (
                <ActionButtons 
                    onEdit={() => handleEdit(row)} 
                    onDelete={() => handleDelete(row)} 
                    onView={() => handleView(row)} 
                    showEdit={true}
                    showDelete={true}
                    showView={false}
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    if (loading) {
        return <div>Cargando datos...</div>; // Mensaje mientras se cargan los datos
    }

    if (error) {
        return <div>Error al cargar los datos: {error.message}</div>; // Mensaje de error
    }

    return (
        <div>
           <div className="w-96">
                <SelectElections 
                    value={selectedElection}
                    onChange={handleElectionChange} // Pasar la función de cambio
                    id="election"
                    name="election"
                
                />
           </div>
            <CustomDataTable columns={columns} data={data} />
            {isModalOpen && (
          <ModalEdit
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSuccess={handleSuccessEdit} // Llamar a handleSuccessEdit en lugar de setData([])
              subElectionId={chapterToEdit}  // Pasar el ID del capítulo a editar
          />
      )}
        </div>
    );
};

export default SubElectionsDataTable;
