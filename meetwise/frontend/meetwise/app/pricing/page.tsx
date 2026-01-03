"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import PayHereButton from "@/components/PayHereButton";

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for trying out MeetWise",
            features: [
                "5 meetings per month",
                "AI-powered summaries",
                "Action item extraction",
                "Basic priority levels",
                "7-day meeting history"
            ],
            limitations: [
                "Limited to 5 meetings/month",
                "No meeting export"
            ],
            cta: "Get Started Free",
            href: "/register",
            highlighted: false
        },
        {
            name: "Pro",
            price: "$12",
            period: "per month",
            description: "For professionals who need more",
            features: [
                "Unlimited meetings",
                "AI-powered summaries",
                "Priority action items",
                "Advanced analytics",
                "Unlimited meeting history",
                "Export to PDF/Markdown",
                "Custom tags & categories",
                "Priority email support"
            ],
            limitations: [],
            cta: "Start Pro Trial",
            href: "/register?plan=pro",
            highlighted: true
        },
        {
            name: "Team",
            price: "$39",
            period: "per month",
            description: "For teams and organizations",
            features: [
                "Everything in Pro",
                "Up to 10 team members",
                "Shared meeting workspace",
                "Team analytics dashboard",
                "Role-based permissions",
                "Admin controls",
                "Dedicated account manager",
                "24/7 priority support"
            ],
            limitations: [],
            cta: "Contact Sales",
            href: "/register?plan=team",
            highlighted: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950">
            {/* Header */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                MeetWise
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-16">
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
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-full">
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

                                {plan.name === "Pro" ? (
                                    <div className="mb-6">
                                        <PayHereButton
                                            amount={3600}
                                            orderId={`PRO-${Date.now()}`}
                                            items="MeetWise Pro Monthly"
                                            className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 bg-gradient-to-r from-indigo-600 to-purple-600 text-white`}
                                        />
                                    </div>
                                ) : (
                                    <Link
                                        href={plan.href}
                                        className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 mb-6 ${plan.highlighted
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
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
                                    q: "What happens when I hit my meeting limit on the free plan?",
                                    a: "You'll be prompted to upgrade to Pro for unlimited meetings. Your existing meetings will remain accessible."
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
            <footer className="text-center py-8 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 mt-16">
                <p>© 2024 MeetWise. All plans include AI-powered features.</p>
            </footer>
        </div>
    );
}
