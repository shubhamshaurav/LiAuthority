'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { validatePassword } from '@/lib/passwordUtils';
import { toast, Toaster } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [view, setView] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            setError(err.message || 'An error occurred during Google Sign In.');
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (view === 'signup') {
                const validation = validatePassword(password);
                if (!validation.isValid) {
                    setError(`Password is too weak: ${validation.message}`);
                    setLoading(false);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
                    },
                });
                if (error) throw error;

                setSuccess('Account created! Please check your email for the confirmation link.');
                setEmail('');
                setPassword('');
                setName('');
            } else if (view === 'forgot_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                setSuccess('Password reset link sent to your email!');
                setEmail('');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            setError(err.message || 'An unexpected error occurred during authentication.');
            toast.error(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <Toaster position="top-center" richColors />
            <div className="fixed top-8 left-8">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Link>
            </div>

            <GlassCard className="w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[40px]" />

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-4 text-purple-400">
                        <Lock size={20} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                        {view === 'signup' ? 'Create LiAuthority Account' : (view === 'forgot_password' ? 'Reset Password' : 'Welcome to LiAuthority')}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {view === 'signup' ? 'Start building your professional authority' : (view === 'forgot_password' ? 'Enter your email to receive a reset link' : 'Sign in to manage your authority agents')}
                    </p>
                </div>

                {view !== 'forgot_password' && !success && (
                    <div className="flex p-1 bg-white/5 rounded-xl mb-8 relative z-10 border border-white/10">
                        <button
                            type="button"
                            onClick={() => { setView('signin'); setError(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${view === 'signin' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setView('signup'); setError(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${view === 'signup' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                    {success ? (
                        <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex flex-col items-center text-center gap-4">
                            <Mail className="text-green-500" size={32} />
                            <p>{success}</p>
                            <button onClick={() => { setSuccess(null); setView('signin'); }} className="text-green-500 font-bold">Back to Sign In</button>
                        </div>
                    ) : (
                        <>
                            {view === 'signup' && (
                                <Input type="text" placeholder="Your Name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                            )}
                            <Input type="email" placeholder="email@example.com" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            {view !== 'forgot_password' && (
                                <Input type="password" placeholder="••••••••" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            )}
                            {error && <div className="text-red-400 text-xs">{error}</div>}
                            {view === 'signin' && (
                                <div className="text-right">
                                    <button type="button" onClick={() => setView('forgot_password')} className="text-xs text-purple-400">Forgot Password?</button>
                                </div>
                            )}
                            <GradientButton type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : (view === 'signup' ? 'Create Account' : (view === 'forgot_password' ? 'Send Reset Link' : 'Sign In'))}
                            </GradientButton>

                            {view !== 'forgot_password' && (
                                <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold">
                                    Continue with Google
                                </button>
                            )}
                        </>
                    )}
                </form>
            </GlassCard>
        </div>
    );
}
