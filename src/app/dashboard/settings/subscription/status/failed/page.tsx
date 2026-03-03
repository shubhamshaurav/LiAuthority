'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, RefreshCcw, MessageSquare } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

export default function PaymentFailedPage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.1)_0%,transparent_25%),radial-gradient(circle_at_bottom_left,hsl(var(--accent-secondary))_0%,transparent_25%)]">
            <div className="max-w-md w-full animate-fade-in">
                <GlassCard className="p-8 text-center border-red-500/20 shadow-2xl shadow-red-500/5">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={48} className="text-red-500" />
                    </div>

                    <h1 className="text-3xl font-black text-[hsl(var(--text-active))] mb-2">Payment Failed</h1>
                    <p className="text-[hsl(var(--text-secondary))] mb-8">
                        Something went wrong during the checkout process. Your card was not charged.
                    </p>

                    <div className="bg-[hsl(var(--bg-primary))]/5 rounded-2xl p-6 mb-8 border border-[hsl(var(--glass-border))] text-left">
                        <p className="font-bold text-sm mb-4">Possible Reasons:</p>
                        <ul className="space-y-3 text-sm text-[hsl(var(--text-secondary))]">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Insufficient funds or card limits
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Payment was declined by your bank
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Information mismatch or timeout
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/dashboard/settings/subscription">
                            <GradientButton className="w-full py-4 rounded-xl flex items-center justify-center">
                                Try Again
                                <RefreshCcw className="ml-2" size={18} />
                            </GradientButton>
                        </Link>
                        <Link href="mailto:support@smartleadgen.cloud">
                            <button className="w-full py-3 text-sm font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-active))] flex items-center justify-center gap-2 transition-all">
                                <MessageSquare size={18} />
                                Contact Support
                            </button>
                        </Link>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
