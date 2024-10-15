"use client";
import React, { useState,useEffect } from 'react';
import Card from "../../../../../components/Card";
import Button from "../../../../../components/Button";
import InputField from "../../../../../components/InputField";
import SelectElections from "../../../../../components/SelectElections"; 
import SelectChapter from "../../../../../components/SelectChapter"; 
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import config from '../../../../../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT

interface PageProps {
    params: {
      id: string;
    };
}

const Page: React.FC<PageProps> = ({ params }) => {
    const router = useRouter();
    const [ tokenAccess, setTokenAccess] = useState('');
    const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado
  
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
        const response = await fetch(`${config.apiBaseUrl}/api/sub-elections/` + params.id,{
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
          },
        });
        const responseData = await response.json();
        const data = responseData.data;
        console.log("hola",responseData.data)

        // Mapea los datos obtenidos a los campos del formulario
        setFormValues({
            election: data.election_id || '',
            chapter: data.chapter_id || '',
            title: data.title || '',
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
        const { id, value } = e.target;
        setFormValues({ ...formValues, [id]: value });
    };

    const handleBackPage = () => {
        router.push('/admin/subelections');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Limpiar errores
        const newErrors: Record<string, string> = {};
    
        // Validación
        if (!formValues.title) newErrors.title = 'El título es obligatorio';
        if (!formValues.election) newErrors.election = 'Debe selecionar un Proceso Electoral es obligatorio';
       
       
        setErrors(newErrors);
    
        // Si hay errores, no enviar el formulario
        if (Object.keys(newErrors).length > 0) return;
    
      
        // Construir el objeto JSON
        const userData = {
          description: formValues.description,
          chapter_id: formValues.chapter,
          election_id: formValues.election,
          title: formValues.title
        };
      
    
        // Enviar datos a la API
        try {
          const response = await fetch(`${config.apiBaseUrl}/api/sub-elections/`+params.id, { // Reemplaza esta URL por la correcta
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
    
    if (!authorized) {
      return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
  }
    return (
        <div className="m-5">
          <div className="flex flex-wrap items-center justify-between ">
            <h1 className=" text-lg font-medium sm:mb-0 sm:text-xl">Datos Generales</h1>
          </div>
          <hr />
          <Card className="flex-1 max-w-6xl mt-4 px-4">
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
                  <label htmlFor='end_date'>Capitulo</label>
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