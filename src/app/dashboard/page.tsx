'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import {
    Link as LinkIcon,
    MessageSquare,
    Send,
    Image as ImageIcon,
    Smile,
    Video,
    Sparkles,
    Loader2,
    Eye,
    Edit3,
    CheckCircle2,
    Globe,
    ThumbsUp,
    MoreHorizontal,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [inputValue, setInputValue] = useState('');
    const [inputType, setInputType] = useState<'url' | 'idea'>('url');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleGenerate = async () => {
        if (!inputValue.trim()) {
            toast.error('Please enter a URL or an idea');
            return;
        }

        setIsGenerating(true);
        // Simulate webhook call
        setTimeout(() => {
            setGeneratedPost(`🚀 Transform your professional brand with LiAuthority!

Building authority on LinkedIn shouldn't be a chore. It should be a strategic extension of your expertise.

With our new AI agents, we're not just helping you "post more"—we're helping you build a legacy.

Key benefits:
→ Tone-perfect generation
→ Dual-layer safety compliance
→ Automated resonance mapping

Stop shouting into the void. Start building authority.

#LiAuthority #LinkedInGrowth #B2BMarketing`);
            setIsGenerating(false);
            setIsEditing(false);
            toast.success('Post generated successfully!');
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Greeting & Quick Stats */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-[hsl(var(--text-active))]">Create Content</h1>
                    <p className="text-[hsl(var(--text-secondary))]">Transform any link or idea into a professional LinkedIn post.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] rounded-2xl px-6 py-3 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--text-secondary))] opacity-60 font-bold mb-1">Posts Left</p>
                        <p className="text-xl font-black text-[hsl(var(--accent-primary))]">24<span className="text-[hsl(var(--text-secondary))] opacity-40">/25</span></p>
                    </div>
                </div>
            </div>

            {/* Post Generator Input */}
            <GlassCard className="p-1 border-[hsl(var(--glass-border))] overflow-hidden">
                <div className="flex bg-[hsl(var(--bg-primary))]/5 p-1 rounded-t-xl border-b border-[hsl(var(--glass-border))]">
                    <button
                        onClick={() => setInputType('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${inputType === 'url' ? 'bg-[hsl(var(--bg-primary))]/10 text-[hsl(var(--text-active))] shadow-lg' : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-active))]'}`}
                    >
                        <LinkIcon size={18} />
                        URL (Blog/YT/LI)
                    </button>
                    <button
                        onClick={() => setInputType('idea')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${inputType === 'idea' ? 'bg-[hsl(var(--bg-primary))]/10 text-[hsl(var(--text-active))] shadow-lg' : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-active))]'}`}
                    >
                        <Sparkles size={18} />
                        Fresh Idea
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="relative">
                        <textarea
                            className="w-full bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] rounded-2xl p-6 text-base focus:outline-none focus:border-[hsl(var(--accent-primary))]/50 transition-all min-h-[160px] resize-none placeholder:text-[hsl(var(--text-secondary))] opacity-40 text-[hsl(var(--text-primary))]"
                            placeholder={inputType === 'url' ? "Paste a link to an article, YouTube video, or LinkedIn post..." : "Describe what you want to talk about today..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <button className="p-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-active))] transition-colors"><ImageIcon size={20} /></button>
                            <button className="p-2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-active))] transition-colors"><Smile size={20} /></button>
                            <GradientButton
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                size="sm"
                                className="h-10 px-6"
                            >
                                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                <span className="ml-2">Generate</span>
                            </GradientButton>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Results Area */}
            {generatedPost && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
                    {/* LinkedIn Preview Style */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest flex items-center gap-2">
                                <Eye size={16} />
                                Preview
                            </h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-xs font-bold text-[hsl(var(--accent-primary))] hover:text-[hsl(var(--accent-primary))] opacity-80 hover:opacity-100 flex items-center gap-1.5 transition-all"
                            >
                                <Edit3 size={14} />
                                {isEditing ? 'Finish Editing' : 'Edit Post'}
                            </button>
                        </div>

                        <GlassCard className="p-0 border-[hsl(var(--glass-border))] overflow-hidden bg-[hsl(var(--bg-secondary))]/50">
                            {/* LinkedIn Header Mock */}
                            <div className="p-4 flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))]" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                        <p className="font-bold text-[hsl(var(--text-active))]">Your Name</p>
                                        <p className="text-[hsl(var(--text-secondary))] text-sm">• 1st</p>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--text-secondary))]">Professional Title | Building Authority</p>
                                    <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-secondary))] mt-0.5 opacity-60">
                                        <span>Just now</span>
                                        <span>•</span>
                                        <Globe size={10} />
                                    </div>
                                </div>
                                <MoreHorizontal className="text-[hsl(var(--text-secondary))]" size={20} />
                            </div>

                            {/* Content Area */}
                            <div className="px-4 pb-4">
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-[hsl(var(--bg-primary))]/20 border border-[hsl(var(--accent-primary))]/30 rounded-lg p-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none min-h-[300px] resize-none font-sans leading-relaxed"
                                        value={generatedPost}
                                        onChange={(e) => setGeneratedPost(e.target.value)}
                                    />
                                ) : (
                                    <p className="text-sm text-[hsl(var(--text-primary))] whitespace-pre-wrap leading-relaxed">
                                        {generatedPost}
                                    </p>
                                )}
                            </div>

                            {/* LinkedIn Footer Mock */}
                            <div className="border-t border-[hsl(var(--glass-border))] p-2 flex items-center justify-between text-[hsl(var(--text-secondary))]">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-[hsl(var(--bg-primary))]/5 rounded-lg transition-all text-sm font-bold">
                                    <ThumbsUp size={18} /> Like
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-[hsl(var(--bg-primary))]/5 rounded-lg transition-all text-sm font-bold">
                                    <MessageSquare size={18} /> Comment
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-[hsl(var(--bg-primary))]/5 rounded-lg transition-all text-sm font-bold">
                                    <Send size={18} /> Send
                                </button>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Actions Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-sm font-bold text-[hsl(var(--text-secondary))] uppercase tracking-widest flex items-center gap-2 px-2">
                            <Sparkles size={16} />
                            Optimizations
                        </h3>

                        <div className="space-y-3">
                            <button className="w-full p-4 bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] rounded-2xl text-left hover:border-[hsl(var(--accent-primary))]/30 transition-all group">
                                <p className="text-xs font-bold text-[hsl(var(--accent-primary))] mb-1">CTA Optimizer</p>
                                <p className="text-sm font-medium text-[hsl(var(--text-secondary))] opacity-80">Add a high-converting call to action</p>
                            </button>
                            <button className="w-full p-4 bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] rounded-2xl text-left hover:border-[hsl(var(--accent-secondary))]/30 transition-all group">
                                <p className="text-xs font-bold text-[hsl(var(--accent-secondary))] mb-1">Tone Refinement</p>
                                <p className="text-sm font-medium text-[hsl(var(--text-secondary))] opacity-80">Make it sound more authoritative</p>
                            </button>
                            <button className="w-full p-4 bg-[hsl(var(--bg-primary))]/5 border border-[hsl(var(--glass-border))] rounded-2xl text-left hover:border-blue-500/30 transition-all group">
                                <p className="text-xs font-bold text-blue-400 mb-1">Repurpose</p>
                                <p className="text-sm font-medium text-[hsl(var(--text-secondary))] opacity-80">Turn this into DM starters or comments</p>
                            </button>
                        </div>

                        <div className="pt-6 border-t border-[hsl(var(--glass-border))] flex flex-col gap-3">
                            <GradientButton className="w-full py-4 rounded-2xl">
                                <Calendar className="mr-2" size={20} />
                                Schedule Post
                            </GradientButton>
                            <button className="w-full py-4 border border-[hsl(var(--glass-border))] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[hsl(var(--bg-primary))]/5 transition-all text-[hsl(var(--text-primary))]">
                                <CheckCircle2 size={20} />
                                Approve for Drafts
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
