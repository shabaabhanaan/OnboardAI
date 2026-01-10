"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Calendar, LogOut, Sparkles, Loader2 } from "lucide-react";
import { summaries, auth } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface Summary {
    id: string;
    title: string;
    summary: string;
    created_at: string;
    action_items: Array<{ task: string; priority: string }>;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [summariesList, setSummariesList] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                loadSummaries();
            }
        }
    }, [user, authLoading, router]);

    const loadSummaries = async () => {
        try {
            const data = await summaries.list();
            setSummariesList(data);
        } catch (err: any) {
            setError(err.message || "Failed to load summaries");
            if (err.message.includes("authentication")) {
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };



    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                OnboardAI
                            </h1>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 animate-fadeIn">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                Your Onboardings
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Review your learning plans and architecture guides
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {user?.plan === 'free' && (
                                <Link
                                    href="/pricing"
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 hover:scale-105"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Upgrade Plan
                                </Link>
                            )}
                            <Link
                                href="/dashboard/new"
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                                New Onboarding
                            </Link>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {(loading || authLoading) ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        </div>
                    ) : summariesList.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20 animate-fadeIn">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 opacity-50">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                No onboardings yet
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Start your first project onboarding to get an AI Architect plan
                            </p>
                            <Link
                                href="/dashboard/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                                Start First Onboarding
                            </Link>
                        </div>
                    ) : (
                        /* Meetings Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {summariesList.map((summary, index) => (
                                <Link
                                    key={summary.id}
                                    href={`/dashboard/${summary.id}`}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fadeIn"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(summary.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1">
                                        {summary.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                        {summary.summary}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                        {summary.action_items?.length || 0} Learning Tasks
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
