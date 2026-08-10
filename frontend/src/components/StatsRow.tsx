import type { ReactNode } from 'react';
import { InboxIcon, SparklesIcon, TrendingUpIcon, AlertIcon } from './ui/Icons';

interface StatCardProps {
    label: string;
    value: ReactNode;
    hint?: string;
    icon: ReactNode;
    /** Color de acento del icono. */
    accent: string;
    loading?: boolean;
}

const StatCard = ({ label, value, hint, icon, accent, loading }: StatCardProps) => (
    <div className="card p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="section-label">{label}</p>
                {loading ? (
                    <div className="skeleton mt-2 h-8 w-20" />
                ) : (
                    <p className="tabular mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </p>
                )}
                {hint && (
                    <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{hint}</p>
                )}
            </div>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                {icon}
            </span>
        </div>
    </div>
);

interface StatsRowProps {
    totalAnalyzed: number;
    npsScore: number;
    positiveRate: number;
    topPainPoint: string | null;
    loading?: boolean;
}

/** Etiqueta cualitativa del NPS: un número entre -100 y 100 no dice nada por sí solo. */
const npsLabel = (score: number): string => {
    if (score >= 50) return 'Excelente';
    if (score >= 0) return 'Bueno';
    if (score >= -50) return 'Necesita mejora';
    return 'Crítico';
};

export const StatsRow = ({
    totalAnalyzed, npsScore, positiveRate, topPainPoint, loading,
}: StatsRowProps) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
            label="Reseñas analizadas"
            value={totalAnalyzed.toLocaleString('es')}
            icon={<InboxIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
            accent="bg-brand-50 dark:bg-brand-950/60"
            loading={loading}
        />
        <StatCard
            label="NPS"
            value={npsScore > 0 ? `+${npsScore}` : npsScore}
            hint={npsLabel(npsScore)}
            icon={<TrendingUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
            accent="bg-indigo-50 dark:bg-indigo-950/60"
            loading={loading}
        />
        <StatCard
            label="Sentimiento positivo"
            value={`${positiveRate}%`}
            hint="del total de reseñas"
            icon={<SparklesIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            accent="bg-emerald-50 dark:bg-emerald-950/60"
            loading={loading}
        />
        <StatCard
            label="Queja principal"
            value={
                <span className="block truncate text-base" title={topPainPoint ?? undefined}>
                    {topPainPoint ?? 'Ninguna'}
                </span>
            }
            hint={topPainPoint ? 'la más repetida' : 'sin quejas registradas'}
            icon={<AlertIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
            accent="bg-rose-50 dark:bg-rose-950/60"
            loading={loading}
        />
    </div>
);
