import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar componentes de Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Función para generar colores aleatorios únicos
const generateUniqueColors = (numColors: number) => {
  const colors = new Set<string>();
  while (colors.size < numColors) {
    const color = generateRandomColor();
    colors.add(color);
  }
  return Array.from(colors);
};

// Función para generar un color aleatorio con mayor variación
const generateRandomColor = (): string => {
  // Generar componentes de color con mayores diferencias
  const getRandomChannel = () => Math.floor(Math.random() * 200 + 55); // Limitar para evitar colores muy oscuros o claros
  const r = getRandomChannel();
  const g = getRandomChannel();
  const b = getRandomChannel();
  return `rgb(${r},${g},${b})`; // Retorna el color en formato RGB
};

interface BarChartProps {
  labels: string[];
  data: number[]; // Esta data es por cada candidato
  className?: string;  // Nueva propiedad para aceptar clases de Tailwind
}

const BarChart: React.FC<BarChartProps> = ({ labels, data, className = 'w-full h-96' }) => {
  // Si los labels o data están vacíos, evitar renderizar el gráfico
  if (!labels || labels.length === 0 || !data || data.length === 0) {
    return <div>No hay datos para mostrar.</div>;
  }

  // Generar colores únicos para cada barra
  const colors = generateUniqueColors(labels.length);

  // Crear datasets con los datos correspondientes para cada candidato
  const chartData = {
    labels: labels, // Los nombres en la parte inferior del gráfico
    datasets: [{
      label: 'Votos en porcentaje', // Etiqueta para todas las barras
      data: data, // Todos los valores para cada candidato
      backgroundColor: colors, // Colores generados dinámicamente para cada barra
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permitir que el gráfico se ajuste según el tamaño del contenedor
    plugins: {
      legend: {
        display: false, // Mostrar leyenda para cada candidato
        labels: {
          usePointStyle: true, // Mostrar puntos en lugar de cuadros en la leyenda
        },
      },
      tooltip: {
        enabled: true, // Habilitar tooltips
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Empezar el eje Y desde 0
        ticks: {
          callback: (value: any) => `${value}%`, // Mostrar % en el eje Y
        },
      },
    },
    animation: {
      duration: 1000, // Duración de la animación al hacer clic en la leyenda
    },
  };

  return (
    <div className={className}> {/* Aplicar las clases de tamaño de Tailwind */}
      <Bar data={chartData} options={options as any} />
    </div>
  );
};


export default BarChart;
