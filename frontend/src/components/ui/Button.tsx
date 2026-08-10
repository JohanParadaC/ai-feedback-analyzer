import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { SpinnerIcon } from './Icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    /** Muestra spinner y desactiva el botón. */
    loading?: boolean;
    icon?: ReactNode;
    children?: ReactNode;
}

const variants: Record<Variant, string> = {
    primary:
        'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm ' +
        'dark:bg-brand-500 dark:hover:bg-brand-400 dark:active:bg-brand-600',
    secondary:
        'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 ' +
        'dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600',
    ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 ' +
        'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    success:
        'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm ' +
        'dark:bg-emerald-600 dark:hover:bg-emerald-500',
    danger:
        'bg-white text-slate-600 border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 ' +
        'dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900',
};

const sizes: Record<Size, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-sm px-5 py-3 gap-2 rounded-xl',
};

export const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            disabled={isDisabled}
            // aria-busy avisa al lector de pantalla de que la acción sigue en curso.
            aria-busy={loading || undefined}
            className={`inline-flex items-center justify-center font-semibold transition-colors duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
                        ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading ? <SpinnerIcon /> : icon}
            {children}
        </button>
    );
};
