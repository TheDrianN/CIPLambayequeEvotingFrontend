import React from 'react';

interface Option {
  value: string;
  label: string;
}

export  interface SelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  size?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  size = 'w-full',
  error
}) => (
  <div className="mb-4">
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`mt-1 block ${size} px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
        error ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
      }`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default Select;
