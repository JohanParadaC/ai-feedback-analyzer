export type Sentiment = 'positivo' | 'negativo' | 'neutral';

export interface AnalysisResult {
    /** `_id` de MongoDB, que es una cadena, no un número. */
    id: string;
    text: string;
    sentiment: Sentiment;
    score: number;
    key_complaint: string | null;
    key_highlight: string | null;
    /** Fecha en formato ISO. */
    date: string;
}

/** Punto del gráfico de reparto por sentimiento. */
export interface ChartDatum {
    name: string;
    value: number;
    color: string;
}
