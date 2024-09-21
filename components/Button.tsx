interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  background?: string;
  hovercolor?: string;
  width?: string;
  height?: string;
  type?: 'button' | 'submit' | 'reset'; // Agregar type como prop opcional
}

const Button = ({
  onClick,
  children,
  background = 'bg-blue-500',
  hovercolor = 'hover:bg-blue-600',
  width = 'w-full',
  height,
  type = 'button' // Valor predeterminado
}: ButtonProps) => (
  <button
    type={type} // Aplicar el atributo type al elemento button
    onClick={onClick}
    className={`${background} text-white px-4 py-2 rounded-md ${width} ${height} ${hovercolor}`}
  >
    {children}
  </button>
);

export default Button;