import { useState } from 'react';
import type { AnalysisResult, Sentiment } from '../types';

export const useFeedback = () => {
    const [feedback, setFeedback] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<AnalysisResult[]>([]);

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
    };

    return {
        feedback,
        setFeedback,
        loading,
        setLoading,
        history,
        handleAnalyze
    };
};