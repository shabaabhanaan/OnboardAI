import { supabase } from './supabase';

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

export const auth = {
    register: async (username: string, email: string, password: string, plan: string = 'free') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    plan,
                },
            },
        });

        if (error) throw error;

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user?.id, username, email, plan }]);

        if (profileError) console.error('Error creating profile:', profileError);

        // Send welcome email 
        fetch('/api/welcome', {
            method: 'POST',
            body: JSON.stringify({ email, username }),
            headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.error('Failed to trigger welcome email:', err));

        return data;
    },

    login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) return null;

        let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            // Auto-create profile for social login users
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert([{
                    id: user.id,
                    username: user.user_metadata?.full_name || user.email?.split('@')[0],
                    email: user.email,
                    plan: 'free'
                }])
                .select()
                .single();

            if (insertError) console.error('Error auto-creating profile:', insertError);
            profile = newProfile;
        }

        return {
            ...user,
            ...profile,
            username: user.user_metadata?.username || profile?.username || user.user_metadata?.full_name,
            plan: user.user_metadata?.plan || profile?.plan || 'free',
        };
    },

    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw error;
        return data;
    },

    signInWithFacebook: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw error;
        return data;
    },

    signInWithGithub: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
                scopes: 'repo',
            },
        });
        if (error) throw error;
        return data;
    },
};

export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

// For backward compatibility with existing components
// Note: This is now async, so components need to be updated
export const isAuthenticated = async (): Promise<boolean> => {
    const session = await getSession();
    return !!session;
};

// Onboardings API
export const onboardings = {
    create: async (title: string, notes: string) => {
        // 1. Get current user and check plan limits
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get user profile to check plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();

        // Check usage limits for free plan
        if (profile?.plan === 'free') {
            const { count } = await supabase
                .from('onboardings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (count !== null && count >= 1) {
                throw new Error('PLAN_LIMIT_REACHED: Free plan allows only 1 onboarding. Please upgrade to Pro or Team plan for unlimited onboardings.');
            }
        }

        // 2. Process with AI securely via backend route
        const onboardResponse = await fetch('/api/onboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, notes })
        });
        if (!onboardResponse.ok) {
            const errData = await onboardResponse.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to generate onboarding guide from AI server');
        }
        const aiResult: OnboardingData = await onboardResponse.json();

        // 3. Insert into Supabase
        const { data, error } = await supabase
            .from('onboardings')
            .insert([{
                title,
                notes,
                summary: aiResult.summary,
                key_points: aiResult.key_points || [],
                action_items: (aiResult.action_items || []).map(item => ({ ...item, completed: false })),
                health_audit: aiResult.health_audit || {},
                dependency_graph: aiResult.dependency_graph || "",
                user_id: user.id
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    upload: async (file: File, title: string, notes?: string) => {
        throw new Error("Video/Audio upload is currently disabled because the transcription service (Bytez) has been removed. Please enter your notes manually.");
    },

    processLink: async (url: string, title: string, notes?: string) => {
        throw new Error("Video link processing is currently disabled because the transcription service (Bytez) has been removed. Please enter your notes manually.");
    },

    list: async () => {
        const { data, error } = await supabase
            .from('onboardings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        // Map action items for frontend compatibility if needed
        return data.map(m => ({
            ...m,
            action_items: m.action_items?.map((item: ActionItem) => ({
                ...item,
                task: item.task || (item as any).description // Map description to task
            }))
        }));
    },

    get: async (id: string) => {
        const { data, error } = await supabase
            .from('onboardings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Map action items for frontend compatibility
        return {
            ...data,
            action_items: data.action_items?.map((item: ActionItem) => ({
                ...item,
                task: item.task || (item as any).description
            }))
        };
    },

    delete: async (id: string) => {
        const { error } = await supabase
            .from('onboardings')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    updateActionItems: async (id: string, actionItems: ActionItem[]) => {
        const { data, error } = await supabase
            .from('onboardings')
            .update({ action_items: actionItems })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getSyncLogs: async (onboardingId: string) => {
        const { data, error } = await supabase
            .from('sync_logs')
            .select('*')
            .eq('onboarding_id', onboardingId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    getCodeReviews: async (onboardingId: string) => {
        const { data, error } = await supabase
            .from('code_reviews')
            .select('*')
            .eq('onboarding_id', onboardingId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    createCodeReview: async (onboardingId: string, filename: string, codeSnippet: string, reviewFeedback: any) => {
        const { data, error } = await supabase
            .from('code_reviews')
            .insert([{
                onboarding_id: onboardingId,
                filename,
                code_snippet: codeSnippet,
                review_feedback: reviewFeedback
            }])
            .select()
            .single();

        if (error) throw error;
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
