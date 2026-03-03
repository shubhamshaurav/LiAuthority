'use client';

import React, { useState, useEffect } from 'react';
import {
    Lock, Eye, EyeOff, Key,
    AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Small UI primitives ───────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl p-6 bg-[hsl(var(--bg-secondary))]/50 border border-[rgba(var(--glass-border))] ${className}`}>
            {children}
        </div>
    );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <div className="font-black text-[hsl(var(--text-primary))] text-base">{title}</div>
                {subtitle && <div className="text-xs mt-0.5 text-[hsl(var(--text-secondary))]">{subtitle}</div>}
            </div>
        </div>
    );
}

function PasswordInput({ id, label, value, onChange, placeholder = '' }: {
    id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-[hsl(var(--text-primary))] bg-[hsl(var(--bg-primary))] border border-[rgba(var(--glass-border))] outline-none transition-all focus:border-[hsl(var(--accent-primary))]/50"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
        </div>
    );
}

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];

// ─────────────────────────────────────────────────────────────────────────────
export default function SecurityPage() {
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [changingPw, setChangingPw] = useState(false);

    const strength = getStrength(newPw);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPw) { toast.error('Enter a new password'); return; }
        if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
        if (strength < 2) { toast.error('Password is too weak'); return; }

        setChangingPw(true);
        const { error } = await supabase.auth.updateUser({ password: newPw });
        setChangingPw(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Password updated successfully!');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        }
    };

    return (
        <div className="space-y-6 pb-10 max-w-3xl">
            {/* ── Change Password ───────────────────────────────────────── */}
            <Card>
                <SectionTitle icon={Lock} title="Change Password" subtitle="Use a strong, unique password" />

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <PasswordInput id="current" label="Current Password" value={currentPw} onChange={setCurrentPw} placeholder="Enter current password" />
                    <PasswordInput id="new" label="New Password" value={newPw} onChange={setNewPw} placeholder="Enter new password" />

                    {/* Strength meter */}
                    {newPw && (
                        <div className="space-y-1.5">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-1 flex-1 rounded-full transition-all"
                                        style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(128,128,128,0.2)' }} />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))]" style={{ color: STRENGTH_COLORS[strength] || undefined }}>
                                {STRENGTH_LABELS[strength] || 'Enter password'}
                            </p>
                        </div>
                    )}

                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-1.5">
                        {[
                            ['At least 8 characters', newPw.length >= 8],
                            ['One uppercase letter', /[A-Z]/.test(newPw)],
                            ['One number', /[0-9]/.test(newPw)],
                            ['One special character', /[^A-Za-z0-9]/.test(newPw)],
                        ].map(([label, met]) => (
                            <div key={label as string} className="flex items-center gap-1.5">
                                <CheckCircle2 size={11} style={{ color: met ? '#22c55e' : undefined }}
                                    className={met ? '' : 'text-[hsl(var(--text-secondary))] opacity-40'} />
                                <span className={`text-[10px] ${met ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-secondary))] opacity-50'}`}>
                                    {label as string}
                                </span>
                            </div>
                        ))}
                    </div>

                    <PasswordInput id="confirm" label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} placeholder="Repeat new password" />

                    {/* Match indicator */}
                    {confirmPw && (
                        <p className="text-[11px] font-bold flex items-center gap-1.5"
                            style={{ color: newPw === confirmPw ? '#22c55e' : '#ef4444' }}>
                            {newPw === confirmPw ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {newPw === confirmPw ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                    )}

                    <button type="submit" disabled={changingPw}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm text-white transition-all disabled:opacity-50 hover:scale-[1.02] mt-2"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                        {changingPw ? <Loader2 size={15} className="animate-spin" /> : <Key size={15} />}
                        {changingPw ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </Card>
        </div>
    );
}
