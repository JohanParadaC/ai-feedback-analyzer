import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useTheme } from '../context/theme-context';
import { Button } from './ui/Button';
import {
    BrainIcon, EyeIcon, EyeOffIcon, AlertIcon, SunIcon, MoonIcon, CheckIcon,
} from './ui/Icons';

/** Debe coincidir con la validación del backend. */
const MIN_PASSWORD = 8;

const Field = ({
    id, label, hint, children,
}: { id: string; label: string; hint?: string; children: React.ReactNode }) => (
    <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
        </label>
        {children}
        {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
);

const inputClasses = `w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800
    outline-none transition-colors placeholder:text-slate-400
    focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
    dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600`;

export const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login, register } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const passwordTooShort = !isLogin && password.length > 0 && password.length < MIN_PASSWORD;
    const passwordsMismatch = !isLogin && confirmPassword.length > 0 && password !== confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isLogin) {
            if (password.length < MIN_PASSWORD) {
                setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
                return;
            }
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden.');
                return;
            }
        }

        setSubmitting(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(companyName, email, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo completar la operación.');
        } finally {
            // El componente se desmonta si el login va bien, pero si falla
            // necesitamos reactivar el botón.
            setSubmitting(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">

            {/* Telón decorativo. aria-hidden para que no lo lea un lector de pantalla. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/20" />
                <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/20" />
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                icon={theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                className="absolute right-4 top-4 !p-2"
            />

            <main className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
                        <BrainIcon className="h-7 w-7" />
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Intelligence Hub
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {isLogin
                            ? 'Accede a tu panel de análisis de feedback.'
                            : 'Crea la cuenta de tu empresa en un minuto.'}
                    </p>
                </div>

                <div className="card p-7">
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {!isLogin && (
                            <Field id="company" label="Nombre de la empresa">
                                <input
                                    id="company"
                                    type="text"
                                    required
                                    autoComplete="organization"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className={inputClasses}
                                    placeholder="Ej. Tienda Pepito"
                                />
                            </Field>
                        )}

                        <Field id="email" label="Correo electrónico">
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClasses}
                                placeholder="tu@empresa.com"
                            />
                        </Field>

                        <Field
                            id="password"
                            label="Contraseña"
                            hint={!isLogin ? `Mínimo ${MIN_PASSWORD} caracteres.` : undefined}
                        >
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-invalid={passwordTooShort}
                                    className={`${inputClasses} pr-11 ${
                                        passwordTooShort ? 'border-rose-400 dark:border-rose-800' : ''
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400
                                               transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                                >
                                    {showPassword
                                        ? <EyeOffIcon className="h-4 w-4" />
                                        : <EyeIcon className="h-4 w-4" />}
                                </button>
                            </div>
                        </Field>

                        {!isLogin && (
                            <Field id="confirm" label="Confirmar contraseña">
                                <div className="relative">
                                    <input
                                        id="confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        aria-invalid={passwordsMismatch}
                                        className={`${inputClasses} pr-11 ${
                                            passwordsMismatch ? 'border-rose-400 dark:border-rose-800' : ''
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    {/* Confirmación inmediata en vez de esperar al envío. */}
                                    {confirmPassword.length > 0 && !passwordsMismatch && (
                                        <span className="absolute inset-y-0 right-0 flex items-center px-3 text-emerald-500">
                                            <CheckIcon className="h-4 w-4" />
                                        </span>
                                    )}
                                </div>
                                {passwordsMismatch && (
                                    <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                                        Las contraseñas no coinciden.
                                    </p>
                                )}
                            </Field>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3
                                           text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                            >
                                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button type="submit" size="lg" loading={submitting} className="w-full">
                            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                        </Button>
                    </form>

                    <div className="mt-6 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700
                                       dark:text-brand-400 dark:hover:text-brand-300"
                        >
                            {isLogin
                                ? '¿No tienes cuenta? Regístrate'
                                : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
