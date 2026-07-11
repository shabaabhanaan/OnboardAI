"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Sparkles, Check, Eye, EyeOff } from "lucide-react";
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
    const [showPassword, setShowPassword] = useState(false);

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
                        <span className="text-xl font-black tracking-tight text-white">OnboardAI</span>
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
                    © 2026 OnboardAI Inc. All rights reserved.
                </div>
            </div>

            {/* Right side: Clean Form Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-16 bg-white dark:bg-gray-950 relative overflow-y-auto">
                {/* Small Home return link for responsiveness */}
                <div className="absolute top-8 right-8">
                    <Link href="/" className="text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        <span>Back to Home</span>
                        <span className="text-[14px]">→</span>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] space-y-6 my-8">
                    {/* Logo Card */}
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center shadow-inner">
                                <Sparkles className="w-4.5 h-4.5 text-white" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                Create Account
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Choose your plan and start mapping repositories
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-gray-100 transition-all text-sm shadow-inner placeholder-gray-400"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1">
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
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-gray-100 transition-all text-sm shadow-inner placeholder-gray-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-11 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 dark:text-gray-100 transition-all text-sm shadow-inner placeholder-gray-400"
                                    placeholder="At least 6 characters"
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

                        {/* Plan Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Choose Your Plan
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {/* Free Plan */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan: "free" })}
                                    className={`p-2.5 border-2 rounded-xl text-center transition-all flex flex-col items-center justify-between min-h-[90px] relative ${formData.plan === "free"
                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                                        : "border-slate-200 dark:border-slate-800 hover:border-indigo-400"
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
                                    className={`p-2.5 border-2 rounded-xl text-center transition-all flex flex-col items-center justify-between min-h-[90px] relative ${formData.plan === "pro"
                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                                        : "border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                                        }`}
                                >
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                        Pro
                                        <span className="text-[8px] px-1 py-0.2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded font-normal">
                                            Pop
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-indigo-655 dark:text-indigo-400 font-semibold my-0.5">Unlimited</div>
                                    <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Personal projects</div>
                                    {formData.plan === "pro" && (
                                        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    )}
                                </button>

                                {/* Team Plan */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan: "team" })}
                                    className={`p-2.5 border-2 rounded-xl text-center transition-all flex flex-col items-center justify-between min-h-[90px] relative ${formData.plan === "team"
                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                                        : "border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                                        }`}
                                >
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100">Team</div>
                                    <div className="text-[10px] text-indigo-655 dark:text-indigo-400 font-semibold my-0.5">Collab</div>
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
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer text-sm"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100 dark:border-gray-800/80"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white dark:bg-gray-950 text-gray-400 uppercase tracking-wider font-extrabold text-[9px]">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Logins: Grid of Buttons */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => auth.signInWithGoogle()}
                                className="py-2.5 px-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-880 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                className="py-2.5 px-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-880 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-indigo-600 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                className="py-2.5 px-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-880 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-gray-900 dark:text-white fill-current" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-650 font-extrabold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
