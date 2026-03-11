import { useRef } from 'react';
import Papa from 'papaparse';

interface FeedbackFormProps {
    feedback: string;
    setFeedback: (value: string) => void;
    loading: boolean;
    onAnalyze: () => void;
    onBulkAnalyze: (items: { text: string, date: string }[]) => void;
}

export const FeedbackForm = ({ feedback, setFeedback, loading, onAnalyze, onBulkAnalyze }: FeedbackFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const feedbacks = results.data
                    .map((row: any) => {
                        const text = row[0]?.trim();
                        const dateStr = row[1]?.trim(); // Leemos la segunda columna

                        let finalDate = new Date().toISOString(); // Por defecto: hoy

                        // Si pusiste una fecha en el CSV, la usamos
                        if (dateStr) {
                            const parsedDate = new Date(dateStr);
                            // Verificamos que sea una fecha válida antes de usarla
                            if (!isNaN(parsedDate.getTime())) {
                                finalDate = parsedDate.toISOString();
                            }
                        }

                        return text ? { text, date: finalDate } : null;
                    })
                    .filter(Boolean) as { text: string, date: string }[];

                if (feedbacks.length > 0) {
                    onBulkAnalyze(feedbacks);
                } else {
                    alert("El archivo parece estar vacío o no tiene el formato correcto.");
                }

                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <textarea
                rows={5}
                placeholder="Pega aquí la reseña de tu cliente para que la IA la analice..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-700 resize-none mb-4"
            />

            <div className="flex gap-3">
                <button
                    onClick={onAnalyze}
                    disabled={loading || !feedback}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex justify-center items-center ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                        }`}
                >
                    {loading ? 'Procesando...' : 'Analizar Reseña'}
                </button>

                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 border-2 flex justify-center items-center ${loading ? 'border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                    title="Sube un archivo .csv con una reseña por fila"
                >
                    📁 Subir CSV
                </button>
            </div>
        </div>
    );
};