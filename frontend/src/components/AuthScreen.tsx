import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
    // 1. Estados para el formulario
    const [isLogin, setIsLogin] = useState(true); // ¿Estamos en Login o en Registro?
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');

    // ✨ NUEVOS ESTADOS PARA MEJORAR LA UX
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // 2. Traemos las funciones de nuestra Billetera (Context)
    const { login, register } = useAuth();

    // 3. Función que se ejecuta al darle al botón "Entrar" o "Registrarse"
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Limpiamos errores anteriores

        // ✨ NUEVA VALIDACIÓN: Si es registro, las contraseñas deben coincidir
        if (!isLogin && password !== confirmPassword) {
            setError('Las contraseñas no coinciden. Revisa de nuevo.');
            return;
        }

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(companyName, email, password);
            }
        } catch (err: any) {
            setError(err.message); // Si el backend nos rechaza, mostramos el error
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

                {/* Logo / Título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                        🧠
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Intelligence Hub
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">
                        {isLogin ? 'Bienvenido de nuevo a tu panel de control.' : 'Crea tu cuenta empresarial ahora.'}
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
                            <input
                                type="text"
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Ej. Tienda Pepito"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="tu@empresa.com"
                        />
                    </div>

                    {/* ✨ CAMPO DE CONTRASEÑA MEJORADO CON BOTÓN DE VER/OCULTAR */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* ✨ CAMPO DE CONFIRMAR CONTRASEÑA (Solo visible al registrarse) */}
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {/* Mensaje de Error (Si el backend nos rebota) */}
                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
                            🚨 {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-md mt-4"
                    >
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                </form>

                {/* Botón para cambiar entre Login y Registro */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setConfirmPassword(''); // Limpiamos la confirmación al cambiar de modo
                            setPassword('');
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>

            </div>
        </div>
    );
};