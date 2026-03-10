import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AnalysisResult } from '../types';

interface PainPointsChartProps {
    history: AnalysisResult[];
}

export const PainPointsChart = ({ history }: PainPointsChartProps) => {
    // 1. Extraemos y contamos cuántas veces se repite cada queja
    const complaintsCount = history.reduce((acc, curr) => {
        if (curr.key_complaint) {
            // Normalizamos a minúsculas para que "Envío lento" y "envío lento" sumen juntos
            const complaint = curr.key_complaint.toLowerCase();
            acc[complaint] = (acc[complaint] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // 2. Lo convertimos en un array, lo ordenamos de mayor a menor y sacamos el Top 5
    const chartData = Object.entries(complaintsCount)
        .map(([name, value]) => ({
            // Capitalizamos la primera letra para que se vea bonito
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Si no hay quejas en el historial, no mostramos nada
    if (chartData.length === 0) return null;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-64 flex flex-col mt-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Top 5 Áreas de Mejora (Pain Points) 🚨
            </h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical" // Lo hacemos horizontal para leer bien el texto
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 12 }}
                        width={120}
                    />
                    <Tooltip
                        formatter={(value) => [`${value} Menciones`, 'Frecuencia']}
                        cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#f43f5e" /> // Color rojo-rosa para problemas
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};