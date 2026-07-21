"use client";

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getSession } from '@/lib/api';

interface PayPalButtonProps {
    amount: number;
    className?: string;
}

export default function PayPalButton({ amount, className }: PayPalButtonProps) {
    const [sdkReady, setSdkReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMockMode, setIsMockMode] = useState(false);
    const { user } = useAuth();
    const paypalContainerRef = useRef<HTMLDivElement>(null);
    const buttonRenderedRef = useRef(false);

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    useEffect(() => {
        // 1. Check if PayPal client ID exists
        if (!clientId) {
            setIsMockMode(true);
            return;
        }

        // 2. Avoid loading script twice
        if (window.hasOwnProperty('paypal')) {
            setSdkReady(true);
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.async = true;
        script.onload = () => {
            setSdkReady(true);
        };
        script.onerror = () => {
            console.error("Failed to load PayPal SDK. Falling back to Mock Mode.");
            setIsMockMode(true);
        };
        document.body.appendChild(script);

        return () => {
            // Clean up if component unmounts before script loads
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [clientId]);

    useEffect(() => {
        // 3. Render PayPal buttons when SDK is ready and container is available
        if (sdkReady && paypalContainerRef.current && !buttonRenderedRef.current && !isMockMode) {
            buttonRenderedRef.current = true;
            (window as any).paypal.Buttons({
                createOrder: async () => {
                    try {
                        const session = await getSession();
                        if (!session) {
                            window.location.href = '/login?redirect=/pricing';
                            return '';
                        }

                        const res = await fetch('/api/paypal/create-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            }
                        });

                        if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.error || 'Failed to create order');
                        }

                        const data = await res.json();
                        return data.orderId;
                    } catch (err: any) {
                        console.error("PayPal Create Order Error:", err);
                        alert(`Create Order Error: ${err.message}`);
                        return '';
                    }
                },
                onApprove: async (data: any, actions: any) => {
                    setLoading(true);
                    try {
                        const session = await getSession();
                        if (!session) {
                            window.location.href = '/login?redirect=/pricing';
                            return;
                        }

                        const res = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({
                                orderId: data.orderID,
                                isMock: false
                            })
                        });

                        if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.error || 'Failed to capture payment');
                        }

                        const captureResult = await res.json();
                        if (captureResult.success) {
                            window.location.href = '/dashboard?payment=success';
                        } else {
                            throw new Error('Payment was not completed successfully');
                        }
                    } catch (err: any) {
                        console.error("PayPal Capture Error:", err);
                        alert(`Payment Capture Error: ${err.message}`);
                        setLoading(false);
                    }
                },
                onError: (err: any) => {
                    console.error("PayPal SDK Button Error:", err);
                    alert("An error occurred during the PayPal checkout process.");
                }
            }).render(paypalContainerRef.current);
        }
    }, [sdkReady, isMockMode]);

    // Handle Mock Checkout Function
    const handleMockPayment = async (e: React.MouseEvent) => {
        setLoading(true);
        try {
            const session = await getSession();
            if (!session) {
                window.location.href = '/login?redirect=/pricing';
                return;
            }

            // Create Mock Order
            const createRes = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!createRes.ok) {
                const createErrData = await createRes.json();
                throw new Error(createErrData.error || 'Failed to create mock order');
            }

            const createData = await createRes.json();

            // Simulate loading checkout overlay
            setTimeout(async () => {
                try {
                    const captureRes = await fetch('/api/paypal/capture-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({
                            orderId: createData.orderId,
                            isMock: true
                        })
                    });

                    if (!captureRes.ok) {
                        const captureErrData = await captureRes.json();
                        throw new Error(captureErrData.error || 'Failed to capture mock payment');
                    }

                    const captureData = await captureRes.json();
                    if (captureData.success) {
                        window.location.href = '/dashboard?payment=success';
                    } else {
                        throw new Error('Mock capture failed');
                    }
                } catch (captureErr: any) {
                    alert(`Mock Capture Error: ${captureErr.message}`);
                    setLoading(false);
                }
            }, 1500);

        } catch (error: any) {
            console.error("Mock Checkout Error:", error);
            alert(`Mock Checkout Error: ${error.message}`);
            setLoading(false);
        }
    };

    if (isMockMode) {
        return (
            <button
                onClick={handleMockPayment}
                disabled={loading}
                className={`flex items-center justify-center gap-2 bg-[#ffc439] hover:bg-[#f4b41a] text-black border border-transparent font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md ${className}`}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Simulating PayPal Checkout...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.007 6.452c-.08-.423-.275-.822-.57-1.155a3.52 3.52 0 0 0-1.636-.97C17.065 4.108 16.037 4 15.009 4H7.667c-.454 0-.853.308-.962.748L3.068 20.306c-.056.223.003.458.16.63.157.172.384.27.621.27h4.743l1.19-4.808c.054-.22.25-.373.477-.373h2.386c3.483 0 6.096-1.42 6.82-4.992.353-1.745.094-3.324-.958-4.584M12.33 13.914H10.15l1.09-4.385h2.179c.613 0 1.15.118 1.547.339.397.221.674.553.801.966.126.413.09.84-.103 1.233-.193.393-.563.704-1.071.903a3.54 3.54 0 0 1-2.263.944"/>
                        </svg>
                        Pay with PayPal
                    </>
                )}
            </button>
        );
    }

    return (
        <div className="w-full relative min-h-[50px] flex flex-col justify-center">
            {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 z-10 flex items-center justify-center gap-2 rounded-xl">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Processing Payment...</span>
                </div>
            )}
            <div ref={paypalContainerRef} id="paypal-button-container" className="w-full"></div>
            {!sdkReady && (
                <div className="w-full py-3 px-6 rounded-xl font-semibold text-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    Loading PayPal...
                </div>
            )}
        </div>
    );
}
