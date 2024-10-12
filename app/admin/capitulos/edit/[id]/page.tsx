'use client'
import React, { useState, useEffect } from "react";
import InputField from "../../../../../components/InputField";
import Button from "../../../../../components/Button";
import Card from "../../../../../components/Card";
import Select from "../../../../../components/Select";
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
    names: '',
    status: '',
  });

  const [errors, setErrors] = useState({
    names: '',
    status: '',
  });

  const router = useRouter();

  // Función para obtener los datos de la API y llenar el formulario
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/chapters/` + params.id);
      const responseData = await response.json();
      const data = responseData.data;
      console.log(responseData)

      // Mapea los datos obtenidos a los campos del formulario
      setFormValues({
        names: data.name || '',
        status: data.status || '',
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
        console.log(userData);
  
  
          // Enviar datos a la API
          try {
            const response = await fetch(`${config.apiBaseUrl}/api/chapters/` + params.id, { // Reemplaza '/api/endpoint' con la URL de tu API
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


  
  const handleBackPage = () => {
    router.push('/admin/capitulos');
  };

  return (
    <div className="m-5">
        <div className="flex flex-wrap items-center justify-between">
            <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos del Capitulo</h1>
        </div>
        <hr />
        <Card className="flex-1 max-w-6xl mt-4 px-4">
            <form onSubmit={handleSubmit}>

                <div className="w-full ">
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
