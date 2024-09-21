import React, { useState, useEffect } from 'react';
import Select, { SelectProps } from './Select';


interface SubElection {
  id: string;
  title: string;
}

interface SelectSubElectionsProps extends Omit<SelectProps, 'options'> {}

const SelectSubElections: React.FC<SelectSubElectionsProps> = (props) => {
  const [options, setOptions] = useState<SubElection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDataChapter = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/sub-elections/subelectionsbystatus/1');
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