import { supabase } from './supabase';

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
        throw new Error("Video/Audio upload is currently disabled because the transcription service (Bytez) has been removed. Please enter your notes manually.");
    },

    processLink: async (url: string, title: string, notes?: string) => {
        throw new Error("Video link processing is currently disabled because the transcription service (Bytez) has been removed. Please enter your notes manually.");
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
    const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API Key is missing. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local");
    }

    const system_prompt = `You are an expert AI Onboarding Engineer and Codebase Architect. 
    Your goal is to help new developers understand a codebase quickly.
    Analyze the provided Project Context ("Meeting Title") and Code/Docs ("Notes").
    
    Provide the following structured onboarding guide:
    1. **Architecture Overview**: Explain the high-level design, main components, and data flow (mapped to 'summary').
    2. **Critical Files & Modules**: Highlight the most important files/directories a new dev should read first (mapped to 'key_points').
    3. **Learning Plan**: A step-by-step specific guide (Day 1, Day 2, etc.) with exercises to master the project (mapped to 'action_items').
    
    Return ONLY valid JSON in the following format:
    {
        "summary": "This project uses a Microservices architecture with...",
        "key_points": ["src/api/auth.ts - Handles JWT logic...", "config/db.js - Database connection pool...", "frontend/App.tsx - Main entry point..."],
        "action_items": [
            {"task": "Day 1: Read auth flow and run local build", "assignee": "New Hire", "priority": "High"},
            {"task": "Day 2: Implement a dummy API endpoint", "assignee": "New Hire", "priority": "Medium"}
        ]
    }`;

    const user_prompt = `Project Name: ${title}\n\nCodebase Context/Documentation:\n${notes}`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "Summriate",
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o", // You can change this to any OpenRouter model
                "max_tokens": 1000,
                "messages": [
                    { "role": "system", "content": system_prompt },
                    { "role": "user", "content": user_prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("OpenRouter returned empty content");
        }

        // Parse JSON from content (handling potential markdown code blocks)
        const cleanContent = content.replace(/^```json/, "").replace(/```$/, "").trim();
        return JSON.parse(cleanContent);

    } catch (error: any) {
        console.error("AI Processing Error:", error);
        throw new Error(`AI processing failed: ${error.message}`);
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

// Transcription functions removed as Bytez is deprecated.
// To restore transcription, integrate OpenAI Whisper or another provider here.
