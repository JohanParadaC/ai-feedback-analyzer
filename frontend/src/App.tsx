import { useRef, useMemo } from 'react';
import { useFeedback } from './hooks/useFeedback';
import { downloadPDF } from './utils/pdfExport';
import { PainPointsChart } from './components/PainPointsChart';
import { SentimentTrendChart } from './components/SentimentTrendChart';

import { Header } from './components/Header';
import { FeedbackForm } from './components/FeedbackForm';
import { MetricsPanel } from './components/MetricsPanel';
import { LatestAnalysis } from './components/LatestAnalysis';
import { HistoryTable } from './components/HistoryTable';
import { PrintTemplate } from './components/PrintTemplate';

import { useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';

const THEME = {
  positivo: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', icon: '✅' },
  neutral: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', icon: '⚠️' },
  negativo: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700', icon: '🚨' }
};

export default function App() {
  const { user, logout } = useAuth();
  const { feedback, setFeedback, loading, setLoading, history, handleAnalyze, handleBulkAnalyze } = useFeedback();
  const pdfRef = useRef<HTMLDivElement>(null);

  const totalAnalyzed = useMemo(() => history.length, [history]);

  // ✨ NUEVO: CÁLCULO DEL NPS (Net Promoter Score)
  const npsScore = useMemo(() => {
    if (totalAnalyzed === 0) return 0;

    let promoters = 0; // Puntaje 9-10
    let detractors = 0; // Puntaje 1-6

    history.forEach(item => {
      if (item.score >= 9) promoters++;
      else if (item.score <= 6) detractors++;
    });

    const percentPromoters = (promoters / totalAnalyzed) * 100;
    const percentDetractors = (detractors / totalAnalyzed) * 100;

    return Math.round(percentPromoters - percentDetractors);
  }, [history, totalAnalyzed]);

  const chartData = useMemo(() => {
    const sentimentCounts = history.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Positivo', value: sentimentCounts['positivo'] || 0, color: '#10b981' },
      { name: 'Neutral', value: sentimentCounts['neutral'] || 0, color: '#fbbf24' },
      { name: 'Negativo', value: sentimentCounts['negativo'] || 0, color: '#f43f5e' }
    ].filter(item => item.value > 0);
  }, [history]);

  const latestResult = useMemo(() => {
    return history.length > 0 ? history[0] : null;
  }, [history]);

  // ✨ NUEVO: FUNCIÓN PARA EXPORTAR A CSV (Excel)
  const downloadCSV = () => {
    if (history.length === 0) return;

    // 1. Cabeceras del Excel
    const headers = ["Fecha", "Sentimiento", "Puntaje", "Queja Principal", "Destacado", "Reseña Original"];

    // 2. Formatear los datos
    const csvRows = history.map(row => {
      const date = new Date(row.date).toLocaleDateString();
      // Escapamos las comillas dobles y envolvemos el texto para que las comas no rompan el Excel
      const text = `"${row.text.replace(/"/g, '""')}"`;
      const complaint = row.key_complaint ? `"${row.key_complaint}"` : "Ninguna";
      const highlight = row.key_highlight ? `"${row.key_highlight}"` : "Ninguno";

      return [date, row.sentiment, row.score, complaint, highlight, text].join(',');
    });

    // 3. Juntar cabeceras y filas
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // 4. Crear un archivo fantasma y forzar la descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `intelligence_hub_export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans bg-slate-50 relative overflow-x-hidden">

      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6 px-2">
        <div className="text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          🏢 Conectado como: <span className="text-indigo-600 font-bold ml-1">{user.companyName}</span>
        </div>
        <button
          onClick={logout}
          className="text-sm bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
        >
          Cerrar Sesión 🚪
        </button>
      </div>

      <Header
        totalAnalyzed={totalAnalyzed}
        // ✨ Le pasamos el NPS al Header en lugar del promedio
        averageScore={npsScore}
        loading={loading}
        onDownloadPDF={() => downloadPDF({ pdfRef, history, setLoading })}
        // ✨ Le pasamos la nueva función al Header
        onDownloadCSV={downloadCSV}
      />

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 p-2 rounded-2xl">
        <section className="lg:col-span-5 flex flex-col gap-6">
          <FeedbackForm
            feedback={feedback}
            setFeedback={setFeedback}
            loading={loading}
            onAnalyze={handleAnalyze}
            onBulkAnalyze={handleBulkAnalyze}
          />
          <MetricsPanel
            chartData={chartData}
            // ✨ Le pasamos el NPS al panel de métricas
            npsScore={npsScore}
          />
          <PainPointsChart history={history} />
        </section>

        <section className="lg:col-span-7 flex flex-col gap-6">
          <LatestAnalysis latestResult={latestResult} loading={loading} theme={THEME} />
        </section>

        <div className="lg:col-span-12">
          <SentimentTrendChart history={history} />
        </div>

        <HistoryTable history={history} />
      </main>

      <PrintTemplate
        pdfRef={pdfRef}
        totalAnalyzed={totalAnalyzed}
        averageScore={npsScore}
        chartData={chartData}
        history={history}
        theme={THEME}
      />
    </div>
  );
}