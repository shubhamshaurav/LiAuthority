'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Bot, Shield, Zap, Calendar, BarChart3, Users,
  Star, CheckCircle, XCircle, ChevronDown, Sparkles, TrendingUp, Target,
  Mic, PenSquare, Globe, Award, Menu, X, MessageSquare
} from 'lucide-react';
import { PLANS } from '@/lib/plans';

// ── tiny helpers ──────────────────────────────────────────────────────────────
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border"
      style={{ background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)', color: '#c084fc' }}>
      {children}
    </span>
  );
}

function GradBtn({ href, children, outline = false, className = '' }: { href: string; children: React.ReactNode; outline?: boolean; className?: string }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 font-black text-sm px-6 py-3 rounded-full transition-all hover:scale-[1.04] active:scale-100 ${outline ? 'border text-white border-white/20 hover:bg-white/5' : 'text-white'} ${className}`}
      style={outline ? {} : { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 6px 24px rgba(124,58,237,0.4)' }}>
      {children}
    </Link>
  );
}

// animated counter
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = to / 60;
      const id = setInterval(() => {
        start = Math.min(start + step, to);
        setVal(Math.round(start));
        if (start >= to) clearInterval(id);
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  {
    icon: Bot, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)',
    title: 'AI Authority Engine',
    desc: 'Learns your voice, tone, and expertise to generate posts that sound exactly like you — only sharper.',
  },
  {
    icon: Calendar, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.25)',
    title: 'Content Calendar',
    desc: 'Plan, schedule, and visualise your entire content strategy in a beautiful Notion-style calendar.',
  },
  {
    icon: Mic, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)',
    title: 'Voice & Persona',
    desc: 'Train your unique writing style once. Every piece of content reflects your authentic professional identity.',
  },
  {
    icon: Target, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)',
    title: 'Campaign Scheduling',
    desc: 'Plan and schedule your posts in advance across days, weeks, or months — never miss a publishing window.',
  },
  {
    icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)',
    title: 'Analytics & Insights',
    desc: "Track posts, engagement trends, and what's working — all in one clean dashboard.",
  },
  {
    icon: Users, color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.25)',
    title: 'Referral Program',
    desc: 'Earn 20% recurring commission for up to 2 years for every person you refer. Real passive income.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Set Your Persona', desc: 'Tell LiAuthority your niche, tone, and style. It learns your voice so every post sounds authentically you.' },
  { step: '02', title: 'Define Your ICP', desc: 'Specify your ideal audience — decision makers, industry, job titles — so content attracts the right people.' },
  { step: '03', title: 'Generate & Schedule', desc: 'Let AI create thought leadership posts, carousels, stories, and polls. Schedule them in the content calendar.' },
  { step: '04', title: 'Grow Your Authority', desc: 'Watch your LinkedIn presence grow consistently without spending hours writing every day.' },
];


const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Founder @ GrowthLoop', avatar: 'PS', text: 'LiAuthority tripled my LinkedIn impressions in 3 weeks. The AI actually sounds like me — not a robot.', stars: 5 },
  { name: 'Marcus Webb', role: 'B2B Sales Lead', avatar: 'MW', text: 'I went from 500 to 12k followers in 90 days. The content calendar alone is worth the price.', stars: 5 },
  { name: 'Ananya Iyer', role: 'Personal Brand Coach', avatar: 'AI', text: "I recommend LiAuthority to all my clients. It's the only tool that truly preserves their unique voice.", stars: 5 },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <main className="min-h-screen bg-[#060010] text-white overflow-x-hidden selection:bg-purple-500/30">

      {/* ── Animated background orbs ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/5 backdrop-blur-2xl' : ''}`}
        style={scrolled ? { background: 'rgba(6,0,16,0.85)' } : {}}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
              <img src="/logo.png" alt="LiAuthority Logo" className="w-5 h-5 object-contain brightness-0 invert" />
            </div>
            <span className="text-lg font-black tracking-tight">LiAuthority</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/50">
            {[['#features', 'Features'], ['#how', 'How it Works'], ['#pricing', 'Pricing'], ['/blog', 'Blog']].map(([href, label]) => (
              <a key={label} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-white/50 hover:text-white transition-colors">Sign in</Link>
            <GradBtn href="/login">Get Started <ArrowRight size={14} /></GradBtn>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white/60" onClick={() => setNavOpen(v => !v)}>
            {navOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {navOpen && (
          <div className="md:hidden px-6 pb-6 pt-2 space-y-4 border-t border-white/5"
            style={{ background: 'rgba(6,0,16,0.95)' }}>
            {[['#features', 'Features'], ['#how', 'How it Works'], ['#pricing', 'Pricing'], ['/blog', 'Blog']].map(([href, label]) => (
              <a key={label} href={href} onClick={() => setNavOpen(false)} className="block text-sm font-bold text-white/60 hover:text-white">{label}</a>
            ))}
            <GradBtn href="/login" className="w-full justify-center">Get Started <ArrowRight size={14} /></GradBtn>
          </div>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <Badge><Sparkles size={10} />Build Real LinkedIn Authority — Powered by AI</Badge>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
            Stop blending in.<br />
            <span style={{ background: 'linear-gradient(135deg,#c084fc,#ec4899,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Become the authority
            </span><br />
            your audience trusts.
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            LiAuthority uses AI to learn your voice, generate scroll-stopping posts, and grow your LinkedIn presence —
            so you focus on what only you can do.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GradBtn href="/login" className="px-8 py-4 text-base">
              Start for Free <ArrowRight size={16} />
            </GradBtn>
            <a href="#how" className="inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-colors">
              See how it works <ChevronDown size={14} />
            </a>
          </div>

          {/* Social proof pill */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {['#7c3aed', '#ec4899', '#38bdf8', '#34d399', '#f59e0b'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#060010] flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-xs text-white/40 font-semibold">
              <span className="text-white font-black">1,200+</span> creators growing their authority
            </div>
          </div>
        </div>

        {/* Hero dashboard mockup */}
        <div className="mt-16 max-w-4xl mx-auto relative">
          <div className="absolute inset-0 rounded-2xl blur-3xl -z-10"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.6),rgba(236,72,153,0.5))' }} />
          <div className="rounded-2xl overflow-hidden border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(124,58,237,0.25)' }}>
            {/* mock topbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <div className="flex-1 mx-4 h-5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            {/* mock content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Posts Created', val: '147', trend: '+24%', color: '#a855f7' },
                { label: 'Impressions', val: '89.4K', trend: '+312%', color: '#ec4899' },
                { label: 'Profile Views', val: '3,210', trend: '+87%', color: '#38bdf8' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{s.label}</p>
                  <p className="text-2xl font-black text-white mt-1">{s.val}</p>
                  <p className="text-[10px] font-black mt-1" style={{ color: '#22c55e' }}>{s.trend} this month</p>
                </div>
              ))}
            </div>
            {/* mock post preview */}
            <div className="px-6 pb-6">
              <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full" style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }} />
                  <div>
                    <p className="text-xs font-black text-white">You</p>
                    <p className="text-[9px] text-white/30">AI-generated · Just now</p>
                  </div>
                  <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Published</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  🔑 The best LinkedIn posts don't talk about your product. They solve your reader's problem before they even ask.<br /><br />
                  Here's the 3-part formula I use to write posts that get 10k+ impressions consistently...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Creators', to: 1200, suffix: '+' },
            { label: 'Posts Generated', to: 48000, suffix: '+' },
            { label: 'Avg. Impression Lift', to: 310, suffix: '%' },
            { label: 'Countries', to: 42, suffix: '+' },
          ].map(s => (
            <div key={s.label} className="text-center p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-3xl md:text-4xl font-black text-white">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="text-xs text-white/40 font-semibold mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <Badge><Zap size={10} />Everything you need</Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Your complete LinkedIn<br />authority toolkit
            </h2>
            <p className="text-white/40 text-base">All the tools. One platform. Zero guesswork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-2xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 0 0 transparent' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base mb-1">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ──────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <Badge><Globe size={10} />Simple by design</Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Go from zero to authority<br />in 4 steps
            </h2>
          </div>

          <div className="space-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="flex items-start gap-6 p-6 rounded-2xl group hover:-translate-x-1 transition-transform"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-4xl font-black shrink-0 w-14 text-center"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {step.step}
                </div>
                <div>
                  <h3 className="font-black text-white text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>
                <div className="ml-auto shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/40 transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <Badge><Star size={10} />Loved by creators</Badge>
            <h2 className="text-4xl font-black">What they're saying</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <figure key={t.name} className="p-6 rounded-2xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex gap-0.5" aria-hidden="true">
                  {Array(t.stars).fill(0).map((_, i) => (
                    <Star key={i} size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <blockquote className="text-sm text-white/60 leading-relaxed italic">
                  "{t.text}"
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>{t.avatar}</div>
                  <div>
                    <cite className="not-italic text-xs font-black text-white block">{t.name}</cite>
                    <p className="text-[10px] text-white/30">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-4">
            <Badge><Award size={10} />Simple pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Invest in your authority
            </h2>
            <p className="text-white/40">Start free. Upgrade when you&apos;re ready to scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PLANS.map((plan) => {
              const isPro = plan.popular;
              return (
                <div key={plan.id} className="relative p-6 rounded-2xl space-y-5"
                  style={{
                    background: isPro
                      ? 'linear-gradient(150deg,rgba(124,58,237,0.22),rgba(236,72,153,0.12))'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isPro ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: isPro ? '0 0 40px rgba(124,58,237,0.15)' : 'none',
                  }}>

                  {/* Popular badge */}
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full text-white"
                        style={{ background: plan.gradient }}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan icon + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: plan.gradient }}>
                      <plan.icon size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base">{plan.name}</h3>
                      <p className="text-[10px] text-white/30 font-semibold">{plan.buttonSub}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">${plan.price}</span>
                    <span className="text-white/40 text-sm mb-1">{plan.price === 0 ? 'Free forever' : '/ month'}</span>
                  </div>

                  {/* Metric pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black"
                    style={{ background: `${plan.accent}22`, color: plan.accent, border: `1px solid ${plan.accent}44` }}>
                    {plan.metric} {plan.unit}
                  </div>

                  {/* Included features */}
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-white/70">
                        <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                        {f}
                      </li>
                    ))}
                    {plan.notIncluded.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-white/30">
                        <XCircle size={13} className="shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <GradBtn href="/login" outline={!isPro} className="w-full justify-center">
                    {plan.buttonText} {isPro && <ArrowRight size={13} />}
                  </GradBtn>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ Section (AEO optimized) ──────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge><MessageSquare size={10} />Got Questions?</Badge>
            <h2 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h2>
            <p className="text-white/40">Everything you need to know about building your LinkedIn authority.</p>
          </div>

          <div className="grid gap-6">
            {[
              {
                q: "What is LiAuthority?",
                a: "LiAuthority is an AI-powered LinkedIn authority builder that helps you create authentic content, schedule posts, and grow your professional presence autonomously. It's designed for founders, creators, and professionals who want to lead their niche."
              },
              {
                q: "How does the AI learn my voice?",
                a: "Our proprietary AI analyzes your niche, past posts, and specific tone instructions to create a 'Voice & Persona' that sounds exactly like you. It maintains your professional consistency while sharpening your messaging."
              },
              {
                q: "Is my LinkedIn account safe using LiAuthority?",
                a: "Yes, account safety is our priority. We use enterprise-grade safety systems, identity protection, and compliance-aware post generation to ensure your profile remains secure and within platform standards."
              },
              {
                q: "What is the referral program?",
                a: "Our referral program allows you to earn a 20% recurring commission for up to 2 years for every user you refer to LiAuthority. It's a great way to earn passive income while helping your network grow."
              }
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-3">
                  <span className="text-purple-500 font-black">Q.</span> {faq.q}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed ml-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JSON-LD Structured Data ───────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "LiAuthority",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "Professional LinkedIn Authority Builder powered by AI.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is LiAuthority?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "LiAuthority is an AI-powered LinkedIn authority builder that helps you create authentic content, schedule posts, and grow your professional presence autonomously."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How does the AI learn my voice?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our proprietary AI analyzes your niche, past posts, and specific tone instructions to create a 'Voice & Persona' that sounds exactly like you."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-3xl p-12 space-y-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.45),rgba(236,72,153,0.35))', border: '1px solid rgba(124,58,237,0.6)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
              style={{ background: 'rgba(236,72,153,0.5)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"
              style={{ background: 'rgba(124,58,237,0.5)' }} />
          </div>
          <Badge><Sparkles size={10} />Limited Alpha Access</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight relative z-10">
            Ready to become<br />the authority in your niche?
          </h2>
          <p className="text-white/50 max-w-md mx-auto relative z-10">
            Join 1,200+ LinkedIn creators who are building real authority with AI.
          </p>
          <div className="relative z-10">
            <GradBtn href="/login" className="px-10 py-4 text-base">
              Start Building Authority <ArrowRight size={16} />
            </GradBtn>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
              <img src="/logo.png" alt="LiAuthority Logo" className="w-4 h-4 object-contain brightness-0 invert" />
            </div>
            <span className="font-black text-sm text-white">LiAuthority</span>
            <span className="text-white/20 text-xs ml-2">Part of the LIReach Ecosystem</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/30 font-semibold">
            {[['#features', 'Features'], ['#how', 'How it Works'], ['#pricing', 'Pricing'], ['/blog', 'Blog'], ['/login', 'Sign in']].map(([h, l]) => (
              <a key={l} href={h} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <p className="text-white/20 text-xs">© 2026 LiAuthority. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
