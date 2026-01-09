
"use client";

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getSession } from '@/lib/api';

interface PayHereButtonProps {
    amount: number;
    orderId: string;
    items: string;
    className?: string;
}

export default function PayHereButton({ amount, orderId, items, className }: PayHereButtonProps) {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handlePayment = async (e: React.MouseEvent) => {
        // Mock Mode: Hold Shift to simulate success
        if (e.shiftKey) {
            setLoading(true);
            setTimeout(() => {
                alert("Simulating successful payment logic...");
                window.location.href = '/dashboard?payment=success';
                setLoading(false);
            }, 1500);
            return;
        }

        setLoading(true);
        try {
            const session = await getSession();
            if (!session) {
                window.location.href = '/login?redirect=/pricing';
                return;
            }

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            // 1. Get Hash from Edge Function
            const res = await fetch(`${supabaseUrl}/functions/v1/payhere-hash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': supabaseAnonKey || ''
                },
                body: JSON.stringify({
                    amount: amount,
                    order_id: orderId
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to initialize payment');
            }

            const data = await res.json();

            // 2. Create and Submit Form Programmatically
            // We use the PayHere Sandbox URL for testing
            const payhereUrl = "https://sandbox.payhere.lk/pay/checkout";

            const form = document.createElement("form");
            form.method = "POST";
            form.action = payhereUrl;

            // Required Fields
            const fields = {
                merchant_id: data.merchant_id,
                return_url: `${window.location.origin}/dashboard`, // Where to go after success
                cancel_url: `${window.location.origin}/pricing`,   // Where to go after cancel
                notify_url: `${supabaseUrl}/functions/v1/payhere-notify`,
                order_id: orderId,
                items: items,
                currency: data.currency,
                amount: data.amount_formatted,
                first_name: user?.username || 'User',
                last_name: '',
                email: user?.email || '',
                phone: "0771234567", // Placeholder or get from profile
                address: "Sri Lanka",
                city: "Colombo",
                country: "Sri Lanka",
                hash: data.hash,
                custom_1: user?.id || "" // Pass User ID to verify later
            };

            // Append inputs
            Object.entries(fields).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

        } catch (error: any) {
            console.error("Payment Error:", error);

            // Helpful message for the user
            if (error.message.includes("fetch")) {
                alert("Cannot connect to payment server. Did you deploy the Supabase Edge Functions?");
            } else {
                alert(`Payment Error: ${error.message}`);
            }

            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`flex items-center justify-center gap-2 ${className}`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <CreditCard className="w-5 h-5" />
                    Upgrade
                </>
            )}
        </button>
    );
}
