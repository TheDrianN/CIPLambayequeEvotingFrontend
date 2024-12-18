import React, { useState, useEffect } from "react";
import CustomDataTable from "./tabla"; // Asegúrate de que la ruta sea correcta
import ActionButtons from "./ActionButtons";
import Swal from 'sweetalert2';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import ModalEdit from './ModalEditCapitulo';  // Importa el componente del modal que creaste

// Función para obtener datos de la API
const fetchData = async (access_token) => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/chapters?limit=10&page=1`, {
            method: 'GET',  // Método GET para obtener datos
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,  // Enviar el token en la cabecera de autorización
            },
        });
        const responseData = await response.json();
        return responseData.data; // Devuelve solo la lista de datos
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Devuelve un array vacío en caso de error
    }
};



const ChaptersDataTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [tokenAccess, setTokenAccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para el modal
    const [chapterToEdit, setChapterToEdit] = useState(null); // Estado para el capítulo que se va a editar

    useEffect(() => {
        const token = Cookies.get('access_token');  // Obtener el token de la cookie
        setTokenAccess(token);
        // Función para obtener datos y actualizar el estado
        const getData = async () => {
            try {
                const data = await fetchData(token);
                setData(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
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
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar el item con ID ${row.id}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });
    
        if (result.isConfirmed) {
            try {
                const token = Cookies.get('access_token');  // Obtener el token de la cookie
                const response = await fetch(`${config.apiBaseUrl}/api/chapters/${row.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                const responseBody = await response.json(); // Obtener el cuerpo de la respuesta
    
                if (response.ok) {
                    if (responseBody.status === 409) { // Si el status es CONFLICT (HttpStatus.CONFLICT)
                        Swal.fire({
                            icon: 'warning',
                            title: 'Conflicto',
                            text: responseBody.message || 'No se puede eliminar el capítulo debido a relaciones existentes.',
                        });
                    } else if (responseBody.status === 200) { // Si el status es OK (HttpStatus.OK)
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: `El item con ID ${row.id} ha sido eliminado correctamente.`,
                        });
                        setData(data.filter((item) => item.id !== row.id)); // Actualizar los datos localmente
                    } else {
                        // Manejar cualquier otro tipo de respuesta inesperada
                        Swal.fire({
                            icon: 'error',
                            title: 'Error inesperado',
                            text: responseBody.message || 'Algo salió mal, por favor intente nuevamente.',
                        });
                    }
                } else {
                    // Si el servidor devuelve un error HTTP (como 4xx o 5xx)
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al eliminar',
                        text: responseBody.message || 'No se pudo eliminar el capítulo.',
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de red',
                    text: error.message || 'No se pudo conectar al servidor.',
                });
            }
        }
    };
    

    const columns = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
        },
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => row.status,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <ActionButtons
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDelete(row)}
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
        return <div>Cargando datos...</div>;
    }

    if (error) {
        return <div>Error al cargar los datos: {error.message}</div>;
    }

    return (
        <div className="h-full">
            <CustomDataTable columns={columns} data={data} />

            {/* Modal para editar */}
            {isModalOpen && (
                <ModalEdit
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccessEdit} // Llamar a handleSuccessEdit en lugar de setData([])
                    chapterId={chapterToEdit}  // Pasar el ID del capítulo a editar
                />
            )}
        </div>
    );
};

export default ChaptersDataTable;
