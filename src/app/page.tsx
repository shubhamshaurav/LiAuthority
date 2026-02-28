'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Shield, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-1 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <img src="/logo.png" alt="LiAuthority Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">LiAuthority</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-purple-400 transition-colors">How it Works</a>
            <a href="/blog" className="hover:text-purple-400 transition-colors">Blog</a>
            <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/login">
              <GradientButton size="sm" className="font-extrabold px-6">
                Get Started
              </GradientButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            LiAuthority Alpha: Build Real LinkedIn Authority
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
            The standard for <br />
            <span className="text-gray-500 italic">LinkedIn excellence.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Autonomous AI agents that don't just send messages. They build authority,
            nurture real connections, and position you as the top 1% in your industry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <GradientButton size="lg" className="w-full sm:w-auto px-10 py-4 h-auto text-lg font-bold">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </GradientButton>
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* Basic Features Section to show UI cards */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Bot size={24} />
            </div>
            <h3 className="text-xl font-bold">Authority Agents</h3>
            <p className="text-gray-400 text-sm">AI that understands your voice and build content that converts.</p>
          </GlassCard>

          <GlassCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold">Identity Protection</h3>
            <p className="text-gray-400 text-sm">Enterprise-grade safety systems to keep your profile secure.</p>
          </GlassCard>

          <GlassCard className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Viral Velocity</h3>
            <p className="text-gray-400 text-sm">Proprietary logic to maximize your reach across LinkedIn networks.</p>
          </GlassCard>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-gray-500 text-xs tracking-widest uppercase">
          &copy; 2026 LiAuthority. Part of the LIReach Ecosystem.
        </p>
      </footer>
    </main>
  );
}
