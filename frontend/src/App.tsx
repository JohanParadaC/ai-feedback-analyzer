import { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type Sentiment = 'positivo' | 'negativo' | 'neutral';

interface AnalysisResult {
  id: number;
  text: string;
  sentiment: Sentiment;
  score: number;
  key_complaint: string | null;
  key_highlight: string | null;
}

export default function App() {
  const [feedback, setFeedback] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const [history, setHistory] = useState<AnalysisResult[]>([])

  // Mantenemos el ref para asegurarnos de que el contenedor exista
  const pdfRef = useRef<HTMLDivElement>(null);

  // --- NUEVO: Función de PDF con Paginación Inteligente (Bloque a Bloque) 📄 ---
  const downloadPDF = async () => {
    if (!pdfRef.current || history.length === 0) return;

    setLoading(true);

    try {
      // Creamos el documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10; // Margen en milímetros para que no quede pegado a los bordes
      const usableWidth = pdfWidth - (margin * 2);
      let currentY = margin; // Rastreador de en qué posición vertical vamos

      // Función auxiliar para tomar foto de un elemento y pegarlo en el PDF
      const addElementToPDF = async (elementId: string) => {
        const el = document.getElementById(elementId);
        if (!el) return;

        // Tomamos la foto del bloque individual
        const dataUrl = await htmlToImage.toPng(el, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#f8fafc'
        });

        // Calculamos cuánto va a medir de alto en nuestro PDF
        const imgHeight = (el.offsetHeight * usableWidth) / el.offsetWidth;

        // LA MAGIA: Si la imagen actual se pasa del límite de la hoja, creamos hoja nueva
        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin; // Reiniciamos el rastreador a la parte superior de la nueva hoja
        }

        // Pegamos la foto y actualizamos nuestro rastreador sumando la altura de la imagen + un espacio
        pdf.addImage(dataUrl, 'PNG', margin, currentY, usableWidth, imgHeight);
        currentY += imgHeight + 5;
      };

      // 1. Primero pegamos el encabezado y las gráficas
      await addElementToPDF('pdf-header');

      // 2. Iteramos sobre cada reseña del historial y las pegamos una a una
      for (let i = 0; i < history.length; i++) {
        await addElementToPDF(`pdf-review-${i}`);
      }

      pdf.save('Reporte-Intelligence-Hub.pdf');
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setLoading(false);
    }
  };
  // ------------------------------------------------------------------------

  const handleAnalyze = async () => {
    if (!feedback.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      const data = await response.json();

      const newResult: AnalysisResult = {
        id: Date.now(),
        text: feedback,
        ...data,
        sentiment: data.sentiment.toLowerCase() as Sentiment
      };

      setHistory(prev => [newResult, ...prev]);
      setFeedback("");

    } catch (error) {
      console.error("Error conectando al backend:", error);
      alert("Error de conexión. Revisa que tu backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  }

  const totalAnalyzed = history.length;
  const averageScore = totalAnalyzed > 0
    ? (history.reduce((acc, curr) => acc + curr.score, 0) / totalAnalyzed).toFixed(1)
    : 0;

  const sentimentCounts = history.reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'Positivo', value: sentimentCounts['positivo'] || 0, color: '#10b981' },
    { name: 'Neutral', value: sentimentCounts['neutral'] || 0, color: '#fbbf24' },
    { name: 'Negativo', value: sentimentCounts['negativo'] || 0, color: '#f43f5e' }
  ].filter(item => item.value > 0);

  const theme = {
    positivo: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', icon: '✅' },
    neutral: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', icon: '⚠️' },
    negativo: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700', icon: '🚨' }
  };

  const latestResult = history.length > 0 ? history[0] : null;
  const currentTheme = latestResult ? theme[latestResult.sentiment] : null;

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans bg-slate-50 relative overflow-x-hidden">
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
              onClick={downloadPDF}
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

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 p-2 rounded-2xl">
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <textarea
              rows={5}
              placeholder="Pega aquí la reseña de tu cliente para que la IA la analice..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-700 resize-none mb-4"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !feedback}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex justify-center items-center ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                }`}
            >
              {loading ? 'Procesando IA...' : 'Analizar Reseña'}
            </button>
          </div>

          {chartData.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Puntaje Total</h2>
                  <span className="text-base font-bold text-slate-800">{averageScore} <span className="text-xs text-slate-400 font-normal">/ 10</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${Number(averageScore) >= 7 ? 'bg-emerald-500' :
                      Number(averageScore) >= 4 ? 'bg-amber-400' :
                        'bg-rose-500'
                      }`}
                    style={{ width: `${(Number(averageScore) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-56 flex flex-col">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">Volumen de Reseñas</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Reseña(s)`, 'Cantidad']} />
                    <Legend
                      verticalAlign="bottom"
                      height={24}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>

        <section className="lg:col-span-7 flex flex-col gap-6">
          {!latestResult && !loading && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              <p className="text-sm font-medium">Esperando datos para construir el Dashboard...</p>
            </div>
          )}

          {latestResult && currentTheme && (
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
          )}
        </section>

        {history.length > 0 && (
          <section className="lg:col-span-12 mt-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Registro de Reseñas</h2>
                <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  {history.length} analizadas
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4 pl-6 font-semibold">Reseña (Fragmento)</th>
                      <th className="p-4 font-semibold">Sentimiento</th>
                      <th className="p-4 font-semibold">Score</th>
                      <th className="p-4 pr-6 font-semibold">Etiquetas Extraídas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 text-sm text-slate-700 max-w-xs md:max-w-md truncate font-medium" title={item.text}>
                          "{item.text}"
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.sentiment === 'positivo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            item.sentiment === 'negativo' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                            <span className="mr-1">
                              {item.sentiment === 'positivo' ? '✅' : item.sentiment === 'negativo' ? '🚨' : '⚠️'}
                            </span>
                            <span className="capitalize">{item.sentiment}</span>
                          </span>
                        </td>

                        <td className="p-4 text-sm font-bold text-slate-700">
                          {item.score} <span className="text-slate-400 font-normal">/ 10</span>
                        </td>

                        <td className="p-4 pr-6">
                          <div className="flex gap-2 flex-wrap">
                            {item.key_highlight && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                                🌟 {item.key_highlight}
                              </span>
                            )}
                            {item.key_complaint && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                                🚨 {item.key_complaint}
                              </span>
                            )}
                            {!item.key_highlight && !item.key_complaint && (
                              <span className="text-xs text-slate-400 italic">Sin etiquetas detectadas</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* VISTA DE IMPRESIÓN OCULTA */}
      <div
        ref={pdfRef}
        className="absolute top-0 left-0 -z-50 w-[800px] bg-white p-8"
      >
        {/* --- NUEVO: Asignamos el ID pdf-header a esta primera mitad --- */}
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
          {/* --- NUEVO: Asignamos IDs iterativos a cada tarjeta (pdf-review-0, pdf-review-1...) --- */}
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

    </div>
  )
}