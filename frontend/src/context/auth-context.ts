import { createContext, useContext } from 'react';

export interface User {
    _id: string;
    companyName: string;
    email: string;
    token: string;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (companyName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

/**
 * El contexto y su hook viven aparte del componente Provider para que el
 * archivo del Provider solo exporte componentes: es lo que necesita el
 * Fast Refresh de Vite para recargar sin perder el estado.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export const AUTH_STORAGE_KEY = 'hub_user';
