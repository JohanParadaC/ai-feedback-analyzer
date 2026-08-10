import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de un ThemeProvider');
    }
    return context;
};

export const THEME_STORAGE_KEY = 'hub_theme';
