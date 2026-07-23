"use client";

import { useState, useEffect } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getSession } from '@/lib/api';

interface PayHereButtonProps {
    amount: number;
    orderId: string;
    items: string;
    className?: string;
}

declare global {
    interface Window {
        payhere: any;
    }
}

export default function PayHereButton({ amount, orderId, items, className }: PayHereButtonProps) {
    const [loading, setLoading] = useState(false);
    const [sdkReady, setSdkReady] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (window.payhere) {
            setSdkReady(true);
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        script.async = true;
        script.onload = () => setSdkReady(true);
        script.onerror = () => console.warn('PayHere SDK failed to load; mock mode will be available.');
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handlePayment = async (e: React.MouseEvent) => {
        setLoading(true);
        try {
            const session = await getSession();
            if (!session) {
                window.location.href = '/login?redirect=/pricing';
                return;
            }

            // 1. Fetch parameters & MD5 Hash from backend
            const hashRes = await fetch('/api/payhere/hash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ amount, orderId })
            });

            if (!hashRes.ok) {
                const errData = await hashRes.json();
                throw new Error(errData.error || 'Failed to initialize PayHere gateway');
            }

            const hashData = await hashRes.json();

            // 2. Handle Mock Mode or Shift Key
            if (e.shiftKey || hashData.isMock || !window.payhere) {
                console.log("Processing PayHere in Mock Mode...");
                setTimeout(async () => {
                    try {
                        const verifyRes = await fetch('/api/payhere/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({ orderId, isMock: true })
                        });

                        if (!verifyRes.ok) {
                            const verifyErr = await verifyRes.json();
                            throw new Error(verifyErr.error || 'Mock verification failed');
                        }

                        window.location.href = '/dashboard?payment=success';
                    } catch (err: any) {
                        alert(`Mock Payment Error: ${err.message}`);
                        setLoading(false);
                    }
                }, 1200);
                return;
            }

            // 3. Configure PayHere SDK Handlers for Real / Sandbox Modal Checkout
            window.payhere.onCompleted = async function onCompleted(completedOrderId: string) {
                console.log(`PayHere Payment completed for order: ${completedOrderId}`);
                try {
                    const verifyRes = await fetch('/api/payhere/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ orderId: completedOrderId, isMock: false })
                    });

                    if (!verifyRes.ok) {
                        const verifyErr = await verifyRes.json();
                        throw new Error(verifyErr.error || 'Payment verification failed');
                    }

                    window.location.href = '/dashboard?payment=success';
                } catch (err: any) {
                    alert(`Payment Verification Error: ${err.message}`);
                    setLoading(false);
                }
            };

            window.payhere.onDismissed = function onDismissed() {
                console.log("PayHere payment modal dismissed by user.");
                setLoading(false);
            };

            window.payhere.onError = function onError(error: any) {
                console.error("PayHere Error:", error);
                alert(`PayHere Error: ${error}`);
                setLoading(false);
            };

            // 4. Start PayHere Modal Payment
            const isLive = process.env.NEXT_PUBLIC_PAYHERE_MODE === 'live';
            const paymentDetails = {
                sandbox: !isLive,
                merchant_id: hashData.merchantId,
                return_url: `${window.location.origin}/dashboard?payment=success`,
                cancel_url: `${window.location.origin}/pricing?payment=cancelled`,
                notify_url: `${window.location.origin}/api/payhere/notify`,
                order_id: orderId,
                items: items,
                amount: hashData.amountFormatted,
                currency: hashData.currency,
                first_name: user?.name?.split(' ')[0] || 'Customer',
                last_name: user?.name?.split(' ').slice(1).join(' ') || '',
                email: user?.email || '',
                phone: '',
                address: '',
                city: '',
                country: 'Sri Lanka',
                custom_1: hashData.userId,
                hash: hashData.hash
            };

            window.payhere.startPayment(paymentDetails);

        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(`Payment Error: ${error.message}`);
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
                    Upgrade with PayHere
                </>
            )}
        </button>
    );
}
