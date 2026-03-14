import { useState } from 'react';
import type { AnalysisResult } from '../types';

interface HistoryTableProps {
    history: AnalysisResult[];
}

// Función para quitar tildes
const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const HistoryTable = ({ history }: HistoryTableProps) => {
    // 1. ESTADOS PARA LOS FILTROS
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'todos' | 'positivo' | 'neutral' | 'negativo'>('todos');

    // ✨ 2. NUEVOS ESTADOS PARA LA PAGINACIÓN ✨
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // <--- ¡Puedes cambiar este número a 10 o 20 si quieres ver más!

    if (history.length === 0) return null;

    // 3. Filtramos la lista primero (Buscador y Botones)
    const filteredHistory = history.filter((item) => {
        const matchesFilter = activeFilter === 'todos' || item.sentiment === activeFilter;
        const normalizedSearch = removeAccents(searchTerm.toLowerCase());
        const matchesSearch =
            removeAccents(item.text.toLowerCase()).includes(normalizedSearch) ||
            (item.key_complaint && removeAccents(item.key_complaint.toLowerCase()).includes(normalizedSearch)) ||
            (item.key_highlight && removeAccents(item.key_highlight.toLowerCase()).includes(normalizedSearch));
        return matchesFilter && matchesSearch;
    });

    // ✨ 4. MATEMÁTICAS DE LA PAGINACIÓN ✨
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Cortamos la lista para mostrar solo los de la página actual
    const currentItems = filteredHistory.slice(startIndex, endIndex);

    // Función para cambiar de página (y evitar que se pase de los límites)
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // ✨ TRUCO: Si filtramos y la página actual se queda vacía, regresamos a la página 1
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    return (
        <section className="lg:col-span-12 mt-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* CABECERA Y FILTROS */}
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Registro de Reseñas</h2>
                        <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            {filteredHistory.length} resultados
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar palabras..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
                        />

                        <div className="flex bg-slate-200 p-1 rounded-lg w-full sm:w-auto justify-between sm:justify-start">
                            <button onClick={() => setActiveFilter('todos')} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${activeFilter === 'todos' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                            <button onClick={() => setActiveFilter('positivo')} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${activeFilter === 'positivo' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>✅ Pos</button>
                            <button onClick={() => setActiveFilter('neutral')} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${activeFilter === 'neutral' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>⚠️ Neu</button>
                            <button onClick={() => setActiveFilter('negativo')} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${activeFilter === 'negativo' ? 'bg-rose-100 text-rose-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🚨 Neg</button>
                        </div>
                    </div>
                </div>

                {/* LA TABLA */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 pl-6 font-semibold w-1/2">Reseña</th>
                                <th className="p-4 font-semibold">Sentimiento</th>
                                <th className="p-4 font-semibold">Score</th>
                                <th className="p-4 pr-6 font-semibold">Etiquetas Extraídas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.length > 0 ? (
                                // ✨ AHORA ITERAMOS SOBRE currentItems (Los 5 de esta página) ✨
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 pl-6 text-sm text-slate-700 font-medium whitespace-normal" title={item.text}>
                                            "{item.text}"
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.sentiment === 'positivo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.sentiment === 'negativo' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                                                <span className="mr-1">{item.sentiment === 'positivo' ? '✅' : item.sentiment === 'negativo' ? '🚨' : '⚠️'}</span>
                                                <span className="capitalize">{item.sentiment}</span>
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-700">
                                            {item.score} <span className="text-slate-400 font-normal">/ 10</span>
                                        </td>
                                        <td className="p-4 pr-6">
                                            <div className="flex gap-2 flex-wrap">
                                                {item.key_highlight && <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">🌟 {item.key_highlight}</span>}
                                                {item.key_complaint && <span className="inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">🚨 {item.key_complaint}</span>}
                                                {!item.key_highlight && !item.key_complaint && <span className="text-xs text-slate-400 italic">Sin etiquetas detectadas</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-sm text-slate-500">
                                        No se encontraron reseñas con esos filtros. 🕵️‍♂️
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✨ CONTROLES DE PAGINACIÓN (Footer de la tabla) ✨ */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="text-xs text-slate-500 font-medium">
                            Mostrando del <span className="font-bold text-slate-700">{startIndex + 1}</span> al <span className="font-bold text-slate-700">{Math.min(endIndex, filteredHistory.length)}</span> de {filteredHistory.length}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Anterior
                            </button>

                            <span className="text-sm font-bold text-slate-700 px-2">
                                Página {currentPage} de {totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
};