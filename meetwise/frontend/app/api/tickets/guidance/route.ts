import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { ticketTitle, ticketDescription, context, onboardingId } = await req.json();

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
                    const selectSystemPrompt = `You are a helper bot. Given a task/ticket title and description and a list of file paths in a codebase, select the top 3 files (by their exact paths) that are most likely to need modification or contain logic related to solving this ticket.
Return ONLY a valid JSON array of strings containing the selected file paths, e.g. ["src/components/Navbar.tsx", "src/styles/globals.css"]. Do not include markdown formatting or explanation.`;

                    const selectUserPrompt = `Ticket: "${ticketTitle}"\nDescription: "${ticketDescription}"\n\nCodebase File Paths:\n${dbFiles.map(f => f.path).join("\n")}`;

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

        const systemPrompt = `You are an expert AI Codebase Navigator and Engineering Mentor. 
You are given the file structure and codebase context of a project. 
A developer is trying to solve a specific issue/ticket. 

Analyze the issue details and the codebase context.
Provide a structured, step-by-step guidance guide in JSON format.
You must pinpoint:
1. "files_to_modify": An array of specific file paths they need to edit, explaining why.
2. "relevant_components_or_functions": A description of specific libraries, classes, functions, or UI elements they should interact with.
3. "implementation_steps": A step-by-step ordered list of tasks to complete the ticket.
4. "difficulty_rating": "Easy" | "Medium" | "Hard" with a quick rationale.

Return ONLY valid JSON in this format:
{
    "files_to_modify": [
        {"path": "src/components/Navbar.tsx", "reason": "Modify the logo rendering component to match the new branding"},
        {"path": "src/styles/globals.css", "reason": "Add utility class styles for navbar items"}
    ],
    "relevant_components_or_functions": "The Logo component in Navbar, and tailwind configurations.",
    "implementation_steps": [
        "Locate the Logo component in src/components/Navbar.tsx",
        "Update the image source path and classes to support the new size",
        "Run local build and test standard responsiveness"
    ],
    "difficulty_rating": "Easy (Simple UI and CSS changes)"
}`;

        const userPrompt = `Codebase Context:\n${context || 'No codebase context.'}\n${codeContext}\n\nTicket Title: ${ticketTitle || 'No title'}\nTicket Description: ${ticketDescription || 'No description'}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "OnboardAI Ticket Guidance",
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o",
                "response_format": { "type": "json_object" },
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                "max_tokens": 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || response.statusText);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("OpenRouter returned empty content");
        }

        const cleanContent = content.replace(/^```json/, "").replace(/```$/, "").trim();
        return NextResponse.json(JSON.parse(cleanContent));

    } catch (error: any) {
        console.error("Ticket Guidance API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process ticket guidance" }, { status: 500 });
    }
}
