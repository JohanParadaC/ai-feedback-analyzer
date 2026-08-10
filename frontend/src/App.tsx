import { useRef, useMemo, useState } from 'react';
import { useFeedback } from './hooks/useFeedback';
import type { TimeFilter } from './hooks/useFeedback';
import { downloadPDF } from './utils/pdfExport';
import type { ChartDatum } from './types';

import { Header } from './components/Header';
import { StatsRow } from './components/StatsRow';
import { FeedbackForm } from './components/FeedbackForm';
import { MetricsPanel } from './components/MetricsPanel';
import { LatestAnalysis } from './components/LatestAnalysis';
import { HistoryTable } from './components/HistoryTable';
import { PainPointsChart } from './components/PainPointsChart';
import { SentimentTrendChart } from './components/SentimentTrendChart';
import { PrintTemplate } from './components/PrintTemplate';
import { AuthScreen } from './components/AuthScreen';

import { Button } from './components/ui/Button';
import { SegmentedControl } from './components/ui/SegmentedControl';
import { FileTextIcon, TableIcon, AlertIcon } from './components/ui/Icons';

import { useAuth } from './context/auth-context';
import { SENTIMENT_STYLES } from './lib/sentiment';

const TIME_SEGMENTS: { value: TimeFilter; label: string }[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'all', label: 'Todo' },
];

/** Escapa un campo para CSV: comillas dobladas y todo entre comillas. */
const csvCell = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function App() {
  const { user } = useAuth();
  const {
    feedback, setFeedback, loading, setLoading, history, historyLoading,
    error, setError, bulkProgress, handleAnalyze, handleBulkAnalyze,
    timeFilter, setTimeFilter,
  } = useFeedback();

  const pdfRef = useRef<HTMLDivElement>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const totalAnalyzed = history.length;

  const npsScore = useMemo(() => {
    if (totalAnalyzed === 0) return 0;

    let promoters = 0;
    let detractors = 0;
    history.forEach(item => {
      if (item.score >= 9) promoters++;
      else if (item.score <= 6) detractors++;
    });

    return Math.round(((promoters - detractors) / totalAnalyzed) * 100);
  }, [history, totalAnalyzed]);

  const positiveRate = useMemo(() => {
    if (totalAnalyzed === 0) return 0;
    const positives = history.filter(item => item.sentiment === 'positivo').length;
    return Math.round((positives / totalAnalyzed) * 100);
  }, [history, totalAnalyzed]);

  const topPainPoint = useMemo(() => {
    const counts = history.reduce((acc, curr) => {
      if (curr.key_complaint) acc[curr.key_complaint] = (acc[curr.key_complaint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }, [history]);

  const chartData = useMemo<ChartDatum[]>(() => {
    const counts = history.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (['positivo', 'neutral', 'negativo'] as const)
      .map(key => ({
        name: SENTIMENT_STYLES[key].label,
        value: counts[key] || 0,
        color: SENTIMENT_STYLES[key].hex,
      }))
      .filter(item => item.value > 0);
  }, [history]);

  const latestResult = history.length > 0 ? history[0] : null;

  const downloadCSV = () => {
    if (history.length === 0) return;

    const headers = ['Fecha', 'Sentimiento', 'Puntaje', 'Queja principal', 'Destacado', 'Reseña'];
    const rows = history.map(row => [
      csvCell(new Date(row.date).toLocaleDateString('es')),
      csvCell(row.sentiment),
      row.score,
      csvCell(row.key_complaint ?? 'Ninguna'),
      csvCell(row.key_highlight ?? 'Ninguno'),
      csvCell(row.text),
    ].join(','));

    // El BOM hace que Excel abra el archivo en UTF-8 y no rompa las tildes.
    const csv = '﻿' + [headers.map(csvCell).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `intelligence_hub_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Sin esto el Blob se queda en memoria hasta recargar la página.
    URL.revokeObjectURL(url);
  };

  if (!user) return <AuthScreen />;

  const banner = error || exportError;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">

        {/* ── Barra de contexto: rango temporal + exportaciones ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Panel de análisis
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Resumen del feedback de tus clientes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl<TimeFilter>
              label="Rango de fechas"
              value={timeFilter}
              onChange={setTimeFilter}
              segments={TIME_SEGMENTS}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={downloadCSV}
              disabled={loading || totalAnalyzed === 0}
              icon={<TableIcon className="h-3.5 w-3.5" />}
            >
              CSV
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setExportError(null);
                downloadPDF({ pdfRef, history, setLoading, onError: setExportError });
              }}
              disabled={loading || totalAnalyzed === 0}
              icon={<FileTextIcon className="h-3.5 w-3.5" />}
            >
              PDF
            </Button>
          </div>
        </div>

        {/* Los errores se anuncian en vivo para lectores de pantalla. */}
        {banner && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-rose-200
                       bg-rose-50 p-4 text-sm text-rose-700
                       dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <div className="flex items-start gap-2">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{banner}</span>
            </div>
            <button
              onClick={() => { setError(null); setExportError(null); }}
              aria-label="Cerrar aviso"
              className="shrink-0 font-bold opacity-60 transition-opacity hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mb-6">
          <StatsRow
            totalAnalyzed={totalAnalyzed}
            npsScore={npsScore}
            positiveRate={positiveRate}
            topPainPoint={topPainPoint}
            loading={historyLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <FeedbackForm
              feedback={feedback}
              setFeedback={setFeedback}
              loading={loading}
              bulkProgress={bulkProgress}
              onAnalyze={handleAnalyze}
              onBulkAnalyze={handleBulkAnalyze}
            />
            <MetricsPanel chartData={chartData} npsScore={npsScore} total={totalAnalyzed} />
            <PainPointsChart history={history} />
          </div>

          <div className="lg:col-span-7">
            <LatestAnalysis latestResult={latestResult} loading={historyLoading} />
          </div>

          <div className="lg:col-span-12">
            <SentimentTrendChart history={history} />
          </div>

          <div className="lg:col-span-12">
            <HistoryTable history={history} />
          </div>
        </div>
      </main>

      <PrintTemplate
        pdfRef={pdfRef}
        totalAnalyzed={totalAnalyzed}
        npsScore={npsScore}
        chartData={chartData}
        history={history}
        companyName={user.companyName}
      />
    </div>
  );
}
