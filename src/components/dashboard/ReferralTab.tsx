'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import {
    User,
    DollarSign,
    Users,
    Copy,
    Check,
    Calendar,
    Building2,
    CreditCard,
    Hash,
    Smartphone,
    Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { clsx } from 'clsx';

export function ReferralTab() {
    const [loading, setLoading] = useState(true);
    const [savingPayout, setSavingPayout] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [copied, setCopied] = useState(false);

    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalReferrals: 0
    });

    const [payoutDetails, setPayoutDetails] = useState({
        account_holder: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: ''
    });

    const [referredUsers, setReferredUsers] = useState<any[]>([]);
    const [earningsHistory, setEarningsHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get referral code and earnings from profile
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('referral_code, total_earnings')
                .eq('id', user.id)
                .single();

            if (profile?.referral_code) {
                setReferralCode(profile.referral_code);
            } else {
                // Generate code if missing (simplified version of the SQL function)
                const { data: newCode, error: rpcError } = await supabase.rpc('get_or_create_referral_code');
                if (!rpcError) setReferralCode(newCode);
            }

            setStats(prev => ({ ...prev, totalEarnings: profile?.total_earnings || 0 }));

            // 2. Get payout settings
            const { data: payout } = await supabase
                .from('payout_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (payout) {
                setPayoutDetails({
                    account_holder: payout.account_holder || '',
                    bank_name: payout.bank_name || '',
                    account_number: payout.account_number || '',
                    ifsc_code: payout.ifsc_code || '',
                    upi_id: payout.upi_id || ''
                });
            }

            // 3. Get referrals count and list
            const { data: referrals, count } = await supabase
                .from('referrals')
                .select(`
                    id,
                    status,
                    created_at,
                    referred:user_profiles!referred_id(full_name)
                `, { count: 'exact' })
                .eq('referrer_id', user.id);

            setStats(prev => ({ ...prev, totalReferrals: count || 0 }));
            setReferredUsers(referrals || []);

            // 4. Get earnings history
            const { data: commissions } = await supabase
                .from('commissions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setEarningsHistory(commissions || []);

        } catch (err) {
            console.error('Error fetching referral data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        const link = `${window.location.origin}/login?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUpdatePayout = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPayout(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('payout_settings')
                .upsert({
                    user_id: user.id,
                    ...payoutDetails,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success('Payout details updated successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update payout details');
        } finally {
            setSavingPayout(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-[hsl(var(--text-secondary))] animate-pulse text-center">Loading referral program...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 border-[rgba(var(--glass-border))] bg-gradient-to-br from-[hsl(var(--accent-primary))]/5 to-transparent flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--accent-primary))]/80 mb-2">Total Earnings</p>
                        <h3 className="text-3xl font-black text-[hsl(var(--text-primary))]">${stats.totalEarnings.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent-primary))]/10 flex items-center justify-center text-[hsl(var(--accent-primary))]">
                        <DollarSign size={24} />
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border-[rgba(var(--glass-border))] bg-gradient-to-br from-[hsl(var(--accent-secondary))]/5 to-transparent flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--accent-secondary))]/80 mb-2">Total Referrals</p>
                        <h3 className="text-3xl font-black text-[hsl(var(--text-primary))]">{stats.totalReferrals}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent-secondary))]/10 flex items-center justify-center text-[hsl(var(--accent-secondary))]">
                        <Users size={24} />
                    </div>
                </GlassCard>
            </div>

            {/* Referral Link */}
            <GlassCard className="p-8 border-[rgba(var(--glass-border))] bg-[hsl(var(--bg-secondary))]/50">
                <h2 className="text-xl font-bold mb-2">Referral Program</h2>
                <p className="text-[hsl(var(--text-secondary))] text-sm mb-6 leading-relaxed">
                    Share your link and earn <span className="text-[hsl(var(--accent-primary))] font-bold">20% recurring commission</span> for up to 2 years for every customer you refer.
                    <br /><span className="text-[10px] text-[hsl(var(--text-secondary))] italic">Includes a 30-day cookie window for reliable attribution.</span>
                </p>

                <div className="flex items-center gap-3 bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] rounded-2xl p-2 pl-6 overflow-hidden max-w-2xl">
                    <code className="text-[hsl(var(--accent-primary))] text-sm font-mono flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/login?ref={referralCode}
                    </code>
                    <button
                        onClick={handleCopy}
                        className="bg-[hsl(var(--accent-primary))]/10 hover:bg-[hsl(var(--accent-primary))]/20 p-3 rounded-xl transition-all text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent-primary))]"
                    >
                        {copied ? <Check size={18} className="text-[hsl(var(--accent-primary))]" /> : <Copy size={18} />}
                    </button>
                </div>
            </GlassCard>

            {/* Payout Details */}
            <GlassCard className="p-8 border-[rgba(var(--glass-border))] bg-[hsl(var(--bg-secondary))]/50">
                <h2 className="text-xl font-bold mb-6">Payout Details</h2>

                <div className="bg-[hsl(var(--accent-primary))]/5 border border-[hsl(var(--accent-primary))]/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] mt-0.5">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[hsl(var(--text-primary))] mb-1">Payout Window: 5th - 10th of every month</p>
                        <p className="text-xs text-[hsl(var(--text-secondary))]">Make sure your details are correct to avoid payment delays.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePayout} className="space-y-6 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Account Holder Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={payoutDetails.account_holder}
                                    onChange={(e) => setPayoutDetails({ ...payoutDetails, account_holder: e.target.value })}
                                    className="w-full bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] rounded-2xl py-3 pl-12 pr-4 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent-primary))]/50 transition-colors"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Bank Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]">
                                    <Building2 size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={payoutDetails.bank_name}
                                    onChange={(e) => setPayoutDetails({ ...payoutDetails, bank_name: e.target.value })}
                                    className="w-full bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] rounded-2xl py-3 pl-12 pr-4 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent-primary))]/50 transition-colors"
                                    placeholder="HDFC Bank"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Account Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]">
                                    <CreditCard size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={payoutDetails.account_number}
                                    onChange={(e) => setPayoutDetails({ ...payoutDetails, account_number: e.target.value })}
                                    className="w-full bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] rounded-2xl py-3 pl-12 pr-4 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent-primary))]/50 transition-colors"
                                    placeholder="XXXX XXXX XXXX XXXX"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">IFSC Code</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]">
                                    <Hash size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={payoutDetails.ifsc_code}
                                    onChange={(e) => setPayoutDetails({ ...payoutDetails, ifsc_code: e.target.value })}
                                    className="w-full bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] rounded-2xl py-3 pl-12 pr-4 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent-primary))]/50 transition-colors"
                                    placeholder="HDFC0001234"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 max-w-2xl">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">UPI ID (Optional)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]">
                                <Smartphone size={16} />
                            </div>
                            <input
                                type="text"
                                value={payoutDetails.upi_id}
                                onChange={(e) => setPayoutDetails({ ...payoutDetails, upi_id: e.target.value })}
                                className="w-full bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] rounded-2xl py-3 pl-12 pr-4 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--accent-primary))]/50 transition-colors"
                                placeholder="joe@okaxis"
                            />
                        </div>
                    </div>

                    <GradientButton
                        type="submit"
                        disabled={savingPayout}
                        className="px-10 py-3 rounded-2xl"
                    >
                        {savingPayout ? 'Updating...' : 'Update Payout Details'}
                    </GradientButton>
                </form>
            </GlassCard>

            {/* Referred Users Table */}
            <GlassCard className="p-8 border-[rgba(var(--glass-border))] bg-[hsl(var(--bg-secondary))]/50">
                <h2 className="text-xl font-bold mb-6">Referred Users</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[rgba(var(--glass-border))]">
                                <th className="pb-4 font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest text-[10px]">User Name</th>
                                <th className="pb-4 font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest text-[10px]">Status</th>
                                <th className="pb-4 font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest text-[10px]">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(var(--glass-border))]">
                            {referredUsers.length > 0 ? referredUsers.map((ref) => (
                                <tr key={ref.id} className="group hover:bg-[hsl(var(--bg-primary))]/30">
                                    <td className="py-4 font-bold text-[hsl(var(--text-primary))]">{ref.referred?.full_name || 'Someone New'}</td>
                                    <td className="py-4">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            ref.status === 'active' ? "bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))]" : "bg-yellow-500/10 text-yellow-500"
                                        )}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-[hsl(var(--text-secondary))] whitespace-nowrap">
                                        {new Date(ref.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-[hsl(var(--text-secondary))] bg-[hsl(var(--accent-primary))]/5 rounded-xl">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search size={32} className="opacity-40" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No referrals found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Earnings History */}
            <GlassCard className="p-8 border-[rgba(var(--glass-border))] bg-[hsl(var(--bg-secondary))]/50">
                <h2 className="text-xl font-bold mb-6">Earnings History</h2>
                <div className="space-y-4">
                    {earningsHistory.length > 0 ? earningsHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] flex items-center justify-center">
                                    <DollarSign size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[hsl(var(--text-active))]">{item.description || 'Monthly Commission'}</p>
                                    <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-[hsl(var(--accent-primary))]">+${item.amount.toFixed(2)}</p>
                                <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase tracking-widest font-bold">{item.status}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center text-[hsl(var(--text-secondary))] bg-[hsl(var(--accent-primary))]/5 rounded-xl">
                            <p className="font-bold uppercase tracking-widest text-xs">No earnings yet. Your commissions will appear here.</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
