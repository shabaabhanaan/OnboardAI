"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Loader2 } from "lucide-react";
import { meetings, isAuthenticated } from "@/lib/api";

export default function NewMeetingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (typeof window !== "undefined" && !isAuthenticated()) {
        router.push("/login");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const meeting = await meetings.create(formData.title, formData.notes);
            router.push(`/dashboard/${meeting.id}`);
        } catch (err: any) {
            setError(err.message || "Failed to create meeting");
        } finally {
            setLoading(false);
        }
    };

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
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                MeetWise
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 animate-fadeIn">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Create New Meeting
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Paste your meeting notes and let AI do the heavy lifting
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                            {/* Title Field */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Meeting Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all text-lg"
                                    placeholder="e.g., Weekly Team Standup"
                                />
                            </div>

                            {/* Notes Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Meeting Notes
                                </label>
                                <textarea
                                    required
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={16}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all resize-none font-mono text-sm"
                                    placeholder="Paste your meeting notes here... The AI will analyze them to extract key points and action items."
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Include any discussions, decisions, and action items from your meeting
                                </p>
                            </div>
                        </div>

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
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Process with AI
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
