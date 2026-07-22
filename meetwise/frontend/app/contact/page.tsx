"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Mail, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 font-sans">
            {/* Header / Navbar */}
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center shadow-md">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Codereporeach</span>
                    </Link>
                    <Link
                        href="/"
                        className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Main Contact Container */}
            <main className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="text-center space-y-4 mb-14">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Get in Touch
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Have questions about plans, API access, or enterprise security setups? Reach out to our team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-xl">
                    {/* Left Column Info */}
                    <div className="space-y-8 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Our technical team is ready to assist with code scanning integrations, custom workflow setup, and general inquiries.
                            </p>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Mail className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-xs">Email</div>
                                    <div className="text-xs">info.zeoraz@gmail.com</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Clock className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-xs">Support Hours</div>
                                    <div className="text-xs">Mon - Sun, 24/7 Support</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column Form */}
                    {submitted ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-2xl">
                            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Message Sent!</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Thank you for contacting us. We will get back to you shortly.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Describe your request..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                            >
                                <Send className="w-4 h-4" />
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
