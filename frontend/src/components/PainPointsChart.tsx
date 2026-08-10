import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnalysisResult } from '../types';
import { useTheme } from '../context/theme-context';

interface PainPointsChartProps {
    history: AnalysisResult[];
}

export const PainPointsChart = ({ history }: PainPointsChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const chartData = useMemo(() => {
        const counts = history.reduce((acc, curr) => {
            if (!curr.key_complaint) return acc;
            // Agrupamos ignorando mayúsculas para que "Envío lento" y "envío
            // lento" cuenten como la misma queja.
            const key = curr.key_complaint.toLowerCase();
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [history]);

    if (chartData.length === 0) return null;

    // `overflow-hidden`: ver la nota en MetricsPanel sobre el contenedor de
    // tooltip inactivo de Recharts y el scroll horizontal que provoca.
    return (
        <section className="card flex h-72 flex-col overflow-hidden p-5" aria-labelledby="pain-title">
            <div className="mb-3">
                <h2 id="pain-title" className="section-label">Principales áreas de mejora</h2>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {chartData.length === 1
                        ? 'La queja más repetida'
                        : `Las ${chartData.length} quejas más repetidas`}
                </p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
                >
                    <XAxis type="number" hide allowDecimals={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 11 }}
                        width={130}
                    />
                    <Tooltip
                        formatter={(value) => [`${Number(value) || 0} menciones`, 'Frecuencia']}
                        cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                        contentStyle={{
                            borderRadius: '0.75rem',
                            border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                            backgroundColor: isDark ? '#0f172a' : '#ffffff',
                            color: isDark ? '#e2e8f0' : '#0f172a',
                            fontSize: '12px',
                        }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                        fill="#f43f5e"
                        // Una sola escala de color: el rango de la barra ya
                        // comunica la magnitud, variar el tono no aporta dato.
                        fillOpacity={0.85}
                    />
                </BarChart>
            </ResponsiveContainer>
        </section>
    );
};
