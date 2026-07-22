// MongoDB + JWT auth layer — replaces Supabase client

export interface ActionItem {
    task: string;
    assignee?: string;
    priority?: string;
    completed?: boolean;
}

export interface OnboardingData {
    summary: string;
    key_points: string[];
    action_items: ActionItem[];
    health_audit?: {
        score: string;
        positives: string[];
        friction_points: string[];
        recommendations: string[];
    };
    dependency_graph?: string;
}

// ---------- Token helpers ----------

const TOKEN_KEY = 'onboardai_token';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/** Build Authorization header from stored JWT */
function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------- Auth ----------

export const auth = {
    register: async (username: string, email: string, password: string, plan: string = 'free') => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, plan }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setToken(data.token);
        return data;
    },

    login: async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        setToken(data.token);
        return data;
    },

    logout: async () => {
        clearToken();
    },

    loginWithGoogle: async (credential: string) => {
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google login failed');

        setToken(data.token);
        return data;
    },

    getUser: async () => {
        const token = getToken();
        if (!token) return null;

        const res = await fetch('/api/auth/me', {
            headers: { ...authHeaders() },
        });

        if (!res.ok) {
            if (res.status === 401) {
                clearToken();
                return null;
            }
            throw new Error('Failed to fetch user');
        }

        const data = await res.json();
        return data.user;
    },
};

// ---------- Session helpers ----------

/** Returns the stored JWT token (or null). Used by payment components. */
export const getSession = async () => {
    const token = getToken();
    if (!token) return null;
    // Return an object shaped similarly to what components expect
    return { access_token: token };
};

export const isAuthenticated = async (): Promise<boolean> => {
    return !!getToken();
};

// ---------- Onboardings API ----------

export const onboardings = {
    create: async (title: string, notes: string, files?: Array<{ path: string; content: string }>) => {
        const res = await fetch('/api/onboardings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ title, notes, files }),
        });

        const data = await res.json();
        if (!res.ok) {
            if (data.error?.includes('PLAN_LIMIT_REACHED')) {
                throw new Error(data.error);
            }
            throw new Error(data.error || 'Failed to create onboarding');
        }

        return data;
    },

    upload: async (file: File, title: string, notes?: string) => {
        throw new Error("Video/Audio upload is currently disabled because the transcription service (Bytez) has been removed. Please enter your notes manually.");
    },

    processLink: async (url: string, title: string, notes?: string) => {
        throw new Error("Video link processing is currently disabled because the transcription service (Bytez) has been removed. Please enter your notes manually.");
    },

    list: async () => {
        const res = await fetch('/api/onboardings', {
            headers: { ...authHeaders() },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to list onboardings');
        return data;
    },

    get: async (id: string) => {
        const res = await fetch(`/api/onboardings/${id}`, {
            headers: { ...authHeaders() },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get onboarding');
        return data;
    },

    delete: async (id: string) => {
        const res = await fetch(`/api/onboardings/${id}`, {
            method: 'DELETE',
            headers: { ...authHeaders() },
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete onboarding');
        }
    },

    updateActionItems: async (id: string, actionItems: ActionItem[]) => {
        const res = await fetch(`/api/onboardings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ action_items: actionItems }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update action items');
        return data;
    },

    getSyncLogs: async (onboardingId: string) => {
        const res = await fetch(`/api/onboardings/${onboardingId}/sync-logs`, {
            headers: { ...authHeaders() },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get sync logs');
        return data;
    },

    getCodeReviews: async (onboardingId: string) => {
        const res = await fetch(`/api/onboardings/${onboardingId}/reviews`, {
            headers: { ...authHeaders() },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to get code reviews');
        return data;
    },

    createCodeReview: async (onboardingId: string, filename: string, codeSnippet: string, reviewFeedback: any) => {
        const res = await fetch(`/api/onboardings/${onboardingId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ filename, code_snippet: codeSnippet, review_feedback: reviewFeedback }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create code review');
        return data;
    },
};

// Keep summaries alias for backwards compatibility during migration
export const summaries = onboardings;


// Helper to get Data URL from File
const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Transcription functions removed as Bytez is deprecated.
// To restore transcription, integrate OpenAI Whisper or another provider here.
