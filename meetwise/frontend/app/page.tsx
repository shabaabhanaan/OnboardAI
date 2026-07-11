"use client";

import Link from "next/link";
import { Sparkles, Brain, Zap, Shield, GitBranch, RefreshCw, MessageSquare, KeyRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function Home() {
  const coreFeatures = [
    {
      icon: Brain,
      title: "Architecture Analysis",
      description: "Instantly maps out high-level software designs and complex data flows so new developers can understand how the overall system connects without reading thousands of lines of code."
    },
    {
      icon: Zap,
      title: "Critical Path Detection",
      description: "Automatically isolates and highlights the most vital files, entry points, and modules within a repository, directing the user exactly where they should start reading first."
    },
    {
      icon: Shield,
      title: "Contextual Documentation Synthesis",
      description: "Eliminates the frustration of wading through weeks of outdated internal wikis or sparse markdown docs, generating immediate clarity straight from the source code."
    },
    {
      icon: Sparkles,
      title: "Personalized Learning Plans",
      description: "Dynamically curates a day-by-day onboarding strategy tailored specifically to the developer’s explicit role (e.g., separating frontend onboarding tracks from backend setups)."
    }
  ];

  const backendCapabilities = [
    {
      icon: GitBranch,
      title: "Dynamic GitHub/GitLab Integration",
      description: "A seamless OAuth pipeline where an engineering lead pastes a repository link, allowing the system to securely scan and index the codebase."
    },
    {
      icon: RefreshCw,
      title: "Continuous Code Synchronization",
      description: "Instead of a static map, the backend watches the repository branches and automatically updates the architecture overview every time a major Pull Request (PR) is merged."
    },
    {
      icon: MessageSquare,
      title: "Interactive AI Code Assistant",
      description: "A chat window where engineers can ask codebase-specific questions (e.g., 'Where is the authentication middleware handled?' or 'How do I hook into our existing payment webhooks?') and get hyper-localized answers with direct file paths."
    },
    {
      icon: KeyRound,
      title: "Multi-Tier Enterprise Permissions",
      description: "Role-based access control (RBAC) ensuring only authorized team members can scan internal proprietary code, combined with secure Bring-Your-Own-Key (BYOK) data models to protect intellectual property."
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-indigo-950 transition-colors duration-300 overflow-hidden">
      
      {/* Top Navigation Bar Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Logo />
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  <Link href="/" className="hover:text-indigo-655 transition-colors">Home</Link>
                  <Link href="/dashboard" className="hover:text-indigo-655 transition-colors">Features</Link>
                  <Link href="/pricing" className="hover:text-indigo-655 transition-colors">Pricing</Link>
                  <Link href="#contact" className="hover:text-indigo-655 transition-colors">Contact</Link>
              </nav>
              <div className="flex items-center gap-3">
                  <Link href="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-extrabold rounded-xl transition-all shadow-md">
                      Get Started
                  </Link>
              </div>
          </div>
      </header>

      {/* Modern Grid & Glow Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-[-10%] left-[-10%] -z-10 w-[50%] h-[50%] bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8s]"></div>
      <div className="absolute top-[20%] right-[-10%] -z-10 w-[45%] h-[45%] bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[10%] left-[5%] -z-10 w-[30%] h-[30%] bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-16">
        <div className="text-center max-w-6xl mx-auto">
          {/* Logo/Title */}
          <div className="flex items-center justify-center gap-3 mb-6 animate-fadeIn">
            <Logo textSize="text-5xl" iconSize="w-12 h-12" />
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4 animate-fadeIn">
            Master Any Codebase in Minutes
          </p>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto animate-fadeIn">
            Stop getting lost in new projects. Paste a GitHub link, and get an instant architecture overview,
            critical file map, and personalized learning plan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24 animate-fadeIn">
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

          {/* Core Platform Features Section */}
          <div className="mb-28">
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Core Platform Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Supercharge engineering onboarding and knowledge transfer with our key client-facing capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {coreFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-8 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300 flex gap-5 items-start"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monetizable & Scalable Backend Capabilities Section */}
          <div className="mb-28">
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Enterprise & Backend Capabilities
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Operational powerhouses designed to drive enterprise-grade security, code synchronization, and local interactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {backendCapabilities.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <div
                    key={index}
                    className="group p-8 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300 flex gap-5 items-start"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {capability.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-24 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-12">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Paste Repo URL", desc: "Simply paste the GitHub link of the project" },
                { step: "02", title: "AI Maps Architecture", desc: "We analyze structure, dependencies, and docs" },
                { step: "03", title: "Start Contributing", desc: "Follow your personalized plan to master the code" }
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

          {/* Contact Section */}
          <div id="contact" className="mt-28 mb-16 scroll-mt-24 text-left max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-650 dark:text-gray-400">
                Have questions about enterprise plans or security integrations? Drop us a message.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
              {/* Left Column info */}
              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h3>
                  <p className="text-sm text-gray-650 dark:text-gray-400 leading-relaxed">
                    Our technical support team is available 24/7 to assist with onboarding automation, vector database configurations, and secure code scan setups.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-indigo-650">Email:</span>
                    <span>support@onboardai.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-indigo-650">Hours:</span>
                    <span>Mon - Sun, 24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Right Column Form */}
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your request..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
