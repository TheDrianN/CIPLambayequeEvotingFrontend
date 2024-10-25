'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ResultadosElection from "../../../components/Resultados";
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT
import Swal from 'sweetalert2';
import config from '../../../config';
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import InputField from "../../../components/InputField";


export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado
  const [ tokenAccess, setTokenAccess] = useState('');
  const [id_user, setId_user] = useState('');

  const [formValues, setFormValues] = useState({
    document: '',
    names: '',
    surnames: '',
    date_of_birth:'',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({
    document: '',
    names: '',
    surnames: '',
    date_of_birth:'',
    email: '',
    phone: ''
  });


  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
  
    if (token) {
      setTokenAccess(token);
      try {
        // Decodificar el token directamente con jwt_decode
        const decodedToken = jwt_decode.decode(token);
        if (decodedToken && typeof decodedToken === 'object') {          
          // Verificar si el rol es "V"
          if (decodedToken.role === 'V') {
            if(decodedToken.sub){

              setId_user(decodedToken.sub);

            }
            setAuthorized(true);  // Usuario autorizado
          } else if (decodedToken.role === 'A') {
            router.push('/admin/procesoelectoral');
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

  useEffect(() => {
    if (id_user && tokenAccess) {
      fetchData(); // Llamamos fetchData solo cuando `id` y `tokenAccess` están disponibles
    }
  }, [id_user, tokenAccess]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormValues({
        ...formValues,
        [e.target.id]: e.target.value,
      });
    };

    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/users/` + id_user,{
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
  
          },
        });
        const responseData = await response.json();
        const data = responseData.data;
  
        // Mapea los datos obtenidos a los campos del formulario
        setFormValues({
          document: data.document || '',
          names: data.names || '',
          surnames: data.surnames || '',
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
          email: data.email || '',
          phone: data.phone || ''
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const handleBackPage = () => {
      router.push('/voters/home');
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      // Reseteo de errores
      setErrors({
          document: '',
          names: '',
          surnames: '',
          email: '',
          phone:'',
          date_of_birth:''
      });


  
      // Validación
      const newErrors: typeof errors = {};
  
      if (!formValues.document) newErrors.document = 'Número de documento es obligatorio';
      if (!formValues.names) newErrors.names = 'Nombres completos son obligatorios';
      if (!formValues.surnames) newErrors.surnames = 'Apellidos completos son obligatorios';
      if (!formValues.email) newErrors.email = 'Correo electrónico es obligatorio';
      if (!formValues.date_of_birth) newErrors.date_of_birth = 'Fecha de cumpleaños es obligatoria';
  
      setErrors(newErrors);
  
      // Si hay errores, no enviar el formulario
      if (Object.keys(newErrors).length > 0) return;

      let userData = {}; // Cambia `const` por `let`

      userData = { // Solo asigna, no vuelvas a declararla
        document: formValues.document,
        names: formValues.names,
        surnames: formValues.surnames,
        phone: formValues.phone,
        email: formValues.email,
        date_of_birth: new Date(formValues.date_of_birth).toISOString().split('T')[0],
      };

      console.log("data",userData)
      
        // Enviar datos a la API
        try {
          const response = await fetch(`${config.apiBaseUrl}/api/users/`+ id_user, { // Reemplaza '/api/endpoint' con la URL de tu API
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
              },
              body: JSON.stringify(userData),
          });
      
          const responseBody = await response.json(); // Obtener el cuerpo de la respuesta
          console.log(responseBody);
          if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Formulario enviado con éxito',
                text: JSON.stringify(responseBody.message),
            });

         
           
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
    <div className="flex mt-10 justify-center bg-gray-100">
      <div className=" w-3/4 ">
        {/* Título de la página */}
        <h1 className="text-2xl text-center font-bold mb-6">Mis Datos</h1>
  
        <Card className="flex-1 max-w-full mt-4 px-6">
          <form onSubmit={handleSubmit}>
            {/* Primera fila */}
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div className="w-full sm:w-5/12">
                <label htmlFor="document" className="block font-medium mb-1">
                  N° Documento identidad / Codigo colegiatura *
                </label>
                <InputField
                  value={formValues.document}
                  id="document"
                  onChange={handleChange}
                  type="text"
                  error={errors.document}
                />
              </div>
              <div className="w-full sm:w-5/12">
                <label htmlFor="names" className="block font-medium mb-1">
                  Nombres completos *
                </label>
                <InputField
                  value={formValues.names}
                  id="names"
                  onChange={handleChange}
                  type="text"
                  error={errors.names}
                />
              </div>
  
            </div>
  
            {/* Segunda fila */}
            <div className="flex flex-wrap justify-between gap-4 mb-4">
             
              <div className="w-full sm:w-5/12">
                <label htmlFor="surnames" className="block font-medium mb-1">
                  Apellidos completos *
                </label>
                <InputField
                  value={formValues.surnames}
                  id="surnames"
                  onChange={handleChange}
                  type="text"
                  error={errors.surnames}
                />
              </div>

              <div className="w-full sm:w-5/12">
                <label htmlFor="phone" className="block font-medium mb-1">
                  N° de celular
                </label>
                <InputField
                  value={formValues.phone}
                  id="phone"
                  onChange={handleChange}
                  type="text"
                />
              </div>
            </div>
  
            {/* Tercera fila */}
            <div className="flex flex-wrap justify-between gap-4 mb-4">
             
            </div>
  
            {/* Cuarta fila */}
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div className="w-full sm:w-5/12">
                <label htmlFor="date_of_birth" className="block font-medium mb-1">
                  Fecha de nacimiento *
                </label>
                <InputField
                  value={formValues.date_of_birth}
                  id="date_of_birth"
                  onChange={handleChange}
                  type="date"
                  error={errors.date_of_birth}
                />
              </div>
  
              <div className="w-full sm:w-5/12">
                <label htmlFor="email" className="block font-medium mb-1">
                  Correo electrónico *
                </label>
                <InputField
                  value={formValues.email}
                  id="email"
                  onChange={handleChange}
                  type="email"
                  error={errors.email}
                />
              </div>
            </div>
  
            <p className="text-left text-sm text-gray-500"><b>(*) Son campos obligatorios</b></p>
  
            {/* Botones */}
            <div className="flex justify-end gap-4 mt-4">
              <Button
                onClick={handleBackPage}
                width="w-full sm:w-1/3 md:w-1/6"
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
                width="w-full sm:w-1/3 md:w-1/6"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
  
}
