import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Check if push event
        if (body.ref && body.commits && body.repository) {
            const branch = body.ref.replace('refs/heads/', '');
            const repoUrl = body.repository.html_url;
            const commits = body.commits;
            const headCommit = body.head_commit;

            // 1. Find matching onboarding guides by URL
            const { data: onboardingList } = await supabase
                .from('onboardings')
                .select('id, title, notes, action_items')
                .ilike('notes', `%${repoUrl}%`);

            if (onboardingList && onboardingList.length > 0) {
                const commitMessages = commits.map((c: any) => c.message).join('\n');

                const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
                
                for (const guide of onboardingList) {
                    const tasks = guide.action_items || [];
                    let completedIndices: number[] = [];

                    // 2. Query AI to match commit messages to checklist tasks semantically
                    if (OPENROUTER_API_KEY && tasks.length > 0) {
                        try {
                            const systemPrompt = `You are an expert AI software release auditor.
You are given a list of onboarding tasks for a new developer and a list of commit messages pushed to the repository.
Analyze the commit messages and determine which tasks (by their 0-indexed index) have been successfully addressed or completed by these commits.

Return ONLY a valid JSON array of numbers indicating the 0-indexed indices of the completed tasks. E.g. [0, 2] or [] if no tasks were resolved. Do not include markdown codeblocks or text, just the raw JSON.`;

                            const userPrompt = `Onboarding Tasks Checklist:\n${JSON.stringify(tasks.map((t: any, idx: number) => ({ index: idx, task: t.task })), null, 2)}\n\nPushed Commit Messages:\n${commitMessages}`;

                            const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                                    "Content-Type": "application/json",
                                    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                                    "X-Title": "OnboardAI Webhook Sync",
                                },
                                body: JSON.stringify({
                                    "model": "openai/gpt-4o",
                                    "messages": [
                                        { "role": "system", "content": systemPrompt },
                                        { "role": "user", "content": userPrompt }
                                    ],
                                    "max_tokens": 150
                                })
                            });

                            if (aiResponse.ok) {
                                const data = await aiResponse.json();
                                const content = data.choices[0]?.message?.content || "[]";
                                const cleanContent = content.replace(/^```json/, "").replace(/```$/, "").trim();
                                completedIndices = JSON.parse(cleanContent);
                            }
                        } catch (aiErr) {
                            console.error("AI matching failed during webhook sync:", aiErr);
                        }
                    }

                    // 3. Mark matching tasks as completed in the database
                    const updatedActionItems = tasks.map((item: any, idx: number) => {
                        if (completedIndices.includes(idx)) {
                            return { ...item, completed: true };
                        }
                        return item;
                    });

                    // Update onboarding guide in Supabase
                    await supabase
                        .from('onboardings')
                        .update({ action_items: updatedActionItems })
                        .eq('id', guide.id);

                    // 4. Log the webhook trigger sync event
                    const autoCompletedTasksText = completedIndices.length > 0 
                        ? `Auto-completed ${completedIndices.length} tasks: ${completedIndices.map(idx => `"${tasks[idx]?.task}"`).join(', ')}`
                        : "No new tasks matched the pushed commit messages.";

                    await supabase.from('sync_logs').insert([{
                        onboarding_id: guide.id,
                        event: `GitHub Push on ${branch}`,
                        branch: branch,
                        commit_hash: headCommit?.id?.substring(0, 7) || 'unknown',
                        status: 'success',
                        details: `Sync triggered successfully. Commit msg: "${headCommit?.message || 'No message'}". ${autoCompletedTasksText}`
                    }]);
                }
            }

            return NextResponse.json({ success: true, message: `Sync completed for repo: ${repoUrl}` });
        }

        return NextResponse.json({ success: true, message: "Ignored non-push event or missing repo context" });

    } catch (error: any) {
        console.error("GitHub Webhook Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process webhook" }, { status: 500 });
    }
}
