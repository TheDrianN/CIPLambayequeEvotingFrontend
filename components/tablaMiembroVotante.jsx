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
      const response = await fetch(`${config.apiBaseUrl}/api/users?limit=20&page=1`,{
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


const MiembrosVotantesDataTable = () =>{
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [ tokenAccess, setTokenAccess] = useState(null);

    useEffect(() => {
      const token = Cookies.get('access_token');  // Obtener el token de la cookie
      setTokenAccess(token)
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
      router.push(`/admin/votantes/edit/${row.id}`);
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

    if (result.isConfirmed) {
        try {
            const token = Cookies.get('access_token'); // Obtener el token de la cookie

            // Realizar ambas solicitudes de validación
            const candidateValidation = await fetch(`${config.apiBaseUrl}/api/candidates/validationUser/${row.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const voteStatusValidation = await fetch(`${config.apiBaseUrl}/api/vote-status/validationUser/${row.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Procesar ambas respuestas
            const candidateValidationBody = await candidateValidation.json();
            const voteStatusValidationBody = await voteStatusValidation.json();

            // Verificar si alguna de las validaciones devuelve un estado CONFLICT (409)
            if (candidateValidationBody.status === 409 || voteStatusValidationBody.status === 409) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Conflicto',
                    text: candidateValidationBody.message || voteStatusValidationBody.message || 'No se puede eliminar el capítulo debido a relaciones existentes.',
                });
                return; // Detener la ejecución si hay un conflicto
            }

            // Si ambas validaciones son exitosas, proceder a la eliminación
            const response = await fetch(`${config.apiBaseUrl}/api/users/${row.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const responseBody = await response.json(); // Obtener el cuerpo de la respuesta de eliminación

            if (response.ok) {
              Swal.fire({
                  icon: 'success',
                  title: 'Eliminado',
                  text: `El item con ID ${row.id} ha sido eliminado.`,
              }).then((result) => {
                  if (result.isConfirmed) {
                      // Solo se ejecuta si el usuario presiona "OK"
                      window.location.reload();
                  }
              });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar',
                    text: responseBody.message || 'No se pudo eliminar el item.',
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



  
    const columns = [
        {
            name: 'ID',
            selector: row => row.id, // Muestra el título del proceso
            sortable: true,
            width: '80px',
        },
        {
            name: 'N° Documento',
            selector: row => row.document, // Muestra el título del proceso
            sortable: true,
            width: '160px',
        },
        {
          name: 'Nombre completo',
          selector: row => row.names +" "+ row.surnames, // Muestra el título del proceso
          sortable: true,
        },
        {
          name: 'Estado',
          selector: row => row.status, // Muestra el estado del proceso
          sortable: true,
          width: '120px',

        },
        {
            name: 'Capitulo',
            selector: row => row.Chapter.name,
            sortable: true,
        },
       ,
        
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
        return <div>Cargando datos...</div>; // Mensaje mientras se cargan los datos
    }

    if (error) {
        return <div>Error al cargar los datos: {error.message}</div>; // Mensaje de error
    }

    return (
      <CustomDataTable columns={columns} data={data} />
    );
}

export default MiembrosVotantesDataTable;