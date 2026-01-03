// API client for backend communication
const API_BASE_URL = 'http://localhost:8001';

// Token management
export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

export const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const token = getToken();

    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(error.detail || 'Request failed');
    }

    return response.json();
}

// Auth API
export const auth = {
    register: async (username: string, email: string, password: string) => {
        return apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    },

    login: async (email: string, password: string) => {
        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.access_token) {
            setToken(data.access_token);
        }
        return data;
    },

    logout: () => {
        removeToken();
    },
};

// Meetings API
export const meetings = {
    create: async (title: string, notes: string) => {
        return apiRequest('/api/meetings', {
            method: 'POST',
            body: JSON.stringify({ title, notes }),
        });
    },

    upload: async (file: File, title: string, notes?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        if (notes) {
            formData.append('notes', notes);
        }

        // Don't set Content-Type header for FormData, browser sets it with boundary
        const token = getToken();
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/meetings/upload`, {
            method: 'POST',
            body: formData,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new Error(error.detail || 'Upload failed');
        }

        return response.json();
    },

    list: async () => {
        return apiRequest('/api/meetings');
    },

    get: async (id: string) => {
        return apiRequest(`/api/meetings/${id}`);
    },

    delete: async (id: string) => {
        return apiRequest(`/api/meetings/${id}`, {
            method: 'DELETE',
        });
    },
};
