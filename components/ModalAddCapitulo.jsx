import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Card from "./Card";
import Button from "./Button";
import InputField from "./InputField";
import Select from "./Select";
import Swal from 'sweetalert2';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

const ModalCapitulo = ({ isOpen, onClose,onSuccess, ariaHideApp = true }) => {
    const [formValues, setFormValues] = useState({
        names: '',
        status: '',
    });

    const [errors, setErrors] = useState({
        names: '',
        status: '',
    });

    const [tokenAccess, setTokenAccess] = useState('');

    const options = [
        { value: 'V', label: 'VIGENTE' },
        { value: 'I', label: 'NO VIGENTE' }
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
            names: '',
            status: '',
        });

        // Validación
        const newErrors = {};
        if (!formValues.names) newErrors.names = 'Nombre del capitulo es obligatorio';
        if (!formValues.status) newErrors.status = 'Estado es obligatorio';

        setErrors(newErrors);

        // Si hay errores, no enviar el formulario
        if (Object.keys(newErrors).length > 0) return;

        // Construir el objeto JSON
        const userData = {
            status: formValues.status,
            name: formValues.names.toUpperCase(),
        };

        // Enviar datos a la API
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/chapters`, {
                method: 'POST',
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

                // Resetea el formulario después del envío exitoso
                setFormValues({
                    names: '',
                    status: '',
                });
                onSuccess();  // Llamar a la función de éxito para actualizar la tabla
                //onClose();  // Cerrar el modal después de enviar los datos
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al enviar el formulario',
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
    };


    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={ariaHideApp}
            className="bg-white p-8 rounded-lg shadow-lg w-1/2 mt-24"  // Estilos del modal
            overlayClassName="fixed z-10 inset-0 bg-black bg-opacity-50 flex justify-center items-center"  // Fondo oscurecido
        >
            <div className="m-5">
                <div className="flex flex-wrap items-center justify-between">
                    <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos del capitulo</h1>
                </div>
                <hr />
                <Card className="flex-1 max-w-6xl mt-4 px-4">
                    <form onSubmit={handleSubmit}>
                        <div className="w-full ">
                            <label htmlFor="names">Nombre del capitulo *</label>
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

                        <p><b>(*) Son campos obligatorios</b></p>
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

export default ModalCapitulo;
