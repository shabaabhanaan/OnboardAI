"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText, CheckCircle2, AlertCircle, Trash2, Calendar, Loader2 } from "lucide-react";
import { meetings, isAuthenticated } from "@/lib/api";

interface Meeting {
    id: string;
    title: string;
    notes: string;
    summary: string;
    key_points: string[];
    action_items: Array<{ task: string; priority: string; assignee?: string }>;
    created_at: string;
}

export default function MeetingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showOriginalNotes, setShowOriginalNotes] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && !isAuthenticated()) {
            router.push("/login");
            return;
        }

        loadMeeting();
    }, [params.id, router]);

    const loadMeeting = async () => {
        try {
            const data = await meetings.get(params.id as string);
            setMeeting(data);
        } catch (err: any) {
            setError(err.message || "Failed to load meeting");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this meeting?")) {
            return;
        }

        setDeleting(true);
        try {
            await meetings.delete(params.id as string);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to delete meeting");
            setDeleting(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        const p = priority.toLowerCase();
        if (p === "high") return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700";
        if (p === "medium") return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error || !meeting) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Meeting not found"}</p>
                    <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    MeetWise
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-5 h-5" />
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="animate-fadeIn">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.created_at).toLocaleString()}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {meeting.title}
                        </h1>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                AI Summary
                            </h2>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                {meeting.summary}
                            </p>
                        </div>

                        {/* Key Points */}
                        {meeting.key_points && meeting.key_points.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    Key Points
                                </h3>
                                <ul className="space-y-3">
                                    {meeting.key_points.map((point, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Action Items */}
                    {meeting.action_items && meeting.action_items.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                Action Items ({meeting.action_items.length})
                            </h2>

                            <div className="space-y-4">
                                {meeting.action_items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-gray-800 dark:text-gray-200 flex-1 leading-relaxed">
                                                {item.task}
                                            </p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                                                    {item.priority}
                                                </span>
                                            </div>
                                        </div>
                                        {item.assignee && (
                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                Assigned to: <span className="font-medium">{item.assignee}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Original Notes Toggle */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                        <button
                            onClick={() => setShowOriginalNotes(!showOriginalNotes)}
                            className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                            {showOriginalNotes ? "Hide" : "Show"} Original Notes
                        </button>

                        {showOriginalNotes && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                    {meeting.notes}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
