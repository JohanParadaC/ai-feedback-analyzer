import { useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext, THEME_STORAGE_KEY } from './theme-context';
import type { Theme } from './theme-context';

/** Primero lo que el usuario eligió; si nunca eligió, lo que pide su sistema. */
const getInitialTheme = (): Theme => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        // localStorage bloqueado (modo privado estricto): seguimos con el sistema.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    // Sincroniza React con el DOM, que es un sistema externo: este sí es el
    // uso correcto de un efecto.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        // Hace que los controles nativos (scrollbars, inputs) sigan el tema.
        root.style.colorScheme = theme;
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Sin persistencia, pero la sesión actual funciona igual.
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
