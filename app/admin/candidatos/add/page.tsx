"use client";
import React, { useState } from 'react';
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

    const [modalOpen, setModalOpen] = useState(false); // Estado para controlar el modal


    const router = useRouter();


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
            // Primero, crea el grupo de candidatos
            const groupPayload = {
                sub_election_id: parseInt(formValues.subelection),
                number_list: formValues.lista,
                img: ""
            };
    
            console.log('Enviando datos del grupo de candidatos:', groupPayload);
    
            const responseGroup = await fetch('http://localhost:3000/api/group-candidates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
    
                const responseCandidate = await fetch('http://localhost:3000/api/candidates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(candidatePayload),
                });
    
                if (!responseCandidate.ok) {
                    throw new Error('Error al crear el candidato');
                }
            });
    
            // Espera a que se creen todos los candidatos
            await Promise.all(candidatesPromises);
    
            // Muestra un mensaje de éxito
            Swal.fire('Éxito', 'Grupo de candidatos y miembros añadidos correctamente.', 'success');
            // Opcional: Redirige a otra página
            router.push('/admin/candidatos');
    
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Ocurrió un error al agregar el grupo de candidatos o los miembros.', 'error');
        }
    };


    return (
        <div className="m-5">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-lg font-medium sm:mb-0 sm:text-xl">Datos de los Candidatos</h1>
      </div>
      <hr />
    


      <Card className="flex-1  mt-4 px-4">
        <div className="w-full sm:w-1/3">
            <label htmlFor='start_date'>Sub elección</label>
            <SelectSubElections
            id='subelection'
             name="subelection"
            value={formValues.subelection}
            onChange={handleChange}
            error={errors.subelection}
            />
        </div>
        <hr />
        <div className="flex flex-wrap justify-between gap-4 mt-4 mb-4">
            <div className='w-full sm:w-1/3'>
                <label htmlFor='start_date'>N° de lista:</label>
                <Select
                    id="lista"
                    name="lista"
                    value={formValues.lista}
                    onChange={handleChange}
                    options={optionsnumlist}
                    error={errors.lista}
                />
            </div>

            <div className='w-full sm:w-1/3'>
                
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
