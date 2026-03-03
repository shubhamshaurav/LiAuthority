'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import {
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Target,
    Linkedin,
    User,
    FileText,
    Mic,
    Loader2,
    Plus,
    X
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
    { id: 1, title: 'Your Goal', description: 'What are you working on?' },
    { id: 2, title: 'Experience', description: 'Your content journey' },
    { id: 3, title: 'Profile', description: 'Tell us about yourself' },
    { id: 4, title: 'Voice', description: 'Sample your style' }
];

const GOALS = [
    "Building my personal brand",
    "Working with clients",
    "Growing my own business or brand",
    "Building a product or startup",
    "Creating a digital product like a course, ebook, or community",
    "Just exploring ideas and figuring things out"
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const router = useRouter();

    // Form State
    const [goal, setGoal] = useState('');
    const [postsOnSocial, setPostsOnSocial] = useState<string | null>(null);
    const [profileMode, setProfileMode] = useState<'linkedin' | 'manual'>('linkedin');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [bio, setBio] = useState('');
    const [samplePosts, setSamplePosts] = useState<string[]>(['', '', '']);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUserData(user);
                // Fetch existing onboarding data if any
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile?.onboarded) {
                    router.push('/dashboard');
                } else if (profile) {
                    setGoal(profile.onboarding_data?.goal || '');
                    setPostsOnSocial(profile.onboarding_data?.postsOnSocial || null);
                    setLinkedinUrl(profile.linkedin_url || '');
                    setJobTitle(profile.job_title || '');
                    setBio(profile.bio || '');
                }
            }
        };
        checkUser();
    }, [router]);

    const handleNext = () => {
        if (currentStep === 1 && !goal) {
            toast.error('Please select a goal');
            return;
        }
        if (currentStep === 2 && !postsOnSocial) {
            toast.error('Please select an option');
            return;
        }
        if (currentStep === 3) {
            if (profileMode === 'linkedin') {
                if (!linkedinUrl) {
                    toast.error('Please provide your LinkedIn URL');
                    return;
                }
                const linkedinRegex = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
                if (!linkedinRegex.test(linkedinUrl)) {
                    toast.error('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
                    return;
                }
            }
            if (profileMode === 'manual' && (!jobTitle || !bio)) {
                toast.error('Please fill in your profile details');
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const updateSamplePost = (index: number, value: string) => {
        const newPosts = [...samplePosts];
        newPosts[index] = value;
        setSamplePosts(newPosts);
    };

    const addSamplePost = () => {
        setSamplePosts([...samplePosts, '']);
    };

    const removeSamplePost = (index: number) => {
        if (samplePosts.length <= 3) return;
        setSamplePosts(samplePosts.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const validPosts = samplePosts.filter(p => p.trim().length > 0);
        if (validPosts.length < 3) {
            toast.error('Please provide at least 3 sample posts to train your voice');
            return;
        }

        setLoading(true);
        try {
            const onboardingData = {
                goal,
                postsOnSocial,
                onboarding_completed_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: userData.id,
                    onboarded: true,
                    onboarding_step: 4,
                    onboarding_data: onboardingData,
                    linkedin_url: linkedinUrl,
                    job_title: jobTitle,
                    bio: bio
                });

            if (error) throw error;

            // --- Referral Attribution Logic ---
            const cookies = document.cookie.split('; ');
            const affiliateCookie = cookies.find(row => row.startsWith('la_affiliate='));
            const refCode = affiliateCookie ? affiliateCookie.split('=')[1] : null;

            if (refCode) {
                // Find the referrer
                const { data: referrer } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('referral_code', refCode)
                    .single();

                if (referrer && referrer.id !== userData.id) {
                    // Create the referral record
                    await supabase
                        .from('referrals')
                        .insert({
                            referrer_id: referrer.id,
                            referred_id: userData.id,
                            status: 'pending'
                        });

                    // Optional: Clear the cookie after successful attribution
                    document.cookie = "la_affiliate=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                }
            }
            // ----------------------------------

            // Save sample posts as a default voice profile
            const { error: voiceError } = await supabase
                .from('voice_profiles')
                .insert({
                    user_id: userData.id,
                    name: 'My Default Voice',
                    sample_posts: validPosts,
                    is_default: true
                });

            if (voiceError) throw voiceError;

            toast.success('Onboarding complete! Welcome to LiAuthority.');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Failed to save onboarding data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-2xl z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-2 shadow-lg shadow-purple-500/20 mx-auto mb-6">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter brightness-0 invert" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">Build Your Authority</h1>
                    <p className="text-gray-400">Complete these steps to personalize your AI agents.</p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step.id <= currentStep ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'}`}
                        />
                    ))}
                </div>

                <GlassCard className="p-8 md:p-10 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        Step {currentStep} of {STEPS.length}
                    </div>

                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Target className="text-purple-500" size={24} />
                                    What are you working on right now?
                                </h2>
                                <p className="text-sm text-gray-400">Different goals need different thinking spaces.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {GOALS.map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGoal(g)}
                                        className={`p-4 rounded-xl border text-left transition-all hover:bg-white/5 ${goal === g ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{g}</span>
                                            {goal === g && <CheckCircle2 size={18} className="text-purple-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Mic className="text-pink-500" size={24} />
                                    Do you currently post on social media?
                                </h2>
                                <p className="text-sm text-gray-400">This helps us understand your content maturity.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setPostsOnSocial('yes')}
                                    className={`p-6 rounded-2xl border text-left transition-all hover:bg-white/5 ${postsOnSocial === 'yes' ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${postsOnSocial === 'yes' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Yes, I create content</p>
                                            <p className="text-sm opacity-70">I post on YouTube, LinkedIn, Instagram, or Twitter.</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPostsOnSocial('no')}
                                    className={`p-6 rounded-2xl border text-left transition-all hover:bg-white/5 ${postsOnSocial === 'no' ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${postsOnSocial === 'no' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                            <ArrowRight size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Not yet, but I want to</p>
                                            <p className="text-sm opacity-70">I'm just getting started or exploring my journey.</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <User className="text-blue-500" size={24} />
                                    How should we get to know you?
                                </h2>
                                <p className="text-sm text-gray-400">Share your profile or tell us manually.</p>
                            </div>

                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                <button
                                    onClick={() => setProfileMode('linkedin')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${profileMode === 'linkedin' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400'}`}
                                >
                                    LinkedIn URL
                                </button>
                                <button
                                    onClick={() => setProfileMode('manual')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${profileMode === 'manual' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400'}`}
                                >
                                    Manual Entry
                                </button>
                            </div>

                            {profileMode === 'linkedin' ? (
                                <div className="space-y-4">
                                    <Input
                                        label="LinkedIn Profile URL"
                                        placeholder="https://linkedin.com/in/username"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-500 italic">Our system will automatically extract your professional background from your profile.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Input
                                        label="Current Job Title/Role"
                                        placeholder="Founder at TechFlow"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                    />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-white ml-1">About You</label>
                                        <textarea
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                                            placeholder="Write a brief bio about your expertise and what you're known for..."
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="text-orange-500" size={24} />
                                    Train your AI voice
                                </h2>
                                <p className="text-sm text-gray-400">Add minimum 3 sample posts to help us understand your style.</p>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {samplePosts.map((post, index) => (
                                    <div key={index} className="relative group">
                                        <div className="flex items-center justify-between mb-1 px-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sample {index + 1}</span>
                                            {samplePosts.length > 3 && (
                                                <button onClick={() => removeSamplePost(index)} className="text-gray-500 hover:text-red-400 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                                            placeholder="Paste a recent LinkedIn post here..."
                                            value={post}
                                            onChange={(e) => updateSamplePost(index, e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={addSamplePost}
                                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-purple-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    <span className="font-bold text-sm">Add Another Sample</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1 || loading}
                            className={`flex items-center gap-2 font-bold text-sm transition-all ${currentStep === 1 ? 'opacity-0' : 'text-gray-400 hover:text-white'}`}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        {currentStep < 4 ? (
                            <GradientButton onClick={handleNext} className="h-12 px-8">
                                Continue
                                <ArrowRight className="ml-2" size={18} />
                            </GradientButton>
                        ) : (
                            <GradientButton onClick={handleSubmit} disabled={loading} className="h-12 px-10">
                                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <CheckCircle2 className="mr-2" size={18} />}
                                Finish & Open Dashboard
                            </GradientButton>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Step Indicators (Dots) */}
            <div className="mt-10 flex gap-3">
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${step.id === currentStep ? 'w-8 bg-purple-500' : 'bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
}
