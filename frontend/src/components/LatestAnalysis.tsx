import type { AnalysisResult } from '../types';
import { getSentimentStyle } from '../lib/sentiment';
import { SentimentBadge } from './ui/SentimentBadge';
import { SparklesIcon, AlertIcon, InboxIcon } from './ui/Icons';

interface LatestAnalysisProps {
    latestResult: AnalysisResult | null;
    loading: boolean;
}

/** Barra 0–10 que hace comparable el score de un vistazo. */
const ScoreMeter = ({ score, color }: { score: number; color: string }) => (
    <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={`Puntuación ${score} de 10`}
    >
        <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${score * 10}%`, backgroundColor: color }}
        />
    </div>
);

const InsightCard = ({
    icon, title, body, tone,
}: { icon: React.ReactNode; title: string; body: string; tone: 'positive' | 'negative' }) => {
    const tones = {
        positive: 'border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/25',
        negative: 'border-rose-200/70 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/25',
    };
    const iconTones = {
        positive: 'text-emerald-600 dark:text-emerald-400',
        negative: 'text-rose-600 dark:text-rose-400',
    };

    return (
        <div className={`rounded-xl border p-4 ${tones[tone]}`}>
            <div className={`mb-1.5 flex items-center gap-2 ${iconTones[tone]}`}>
                {icon}
                <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{body}</p>
        </div>
    );
};

export const LatestAnalysis = ({ latestResult, loading }: LatestAnalysisProps) => {
    // Mientras llega el primer resultado mostramos un esqueleto, no un hueco vacío.
    if (loading && !latestResult) {
        return (
            <section className="card p-6" aria-busy="true">
                <div className="skeleton h-4 w-32" />
                <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="skeleton h-20" />
                    <div className="skeleton h-20" />
                </div>
                <div className="skeleton mt-4 h-20" />
                <div className="skeleton mt-4 h-20" />
            </section>
        );
    }

    if (!latestResult) {
        return (
            <section
                className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl
                           border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center
                           dark:border-slate-800 dark:bg-slate-900/30"
            >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <InboxIcon className="h-6 w-6 text-slate-400" />
                </span>
                <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                        Aún no hay análisis
                    </p>
                    <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                        Pega una reseña en el formulario o sube un CSV para ver aquí el desglose de la IA.
                    </p>
                </div>
            </section>
        );
    }

    const style = getSentimentStyle(latestResult.sentiment);

    return (
        <section
            className="card animate-[var(--animate-slide-up)] overflow-hidden"
            aria-labelledby="latest-title"
        >
            {/* Franja de color como señal rápida del sentimiento.
                Antes se intentaba con borderTopColor y una clase de Tailwind,
                que no es un color CSS válido: la franja no llegaba a pintarse. */}
            <div className="h-1 w-full" style={{ backgroundColor: style.hex }} />

            <div className="p-6">
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <h2 id="latest-title" className="section-label">Último análisis</h2>
                    <time
                        className="text-xs text-slate-400 dark:text-slate-500"
                        dateTime={latestResult.date}
                    >
                        {new Date(latestResult.date).toLocaleDateString('es', {
                            day: 'numeric', month: 'short', year: 'numeric',
                        })}
                    </time>
                </div>

                <blockquote
                    className="mb-5 border-l-2 pl-4 text-sm italic leading-relaxed text-slate-600 dark:text-slate-300"
                    style={{ borderColor: style.hex }}
                >
                    “{latestResult.text}”
                </blockquote>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className={`rounded-xl p-4 ${style.surface}`}>
                        <span className="section-label">Sentimiento</span>
                        <div className="mt-2">
                            <SentimentBadge sentiment={latestResult.sentiment} />
                        </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                        <span className="section-label">Puntuación</span>
                        <div className="tabular mt-1 text-lg font-bold text-slate-900 dark:text-white">
                            {latestResult.score}
                            <span className="text-sm font-normal text-slate-400"> / 10</span>
                        </div>
                        <ScoreMeter score={latestResult.score} color={style.hex} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <InsightCard
                        tone="positive"
                        icon={<SparklesIcon className="h-4 w-4" />}
                        title="Punto fuerte"
                        body={latestResult.key_highlight || 'No se mencionó nada destacable.'}
                    />
                    <InsightCard
                        tone="negative"
                        icon={<AlertIcon className="h-4 w-4" />}
                        title="Área de mejora"
                        body={latestResult.key_complaint || 'No se detectó ningún problema.'}
                    />
                </div>
            </div>
        </section>
    );
};
