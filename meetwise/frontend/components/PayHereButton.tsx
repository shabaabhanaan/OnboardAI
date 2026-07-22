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

            // PayHere requires a backend hash generator. Since Supabase functions were removed, simulate mock payment.
            alert("PayHere live integration requires a local backend hash endpoint. Simulating payment success...");
            window.location.href = '/dashboard?payment=success';
        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(`Payment Error: ${error.message}`);
        } finally {
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
