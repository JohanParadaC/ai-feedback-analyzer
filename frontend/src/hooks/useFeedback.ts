import { useState, useEffect } from 'react';
import type { AnalysisResult, Sentiment } from '../types';

export const useFeedback = () => {
    const [feedback, setFeedback] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<AnalysisResult[]>([]);

    // ✨ 1. LA CURA PARA LA AMNESIA (Cargar datos al iniciar) ✨
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/feedbacks');
                if (response.ok) {
                    const data = await response.json();

                    // Adaptamos lo que viene de Mongo para que la tabla lo entienda
                    const formattedData: AnalysisResult[] = data.map((item: any) => ({
                        id: item._id, // Mongo usa '_id'
                        text: item.text,
                        sentiment: item.sentiment.toLowerCase() as Sentiment,
                        score: item.score,
                        key_complaint: item.key_complaint,
                        key_highlight: item.key_highlight,
                        date: item.date || item.createdAt
                    }));

                    setHistory(formattedData);
                }
            } catch (error) {
                console.error("Error cargando el historial desde la Base de Datos:", error);
            }
        };

        fetchHistory();
    }, []); // El array vacío significa: "Ejecutar solo 1 vez al cargar la página"

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

            const data = await response.json(); // Ahora 'data' trae la reseña directa de Mongo

            const newResult: AnalysisResult = {
                id: data._id, // ✨ CAMBIO: Usamos el ID real de la base de datos
                text: data.text,
                sentiment: data.sentiment.toLowerCase() as Sentiment,
                score: data.score,
                key_complaint: data.key_complaint,
                key_highlight: data.key_highlight,
                date: data.date || data.createdAt // ✨ CAMBIO: Usamos la fecha de Mongo
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

    // Función 2: Analizar MUCHAS reseñas
    const handleBulkAnalyze = async (items: { text: string, date: string }[]) => {
        setLoading(true);

        // Procesamos una por una para no bloquear el servidor de OpenAI
        for (const item of items) {
            if (!item.text.trim()) continue;

            try {
                const response = await fetch('http://localhost:3000/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback: item.text, date: item.date }) // Mandamos la fecha
                });

                if (response.ok) {
                    const data = await response.json();
                    const newResult: AnalysisResult = {
                        id: data._id, // ✨ CAMBIO: ID de Mongo
                        text: data.text,
                        sentiment: data.sentiment.toLowerCase() as Sentiment,
                        score: data.score,
                        key_complaint: data.key_complaint,
                        key_highlight: data.key_highlight,
                        date: data.date || data.createdAt // ✨ CAMBIO: Fecha de Mongo
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
        handleBulkAnalyze
    };
};