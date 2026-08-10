import { getSentimentStyle } from '../../lib/sentiment';

interface SentimentBadgeProps {
    sentiment: string;
    size?: 'sm' | 'md';
}

export const SentimentBadge = ({ sentiment, size = 'md' }: SentimentBadgeProps) => {
    const style = getSentimentStyle(sentiment);
    const scale = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${style.badge} ${scale}`}>
            {/* El emoji es decorativo: el significado ya lo da la etiqueta. */}
            <span aria-hidden="true">{style.emoji}</span>
            {style.label}
        </span>
    );
};
