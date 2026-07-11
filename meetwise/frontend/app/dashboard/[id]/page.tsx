"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, 
    Sparkles, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    Calendar, 
    Loader2,
    Brain,
    CheckSquare,
    MessageSquare,
    Activity,
    Send,
    Play,
    Settings,
    FileCode2,
    ShieldAlert,
    TrendingUp,
    GitPullRequest,
    Code2,
    History,
    Globe,
    RefreshCw,
    Terminal,
    ArrowRight,
    Info,
    Menu,
    X
} from "lucide-react";
import { onboardings } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface Summary {
    id: string;
    title: string;
    notes: string;
    summary: string;
    key_points: string[];
    action_items: Array<{ task: string; priority: string; assignee?: string; completed?: boolean }>;
    health_audit?: {
        score: string;
        positives: string[];
        friction_points: string[];
        recommendations: string[];
    };
    dependency_graph?: string;
    created_at: string;
}

interface SyncLog {
    id: string;
    event: string;
    branch: string;
    commit_hash: string;
    status: string;
    details: string;
    created_at: string;
}

interface TicketGuidance {
    files_to_modify: Array<{ path: string; reason: string }>;
    relevant_components_or_functions: string;
    implementation_steps: string[];
    difficulty_rating: string;
}

export default function MeetingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showOriginalNotes, setShowOriginalNotes] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // Feature States
    const [activeTab, setActiveTab] = useState<"overview" | "files" | "plan" | "health" | "chat" | "tickets" | "sync" | "reviews">("overview");
    const [updatingTasks, setUpdatingTasks] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Graph Explorer States
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // Chat States
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
        { sender: "ai", text: "Hello! I am your AI Onboarding Assistant. Ask me anything about this codebase, architecture, setup steps, or where specific files are located." }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    // Ticket Guidance States
    const [ticketTitle, setTicketTitle] = useState("");
    const [ticketDesc, setTicketDesc] = useState("");
    const [ticketGuidance, setTicketGuidance] = useState<TicketGuidance | null>(null);
    const [ticketLoading, setTicketLoading] = useState(false);

    // Webhooks & Sync States
    const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
    const [syncLoading, setSyncLoading] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");

    // Code Review States
    const [reviewSnippet, setReviewSnippet] = useState("");
    const [reviewFilename, setReviewFilename] = useState("");
    const [codeReviews, setCodeReviews] = useState<Array<{ id: string; filename: string; code_snippet: string; review_feedback: any; created_at: string }>>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewsLoadingHistory, setReviewsLoadingHistory] = useState(false);

    // Health Audit Details States
    const [expandedFrictionIndex, setExpandedFrictionIndex] = useState<number | null>(null);
    const [expandedRecIndex, setExpandedRecIndex] = useState<number | null>(null);
    const [expandedTaskIndex, setExpandedTaskIndex] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWebhookUrl(`${window.location.origin}/api/webhooks/github`);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                loadSummary();
            }
        }
    }, [params.id, router, user, authLoading]);

    useEffect(() => {
        if (activeTab === "sync" && summary) {
            loadSyncLogs();
        }
    }, [activeTab, summary]);

    useEffect(() => {
        if (activeTab === "reviews" && summary) {
            loadCodeReviews();
        }
    }, [activeTab, summary]);

    const loadSummary = async () => {
        try {
            const data = await onboardings.get(params.id as string);
            setSummary(data);
        } catch (err: any) {
            setError(err.message || "Failed to load onboarding");
        } finally {
            setLoading(false);
        }
    };

    const loadSyncLogs = async () => {
        if (!summary) return;
        setSyncLoading(true);
        try {
            const data = await onboardings.getSyncLogs(summary.id);
            setSyncLogs(data);
        } catch (err) {
            console.error("Failed to load sync logs:", err);
        } finally {
            setSyncLoading(false);
        }
    };

    const loadCodeReviews = async () => {
        if (!summary) return;
        setReviewsLoadingHistory(true);
        try {
            const data = await onboardings.getCodeReviews(summary.id);
            setCodeReviews(data);
        } catch (err) {
            console.error("Failed to load code reviews:", err);
        } finally {
            setReviewsLoadingHistory(false);
        }
    };

    const handleRequestReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewSnippet.trim() || !summary || reviewLoading) return;

        setReviewLoading(true);
        try {
            const response = await fetch("/api/reviews/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codeSnippet: reviewSnippet,
                    filename: reviewFilename || "unnamed_file.ts",
                    context: summary.notes
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to analyze code snippet");

            // Save review feedback to database
            await onboardings.createCodeReview(summary.id, reviewFilename || "unnamed_file.ts", reviewSnippet, data);
            
            // Reset input and reload history
            setReviewSnippet("");
            setReviewFilename("");
            await loadCodeReviews();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this onboarding guide?")) {
            return;
        }

        setDeleting(true);
        try {
            await onboardings.delete(params.id as string);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to delete summary");
            setDeleting(false);
        }
    };

    const handleToggleTask = async (taskIndex: number) => {
        if (!summary) return;
        setUpdatingTasks(true);

        const updatedActionItems = summary.action_items.map((item, idx) => {
            if (idx === taskIndex) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });

        try {
            await onboardings.updateActionItems(summary.id, updatedActionItems);
            setSummary({
                ...summary,
                action_items: updatedActionItems
            });
        } catch (err: any) {
            console.error("Failed to update task status:", err);
            alert("Could not update task status");
        } finally {
            setUpdatingTasks(false);
        }
    };

    const handleSendChatMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !summary || chatLoading) return;

        const userMsg = chatInput.trim();
        setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
        setChatInput("");
        setChatLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: chatMessages.slice(1), 
                    context: summary.notes
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to get reply from AI assistant");
            }

            setChatMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
        } catch (err: any) {
            setChatMessages(prev => [...prev, { sender: "ai", text: `Sorry, I encountered an error: ${err.message}` }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleGetTicketGuidance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketTitle.trim() || !summary || ticketLoading) return;

        setTicketLoading(true);
        try {
            const response = await fetch("/api/tickets/guidance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketTitle,
                    ticketDescription: ticketDesc,
                    context: summary.notes
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to analyze ticket");

            setTicketGuidance(data);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setTicketLoading(false);
        }
    };

    const handleSimulatePush = async () => {
        if (!summary) return;
        try {
            const response = await fetch("/api/webhooks/github", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ref: "refs/heads/main",
                    commits: [
                        {
                            id: Math.random().toString(36).substring(2, 9),
                            message: "Refactored user authentication endpoints and optimized DB queries",
                            timestamp: new Date().toISOString(),
                            author: { name: user?.username || "Developer" }
                        }
                    ],
                    repository: {
                        html_url: `https://github.com/developer/${summary.title.toLowerCase()}`
                    },
                    head_commit: {
                        id: Math.random().toString(36).substring(2, 9),
                        message: "Refactored user authentication endpoints and optimized DB queries",
                        author: { name: user?.username || "Developer" }
                    }
                })
            });

            if (response.ok) {
                await loadSyncLogs();
            }
        } catch (err) {
            console.error("Failed to simulate push:", err);
        }
    };

    const getPriorityColor = (priority: string) => {
        const p = priority.toLowerCase();
        if (p === "high") return "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-900";
        if (p === "medium") return "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-900";
        return "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900";
    };

    const getHealthScoreColor = (score: string) => {
        const s = score.toUpperCase();
        if (s.startsWith("A")) return "from-emerald-500 to-green-600 shadow-emerald-500/25";
        if (s.startsWith("B")) return "from-teal-500 to-emerald-600 shadow-teal-500/25";
        if (s.startsWith("C")) return "from-amber-500 to-orange-600 shadow-amber-500/25";
        if (s.startsWith("D")) return "from-orange-500 to-red-600 shadow-orange-500/25";
        return "from-rose-500 to-red-600 shadow-rose-500/25";
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Onboarding guide not found"}</p>
                    <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Progress percentage
    const completedTasks = summary.action_items?.filter(t => t.completed).length || 0;
    const totalTasks = summary.action_items?.length || 0;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Health score defaults
    const audit = summary.health_audit || {
        score: "B",
        positives: ["Source files organized standardly", "Found package manager configuration"],
        friction_points: ["Ensure all environment variables have a template setup file"],
        recommendations: ["Create a detailed setup checklist in README.md"]
    };

    const parseMermaidNodes = (graphText: string) => {
        if (!graphText) return { nodes: [], connections: [] };
        const lines = graphText.split("\n");
        const connections: Array<{ from: string; to: string }> = [];
        const labelMap: Record<string, string> = {};
        const nodeIds = new Set<string>();

        // First pass: extract labels if defined like: A[Frontend] or B("API") or A --> B
        lines.forEach(line => {
            let cleanLine = line.replace(/graph\s+(TD|LR|TB|BT);?/, "").trim();
            if (!cleanLine || cleanLine.startsWith("%%")) return;

            const nodeRegex = /([A-Za-z0-9_-]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})/g;
            let match;
            while ((match = nodeRegex.exec(cleanLine)) !== null) {
                const id = match[1];
                const label = match[2] || match[3] || match[4] || id;
                labelMap[id] = label;
            }

            // Extract connections
            if (cleanLine.includes("-->")) {
                const parts = cleanLine.split("-->");
                for (let i = 0; i < parts.length - 1; i++) {
                    const fromRaw = parts[i].trim();
                    const toRaw = parts[i+1].trim();

                    const fromId = fromRaw.split(/[\[\({]/)[0].trim();
                    const toId = toRaw.split(/[\[\({]/)[0].trim();

                    if (fromId && toId) {
                        connections.push({ from: fromId, to: toId });
                        nodeIds.add(fromId);
                        nodeIds.add(toId);
                    }
                }
            }
        });

        // Map IDs to display names
        const nodes = Array.from(nodeIds).map(id => labelMap[id] || id);
        const mappedConnections = connections.map(c => ({
            from: labelMap[c.from] || c.from,
            to: labelMap[c.to] || c.to
        }));

        return { nodes, connections: mappedConnections };
    };

    const graphData = parseMermaidNodes(summary.dependency_graph || "");

    // Mock details for selected node
    const getNodeMetadata = (node: string) => {
        const desc = `Key folder or architectural layer responsible for core routines associated with ${node}.`;
        const upstream = graphData.connections.filter(c => c.to === node).map(c => c.from);
        const downstream = graphData.connections.filter(c => c.from === node).map(c => c.to);
        return { desc, upstream, downstream };
    };

    const getHealthAuditDetails = (itemText: string) => {
        const text = itemText.toLowerCase();
        if (text.includes("readme")) {
            return {
                severity: "High",
                impact: "Without a setup guide, new hires spend hours guessing configuration rules, command scripts, and installation steps.",
                context: "No README.md or similar installation file found in the root directory.",
                template: `# Project Name\n\n## Get Started\n1. Install dependencies:\n   \`\`\`bash\n   npm install\n   \`\`\`\n2. Configure variables:\n   Copy \`.env.example\` to \`.env.local\`\n3. Run development server:\n   \`\`\`bash\n   npm run dev\n   \`\`\``
            };
        }
        if (text.includes(".env") || text.includes("environment")) {
            return {
                severity: "High",
                impact: "Developers face runtime errors or database connection failures when key credentials are not outlined.",
                context: "References to process.env variables (Supabase URL, Anon Key, OpenRouter) exist but no .env.example file exists.",
                template: `# Environment variables template\nNEXT_PUBLIC_SUPABASE_URL=your_supabase_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\nNEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key`
            };
        }
        if (text.includes("test") || text.includes("testing")) {
            return {
                severity: "Medium",
                impact: "Developers cannot verify their code changes for regressions locally before submitting Pull Requests.",
                context: "No testing configurations (Jest, Cypress, Playwright, Vitest) detected in codebase.",
                template: `// To install Jest:\n// npm install --save-dev jest @types/jest ts-jest\n\nmodule.exports = {\n  preset: 'ts-jest',\n  testEnvironment: 'node',\n};`
            };
        }
        return {
            severity: "Low",
            impact: "A minor detail that can be improved to streamline codebase documentation.",
            context: "General improvement suggestion.",
            template: null
        };
    };

    const getLearningTaskDetails = (taskText: string) => {
        const text = taskText.toLowerCase();
        if (text.includes("auth") || text.includes("build") || text.includes("structure") || text.includes("day 1")) {
            return {
                objective: "Explore the directory structure, identify entry points, and test compiling the app locally.",
                instructions: [
                    "Locate code modules: check folder structures like /src/auth.ts or /app/api/auth.",
                    "Verify node dependencies: run 'npm install' in the project folder.",
                    "Run a local test build: run 'npm run build' in terminal to compile the application and verify typescript type safety.",
                    "Verify JWT structure: examine how user sessions are stored and validated."
                ],
                files: ["src/auth.ts", "package.json"],
                code: `// To verify your local server build, run this in your terminal:\n$ npm install\n$ npm run build`
            };
        }
        if (text.includes("database") || text.includes("connection") || text.includes("query") || text.includes("day 2")) {
            return {
                objective: "Locate Supabase or standard database pool configs, write queries, and check connection logs.",
                instructions: [
                    "Open database connector files (like database/connection.js or supabase/schema.sql).",
                    "Verify local variables: ensure supabase keys exist in .env.local.",
                    "Execute query: write a basic SELECT statement inside your route to fetch active records."
                ],
                files: ["database/connection.js", "supabase/schema.sql", ".env.local"],
                code: `-- Verify database connection:\nSELECT 1;\n\n-- Create example table:\nCREATE TABLE test_connection (\n  id SERIAL PRIMARY KEY,\n  checked_at TIMESTAMP DEFAULT NOW()\n);`
            };
        }
        return {
            objective: "Complete designated onboarding milestones defined for this repository.",
            instructions: [
                "Locate the related code files.",
                "Implement modifications matching task description details.",
                "Review code changes against design patterns."
            ],
            files: ["N/A"],
            code: null
        };
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative">
            {/* Mobile Sidebar backdrop overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            {/* Left Sidebar */}
            <aside className={`w-80 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col justify-between shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
                <div className="flex flex-col overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                OnboardAI
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Link
                                href="/dashboard"
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Close Menu"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Repository details */}
                    <div className="p-6 border-b border-slate-200 dark:border-gray-800 space-y-1">
                        <h2 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug" title={summary.title}>
                            {summary.title}
                        </h2>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(summary.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-4 space-y-1">
                        {[
                            { id: "overview", label: "Architecture Overview", icon: Brain },
                            { id: "files", label: "Visual Graph", icon: FileCode2 },
                            { id: "plan", label: "Learning Plan", icon: CheckSquare },
                            { id: "health", label: "Health Audit", icon: Activity },
                            { id: "chat", label: "AI Q&A Assistant", icon: MessageSquare },
                            { id: "tickets", label: "First Ticket Guide", icon: Terminal },
                            { id: "reviews", label: "AI Code Reviews", icon: Code2 },
                            { id: "sync", label: "GitHub Webhook & Sync", icon: GitPullRequest }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? "bg-indigo-650 text-white shadow-md shadow-indigo-600/10"
                                            : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/40"
                                    }`}
                                >
                                    <Icon className="w-4.5 h-4.5 shrink-0" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Progress & Actions */}
                <div className="p-6 border-t border-slate-200 dark:border-gray-800 space-y-4">
                    {/* Learning progress */}
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-gray-950 p-4 rounded-2xl border border-slate-150 dark:border-gray-850">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                                    strokeWidth="4"
                                />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    className="stroke-indigo-600 dark:stroke-indigo-400 fill-none transition-all duration-500"
                                    strokeWidth="4"
                                    strokeDasharray={126}
                                    strokeDashoffset={126 - (126 * progressPercent) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-xs font-black text-slate-800 dark:text-white">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
                                Learning Progress
                            </h4>
                            <p className="text-xs text-slate-400 font-bold">
                                {completedTasks} of {totalTasks} finished
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? "Deleting..." : "Delete Guide"}
                    </button>
                </div>
            </aside>

            {/* Right Main Content Panel */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-gray-950/40 p-4 md:p-10 relative">
                {/* Mobile Top Header */}
                <div className="lg:hidden flex items-center justify-between bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-4 rounded-2xl mb-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
                        >
                            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </button>
                        <span className="font-extrabold text-slate-850 dark:text-white truncate max-w-44 text-sm">
                            {summary.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md">
                            {Math.round(progressPercent)}% Done
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    {/* Tab Views */}
                    <div className="min-h-96">
                        {/* Tab 1: Architecture Overview */}
                        {activeTab === "overview" && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        High-Level Architecture Overview
                                    </h3>
                                </div>
                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                    {summary.summary}
                                </div>

                                {/* System Integration Sequence Diagram */}
                                <div className="pt-6 border-t border-gray-150 dark:border-gray-750 space-y-4">
                                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                                        System Integration Sequence Diagram
                                    </h4>
                                    <div className="p-6 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-slate-150 dark:border-gray-800 overflow-x-auto">
                                        <div className="min-w-[600px] space-y-6">
                                            {/* Actors / Lifelines Headers */}
                                            <div className="grid grid-cols-4 text-center font-bold text-xs">
                                                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">GitHub Client</div>
                                                <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">Webhook API</div>
                                                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">OpenRouter AI</div>
                                                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">Supabase DB</div>
                                            </div>

                                            {/* Lifeline vertical dashes & messages container */}
                                            <div className="relative h-[280px] mt-4">
                                                {/* Lifeline Vertical Tracks */}
                                                <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
                                                    <div className="h-full border-r border-dashed border-gray-300 dark:border-gray-700 mx-auto w-0"></div>
                                                    <div className="h-full border-r border-dashed border-gray-300 dark:border-gray-700 mx-auto w-0"></div>
                                                    <div className="h-full border-r border-dashed border-gray-300 dark:border-gray-700 mx-auto w-0"></div>
                                                    <div className="h-full border-r border-dashed border-gray-300 dark:border-gray-700 mx-auto w-0"></div>
                                                </div>

                                                {/* Message 1: GitHub Client -> Webhook API */}
                                                <div className="absolute top-[20px] left-[12.5%] w-[25%] flex flex-col items-center">
                                                    <span className="text-[9px] font-extrabold text-indigo-600 bg-white dark:bg-gray-900 px-2 py-0.5 border border-indigo-200 dark:border-indigo-900 rounded shadow-sm z-10 -translate-y-2">
                                                        1. Git Push Payload
                                                    </span>
                                                    <div className="w-full flex items-center justify-end relative h-3">
                                                        <div className="w-full border-t-2 border-indigo-500"></div>
                                                        <ArrowRight className="w-3 h-3 text-indigo-500 absolute -right-1.5 -top-1" />
                                                    </div>
                                                </div>

                                                {/* Message 2: Webhook API -> OpenRouter AI */}
                                                <div className="absolute top-[85px] left-[37.5%] w-[25%] flex flex-col items-center">
                                                    <span className="text-[9px] font-extrabold text-purple-600 bg-white dark:bg-gray-900 px-2 py-0.5 border border-purple-200 dark:border-purple-900 rounded shadow-sm z-10 -translate-y-2">
                                                        2. Match Commits with Tasks
                                                    </span>
                                                    <div className="w-full flex items-center justify-end relative h-3">
                                                        <div className="w-full border-t-2 border-purple-500"></div>
                                                        <ArrowRight className="w-3 h-3 text-purple-500 absolute -right-1.5 -top-1" />
                                                    </div>
                                                </div>

                                                {/* Message 3: OpenRouter AI -> Webhook API (Returns matches) */}
                                                <div className="absolute top-[150px] left-[37.5%] w-[25%] flex flex-col items-center">
                                                    <span className="text-[9px] font-extrabold text-emerald-600 bg-white dark:bg-gray-900 px-2 py-0.5 border border-emerald-200 dark:border-emerald-900 rounded shadow-sm z-10 -translate-y-2">
                                                        3. Return Semantic Matches
                                                    </span>
                                                    <div className="w-full flex items-center justify-start relative h-3">
                                                        <ArrowLeft className="w-3 h-3 text-emerald-500 absolute -left-1.5 -top-1" />
                                                        <div className="w-full border-t-2 border-dashed border-emerald-500"></div>
                                                    </div>
                                                </div>

                                                {/* Message 4: Webhook API -> Supabase DB */}
                                                <div className="absolute top-[215px] left-[37.5%] w-[50%] flex flex-col items-center">
                                                    <span className="text-[9px] font-extrabold text-amber-600 bg-white dark:bg-gray-900 px-2 py-0.5 border border-amber-200 dark:border-amber-900 rounded shadow-sm z-10 -translate-y-2">
                                                        4. Save Checklist & Sync Logs
                                                    </span>
                                                    <div className="w-full flex items-center justify-end relative h-3">
                                                        <div className="w-full border-t-2 border-amber-500"></div>
                                                        <ArrowRight className="w-3 h-3 text-amber-500 absolute -right-1.5 -top-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* UML Core Components Structure */}
                                <div className="pt-6 border-t border-gray-150 dark:border-gray-750 space-y-4">
                                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                                        UML Core System Module Architecture
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                        <div className="p-4 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl space-y-2">
                                            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wide">Client Interface</span>
                                            <h5 className="font-extrabold text-xs">Dashboard Workspace</h5>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Renders flow explorer pipelines, chat guides, reviews log panels, and settings tabs.</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl space-y-2">
                                            <span className="text-[11px] font-black text-purple-600 uppercase tracking-wide">Orchestration</span>
                                            <h5 className="font-extrabold text-xs">LLM Agent Router</h5>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Delegates contextual guidance queries, code reviews, and issue locations to OpenRouter models.</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl space-y-2">
                                            <span className="text-[11px] font-black text-emerald-650 uppercase tracking-wide">Sync Gateway</span>
                                            <h5 className="font-extrabold text-xs">Webhook Receiver</h5>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Listens for branch pushes, analyzes diffs, updates embeddings, and triggers auto-checklist reviews.</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-xl space-y-2">
                                            <span className="text-[11px] font-black text-amber-600 uppercase tracking-wide">Data Core</span>
                                            <h5 className="font-extrabold text-xs">Supabase Database</h5>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Stores user profiles, onboarding notes, task items, review records, and webhook push logs.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Files & Dependency Graph */}
                        {activeTab === "files" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                                {/* Left Side: Critical Files List */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <FileCode2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Critical Modules & Entry Points
                                        </h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {summary.key_points && summary.key_points.map((point, index) => (
                                            <li 
                                                key={index} 
                                                className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                    {point}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Right Side: Visual Graph Representation */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Interactive Module Map Explorer
                                        </h3>
                                    </div>

                                    {graphData.nodes.length > 0 ? (
                                        <div className="space-y-6">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Click on any module node below to inspect imports, connections, and flow directions.
                                            </p>
                                            
                                            {/* Visual Nodes Grid */}
                                            <div className="flex flex-wrap justify-center gap-3 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850">
                                                {graphData.nodes.map((node, i) => {
                                                    const isSelected = selectedNode === node;
                                                    return (
                                                        <button 
                                                            key={i} 
                                                            onClick={() => setSelectedNode(node)}
                                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                                                                isSelected
                                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                                                                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                                            }`}
                                                        >
                                                            {node}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Visual Flow diagram */}
                                            {graphData.connections.length > 0 && (
                                                <div className="flex flex-col gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850">
                                                    <h4 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">
                                                        Dependency Link Flow Map
                                                    </h4>
                                                    <div className="flex flex-col gap-3">
                                                        {graphData.connections.map((c, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 bg-white dark:bg-gray-850 p-3.5 rounded-xl border border-gray-150 dark:border-gray-750 shadow-sm hover:border-indigo-500 transition-colors">
                                                                <div className="px-3.5 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold rounded-lg text-xs">
                                                                    {c.from}
                                                                </div>
                                                                <div className="flex-1 flex items-center justify-center relative">
                                                                    <div className="w-full border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>
                                                                    <span className="absolute bg-gray-50 dark:bg-gray-900 px-2 text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">
                                                                        imports
                                                                    </span>
                                                                    <ArrowRight className="w-4 h-4 text-indigo-500 absolute right-0" />
                                                                </div>
                                                                <div className="px-3.5 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold rounded-lg text-xs">
                                                                    {c.to}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Node Details Inspector */}
                                            {selectedNode && (
                                                <div className="p-5 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-4 animate-fadeIn">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-extrabold text-sm text-indigo-700 dark:text-indigo-400">
                                                            🔍 Node: {selectedNode}
                                                        </h4>
                                                        <button 
                                                            onClick={() => setSelectedNode(null)}
                                                            className="text-xs text-gray-400 hover:text-gray-600"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                    
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {getNodeMetadata(selectedNode).desc}
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-indigo-100/45 dark:border-indigo-900/30">
                                                        <div>
                                                            <span className="font-bold text-gray-500">Upstream (Imports):</span>
                                                            <div className="mt-1 space-y-1">
                                                                {getNodeMetadata(selectedNode).upstream.length > 0 ? (
                                                                    getNodeMetadata(selectedNode).upstream.map((u, k) => (
                                                                        <div key={k} className="text-gray-700 dark:text-gray-300">• {u}</div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-gray-400 italic">None</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-gray-500">Downstream (Imported By):</span>
                                                            <div className="mt-1 space-y-1">
                                                                {getNodeMetadata(selectedNode).downstream.length > 0 ? (
                                                                    getNodeMetadata(selectedNode).downstream.map((d, k) => (
                                                                        <div key={k} className="text-gray-700 dark:text-gray-300">• {d}</div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-gray-400 italic">None</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                                            <FileCode2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-sm">Mermaid diagram flow represents module configurations.</p>
                                            {summary.dependency_graph && (
                                                <pre className="mt-4 p-4 text-xs font-mono text-left bg-gray-50 dark:bg-gray-900 border dark:border-gray-850 rounded-xl overflow-x-auto text-gray-600 dark:text-gray-400">
                                                    {summary.dependency_graph}
                                                </pre>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Interactive Learning Plan */}
                        {activeTab === "plan" && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                            <CheckSquare className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Personalized Onboarding Learning Plan
                                        </h3>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        {completedTasks}/{totalTasks} Completed
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {summary.action_items && summary.action_items.map((item, index) => {
                                        const isExpanded = expandedTaskIndex === index;
                                        const details = getLearningTaskDetails(item.task);
                                        return (
                                            <div
                                                key={index}
                                                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                                    item.completed
                                                        ? "bg-indigo-50/10 dark:bg-indigo-950/5 border-indigo-200/60 dark:border-indigo-900/60 opacity-90"
                                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                                                }`}
                                            >
                                                {/* Header / Clickable Card Body */}
                                                <div 
                                                    onClick={() => setExpandedTaskIndex(isExpanded ? null : index)}
                                                    className="p-5 flex items-start gap-4 cursor-pointer select-none"
                                                >
                                                    {/* Checkbox Trigger block */}
                                                    <div 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!updatingTasks) handleToggleTask(index);
                                                        }}
                                                        className="mt-0.5 shrink-0"
                                                    >
                                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                                            item.completed
                                                                ? "bg-indigo-650 border-indigo-650 text-white"
                                                                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:border-indigo-500"
                                                        }`}>
                                                            {item.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <p className={`font-bold text-gray-850 dark:text-gray-150 leading-relaxed text-sm ${
                                                            item.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
                                                        }`}>
                                                            {item.task}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-gray-450 dark:text-gray-550">
                                                            {item.assignee && (
                                                                <span>
                                                                    Role: <span className="font-bold text-gray-500 dark:text-gray-400">{item.assignee}</span>
                                                                </span>
                                                            )}
                                                            <span>•</span>
                                                            <span className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                                {isExpanded ? "Hide Setup Steps" : "View Setup Steps"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(item.priority || "Medium")}`}>
                                                            {item.priority || "Medium"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expanded Step-by-Step Instructions & Code Guide */}
                                                {isExpanded && (
                                                    <div className="p-6 bg-slate-50 dark:bg-gray-950 border-t border-gray-155 dark:border-gray-850 space-y-4 text-xs animate-fadeIn">
                                                        <div>
                                                            <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wide">Objective</span>
                                                            <p className="mt-1 text-gray-700 dark:text-gray-350 leading-relaxed">{details.objective}</p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wide">Action Instructions</span>
                                                            <div className="space-y-2 mt-1">
                                                                {details.instructions.map((step, idx) => (
                                                                    <div key={idx} className="flex gap-2.5 items-start">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                                                                        <span className="text-gray-650 dark:text-gray-350 leading-relaxed">{step}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wide block w-full">Files to Inspect / Modify</span>
                                                            {details.files.map((file, idx) => (
                                                                <span key={idx} className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-md font-mono text-[10px] text-indigo-650 dark:text-indigo-400">
                                                                    {file}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {details.code && (
                                                            <div>
                                                                <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wide">Command / Code Snippet Guide</span>
                                                                <pre className="mt-2 p-3 bg-white dark:bg-black border dark:border-gray-850 rounded-xl overflow-x-auto text-[10px] font-mono text-gray-750 dark:text-gray-300 select-all">
                                                                    {details.code}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Health & Friction Audit */}
                        {activeTab === "health" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                                {/* Score Widget */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col justify-center items-center text-center space-y-6">
                                    <h4 className="font-extrabold text-gray-800 dark:text-gray-200 text-lg uppercase tracking-wider">
                                        Onboarding Score
                                    </h4>
                                    <div className={`w-36 h-36 rounded-full bg-gradient-to-br ${getHealthScoreColor(audit.score)} flex items-center justify-center text-white text-6xl font-black shadow-2xl relative`}>
                                        {audit.score}
                                        <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-90"></div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                        This rating represents how easily a newly joined developer can start running and contributing to this project.
                                    </p>
                                </div>

                                {/* Detailed Audits */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Positives & Friction Points */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-2xl space-y-3">
                                            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm uppercase tracking-wide flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Onboarding Positives
                                            </h4>
                                            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                                {audit.positives && audit.positives.map((pos, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-emerald-500 font-extrabold">•</span>
                                                        <span>{pos}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-6 rounded-2xl space-y-3">
                                            <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm uppercase tracking-wide flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4" />
                                                Friction Points
                                            </h4>
                                            <div className="space-y-2">
                                                {audit.friction_points && audit.friction_points.map((fric, i) => {
                                                    const isExpanded = expandedFrictionIndex === i;
                                                    const details = getHealthAuditDetails(fric);
                                                    return (
                                                        <div key={i} className="border border-rose-100/50 dark:border-rose-900/20 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all">
                                                            <button
                                                                onClick={() => setExpandedFrictionIndex(isExpanded ? null : i)}
                                                                className="w-full p-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 flex justify-between items-center hover:bg-rose-50/20 cursor-pointer"
                                                            >
                                                                <span className="flex items-start gap-2">
                                                                    <span className="text-rose-500 font-extrabold">•</span>
                                                                    <span>{fric}</span>
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 uppercase">{isExpanded ? "Hide" : "Details"}</span>
                                                            </button>

                                                            {isExpanded && (
                                                                <div className="p-3 border-t border-rose-100/30 dark:border-rose-900/20 bg-rose-500/5 dark:bg-rose-950/5 space-y-2 text-xs">
                                                                    <div>
                                                                        <span className="font-bold text-rose-600 dark:text-rose-450">Severity:</span> <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">{details.severity}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold text-gray-500">Impact:</span>
                                                                        <p className="text-gray-650 dark:text-gray-400 leading-relaxed mt-0.5">{details.impact}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold text-gray-500">Context:</span>
                                                                        <p className="text-gray-650 dark:text-gray-400 leading-relaxed mt-0.5">{details.context}</p>
                                                                    </div>
                                                                    {details.template && (
                                                                        <div>
                                                                            <span className="font-bold text-gray-500 font-sans">Configuration Template:</span>
                                                                            <pre className="mt-1.5 p-2 bg-gray-50 dark:bg-black border dark:border-gray-850 rounded-lg text-[10px] font-mono overflow-x-auto select-all text-gray-700 dark:text-gray-300">
                                                                                {details.template}
                                                                            </pre>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actionable Recommendations */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                            Steps to Improve Onboarding Setup (Click to Expand Guide)
                                        </h4>
                                        <div className="space-y-3">
                                            {audit.recommendations && audit.recommendations.map((rec, i) => {
                                                const isExpanded = expandedRecIndex === i;
                                                const details = getHealthAuditDetails(rec);
                                                return (
                                                    <div key={i} className="border border-gray-150 dark:border-gray-750 rounded-xl bg-gray-50 dark:bg-gray-900 shadow-sm overflow-hidden transition-all">
                                                        <button
                                                            onClick={() => setExpandedRecIndex(isExpanded ? null : i)}
                                                            className="w-full p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800/40 cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                                                                </div>
                                                                <span className="text-sm font-bold">{rec}</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 uppercase font-extrabold">{isExpanded ? "Hide Guide" : "View Guide"}</span>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="p-4 border-t border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 space-y-3 text-xs">
                                                                <div>
                                                                    <span className="font-bold text-gray-500">Why this improves onboarding:</span>
                                                                    <p className="text-gray-650 dark:text-gray-400 leading-relaxed mt-0.5">{details.impact}</p>
                                                                </div>
                                                                {details.template && (
                                                                    <div>
                                                                        <span className="font-bold text-gray-500">Recommended Implementation Boilerplate:</span>
                                                                        <pre className="mt-2 p-3 bg-gray-50 dark:bg-black border dark:border-gray-850 rounded-xl text-[10px] font-mono overflow-x-auto select-all text-gray-700 dark:text-gray-300">
                                                                            {details.template}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 5: AI Assistant Q&A Chatbot */}
                        {activeTab === "chat" && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden h-[500px] flex flex-col justify-between animate-fadeIn">
                                {/* Chat Header */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-150 dark:border-gray-850 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                            OnboardAI Assistant
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Powered by codebase documentation context
                                    </span>
                                </div>

                                {/* Chat Body (Messages) */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-black/10">
                                    {chatMessages.map((msg, index) => {
                                        const isAI = msg.sender === "ai";
                                        return (
                                            <div 
                                                key={index} 
                                                className={`flex ${isAI ? "justify-start" : "justify-end"} animate-fadeIn`}
                                            >
                                                <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                                                    isAI 
                                                        ? "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm" 
                                                        : "bg-indigo-600 text-white rounded-tr-none shadow-md"
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {chatLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Assistant is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Form */}
                                <form onSubmit={handleSendChatMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask a question about authentication, directories, or libraries..."
                                        disabled={chatLoading}
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-850 dark:text-gray-150 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors text-sm disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="p-3 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all rounded-xl text-white shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Tab 6: First Ticket Guidance */}
                        {activeTab === "tickets" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                                {/* Left Side: Ticket Input Form */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <Terminal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Task / Issue Inputs
                                        </h3>
                                    </div>
                                    
                                    <form onSubmit={handleGetTicketGuidance} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Ticket Title / ID
                                            </label>
                                            <input 
                                                type="text"
                                                value={ticketTitle}
                                                onChange={(e) => setTicketTitle(e.target.value)}
                                                placeholder="e.g. ISSUE-402: Add Google SSO"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Ticket Description / Requirements
                                            </label>
                                            <textarea 
                                                value={ticketDesc}
                                                onChange={(e) => setTicketDesc(e.target.value)}
                                                placeholder="Paste requirements, expected changes, or Jira issue details here..."
                                                rows={5}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={ticketLoading}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {ticketLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Locating files...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Locate Code Elements
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Quick Test Samples */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                            Quick Test Samples
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-150 dark:border-gray-800 rounded-xl space-y-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-850 dark:text-gray-200">Google SSO Authentication</span>
                                                    <button
                                                        onClick={() => {
                                                            setTicketTitle("ISSUE-402: Add Google SSO Login");
                                                            setTicketDesc("Implement Google Single Sign-On (SSO) login flow. Create backend integration endpoints and ensure users are saved to user profile tables in Supabase.");
                                                        }}
                                                        className="px-2 py-1 bg-indigo-650 hover:bg-indigo-750 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                                                    >
                                                        Use Sample
                                                    </button>
                                                </div>
                                                <p className="text-gray-500 text-[10px] leading-relaxed">Simulates setting up OAuth credential exchanges for Google authentication.</p>
                                            </div>

                                            <div className="p-3 bg-slate-50 dark:bg-gray-900 border border-slate-150 dark:border-gray-800 rounded-xl space-y-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-850 dark:text-gray-200">Fix Auth Session Expiry</span>
                                                    <button
                                                        onClick={() => {
                                                            setTicketTitle("BUG-101: Fix authentication session expiry cookie");
                                                            setTicketDesc("Authentication sessions are expiring immediately when browser is closed. Update cookies to persist user JWT tokens for 30 days.");
                                                        }}
                                                        className="px-2 py-1 bg-indigo-650 hover:bg-indigo-750 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                                                    >
                                                        Use Sample
                                                    </button>
                                                </div>
                                                <p className="text-gray-500 text-[10px] leading-relaxed">Simulates modifying token expirations and session cookies.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Guidance Results */}
                                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl min-h-96">
                                    {ticketGuidance ? (
                                        <div className="space-y-6 animate-fadeIn">
                                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                                                <h4 className="font-extrabold text-gray-900 dark:text-white text-lg">
                                                    AI Code Locator Recommendations
                                                </h4>
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                                                    Difficulty: {ticketGuidance.difficulty_rating}
                                                </span>
                                            </div>

                                            {/* Code segments to modify */}
                                            <div className="space-y-3">
                                                <h5 className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                                                    <FileCode2 className="w-4 h-4 text-indigo-500" />
                                                    Suggested Files to Edit
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {ticketGuidance.files_to_modify.map((file, i) => (
                                                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col gap-1.5">
                                                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                                                {file.path}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {file.reason}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Important Context */}
                                            <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-xs space-y-1">
                                                <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                                    <Info className="w-4 h-4" />
                                                    Relevant Libraries & Functions
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {ticketGuidance.relevant_components_or_functions}
                                                </p>
                                            </div>

                                            {/* Step by step implementation */}
                                            <div className="space-y-3">
                                                <h5 className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                                                    <Terminal className="w-4 h-4 text-purple-500" />
                                                    Step-By-Step Implementation Action Plan
                                                </h5>
                                                <div className="space-y-2">
                                                    {ticketGuidance.implementation_steps.map((step, idx) => (
                                                        <div key={idx} className="flex gap-3 text-xs p-3 bg-gray-50 dark:bg-gray-900 rounded-xl items-start">
                                                            <span className="font-extrabold text-purple-600">{idx + 1}.</span>
                                                            <span className="text-gray-700 dark:text-gray-300">{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col justify-center items-center text-center p-12">
                                            <Terminal className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 animate-pulse" />
                                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                No Guidance Generated Yet
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                                                Paste a GitHub issue details description on the left and submit to locate code nodes and files automatically.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 7: GitHub Webhooks & Sync settings */}
                        {activeTab === "sync" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                                {/* Left Side: Webhook Config instructions */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Webhook Settings
                                        </h3>
                                    </div>

                                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                        <p>
                                            Configure a GitHub Webhook to automatically keep your AI onboarding workspace context updated whenever commits are pushed.
                                        </p>

                                        <div className="space-y-2">
                                            <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">Webhook Payload URL</span>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-xs select-all text-indigo-600 dark:text-indigo-400 truncate">
                                                {webhookUrl}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">Secret</span>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-xs select-all text-gray-600 dark:text-gray-400">
                                                {user?.webhook_secret || "43e20ab7-e2c7-4318-8aef-132d0ff841b2"}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-xs leading-relaxed space-y-1">
                                            <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                                                <Info className="w-4 h-4" />
                                                Setup Instructions
                                            </span>
                                            <p>1. Go to your GitHub repository Settings &gt; Webhooks &gt; Add webhook.</p>
                                            <p>2. Paste the Payload URL above, select Content type as <code>application/json</code>, and paste the Secret.</p>
                                            <p>3. Select <code>Just the push event</code> and click Add webhook.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Sync Logs Console */}
                                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col justify-between min-h-96">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                    <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    Sync Event Log Console
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleSimulatePush}
                                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:border-indigo-500 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <Play className="w-3.5 h-3.5" />
                                                    Simulate Push Event
                                                </button>
                                                <button 
                                                    onClick={loadSyncLogs}
                                                    className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {syncLoading ? (
                                            <div className="flex justify-center items-center py-20">
                                                <Loader2 className="w-8 h-8 text-indigo-650 animate-spin" />
                                            </div>
                                        ) : syncLogs.length > 0 ? (
                                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                                                {syncLogs.map((log) => (
                                                    <div 
                                                        key={log.id} 
                                                        className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs space-y-2"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-extrabold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                {log.event}
                                                            </span>
                                                            <span className="text-gray-400 text-xs">
                                                                {new Date(log.created_at).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-4 font-mono text-[11px] text-gray-500">
                                                            <span>Branch: {log.branch}</span>
                                                            <span>Commit: <span className="text-indigo-600 dark:text-indigo-400">{log.commit_hash}</span></span>
                                                        </div>
                                                        <p className="text-gray-650 dark:text-gray-350 leading-relaxed font-sans">
                                                            {log.details}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center text-gray-400 dark:text-gray-500 flex flex-col justify-center items-center">
                                                <GitPullRequest className="w-10 h-10 mb-3 opacity-50" />
                                                <p className="text-sm">No webhook triggers or synchronization logs recorded yet.</p>
                                                <p className="text-xs mt-1 text-gray-500">Push to main or click Simulate Push Event above to test.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "reviews" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                                {/* Left: Snippet Form */}
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Request Code Review
                                        </h3>
                                    </div>

                                    <form onSubmit={handleRequestReview} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Filename / Module Path
                                            </label>
                                            <input 
                                                type="text"
                                                value={reviewFilename}
                                                onChange={(e) => setReviewFilename(e.target.value)}
                                                placeholder="e.g. app/api/auth/route.ts"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Code Snippet
                                            </label>
                                            <textarea 
                                                value={reviewSnippet}
                                                onChange={(e) => setReviewSnippet(e.target.value)}
                                                placeholder="Paste the code you want reviewed against the codebase context..."
                                                rows={8}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono text-xs"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={reviewLoading}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {reviewLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Analyzing code...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Submit Code Review
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>

                                {/* Right: Reviews History & Results */}
                                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col justify-between min-h-96">
                                    <div className="space-y-6">
                                        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Code Review History
                                            </h3>
                                        </div>

                                        {reviewsLoadingHistory ? (
                                            <div className="flex justify-center items-center py-20">
                                                <Loader2 className="w-8 h-8 text-indigo-650 animate-spin" />
                                            </div>
                                        ) : codeReviews.length > 0 ? (
                                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                                                {codeReviews.map((rev) => (
                                                    <div 
                                                        key={rev.id} 
                                                        className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4"
                                                    >
                                                        <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-850 pb-2">
                                                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                                📄 {rev.filename}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(rev.created_at).toLocaleDateString()}
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-250 text-xs font-bold">
                                                                    Score: {rev.review_feedback?.score || "N/A"}/10
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Snippet preview */}
                                                        <details className="text-xs">
                                                            <summary className="cursor-pointer font-bold text-gray-500 hover:text-gray-700">View code snippet</summary>
                                                            <pre className="mt-2 p-3 bg-white dark:bg-black border dark:border-gray-850 rounded-xl overflow-x-auto text-[11px] font-mono">
                                                                {rev.code_snippet}
                                                            </pre>
                                                        </details>

                                                        {/* Audit Feedback */}
                                                        <div className="space-y-3 text-xs">
                                                            <div>
                                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">Compliance Statement:</span>
                                                                <p className="mt-1 text-gray-700 dark:text-gray-300">{rev.review_feedback?.styling_and_architecture_compliance}</p>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="p-3 bg-emerald-500/5 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Positives:</span>
                                                                    <ul className="mt-1.5 space-y-1 list-disc list-inside">
                                                                        {rev.review_feedback?.positives?.map((pos: string, idx: number) => (
                                                                            <li key={idx} className="text-gray-600 dark:text-gray-400">{pos}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                <div className="p-3 bg-rose-500/5 border border-rose-200 dark:border-rose-800 rounded-xl">
                                                                    <span className="font-bold text-rose-600 dark:text-rose-400">Issues:</span>
                                                                    <ul className="mt-1.5 space-y-1 list-disc list-inside">
                                                                        {rev.review_feedback?.issues?.map((iss: string, idx: number) => (
                                                                            <li key={idx} className="text-gray-600 dark:text-gray-400">{iss}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>

                                                            {rev.review_feedback?.refactored_suggestion && (
                                                                <div>
                                                                    <span className="font-bold text-purple-600 dark:text-purple-400">Refactoring Recommendation:</span>
                                                                    <pre className="mt-2 p-3 bg-white dark:bg-black border dark:border-gray-850 rounded-xl overflow-x-auto text-[11px] font-mono text-gray-750 dark:text-gray-300">
                                                                        {rev.review_feedback.refactored_suggestion}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center text-gray-400 dark:text-gray-500 flex flex-col justify-center items-center">
                                                <Code2 className="w-10 h-10 mb-3 opacity-50" />
                                                <p className="text-sm">No code reviews requested yet.</p>
                                                <p className="text-xs mt-1 text-gray-500">Paste a code snippet on the left to get architect reviews.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Original Notes / Scraped Documentation Toggle */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg space-y-4">
                        <button
                            onClick={() => setShowOriginalNotes(!showOriginalNotes)}
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm"
                        >
                            {showOriginalNotes ? "Hide" : "Show"} Original Raw Scraped Codebase Context
                        </button>

                        {showOriginalNotes && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
                                <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl overflow-x-auto border dark:border-gray-850 max-h-[500px]">
                                    {summary.notes}
                                </pre>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
