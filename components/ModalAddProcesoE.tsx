import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Card from "./Card";
import Button from "./Button";
import InputField from "./InputField";
import Select from "./Select";
import Swal from "sweetalert2";
import config from "../config";
import Cookies from "js-cookie";  // Importar js-cookie para manejar las cookies


interface ModalAgregarProcesoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalAgregarProceso: React.FC<ModalAgregarProcesoProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tokenAccess, setTokenAccess] = useState('');

  const [formValues, setFormValues] = useState({
    description: '',
    title: '',
    start_date: '',
    end_date: '',
    status: ''
  });

  const [errors, setErrors] = useState({
    title: '',
    start_date: '',
    end_date: '',
    status: ''
  });

  const options = [
    { value: 'P', label: 'VIGENTE' },
    { value: 'E', label: 'EN PROCESO' },
    { value: 'F', label: 'NO VIGENTE' }
  ];

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie

    if (token) {
      setTokenAccess(token);
      
    } else {
      onClose();
    }
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const convertToISO = (dateTimeLocal: string): string => {
    const date = new Date(dateTimeLocal);
    return date.toISOString(); // Esto agrega la 'Z' al final indicando que es UTC
  };

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
      title: formValues.title.toUpperCase(),
      number_voters: '',
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/elections`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
        },
        body: JSON.stringify(userData),
      });
  
      const responseBody = await response.json(); // Obtener el cuerpo de la respuesta
  
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Formulario enviado con éxito',
          text: responseBody.message,
        });

        // Resetea el formulario después del envío exitoso
        setFormValues({
          description: '',
          title: '',
          start_date: '',
          end_date: '',
          status: ''
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
      className="bg-white p-8 rounded-lg shadow-lg w-1/2 mt-24"
      overlayClassName="fixed z-10 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="m-5">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className=" text-lg font-medium sm:mb-0 sm:text-xl">Datos del proceso electoral</h1>
        </div>
        <hr />
        <Card className="flex-1 max-w-6xl mt-4 px-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div className='w-full sm:w-1/3'>
                <label htmlFor='start_date'>Fecha y hora de inicio:</label>
                <InputField
                  value={formValues.start_date}
                  id='start_date'
                  onChange={handleChange}
                  type='datetime-local'
                  error={errors.start_date}
                />
              </div>

              <div className='w-full sm:w-1/3'>
                <label htmlFor='end_date'>Fecha y hora de fin:</label>
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
            <p><b>(*) Son campos obligatorios</b></p>
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={onClose}
                width="w-1/6 sm:w-1/6"
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
                width="w-1/6 sm:w-1/6"
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

export default ModalAgregarProceso;
