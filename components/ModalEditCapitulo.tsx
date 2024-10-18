import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import InputField from "./InputField";
import Button from "./Button";
import Card from "./Card";
import Select from "./Select";
import Swal from 'sweetalert2';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

interface ModalEditProps {
  isOpen: boolean;
  onClose: () => void; // Función para cerrar el modal
  onSuccess: () => void; // Función para actualizar los datos después de editar
  chapterId: string;  // El ID del capítulo que se va a editar
}

const ModalEdit: React.FC<ModalEditProps> = ({ isOpen, onClose, onSuccess, chapterId }) => {
  const [formValues, setFormValues] = useState({
    names: '',
    status: '',
  });

  const [errors, setErrors] = useState({
    names: '',
    status: '',
  });

  const [tokenAccess, setTokenAccess] = useState('');

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
  
    if (token) {
        setTokenAccess(token);
    } 
}, [onClose]);

  // Función para obtener los datos de la API y llenar el formulario
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/chapters/${chapterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
        },
      });
      const responseData = await response.json();
      const data = responseData.data;
      setFormValues({
        names: data.name || '',
        status: data.status || '',
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (tokenAccess && chapterId) {
      fetchData();
    }
  }, [chapterId, tokenAccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const options = [
    { value: 'V', label: 'VIGENTE' },
    { value: 'I', label: 'NO VIGENTE' }
];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reseteo de errores
    setErrors({
      names: '',
      status: '',
    });

    // Validación
    const newErrors: typeof errors = {};
    if (!formValues.names) newErrors.names = 'Nombre del Capitulo es obligatorio';
    if (!formValues.status) newErrors.status = 'Estado es obligatorio';

    setErrors(newErrors);

    // Si hay errores, no enviar el formulario
    if (Object.keys(newErrors).length > 0) return;

    // Construir el objeto JSON
    const userData = {
      status: formValues.status,
      name: formValues.names,
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/chapters/${chapterId}`, {
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
          text: JSON.stringify(responseBody.message),
        });
        onSuccess();  // Llamar a onSuccess para actualizar los datos
        onClose();    // Cerrar el modal
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


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white p-8 rounded-lg shadow-lg w-1/2 mt-24"
      overlayClassName="fixed z-10 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="m-5">
        <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Editar Capítulo</h1>
        <hr />
        <Card className="flex-1 max-w-6xl mt-4 px-4">
          <form onSubmit={handleSubmit}>
            <div className="w-full">
              <label htmlFor="names">Nombre del Capitulo *</label>
              <InputField
                value={formValues.names}
                id="names"
                onChange={handleChange}
                type="text"
                error={errors.names}
              />
            </div>

            <div className="w-full sm:w-1/3">
              <label htmlFor="status">Estado *</label>
              <Select
                id="status"
                name="status"
                value={formValues.status}
                onChange={handleChange}
                options={options}
                error={errors.status}
              />
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={onClose}
                width="w-1/6 sm:w-1/6"
                background="bg-amber-500"
                hovercolor="hover:bg-amber-600"
                type="button"
              >
                Cerrar
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

export default ModalEdit;
