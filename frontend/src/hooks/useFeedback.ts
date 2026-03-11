import { useState } from 'react';
import type { AnalysisResult, Sentiment } from '../types';

export const useFeedback = () => {
    const [feedback, setFeedback] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<AnalysisResult[]>([]);

    // Función 1: Analizar UNA sola reseña
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
                sentiment: data.sentiment.toLowerCase() as Sentiment,
                date: new Date().toISOString() // ✨ CAMBIO: Guardamos la fecha y hora actual
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

    // ✨ NUEVA Función 2: Analizar MUCHAS reseñas (Ahora acepta objetos con fecha) ✨
    const handleBulkAnalyze = async (items: { text: string, date: string }[]) => {
        setLoading(true);

        // Procesamos una por una para no bloquear el servidor de OpenAI
        for (const item of items) {
            if (!item.text.trim()) continue;

            try {
                const response = await fetch('http://localhost:3000/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback: item.text })
                });

                if (response.ok) {
                    const data = await response.json();
                    const newResult: AnalysisResult = {
                        id: Date.now() + Math.random(), // Evita IDs duplicados si va muy rápido
                        text: item.text,
                        ...data,
                        sentiment: data.sentiment.toLowerCase() as Sentiment,
                        date: item.date // ✨ CAMBIO: Usamos la fecha que nos manda el formulario
                    };

                    // Actualizamos el historial enseguida para que se vea la animación
                    setHistory(prev => [newResult, ...prev]);
                }
            } catch (error) {
                console.error("Error en fila masiva:", item.text, error);
            }
        }

        setLoading(false);
    };

    return {
        feedback,
        setFeedback,
        loading,
        setLoading,
        history,
        handleAnalyze,
        handleBulkAnalyze // Exportamos el nuevo superpoder
    };
};