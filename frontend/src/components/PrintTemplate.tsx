import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { AnalysisResult } from '../types';

interface PrintTemplateProps {
    pdfRef: React.RefObject<HTMLDivElement | null>;
    totalAnalyzed: number;
    averageScore: string | number;
    chartData: any[];
    history: AnalysisResult[];
    theme: Record<string, any>;
}

export const PrintTemplate = ({ pdfRef, totalAnalyzed, averageScore, chartData, history, theme }: PrintTemplateProps) => {
    return (
        <div ref={pdfRef} className="absolute top-0 left-[-9999px] w-[800px] bg-white p-8">
            <div id="pdf-header">
                <div className="mb-8 text-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-900">🧠 AI Feedback Analyzer</h1>
                    <p className="text-slate-500 mt-2">Reporte de Análisis Estructurado</p>
                </div>

                <div className="flex justify-between mb-8 gap-4">
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Total Reseñas</p>
                        <p className="text-2xl font-bold text-blue-600">{totalAnalyzed}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Promedio Puntaje</p>
                        <p className="text-2xl font-bold text-blue-600">{averageScore} / 10</p>
                    </div>
                </div>

                <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 h-64">
                    <h2 className="text-center font-bold text-slate-700 mb-4">Distribución de Sentimiento</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" label isAnimationActive={false}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={24} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Desglose de Reseñas</h2>
            </div>

            <div className="flex flex-col gap-4">
                {[...history].reverse().map((item, index) => {
                    const itemTheme = theme[item.sentiment];
                    return (
                        <div key={item.id} id={`pdf-review-${index}`} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-700 mb-2">Reseña #{index + 1}</h3>
                            <p className="text-slate-600 italic mb-4">"{item.text}"</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Sentimiento:</span>
                                    <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 ${itemTheme.text}`}>
                                        {itemTheme.icon} <span className="capitalize ml-1">{item.sentiment}</span>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Score:</span>
                                    <span className="ml-2 font-bold text-slate-800">{item.score} / 10</span>
                                </div>
                            </div>

                            <div className="mt-3 flex gap-2 flex-wrap">
                                {item.key_highlight && (
                                    <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                                        🌟 {item.key_highlight}
                                    </span>
                                )}
                                {item.key_complaint && (
                                    <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                                        🚨 {item.key_complaint}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};