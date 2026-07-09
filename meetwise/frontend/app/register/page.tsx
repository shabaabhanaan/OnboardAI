"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Sparkles, Check } from "lucide-react";
import { auth } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        plan: "free" as "free" | "pro" | "team",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await auth.register(formData.username, formData.email, formData.password, formData.plan);
            // Auto-login after registration
            await auth.login(formData.email, formData.password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create your account
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Create Account
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Choose your plan and start mapping repositories
                    </p>

                    {error && (
                        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 transition-all"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                        </div>

                        {/* Plan Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Choose Your Plan
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {/* Free Plan */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan: "free" })}
                                    className={`p-2.5 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-between min-h-[90px] relative ${formData.plan === "free"
                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                                        }`}
                                >
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">Free</div>
                                    <div className="text-[10px] text-green-600 dark:text-green-400 font-semibold my-0.5">$0/month</div>
                                    <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">1 repo limit</div>
                                    {formData.plan === "free" && (
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    )}
                                </button>

                                {/* Pro Plan */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan: "pro" })}
                                    className={`p-2.5 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-between min-h-[90px] relative ${formData.plan === "pro"
                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                                        }`}
                                >
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                        Pro
                                        <span className="text-[8px] px-1 py-0.2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded font-normal">
                                            Pop
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold my-0.5">Unlimited</div>
                                    <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Personal projects</div>
                                    {formData.plan === "pro" && (
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    )}
                                </button>

                                {/* Team Plan */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan: "team" })}
                                    className={`p-2.5 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-between min-h-[90px] relative ${formData.plan === "team"
                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                                        }`}
                                >
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">Team</div>
                                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold my-0.5">Collab</div>
                                    <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">For organizations</div>
                                    {formData.plan === "team" && (
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Social Login Button */}
                        <button
                            type="button"
                            onClick={() => auth.signInWithGoogle()}
                            className="w-full py-3 px-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
