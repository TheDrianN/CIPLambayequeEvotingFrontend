import React, { useState, useEffect } from "react";
import Modal from "react-modal"; // Importamos react-modal
import Card from "./Card";
import Button from "./Button";
import InputField from "./InputField";
import Select from "./Select";
import Swal from "sweetalert2";
import config from "../config";
import Cookies from "js-cookie"; // Importar js-cookie para manejar las cookies

const ModalAgregarRolCandidato= ({ isOpen, onClose,onSuccess, ariaHideApp = true }) =>{

  const [formValues, setFormValues] = useState({
    name_type: "",
    type: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name_type: "",
    type: "",
  });

  const [tokenAccess, setTokenAccess] = useState("");

  const options = [
    { value: "CD", label: "CARGO PARA EL CONSEJO DEPARTAMENTAL" },
    { value: "CA", label: "CARGO PARA ASAMBLEA DEPARTAMENTAL" },
    { value: "CC", label: "CARGO PARA JUNTA DIRECTIVA DE LOS CAPÍTULOS" },
  ];

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
  
    if (token) {
        setTokenAccess(token);
    } 
}, [onClose]);


  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reseteo de errores
    setErrors({
      name_type: "",
      type: "",
    });

    // Validación
    const newErrors = {};
    if (!formValues.name_type) {
      newErrors.name_type = 'Nombre del Rol es obligatorio';
  } else if (!/^[a-zA-Z\s]+$/.test(formValues.name_type)) {
      newErrors.name_type = 'Nombre del Rol solo pueden contener letras';
  }
    if (!formValues.type) newErrors.type = "El tipo de Rol es obligatorio";

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
      const response = await fetch(`${config.apiBaseUrl}/api/type-candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAccess}`, // Enviar el token en la cabecera de autorización
        },
        body: JSON.stringify(userData),
      });

      const responseBody = await response.json(); // Obtener el cuerpo de la respuesta

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Formulario enviado con éxito",
          text: JSON.stringify(responseBody.message),
        });

        // Resetea el formulario después del envío exitoso
        setFormValues({
          name_type: "",
          type: "",
          description: "",
        });
        onSuccess(); // Llamar a onSuccess para manejar el éxito en el componente padre
        onClose(); // Cerrar el modal
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al enviar el formulario",
          text: JSON.stringify(responseBody.message),
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        Swal.fire({
          icon: "error",
          title: "Error de red",
          text: error.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de red",
          text: "Se ha producido un error desconocido.",
        });
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={ariaHideApp}
      className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-3/4 mt-24"
      overlayClassName="fixed z-10 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="m-5">
        <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Agregar rol</h1>
        <hr />
        <Card className="flex-1 max-w-6xl mt-4 px-4">
          <form onSubmit={handleSubmit}>
            <div className="w-full ">
              <label htmlFor="type">Tipo de rol *</label>
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
              <label htmlFor="name_type">Nombre del rol *</label>
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

            <p>
              <b>(*) Son campos obligatorios</b>
            </p>

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

export default ModalAgregarRolCandidato;
