'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import {
    CheckCircle2,
    Zap,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    Lock,
    CreditCard,
    Info,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Plan definitions (mirrored from SubscriptionTab for now)
const PLANS = [
    {
        id: 'FREE',
        name: 'Free Plan',
        price: 0,
        metric: '25',
        unit: 'Posts',
    },
    {
        id: 'PRO',
        name: 'Pro Plan',
        price: 10,
        metric: 'Unltd',
        unit: 'Posts',
    },
    {
        id: 'GROWTH',
        name: 'Growth Plan',
        price: 20,
        metric: 'Full OS',
        unit: 'AI Agent',
    }
];

interface Gateway {
    id: string;
    name: string;
    is_active: boolean;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planId = searchParams.get('planId');
    const billingCycle = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'annual';

    const [couponCode, setCouponCode] = useState('');
    const [selectedGatewayId, setSelectedGatewayId] = useState<string>('');
    const [activeGateways, setActiveGateways] = useState<Gateway[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const plan = PLANS.find(p => p.id === planId);

    useEffect(() => {
        if (!planId || !plan) {
            router.push('/dashboard/settings?tab=subscription');
            return;
        }
        fetchGateways();
    }, [planId]);

    const fetchGateways = async () => {
        // 1. Check Authentication State
        const { data: { session } } = await supabase.auth.getSession();
        console.log('DEBUG: Session exists:', !!session);
        if (session) {
            console.log('DEBUG: User ID:', session.user.id);
            console.log('DEBUG: User Email:', session.user.email);
        }

        // 2. Simple Fetch (Schema is already in client config)
        console.log('DEBUG: Starting fetch from payment_gateways...');
        const { data, error } = await supabase
            .from('payment_gateways')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('DEBUG: Raw Error Object:', error);
            console.log('DEBUG: Error Message:', error.message);
            console.log('DEBUG: Error Code:', error.code);
            console.log('DEBUG: Error Details:', error.details);
            console.log('DEBUG: Error Hint:', error.hint);

            toast.error(`DB Error: ${error.message || 'Check console'}`);
            return;
        }

        console.log('DEBUG: Fetch Data:', data);
        if (data) {
            setActiveGateways(data);
            if (data.length > 0) {
                console.log('DEBUG: Setting Gateway:', data[0].id);
                setSelectedGatewayId(data[0].id);
            } else {
                console.warn('DEBUG: No active gateways returned from DB (matching is_active=true)');
            }
        }
    };

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        toast.info('Validating coupon code...');
        setTimeout(() => {
            toast.error('Invalid or expired coupon code');
        }, 1000);
    };

    const handleCheckout = async () => {
        if (!selectedGatewayId || !plan) return;

        setIsProcessing(true);
        toast.info('Initiating secure checkout...');

        try {
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    couponCode: couponCode,
                    gatewayId: selectedGatewayId,
                    billingCycle: billingCycle
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const combinedError = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to create order');
                throw new Error(combinedError);
            }

            if (data.gateway === 'cashfree') {
                const cashfree = (window as any).Cashfree;
                if (!cashfree) {
                    toast.error('Cashfree SDK not loaded. Please refresh.');
                    return;
                }
                const cf = await cashfree({ mode: "sandbox" });
                await cf.checkout({
                    paymentSessionId: data.payment_session_id,
                    redirectTarget: "_self"
                });
            } else if (data.gateway === 'dodopayments') {
                window.location.href = data.checkout_url;
            }

        } catch (error: any) {
            toast.error(error.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!plan) return null;

    const price = billingCycle === 'annual' ? Math.round(plan.price * 0.8 * 12) : plan.price;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-active))] transition-colors mb-10 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold">Back to Plans</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Summary */}
                <div className="lg:col-span-7 space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-[hsl(var(--text-active))] mb-2 tracking-tight">Complete your upgrade</h1>
                        <p className="text-[hsl(var(--text-secondary))]">Review your order details and select a payment method.</p>
                    </div>

                    <GlassCard className="p-8 border-[hsl(var(--glass-border))] overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[hsl(var(--accent-primary))]/5 rounded-full blur-3xl" />

                        <div className="relative space-y-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-[hsl(var(--accent-primary))] uppercase tracking-[0.2em]">Selected Plan</div>
                                    <h3 className="text-2xl font-bold text-[hsl(var(--text-active))]">{plan.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))]">
                                        <Zap size={14} className="text-[hsl(var(--accent-primary))]" />
                                        <span>{plan.metric} {plan.unit} per {billingCycle === 'annual' ? 'year' : 'month'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-[hsl(var(--text-active))]">${price}</div>
                                    <div className="text-[10px] font-black uppercase text-[hsl(var(--text-secondary))] opacity-40">{billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}</div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[hsl(var(--text-secondary))] italic">Subscription Period</span>
                                    <span className="font-bold">{billingCycle === 'annual' ? '12 Months' : '1 Month'}</span>
                                </div>
                                {billingCycle === 'annual' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[hsl(var(--text-secondary))] italic">Annual Discount</span>
                                        <span className="text-green-400 font-bold">-20% Applied</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black border-t border-white/5 pt-4">
                                    <span>Total Amount</span>
                                    <span className="text-[hsl(var(--accent-primary))]">${price}.00</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Coupon Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[hsl(var(--text-secondary))] opacity-60">Promo Code</h4>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="ENTER CODE"
                                className="flex-1 bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[hsl(var(--accent-primary))]/50 font-black uppercase tracking-widest text-[hsl(var(--accent-primary))] transition-all"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button
                                onClick={handleApplyCoupon}
                                className="px-8 py-4 bg-white/5 border border-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-green-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-sm font-bold text-[hsl(var(--text-active))]">Guaranteed Security</h5>
                            <p className="text-xs text-[hsl(var(--text-secondary))]">Your transactions are protected by industry-standard 256-bit encryption.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[hsl(var(--text-secondary))] opacity-60">Payment Methods</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {activeGateways.length > 0 ? (
                                activeGateways.map((gw) => (
                                    <button
                                        key={gw.id}
                                        onClick={() => setSelectedGatewayId(gw.id)}
                                        className={`flex items-center justify-between p-6 rounded-3xl border transition-all text-left group/gw ${selectedGatewayId === gw.id ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5 shadow-lg shadow-[hsl(var(--accent-primary))]/10' : 'border-[hsl(var(--glass-border))] bg-white/[0.02] hover:bg-white/[0.05] text-[hsl(var(--text-secondary))]'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full border-2 border-white/20 flex items-center justify-center ${selectedGatewayId === gw.id ? 'border-[hsl(var(--accent-primary))]' : ''}`}>
                                                {selectedGatewayId === gw.id && <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-primary))]" />}
                                            </div>
                                            <span className={`font-black uppercase tracking-widest text-xs transition-colors ${selectedGatewayId === gw.id ? 'text-[hsl(var(--text-active))]' : ''}`}>{gw.name}</span>
                                        </div>
                                        <ChevronRight size={16} className={`transition-all ${selectedGatewayId === gw.id ? 'translate-x-1 opacity-100' : 'opacity-20 group-hover/gw:opacity-100'}`} />
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 rounded-3xl border border-dashed border-white/10 text-center space-y-4">
                                    <Info size={24} className="mx-auto text-[hsl(var(--text-secondary))] opacity-40" />
                                    <div className="space-y-1">
                                        <p className="text-xs text-[hsl(var(--text-active))] font-bold">No active payment methods found</p>
                                        <p className="text-[10px] text-[hsl(var(--text-secondary))] italic">Please ensure at least one gateway is active and RLS policies are applied.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            toast.promise(fetchGateways(), {
                                                loading: 'Refreshing payment methods...',
                                                success: 'Loaded gateways',
                                                error: 'Failed to refresh'
                                            });
                                        }}
                                        className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--accent-primary))] hover:underline"
                                    >
                                        Try Refreshing
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <GlassCard className="p-8 border-[hsl(var(--glass-border))] bg-gradient-to-br from-white/[0.03] to-transparent space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[hsl(var(--text-secondary))]">
                                <Lock size={16} className="opacity-40" />
                                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Finalize Payment</span>
                            </div>
                            <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                                Clicking the button below will initiate the payment process through your selected gateway. Please do not refresh or close the page until the transaction is complete.
                            </p>
                        </div>

                        <GradientButton
                            onClick={handleCheckout}
                            disabled={isProcessing || !selectedGatewayId}
                            className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-[hsl(var(--accent-primary))]/20 transition-all font-black uppercase tracking-widest text-sm"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Pay ${price} Now
                                    <CheckCircle2 size={20} />
                                </>
                            )}
                        </GradientButton>

                        <div className="flex items-center justify-center gap-3 opacity-30 grayscale pointer-events-none pb-2">
                            <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-black italic">VISA</div>
                            <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-black italic">MC</div>
                            <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-black italic">UPI</div>
                        </div>
                    </GlassCard>

                    <div className="text-center space-y-3">
                        <p className="text-[10px] text-[hsl(var(--text-secondary))] opacity-40 leading-relaxed max-w-xs mx-auto">
                            By clicking Pay Now, you agree to our Subscription Terms and authorize this charge to your selected payment method.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-[hsl(var(--text-secondary))] animate-pulse">Initializing secure checkout...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
