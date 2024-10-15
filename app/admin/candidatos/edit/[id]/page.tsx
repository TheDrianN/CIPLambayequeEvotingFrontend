'use client'
import React, { useState, useEffect } from "react";
import Button from "../../../../../components/Button";
import Card from "../../../../../components/Card";
import Select from "../../../../../components/Select";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ModalAgregarMiembro from "@/components/ModalAgregarMiembro";
import CustomDataTable from "@/components/tabla";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import SelectSubElections from "@/components/SelectSubElection";
import config from '../../../../../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies
import jwt_decode from 'jsonwebtoken';  // Importar jsonwebtoken para decodificar el token JWT

interface PageProps {
  params: {
    id: string;
  };
}

interface Miembro {
  id: string; // user_id
  colegiatura: string;
  nombre: string;
  tipoCargo: string;
  id_cargo: string;
  cargo: string;
}

interface MiembrosObtenidos {
  id: string; // user_id
  candidateId: string; // candidate ID
}

const Page: React.FC<PageProps> = ({ params }) => {
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

  const [modalOpen, setModalOpen] = useState(false); // Estado para controlar el modal
  const [miembrosObtenidos, setMiembrosObtenidos] = useState<MiembrosObtenidos[]>([]); // Guarda los user_id y candidateId originales
  const router = useRouter();
  const [ tokenAccess, setTokenAccess] = useState('');
  const [authorized, setAuthorized] = useState(false);  // Para controlar si el usuario está autorizado
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // Estado para la imagen seleccionada
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Estado para la previsualización    
  const [uploadStatus, setUploadStatus] = useState<string | null>(null); // Estado para el estado del envío



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
      const token = Cookies.get('access_token');  // Obtener el token de la cookie

      const response = await fetch(`${config.apiBaseUrl}/api/group-candidates/` + params.id,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Enviar el token en la cabecera de autorización
        },
      });
      const responseData = await response.json();
      const data = responseData.data;

      // Mapeamos los datos de candidatos al formato requerido
      const miembros = data.candidates.map((candidate: any) => {
        const candidateData = candidate.data;

        return {
          id: candidateData.user_id.toString(),
          colegiatura: candidateData.user_numdoc,
          nombre: `${candidateData.user_names} ${candidateData.user_surnames}`,
          tipoCargo: candidateData.typeCandidate.name_type,
          id_cargo: candidateData.type_candidate_id.toString(),
          cargo: candidateData.typeCandidate.name_type,
        };
      });

      // Guardamos los IDs originales de los candidatos para hacer la comparación después
      const miembrosObtenidos = data.candidates.map((candidate: any) => ({
        id: candidate.data.user_id.toString(),
        candidateId: candidate.data.id.toString(),
      }));

      setMiembrosObtenidos(miembrosObtenidos);

      setFormValues({
        lista: data.number_list,
        subelection: data.sub_election_id.toString(),
        miembros: miembros,
      });

      if (data.img) {
        setImagePreview(data.img); // Asume que `data.img` contiene la URL de la imagen almacenada
      }
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

  const handleAgregarMiembro = (nuevoMiembro: Miembro) => {
    setFormValues((prevState) => ({
      ...prevState,
      miembros: [...prevState.miembros, nuevoMiembro], // Agrega el nuevo miembro
    }));
    setModalOpen(false); // Cierra el modal después de agregar
  };

  const handleEliminarMiembro = (id: string) => {
    const nuevosMiembros = formValues.miembros.filter(miembro => miembro.id !== id);
    setFormValues({
      ...formValues,
      miembros: nuevosMiembros,
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
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      // Primero, actualiza el grupo de candidatos
      const groupPayload = {
        sub_election_id: parseInt(formValues.subelection),
        number_list: formValues.lista,
        img: ""
      };

      const responseGroup = await fetch(`${config.apiBaseUrl}/api/group-candidates/`+ params.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
        },
        body: JSON.stringify(groupPayload),
      });

      if (!responseGroup.ok) {
        throw new Error('Error al actualizar el grupo de candidatos');
      }

      const groupData = await responseGroup.json();

      // Obtener los IDs de los miembros actuales
      const currentMemberIds = formValues.miembros.map(miembro => miembro.id);

      // 1. Detectar los miembros eliminados: Están en `miembrosObtenidos` pero no en `currentMemberIds`
      const deletedCandidates = miembrosObtenidos.filter(m => !currentMemberIds.includes(m.id));

      // 2. Detectar los nuevos miembros: Están en `currentMemberIds` pero no en `miembrosObtenidos`
      const newCandidates = formValues.miembros.filter(miembro => !miembrosObtenidos.some(m => m.id === miembro.id));

      // Eliminar los candidatos eliminados usando `candidateId`
      const deleteCandidatesPromises = deletedCandidates.map(async (m) => {
        const responseDelete = await fetch(`${config.apiBaseUrl}/api/candidates/${m.candidateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
        },
        });

        if (!responseDelete.ok) {
          throw new Error('Error al eliminar el candidato');
        }
      });

      // Crear los nuevos candidatos
      const createCandidatesPromises = newCandidates.map(async (miembro) => {
        const candidatePayload = {
          type_candidate_id: parseInt(miembro.id_cargo),
          group_candidate_id: groupData.id,
          user_id: parseInt(miembro.id),
        };

        const responseCandidate = await fetch(`${config.apiBaseUrl}/api/candidates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
          },
          body: JSON.stringify(candidatePayload),
        });

        if (!responseCandidate.ok) {
          throw new Error('Error al agregar el nuevo candidato');
        }
      });

      // Espera a que se completen todas las promesas
      await Promise.all([...deleteCandidatesPromises, ...createCandidatesPromises]);

      // Muestra un mensaje de éxito
      Swal.fire('Éxito', 'Grupo de candidatos y miembros actualizados correctamente.', 'success');
      router.push('/admin/candidatos');
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al actualizar el grupo de candidatos o los miembros.', 'error');
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
};

export default Page;
