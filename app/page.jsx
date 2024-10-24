'use client';
import React, { useState,useEffect } from 'react';
import Card from "../components/Card";
import InputField from "../components/InputField";
import Button from '../components/Button';
import Cookies from 'js-cookie'; // Librería para manejar cookies
import config from '../config';
import jwt_decode from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const Login = () => {
  const [step, setStep] = useState(1);
  const [colegiatura, setColegiatura] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [colegiaturaError, setColegiaturaError] = useState('');
  const [codigoVerificado, setCodigoVerificado] = useState(''); // Estado para el código de validación
  const [codigo, setCodigo] = useState(''); // Estado para el código de validación
  const [contraseñaError, setContraseñaError] = useState('');
  const [codigoError, setCodigoError] = useState(''); // Estado para el error del código
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // Inicia en 60 segundos
  const [isCounting, setIsCounting] = useState(false); // Estado para controlar cuándo iniciar el conteo
  
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('access_token');  // Obtener el token de la cookie
  
    if (token) {
      try {
        // Decodificar el token directamente con jwt_decode
        const decodedToken = jwt_decode.decode(token);
        // Verificar si el rol es "V"
        if (decodedToken.role === 'V') {
          router.push('/voters/home');

        }else if(decodedToken.role =='A'){

          router.push('/admin/procesoelectoral');
        } else {

          router.push('/404');  // Redirigir si no es autorizado
        }
      } catch (error) {
        router.push('/404');  // Redirigir en caso de error
      }
    } else {
      router.push('/');  // Redirigir si no hay token
    }
  }, [router]);  // Asegúrate de incluir router en las dependencias

  useEffect(() => {
    let timer;
    if (isCounting && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer); // Limpiar el timer cuando el componente se desmonte
  }, [timeLeft, isCounting]);

  const handleLogin = async () => {
    // Resetear errores
    setColegiaturaError('');
    setContraseñaError('');
    setError('');
  
    try {
      // Mostrar SweetAlert de carga
      Swal.fire({
        title: 'Espere por favor...',
        text: 'Estamos verificando sus credenciales',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(); // Mostrar el spinner de carga
        }
      });
  
      // Solicitud a la API para autenticación
      const response = await fetch(`${config.apiBaseUrl}/api/auth/validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: colegiatura,
          password: contraseña,
        }),
      });
  
      const data = await response.json();
      console.log(data);
  
      // Cerrar el SweetAlert de carga
      Swal.close();
  
      if (response.ok) {
        setCodigoVerificado(data.data);
        setStep(2); // Cambiar al siguiente paso
        setTimeLeft(60); // Reiniciar el tiempo a 60 segundos
        setIsCounting(true); // Iniciar el contador
      } else {
        setError(data.message || 'Error al iniciar sesión');
        Swal.fire('Error', data.message || 'Error al iniciar sesión', 'error');
      }
    } catch (err) {
      // Cerrar el SweetAlert de carga en caso de error
      Swal.close();
      setError('Error de red o servidor');
      Swal.fire('Error', 'Error de red o servidor', 'error');
    }
  };

  const handleCodigoValidacion = async () => {
    if (codigo !== codigoVerificado) {
      setCodigoError('Código incorrecto');
      setError('Código incorrecto'); // Mensaje de error general
    } else {
     
      setCodigoError(''); // Resetea el error
      setError(''); // Resetea el error general

      try {
        // Solicitud a la API para autenticación
        const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document:colegiatura,
            password: contraseña,
          }),
        });
  
        const data = await response.json();
  
        console.log(data)
  
        if (response.ok) {
           

              Cookies.set('access_token', data.access_token, {
                expires: 1 / 24, // 1 hora (1 día dividido entre 24)                //secure: true, // La cookie solo se enviará a través de conexiones HTTPS
                sameSite: 'Strict',
              });

            console.log(data.access_token)

            const decodedToken = jwt_decode.decode(data.access_token);

            if(decodedToken.role =='V'){
              router.push('/voters/home');

            }else if(decodedToken.role =='A'){
              router.push('/admin/procesoelectoral');
            }else{
              router.push('/404');
            }




        } else {
          setError(data.message || 'Error al iniciar sesión');
        }
      } catch (err) {
        setError('Error de red o servidor');
      }
    }

    
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      {step === 1 && (
        <Card className="flex-1 max-w-md">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-4">Bienvenido</h2>
              <p className="mb-4">Ingresa tus credenciales</p>
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
              
            </div>

            <div className="text-center mb-4">
              <img src="https://www.cip.org.pe/images/LOGO_CIP.png" alt="Logo" className="mx-auto w-20 h-20" />
            </div>
            
          </div>

          <div>
          <p className="mb-4">Ingresa el codigo de verificación enviado a su correo, tiene duracion de 1 minutos</p>
              
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

          {timeLeft > 0 ? (
            <p className="text-sm text-neutral-950 p-2 text-center bg-amber-200 mb-4">El código expira en: {timeLeft} segundos</p>
          ) : (
            <p className="text-sm text-red-500 p-2 text-center bg-amber-200 mb-4">El código ha expirado.</p>
          )}   

                    <p className="text-sm text-blue-500 cursor-pointer mb-5" onClick={handleLogin}>
                ¿No recibiste el código? <span className="underline">Reenviar código</span>
              </p> 

          <Button onClick={handleCodigoValidacion}>Validar</Button>
        </Card>
      )}
    </div>
  );
};

export default Login;
