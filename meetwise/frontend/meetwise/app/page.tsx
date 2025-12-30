"use client";

import Link from "next/link";
import { Sparkles, Brain, Zap, Shield } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Summaries",
      description: "Get instant, intelligent summaries of your meetings using advanced AI"
    },
    {
      icon: Zap,
      title: "Action Items Extraction",
      description: "Automatically extract and prioritize action items from notes"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your meeting notes are encrypted and stored securely"
    },
    {
      icon: Sparkles,
      title: "Smart Organization",
      description: "Keep all your meetings organized and easily searchable"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950">
      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto animate-fadeIn">
          {/* Logo/Title */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MeetWise
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Transform Your Meeting Notes with AI
          </p>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Never miss important details again. Let AI automatically summarize your meetings,
            extract action items, and keep everything organized in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold text-lg border-2 border-indigo-200 dark:border-indigo-900 hover:border-indigo-600 dark:hover:border-indigo-600 transition-all duration-300 hover:scale-105 shadow-md"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* How It Works */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-12">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Write Your Notes", desc: "Paste or type your meeting notes" },
                { step: "02", title: "AI Processes", desc: "Our AI analyzes and extracts key information" },
                { step: "03", title: "Get Insights", desc: "Receive summaries and action items instantly" }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 opacity-50">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>© 2024 MeetWise. Powered by AI.</p>
      </footer>
    </div>
  );
}
