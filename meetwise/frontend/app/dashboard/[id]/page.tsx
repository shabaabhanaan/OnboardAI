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
    TrendingUp
} from "lucide-react";
import { summaries } from "@/lib/api";
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
    const [activeTab, setActiveTab] = useState<"overview" | "files" | "plan" | "health" | "chat">("overview");
    const [updatingTasks, setUpdatingTasks] = useState(false);
    
    // Chat States
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
        { sender: "ai", text: "Hello! I am your AI Onboarding Assistant. Ask me anything about this codebase, architecture, setup steps, or where specific files are located." }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                loadSummary();
            }
        }
    }, [params.id, router, user, authLoading]);

    const loadSummary = async () => {
        try {
            const data = await summaries.get(params.id as string);
            setSummary(data);
        } catch (err: any) {
            setError(err.message || "Failed to load summary");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this onboarding guide?")) {
            return;
        }

        setDeleting(true);
        try {
            await summaries.delete(params.id as string);
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
            await summaries.updateActionItems(summary.id, updatedActionItems);
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
                    history: chatMessages.slice(1), // omit the initial welcome message from history representation
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

    // Simple parser for flowchart syntax to render components visual map
    const parseMermaidNodes = (graphText: string) => {
        if (!graphText) return { nodes: [], connections: [] };
        const lines = graphText.split("\n");
        const connections: Array<{ from: string; to: string }> = [];
        const nodeNames = new Set<string>();

        lines.forEach(line => {
            if (line.includes("-->")) {
                const parts = line.split("-->");
                if (parts.length === 2) {
                    const from = parts[0].replace(/graph\s+(TD|LR|TB|BT);?/, "").replace(/[\[\{\(].*?[\]\}\)]/g, "").trim();
                    const to = parts[1].replace(/[\[\{\(].*?[\]\}\)]/g, "").trim();
                    if (from && to) {
                        connections.push({ from, to });
                        nodeNames.add(from);
                        nodeNames.add(to);
                    }
                }
            }
        });

        return { nodes: Array.from(nodeNames), connections };
    };

    const graphData = parseMermaidNodes(summary.dependency_graph || "");

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-55">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    OnboardAI
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-5 h-5" />
                            {deleting ? "Deleting..." : "Delete Guide"}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Container */}
            <main className="container mx-auto px-6 py-10">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Header Summary Info */}
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(summary.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </div>
                            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                {summary.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                                AI-synthesized architectural roadmap, health scores, and learning checklists.
                            </p>
                        </div>

                        {/* Onboarding Checklist Status Gauge */}
                        <div className="flex items-center gap-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-5 rounded-2xl md:min-w-64">
                            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        className="stroke-gray-200 dark:stroke-gray-700 fill-none"
                                        strokeWidth="6"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        className="stroke-indigo-600 dark:stroke-indigo-400 fill-none transition-all duration-500 ease-out"
                                        strokeWidth="6"
                                        strokeDasharray={176}
                                        strokeDashoffset={176 - (176 * progressPercent) / 100}
                                    />
                                </svg>
                                <span className="absolute text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {progressPercent}%
                                </span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                                    Learning Progress
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {completedTasks} of {totalTasks} Tasks Finished
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto gap-2 p-1 bg-white/70 dark:bg-gray-850/50 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-750 shadow-sm max-w-fit">
                        {[
                            { id: "overview", label: "Architecture", icon: Brain },
                            { id: "files", label: "Files & Visual Map", icon: FileCode2 },
                            { id: "plan", label: "Learning Plan", icon: CheckSquare },
                            { id: "health", label: "Health Audit", icon: Activity },
                            { id: "chat", label: "AI Assistant Q&A", icon: MessageSquare }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
                                        isActive
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:scale-102"
                                            : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800/40"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

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
                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                                    {summary.summary}
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
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Module Interconnections
                                            </h3>
                                        </div>

                                        {graphData.nodes.length > 0 ? (
                                            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 min-h-64 flex flex-col items-center justify-center gap-6">
                                                <div className="flex flex-wrap justify-center gap-4">
                                                    {graphData.nodes.map((node, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-md hover:scale-105 transition-transform"
                                                        >
                                                            {node}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="w-full text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2">
                                                        Dependency Link Flow
                                                    </h4>
                                                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                        {graphData.connections.map((c, idx) => (
                                                            <div key={idx} className="flex justify-center items-center gap-2">
                                                                <span className="font-medium text-gray-700 dark:text-gray-300">{c.from}</span>
                                                                <span>➔</span>
                                                                <span className="font-medium text-gray-700 dark:text-gray-300">{c.to}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                                                <FileCode2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-sm">Mermaid diagram is rendering as custom modules below or is unavailable.</p>
                                                {summary.dependency_graph && (
                                                    <pre className="mt-4 p-4 text-xs font-mono text-left bg-gray-50 dark:bg-gray-900 border dark:border-gray-850 rounded-xl overflow-x-auto text-gray-600 dark:text-gray-400">
                                                        {summary.dependency_graph}
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
                                    {summary.action_items && summary.action_items.map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() => !updatingTasks && handleToggleTask(index)}
                                            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-4 select-none ${
                                                item.completed
                                                    ? "bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900 opacity-75"
                                                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                                            }`}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                                                    item.completed
                                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black"
                                                }`}>
                                                    {item.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <p className={`font-semibold text-gray-850 dark:text-gray-150 leading-relaxed text-sm ${
                                                    item.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
                                                }`}>
                                                    {item.task}
                                                </p>
                                                {item.assignee && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        Assigned role: <span className="font-bold text-gray-500 dark:text-gray-400">{item.assignee}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(item.priority || "Medium")}`}>
                                                    {item.priority || "Medium"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
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
                                            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                                {audit.friction_points && audit.friction_points.map((fric, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-rose-500 font-extrabold">•</span>
                                                        <span>{fric}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Actionable Recommendations */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                            Steps to Improve Onboarding Setup
                                        </h4>
                                        <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                            {audit.recommendations && audit.recommendations.map((rec, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                                                    </div>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
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
