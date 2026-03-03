'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import {
    User,
    CreditCard,
    Lock,
    Users,
    Zap,
    Mic,
    Settings as SettingsIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useSearchParams, useRouter } from 'next/navigation';
import { ReferralTab } from '@/components/dashboard/ReferralTab';
import { SubscriptionTab } from '@/components/dashboard/SubscriptionTab';
import SecurityPage from '@/app/dashboard/settings/security/page';

const SETTING_TABS = [
    { id: 'profile', name: 'Profile Management', icon: User },
    { id: 'security', name: 'Security & Password', icon: Lock },
    { id: 'voice', name: 'Voice Personalization', icon: Mic },
    { id: 'subscription', name: 'Subscription & Billing', icon: CreditCard },
    { id: 'automation', name: 'Automation Settings', icon: Zap },
    { id: 'referrals', name: 'Referral Program', icon: Users },
];

function SettingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Check for ?tab=xyz first, then check for standalone ?xyz
    const getActiveTabFromUrl = () => {
        const tabParam = searchParams.get('tab');
        if (tabParam && SETTING_TABS.some(t => t.id === tabParam)) return tabParam;

        for (const tab of SETTING_TABS) {
            if (searchParams.has(tab.id)) return tab.id;
        }
        return 'profile';
    };

    const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        email: '',
        full_name: '',
    });

    useEffect(() => {
        const currentTab = getActiveTabFromUrl();
        if (currentTab !== activeTab) {
            setActiveTab(currentTab);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                setUserData({
                    email: user.email || '',
                    full_name: profile?.full_name || '',
                });
            }
        };
        fetchUserData();
    }, []);

    const handleTabChange = (id: string) => {
        setActiveTab(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    full_name: userData.full_name,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            toast.success('Profile updated successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <User className="text-[hsl(var(--accent-primary))]" size={24} />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--text-active))]">Settings</h1>
                    <p className="text-[hsl(var(--text-secondary))] text-xs">Manage your account preferences and defaults.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Sub-nav */}
                <div className="w-full md:w-72 space-y-1">
                    {SETTING_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold/90",
                                activeTab === tab.id
                                    ? "bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] border border-[hsl(var(--accent-primary))]/20"
                                    : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-primary))]/10 hover:text-[hsl(var(--text-active))] border border-transparent"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Right Content Area */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="rounded-2xl p-6 max-w-xl"
                            style={{ background: 'hsl(var(--bg-secondary,222 47% 8%) / 0.5)', border: '1px solid rgba(var(--glass-border, 255 255 255 / 0.08))' }}>
                            <h2 className="text-base font-black text-[hsl(var(--text-primary))] mb-6">Profile Information</h2>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Email Address</label>
                                    <div className="w-full px-4 py-2.5 rounded-xl text-sm text-[hsl(var(--text-secondary))] cursor-not-allowed bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))]">
                                        {userData.email}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        value={userData.full_name}
                                        onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm text-[hsl(var(--text-primary))] bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] outline-none transition-all focus:border-[hsl(var(--accent-primary))]/50"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm text-white transition-all disabled:opacity-50 hover:scale-[1.02]"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'referrals' && <ReferralTab />}

                    {activeTab === 'subscription' && <SubscriptionTab />}

                    {activeTab === 'security' && <SecurityPage />}

                    {!['profile', 'referrals', 'subscription', 'security'].includes(activeTab) && (
                        <GlassCard className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-[rgba(var(--glass-border))]">
                            <div className="w-16 h-16 rounded-full bg-[hsl(var(--bg-primary))]/50 flex items-center justify-center text-[hsl(var(--text-secondary))]">
                                <SettingsIcon size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold uppercase tracking-widest text-[hsl(var(--text-secondary))] opacity-60">Section Coming Soon</h3>
                                <p className="text-sm text-[hsl(var(--text-secondary))] opacity-40 max-w-xs">We are currently building this section to give you more control over your workspace.</p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-transparent text-[hsl(var(--text-primary))] animate-fade-in -m-4 md:-m-8">
            <Suspense fallback={<div className="p-10 text-[hsl(var(--text-secondary))]">Loading settings...</div>}>
                <SettingsContent />
            </Suspense>
        </div>
    );
}
