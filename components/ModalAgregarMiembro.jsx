import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono
import SelectTypeCandidates from '../components/SelectTypeCandidate';
import Select from '../components/Select';
import Swal from 'sweetalert2';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

const ModalAgregarMiembro = ({ isOpen, onClose, onAgregar,ariaHideApp = true }) => {
    const [miembro, setMiembro] = useState({
        id: '',
        colegiatura: '',
        nombre: '',
        tipoCargo: '',
        id_cargo:'',
        cargo:'',
    });
    const [ tokenAccess, setTokenAccess] = useState('');


    useEffect(() => {
        const token = Cookies.get('access_token');  // Obtener el token de la cookie
      
        if (token) {
            setTokenAccess(token);
        } 
      }, []);


    const handleChangeSelect = (e) => {
        const value = e.target.value; // Obtiene el valor del select
        const label = e.target.selectedOptions[0].text; // Obtiene el texto de la opción seleccionada
      
        console.log("valor", value);  // Imprime el valor
        console.log("texto", label);  // Imprime el texto (label)
      
        setMiembro({
          ...miembro,
          [e.target.id]: value,   // Asigna el valor (id_cargo)
          cargo: label            // Asigna el texto (nombre del cargo)
        });
    };
    
    
    const handleChange = (e) => {
        setMiembro({
            ...miembro,
            [e.target.id]: e.target.value
        });
    };

    const [errors, setErrors] = useState({
        colegiatura: '',
        nombre: '',
        postula: '',
        cargo:'',
    });

    const handleSubmit = () => {
        // Validaciones básicas de campos vacíos
        console.log(miembro)
        if (!miembro.colegiatura || !miembro.nombre || !miembro.cargo) {
            Swal.fire({
                icon: 'error',
                title: 'Faltan datos',
                text: 'Por favor, completa todos los campos obligatorios.',
            });
            return;
        }
    
        // Llama a la función onAgregar pasando los datos del miembro
        onAgregar(miembro);
         // Limpiar los campos del formulario
        setMiembro({
            id: '',
            colegiatura: '',
            nombre: '',
            tipoCargo: '',
            id_cargo: '',
            cargo: '',
        });
    
        // Cierra el modal
        onClose();
    };

    const handleshearch = async () =>{
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/users/shearchDoc/${miembro.colegiatura}`,{
                method: 'GET',  // Método GET para obtener datos
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAccess}`,  // Enviar el token en la cabecera de autorización
                },
            });
            const responseData = await response.json();
            console.log('Datos recibidos Nuevo:', responseData); // Imprime los datos en la consola
            if (response.ok) {
                setMiembro((prevMiembro) => ({
                    ...prevMiembro,
                    nombre: responseData.data.names +' '+ responseData.data.surnames,
                    id: responseData.data.id // Asigna el nombre recibido de la API
                }));
               
            } else {
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error al buscar Usuario',
                    text: JSON.stringify(responseData.message),
                });
            } 

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: error.message,
            });
        }
    }

    const options = [
        { value: "CD", label: "CARGO PARA EL CONSEJO DEPARTAMENTAL" },
        { value: "CA", label: "CARGO PARA ASAMBLEA DEPARTAMENTAL" },
        { value: "CC", label: "CARGO PARA JUNTA DIRECTIVA DE LOS CAPÍTULOS" },
      ];

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={ariaHideApp}
            className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-3/4 mt-24" // Estilos del modal
            overlayClassName="fixed z-10 inset-0 bg-black bg-opacity-50 flex justify-center items-center" // Fondo oscurecido
        >
            <h2 className="text-xl font-semibold mb-4">Agregar Miembro</h2>
            <div className="w-1/2  gap-4 mb-4">
                <div className='w-full '>
                    <label htmlFor='ncolegiatura'>N° Colegiatura / DNI *</label>
                    <div className='flex gap-3 w-full'>
                        <InputField
                            id="colegiatura"
                            value={miembro.colegiatura}
                            onChange={handleChange}
                            type='text'
                            error={errors.colegiatura}
                        />
                        <Button onClick={handleshearch}  type="button" width='w-1/6' height='h-1/2' background="bg-slate-500" hovercolor="hover:bg-slate-700" className="ml-4">
                            <FontAwesomeIcon icon={faMagnifyingGlass} /> 
                        </Button>
                    </div>
                    
                </div>

               
            </div>

            <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div className="w-full sm:w-1/3">
                    <label htmlFor="type">Tipo de Cargo *</label>
                    <Select
                        id="tipoCargo"
                        name="tipoCargo"
                        value={miembro.tipoCargo}
                        onChange={handleChange}
                        options={options}
                    
                    />
                </div>

                <div className='w-full sm:w-1/3'>
                    <label htmlFor='end_date'>Cargo *</label>
                    <SelectTypeCandidates
                    id='id_cargo' onChange={handleChangeSelect} value={miembro.id_cargo} tipoCargo={miembro.tipoCargo}/>
                </div>
            </div>

            

            <div className='w-full'>
                <label htmlFor='end_date'>Nombre</label>
                <InputField
                    id="nombre"
                    name="nombre"
                    value={miembro.nombre}
                    onChange={handleChange}
                    
                />
            </div>
           
            
            <div className="flex gap-4 justify-end mt-4">
                <Button onClick={onClose} background="bg-yellow-500" width='w-full sm:w-1/2 md:w-1/6'  type="button" hovercolor="hover:bg-yellow-600">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} width='w-full sm:w-1/2 md:w-1/6' background="bg-blue-500" hovercolor="hover:bg-blue-700" className="ml-4">
                    Agregar
                </Button>
            </div>
        </Modal>
    );
};

export default ModalAgregarMiembro;
