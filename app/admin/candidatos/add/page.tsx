"use client";
import React, { useState,useEffect } from 'react';
import Card from "../../../../components/Card"
import Button from "../../../../components/Button"
import CustomDataTable from "../../../../components/tabla"
import ModalAgregarMiembro from "../../../../components/ModalAgregarMiembro"
import Select from "../../../../components/Select" 
import SelectSubElections from "../../../../components/SelectSubElection" 
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono
import config from '../../../../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT


interface Miembro {
    id: string;
    colegiatura: string;
    nombre: string;
    tipoCargo: string;
    id_cargo:string;
    cargo:string;
}

export default function Page(){
   
    const [formValues, setFormValues] = useState<{ lista: string; subelection: string; miembros: Miembro[] }>({
        lista: '',
        subelection: '',
        miembros: [],
    });

    const [errors, setErrors] = useState({
        lista: '',
        subelection: '',
        miembros: [],
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null); // Estado para la imagen seleccionada
    const [imagePreview, setImagePreview] = useState<string | null>(null); // Estado para la previsualización    
    const [uploadStatus, setUploadStatus] = useState<string | null>(null); // Estado para el estado del envío

    const [modalOpen, setModalOpen] = useState(false); // Estado para controlar el modal
    const [ tokenAccess, setTokenAccess] = useState('');
    const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado
  

    const router = useRouter();

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
      



    const optionsnumlist = [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormValues({
          ...formValues,
          [e.target.id]: e.target.value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setSelectedImage(file);
          setImagePreview(URL.createObjectURL(file)); // Crear una URL temporal para previsualizar
      }
  };

    const handleBackPage = () => {
        router.push('/admin/candidatos');
    };

    const handleAgregarMiembro = (nuevoMiembro: Miembro) => {
        setFormValues((prevState) => ({
            ...prevState,
            miembros: [...prevState.miembros, nuevoMiembro], // Agrega el nuevo miembro
        }));
        
        console.log('Nuevo miembro agregado:', nuevoMiembro);
        console.log('Miembros actuales:', formValues.miembros);
        
        setModalOpen(false); // Cierra el modal después de agregar
    };

    const handleEliminarMiembro = (id:string) => {
        const nuevosMiembros = formValues.miembros.filter(miembro => miembro.id !== id);
        setFormValues({
            ...formValues,
            miembros: nuevosMiembros
        });
    };

    const columns = [
        { name: 'ID', selector: (row: Miembro) => row.id, sortable: true },
        { name: 'N° Colegiatura', selector: (row: Miembro) => row.colegiatura, sortable: true },
        { name: 'Apellidos y Nombres', selector: (row: Miembro) => row.nombre, sortable: true },
        { name: 'Postula', selector: (row: Miembro) => row.cargo, sortable: true },
        {
            name: 'Acciones',
            cell: (row: Miembro) => (
                <div className="flex space-x-2">
                    <Button
                        onClick={() => handleEliminarMiembro(row.id)}
                        background="bg-red-500"
                        hovercolor="hover:bg-red-600"
                        type="button"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            )
        }
    ];

    const handleSubmit = async () => {
      try {
        if (!selectedImage) {
          setUploadStatus('Por favor selecciona una imagen primero');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debes seleccionar una imagen antes de continuar.',
          });
          return;
        }
    
        const formData = new FormData();
        formData.append('file', selectedImage); // Aquí "file" es la clave para el backend
    
        // Mostrar mensaje de carga con SweetAlert
        Swal.fire({
          title: 'Espere por favor...',
          text: 'Estamos procesando los datos',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading(); // Mostrar el spinner de carga
          }
        });
    
        try {
          const response = await fetch(`${config.apiBaseUrl}/api/firebase-service/sendimg`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
            },
            body: formData, // El cuerpo de la solicitud es FormData
          });
    
          if (!response.ok) {
            throw new Error('Error al subir la imagen');
          }
    
          const data = await response.json(); // Esperar la respuesta como JSON
          console.log(data.url); // Imprime la URL de la imagen para verificar
    
          // Ahora 'data.url' debería contener la URL de la imagen subida
          if (data.url) {
            setUploadStatus(data.url);
    
            // Primero, crea el grupo de candidatos
            const groupPayload = {
              sub_election_id: parseInt(formValues.subelection),
              number_list: formValues.lista,
              img: data.url, // Usar data.url, que contiene la URL de la imagen subida
            };
    
            console.log('Enviando datos del grupo de candidatos:', groupPayload);
    
            const responseGroup = await fetch(`${config.apiBaseUrl}/api/group-candidates`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
              },
              body: JSON.stringify(groupPayload),
            });
    
            if (!responseGroup.ok) {
              throw new Error('Error al crear el grupo de candidatos');
            }
    
            const groupData = await responseGroup.json();
            console.log('Respuesta del grupo de candidatos:', groupData.id);
    
            // Luego, crea los candidatos
            const candidatesPromises = formValues.miembros.map(async (miembro) => {
              const candidatePayload = {
                type_candidate_id: parseInt(miembro.id_cargo), // Ajusta esto si es necesario
                group_candidate_id: groupData.id,
                user_id: parseInt(miembro.id), // Asegúrate de que `id` es el valor correcto para `user_id`
              };
    
              console.log('Enviando datos del candidato:', candidatePayload);
    
              const responseCandidate = await fetch(`${config.apiBaseUrl}/api/candidates`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
                },
                body: JSON.stringify(candidatePayload),
              });
    
              if (!responseCandidate.ok) {
                throw new Error(`Error al crear el candidato con ID: ${miembro.id}`);
              }
            });
    
            // Espera a que se creen todos los candidatos
            await Promise.all(candidatesPromises);
    
            // Cerrar el mensaje de carga y mostrar éxito
            Swal.close();
            Swal.fire('Éxito', 'Grupo de candidatos, imagen y miembros añadidos correctamente.', 'success');
            // Redirige a otra página
            router.push('/admin/candidatos');
          } else {
            throw new Error('Error al obtener la URL de la imagen');
          }
        } catch (error) {
          // Cerrar el mensaje de carga y mostrar el error
          Swal.close();
          console.error('Error al subir la imagen:', error);
          setUploadStatus('');
          
          // Mostrar mensaje de error con SweetAlert
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Ocurrió un error al subir la imagen.',
          });
        }
      } catch (error) {
        // Cerrar el mensaje de carga si se produce un error inesperado
        Swal.close();
        console.error('Error:', error);
    
        // Mostrar mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error inesperado',
          text: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        });
      }
    };
    


    if (!authorized) {
        return <p>Acceso denegado. No tienes permiso para ver esta página.</p>;
    }
    
    return (
        <div className="m-5">
            <div className="flex flex-wrap items-center justify-between">
              <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos de los Candidatos</h1>
            </div>
            <hr />
          


            <Card className="flex-1  mt-4 px-4">
            

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label htmlFor="subelection">Sub elección</label>
                <SelectSubElections
                  id="subelection"
                  name="subelection"
                  value={formValues.subelection}
                  onChange={handleChange}
                  error={errors.subelection}
                />
                <hr />
                 <div className='mt-2 mb-2'>
                    <label htmlFor="lista">N° de lista</label>
                    <Select
                      id="lista"
                      name="lista"
                      size='w-1/8'
                      value={formValues.lista}
                      onChange={handleChange}
                      options={optionsnumlist}
                      error={errors.lista}
                    />
                 </div>
              </div>

            

              <div className="col-span-1 flex justify-end items-center">
                <label
                  htmlFor="imageInput"
                  className="relative w-48 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer transition hover:border-gray-500"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Previsualización" className="absolute w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-600 text-center">Cargar imagen</div>
                  )}
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label htmlFor="description">Miembros:</label>
            <Button
                onClick={() => setModalOpen(true)}
                width="w-1/6 sm:w-1/6"
                background="bg-green-500"
                hovercolor="hover:bg-green-600"
                type="button"
            >
                Agregar Miembro
            </Button>
        </div>

        {/* Tabla con los miembros */}
        <CustomDataTable columns={columns} data={formValues.miembros} />

        <ModalAgregarMiembro 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            onAgregar={handleAgregarMiembro} 
          
        />

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
            onClick={handleSubmit}
            background="bg-blue-500"
            hovercolor="hover:bg-blue-700"
            width="w-1/6 sm:w-1/6"
          >
            Guardar
          </Button>
        </div>

      </Card>
    </div>
    );
}
