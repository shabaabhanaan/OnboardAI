import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Github, Twitter, Mail, Book, Shield, MessageSquare, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-900 mt-20 transition-colors duration-300">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <Logo textSize="text-2xl" iconSize="w-6 h-6" />
            </div>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Master any codebase in minutes. Stop getting lost in complex repositories and start contributing instantly.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="mailto:support@onboardai.com" 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Email support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Book className="w-3.5 h-3.5 text-indigo-500" />
                <a href="/docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                <a href="/changelog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Changelog
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <a href="/community" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Community Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Compliance */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  GDPR Compliant
                </span>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright section */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-500">
          <p>© {new Date().getFullYear()} OnboardAI. Powered by Artificial Intelligence.</p>
          <p className="flex items-center gap-1">
            Built with 💜 for developers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
