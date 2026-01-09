"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Loader2 } from "lucide-react";
import { summaries } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import UpgradePrompt from "@/components/UpgradePrompt";

export default function NewMeetingPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        notes: "",
    });
    const [error, setError] = useState("");
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [loading, setLoading] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            if (selectedFile) {
                // Use upload endpoint
                summary = await summaries.upload(selectedFile, formData.title, formData.notes);
            } else {
                // Use existing create endpoint
                summary = await summaries.create(formData.title, formData.notes);
            }
            router.push(`/dashboard/${summary.id}`);
        } catch (err: any) {
            if (err.message?.includes("PLAN_LIMIT_REACHED")) {
                setShowUpgrade(true);
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
                                Summriate
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
                            Upload New Video
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Upload a video/audio file to get AI-powered transcription and summary
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
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all text-lg"
                                    placeholder="e.g., Team Meeting Jan 2026"
                                />
                            </div>

                            {/* File Upload Field */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Upload Video/Audio File
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="audio/*,video/*"
                                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {selectedFile ? selectedFile.name : "Click to select a video or audio file"}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Supports MP3, WAV, MP4, MOV (Max 25MB)
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Notes Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all resize-none font-mono text-sm"
                                    placeholder="Add any additional notes here..."
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    These notes will be combined with the transcription
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
                                        {selectedFile ? "Transcribing & Processing..." : "Processing..."}
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

            {showUpgrade && (
                <UpgradePrompt onClose={() => setShowUpgrade(false)} />
            )}
        </div>
    );
}
