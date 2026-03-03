'use client';

import React, { useState, useEffect } from 'react';
import {
    Check,
    Crown,
    MessageSquare,
    Info,
    CreditCard as CardIcon,
    Download,
    ArrowRight,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';

interface Gateway {
    id: string;
    name: string;
    is_active: boolean;
}


export function SubscriptionTab() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [currentPlanId, setCurrentPlanId] = useState<string>('FREE');
    const router = useRouter();

    useEffect(() => {
        fetchTransactions();
        fetchUserPlan();
    }, []);

    const fetchUserPlan = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('current_plan_id')
            .eq('id', user.id)
            .single();
        if (profile) setCurrentPlanId(profile.current_plan_id || 'FREE');
    };

    const fetchTransactions = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
        if (!error && data) setTransactions(data);
    };

    const handleUpgrade = (plan: any) => {
        if (plan.id === currentPlanId) return;
        router.push(`/dashboard/settings/checkout?planId=${plan.id}&cycle=${billingCycle}`);
    };

    const downloadBill = (transactionId: string) => {
        window.open(`/api/billing/invoice?id=${transactionId}`, '_blank');
    };

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                        <CardIcon className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Subscription</h1>
                        <p className="text-sm" style={{ color: '#9370db' }}>Choose the plan that fits your growth</p>
                    </div>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center p-1 rounded-xl w-fit gap-1"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
                        style={billingCycle === 'monthly'
                            ? { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff' }
                            : { color: '#9370db' }}
                    >Monthly</button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        className="px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                        style={billingCycle === 'annual'
                            ? { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff' }
                            : { color: '#9370db' }}
                    >
                        Annual
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                            -20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {PLANS.map((plan) => {
                    const price = billingCycle === 'annual' ? Math.round(plan.price * 0.8 * 12) : plan.price;
                    const period = billingCycle === 'annual' ? '/yr' : '/mo';
                    const isCurrent = plan.id === currentPlanId;

                    return (
                        <div
                            key={plan.id}
                            className="relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                            style={{
                                background: plan.cardBg,
                                border: plan.popular
                                    ? `1px solid rgba(236,72,153,0.4)`
                                    : '1px solid rgba(124,58,237,0.2)',
                                boxShadow: plan.popular
                                    ? '0 0 40px rgba(124,58,237,0.15)'
                                    : '0 4px 24px rgba(0,0,0,0.4)',
                            }}
                        >
                            {/* Best Value Badge */}
                            {plan.popular && (
                                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                                    Best Value
                                </div>
                            )}

                            {/* Active Plan Badge */}
                            {isCurrent && (
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white animate-pulse"
                                    style={{ background: 'rgba(124,58,237,0.8)', border: '1px solid rgba(124,58,237,0.5)' }}>
                                    <Check size={8} /> Active
                                </div>
                            )}

                            {/* Card Body */}
                            <div className="p-6 flex flex-col flex-1">
                                {/* Plan Label */}
                                <div className="text-[10px] font-black uppercase tracking-[0.25em] mb-4"
                                    style={{ color: 'rgba(147,112,219,0.7)' }}>
                                    {plan.name}
                                </div>

                                {/* Metric Purple Box */}
                                <div className="rounded-2xl p-5 mb-5 text-center"
                                    style={{
                                        background: plan.gradient,
                                        boxShadow: `0 8px 32px rgba(124,58,237,0.35)`,
                                    }}>
                                    <div className="text-3xl font-black text-white tracking-tight">
                                        {plan.metric}{' '}
                                        <span className="text-base font-semibold opacity-75">{plan.unit}</span>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest mt-1"
                                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {billingCycle === 'annual' ? 'Per Year' : 'Per Month'}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-5">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white">${price}</span>
                                        <span className="text-xs font-black uppercase"
                                            style={{ color: 'rgba(147,112,219,0.6)' }}>{period}</span>
                                    </div>
                                    <div className="text-[11px] font-bold mt-0.5"
                                        style={{ color: plan.accent }}>
                                        ${plan.pricePerUnit} / {plan.unitLabel}
                                    </div>
                                </div>

                                {/* Feature List */}
                                <ul className="space-y-2.5 mb-6 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-[12.5px] text-white/80">
                                            <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: 'rgba(124,58,237,0.25)', border: `1px solid ${plan.accent}55` }}>
                                                <Check size={8} style={{ color: plan.accent }} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                    {plan.notIncluded.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-[12.5px] opacity-25">
                                            <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <X size={8} className="text-white/40" />
                                            </div>
                                            <span className="text-white line-through">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={isCurrent}
                                    className="w-full py-3.5 rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center gap-0.5 group"
                                    style={
                                        isCurrent
                                            ? { background: 'rgba(124,58,237,0.2)', color: 'rgba(147,112,219,0.6)', border: '1px solid rgba(124,58,237,0.2)', cursor: 'default' }
                                            : plan.popular
                                                ? { background: plan.gradient, color: '#fff', boxShadow: `0 4px 20px rgba(124,58,237,0.4)` }
                                                : { background: 'transparent', color: '#fff', border: '1px solid rgba(124,58,237,0.4)' }
                                    }
                                >
                                    <span className="flex items-center gap-2 uppercase tracking-widest text-[11px]">
                                        {isCurrent ? 'Current Plan' : plan.buttonText}
                                        {!isCurrent && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                    {!isCurrent && (
                                        <span className="text-[9px] uppercase tracking-widest opacity-60 font-semibold">{plan.buttonSub}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Transactions */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <MessageSquare size={14} style={{ color: '#9370db' }} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                </div>

                <div className="rounded-2xl overflow-hidden divide-y divide-white/5"
                    style={{ background: 'rgba(26,9,40,0.9)', border: '1px solid rgba(124,58,237,0.2)', divideColor: 'rgba(124,58,237,0.1)' }}>
                    {transactions.length > 0 ? transactions.map((tx) => (
                        <div key={tx.id}
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                                    <Crown size={18} className="text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">{tx.plan_id} Plan</div>
                                    <div className="text-xs" style={{ color: '#9370db' }}>
                                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-5">
                                <div className="text-right">
                                    <div className="font-black text-lg text-white">${tx.amount} <span className="text-xs font-normal opacity-40">{tx.currency}</span></div>
                                    <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${tx.status === 'success' ? 'text-green-400' : 'text-red-400'
                                        }`}
                                        style={{
                                            background: tx.status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            border: tx.status === 'success' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)'
                                        }}>
                                        {tx.status}
                                    </div>
                                </div>
                                <button
                                    onClick={() => downloadBill(tx.id)}
                                    title="Download Invoice"
                                    className="p-2.5 rounded-xl transition-all"
                                    style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#9370db' }}
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-16 text-center flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                                <Info size={24} style={{ color: 'rgba(147,112,219,0.4)' }} />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest text-white/60">No Transactions Yet</p>
                                <p className="text-xs mt-1" style={{ color: 'rgba(147,112,219,0.4)' }}>Your billing history will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
