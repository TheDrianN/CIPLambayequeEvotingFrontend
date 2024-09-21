import React from 'react';

interface InputFieldProps {
  placeholder?: string;  // La prop placeholder es opcional
  id: string;
  type?: string;         // type es opcional, por defecto 'text'
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement |HTMLSelectElement>) => void;
  error?: string;        // La prop error es opcional
  size?: string;         // La prop size es opcional, con un valor predeterminado
  sizeY?: string;        // La prop sizeY es opcional, con un valor predeterminado
  asTextarea?: boolean;  // La prop asTextarea es opcional
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  id,
  type = 'text',        // Valor por defecto para type
  value,
  onChange,
  error,
  size = 'w-full',
  sizeY = 'py-2',
  asTextarea = false
}) => (
  <div className="mb-4">
    {asTextarea ? (
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`mt-1 block ${size} px-3 ${sizeY} border rounded-md shadow-sm focus:outline-none sm:text-sm ${
          error ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
    ) : (
      <input
        type={type}
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`mt-1 block ${size} px-3 ${sizeY} border rounded-md shadow-sm focus:outline-none sm:text-sm ${
          error ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default InputField;
