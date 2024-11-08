import React, { useState, useEffect } from "react";
import CustomDataTable from "./tabla"; // Asegúrate de que la ruta sea correcta
import ActionButtons from "./ActionButtons"
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

// Función para obtener datos de la API
const fetchData = async (access_token) => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/group-candidates?limit=10&page=1`,{
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

const GrupoCandidatosDataTable = () => {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error

    useEffect(() => {
        const token = Cookies.get('access_token');  // Obtener el token de la cookie


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
      router.push(`/admin/candidatos/edit/${row.id}`);
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
                const token = Cookies.get('access_token');  // Obtener el token de la cookie

                const response = await fetch(`${config.apiBaseUrl}/api/group-candidates/${row.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,  // Enviar el token en la cabecera de autorización

                    },
                });

                const responseBody = await response.json(); // Obtener el cuerpo de la respuesta

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: `El item con ID ${row.id} ha sido eliminado.`,
                    });
                    // Actualiza el estado o la UI para reflejar la eliminación
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

    // Definir las columnas basadas en la nueva estructura de datos
    const columns = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
            width: '80px',
        },
        {
            name: 'Sub Elección',
            selector: row => row.election_name,
            sortable: true,
        },
        {
            name: 'Nombre del Representante',
            selector: row => row.user_name || 'N/A', // Mostrar 'N/A' si no hay nombre de usuario
            sortable: true,
        },
        {
            name: 'Número de Lista',
            selector: row => row.number_list,
            sortable: true,
            width: '170px',
        },
        {
            name: 'Fecha de Creación',
            selector: row => new Date(row.created_at).toLocaleDateString(),
            sortable: true,
            width: '170px',
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <ActionButtons 
                    onEdit={() => handleEdit(row)} 
                    onDelete={() => handleDelete(row)} 
                    showEdit={true}
                    showDelete={false}
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
      <CustomDataTable columns={columns} data={data} />
    );
};

export default GrupoCandidatosDataTable;
