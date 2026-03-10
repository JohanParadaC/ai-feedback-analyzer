interface HeaderProps {
    totalAnalyzed: number;
    averageScore: string | number;
    loading: boolean;
    onDownloadPDF: () => void;
}

export const Header = ({ totalAnalyzed, averageScore, loading, onDownloadPDF }: HeaderProps) => {
    return (
        <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <span className="text-3xl">🧠</span>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Feedback Analyzer</h1>
                    <p className="text-sm text-slate-500 font-medium">Plataforma de Análisis de Sentimiento</p>
                </div>
            </div>

            {totalAnalyzed > 0 && (
                <div className="flex gap-4 text-right items-center">
                    <button
                        onClick={onDownloadPDF}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg shadow-sm font-bold text-sm transition-colors flex items-center gap-2 h-full ${loading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        📄 {loading ? 'Generando...' : 'Exportar PDF'}
                    </button>

                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold">Total Reseñas</p>
                        <p className="text-xl font-bold text-blue-600">{totalAnalyzed}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold">Promedio Puntaje</p>
                        <p className="text-xl font-bold text-blue-600">{averageScore} / 10</p>
                    </div>
                </div>
            )}
        </header>
    );
};