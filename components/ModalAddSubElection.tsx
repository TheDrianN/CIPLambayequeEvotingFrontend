import React, { useState, useEffect } from 'react';
import Modal from "react-modal";
import Card from "./Card";
import Button from "./Button";
import InputField from "./InputField";
import SelectElections from "./SelectElections";
import SelectChapter from "./SelectChapter";
import Swal from 'sweetalert2';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

interface ModalAgregarSubEleccionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalAgregarSubEleccion: React.FC<ModalAgregarSubEleccionProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tokenAccess, setTokenAccess] = useState('');

  const [formValues, setFormValues] = useState({
    election: '',
    chapter: '',
    title: '',
    description: ''
  });

  const [errors, setErrors] = useState({
    election: '',
    title: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores
    setErrors({
      election: '',
      title: '',
    });

    const newErrors: typeof errors = {
      election: '',
      title: '',
    };

    // Validación
    if (!formValues.title) newErrors.title = 'El título es obligatorio';
    if (!formValues.election) newErrors.election = 'Debe seleccionar un Proceso Electoral';

    setErrors(newErrors);

    // Si hay errores, no enviar el formulario
    if (Object.values(newErrors).some(error => error !== '')) {
      console.log("Errores detectados", newErrors);
      return;
    }

    // Construir el objeto JSON
    const userData = {
      description: formValues.description,
      chapter_id: formValues.chapter,
      election_id: formValues.election,
      title: formValues.title.toUpperCase()
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/sub-elections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
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

        // Resetea el formulario después del envío exitoso
        setFormValues({
          description: '',
          title: '',
          chapter: '',
          election: '',
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
        <div className="flex flex-wrap items-center justify-between ">
          <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos Generales</h1>
        </div>
        <hr />
        <Card className="flex-1 w-full mt-4 px-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div className='w-full sm:w-1/3'>
                <label htmlFor='start_date'>Elección *</label>
                <SelectElections
                  value={formValues.election}
                  id='election'
                  name='election'
                  onChange={handleChange}
                  error={errors.election}
                />
              </div>

              <div className='w-full sm:w-1/3'>
                <label htmlFor='end_date'>Capítulo</label>
                <SelectChapter
                  value={formValues.chapter}
                  id='chapter'
                  name='chapter'
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div className='w-full sm:w-1/2'>
                <label htmlFor='title'>Título *</label>
                <InputField
                  value={formValues.title}
                  id='title'
                  size='w-full'
                  onChange={handleChange}
                  type='text'
                  error={errors.title}
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

export default ModalAgregarSubEleccion;
