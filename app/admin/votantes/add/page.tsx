"use client";
import React, { useState } from 'react';
import Card from "../../../../components/Card"
import Button from "../../../../components/Button"
import InputField from "../../../../components/InputField"
import SelectChapter from "../../../../components/SelectChapter" 
import Select from "../../../../components/Select" 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import config from '../../../../config';

export default function VotantesPage(){
    const [formValues, setFormValues] = useState({
        document: '',
        names: '',
        surnames: '',
        status: '',
        chapter: '',
        date_of_birth: '',
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
        rol:'',
        chapter: '',
        email: '',
        password: '',
        date_of_birth:''
    });

    const router = useRouter();

    
    const options = [
        { value: 'V', label: 'VIGENTE' },
        { value: 'I', label: 'NO VIGENTE' }
    ];
    const optionsRol = [
        { value: 'V', label: 'VOTANTE' },
        { value: 'A', label: 'ADMINISTRADOR' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormValues({ ...formValues, [id]: value });
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
          password: '',
          date_of_birth:''
      });


  
      // Validación
      const newErrors: typeof errors = {};
  
      if (!formValues.document) newErrors.document = 'Número de documento es obligatorio';
      if (!formValues.names) newErrors.names = 'Nombres completos son obligatorios';
      if (!formValues.surnames) newErrors.surnames = 'Apellidos completos son obligatorios';
      if (!formValues.status) newErrors.status = 'Estado es obligatorio';
      if (!formValues.rol) newErrors.rol = 'Rol es obligatorio';
      if (!formValues.chapter) newErrors.chapter = 'Capítulo es obligatorio';
      if (!formValues.email) newErrors.email = 'Correo electrónico es obligatorio';
      if (!formValues.password) newErrors.password = 'Contraseña es obligatoria';
      if (!formValues.date_of_birth) newErrors.date_of_birth = 'Fecha nacimiento es obligatoria';

      
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
          names: formValues.names.toUpperCase(),
          surnames: formValues.surnames.toUpperCase(),
          phone: formValues.phone,
          email: formValues.email,
          date_of_birth: new Date(formValues.date_of_birth).toISOString().split('T')[0],
          code_access: '', // Si no hay `code_access`, se envía como cadena vacía
      };
      console.log(userData);


        // Enviar datos a la API
        try {
          const response = await fetch(`${config.apiBaseUrl}/api/users`, { // Reemplaza '/api/endpoint' con la URL de tu API
              method: 'POST',
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

            // Resetea el formulario después del envío exitoso
            setFormValues({
                document: '',
                names: '',
                surnames: '',
                status: '',
                chapter: '',
                date_of_birth: '',
                rol: '',
                email: '',
                phone: '',
                password: ''
            });
        } else {
              Swal.fire({
                  icon: 'error',
                  title: 'Error al enviar el formulario',
                  text: JSON.stringify(responseBody.message),
              });
          }
      }catch (error) {
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
        <div className="m-5">
            <div className="flex flex-wrap items-center justify-between">
                <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos del votante</h1>
            </div>
            <hr />
            <Card className="flex-1 max-w-full mt-4 px-6">
                <form onSubmit={handleSubmit}>
                    {/* Primera fila */}
                    <div className="flex flex-wrap justify-between gap-1 mb-4">
                        <div className="w-full sm:w-5/12">
                            <label htmlFor="document">N° Documento identidad / Codigo colegiatura *</label>
                            <InputField
                                value={formValues.document}
                                id="document"
                                onChange={handleChange}
                                type="text"
                                error={errors.document}
                            />
                        </div>

                        <div className="w-full sm:w-5/12">
                            <label htmlFor="password">Contraseña *</label>
                            <div className="flex items-center">
                                <div className="w-5/6">
                                    <InputField
                                        value={formValues.password}
                                        id="password"
                                        onChange={handleChange}
                                        type="password"
                                        error={errors.password}
                                    />
                                </div>
                                <Button
                                    onClick={handleAddNewPass}
                                    width="w-1/6"
                                    background="bg-neutral-500"
                                    hovercolor="hover:bg-neutral-700"
                                    type="button"
                                >
                                    <FontAwesomeIcon icon={faKey} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Segunda fila */}
                    <div className="flex flex-wrap justify-between gap-4 mb-4">
                        <div className="w-full sm:w-5/12">
                            <label htmlFor="names">Nombres completos *</label>
                            <InputField
                                value={formValues.names}
                                id="names"
                                onChange={handleChange}
                                type="text"
                                error={errors.names}
                            />
                        </div>

                        <div className="w-full sm:w-5/12">
                            <label htmlFor="surnames">Apellidos completos *</label>
                            <InputField
                                value={formValues.surnames}
                                id="surnames"
                                onChange={handleChange}
                                type="text"
                                error={errors.surnames}
                            />
                        </div>
                    </div>

                    {/* Tercera fila */}
                    <div className="flex flex-wrap justify-between gap-4 mb-4">
                        <div className="w-full sm:w-5/12">
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

                        <div className="w-full sm:w-5/12">
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

                    {/* Cuarta fila */}
                    <div className="flex flex-wrap justify-between gap-4 mb-4">
                        <div className="w-full sm:w-5/12">
                            <label htmlFor="rol">Rol *</label>
                            <Select
                                id="rol"
                                name="rol"
                                value={formValues.rol}
                                onChange={handleChange}
                                options={optionsRol}
                                error={errors.rol}
                            />
                        </div>

                        <div className="w-full sm:w-5/12">
                            <label htmlFor="phone">N° de celular</label>
                            <InputField
                                value={formValues.phone}
                                id="phone"
                                onChange={handleChange}
                                type="text"
                            />
                        </div>
                    </div>

                    {/* Quinta fila */}
                    <div className="flex flex-wrap justify-between gap-4 mb-4">
                        <div className="w-full sm:w-5/12">
                            <label htmlFor="date_of_birth">Fecha de nacimiento *</label>
                            <InputField
                                value={formValues.date_of_birth}
                                id="date_of_birth"
                                onChange={handleChange}
                                type="date"
                                error={errors.date_of_birth}
                            />
                        </div>

                        <div className="w-full">
                            <label htmlFor="email">Correo electrónico *</label>
                            <InputField
                                value={formValues.email}
                                id="email"
                                onChange={handleChange}
                                type="email"
                                error={errors.email}
                            />
                        </div>
                    </div>
                    <p><b>(*) Son campos obligatorios</b></p>

                    {/* Botones */}
                    <div className="flex justify-end gap-4 mt-4">
                        <Button
                            onClick={handleBackPage}
                            width="w-1/6"
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
                            width="w-1/6"
                        >
                            Guardar
                        </Button>
                    </div>
                </form>
            </Card>

        </div>
    );
}