"use client";

import Link from "next/link";
import { Check, Sparkles, User as UserIcon, Loader2 } from "lucide-react";
import PayHereButton from "@/components/PayHereButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/Logo";

export default function PricingPage() {
    const { user, loading: authLoading } = useAuth();
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            setCurrentPlan(user.plan as string);
        }
    }, [user, authLoading]);

    const plans = [
        {
            id: "free",
            name: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for trying out OnboardAI",
            features: [
                "1 public repo onboarding",
                "Basic Architecture Overview",
                "Critical File Analysis",
                "Day 1 Learning Plan",
                "Community Support"
            ],
            limitations: [
                "Limit: 1 active project",
                "Public repos only"
            ],
            cta: "Get Started Free",
            href: "/register",
            highlighted: false
        },
        {
            id: "pro",
            name: "Pro",
            price: "$19",
            period: "per month",
            description: "For freelance developers and consultants",
            features: [
                "Unlimited public & private repos",
                "Deep Dependency Analysis",
                "Custom Learning Paths",
                "Export to Markdown/PDF",
                "VS Code Extension context",
                "Priority email support"
            ],
            limitations: [],
            cta: "Start Pro Trial",
            href: "/register?plan=pro",
            highlighted: true
        },
        {
            id: "team",
            name: "Team",
            price: "$39",
            period: "per month",
            description: "For engineering teams and agencies",
            features: [
                "Everything in Pro",
                "Team Workspace & Sharing",
                "Custom Architecture Prompting",
                "SSO / SAML Integration",
                "Admin Usage Analytics",
                "Dedicated Success Manager",
                "Priority 24/7 Support"
            ],
            limitations: [],
            cta: "Contact Sales",
            href: "/register?plan=team",
            highlighted: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950">
            {/* Top Navigation Bar Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Logo />
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <Link href="/" className="hover:text-indigo-655 transition-colors">Home</Link>
                        <Link href="/#features" className="hover:text-indigo-655 transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-indigo-655 transition-colors">Pricing</Link>
                        <Link href="/#contact" className="hover:text-indigo-655 transition-colors">Contact</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        {authLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : user ? (
                            <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-extrabold rounded-xl transition-all shadow-md">
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-semibold text-gray-650 dark:text-gray-300 hover:text-indigo-655 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-extrabold rounded-xl transition-all shadow-md">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 pt-32 pb-16">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16 animate-fadeIn">
                        <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Choose the plan that's right for you. Start free, upgrade anytime.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fadeIn ${plan.highlighted
                                    ? 'border-indigo-600 dark:border-indigo-500 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950 shadow-xl scale-105'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-md">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">
                                            {plan.price}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>

                                {currentPlan === plan.id ? (
                                    <div className="w-full py-3 px-6 rounded-xl font-semibold text-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mb-6 flex items-center justify-center gap-2">
                                        <Check className="w-5 h-5" />
                                        Current Plan
                                    </div>
                                ) : plan.id === "pro" ? (
                                    <div className="mb-6">
                                        <PayHereButton
                                            amount={3600}
                                            orderId={`PRO-${Date.now()}`}
                                            items="OnboardAI Pro Monthly"
                                            className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 bg-indigo-600 hover:bg-indigo-750 text-white`}
                                        />
                                    </div>
                                ) : (
                                    <Link
                                        href={plan.href}
                                        className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 mb-6 ${plan.highlighted
                                            ? 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                )}

                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        What's included:
                                    </p>
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {plan.limitations.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                            Limitations:
                                        </p>
                                        {plan.limitations.map((limitation, idx) => (
                                            <p key={idx} className="text-gray-500 dark:text-gray-500 text-xs">
                                                • {limitation}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-6">
                            {[
                                {
                                    q: "Can I upgrade or downgrade my plan?",
                                    a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately and your billing will be prorated."
                                },
                                {
                                    q: "What happens when I hit my analysis limit on the free plan?",
                                    a: "You'll be prompted to upgrade to Pro for unlimited repository analyses. Your existing analysis will remain accessible."
                                },
                                {
                                    q: "Is there a trial for the Pro plan?",
                                    a: "Yes! New Pro subscribers get a 14-day free trial. No credit card required to start."
                                },
                                {
                                    q: "What payment methods do you accept?",
                                    a: "We accept all major credit cards, PayPal, and offer invoicing for Team plans."
                                }
                            ].map((faq, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                        {faq.q}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-20 pt-16 pb-12 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Logo />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            AI-powered codebase onboarding developer copilot that structures guides, locates issues, and reviews pull requests instantly.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Product</h4>
                        <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <li><Link href="/pricing" className="hover:text-indigo-650 transition-colors">Pricing Plans</Link></li>
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">Features List</a></li>
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">Security Details</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Resources</h4>
                        <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">Developer Docs</a></li>
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">GitHub Marketplace</a></li>
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">System Status</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h4>
                        <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">Careers Page</a></li>
                            <li><a href="#" className="hover:text-indigo-650 transition-colors">Contact Support</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-8 border-t border-gray-200 dark:border-gray-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} OnboardAI. All plans include AI-powered architecture analysis.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-indigo-655 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-655 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
