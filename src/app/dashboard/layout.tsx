'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard,
    PenSquare,
    Calendar,
    Settings,
    User,
    LogOut,
    ExternalLink,
    ChevronRight,
    Search,
    Bell,
    Layers,
    MessageSquare,
    Users,
    Key,
    UserCircle,
    Mic,
    CreditCard,
    Zap,
    Lightbulb,
    Shield
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { clsx } from 'clsx';
import { toast } from 'sonner';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Create Post', icon: PenSquare, path: '/dashboard/create' },
    { name: 'All Posts', icon: Layers, path: '/dashboard/posts' },
    { name: 'Content Calendar', icon: Calendar, path: '/dashboard/calendar' },
    { name: 'Subscription', icon: CreditCard, path: '/dashboard/settings/subscription' },
    { name: 'Admin Payments', icon: Shield, path: '/dashboard/admin/payments', adminOnly: true },
];

const SETTING_ITEMS = [
    { name: 'Voice & Persona', icon: Mic, path: '/dashboard/settings/voice' },
    { name: 'Subscription', icon: CreditCard, path: '/dashboard/settings/subscription' },
    { name: 'Automation', icon: Zap, path: '/dashboard/settings/automation' },
    { name: 'Referral', icon: Users, path: '/dashboard/settings/referral' },
    { name: 'Security', icon: Key, path: '/dashboard/settings/security' },
    { name: 'Profile', icon: UserCircle, path: '/dashboard/settings/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
                setIsAdmin(user.app_metadata?.is_admin === true);
            }
        };
        getUser();
    }, [router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        toast.success('Signed out successfully');
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] flex transition-colors duration-300">
            {/* Sidebar */}
            <aside
                onMouseEnter={() => setIsSidebarExpanded(true)}
                onMouseLeave={() => setIsSidebarExpanded(false)}
                className={clsx(
                    "fixed left-0 top-0 h-full z-50 bg-[hsl(var(--bg-secondary))] border-r border-white/5 transition-all duration-300 ease-in-out flex flex-col pt-4 overflow-hidden shadow-2xl shadow-black",
                    isSidebarExpanded ? "w-64" : "w-20"
                )}
            >
                {/* Logo Area */}
                <div className="px-4 mb-8 flex items-center h-12">
                    <div className="w-12 h-12 min-w-[48px] rounded-xl bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center p-2 shadow-lg shadow-[hsl(var(--accent-primary))]/20">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter brightness-0 invert" />
                    </div>
                    {isSidebarExpanded && (
                        <span className="ml-3 font-black text-xl tracking-tight animate-fade-in whitespace-nowrap">LiAuthority</span>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
                    {MENU_ITEMS.map((item) => {
                        if (item.adminOnly && !isAdmin) return null;
                        const isActive = pathname === item.path || (item.name === 'Dashboard' && pathname === '/dashboard');
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={clsx(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                                    isActive
                                        ? "bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] border border-[hsl(var(--accent-primary))]/20"
                                        : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-primary))]/10 hover:text-[hsl(var(--text-active))] border border-transparent"
                                )}
                            >
                                <item.icon size={22} className={clsx("transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                                {isSidebarExpanded && <span className="font-bold text-sm animate-fade-in whitespace-nowrap">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile Area */}
                <div className="p-3 mt-auto border-t border-[hsl(var(--accent-primary))]/10 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-primary))]/10 hover:text-[hsl(var(--text-active))] transition-all group">
                        <Bell size={20} />
                        {isSidebarExpanded && <span className="font-bold text-sm animate-fade-in whitespace-nowrap">Notifications</span>}
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-primary))]/10 hover:text-[hsl(var(--text-active))] transition-all group"
                    >
                        <Lightbulb size={20} className={clsx(theme === 'light' ? "text-yellow-500 fill-yellow-500" : "text-gray-400")} />
                        {isSidebarExpanded && <span className="font-bold text-sm animate-fade-in whitespace-nowrap">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    <Link
                        href="/dashboard/settings"
                        className={clsx(
                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                            pathname.startsWith('/dashboard/settings')
                                ? "bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] border border-[hsl(var(--accent-primary))]/20"
                                : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--accent-primary))]/10 hover:text-[hsl(var(--text-active))] border border-transparent"
                        )}
                    >
                        <Settings size={20} className={clsx("transition-transform duration-500", pathname.startsWith('/dashboard/settings') ? "rotate-90" : "group-hover:rotate-90")} />
                        {isSidebarExpanded && <span className="font-bold text-sm animate-fade-in whitespace-nowrap">Settings</span>}
                    </Link>

                    <div className="pt-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-[hsl(var(--accent-primary))]/10 transition-all group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-[10px] font-black text-white">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            {isSidebarExpanded && (
                                <div className="flex flex-col items-start overflow-hidden animate-fade-in">
                                    <span className="font-bold text-sm text-[hsl(var(--text-active))] truncate w-32 text-left">Account</span>
                                    <span className="text-[10px] text-[hsl(var(--text-secondary))] truncate w-32 text-left">Sign Out</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={clsx(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                isSidebarExpanded ? "ml-64" : "ml-20"
            )}>
                {/* Topbar */}
                <header className="h-16 flex items-center justify-end px-8 sticky top-0 bg-transparent z-40">
                </header>

                {/* Page Content */}
                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                strategy="afterInteractive"
            />
        </div>
    );
}
