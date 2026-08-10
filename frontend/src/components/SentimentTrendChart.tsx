import { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import type { AnalysisResult } from '../types';
import { useTheme } from '../context/theme-context';
import { SegmentedControl } from './ui/SegmentedControl';
import { SENTIMENT_STYLES } from '../lib/sentiment';

interface SentimentTrendChartProps {
    history: AnalysisResult[];
}

interface TrendPoint {
    date: string;
    label: string;
    positivo: number;
    neutral: number;
    negativo: number;
}

const RANGES = [
    { label: '1M', val: 30 },
    { label: '3M', val: 90 },
    { label: '6M', val: 180 },
    { label: '1A', val: 365 },
];

export const SentimentTrendChart = ({ history }: SentimentTrendChartProps) => {
    const [days, setDays] = useState<number>(30);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const chartData = useMemo<TrendPoint[]>(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const grouped = history
            .filter(item => new Date(item.date) >= cutoff)
            .reduce((acc, curr) => {
                // Agrupamos por día local. `toISOString` convierte a UTC y, según
                // la zona horaria, movía las reseñas de la noche al día siguiente.
                const d = new Date(curr.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                if (!acc[key]) {
                    acc[key] = {
                        date: key,
                        label: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
                        positivo: 0, neutral: 0, negativo: 0,
                    };
                }
                acc[key][curr.sentiment] += 1;
                return acc;
            }, {} as Record<string, TrendPoint>);

        return Object.values(grouped).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [history, days]);

    if (history.length === 0) return null;

    const axisColor = isDark ? '#64748b' : '#94a3b8';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';

    // `overflow-hidden`: ver la nota en MetricsPanel sobre el contenedor de
    // tooltip inactivo de Recharts y el scroll horizontal que provoca.
    return (
        <section className="card overflow-hidden p-5" aria-labelledby="trend-title">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 id="trend-title" className="section-label">Tendencia de sentimiento</h2>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        Evolución diaria del volumen por categoría
                    </p>
                </div>

                <SegmentedControl
                    label="Rango temporal del gráfico"
                    value={days}
                    onChange={setDays}
                    size="sm"
                    segments={RANGES.map(r => ({ value: r.val, label: r.label }))}
                />
            </div>

            {chartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                    No hay reseñas en este rango de fechas.
                </div>
            ) : (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                            <defs>
                                {(['positivo', 'neutral', 'negativo'] as const).map(key => (
                                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={SENTIMENT_STYLES[key].hex} stopOpacity={0.28} />
                                        <stop offset="95%" stopColor={SENTIMENT_STYLES[key].hex} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: axisColor }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={16}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: axisColor }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${gridColor}`,
                                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                    color: isDark ? '#e2e8f0' : '#0f172a',
                                    fontSize: '12px',
                                    boxShadow: '0 12px 32px -8px rgb(15 23 42 / 0.18)',
                                }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />

                            {(['positivo', 'neutral', 'negativo'] as const).map(key => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={SENTIMENT_STYLES[key].label}
                                    stroke={SENTIMENT_STYLES[key].hex}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#grad-${key})`}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
};
