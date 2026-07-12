import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url, token: clientToken } = await req.json();

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

        // 2. Fetch headers setup
        const headers: HeadersInit = { 'User-Agent': 'OnboardAI' };
        const token = clientToken || process.env.GITHUB_TOKEN;
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        // Fetch repo info to get default branch
        const repoInfoRes = await fetch(baseUrl, { headers });
        if (!repoInfoRes.ok) {
            throw new Error(`Failed to fetch repository metadata. Status: ${repoInfoRes.status}`);
        }
        const repoInfo = await repoInfoRes.json();
        const defaultBranch = repoInfo.default_branch || "main";

        // 3. Fetch Data in Parallel
        const [readmeRes, packageJsonRes, treeRes] = await Promise.all([
            fetch(`${baseUrl}/readme`, { headers }),
            fetch(`${baseUrl}/contents/package.json`, { headers }),
            fetch(`${baseUrl}/git/trees/${defaultBranch}?recursive=1`, { headers })
        ]);

        // 4. Process Responses
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
        let recursiveFiles: any[] = [];
        if (treeRes.ok) {
            const data = await treeRes.json();
            if (data && Array.isArray(data.tree)) {
                recursiveFiles = data.tree;
                fileTree = data.tree
                    .filter((item: any) => item.type === 'blob' || item.type === 'tree')
                    .map((item: any) =>
                        `${item.type === 'tree' ? '📁' : '📄'} ${item.path}`
                    ).join('\n');
            }
        } else if (treeRes.status === 403) {
            fileTree = "GitHub API Rate Limit Exceeded. Could not fetch file tree.";
        }

        // 5. Filter and download codebase files for semantic search indexing
        const allowedExtensions = [
            '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java', '.cpp', 
            '.c', '.h', '.cs', '.rb', '.rs', '.md', '.html', '.css', 
            '.json', '.yml', '.yaml', '.sql', '.sh'
        ];
        const ignoredPaths = [
            'node_modules/', '.git/', '.github/', 'package-lock.json', 
            'yarn.lock', 'pnpm-lock.yaml', 'dist/', '.next/', 'build/'
        ];

        const candidateFiles = recursiveFiles.filter((item: any) => {
            if (item.type !== 'blob') return false;
            const hasAllowedExt = allowedExtensions.some(ext => item.path.endsWith(ext));
            if (!hasAllowedExt) return false;
            const isIgnored = ignoredPaths.some(ignored => item.path.includes(ignored));
            return !isIgnored;
        });

        // Limit to 25 files
        const filesToDownload = candidateFiles.slice(0, 25);

        // Fetch file contents in parallel
        const downloadedFiles = await Promise.all(
            filesToDownload.map(async (file: any) => {
                try {
                    const contentRes = await fetch(`${baseUrl}/contents/${file.path}`, { headers });
                    if (contentRes.ok) {
                        const contentData = await contentRes.json();
                        if (contentData.content) {
                            const decodedContent = Buffer.from(contentData.content, 'base64').toString('utf-8');
                            return {
                                path: file.path,
                                content: decodedContent
                            };
                        }
                    }
                } catch (e) {
                    console.error(`Failed to download file ${file.path}:`, e);
                }
                return null;
            })
        );
        const validDownloadedFiles = downloadedFiles.filter((f): f is { path: string, content: string } => f !== null);

        // 6. Construct Context String
        let context = `CONTEXT SOURCE: GitHub Repo (${owner}/${repo})\n\n`;
        context += `--- 📂 ROOT FILE STRUCTURE ---\n${fileTree}\n\n`;
        if (packageJson) {
            context += `--- 📦 PACKAGE.JSON ---\n${packageJson}\n\n`;
        }
        context += `--- 📖 README.MD ---\n${readme}`;

        return NextResponse.json({
            title: repo,
            context,
            files: validDownloadedFiles
        });

    } catch (error: any) {
        console.error("GitHub API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch repo data" }, { status: 500 });
    }
}
