import React, { useState, useEffect } from 'react';
import Select, { SelectProps } from './Select';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies

interface Elections {
  id: string;
  title: string;
}

interface SelectElectionsProps extends Omit<SelectProps, 'options'> {}

const SelectElections: React.FC<SelectElectionsProps> = (props) => {
  const [options, setOptions] = useState<Elections[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
    const fetchDataChapter = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/elections?limit=10&page=1`,{
          method: 'GET',  // Método GET para obtener datos
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Enviar el token en la cabecera de autorización
          },
        });
        const responseData = await response.json();
        if(responseData.data.length > 0){
          setOptions(responseData.data); // Asumiendo que los capítulos están en responseData.data

        }else{
          setOptions([]);  // Asegurarse de que las opciones estén vacías

        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchDataChapter();
  }, []);

  // Convertimos los capítulos a un formato compatible con el componente Select
  const selectOptions = options.map((elections) => ({
    value: elections.id,
    label: elections.title,
  }));

  return (
    <Select
      {...props}
      options={selectOptions}
      placeholder={loading ? 'Cargando...' : props.placeholder}
    />
  );
};

export default SelectElections;