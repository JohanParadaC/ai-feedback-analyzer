import type { Sentiment } from '../types';

/**
 * Fuente única de verdad para cómo se representa cada sentimiento.
 *
 * Antes cada componente repetía su propia cadena de ternarios, así que cambiar
 * un color obligaba a tocar cuatro archivos y siempre se escapaba uno.
 */
export interface SentimentStyle {
    label: string;
    emoji: string;
    /** Color hexadecimal, para gráficos y para el informe PDF. */
    hex: string;
    /** Clases del badge (fondo + texto + borde). */
    badge: string;
    /** Superficie suave usada en tarjetas. */
    surface: string;
    text: string;
    border: string;
}

export const SENTIMENT_STYLES: Record<Sentiment, SentimentStyle> = {
    positivo: {
        label: 'Positivo',
        emoji: '✅',
        hex: '#10b981',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
        surface: 'bg-emerald-50/70 dark:bg-emerald-950/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500',
    },
    neutral: {
        label: 'Neutral',
        emoji: '⚠️',
        hex: '#f59e0b',
        badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
        surface: 'bg-amber-50/70 dark:bg-amber-950/30',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-400',
    },
    negativo: {
        label: 'Negativo',
        emoji: '🚨',
        hex: '#f43f5e',
        badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
        surface: 'bg-rose-50/70 dark:bg-rose-950/30',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500',
    },
};

/** Nunca devuelve undefined: un valor inesperado cae en `neutral`. */
export const getSentimentStyle = (sentiment: string): SentimentStyle =>
    SENTIMENT_STYLES[sentiment as Sentiment] ?? SENTIMENT_STYLES.neutral;
