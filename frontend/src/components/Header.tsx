interface HeaderProps {
    totalAnalyzed: number;
    averageScore: string | number;
    loading: boolean;
    onDownloadPDF: () => void;
    // ✨ NUEVO: Agregamos la función para descargar CSV
    onDownloadCSV: () => void;
}

export const Header = ({ totalAnalyzed, averageScore, loading, onDownloadPDF, onDownloadCSV }: HeaderProps) => {
    return (
        <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <span className="text-3xl">🧠</span>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Feedback Analyzer</h1>
                    <p className="text-sm text-slate-500 font-medium">Plataforma de Análisis de Sentimiento</p>
                </div>
            </div>

            {totalAnalyzed > 0 && (
                <div className="flex flex-wrap gap-4 text-right items-center justify-center">

                    {/* ✨ NUEVO: Grupo de Botones de Exportación */}
                    <div className="flex gap-2">
                        {/* Botón Excel / CSV */}
                        <button
                            onClick={onDownloadCSV}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg shadow-sm font-bold text-sm transition-colors flex items-center gap-2 h-full ${loading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                        >
                            📊 CSV
                        </button>

                        {/* Botón PDF */}
                        <button
                            onClick={onDownloadPDF}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg shadow-sm font-bold text-sm transition-colors flex items-center gap-2 h-full ${loading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                        >
                            📄 {loading ? 'Generando...' : 'PDF'}
                        </button>
                    </div>

                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Reseñas</p>
                        <p className="text-xl font-bold text-blue-600">{totalAnalyzed}</p>
                    </div>

                    {/* ✨ CAMBIO: Ahora mostramos el NPS en lugar del promedio */}
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold">NPS Score</p>
                        <p className="text-xl font-bold text-blue-600">
                            {Number(averageScore) > 0 ? `+${averageScore}` : averageScore}
                        </p>
                    </div>
                </div>
            )}
        </header>
    );
};