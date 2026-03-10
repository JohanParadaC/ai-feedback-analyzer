interface FeedbackFormProps {
    feedback: string;
    setFeedback: (value: string) => void;
    loading: boolean;
    onAnalyze: () => void;
}

export const FeedbackForm = ({ feedback, setFeedback, loading, onAnalyze }: FeedbackFormProps) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <textarea
                rows={5}
                placeholder="Pega aquí la reseña de tu cliente para que la IA la analice..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-slate-700 resize-none mb-4"
            />
            <button
                onClick={onAnalyze}
                disabled={loading || !feedback}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex justify-center items-center ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                    }`}
            >
                {loading ? 'Procesando IA...' : 'Analizar Reseña'}
            </button>
        </div>
    );
};