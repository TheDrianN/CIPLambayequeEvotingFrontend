import React, { useState, useEffect } from 'react';
import Select, { SelectProps } from './Select';
import config from '../config';
import Cookies from 'js-cookie';  // Importar js-cookie para manejar las cookies


interface SubElection {
  id: string;
  title: string;
}



interface SelectSubElectionsProps extends Omit<SelectProps, 'options'> {}

const SelectSubElections: React.FC<SelectSubElectionsProps> = (props) => {
  const [options, setOptions] = useState<SubElection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
    const fetchDataChapter = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/sub-elections/subelectionsbystatus`,{
          method: 'GET',  // Método GET para obtener datos
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Enviar el token en la cabecera de autorización
          },
        });
        const responseData = await response.json();
        console.log('Datos recibidos:', responseData);
        setOptions(responseData.data); // Asumiendo que los capítulos están en responseData.data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchDataChapter();
  }, []);

  // Convertimos los capítulos a un formato compatible con el componente Select
  const selectOptions = options.map((subelection) => ({
    value: subelection.id,
    label: subelection.title,
  }));

  return (
    <Select
      {...props}
      options={selectOptions}
      placeholder={loading ? 'Cargando...' : props.placeholder}
    />
  );
};

export default SelectSubElections;