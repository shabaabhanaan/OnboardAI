"use client";

import Link from "next/link";
import { Sparkles, Check, X } from "lucide-react";

interface PricingModalProps {
    onClose?: () => void;
}

export default function PricingModal({ onClose }: PricingModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                Upgrade Your Plan
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                You've reached your free plan limit. Upgrade to continue analyzing repositories.
                            </p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="p-8 grid md:grid-cols-2 gap-6">
                    {/* Pro Plan */}
                    <div className="border-2 border-indigo-600 rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 relative">
                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                                RECOMMENDED
                            </span>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                Pro Plan
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                    Contact Us
                                </span>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    <strong>Unlimited</strong> repository analyses
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    AI-powered codebase mapping
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Key files mapping
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Learning plans generation
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Priority support
                                </span>
                            </li>
                        </ul>

                        <Link
                            href="/pricing"
                            className="block w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            Upgrade to Pro
                        </Link>
                    </div>

                    {/* Team Plan */}
                    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-2xl p-6">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                Team Plan
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                                    Contact Us
                                </span>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Everything in <strong>Pro</strong>
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Team collaboration features
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Shared workspace
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Admin controls
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Dedicated support
                                </span>
                            </li>
                        </ul>

                        <Link
                            href="/pricing"
                            className="block w-full py-3 px-6 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Questions? <Link href="/pricing" className="text-indigo-600 dark:text-indigo-400 hover:underline">View full pricing details</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
