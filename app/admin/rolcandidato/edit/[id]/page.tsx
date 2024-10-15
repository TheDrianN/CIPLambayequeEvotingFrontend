'use client'
import React, { useState, useEffect } from "react";
import InputField from "../../../../../components/InputField";
import Button from "../../../../../components/Button";
import Card from "../../../../../components/Card";
import Select from "../../../../../components/Select";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import config from '../../../../../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
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
  const [ tokenAccess, setTokenAccess] = useState('');
  const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
  
    if (token) {
        setTokenAccess(token)
      try {
        // Decodificar el token directamente con jwt_decode
        const decodedToken = jwt_decode.decode(token);
  
        // Verificar si `decodedToken` no es null
        if (decodedToken && typeof decodedToken === 'object') {
          // Verificar si el rol es "V"
          if (decodedToken.role === 'A') {
            setAuthorized(true);  // Usuario autorizado
          } else if (decodedToken.role === 'V') {
            router.push('/voters/home');
          } else {
            setAuthorized(false);  // Si hay un error, no está autorizado
            router.push('/404');  // Redirigir si no es autorizado
          }
        } else {
          // Si `decodedToken` es null o no es un objeto válido
          setAuthorized(false);
          router.push('/404');  // Redirigir en caso de error
        }
      } catch (error) {
        router.push('/404');  // Redirigir en caso de error
      }
    } else {
      router.push('/');  // Redirigir si no hay token
    }
  }, [router]);  // Asegúrate de incluir router en las dependencias
  
  // Función para obtener los datos de la API y llenar el formulario
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/type-candidates/` + params.id,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización

        },
      });
      const responseData = await response.json();
      const data = responseData.data;
      console.log(responseData)

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
    if(tokenAccess){
      fetchData();
    }
  }, [params.id,tokenAccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const options = [
    { value: 'CD', label: 'Cargo para el Consejo Departamental' },
    { value: 'CA', label: 'Cargo para Asamblea Departamental' },
    { value: 'CC', label: 'Cargo para Junta Directiva de los Capítulos' }
  ];
    
   

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
            const response = await fetch(`${config.apiBaseUrl}/api/type-candidates/`+params.id, { // Reemplaza '/api/endpoint' con la URL de tu API
                method: 'PATCH',
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
    router.push('/admin/rolcandidato');
  };

  if (!authorized) {
    return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
}

  return (
    <div className="m-5">
        <div className="flex flex-wrap items-center justify-between">
            <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos del Rol</h1>
        </div>
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


                    <div className="w-full ">
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
                        id='description'
                        onChange={handleChange}
                        asTextarea
                        placeholder="Escribe aquí la descripción"
                        sizeY="py-3"
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
