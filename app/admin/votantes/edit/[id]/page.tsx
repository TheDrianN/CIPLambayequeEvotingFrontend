'use client'
import React, { useState, useEffect } from "react";
import InputField from "../../../../../components/InputField";
import Button from "../../../../../components/Button";
import Card from "../../../../../components/Card";
import Select from "../../../../../components/Select";
import SelectChapter from "../../../../../components/SelectChapter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import config from '../../../../../config';

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const [formValues, setFormValues] = useState({
    document: '',
    names: '',
    surnames: '',
    status: '',
    chapter: '',
    address: '',
    rol:'',
    email: '',
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    document: '',
    names: '',
    surnames: '',
    status: '',
    chapter: '',
    rol: '',
    email: '',
    password: ''
  });

  const router = useRouter();

  // Función para obtener los datos de la API y llenar el formulario
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/users/` + params.id);
      const responseData = await response.json();
      const data = responseData.data;
      console.log(responseData)

      // Mapea los datos obtenidos a los campos del formulario
      setFormValues({
        document: data.document || '',
        names: data.names || '',
        surnames: data.surnames || '',
        status: data.status || '',
        chapter: data.chapter_id || '',
        address: data.address || '',
        rol: data.rol || '',
        email: data.email || '',
        phone: data.phone || '',
        password: data.password || ''
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
        { value: 'H', label: 'Habilitado' },
        { value: 'I', label: 'Inhabilitado' }
    ];
    const optionsRol = [
        { value: 'V', label: 'Votante' },
        { value: 'A', label: 'Administrador' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        // Reseteo de errores
        setErrors({
            document: '',
            names: '',
            surnames: '',
            status: '',
            rol:'',
            chapter: '',
            email: '',
            password: ''
        });
  
  
    
        // Validación
        const newErrors: typeof errors = {};
    
        if (!formValues.document) newErrors.document = 'Número de documento es obligatorio';
        if (!formValues.names) newErrors.names = 'Nombres completos son obligatorios';
        if (!formValues.surnames) newErrors.surnames = 'Apellidos completos son obligatorios';
        if (!formValues.status) newErrors.status = 'Estado es obligatorio';
        if (!formValues.chapter) newErrors.chapter = 'Capítulo es obligatorio';
        if (!formValues.email) newErrors.email = 'Correo electrónico es obligatorio';
        if (!formValues.password) newErrors.password = 'Contraseña es obligatoria';
    
        setErrors(newErrors);
    
        // Si hay errores, no enviar el formulario
        if (Object.keys(newErrors).length > 0) return;
    
        // Construir el objeto JSON
        const userData = {
            chapter_id: Number(formValues.chapter),
            document: formValues.document,
            password: formValues.password,
            status: formValues.status,
            rol: formValues.rol,
            names: formValues.names,
            surnames: formValues.surnames,
            phone: formValues.phone,
            email: formValues.email,
            address: formValues.address,
            code_access: '', // Si no hay `code_access`, se envía como cadena vacía
        };
        console.log(userData);
  
  
          // Enviar datos a la API
          try {
            const response = await fetch(`${config.apiBaseUrl}/api/users/`+params.id, { // Reemplaza '/api/endpoint' con la URL de tu API
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


  const generatePassword = (length: number): string => {
    const numbers = '0123456789';
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';
    const allCharacters = numbers + lowerCaseLetters + upperCaseLetters + symbols;

    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allCharacters.length);
        password += allCharacters[randomIndex];
    }

    return password;
  };

  const handleAddNewPass = () => {
    const newPassword = generatePassword(12);
    setFormValues({ ...formValues, password: newPassword });
    console.log('Nueva contraseña generada:', newPassword);
  };

  const handleBackPage = () => {
    router.push('/admin/votantes');
  };

  return (
    <div className="m-5">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos del Votante</h1>
      </div>
      <hr />
      <Card className="flex-1 max-w-6xl mt-4 px-4">
        <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div className="w-full sm:w-1/3">
                    <label htmlFor="document">N° Documento Identidad / Codigo Colegiatura *</label>
                    <InputField
                        value={formValues.document}
                        id="document"
                        onChange={handleChange}
                        type="text"
                        error={errors.document}
                    />
                </div>

                <div className="w-full sm:w-1/3">
                    <label htmlFor="password">Cambiar Contraseña</label>
                    <div className='flex flex-row items-center'>
                        <div className="w-full">
                            <InputField
                                value={formValues.password}
                                id="password"
                                onChange={handleChange}
                                type="text"
                                error={errors.password}
                            />
                        </div>
                        <Button
                            onClick={handleAddNewPass}
                            width="w-1/6 sm:w-1/6"
                            background="bg-neutral-500"
                            hovercolor="hover:bg-neutral-700"
                            type="button"
                        >
                            <FontAwesomeIcon icon={faKey} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div className="w-full sm:w-1/3">
                    <label htmlFor="names">Nombres Completo *</label>
                    <InputField
                        value={formValues.names}
                        id="names"
                        onChange={handleChange}
                        type="text"
                        error={errors.names}
                    />
                </div>

                <div className="w-full sm:w-1/3">
                    <label htmlFor="surnames">Apellidos Completo *</label>
                    <InputField
                        value={formValues.surnames}
                        id="surnames"
                        onChange={handleChange}
                        type="text"
                        error={errors.surnames}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mb-4">
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

                <div className="w-full sm:w-1/3">
                    <label htmlFor="chapter">Capitulo *</label>
                    <SelectChapter
                        value={formValues.chapter}
                        id="chapter"
                        name="chapter"
                        onChange={handleChange}
                        error={errors.chapter}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div className="w-full sm:w-1/3">
                    <label htmlFor="status">Rol *</label>
                    <Select
                        id="rol"
                        name="rol"
                        value={formValues.rol}
                        onChange={handleChange}
                        options={optionsRol}
                    />
                </div>

                <div className="w-full sm:w-1/3">
                    <label htmlFor="phone">Teléfono</label>
                    <InputField
                        value={formValues.phone}
                        id="phone"
                        onChange={handleChange}
                        type="text"
                    />
                </div>
            </div>

            <div className="w-full">
                <label htmlFor="address">Dirección</label>
                <InputField
                    value={formValues.address}
                    id="address"
                    onChange={handleChange}
                    type="text"
                />
            </div>

            <div className="w-full">
                <label htmlFor="email">Correo Electrónico *</label>
                <InputField
                    value={formValues.email}
                    id="email"
                    onChange={handleChange}
                    type="email"
                    error={errors.email}
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
