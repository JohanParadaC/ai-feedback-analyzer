/**
 * Iconos SVG en línea (trazo de 1.75, estilo Lucide).
 *
 * Se dibujan con `currentColor`, así heredan el color del texto y funcionan en
 * claro y oscuro sin variantes. Son decorativos: van con aria-hidden y el
 * significado siempre lo aporta el texto o el aria-label del botón que los usa.
 */
interface IconProps {
    className?: string;
}

const base = (className = 'w-4 h-4') => ({
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
});

export const BrainIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M12 5a3 3 0 0 0-3-3 3 3 0 0 0-2.9 2.2A2.8 2.8 0 0 0 4 7a2.8 2.8 0 0 0 .5 1.6A3 3 0 0 0 3 11a3 3 0 0 0 1.5 2.6A2.9 2.9 0 0 0 4 15.5 2.9 2.9 0 0 0 7 18.4 3 3 0 0 0 12 20Z" />
        <path d="M12 5a3 3 0 0 1 3-3 3 3 0 0 1 2.9 2.2A2.8 2.8 0 0 1 20 7a2.8 2.8 0 0 1-.5 1.6A3 3 0 0 1 21 11a3 3 0 0 1-1.5 2.6 2.9 2.9 0 0 1 .5 1.9 2.9 2.9 0 0 1-3 2.9A3 3 0 0 1 12 20Z" />
    </svg>
);

export const SparklesIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9Z" />
        <path d="M18.5 15.5 19.4 17.6 21.5 18.5 19.4 19.4 18.5 21.5 17.6 19.4 15.5 18.5 17.6 17.6Z" />
    </svg>
);

export const UploadIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8 12 3 7 8" />
        <path d="M12 3v13" />
    </svg>
);

export const FileTextIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v5h6" />
        <path d="M9 13h6M9 17h4" />
    </svg>
);

export const TableIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);

export const LogOutIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
    </svg>
);

export const SunIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
);

export const MoonIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
);

export const MailIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 6 10-6" />
    </svg>
);

export const CopyIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

export const CheckIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="m5 13 4 4L19 7" />
    </svg>
);

export const AlertIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
);

export const TrendingUpIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M17 7h4v4" />
    </svg>
);

export const ChevronLeftIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="m15 18-6-6 6-6" />
    </svg>
);

export const ChevronRightIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export const EyeIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const EyeOffIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M10.7 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.8 17.8 0 0 1-3.4 4.3M6.6 6.6A17.6 17.6 0 0 0 2 12s3.6 7 10 7a10.4 10.4 0 0 0 4.5-1" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        <path d="m2 2 20 20" />
    </svg>
);

export const InboxIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z" />
    </svg>
);

export const BuildingIcon = ({ className }: IconProps) => (
    <svg {...base(className)}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
    </svg>
);

export const SpinnerIcon = ({ className = 'w-4 h-4' }: IconProps) => (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);
