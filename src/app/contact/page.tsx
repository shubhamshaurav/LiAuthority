'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail, MessageSquare, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setIsSuccess(true);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#060010] text-white overflow-hidden selection:bg-purple-500/30 font-sans">
            {/* ── Animated background orbs ──────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)' }} />
            </div>

            <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 backdrop-blur-2xl bg-black/20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                            style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                            <ArrowLeft size={18} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">Back to Home</span>
                    </Link>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Left Side: Copy */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-black uppercase tracking-widest">
                            <MessageSquare size={12} /> Contact Our Team
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                            Let's talk about <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                your authority.
                            </span>
                        </h1>
                        <p className="text-lg text-white/50 max-w-sm leading-relaxed">
                            Have questions about our AI agents or custom growth plans? We're here to help you scale your LinkedIn presence.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:border-purple-500/50">
                                <Mail size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-white/30 uppercase tracking-widest">Email Us</p>
                                <p className="text-white font-bold">support@liauthority.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:border-purple-500/50">
                                <Shield size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-white/30 uppercase tracking-widest">Safe & Secure</p>
                                <p className="text-white font-bold">24/7 Monitoring & Support</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="relative">
                    {/* Shadow decoration */}
                    <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-2xl -z-10" />

                    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-3xl p-8 md:p-10 shadow-2xl">
                        {isSuccess ? (
                            <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={40} className="text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black">Message Sent!</h3>
                                    <p className="text-white/50">We'll get back to you within 24 hours.</p>
                                </div>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Subject</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="How can we help?"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Tell us more about your LinkedIn goals..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-white/20 resize-none"
                                    />
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-[1px] group relative"
                                >
                                    <div className="w-full h-full rounded-[15px] bg-[#060010] flex items-center justify-center gap-2 group-hover:bg-transparent transition-colors duration-300">
                                        <span className="font-black text-white group-hover:scale-105 transition-transform">
                                            {isSubmitting ? 'Sending Message...' : 'Send Message'}
                                        </span>
                                        {!isSubmitting && <Send size={16} className="text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    </div>
                                </button>

                                <p className="text-[10px] text-center text-white/30 font-medium">
                                    By clicking send, you agree to our Terms of Service. <br />
                                    We promise to never spam your inbox.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
