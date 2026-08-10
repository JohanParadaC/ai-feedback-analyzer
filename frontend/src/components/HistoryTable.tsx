import { useState, useMemo, useEffect } from 'react';
import type { AnalysisResult, Sentiment } from '../types';
import { useAuth } from '../context/auth-context';
import { apiFetch, ApiError } from '../lib/api';
import { getSentimentStyle } from '../lib/sentiment';
import { SentimentBadge } from './ui/SentimentBadge';
import { Button } from './ui/Button';
import { SegmentedControl } from './ui/SegmentedControl';
import {
    SearchIcon, MailIcon, CopyIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon,
} from './ui/Icons';

const ITEMS_POR_PAGINA = 8;

type FilterValue = 'todos' | Sentiment;

/** Quita tildes para que "envio" encuentre también "envío". */
const removeAccents = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

interface HistoryTableProps {
    history: AnalysisResult[];
}

export const HistoryTable = ({ history }: HistoryTableProps) => {
    const { user, logout } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterValue>('todos');
    const [currentPage, setCurrentPage] = useState(1);

    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [aiReplies, setAiReplies] = useState<Record<string, string>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [replyError, setReplyError] = useState<string | null>(null);

    const filteredHistory = useMemo(() => {
        const normalizedSearch = removeAccents(searchTerm.toLowerCase()).trim();

        return history.filter((item) => {
            if (activeFilter !== 'todos' && item.sentiment !== activeFilter) return false;
            if (!normalizedSearch) return true;

            const haystack = removeAccents(
                `${item.text} ${item.key_complaint ?? ''} ${item.key_highlight ?? ''}`.toLowerCase()
            );
            return haystack.includes(normalizedSearch);
        });
    }, [history, activeFilter, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_POR_PAGINA));

    // Al cambiar filtro o búsqueda volvemos a la primera página. Antes esto se
    // hacía con un setState durante el render, que React penaliza con un render
    // extra y puede acabar en bucle.
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchTerm]);

    // Clamp defensivo: si la lista encoge, la página actual puede quedar fuera de rango.
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_POR_PAGINA;
    const currentItems = filteredHistory.slice(startIndex, startIndex + ITEMS_POR_PAGINA);

    const handleGenerateReply = async (item: AnalysisResult) => {
        if (!user) return;

        setGeneratingId(item.id);
        setReplyError(null);

        try {
            const data = await apiFetch<{ reply: string }>('/api/generate-reply', {
                method: 'POST',
                token: user.token,
                body: { text: item.text, sentiment: item.sentiment },
            });
            setAiReplies(prev => ({ ...prev, [item.id]: data.reply }));
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                logout();
                return;
            }
            setReplyError('No se pudo generar la respuesta. Inténtalo de nuevo.');
        } finally {
            setGeneratingId(null);
        }
    };

    const handleCopy = async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // Confirmación en el propio botón, en vez de un alert() que
            // interrumpe y obliga a un clic extra.
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            setReplyError('Tu navegador bloqueó el acceso al portapapeles.');
        }
    };

    if (history.length === 0) return null;

    return (
        <section className="card overflow-hidden" aria-labelledby="history-title">

            {/* ── Cabecera: título, búsqueda y filtros ── */}
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/40 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <h2 id="history-title" className="section-label">Registro de reseñas</h2>
                    <span
                        className="tabular rounded-full border border-slate-200 bg-white px-2.5 py-0.5
                                   text-xs font-semibold text-slate-500
                                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                    >
                        {filteredHistory.length}
                    </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <label htmlFor="history-search" className="sr-only">Buscar en las reseñas</label>
                        <input
                            id="history-search"
                            type="search"
                            placeholder="Buscar…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm
                                       outline-none transition-colors placeholder:text-slate-400
                                       focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                       dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200
                                       sm:w-52"
                        />
                    </div>

                    <SegmentedControl<FilterValue>
                        label="Filtrar por sentimiento"
                        value={activeFilter}
                        onChange={setActiveFilter}
                        size="sm"
                        segments={[
                            { value: 'todos', label: 'Todos' },
                            {
                                value: 'positivo', label: '✅', srLabel: 'Positivos',
                                activeClassName: 'bg-emerald-100 text-emerald-800 shadow-sm dark:bg-emerald-950 dark:text-emerald-300',
                            },
                            {
                                value: 'neutral', label: '⚠️', srLabel: 'Neutrales',
                                activeClassName: 'bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-950 dark:text-amber-300',
                            },
                            {
                                value: 'negativo', label: '🚨', srLabel: 'Negativos',
                                activeClassName: 'bg-rose-100 text-rose-800 shadow-sm dark:bg-rose-950 dark:text-rose-300',
                            },
                        ]}
                    />
                </div>
            </div>

            {replyError && (
                <p role="alert" className="border-b border-rose-100 bg-rose-50 px-5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    {replyError}
                </p>
            )}

            {/* ── Tabla ── */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                        Historial de reseñas analizadas, con sentimiento, puntuación y acciones.
                    </caption>
                    <thead>
                        <tr className="border-b border-slate-200 bg-white text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            <th scope="col" className="w-2/5 p-4 pl-6 font-semibold">Reseña</th>
                            <th scope="col" className="p-4 font-semibold">Análisis</th>
                            <th scope="col" className="p-4 text-center font-semibold">Score</th>
                            <th scope="col" className="p-4 pr-6 text-center font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => {
                                const style = getSentimentStyle(item.sentiment);
                                const reply = aiReplies[item.id];

                                return (
                                    <tr
                                        key={item.id}
                                        className="align-top transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="p-4 pl-6">
                                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                {item.text}
                                            </p>
                                            <time
                                                className="mt-1.5 block text-xs text-slate-400 dark:text-slate-500"
                                                dateTime={item.date}
                                            >
                                                {new Date(item.date).toLocaleDateString('es', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </time>

                                            {reply && (
                                                <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/70 p-3 dark:border-brand-900/60 dark:bg-brand-950/30">
                                                    <div className="mb-1.5 flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                                                            Respuesta sugerida
                                                        </span>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleCopy(item.id, reply)}
                                                            icon={copiedId === item.id
                                                                ? <CheckIcon className="h-3 w-3" />
                                                                : <CopyIcon className="h-3 w-3" />}
                                                            className="!py-1 !text-[10px]"
                                                        >
                                                            {copiedId === item.id ? 'Copiado' : 'Copiar'}
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                                        {reply}
                                                    </p>
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <SentimentBadge sentiment={item.sentiment} />
                                                {item.key_highlight && (
                                                    <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                        🌟 {item.key_highlight}
                                                    </span>
                                                )}
                                                {item.key_complaint && (
                                                    <span className="rounded-md border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                                                        🚨 {item.key_complaint}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4 text-center">
                                            <span
                                                className="tabular text-sm font-bold"
                                                style={{ color: style.hex }}
                                            >
                                                {item.score}
                                            </span>
                                            <span className="text-xs text-slate-400"> / 10</span>
                                        </td>

                                        <td className="p-4 pr-6 text-center">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleGenerateReply(item)}
                                                loading={generatingId === item.id}
                                                disabled={!!reply}
                                                icon={reply
                                                    ? <CheckIcon className="h-3.5 w-3.5" />
                                                    : <MailIcon className="h-3.5 w-3.5" />}
                                                className="w-full justify-center"
                                            >
                                                {generatingId === item.id
                                                    ? 'Redactando…'
                                                    : reply ? 'Lista' : 'Responder'}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-12 text-center">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Sin resultados
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                                        Prueba con otra búsqueda o quita los filtros.
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Paginación ── */}
            {totalPages > 1 && (
                <nav
                    className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-800 sm:flex-row"
                    aria-label="Paginación del historial"
                >
                    <p className="tabular text-xs text-slate-500 dark:text-slate-400">
                        {startIndex + 1}–{Math.min(startIndex + ITEMS_POR_PAGINA, filteredHistory.length)}
                        {' de '}{filteredHistory.length}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            icon={<ChevronLeftIcon className="h-3.5 w-3.5" />}
                            aria-label="Página anterior"
                        />
                        <span className="tabular px-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {safePage} / {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            icon={<ChevronRightIcon className="h-3.5 w-3.5" />}
                            aria-label="Página siguiente"
                        />
                    </div>
                </nav>
            )}
        </section>
    );
};
