import { Sparkles } from "lucide-react";
import Link from "next/link";

interface LogoProps {
    className?: string; // Additional classes for the container
    iconSize?: string;  // Size classes for the icon explicitly (e.g., "w-7 h-7")
    textSize?: string;  // Size classes for the text explicitly (e.g., "text-3xl")
    href?: string;      // Optional link target (defaults to /)
}

export function Logo({ className = "", iconSize = "w-7 h-7", textSize = "text-3xl", href = "/" }: LogoProps) {
    return (
        <Link href={href} className={`flex items-center gap-3 group ${className}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Sparkles className={`${iconSize} text-white`} />
            </div>
            <h1 className={`${textSize} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                OnboardAI
            </h1>
        </Link>
    );
}
