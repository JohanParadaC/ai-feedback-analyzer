import { useRef } from 'react';
import { useFeedback } from './hooks/useFeedback';
import { downloadPDF } from './utils/pdfExport';
import { PainPointsChart } from './components/PainPointsChart';

// Importamos nuestras piezas de Lego (Componentes)
import { Header } from './components/Header';
import { FeedbackForm } from './components/FeedbackForm';
import { MetricsPanel } from './components/MetricsPanel';
import { LatestAnalysis } from './components/LatestAnalysis';
import { HistoryTable } from './components/HistoryTable';
import { PrintTemplate } from './components/PrintTemplate';

export default function App() {
  // 1. Traemos toda la lógica y estados desde nuestro Custom Hook
  const { feedback, setFeedback, loading, setLoading, history, handleAnalyze } = useFeedback();

  // 2. Referencia para el PDF
  const pdfRef = useRef<HTMLDivElement>(null);

  // 3. Cálculos de datos (Derivados del historial)
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

  // 4. Renderizado (Nuestra interfaz ahora es 100% declarativa)
  return (
    <div className="min-h-screen p-6 md:p-12 font-sans bg-slate-50 relative overflow-x-hidden">

      <Header
        totalAnalyzed={totalAnalyzed}
        averageScore={averageScore}
        loading={loading}
        onDownloadPDF={() => downloadPDF({ pdfRef, history, setLoading })}
      />

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 p-2 rounded-2xl">
        {/* Columna Izquierda */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <FeedbackForm
            feedback={feedback}
            setFeedback={setFeedback}
            loading={loading}
            onAnalyze={handleAnalyze}
          />
          <MetricsPanel
            chartData={chartData}
            averageScore={averageScore}
          />

          {/* ✨ AQUÍ AGREGAMOS LA NUEVA GRÁFICA ✨ */}
          <PainPointsChart history={history} />

        </section>

        {/* Columna Derecha */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <LatestAnalysis
            latestResult={latestResult}
            loading={loading}
            theme={theme}
          />
        </section>

        {/* Fila Inferior */}
        <HistoryTable history={history} />
      </main>

      {/* Vista oculta para el reporte */}
      <PrintTemplate
        pdfRef={pdfRef}
        totalAnalyzed={totalAnalyzed}
        averageScore={averageScore}
        chartData={chartData}
        history={history}
        theme={theme}
      />

    </div>
  );
}