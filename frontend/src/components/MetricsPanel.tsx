import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ChartDatum } from '../types';
import { useTheme } from '../context/theme-context';

interface MetricsPanelProps {
    chartData: ChartDatum[];
    npsScore: number;
    total: number;
}

const getNpsStatus = (score: number) => {
    if (score >= 50) return { color: 'text-emerald-600 dark:text-emerald-400', text: 'Excelente' };
    if (score >= 0) return { color: 'text-brand-600 dark:text-brand-400', text: 'Bueno' };
    if (score >= -50) return { color: 'text-amber-600 dark:text-amber-400', text: 'Necesita mejora' };
    return { color: 'text-rose-600 dark:text-rose-400', text: 'Crítico' };
};

export const MetricsPanel = ({ chartData, npsScore, total }: MetricsPanelProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (chartData.length === 0) return null;

    const status = getNpsStatus(npsScore);
    // El indicador se sitúa en una escala de -100..100 mapeada a 0..100%.
    const markerPosition = ((npsScore + 100) / 200) * 100;

    const tooltipStyle = {
        borderRadius: '0.75rem',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#0f172a',
        fontSize: '12px',
        boxShadow: '0 12px 32px -8px rgb(15 23 42 / 0.18)',
    };

    return (
        <div className="flex flex-col gap-4">

            {/* ── Net Promoter Score ── */}
            <section className="card p-5" aria-labelledby="nps-title">
                <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <h2 id="nps-title" className="section-label">Net Promoter Score</h2>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            Lealtad de marca, de −100 a +100
                        </p>
                    </div>
                    <span className={`tabular text-3xl font-bold leading-none ${status.color}`}>
                        {npsScore > 0 ? `+${npsScore}` : npsScore}
                    </span>
                </div>

                <div
                    className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800"
                    role="meter"
                    aria-valuenow={npsScore}
                    aria-valuemin={-100}
                    aria-valuemax={100}
                    aria-label={`NPS ${npsScore}, ${status.text}`}
                >
                    <div className="absolute inset-0 flex overflow-hidden rounded-full opacity-90">
                        <div className="h-full w-1/4 bg-rose-500" />
                        <div className="h-full w-1/4 bg-amber-400" />
                        <div className="h-full w-1/4 bg-brand-500" />
                        <div className="h-full w-1/4 bg-emerald-500" />
                    </div>
                    <div
                        className="absolute top-1/2 z-10 h-4 w-1.5 -translate-y-1/2 rounded-sm bg-slate-900
                                   shadow-md ring-2 ring-white transition-[left] duration-700
                                   dark:bg-white dark:ring-slate-900"
                        style={{ left: `calc(${markerPosition}% - 3px)` }}
                    />
                </div>

                <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    <span>−100</span>
                    <span className={`font-bold ${status.color}`}>{status.text}</span>
                    <span>+100</span>
                </div>

                <details className="group mt-4">
                    <summary
                        className="cursor-pointer list-none text-xs font-semibold text-slate-500
                                   hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <span className="inline-block transition-transform group-open:rotate-90">›</span>{' '}
                        ¿Cómo se calcula el NPS?
                    </summary>
                    <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                        Es el porcentaje de <strong className="text-slate-700 dark:text-slate-200">promotores</strong> (nota 9–10)
                        menos el de <strong className="text-slate-700 dark:text-slate-200">detractores</strong> (nota 1–6).
                        Las notas 7–8 son pasivas y no puntúan.
                    </p>
                </details>
            </section>

            {/* ── Reparto por sentimiento ── */}
            {/* `overflow-hidden` recorta el contenedor de tooltip inactivo que
                Recharts deja aparcado fuera del viewport y que, si no, estira el
                ancho del documento y provoca scroll horizontal. Los tooltips
                activos se dibujan dentro del área del gráfico, así que no se ven
                afectados. */}
            <section className="card flex h-64 flex-col overflow-hidden p-5" aria-labelledby="volume-title">
                <h2 id="volume-title" className="section-label mb-1">Reparto por sentimiento</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={42}
                            outerRadius={64}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(value) => {
                                const count = Number(value) || 0;
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                return [`${count} (${pct}%)`, 'Reseñas'];
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={24}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </section>
        </div>
    );
};
