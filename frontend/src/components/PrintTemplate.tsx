import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { AnalysisResult, ChartDatum } from '../types';
import { getSentimentStyle } from '../lib/sentiment';

interface PrintTemplateProps {
    pdfRef: React.RefObject<HTMLDivElement | null>;
    totalAnalyzed: number;
    npsScore: number;
    chartData: ChartDatum[];
    history: AnalysisResult[];
    companyName: string;
}

/**
 * Plantilla que se fotografía para generar el PDF.
 *
 * Vive fuera de la pantalla y siempre en claro: el informe se imprime en papel
 * blanco, así que no hereda el modo oscuro de la interfaz.
 */
export const PrintTemplate = ({
    pdfRef, totalAnalyzed, npsScore, chartData, history, companyName,
}: PrintTemplateProps) => (
    <div
        ref={pdfRef}
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 w-[800px] bg-white p-8 text-slate-800"
    >
        <div id="pdf-header">
            <div className="mb-8 border-b pb-4 text-center">
                <h1 className="text-3xl font-bold text-slate-900">🧠 AI Feedback Analyzer</h1>
                <p className="mt-2 text-slate-500">Reporte de análisis de feedback</p>
                <p className="mt-1 text-sm text-slate-400">
                    {companyName} · {new Date().toLocaleDateString('es', {
                        day: 'numeric', month: 'long', year: 'numeric',
                    })}
                </p>
            </div>

            <div className="mb-8 flex justify-between gap-4">
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500">Total reseñas</p>
                    <p className="text-2xl font-bold text-indigo-600">{totalAnalyzed}</p>
                </div>
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                    {/* Antes ponía "Promedio Puntaje ... / 10", pero el valor que
                        llega es el NPS, cuya escala va de -100 a +100. */}
                    <p className="text-xs font-bold uppercase text-slate-500">Net Promoter Score</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {npsScore > 0 ? `+${npsScore}` : npsScore}
                    </p>
                </div>
            </div>

            <div className="mb-8 h-64 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="mb-4 text-center font-bold text-slate-700">Distribución de sentimiento</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            dataKey="value"
                            label
                            isAnimationActive={false}
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={24} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <h2 className="mb-4 border-b pb-2 text-xl font-bold text-slate-800">Desglose de reseñas</h2>
        </div>

        <div className="flex flex-col gap-4">
            {[...history].reverse().map((item, index) => {
                const style = getSentimentStyle(item.sentiment);

                return (
                    <div
                        key={item.id}
                        id={`pdf-review-${index}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                        <div className="mb-2 flex items-baseline justify-between">
                            <h3 className="font-bold text-slate-700">Reseña #{index + 1}</h3>
                            <span className="text-xs text-slate-400">
                                {new Date(item.date).toLocaleDateString('es')}
                            </span>
                        </div>

                        <p className="mb-4 italic text-slate-600">“{item.text}”</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs font-bold uppercase text-slate-500">Sentimiento:</span>
                                <span
                                    className="ml-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold"
                                    style={{ color: style.hex }}
                                >
                                    {style.emoji}<span className="ml-1">{style.label}</span>
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase text-slate-500">Score:</span>
                                <span className="ml-2 font-bold text-slate-800">{item.score} / 10</span>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {item.key_highlight && (
                                <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                                    🌟 {item.key_highlight}
                                </span>
                            )}
                            {item.key_complaint && (
                                <span className="rounded-md border border-rose-100 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                                    🚨 {item.key_complaint}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);
