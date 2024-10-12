import React, { useState, useEffect } from 'react';
import Select, { SelectProps } from './Select';
import config from '../config';


interface Elections {
  id: string;
  title: string;
}

interface SelectElectionsProps extends Omit<SelectProps, 'options'> {}

const SelectElections: React.FC<SelectElectionsProps> = (props) => {
  const [options, setOptions] = useState<Elections[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDataChapter = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/elections?limit=10&page=1`);
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