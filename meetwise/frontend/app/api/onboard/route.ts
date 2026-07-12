import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { title, notes } = await req.json();

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OpenRouter API Key is missing on backend" }, { status: 500 });
        }

        const system_prompt = `You are an expert AI Onboarding Engineer and Codebase Architect. 
    Your goal is to help new developers understand a codebase quickly.
    Analyze the provided Project Context ("Meeting Title") and Code/Docs ("Notes").
    
    Provide the following structured onboarding guide:
    1. **Architecture Overview**: Explain the high-level design, main components, and data flow (mapped to 'summary').
    2. **Critical Files & Modules**: Highlight the most important files/directories a new dev should read first (mapped to 'key_points').
    3. **Learning Plan**: A step-by-step specific guide (Day 1, Day 2, etc.) with exercises to master the project (mapped to 'action_items'). Add a "completed" boolean property (default false) to each.
    4. **Codebase Onboarding Health Score & Friction Auditor**: Evaluate setup difficulty, missing config templates, or missing documentation (mapped to 'health_audit').
    5. **Dependency Graph**: Create a Mermaid flowchart representing key folders and libraries (mapped to 'dependency_graph').
    
    Return ONLY valid JSON in the following format:
    {
        "summary": "This project uses a Microservices architecture with...",
        "key_points": ["src/api/auth.ts - Handles JWT logic...", "config/db.js - Database connection pool...", "frontend/App.tsx - Main entry point..."],
        "action_items": [
            {"task": "Day 1: Read auth flow and run local build", "assignee": "New Hire", "priority": "High", "completed": false},
            {"task": "Day 2: Implement a dummy API endpoint", "assignee": "New Hire", "priority": "Medium", "completed": false}
        ],
        "health_audit": {
            "score": "B",
            "positives": ["Readme file is very clear", "Uses Docker Compose for DB setup"],
            "friction_points": ["Missing .env.example template", "No testing framework configured"],
            "recommendations": ["Create a .env.example file", "Add Vitest or Jest setup guide"]
        },
        "dependency_graph": "graph TD\\n  A[Frontend] --> B[API Router]\\n  B --> C[Supabase Database]"
    }`;

        const user_prompt = `Project Name: ${title}\n\nCodebase Context/Documentation:\n${notes}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "OnboardAI Onboarding Analysis",
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o",
                "max_tokens": 1200,
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
        return NextResponse.json(JSON.parse(cleanContent));

    } catch (error: any) {
        console.error("AI Onboard API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process onboarding guide" }, { status: 500 });
    }
}
