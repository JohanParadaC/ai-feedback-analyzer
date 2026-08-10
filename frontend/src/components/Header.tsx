import { useAuth } from '../context/auth-context';
import { useTheme } from '../context/theme-context';
import { Button } from './ui/Button';
import {
    BrainIcon, BuildingIcon, LogOutIcon, MoonIcon, SunIcon,
} from './ui/Icons';

/**
 * Barra superior fija de la aplicación.
 *
 * Antes había dos filas de cabecera compitiendo (una con la empresa y el filtro,
 * otra con el título y las métricas). Se unifican en una sola barra: identidad a
 * la izquierda, acciones de cuenta a la derecha.
 */
export const Header = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header
            className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-lg
                       dark:border-slate-800 dark:bg-slate-950/85 no-print"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

                {/* Identidad del producto */}
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                                   bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm"
                    >
                        <BrainIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
                            Intelligence Hub
                        </h1>
                        <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
                            Análisis de feedback con IA
                        </p>
                    </div>
                </div>

                {/* Cuenta y preferencias */}
                <div className="flex items-center gap-2">
                    {user && (
                        <span
                            className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50
                                       px-3 py-1.5 text-xs font-semibold text-slate-600
                                       dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:inline-flex"
                        >
                            <BuildingIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="max-w-[14rem] truncate">{user.companyName}</span>
                        </span>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        // Un botón solo con icono no tiene texto que leer: el
                        // aria-label es lo único que lo hace usable con lector.
                        aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                        icon={theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                        className="!p-2"
                    />

                    <Button
                        variant="danger"
                        size="sm"
                        onClick={logout}
                        icon={<LogOutIcon className="h-3.5 w-3.5" />}
                    >
                        <span className="hidden sm:inline">Salir</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};
