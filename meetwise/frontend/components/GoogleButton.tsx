"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

declare global {
    interface Window {
        google?: any;
    }
}

interface GoogleButtonProps {
    className?: string;
    onError?: (msg: string) => void;
}

export default function GoogleButton({ className = "", onError }: GoogleButtonProps) {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const googleBtnRef = useRef<HTMLDivElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1091720297195-lhholat3lnt61ec5j69s5kd7btdes5ii.apps.googleusercontent.com";

    useEffect(() => {
        // Load Google Identity Services script
        if (window.google?.accounts?.id) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => {
            if (onError) onError("Failed to load Google Sign-In SDK");
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (!scriptLoaded || !googleBtnRef.current || !window.google?.accounts?.id) return;

        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    try {
                        if (!response.credential) {
                            throw new Error("No credential returned from Google");
                        }
                        await auth.loginWithGoogle(response.credential);
                        await refreshUser();
                        router.push("/dashboard");
                    } catch (err: any) {
                        console.error("Google Auth error:", err);
                        if (onError) onError(err.message || "Google Sign-In failed");
                    }
                },
            });

            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: "outline",
                size: "large",
                width: "100%",
                text: "continue_with",
                shape: "rectangular",
            });
        } catch (e: any) {
            console.error("Failed to render Google button:", e);
        }
    }, [scriptLoaded, clientId]);

    return (
        <div className={`w-full flex justify-center ${className}`}>
            <div ref={googleBtnRef} className="w-full min-h-[44px]"></div>
        </div>
    );
}
