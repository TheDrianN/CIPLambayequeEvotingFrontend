import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import InputField from "./InputField";
import Button from "./Button";
import Card from "./Card";
import Select from "./Select";
import Swal from "sweetalert2";
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

interface ModalEditarProcesoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  procesoId: string; // ID del proceso a editar
}

const ModalEditarProceso: React.FC<ModalEditarProcesoProps> = ({ isOpen, onClose, onSuccess, procesoId }) => {
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

  const [tokenAccess, setTokenAccess] = useState('');

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie

    if (token) {
      setTokenAccess(token);
      
    } else {
      onClose();
    }
  }, [onClose]);


  const formatDateTimeForInput = (dateTime: string): string => {
    const date = new Date(dateTime);
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
      const response = await fetch(`${config.apiBaseUrl}/api/elections/${procesoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
        },
      });
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
    if (tokenAccess) {
      fetchData();
    }
  }, [procesoId, tokenAccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const options = [
    { value: 'P', label: 'VIGENTE' },
    { value: 'E', label: 'EN PROCESO' },
    { value: 'F', label: 'NO VIGENTE' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrors({
      description: '',
      title: '',
      start_date: '',
      end_date: '',
      status: ''
    });
    // Limpiar errores
    const newErrors: typeof errors = {
      description: '',
      title: '',
      start_date: '',
      end_date: '',
      status: ''
    };

    // Validación
    if (!formValues.title) newErrors.title = 'El título es obligatorio';
    if (!formValues.start_date) newErrors.start_date = 'La fecha de inicio es obligatoria';
    if (!formValues.end_date) newErrors.end_date = 'La fecha de fin es obligatoria';
    if (formValues.start_date && formValues.end_date) {
      const startDate = new Date(formValues.start_date);
      const endDate = new Date(formValues.end_date);
  
      if (endDate < startDate) {
          newErrors.end_date = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      } else if (startDate.toDateString() === endDate.toDateString() && startDate > endDate) {
          newErrors.end_date = 'La hora de fin debe ser posterior a la hora de inicio si es el mismo día';
      }
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
      title: formValues.title,
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/elections/${procesoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccess}`,
        },
        body: JSON.stringify(userData),
      });
  
      const responseBody = await response.json();
  
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Formulario enviado con éxito',
          text: responseBody.message,
        });

        onSuccess();  // Llamar a onSuccess para manejar el éxito en el componente padre
        onClose();    // Cerrar el modal
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar el formulario',
          text: responseBody.message,
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



  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-3/4 mt-24"
      overlayClassName="fixed z-10 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="m-5">
        <h1 className=" text-lg font-medium sm:mb-0 sm:text-xl">Datos Generales</h1>
        <hr />
        <Card className="flex-1 w-full mt-4 px-4">
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
                onClick={onClose}
                width="w-full sm:w-1/3 md:w-1/6"
                background="bg-amber-500"
                hovercolor="hover:bg-amber-600"
                type="button"
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                background="bg-blue-500"
                hovercolor="hover:bg-blue-700"
                width="w-full sm:w-1/3 md:w-1/6"
              >
                Guardar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Modal>
  );
};

export default ModalEditarProceso;
