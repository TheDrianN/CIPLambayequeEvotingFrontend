
import React, { useState, useEffect } from "react";
import CustomDataTable from "./tabla"; // Asegúrate de que la ruta sea correcta
import ActionButtons from "./ActionButtons"
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import config from '../config';

// Función para obtener datos de la API
const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/elections?limit=10&page=1`);
      const responseData = await response.json();
      console.log('Datos recibidos:', responseData); // Imprime los datos en la consola
      return responseData.data; // Devuelve solo la lista de datos
    } catch (error) {
      console.error('Error fetching data:', error);
      return []; // Devuelve un array vacío en caso de error
    }
  };



const ProcesoElectoralDataTable = () => {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
  
    useEffect(() => {
        // Función para obtener datos y actualizar el estado
        const getData = async () => {
            try {
                const data = await fetchData();
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
      router.push(`/admin/procesoelectoral/edit/${row.id}`);
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
                window.location.reload()
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
            selector: row => row.id, // Muestra el título del proceso
            sortable: true,
            width:'80px',
        },
        {
          name: 'Título del Proceso',
          selector: row => row.title, // Muestra el título del proceso
          sortable: true,
         
        },
        {
          name: 'Fecha Inicio',
          width:'250px',
          selector: row => new Date(row.start_date).toLocaleString('es-PE', {
            weekday: 'short', // Día de la semana abreviado
            year: 'numeric',
            month: 'short', // Mes abreviado
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          sortable: true,
        },
        {
          name: 'Fecha Fin',
          width:'250px',
          selector: row => new Date(row.end_date).toLocaleString('es-PE', {
            weekday: 'short', // Día de la semana abreviado
            year: 'numeric',
            month: 'short', // Mes abreviado
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          sortable: true,
        },
        {
          name: 'Estado',
          selector: row => row.status, // Muestra el estado del proceso
          sortable: true,
          width:'150px',
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
      <CustomDataTable columns={columns} data={data} />
    );
  };
  
  export default ProcesoElectoralDataTable;