'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { GradientButton } from '@/components/ui/GradientButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { User, LogOut, Shield } from 'lucide-react';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        getUser();
    }, [router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-1 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            <img src="/logo.png" alt="LiAuthority Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">LiAuthority Dashboard</h1>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

                <GlassCard className="p-8 border-purple-500/20">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                            <User size={40} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Welcome back,</h2>
                            <p className="text-purple-400 font-medium">{user?.email}</p>
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                Authority Level: Strategist
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-6">
                        <h3 className="font-bold mb-2">Connected Accounts</h3>
                        <p className="text-gray-400 text-sm">You haven't connected any LinkedIn accounts yet.</p>
                        <GradientButton className="mt-4 w-full h-10 text-sm">Connect Profile</GradientButton>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <h3 className="font-bold mb-2">Active Agents</h3>
                        <p className="text-gray-400 text-sm">Your authority agents are currently dormant.</p>
                        <button className="mt-4 w-full h-10 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">
                            Deploy Agent
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
