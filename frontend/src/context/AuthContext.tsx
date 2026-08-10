import { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { AuthContext, AUTH_STORAGE_KEY } from './auth-context';
import type { User } from './auth-context';

/**
 * Lee la sesión guardada.
 *
 * Se ejecuta como inicializador perezoso de useState en vez de dentro de un
 * useEffect: así el primer render ya sabe si hay sesión y desaparecen tanto el
 * render en cascada como el parpadeo de la pantalla de login.
 */
const readStoredUser = (): User | null => {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? (JSON.parse(stored) as User) : null;
    } catch {
        // Valor corrupto o localStorage bloqueado: empezamos sin sesión.
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(readStoredUser);

    const persistUser = useCallback((data: User) => {
        setUser(data);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await apiFetch<User>('/api/auth/login', {
            method: 'POST',
            body: { email, password },
        });
        persistUser(data);
    }, [persistUser]);

    const register = useCallback(async (companyName: string, email: string, password: string) => {
        const data = await apiFetch<User>('/api/auth/register', {
            method: 'POST',
            body: { companyName, email, password },
        });
        persistUser(data);
    }, [persistUser]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }, []);

    // Sin useMemo se crea un objeto nuevo en cada render y los efectos que
    // dependen de `logout` recargan el historial sin motivo.
    const value = useMemo(
        () => ({ user, login, register, logout }),
        [user, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
