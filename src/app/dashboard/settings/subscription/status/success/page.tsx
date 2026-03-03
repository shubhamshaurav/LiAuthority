'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, LayoutDashboard, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-primary))_0%,transparent_25%),radial-gradient(circle_at_bottom_left,hsl(var(--accent-secondary))_0%,transparent_25%)]">
            <div className="max-w-md w-full animate-fade-in">
                <GlassCard className="p-8 text-center border-[hsl(var(--accent-primary))]/20 shadow-2xl shadow-[hsl(var(--accent-primary))]/10">
                    <div className="w-20 h-20 bg-[hsl(var(--accent-primary))]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} className="text-[hsl(var(--accent-primary))]" />
                    </div>

                    <h1 className="text-3xl font-black text-[hsl(var(--text-active))] mb-2">Upgrade Successful!</h1>
                    <p className="text-[hsl(var(--text-secondary))] mb-8">
                        Your account has been upgraded. You now have access to premium features and increased limits.
                    </p>

                    <div className="bg-[hsl(var(--bg-primary))]/5 rounded-2xl p-6 mb-8 border border-[hsl(var(--glass-border))] text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="text-[hsl(var(--accent-primary))]" size={20} />
                            <p className="font-bold text-sm">What's next?</p>
                        </div>
                        <ul className="space-y-3 text-sm text-[hsl(var(--text-secondary))]">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-primary))]" />
                                Explore new voice profiles
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-primary))]" />
                                Build your content calendar
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-primary))]" />
                                Generate unlimited AI posts
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/dashboard">
                            <GradientButton className="w-full py-4 rounded-xl flex items-center justify-center">
                                Go to Dashboard
                                <LayoutDashboard className="ml-2" size={18} />
                            </GradientButton>
                        </Link>
                        <Link href="/dashboard/settings/subscription">
                            <button className="w-full py-3 text-sm font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-active))] transition-all">
                                View Subscription Details
                            </button>
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
