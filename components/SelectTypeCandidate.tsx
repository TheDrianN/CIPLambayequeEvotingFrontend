import React, { useState, useEffect } from 'react';
import Select, { SelectProps } from './Select';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

interface TypeCandidates {
  id: string;
  name_type: string;
}

interface SelectTypeCandidatesProps extends Omit<SelectProps, 'options'> {
  tipoCargo: string;  // Recibimos el tipo seleccionado como prop
}

interface SelectTypeCandidatesProps extends Omit<SelectProps, 'options'> {}

const SelectTypeCandidates: React.FC<SelectTypeCandidatesProps> = ({ tipoCargo, ...props }) => {
  const [options, setOptions] = useState<TypeCandidates[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
    const fetchData = async () => {
      if (!tipoCargo) return;  // Si no hay tipo seleccionado, no se hace la petición
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/type-candidates/bytype/${tipoCargo}`,{
          method: 'GET',  // Método GET para obtener datos
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Enviar el token en la cabecera de autorización
          },
        });
        const responseData = await response.json();
        setOptions(responseData.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [tipoCargo]);  // Volvemos a cargar los datos cuando cambia el tipo

  const selectOptions = options.map((typeCandidate) => ({
    value: typeCandidate.id,
    label: typeCandidate.name_type,
  }));

  return (
    <Select
      {...props}
      options={selectOptions}
      placeholder={loading ? 'Cargando...' : 'Selecciona un cargo'}
    />
  );
};

export default SelectTypeCandidates;