import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Button } from './ui/Button';
import { SparklesIcon, UploadIcon } from './ui/Icons';

/** Debe coincidir con el máximo que valida el backend (zod). */
const MAX_CARACTERES = 2000;
const MIN_CARACTERES = 5;

interface FeedbackFormProps {
    feedback: string;
    setFeedback: (value: string) => void;
    loading: boolean;
    bulkProgress: { done: number; total: number } | null;
    onAnalyze: () => void;
    onBulkAnalyze: (items: { text: string, date: string }[]) => void;
}

export const FeedbackForm = ({
    feedback, setFeedback, loading, bulkProgress, onAnalyze, onBulkAnalyze,
}: FeedbackFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const chars = feedback.trim().length;
    const toolong = chars > MAX_CARACTERES;
    const canAnalyze = chars >= MIN_CARACTERES && !toolong && !loading;

    const parseCsv = (file: File) => {
        setFileError(null);

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setFileError('El archivo debe tener extensión .csv');
            return;
        }

        Papa.parse<string[]>(file, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const feedbacks = results.data
                    .map((row) => {
                        const text = row[0]?.trim();
                        const dateStr = row[1]?.trim();

                        let finalDate = new Date().toISOString();
                        if (dateStr) {
                            const parsed = new Date(dateStr);
                            if (!isNaN(parsed.getTime())) finalDate = parsed.toISOString();
                        }

                        return text ? { text, date: finalDate } : null;
                    })
                    .filter((item): item is { text: string; date: string } => item !== null);

                if (feedbacks.length === 0) {
                    setFileError('No se encontró ninguna reseña. Debe haber una por fila en la primera columna.');
                    return;
                }

                onBulkAnalyze(feedbacks);
            },
            error: () => setFileError('No se pudo leer el archivo.'),
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) parseCsv(file);
    };

    return (
        <section
            // `relative` ancla la capa de arrastre, que se posiciona en absoluto.
            className="card relative p-5"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-labelledby="form-title"
        >
            <div className="mb-3 flex items-center justify-between">
                <h2 id="form-title" className="section-label">Analizar reseña</h2>
                <span
                    className={`tabular text-xs font-medium ${
                        toolong ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                    {chars.toLocaleString('es')} / {MAX_CARACTERES.toLocaleString('es')}
                </span>
            </div>

            <label htmlFor="feedback-input" className="sr-only">
                Texto de la reseña del cliente
            </label>
            <textarea
                id="feedback-input"
                rows={5}
                placeholder="Pega aquí la reseña de tu cliente para que la IA la analice…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                aria-invalid={toolong}
                aria-describedby="feedback-help"
                className={`w-full resize-none rounded-xl border bg-slate-50 p-4 text-sm text-slate-700
                            outline-none transition-colors placeholder:text-slate-400
                            focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20
                            dark:bg-slate-950 dark:text-slate-200 dark:placeholder:text-slate-600
                            dark:focus:bg-slate-950
                            ${toolong
                                ? 'border-rose-400 dark:border-rose-800'
                                : 'border-slate-200 dark:border-slate-800'}`}
            />

            <p id="feedback-help" className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {toolong
                    ? `Recorta ${(chars - MAX_CARACTERES).toLocaleString('es')} caracteres para poder analizar.`
                    : 'También puedes arrastrar un CSV aquí para analizar en lote.'}
            </p>

            {/* Progreso real del lote: sin esto, subir 200 filas parecía que se había colgado. */}
            {bulkProgress && (
                <div className="mt-4" role="status" aria-live="polite">
                    <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span>Analizando lote…</span>
                        <span className="tabular">{bulkProgress.done} de {bulkProgress.total}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-brand-600 transition-[width] duration-300 dark:bg-brand-500"
                            style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {fileError && (
                <p role="alert" className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fileError}
                </p>
            )}

            <div className="mt-4 flex gap-3">
                <Button
                    onClick={onAnalyze}
                    disabled={!canAnalyze}
                    loading={loading && !bulkProgress}
                    icon={<SparklesIcon className="h-4 w-4" />}
                    className="flex-1"
                >
                    {loading && !bulkProgress ? 'Analizando…' : 'Analizar reseña'}
                </Button>

                <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) parseCsv(f); }}
                />
                <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    icon={<UploadIcon className="h-4 w-4" />}
                    title="Sube un .csv con una reseña por fila (columna 1: texto, columna 2 opcional: fecha)"
                >
                    CSV
                </Button>
            </div>

            {/* Realimentación visual del arrastre. pointer-events-none evita que
                la capa robe el evento de drop al propio contenedor. */}
            {isDragging && (
                <div
                    className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center
                               rounded-2xl border-2 border-dashed border-brand-500 bg-brand-50/90
                               text-sm font-semibold text-brand-700
                               dark:bg-brand-950/80 dark:text-brand-300"
                >
                    Suelta el archivo CSV aquí
                </div>
            )}
        </section>
    );
};
