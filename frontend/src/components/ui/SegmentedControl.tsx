import type { ReactNode } from 'react';

export interface Segment<T extends string | number> {
    value: T;
    label: ReactNode;
    /** Texto para lector de pantalla cuando `label` es abreviado o un icono. */
    srLabel?: string;
    /** Clases extra para el estado activo (p. ej. color por sentimiento). */
    activeClassName?: string;
}

interface SegmentedControlProps<T extends string | number> {
    /** Etiqueta accesible del grupo completo. */
    label: string;
    segments: Segment<T>[];
    value: T;
    onChange: (value: T) => void;
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * Grupo de opciones mutuamente excluyentes.
 *
 * Se anuncia como `radiogroup` y cada opción como `radio`: un lector de pantalla
 * dice "opción 2 de 3, seleccionada", cosa que un montón de <button> sueltos no
 * transmite.
 */
export function SegmentedControl<T extends string | number>({
    label,
    segments,
    value,
    onChange,
    size = 'md',
    className = '',
}: SegmentedControlProps<T>) {
    const padding = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs';

    return (
        <div
            role="radiogroup"
            aria-label={label}
            className={`inline-flex items-center gap-0.5 rounded-xl bg-slate-100 p-1
                        dark:bg-slate-800/80 ${className}`}
        >
            {segments.map((segment) => {
                const isActive = segment.value === value;

                return (
                    <button
                        key={String(segment.value)}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => onChange(segment.value)}
                        className={`font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${padding}
                            ${isActive
                                ? segment.activeClassName ??
                                  'bg-white text-brand-700 shadow-sm dark:bg-slate-950 dark:text-brand-300'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                            }`}
                    >
                        {segment.srLabel && <span className="sr-only">{segment.srLabel}</span>}
                        <span aria-hidden={segment.srLabel ? true : undefined}>{segment.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
