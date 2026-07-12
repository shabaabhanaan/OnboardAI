import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { message, history, context, onboardingId } = await req.json();

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OpenRouter API Key is missing on backend" }, { status: 500 });
        }

        // Fetch codebase files if onboardingId is provided for RAG context
        let codeContext = "";
        if (onboardingId) {
            try {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
                const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
                const supabase = createClient(supabaseUrl, supabaseAnonKey);

                const { data: dbFiles } = await supabase
                    .from('codebase_files')
                    .select('path, content')
                    .eq('onboarding_id', onboardingId);

                if (dbFiles && dbFiles.length > 0) {
                    const selectSystemPrompt = `You are a helper bot. Given a user's question and a list of file paths in a codebase, select the top 3 files (by their exact paths) that are most likely to contain the code or documentation needed to answer the question.
Return ONLY a valid JSON array of strings containing the selected file paths, e.g. ["src/utils/auth.ts", "package.json"]. Do not include markdown formatting or explanation.`;

                    const selectUserPrompt = `User Question: "${message}"\n\nCodebase File Paths:\n${dbFiles.map(f => f.path).join("\n")}`;

                    const selectRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                            "X-Title": "OnboardAI RAG Selector",
                        },
                        body: JSON.stringify({
                            "model": "openai/gpt-4o-mini",
                            "messages": [
                                { "role": "system", "content": selectSystemPrompt },
                                { "role": "user", "content": selectUserPrompt }
                            ],
                            "max_tokens": 150
                        })
                    });

                    if (selectRes.ok) {
                        const selectData = await selectRes.json();
                        const selectContent = selectData.choices[0]?.message?.content || "[]";
                        const cleanSelect = selectContent.replace(/^```json/, "").replace(/```$/, "").trim();
                        const selectedPaths = JSON.parse(cleanSelect);

                        if (Array.isArray(selectedPaths)) {
                            selectedPaths.forEach(path => {
                                const file = dbFiles.find(f => f.path === path);
                                if (file) {
                                    codeContext += `\n\n--- FILE: ${file.path} ---\n${file.content}`;
                                }
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Error retrieving codebase files for RAG:", err);
            }
        }

        const messages = [
            {
                role: 'system',
                content: `You are an expert AI Codebase Assistant for the project onboarding workspace. 
You have access to the repository context, structure, package dependencies, and README text provided below.
Help the developer answer any questions regarding how to install, run, modify, or understand this codebase.
Provide file paths, code suggestions, and explain components clearly.

--- CODEBASE CONTEXT ---
${context || 'No codebase context available.'}
${codeContext}`
            }
        ];

        // Add history
        if (Array.isArray(history)) {
            messages.push(...history.map((msg: any) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })));
        }

        // Add current message
        messages.push({ role: 'user', content: message });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "OnboardAI Chat",
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o",
                "messages": messages,
                "max_tokens": 800
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || response.statusText);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "No reply from AI.";

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("AI Chat API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process chat response" }, { status: 500 });
    }
}
