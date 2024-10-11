"use client";
import React, { useState } from 'react';
import Card from "../../../../components/Card"
import Button from "../../../../components/Button"
import InputField from "../../../../components/InputField"
import Select from "../../../../components/Select" 
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';


export default function VotantesPage(){
    const [formValues, setFormValues] = useState({
        name_type: '',
        type: '',
        description: '',
    });

    const [errors, setErrors] = useState({
        name_type: '',
        type: '',

    });

    const router = useRouter();

    
    const options = [
        { value: 'CD', label: 'Cargo para el Consejo Departamental' },
        { value: 'CA', label: 'Cargo para Asamblea Departamental' },
        { value: 'CC', label: 'Cargo para Junta Directiva de los Capítulos' }
    ];
  

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormValues({ ...formValues, [id]: value });
    };

    const handleBackPage = () => {
      router.push('/admin/rolcandidato');
    };


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      // Reseteo de errores
      setErrors({
        name_type: '',
        type: '',
      
      });


  
      // Validación
      const newErrors: typeof errors = {};
  
      if (!formValues.name_type) newErrors.name_type = 'Nombre del Rol es obligatorio';
      if (!formValues.type) newErrors.type = 'El tipo de Rol es obligatorio';

      setErrors(newErrors);
  
      // Si hay errores, no enviar el formulario
      if (Object.keys(newErrors).length > 0) return;
  
      // Construir el objeto JSON
      const userData = {
        type: formValues.type,
        name_type: formValues.name_type.toUpperCase(),
        description: formValues.description,
      };
      console.log(userData);


        // Enviar datos a la API
        try {
          const response = await fetch('http://localhost:3000/api/type-candidates', { // Reemplaza '/api/endpoint' con la URL de tu API
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
                name_type: '',
                type: '',
                description: '',
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
                <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos del rol</h1>
            </div>
            <hr />
            <Card className="flex-1 max-w-6xl mt-4 px-4">
                <form onSubmit={handleSubmit}>

                    <div className="w-full sm:w-1/3">
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


                    <div className="w-full ">
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
}
