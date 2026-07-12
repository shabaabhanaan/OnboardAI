import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { message, history, context } = await req.json();

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OpenRouter API Key is missing on backend" }, { status: 500 });
        }

        const messages = [
            {
                role: 'system',
                content: `You are an expert AI Codebase Assistant for the project onboarding workspace. 
You have access to the repository context, structure, package dependencies, and README text provided below.
Help the developer answer any questions regarding how to install, run, modify, or understand this codebase.
Provide file paths, code suggestions, and explain components clearly.

--- CODEBASE CONTEXT ---
${context || 'No codebase context available.'}`
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
