import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react'; // ✨ CORRECCIÓN TS

// 1. Definimos cómo se ve nuestro Usuario y nuestra Billetera
interface User {
    _id: string;
    companyName: string;
    email: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (companyName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

// 2. Creamos la "Billetera" vacía
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Este es el componente que envolverá a toda nuestra App
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // ✨ CURA PARA LA AMNESIA DE SESIÓN: Revisar si ya había una llave guardada al abrir la página
    useEffect(() => {
        const storedUser = localStorage.getItem('hub_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // 🚪 FUNCIÓN PARA INICIAR SESIÓN
    const login = async (email: string, password: string) => {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }

        // Si sale bien, guardamos al usuario en React y en el disco duro del navegador
        setUser(data);
        localStorage.setItem('hub_user', JSON.stringify(data));
    };

    // 📝 FUNCIÓN PARA REGISTRARSE
    const register = async (companyName: string, email: string, password: string) => {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al registrar la empresa');
        }

        // Si sale bien, lo logueamos automáticamente
        setUser(data);
        localStorage.setItem('hub_user', JSON.stringify(data));
    };

    // 🛑 FUNCIÓN PARA CERRAR SESIÓN
    const logout = () => {
        setUser(null);
        localStorage.removeItem('hub_user'); // Quemamos la llave
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 4. Un Hook personalizado para usar la billetera fácilmente en cualquier archivo
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};