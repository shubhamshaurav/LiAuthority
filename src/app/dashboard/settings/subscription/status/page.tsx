'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Crown } from 'lucide-react';
import { Suspense } from 'react';

function StatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order_id');

    const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');
    const [planId, setPlanId] = useState<string>('');

    useEffect(() => {
        if (!orderId) {
            setStatus('failed');
            return;
        }
        verifyPayment();
    }, [orderId]);

    const verifyPayment = async () => {
        try {
            const res = await fetch(`/api/payments/verify-order?order_id=${orderId}`);
            const data = await res.json();

            if (data.status === 'success') {
                setStatus('success');
                setPlanId(data.plan_id || '');
            } else if (data.status === 'pending') {
                setStatus('pending');
            } else {
                setStatus('failed');
            }
        } catch {
            setStatus('failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--bg-primary))] p-6">
            <div className="max-w-md w-full text-center space-y-8">

                {/* Icon */}
                <div className="flex justify-center">
                    {status === 'loading' && (
                        <div className="w-24 h-24 rounded-full bg-[hsl(var(--accent-primary))]/10 flex items-center justify-center">
                            <Loader2 size={48} className="text-[hsl(var(--accent-primary))] animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center animate-bounce">
                            <CheckCircle2 size={48} className="text-green-400" />
                        </div>
                    )}
                    {status === 'pending' && (
                        <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <Loader2 size={48} className="text-yellow-400 animate-spin" />
                        </div>
                    )}
                    {status === 'failed' && (
                        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
                            <XCircle size={48} className="text-red-400" />
                        </div>
                    )}
                </div>

                {/* Title & Message */}
                {status === 'loading' && (
                    <>
                        <h1 className="text-3xl font-black text-[hsl(var(--text-active))]">Verifying Payment</h1>
                        <p className="text-[hsl(var(--text-secondary))]">Please wait while we confirm your payment with our provider...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-[hsl(var(--accent-primary))]">
                                <Crown size={20} />
                                <span className="text-sm font-black uppercase tracking-widest">Plan Activated</span>
                            </div>
                            <h1 className="text-3xl font-black text-[hsl(var(--text-active))]">Payment Successful! 🎉</h1>
                            <p className="text-[hsl(var(--text-secondary))]">
                                Your <span className="text-[hsl(var(--text-active))] font-bold">{planId}</span> plan is now active.
                                Enjoy all the premium features!
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-[hsl(var(--accent-primary))]/25"
                        >
                            Go to Dashboard <ArrowRight size={18} />
                        </button>
                    </>
                )}
                {status === 'pending' && (
                    <>
                        <h1 className="text-3xl font-black text-[hsl(var(--text-active))]">Payment Processing</h1>
                        <p className="text-[hsl(var(--text-secondary))]">Your payment is being processed. This can take a few minutes. We'll activate your plan automatically.</p>
                        <button
                            onClick={() => router.push('/dashboard/settings?tab=subscription')}
                            className="inline-flex items-center gap-2 border border-[hsl(var(--glass-border))] text-[hsl(var(--text-secondary))] font-bold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all"
                        >
                            Check Subscription Status <ArrowRight size={18} />
                        </button>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <h1 className="text-3xl font-black text-[hsl(var(--text-active))]">Payment Failed</h1>
                        <p className="text-[hsl(var(--text-secondary))]">We couldn't verify your payment. Your card was not charged. Please try again or contact support.</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] text-white font-black px-8 py-4 rounded-2xl hover:opacity-90 transition-all"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="inline-flex items-center gap-2 border border-[hsl(var(--glass-border))] text-[hsl(var(--text-secondary))] font-bold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </>
                )}

                {/* Order ID */}
                {orderId && (
                    <p className="text-[10px] text-[hsl(var(--text-secondary))]/40 uppercase tracking-widest font-mono">
                        Order: {orderId}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[hsl(var(--accent-primary))]" />
            </div>
        }>
            <StatusContent />
        </Suspense>
    );
}
