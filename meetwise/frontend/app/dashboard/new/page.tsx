"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Loader2, Github } from "lucide-react";
import { summaries } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import PricingModal from "@/components/PricingModal";

export default function NewMeetingPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        notes: "",
    });
    const [error, setError] = useState("");
    const [showPricing, setShowPricing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [inputType, setInputType] = useState<"text" | "github">("text");
    const [githubUrl, setGithubUrl] = useState("");

    // Helper to fetch GitHub content (Server-Side Proxy)
    const fetchGithubRepo = async (url: string) => {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        const providerToken = session?.provider_token;

        const response = await fetch("/api/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                url,
                token: providerToken
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch GitHub repo");
        }

        return data; // returns { title, context }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let summary;

            if (inputType === 'github') {
                if (!githubUrl) throw new Error("Please enter a GitHub URL");

                // Fetch data first
                const { title, context, files } = await fetchGithubRepo(githubUrl);

                // Use the fetched data to create the onboarding
                // We use the manual title if user entered one, otherwise repo name
                const finalTitle = formData.title || title;
                summary = await summaries.create(finalTitle, context, files);

            } else {
                // Standard text input
                summary = await summaries.create(formData.title, formData.notes);
            }

            router.push(`/dashboard/${summary.id}`);
        } catch (err: any) {
            if (err.message.includes("PLAN_LIMIT_REACHED")) {
                setShowPricing(true);
            } else {
                setError(err.message || "Failed to create summary");
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Codereporeach
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 animate-fadeIn">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            New Project Onboarding
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Paste codebase context or docs, and get a tailored learning plan.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                        {/* Input Type Toggle */}
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setInputType("text")}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${inputType === "text"
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Manual Input
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType("github")}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${inputType === "github"
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                            >
                                <Github className="w-4 h-4" />
                                GitHub Repo
                            </button>
                        </div>

                        {inputType === 'github' ? (
                            <div className="animate-fadeIn">
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        GitHub Repository URL
                                    </label>
                                    <div className="relative">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="url"
                                            required={inputType === 'github'}
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all font-mono text-sm"
                                            placeholder="https://github.com/owner/repo"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Project Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all text-lg"
                                        placeholder="Leave blank to use Repo Name"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn">
                                {/* Title Field */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        required={inputType === 'text'}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all text-lg"
                                        placeholder="e.g., E-Commerce Monorepo, Legacy PHP System..."
                                    />
                                </div>

                                {/* Notes Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Codebase Context / Documentation
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={10}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all resize-none font-mono text-sm"
                                        placeholder="Paste README content, directory structure, or key architectural diagrams here..."
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        The more docs you provide, the better the learning plan.
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-all"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {inputType === 'github' ? "Fetching Repo..." : "Generating Plan..."}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Plan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main >

            {showPricing && (
                <PricingModal onClose={() => setShowPricing(false)} />
            )}
        </div >
    );
}
