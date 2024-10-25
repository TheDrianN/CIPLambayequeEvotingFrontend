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
  const getRandomChannel = () => Math.floor(Math.random() * 200 + 55);
  const r = getRandomChannel();
  const g = getRandomChannel();
  const b = getRandomChannel();
  return `rgb(${r},${g},${b})`;
};

interface BarChartProps {
  labels: string[];
  data: number[];
  images: (string | undefined)[];
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({ labels, data, images, className = 'w-full h-96' }) => {
  if (!labels || labels.length === 0 || !data || data.length === 0) {
    return <div>No hay datos para mostrar.</div>;
  }

  const colors = generateUniqueColors(labels.length);

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Votos en porcentaje',
      data: data,
      backgroundColor: colors,
      borderWidth: 1,
    }],
  };

  // Plugin personalizado para agregar imágenes
  const imagePlugin = {
    id: 'imagePlugin',
    afterDatasetsDraw(chart: any) {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);

      meta.data.forEach((bar: any, index: number) => {
        const imageSrc = images[index];
        if (imageSrc) {
          const image = new Image();
          image.src = imageSrc;

  
          const imageSize = 50;

          image.onload = () => {
            const x = bar.x - imageSize / 2;  // Centrar la imagen horizontalmente
            const y = bar.y - imageSize - 10;  // Colocar la imagen justo encima de la barra, ajustando con -10 píxeles
            ctx.drawImage(image, x, y, imageSize, imageSize);
          };

          image.onerror = () => {
            console.error(`Error al cargar la imagen en la barra ${index}: ${imageSrc}`);
          };
        } else {
          console.warn(`Imagen no encontrada para la barra ${index}`);
        }
      });
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Asegurarse de que el eje Y termine en 100
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className={className}>
      <Bar data={chartData} options={options as any} plugins={[imagePlugin]} />
    </div>
  );
};

export default BarChart;
