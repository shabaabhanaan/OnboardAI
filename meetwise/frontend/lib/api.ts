import { supabase } from './supabase';
import Bytez from 'bytez.js';

const BYTEZ_KEY = process.env.NEXT_PUBLIC_BYTEZ_KEY || '4fbe90a3c567502654a7a15933c24420';
const sdk = new Bytez(BYTEZ_KEY);

// Auth API
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

        // Send welcome email (non-blocking)
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

// Summaries API
export const summaries = {
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
                .from('summaries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (count !== null && count >= 1) {
                throw new Error('PLAN_LIMIT_REACHED: Free plan allows only 1 summary. Please upgrade to Pro or Team plan for unlimited summaries.');
            }
        }

        // 2. Process with AI (Bytez)
        const aiResult = await processWithAI(title, notes);

        // 3. Insert into Supabase
        const { data, error } = await supabase
            .from('summaries')
            .insert([{
                title,
                notes,
                summary: aiResult.summary,
                key_points: aiResult.key_points || [],
                action_items: aiResult.action_items || [],
                user_id: user.id
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    upload: async (file: File, title: string, notes?: string) => {
        // 1. Transcribe (Bytez)
        const transcription = await transcribeAudio(file);
        const fullNotes = notes ? `${notes}\n\nRunning Transcription:\n${transcription}` : transcription;

        // 2. Create summary using the transcribed notes
        return summaries.create(title, fullNotes);
    },

    list: async () => {
        const { data, error } = await supabase
            .from('summaries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        // Map action items for frontend compatibility if needed
        return data.map(m => ({
            ...m,
            action_items: m.action_items?.map((item: any) => ({
                ...item,
                task: item.task || item.description // Map description to task
            }))
        }));
    },

    get: async (id: string) => {
        const { data, error } = await supabase
            .from('summaries')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Map action items for frontend compatibility
        return {
            ...data,
            action_items: data.action_items?.map((item: any) => ({
                ...item,
                task: item.task || item.description
            }))
        };
    },

    delete: async (id: string) => {
        const { error } = await supabase
            .from('summaries')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// Internal AI helpers
async function processWithAI(title: string, notes: string) {
    const model = sdk.model("openai/gpt-4o");
    const system_prompt = `You are an expert meeting assistant. Analyze the provided meeting notes and extract:
    1. A concise summary (2-3 paragraphs)
    2. A list of key points
    3. A list of action items with assignees (if mentioned) and priority (High/Medium/Low)
    
    Return ONLY valid JSON in the following format:
    {
        "summary": "...",
        "key_points": ["...", "..."],
        "action_items": [
            {"task": "...", "assignee": "...", "priority": "..."}
        ]
    }`;

    // Note: I changed the prompt to use 'task' directly to avoid mapping issues later

    const user_prompt = `Meeting Title: ${title}\n\nNotes:\n${notes}`;

    const { error, output } = await model.run([
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
    ]);

    if (error) {
        console.error("Bytez AI Error:", error);
        throw new Error(`AI error: ${error}`);
    }

    if (!output) {
        throw new Error("AI output is empty");
    }

    let content = typeof output === 'string' ? output : output.content;
    if (!content) {
        console.error("AI Output structure unexpected:", output);
        throw new Error("AI output content is missing");
    }

    content = content.trim();
    if (content.startsWith("```json")) {
        content = content.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    try {
        return JSON.parse(content);
    } catch (parseError) {
        console.error("Failed to parse AI JSON:", content);
        throw new Error("Failed to parse AI response");
    }
}

// Helper to get Data URL from File
const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

async function transcribeAudio(file: File) {
    const model = sdk.model("openai/whisper-large-v3");

    // Convert File to Data URL for Bytez (Browser-compatible)
    const dataURL = await fileToDataURL(file);
    const { error, output } = await model.run(dataURL);

    if (error) {
        console.error("Bytez Transcription Error:", error);
        throw new Error(`Transcription error: ${error}`);
    }

    if (!output) throw new Error("Transcription output is empty");

    return typeof output === 'string' ? output : output.text;
}
