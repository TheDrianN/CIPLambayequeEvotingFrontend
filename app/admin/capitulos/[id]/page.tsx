import React from 'react';

// Definimos la estructura de los parámetros
interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  return (
    <div>
      Post Page {params.id}
    </div>
  );
};

export default Page;