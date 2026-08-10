import { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult, Sentiment } from '../types';
import { useAuth } from '../context/auth-context';
import { apiFetch, ApiError } from '../lib/api';

export type TimeFilter = 'all' | '7d' | '30d';

/** Forma cruda de un feedback tal y como lo devuelve el backend. */
interface FeedbackDTO {
    _id: string;
    text: string;
    sentiment: string;
    score: number;
    key_complaint: string | null;
    key_highlight: string | null;
    date?: string;
    createdAt?: string;
}

const toAnalysisResult = (item: FeedbackDTO): AnalysisResult => ({
    id: item._id,
    text: item.text,
    sentiment: item.sentiment.toLowerCase() as Sentiment,
    score: item.score,
    key_complaint: item.key_complaint,
    key_highlight: item.key_highlight,
    date: item.date || item.createdAt || new Date().toISOString(),
});

/** ¿Entra esta fecha dentro del filtro temporal activo? */
const matchesTimeFilter = (date: string, filter: TimeFilter): boolean => {
    if (filter === 'all') return true;
    const days = filter === '7d' ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return new Date(date).getTime() >= cutoff;
};

const sortByDateDesc = (items: AnalysisResult[]) =>
    [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

/** Reseñas por petición en la carga masiva. Debe ser <= MAX_LOTE del backend. */
const BULK_CHUNK_SIZE = 50;

/** Respuesta del endpoint de lote. */
interface BatchResponse {
    guardadas: FeedbackDTO[];
    resumen: {
        recibidas: number;
        analizadas: number;
        fallidas: number;
        descartadasPorCuota: number;
    };
}

export const useFeedback = () => {
    const [feedback, setFeedback] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [historyLoading, setHistoryLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

    // Progreso de la carga masiva, para poder mostrar "3 de 20" en la interfaz.
    const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

    const { user, logout } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Si el usuario cambia de filtro rápido, una respuesta lenta anterior
        // podría llegar después y pisar la nueva. AbortController lo evita.
        const controller = new AbortController();

        const fetchHistory = async () => {
            setHistoryLoading(true);
            try {
                const data = await apiFetch<FeedbackDTO[]>(
                    `/api/feedbacks?timeframe=${timeFilter}`,
                    { token: user.token, signal: controller.signal }
                );
                setHistory(data.map(toAnalysisResult));
                setError(null);
            } catch (err) {
                if (controller.signal.aborted) return;
                if (err instanceof ApiError && err.status === 401) {
                    logout();
                    return;
                }
                setError('No se pudo cargar el historial. Revisa que el servidor esté encendido.');
            } finally {
                if (!controller.signal.aborted) setHistoryLoading(false);
            }
        };

        fetchHistory();
        return () => controller.abort();
    }, [user, logout, timeFilter]);

    /** Inserta un resultado respetando el filtro activo y el orden cronológico. */
    const addResult = useCallback((result: AnalysisResult, filter: TimeFilter) => {
        // Una reseña con fecha retroactiva no debe aparecer si queda fuera del
        // rango que el usuario está viendo.
        if (!matchesTimeFilter(result.date, filter)) return;
        setHistory(prev => sortByDateDesc([result, ...prev]));
    }, []);

    const handleAnalyze = useCallback(async () => {
        if (!feedback.trim() || !user) return;

        setLoading(true);
        setError(null);

        try {
            const data = await apiFetch<FeedbackDTO>('/api/analyze', {
                method: 'POST',
                token: user.token,
                body: { feedback },
            });

            addResult(toAnalysisResult(data), timeFilter);
            setFeedback("");
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setError(err instanceof ApiError ? err.message : 'Error al procesar la reseña. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [feedback, user, logout, addResult, timeFilter]);

    const handleBulkAnalyze = useCallback(async (items: { text: string, date: string }[]) => {
        if (!user) return;

        const pending = items.filter(item => item.text.trim());
        if (pending.length === 0) return;

        setLoading(true);
        setError(null);
        setBulkProgress({ done: 0, total: pending.length });

        let failed = 0;
        let discardedByQuota = 0;
        let processed = 0;

        // Enviamos por tandas al endpoint de lote. Antes se mandaba una petición
        // por fila, así que un CSV de más de 50 líneas agotaba el rate limiting
        // y se quedaba a medio analizar.
        for (let i = 0; i < pending.length; i += BULK_CHUNK_SIZE) {
            const chunk = pending.slice(i, i + BULK_CHUNK_SIZE);

            try {
                const data = await apiFetch<BatchResponse>('/api/analyze/batch', {
                    method: 'POST',
                    token: user.token,
                    body: { items: chunk },
                });

                data.guardadas.forEach(item => addResult(toAnalysisResult(item), timeFilter));

                failed += data.resumen.fallidas;
                discardedByQuota += data.resumen.descartadasPorCuota;

                // Si la cuota se agotó, no tiene sentido seguir mandando tandas.
                // El `finally` ya suma esta tanda a `processed`, así que aquí
                // solo contamos las que ni siquiera llegaremos a enviar.
                if (data.resumen.descartadasPorCuota > 0) {
                    discardedByQuota += pending.length - (i + chunk.length);
                    break;
                }
            } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                    logout();
                    break;
                }
                if (err instanceof ApiError && err.status === 429) {
                    // Cuota agotada o demasiadas peticiones: paramos y avisamos.
                    setError(err.message);
                    break;
                }
                failed += chunk.length;
                console.error('Error en tanda masiva:', err);
            } finally {
                processed += chunk.length;
                setBulkProgress({ done: Math.min(processed, pending.length), total: pending.length });
            }
        }

        const avisos: string[] = [];
        if (failed > 0) avisos.push(`${failed} no se pudieron analizar`);
        if (discardedByQuota > 0) avisos.push(`${discardedByQuota} quedaron fuera por límite de cuota`);
        if (avisos.length > 0) {
            setError(`De ${pending.length} reseñas: ${avisos.join(' y ')}.`);
        }

        setBulkProgress(null);
        setLoading(false);
    }, [user, logout, addResult, timeFilter]);

    return {
        feedback,
        setFeedback,
        loading,
        setLoading,
        history,
        historyLoading,
        error,
        setError,
        bulkProgress,
        handleAnalyze,
        handleBulkAnalyze,
        timeFilter,
        setTimeFilter,
    };
};
