import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { codeSnippet, filename, context } = await req.json();

        const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OpenRouter API Key is missing on backend" }, { status: 500 });
        }

        const systemPrompt = `You are a Senior Technical Architect and automated AI Code Reviewer.
Your role is to review a developer's code snippet against the provided codebase architecture and standards.
Analyze the code and output a structured code review report in JSON format.

Assess the code on:
1. "score": Code quality score from 1 to 10.
2. "issues": An array of potential bugs, errors, security problems, or performance issues.
3. "positives": An array of positive things about the implementation (good design, correct patterns).
4. "refactored_suggestion": An optimized refactored version of the pasted code snippet.
5. "styling_and_architecture_compliance": Feedback on whether the snippet complies with the workspace rules and architecture.

Return ONLY valid JSON in this format:
{
    "score": 8,
    "issues": [
        "Variable is declared but never used on line 5",
        "Potential memory leak by not closing database connection pool"
    ],
    "positives": [
        "Uses clean async/await handles",
        "Great separation of controller logic"
    ],
    "refactored_suggestion": "const cleanedFunction = async () => { ... }",
    "styling_and_architecture_compliance": "Fully aligns with the NextJS API route architecture used in this repository."
}`;

        const userPrompt = `Workspace Codebase Context:\n${context || 'No codebase context.'}\n\nFile: ${filename || 'unknown'}\nCode Snippet to Review:\n\`\`\`\n${codeSnippet}\n\`\`\``;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "OnboardAI Code Review",
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                "max_tokens": 1200
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
        console.error("Code Review API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process code review" }, { status: 500 });
    }
}
