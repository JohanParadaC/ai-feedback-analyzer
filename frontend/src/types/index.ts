// ¡Asegúrate de que diga "export type" y "export interface"!
export type Sentiment = 'positivo' | 'negativo' | 'neutral';

export interface AnalysisResult {
    id: number;
    text: string;
    sentiment: Sentiment;
    score: number;
    key_complaint: string | null;
    key_highlight: string | null;
}