import React, { useState, useEffect } from 'react';
import Select, { SelectProps } from './Select';


interface Chapter {
  id: string;
  name: string;
}

interface SelectChaptersProps extends Omit<SelectProps, 'options'> {}

const SelectChapters: React.FC<SelectChaptersProps> = (props) => {
  const [options, setOptions] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDataChapter = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/chapters?limit=10&page=1');
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
  const selectOptions = options.map((chapter) => ({
    value: chapter.id,
    label: chapter.name,
  }));

  return (
    <Select
      {...props}
      options={selectOptions}
      placeholder={loading ? 'Cargando...' : props.placeholder}
    />
  );
};

export default SelectChapters;