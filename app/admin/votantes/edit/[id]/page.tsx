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
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT


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
    rol:'',
    date_of_birth:'',
    email: '',
    phone: '',
    password: '',
    newpassword:''
  });

  const [errors, setErrors] = useState({
    document: '',
    names: '',
    surnames: '',
    status: '',
    chapter: '',
    rol: '',
    email: '',
    date_of_birth:''
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
      const response = await fetch(`${config.apiBaseUrl}/api/users/` + params.id,{
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
        document: data.document || '',
        names: data.names || '',
        surnames: data.surnames || '',
        status: data.status || '',
        chapter: data.chapter_id || '',
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
        rol: data.rol || '',
        email: data.email || '',
        phone: data.phone || '',
        password: data.password || '',
        newpassword:''
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
    { value: 'V', label: 'VIGENTE' },
    { value: 'I', label: 'NO VIGENTE' }
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
            date_of_birth:''
        });
  
  
    
        // Validación
        const newErrors: typeof errors = {
          document: '',
          names: '',
          surnames: '',
          status: '',
          rol: '',
          chapter: '',
          email: '',
          date_of_birth: ''
        };
    
        if (!formValues.document) newErrors.document = 'Número de documento es obligatorio';
        if (!formValues.names) newErrors.names = 'Nombres completos son obligatorios';
        if (!formValues.surnames) newErrors.surnames = 'Apellidos completos son obligatorios';
        if (!formValues.status) newErrors.status = 'Estado es obligatorio';
        if (!formValues.chapter) newErrors.chapter = 'Capítulo es obligatorio';
        if (!formValues.email) newErrors.email = 'Correo electrónico es obligatorio';
        if (!formValues.date_of_birth) newErrors.date_of_birth = 'Fecha de cumpleaños es obligatoria';
    
        setErrors(newErrors);
    
        // Si hay errores, no enviar el formulario
        if (Object.values(newErrors).some(error => error !== '')) {
          console.log("Errores detectados", newErrors);
          return;
        }

        let userData = {}; // Cambia `const` por `let`

        if (formValues.newpassword === '') {
          userData = {
            chapter_id: Number(formValues.chapter),
            document: formValues.document,
            password: formValues.password,
            status: formValues.status,
            rol: formValues.rol,
            names: formValues.names,
            surnames: formValues.surnames,
            phone: formValues.phone,
            email: formValues.email,
            code_access: '', // Si no hay `code_access`, se envía como cadena vacía
          };
        } else {
          userData = { // Solo asigna, no vuelvas a declararla
            chapter_id: Number(formValues.chapter),
            document: formValues.document,
            password: formValues.newpassword,
            status: formValues.status,
            rol: formValues.rol,
            names: formValues.names,
            surnames: formValues.surnames,
            phone: formValues.phone,
            email: formValues.email,
            code_access: '', // Si no hay `code_access`, se envía como cadena vacía
          };
        }
    
        // Construir el objeto JSON
       
        
  
  
          // Enviar datos a la API
          try {
            const response = await fetch(`${config.apiBaseUrl}/api/users/`+params.id, { // Reemplaza '/api/endpoint' con la URL de tu API
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
    setFormValues({ ...formValues, newpassword: newPassword });
    console.log('Nueva contraseña generada:', newPassword);
  };

  const handleBackPage = () => {
    router.push('/admin/votantes');
  };

  if (!authorized) {
    return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
}


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
                        <label htmlFor="password">Cambiar contraseña</label>
                        <div className="flex items-center">
                            <div className="w-5/6">
                                <InputField
                                    value={formValues.newpassword}
                                    id="newpassword"
                                    onChange={handleChange}
                                    type="text"
                                    
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
                        width="w-full sm:w-1/6 md:w-1/6"
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
                        width="w-full sm:w-1/6 md:w-1/6"
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
