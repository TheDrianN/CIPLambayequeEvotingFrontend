'use client'
import React, { useState, useEffect } from "react";
import InputField from "../../../../../components/InputField";
import Button from "../../../../../components/Button";
import Card from "../../../../../components/Card";
import Select from "../../../../../components/Select";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';


interface PageProps {
  params: {
    id: string;
  };
}



const Page: React.FC<PageProps> = ({ params }) => {
  const [formValues, setFormValues] = useState({
    description: '',
    title: '',
    start_date: '',
    end_date: '',
    status: ''
  });

  const [errors, setErrors] = useState({
    description: '',
    title: '',
    start_date: '',
    end_date: '',
    status: ''
  });

  const router = useRouter();

  const formatDateTimeForInput = (dateTime: string): string => {
    const date = new Date(dateTime);
    // Formatear a `YYYY-MM-DDTHH:MM`
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Función para obtener los datos de la API y llenar el formulario
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/elections/' + params.id);
      const responseData = await response.json();
      const data = responseData.data;
  
      setFormValues({
        description: data.description || '',
        title: data.title || '',
        start_date: formatDateTimeForInput(data.start_date) || '',
        end_date: formatDateTimeForInput(data.end_date) || '',
        status: data.status || '',
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const convertToISO = (dateTimeLocal: string): string => {
    const date = new Date(dateTimeLocal);
    return date.toISOString(); // Esto agrega la 'Z' al final indicando que es UTC
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

    const options = [
        { value: 'P', label: 'Pendiente' },
        { value: 'E', label: 'En Proceso' },
        { value: 'F', label: 'Finalizado' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Limpiar errores
        const newErrors: Record<string, string> = {};

        // Validación
        if (!formValues.title) newErrors.title = 'El título es obligatorio';
        if (!formValues.start_date) newErrors.start_date = 'La fecha de inicio es obligatoria';
        if (!formValues.end_date) newErrors.end_date = 'La fecha de fin es obligatoria';
        if (formValues.start_date && formValues.end_date && new Date(formValues.start_date) > new Date(formValues.end_date)) {
        newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
        if (!formValues.status) newErrors.status = 'El estado es obligatorio';
    
        setErrors(newErrors);

        // Si hay errores, no enviar el formulario
        if (Object.keys(newErrors).length > 0) return;

        const isoStartDate = convertToISO(formValues.start_date);
        const isoEndDate = convertToISO(formValues.end_date);

        // Construir el objeto JSON
        const userData = {
        description: formValues.description,
        start_date: isoStartDate,
        end_date: isoEndDate,
        status: formValues.status,
        title: formValues.title
        };
        console.log(userData);

  
  
          // Enviar datos a la API
          try {
            const response = await fetch('http://localhost:3000/api/elections/'+params.id, { // Reemplaza '/api/endpoint' con la URL de tu API
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
        
            const responseBody = await response.json(); // Obtener el cuerpo de la respuesta
        
            if (response.ok) {
              Swal.fire({
                  icon: 'success',
                  title: 'Formulario enviado con éxito',
                  text: JSON.stringify(responseBody.message),
              });
  
              handleBackPage()
             
          } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al enviar el formulario',
                    text: JSON.stringify(responseBody.message),
                });
            }
        } catch (error) {
            if (error instanceof Error) {
              Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: error.message,
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'Se ha producido un error desconocido.',
              });
            }
          }
          
    };


 

  const handleBackPage = () => {
    router.push('/admin/procesoelectoral');
  };

  return (
    <div className="m-5">
    <div className="flex flex-wrap items-center justify-between ">
      <h1 className=" text-lg font-medium sm:mb-0 sm:text-xl">Datos Generales</h1>
    </div>
    <hr />
    <Card className="flex-1 max-w-6xl mt-4 px-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap justify-between gap-4 mb-4">
          <div className='w-full sm:w-1/3'>
            <label htmlFor='start_date'>Fecha y Hora de Inicio:</label>
            <InputField
              value={formValues.start_date}
              id='start_date'
              onChange={handleChange}
              type='datetime-local'
              error={errors.start_date}
            />
          </div>

          <div className='w-full sm:w-1/3'>
            <label htmlFor='end_date'>Fecha y Hora de Fin:</label>
            <InputField
              value={formValues.end_date}
              id='end_date'
              onChange={handleChange}
              type='datetime-local'
              error={errors.end_date}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 mb-4">
          <div className='w-full sm:w-1/2'>
            <label htmlFor='title'>Título:</label>
            <InputField
              value={formValues.title}
              id='title'
              size='w-full'
              onChange={handleChange}
              type='text'
              error={errors.title}
            />
          </div>

          <div className='w-full sm:w-1/3'>
            <label htmlFor='status'>Estado:</label>
            <Select
              id="status"
              name="status"
              value={formValues.status}
              onChange={handleChange}
              options={options}
              error={errors.status}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description">Descripción:</label>
          <InputField
            value={formValues.description}
            id='description'
            onChange={handleChange}
            asTextarea
            placeholder="Escribe aquí la descripción"
            sizeY="py-3"
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button
            onClick={handleBackPage}
            width="w-1/6 sm:w-1/6"
            background="bg-amber-500"
            hovercolor="hover:bg-amber-600"
            type="button"
          >
            Volver
          </Button>
            
          <Button
            type="submit"
            background="bg-blue-500"
            hovercolor="hover:bg-blue-700"
            width="w-1/6 sm:w-1/6"
          >
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  </div>
  );
};

export default Page;
