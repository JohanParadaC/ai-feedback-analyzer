import { useState, useEffect } from 'react';
import type { AnalysisResult, Sentiment } from '../types';
// ✨ 1. IMPORTAMOS NUESTRA BILLETERA
import { useAuth } from '../context/AuthContext';

export const useFeedback = () => {
    const [feedback, setFeedback] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<AnalysisResult[]>([]);

    // ✨ 2. EXTRAEMOS AL USUARIO Y SU TOKEN (LA LLAVE)
    const { user, logout } = useAuth();

    // ✨ 3. ACTUALIZAMOS EL EFECTO: Solo carga si hay un usuario logueado
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return; // Si no hay usuario, no hacemos nada

            try {
                const response = await fetch('http://localhost:3000/api/feedbacks', {
                    // 👉 AQUÍ ESTÁ LA MAGIA: LE MOSTRAMOS LA TARJETA AL GUARDIA
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const formattedData: AnalysisResult[] = data.map((item: any) => ({
                        id: item._id,
                        text: item.text,
                        sentiment: item.sentiment.toLowerCase() as Sentiment,
                        score: item.score,
                        key_complaint: item.key_complaint,
                        key_highlight: item.key_highlight,
                        date: item.date || item.createdAt
                    }));
                    setHistory(formattedData);
                } else if (response.status === 401) {
                    // Si el guardia nos rechaza (ej. token caducado), cerramos sesión por seguridad
                    logout();
                }
            } catch (error) {
                console.error("Error cargando el historial:", error);
            }
        };

        fetchHistory();
    }, [user, logout]); // 🔄 Se vuelve a ejecutar cada vez que el usuario inicia sesión

    // Función 1: Analizar UNA sola reseña
    const handleAnalyze = async () => {
        if (!feedback.trim() || !user) return; // Protegemos si no hay sesión
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 👉 TARJETA EN MANO PARA ANALIZAR
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ feedback })
            });

            if (!response.ok) {
                if (response.status === 401) logout();
                throw new Error("Error del servidor");
            }

            const data = await response.json();

            const newResult: AnalysisResult = {
                id: data._id,
                text: data.text,
                sentiment: data.sentiment.toLowerCase() as Sentiment,
                score: data.score,
                key_complaint: data.key_complaint,
                key_highlight: data.key_highlight,
                date: data.date || data.createdAt
            };

            setHistory(prev => [newResult, ...prev]);
            setFeedback("");

        } catch (error) {
            console.error("Error conectando al backend:", error);
            alert("Error al procesar la reseña. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // Función 2: Analizar MUCHAS reseñas
    const handleBulkAnalyze = async (items: { text: string, date: string }[]) => {
        if (!user) return; // Protegemos si no hay sesión
        setLoading(true);

        for (const item of items) {
            if (!item.text.trim()) continue;

            try {
                const response = await fetch('http://localhost:3000/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 👉 TARJETA EN MANO PARA ANÁLISIS MASIVO
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ feedback: item.text, date: item.date })
                });

                if (response.ok) {
                    const data = await response.json();
                    const newResult: AnalysisResult = {
                        id: data._id,
                        text: data.text,
                        sentiment: data.sentiment.toLowerCase() as Sentiment,
                        score: data.score,
                        key_complaint: data.key_complaint,
                        key_highlight: data.key_highlight,
                        date: data.date || data.createdAt
                    };

                    setHistory(prev => [newResult, ...prev]);
                } else if (response.status === 401) {
                    logout();
                    break; // Si falla el token, paramos el ciclo entero
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