"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await auth.login(formData.email, formData.password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-gray-950 font-sans">
            {/* Left side: Visual Graphic Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-850 text-white p-16 flex-col justify-between relative overflow-hidden">
                {/* Abstract space orbits & grid vectors */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-60"></div>
                
                {/* Floating circles/orbits */}
                <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] rounded-full border border-white/10 flex items-center justify-center animate-pulse duration-[8s]">
                    <div className="w-[200px] h-[200px] rounded-full border border-white/5 flex items-center justify-center">
                        <div className="w-[100px] h-[100px] rounded-full bg-indigo-500/20 backdrop-blur-sm"></div>
                    </div>
                </div>

                {/* Small floating spheres */}
                <div className="absolute bottom-[15%] left-[10%] w-6 h-6 rounded-full bg-indigo-400/40 blur-sm animate-bounce duration-[4s]"></div>
                <div className="absolute top-[10%] left-[20%] w-10 h-10 rounded-full bg-indigo-500/30 blur-md"></div>
                <div className="absolute bottom-[8%] right-[15%] w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-400 to-indigo-600 opacity-60 blur-xl"></div>

                {/* Brand header in visual side */}
                <div className="z-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">Codereporeach</span>
                    </Link>
                </div>

                {/* Typography */}
                <div className="z-10 space-y-6 max-w-md my-auto">
                    <h1 className="text-5xl font-black leading-tight tracking-tight">
                        Adventure starts here
                    </h1>
                    <p className="text-indigo-100 text-base leading-relaxed">
                        Create an account to scan repositories, generate visual data models, and start mapping codebases instantly.
                    </p>
                </div>

                {/* Bottom indicator */}
                <div className="z-10 text-xs text-indigo-200/60 font-semibold tracking-wider uppercase">
                    © 2026 Codereporeach Inc. All rights reserved.
                </div>
            </div>

            {/* Right side: Clean Form Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-16 bg-white dark:bg-gray-950 relative">
                {/* Small Home return link for responsiveness */}
                <div className="absolute top-8 right-8">
                    <Link href="/" className="text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        <span>Back to Home</span>
                        <span className="text-[14px]">→</span>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] space-y-8">
                    {/* Logo Card */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center shadow-inner">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                Hello ! Welcome Back
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Sign in to map your codebases
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-gray-100 transition-all text-sm shadow-inner placeholder-gray-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-11 py-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-gray-100 transition-all text-sm shadow-inner placeholder-gray-400"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password Row */}
                        <div className="flex items-center justify-between text-xs font-medium">
                            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500/20"
                                />
                                <span>Remember me</span>
                            </label>
                            <Link href="/pricing" className="text-indigo-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer text-sm"
                        >
                            {loading ? "Signing in..." : "Login"}
                        </button>



                    </form>

                    {/* Register Link */}
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-indigo-650 font-extrabold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
