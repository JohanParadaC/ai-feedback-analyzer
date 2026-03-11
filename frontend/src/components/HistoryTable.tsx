import type { AnalysisResult } from '../types';

interface HistoryTableProps {
    history: AnalysisResult[];
}

export const HistoryTable = ({ history }: HistoryTableProps) => {
    if (history.length === 0) return null;

    return (
        <section className="lg:col-span-12 mt-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Registro de Reseñas</h2>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        {history.length} analizadas
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                {/* ✨ CAMBIO: Le quitamos la palabra "(Fragmento)" al título ✨ */}
                                <th className="p-4 pl-6 font-semibold w-1/2">Reseña</th>
                                <th className="p-4 font-semibold">Sentimiento</th>
                                <th className="p-4 font-semibold">Score</th>
                                <th className="p-4 pr-6 font-semibold">Etiquetas Extraídas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    {/* ✨ EL CAMBIO MAGNÍFICO ✨ 
                                        Quitamos "truncate" y "max-w-...", ahora el texto respirará 
                                        y hará saltos de línea automáticos (whitespace-normal) */}
                                    <td className="p-4 pl-6 text-sm text-slate-700 font-medium whitespace-normal" title={item.text}>
                                        "{item.text}"
                                    </td>

                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.sentiment === 'positivo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                            item.sentiment === 'negativo' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                                'bg-amber-100 text-amber-800 border border-amber-200'
                                            }`}>
                                            <span className="mr-1">
                                                {item.sentiment === 'positivo' ? '✅' : item.sentiment === 'negativo' ? '🚨' : '⚠️'}
                                            </span>
                                            <span className="capitalize">{item.sentiment}</span>
                                        </span>
                                    </td>

                                    <td className="p-4 text-sm font-bold text-slate-700">
                                        {item.score} <span className="text-slate-400 font-normal">/ 10</span>
                                    </td>

                                    <td className="p-4 pr-6">
                                        <div className="flex gap-2 flex-wrap">
                                            {item.key_highlight && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                                                    🌟 {item.key_highlight}
                                                </span>
                                            )}
                                            {item.key_complaint && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                                                    🚨 {item.key_complaint}
                                                </span>
                                            )}
                                            {!item.key_highlight && !item.key_complaint && (
                                                <span className="text-xs text-slate-400 italic">Sin etiquetas detectadas</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};