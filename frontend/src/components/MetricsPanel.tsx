import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MetricsPanelProps {
    chartData: any[];
    averageScore: string | number;
}

export const MetricsPanel = ({ chartData, averageScore }: MetricsPanelProps) => {
    if (chartData.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Puntaje Total</h2>
                    <span className="text-base font-bold text-slate-800">{averageScore} <span className="text-xs text-slate-400 font-normal">/ 10</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${Number(averageScore) >= 7 ? 'bg-emerald-500' :
                                Number(averageScore) >= 4 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                        style={{ width: `${(Number(averageScore) / 10) * 100}%` }}
                    ></div>
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