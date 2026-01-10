import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // 1. Extract owner/repo
        const cleanUrl = url.replace("https://", "").replace("http://", "").replace("www.", "");
        const parts = cleanUrl.split("/");

        if (parts[0] !== "github.com" || parts.length < 3) {
            return NextResponse.json({ error: "Invalid GitHub URL. Format: https://github.com/owner/repo" }, { status: 400 });
        }

        const owner = parts[1];
        const repo = parts[2].split("#")[0];
        const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

        // 2. Fetch Data in Parallel
        const [readmeRes, packageJsonRes, treeRes] = await Promise.all([
            fetch(`${baseUrl}/readme`, { headers: { 'User-Agent': 'OnboardAI' } }),
            fetch(`${baseUrl}/contents/package.json`, { headers: { 'User-Agent': 'OnboardAI' } }),
            fetch(`${baseUrl}/contents`, { headers: { 'User-Agent': 'OnboardAI' } })
        ]);

        // 3. Process Responses
        let readme = "No README found.";
        if (readmeRes.ok) {
            const data = await readmeRes.json();
            readme = Buffer.from(data.content, 'base64').toString('utf-8');
        }

        let packageJson = null;
        if (packageJsonRes.ok) {
            const data = await packageJsonRes.json();
            packageJson = Buffer.from(data.content, 'base64').toString('utf-8');
        }

        let fileTree = "Could not fetch file tree.";
        if (treeRes.ok) {
            const data = await treeRes.json();
            if (Array.isArray(data)) {
                fileTree = data.map((item: any) =>
                    `${item.type === 'dir' ? '📁' : '📄'} ${item.path}`
                ).join('\n');
            }
        } else if (treeRes.status === 403) {
            fileTree = "GitHub API Rate Limit Exceeded. Could not fetch file tree.";
        }

        // 4. Construct Context String
        let context = `CONTEXT SOURCE: GitHub Repo (${owner}/${repo})\n\n`;
        context += `--- 📂 ROOT FILE STRUCTURE ---\n${fileTree}\n\n`;
        if (packageJson) {
            context += `--- 📦 PACKAGE.JSON ---\n${packageJson}\n\n`;
        }
        context += `--- 📖 README.MD ---\n${readme}`;

        return NextResponse.json({
            title: repo,
            context
        });

    } catch (error: any) {
        console.error("GitHub API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch repo data" }, { status: 500 });
    }
}
