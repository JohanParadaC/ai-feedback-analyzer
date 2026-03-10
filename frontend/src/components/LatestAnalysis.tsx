import type { AnalysisResult } from '../types';
interface LatestAnalysisProps {
    latestResult: AnalysisResult | null;
    loading: boolean;
    theme: Record<string, any>;
}

export const LatestAnalysis = ({ latestResult, loading, theme }: LatestAnalysisProps) => {
    // Estado vacío: Cuando no hay reseñas todavía
    if (!latestResult && !loading) {
        return (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                <p className="text-sm font-medium">Esperando datos para construir el Dashboard...</p>
            </div>
        );
    }

    // Si está cargando y no hay resultado previo, no mostramos nada
    if (!latestResult) return null;

    const currentTheme = theme[latestResult.sentiment];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in border-t-4" style={{ borderTopColor: currentTheme.text.replace('text-', '') }}>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 border-b pb-3">Último Análisis</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-xl border-l-4 ${currentTheme.border} ${currentTheme.bg}`}>
                    <span className="text-xs font-bold text-slate-500 uppercase">Sentimiento</span>
                    <div className={`mt-1 text-lg font-bold capitalize flex items-center gap-2 ${currentTheme.text}`}>
                        {latestResult.sentiment} {currentTheme.icon}
                    </div>
                </div>
                <div className={`p-4 rounded-xl border-l-4 ${currentTheme.border} bg-slate-50`}>
                    <span className="text-xs font-bold text-slate-500 uppercase">Puntaje de la reseña</span>
                    <div className="mt-1 text-lg font-bold text-slate-800">
                        {latestResult.score} <span className="text-sm text-slate-500 font-normal">/ 10</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-indigo-50/50">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-indigo-600">🌟</span>
                        <span className="text-xs font-bold text-indigo-800 uppercase">Punto Fuerte Destacado</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-1 pl-6">
                        {latestResult.key_highlight || "Nada destacable mencionado."}
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-rose-50/50">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-rose-600">🚨</span>
                        <span className="text-xs font-bold text-rose-800 uppercase">Área de Mejora (Pain Point)</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-1 pl-6">
                        {latestResult.key_complaint || "Ningún problema detectado. Todo bien."}
                    </p>
                </div>
            </div>
        </div>
    );
};