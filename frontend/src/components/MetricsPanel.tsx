import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MetricsPanelProps {
    chartData: any[];
    npsScore: number;
}

export const MetricsPanel = ({ chartData, npsScore }: MetricsPanelProps) => {
    if (chartData.length === 0) return null;

    // Función para determinar el color y texto basado en el NPS
    const getNpsStatus = (score: number) => {
        if (score >= 50) return { color: 'text-emerald-500', bg: 'bg-emerald-500', text: 'Excelente' };
        if (score >= 0) return { color: 'text-blue-500', bg: 'bg-blue-500', text: 'Bueno' };
        if (score >= -50) return { color: 'text-amber-500', bg: 'bg-amber-400', text: 'Necesita Mejora' };
        return { color: 'text-rose-500', bg: 'bg-rose-500', text: 'Crítico' };
    };

    const status = getNpsStatus(npsScore);

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            Net Promoter Score
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-1">Métrica de lealtad (-100 a +100)</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-black ${status.color}`}>
                            {npsScore > 0 ? `+${npsScore}` : npsScore}
                        </span>
                    </div>
                </div>

                {/* ✨ CORRECCIÓN CSS: Agregamos "relative" al contenedor principal para atrapar la flechita */}
                <div className="relative w-full h-2 mt-4 mb-2 bg-slate-100 rounded-full">
                    {/* Los colores van en una capa separada con overflow-hidden para no cortar la flecha */}
                    <div className="absolute inset-0 flex rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: '25%' }}></div>
                        <div className="h-full bg-amber-400" style={{ width: '25%' }}></div>
                        <div className="h-full bg-blue-500" style={{ width: '25%' }}></div>
                        <div className="h-full bg-emerald-500" style={{ width: '25%' }}></div>
                    </div>

                    {/* El indicador negro que ahora sí se queda en su lugar exacto */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-slate-800 rounded-sm shadow-md transition-all duration-1000 z-10"
                        style={{ left: `calc(${((npsScore + 100) / 200) * 100}% - 3px)` }}
                    ></div>
                </div>

                <div className="text-right mt-1 mb-3">
                    <span className={`text-[11px] font-bold ${status.color}`}>{status.text}</span>
                </div>

                {/* ✨ NUEVO: Cajita explicativa del NPS */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500 leading-relaxed">
                    <strong className="text-slate-700">¿Qué es el NPS?</strong> Se calcula restando el % de clientes Detractores (notas 1-6) al % de Promotores (notas 9-10). Es la métrica estándar que usan las grandes empresas para medir la satisfacción.
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-56 flex flex-col">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">Volumen de Reseñas</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="45%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} Reseña(s)`, 'Cantidad']} />
                        <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};