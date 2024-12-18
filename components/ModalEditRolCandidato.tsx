import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import InputField from "./InputField";
import Button from "./Button";
import Card from "./Card";
import Select from "./Select";
import Swal from "sweetalert2";
import config from "../config";
import Cookies from "js-cookie";  // Importar js-cookie para manejar las cookies

interface ModalEditarRolCandidatoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roleId: string;
}

const ModalEditarRolCandidato: React.FC<ModalEditarRolCandidatoProps> = ({ isOpen, onClose, onSuccess, roleId }) => {
  const [formValues, setFormValues] = useState({
    name_type: '',
    type: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    name_type: '',
    type: '',
  });

  const [tokenAccess, setTokenAccess] = useState('');

  const options = [
    { value: "CD", label: "CARGO PARA EL CONSEJO DEPARTAMENTAL" },
    { value: "CA", label: "CARGO PARA ASAMBLEA DEPARTAMENTAL" },
    { value: "CC", label: "CARGO PARA JUNTA DIRECTIVA DE LOS CAPÍTULOS" },
  ];

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie

    if (token) {
      setTokenAccess(token);
      
    } else {
      onClose();
    }
  }, [onClose]);


  // Función para obtener los datos de la API y llenar el formulario
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/type-candidates/${roleId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenAccess}`,
        },
      });
      const responseData = await response.json();
      const data = responseData.data;

      // Mapea los datos obtenidos a los campos del formulario
      setFormValues({
        name_type: data.name_type || '',
        type: data.type || '',
        description: data.description || '',
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (tokenAccess) {
      fetchData();
    }
  }, [roleId, tokenAccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reseteo de errores
    setErrors({
      name_type: '',
      type: '',
    });

    // Validación
    const newErrors: typeof errors = {
      name_type: '',
      type: '',
    };

    if (!formValues.name_type) {
      newErrors.name_type = 'Nombre del Rol es obligatorio';
  } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s.]+$/.test(formValues.name_type)) {
      newErrors.name_type = 'Nombre del Rol solo pueden contener letras';
  }
    if (!formValues.type) newErrors.type = 'El tipo de Rol es obligatorio';

    setErrors(newErrors);

    // Si hay errores, no enviar el formulario
    if (Object.values(newErrors).some(error => error !== '')) {
      console.log("Errores detectados", newErrors);
      return;
    }
    // Construir el objeto JSON
    const userData = {
      type: formValues.type,
      name_type: formValues.name_type.toUpperCase(),
      description: formValues.description,
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/type-candidates/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenAccess}`,
        },
        body: JSON.stringify(userData),
      });

      const responseBody = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Formulario enviado con éxito",
          text: responseBody.message,
        });

        onSuccess();  // Llamar a onSuccess para actualizar los datos en el componente padre
        onClose();    // Cerrar el modal
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al enviar el formulario",
          text: responseBody.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de red",
        text: "error.message",
      });
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
        <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Editar Rol</h1>
        <hr />
        <Card className="flex-1 max-w-6xl mt-4 px-4">
          <form onSubmit={handleSubmit}>
            <div className="w-full sm:w-1/3">
              <label htmlFor="type">Tipo de Rol *</label>
              <Select
                id="type"
                name="type"
                value={formValues.type}
                onChange={handleChange}
                options={options}
                error={errors.type}
              />
            </div>

            <div className="w-full">
              <label htmlFor="name_type">Nombre del Rol *</label>
              <InputField
                value={formValues.name_type}
                id="name_type"
                onChange={handleChange}
                type="text"
                error={errors.name_type}
              />
            </div>

            <div>
              <label htmlFor="description">Descripción:</label>
              <InputField
                value={formValues.description}
                id="description"
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

export default ModalEditarRolCandidato;
