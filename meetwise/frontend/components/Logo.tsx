import Link from "next/link";

function StylizedC({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* The outer 'C' arc */}
            <path 
                d="M 72 28 A 32 32 0 1 0 72 72" 
                stroke="url(#c-gradient)" 
                strokeWidth="11" 
                strokeLinecap="round"
            />
            {/* Connection lines */}
            <line x1="46" y1="50" x2="68" y2="36" stroke="url(#c-gradient)" strokeWidth="5" strokeLinecap="round" />
            <line x1="46" y1="50" x2="68" y2="64" stroke="url(#c-gradient)" strokeWidth="5" strokeLinecap="round" />
            
            {/* Hub node */}
            <circle cx="46" cy="50" r="8" fill="url(#c-gradient)" />
            <circle cx="46" cy="50" r="3.5" fill="white" />
            
            {/* Branch nodes */}
            <circle cx="68" cy="36" r="6" fill="url(#c-gradient)" />
            <circle cx="68" cy="64" r="6" fill="url(#c-gradient)" />
            
            <defs>
                <linearGradient id="c-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>
        </svg>
    );
}

interface LogoProps {
    className?: string; // Additional classes for the container
    textSize?: string;  // Size classes for the text explicitly (e.g., "text-3xl")
    href?: string;      // Optional link target (defaults to /)
}

export function Logo({ className = "", textSize = "text-3xl", href = "/" }: LogoProps) {
    return (
        <Link href={href} className={`flex items-center group ${className}`}>
            <div className={`flex items-center font-bold text-gray-900 dark:text-white leading-none ${textSize}`}>
                <StylizedC className="w-[1.7em] h-[1.7em] self-center mr-[-0.22em] group-hover:scale-105 transition-transform duration-300" />
                <span className="tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent select-none">
                    odereporeach
                </span>
            </div>
        </Link>
    );
}
