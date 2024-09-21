'use client';

import React, { useState } from 'react';
import Card from "../components/Card";
import InputField from "../components/InputField";
import ErrorMessage from "../components/ErrorMessage";
import Button from '../components/Button';

const Login = () => {
  const [step, setStep] = useState(1);
  const [colegiatura, setColegiatura] = useState(''); // Estado para el número de colegiatura
  const [codigo, setCodigo] = useState('#123AD90'); // Estado para el código de validación
  const [contraseña, setContraseña] = useState('');
  const [colegiaturaError, setColegiaturaError] = useState(''); // Estado para el error de colegiatura
  const [contraseñaError, setContraseñaError] = useState(''); // Estado para el error de contraseña
  const [codigoError, setCodigoError] = useState(''); // Estado para el error del código
  const [error, setError] = useState(''); // Estado para manejar errores generales

  const handleLogin = () => {
    let isValid = true;

    // Resetear errores
    setColegiaturaError('');
    setContraseñaError('');
    setError('');

    // Validación de prueba con valores estáticos
    if (colegiatura !== '12345') {
      setColegiaturaError('Número de colegiatura incorrecto');
      isValid = false;
    }

    if (contraseña !== '123') {
      setContraseñaError('Contraseña Incorrecta');
      isValid = false;
    }

    if (isValid) {
      setStep(2); // Cambia a la segunda tarjeta
    } else {
      setError('Verificar Datos'); // Mensaje de error general
    }
  };

  const handleCodigoValidacion = () => {
    if (codigo !== '#123AD90') {
      setCodigoError('Código incorrecto');
      setError('Código incorrecto'); // Mensaje de error general
    } else {
      alert('Validación exitosa!');
      setCodigoError(''); // Resetea el error
      setError(''); // Resetea el error general
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      {step === 1 && (
        <Card className="flex-1 max-w-md">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-4">Bienvenido</h2>
              <p className="mb-4">Ingresa tus datos</p>
            </div>

            <div className="text-center mb-4">
              <img src="https://www.cip.org.pe/images/LOGO_CIP.png" alt="Logo" className="mx-auto w-20 h-20" />
            </div>
          </div>

          <InputField
            placeholder="Número de colegiatura"
            id="colegiatura"
            type="text"
            sizeY="py-3"
            value={colegiatura}
            onChange={(e) => setColegiatura(e.target.value)}
            error={colegiaturaError}
          />

          <InputField
            placeholder="Contraseña"
            id="contraseña"
            value={contraseña}
            type="password"
            sizeY="py-3"
            onChange={(e) => setContraseña(e.target.value)}
            error={contraseñaError}
          />
          <hr />
      
          <Button onClick={handleLogin}>Iniciar Sesión</Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="flex-1 max-w-md">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-4">Bienvenido</h2>
              <p className="mb-4">Ingresa tus datos</p>
            </div>

            <div className="text-center mb-4">
              <img src="https://www.cip.org.pe/images/LOGO_CIP.png" alt="Logo" className="mx-auto w-20 h-20" />
            </div>
          </div>

          <InputField
            placeholder="Ingrese el código enviado a su correo personal"
            id="codigo"
            type="text"
            sizeY="py-3"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            error={codigoError}
          />

          <Button onClick={handleCodigoValidacion}>Validar</Button>
        </Card>
      )}
    </div>
  );
};

export default Login;
