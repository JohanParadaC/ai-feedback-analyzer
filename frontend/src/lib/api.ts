/**
 * Cliente HTTP centralizado.
 *
 * La URL del backend se lee de `VITE_API_URL` para que el proyecto pueda
 * desplegarse sin tocar el código. Si no está definida, caemos al backend local
 * de desarrollo.
 */
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** Error de API que conserva el código de estado para poder reaccionar a un 401. */
export class ApiError extends Error {
    // Se declara y asigna aparte porque el proyecto usa `erasableSyntaxOnly`,
    // que prohíbe las propiedades declaradas en los parámetros del constructor.
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

interface RequestOptions {
    method?: 'GET' | 'POST';
    body?: unknown;
    /** Token JWT; si se pasa, se envía como cabecera Authorization. */
    token?: string;
    signal?: AbortSignal;
}

export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, token, signal } = options;

    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    });

    // Una respuesta de error puede no traer JSON (proxy caído, 502 en HTML),
    // así que no asumimos que se pueda parsear.
    if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
            const data = await response.json();
            if (data?.error) message = data.error;
        } catch {
            // Nos quedamos con el mensaje genérico.
        }
        throw new ApiError(message, response.status);
    }

    return response.json() as Promise<T>;
};

export { API_URL };
