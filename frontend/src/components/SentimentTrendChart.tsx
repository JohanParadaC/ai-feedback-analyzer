import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { AnalysisResult } from '../types';

interface SentimentTrendChartProps {
    history: AnalysisResult[];
}

export const SentimentTrendChart = ({ history }: SentimentTrendChartProps) => {
    const [days, setDays] = useState<number>(30); // Filtro por defecto: 1 Mes

    const chartData = useMemo(() => {
        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - days);

        // 1. Filtramos por la fecha seleccionada
        const filtered = history.filter(item => new Date(item.date) >= pastDate);

        // 2. Agrupamos por día
        const grouped = filtered.reduce((acc, curr) => {
            const dateStr = new Date(curr.date).toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = { date: dateStr, positivo: 0, neutral: 0, negativo: 0 };
            }
            acc[dateStr][curr.sentiment] += 1;
            return acc;
        }, {} as Record<string, any>);

        // 3. Lo convertimos en array y lo ordenamos de más antiguo a más reciente
        return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [history, days]);

    if (history.length === 0) return null;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-12 mt-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tendencia de Sentimiento</h2>
                    <p className="text-xs text-slate-500">Evolución en el tiempo</p>
                </div>

                {/* Los botones de filtro de tiempo */}
                <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    {[
                        { label: '1M', val: 30 },
                        { label: '3M', val: 90 },
                        { label: '6M', val: 180 },
                        { label: '1A', val: 365 }
                    ].map(btn => (
                        <button
                            key={btn.label}
                            onClick={() => setDays(btn.val)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${days === btn.val ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {/* Degradados mágicos */}
                            <linearGradient id="colorPositivo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNegativo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        {/* ✨ CAMBIO AQUÍ: allowDecimals={false} para forzar números enteros en el eje Y ✨ */}
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />

                        <Area type="monotone" dataKey="positivo" name="Positivo" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPositivo)" />
                        <Area type="monotone" dataKey="neutral" name="Neutral" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorNeutral)" />
                        <Area type="monotone" dataKey="negativo" name="Negativo" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorNegativo)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};