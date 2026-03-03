'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import {
    Settings,
    Save,
    Power,
    CreditCard,
    Globe,
    Activity,
    Key,
    AlertCircle,
    CheckCircle2,
    Search,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
    const [gateways, setGateways] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [gwRes, txRes] = await Promise.all([
                supabase.from('payment_gateways').select('*'),
                supabase.from('transactions').select('*, user_profiles(full_name)').order('created_at', { ascending: false }).limit(20)
            ]);

            if (gwRes.error) throw gwRes.error;
            if (txRes.error) throw txRes.error;

            setGateways(gwRes.data || []);
            setTransactions(txRes.data || []);
        } catch (error: any) {
            toast.error('Failed to fetch admin data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('payment_gateways')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Gateway ${id} ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdateConfig = async (id: string, appId: string, secretKey: string, env: string) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('payment_gateways')
                .update({
                    app_id: appId,
                    secret_key: secretKey,
                    environment: env
                })
                .eq('id', id);

            if (error) throw error;
            toast.success('Configuration updated successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20 animate-pulse text-[hsl(var(--text-secondary))]">
                <Settings className="animate-spin mr-3" />
                Loading Admin Controls...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[hsl(var(--text-active))]">Payment Infrastructure</h1>
                    <p className="text-[hsl(var(--text-secondary))]">Manage gateway configurations, API keys, and transaction logs.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] text-xs font-bold flex items-center gap-2 hover:bg-[hsl(var(--bg-primary))]/10 transition-all">
                        <Activity size={14} />
                        Refresh Logs
                    </button>
                    <GradientButton className="rounded-xl px-6 py-2.5 text-xs">
                        Export Transactions
                    </GradientButton>
                </div>
            </div>

            {/* Gateway Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {gateways.map((gw) => (
                    <GatewayCard
                        key={gw.id}
                        gateway={gw}
                        onToggle={() => handleToggleActive(gw.id, gw.is_active)}
                        onSave={(appId: string, secretKey: string, env: string) => handleUpdateConfig(gw.id, appId, secretKey, env)}
                        isSaving={isSaving}
                    />
                ))}
            </div>

            {/* Transaction Logs */}
            <GlassCard className="border-[hsl(var(--glass-border))] overflow-hidden">
                <div className="p-6 border-b border-[hsl(var(--glass-border))] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CreditCard className="text-[hsl(var(--accent-primary))]" size={20} />
                        <h3 className="font-bold">Recent Transactions</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]" size={14} />
                            <input type="text" placeholder="Search Order ID..." className="bg-[hsl(var(--bg-primary))]/10 border border-[hsl(var(--glass-border))] rounded-lg pl-9 pr-4 py-1.5 text-xs w-64 focus:outline-none focus:border-[hsl(var(--accent-primary))]/50" />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[hsl(var(--bg-primary))]/10 text-[hsl(var(--text-secondary))] font-bold text-xs uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Gateway</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--glass-border))]">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-[hsl(var(--text-secondary))]">
                                        {new Date(tx.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[hsl(var(--text-active))]">
                                        {tx.user_profiles?.full_name || 'System User'}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs opacity-60">
                                        {tx.order_id}
                                    </td>
                                    <td className="px-6 py-4 font-black">
                                        {tx.currency} {tx.amount}
                                    </td>
                                    <td className="px-6 py-4 uppercase text-[10px] font-black">
                                        {tx.gateway_id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${tx.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                            tx.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {transactions.length === 0 && (
                        <div className="p-10 text-center text-[hsl(var(--text-secondary))]">
                            No transactions found.
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}

function GatewayCard({ gateway, onToggle, onSave, isSaving }: any) {
    const [appId, setAppId] = useState(gateway.app_id || '');
    const [secretKey, setSecretKey] = useState(gateway.secret_key || '');
    const [env, setEnv] = useState(gateway.environment || 'sandbox');

    return (
        <GlassCard className={`p-8 border-[hsl(var(--glass-border))] flex flex-col ${gateway.is_active ? 'border-[hsl(var(--accent-primary))]/20 bg-[hsl(var(--accent-primary))]/[0.02]' : 'opacity-80 grayscale-[0.5]'}`}>
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] ${gateway.is_active ? 'text-[hsl(var(--accent-primary))]' : 'text-[hsl(var(--text-secondary))]'}`}>
                        <Globe size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{gateway.name}</h2>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${gateway.is_active ? 'text-[hsl(var(--accent-primary))]' : 'text-[hsl(var(--text-secondary))]'}`}>
                            {gateway.is_active ? 'Active Gateway' : 'Inactive'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className={`p-2 rounded-lg transition-all ${gateway.is_active ? 'bg-green-500/10 text-green-400' : 'bg-[hsl(var(--bg-primary))]/10 text-[hsl(var(--text-secondary))]'}`}
                >
                    <Power size={20} />
                </button>
            </div>

            <div className="space-y-6 flex-1">
                {/* Environment Selector */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-secondary))]">Environment</label>
                    <div className="flex gap-2">
                        {['sandbox', 'production'].map((e) => (
                            <button
                                key={e}
                                onClick={() => setEnv(e)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${env === e ? 'bg-[hsl(var(--accent-primary))] text-white' : 'bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] text-[hsl(var(--text-secondary))]'}`}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                </div>

                {/* API Credentials */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--text-secondary))]">API Credentials</label>

                    {gateway.id === 'cashfree' ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-xs text-[hsl(var(--text-secondary))]">App ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-[hsl(var(--bg-primary))]/10 border border-[hsl(var(--glass-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[hsl(var(--accent-primary))]/50"
                                    value={appId}
                                    onChange={(e) => setAppId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-[hsl(var(--text-secondary))]">Secret Key</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))] opacity-30" size={16} />
                                    <input
                                        type="password"
                                        className="w-full bg-[hsl(var(--bg-primary))]/10 border border-[hsl(var(--glass-border))] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[hsl(var(--accent-primary))]/50"
                                        value={secretKey}
                                        onChange={(e) => setSecretKey(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1.5">
                            <label className="text-xs text-[hsl(var(--text-secondary))]">Dodo API Key</label>
                            <input
                                type="password"
                                className="w-full bg-[hsl(var(--bg-primary))]/10 border border-[hsl(var(--glass-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[hsl(var(--accent-primary))]/50"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[hsl(var(--glass-border))]">
                <GradientButton
                    onClick={() => onSave(appId, secretKey, env)}
                    disabled={isSaving}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </GradientButton>
            </div>
        </GlassCard>
    );
}
