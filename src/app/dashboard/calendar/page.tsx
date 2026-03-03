'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2, Calendar, Plus, Tag, LayoutGrid, Archive, X, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Post {
    id: string;
    content: string;
    status: string;
    category: string;
    tags: string[];
    source_type: string;
}

interface ScheduledPost {
    id: string;
    scheduled_for: string;
    approval_status: string;
    is_auto_scheduled: boolean;
    post_id: string;
    posts: Post | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CONTENT_TYPES = [
    { id: 'thought_leadership', label: 'Thought Leadership', color: '#22c55e', dot: '🟢' },
    { id: 'story', label: 'Stories', color: '#ef4444', dot: '🔴' },
    { id: 'carousel', label: 'Carousels', color: '#a855f7', dot: '🟣' },
    { id: 'poll', label: 'Polls', color: '#eab308', dot: '🟡' },
    { id: 'announcement', label: 'Announcements', color: '#3b82f6', dot: '🔵' },
];

const APPROVAL_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
    approved: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)', label: 'Posted' },
    pending: { bg: 'rgba(234,179,8,0.15)', text: '#eab308', border: 'rgba(234,179,8,0.3)', label: 'Scheduled' },
    rejected: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)', label: 'Needs review' },
    not_started: { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)', label: 'Not started' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
    const router = useRouter();
    const [today] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'overview' | 'category' | 'tags'>('overview');
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => { fetchData(); }, [year, month]);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const startOfMonth = new Date(year, month, 1).toISOString();
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

        const [{ data: scheduled }, { data: posts }] = await Promise.all([
            supabase.from('scheduled_posts')
                .select('*, posts(id, content, status, category, tags, source_type)')
                .eq('user_id', user.id)
                .gte('scheduled_for', startOfMonth)
                .lte('scheduled_for', endOfMonth)
                .order('scheduled_for', { ascending: true }),
            supabase.from('posts')
                .select('id, content, status, category, tags, source_type')
                .eq('user_id', user.id)
                .order('generated_at', { ascending: false })
                .limit(100),
        ]);

        if (scheduled) setScheduledPosts(scheduled as ScheduledPost[]);
        if (posts) setAllPosts(posts as Post[]);
        setLoading(false);
    };

    // Calendar grid data
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (calendarDays.length % 7 !== 0) calendarDays.push(null);

    const getPostsForDay = (day: number) =>
        scheduledPosts.filter(sp => {
            const d = new Date(sp.scheduled_for);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
                && (!activeFilter || sp.posts?.category === activeFilter);
        });

    const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay.getDate()) : [];

    // Category view: group all posts by category
    const postsByCategory = CONTENT_TYPES.map(ct => ({
        ...ct,
        posts: allPosts.filter(p => (p.category || 'thought_leadership') === ct.id),
    }));

    // Tags view: group by unique tags
    const allTags = [...new Set(allPosts.flatMap(p => p.tags || []))].filter(Boolean);
    const postsByTag = allTags.map(tag => ({
        tag,
        posts: allPosts.filter(p => (p.tags || []).includes(tag)),
    }));

    const prevMonth = () => { setSelectedDay(null); setCurrentDate(new Date(year, month - 1, 1)); };
    const nextMonth = () => { setSelectedDay(null); setCurrentDate(new Date(year, month + 1, 1)); };
    const goToday = () => { setSelectedDay(null); setCurrentDate(new Date()); };

    const getTypeInfo = (cat: string) =>
        CONTENT_TYPES.find(c => c.id === cat) || CONTENT_TYPES[0];

    const downloadPdf = () => {
        setDownloadingPdf(true);
        const rows = scheduledPosts.map(sp => ({
            date: new Date(sp.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: new Date(sp.scheduled_for).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            content: (sp.posts?.content?.slice(0, 110) ?? '—') + (sp.posts?.content && sp.posts.content.length > 110 ? '...' : ''),
            status: sp.approval_status,
            type: getTypeInfo(sp.posts?.category ?? '').label,
        }));

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>Content Calendar — ${MONTHS[month]} ${year}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;padding:40px;color:#1a1a2e}
.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #7c3aed;padding-bottom:18px;margin-bottom:24px}
.logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900}
.brand{display:flex;align-items:center;gap:10px}.bn{font-size:18px;font-weight:900}.bs{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.1em}
.ttl{font-size:24px;font-weight:900;color:#7c3aed;text-align:right}.sub{font-size:11px;color:#6b7280;text-align:right}
.cnt{display:inline-block;background:#f5f3ff;color:#7c3aed;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:700;margin-bottom:14px;border:1px solid #ede9fe}
table{width:100%;border-collapse:collapse}thead tr{background:#f5f3ff}
th{padding:9px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#7c3aed;border-bottom:2px solid #ede9fe}
td{padding:11px 12px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6;vertical-align:top}
tr:nth-child(even){background:#fafafa}
.badge{display:inline-block;padding:2px 7px;border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
.approved{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
.pending{background:#fefce8;color:#ca8a04;border:1px solid #fde68a}
.rejected{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
.empty{text-align:center;padding:40px;color:#9ca3af;font-style:italic}
.footer{margin-top:28px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:14px}
</style></head><body>
<div class="hdr"><div class="brand"><div class="logo">L</div><div><div class="bn">LiAuthority</div><div class="bs">LinkedIn Content OS</div></div></div>
<div><div class="ttl">${MONTHS[month]} ${year}</div><div class="sub">Content Calendar</div></div></div>
${rows.length > 0
                ? `<div class="cnt">${rows.length} posts scheduled</div>
<table><thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Preview</th></tr></thead><tbody>
${rows.map(r => `<tr><td><strong>${r.date}</strong></td><td style="font-family:monospace;color:#7c3aed">${r.time}</td><td>${r.type}</td><td><span class="badge ${r.status}">${r.status}</span></td><td>${r.content}</td></tr>`).join('')}
</tbody></table>`
                : '<div class="empty">No posts scheduled for this month.</div>'}
<div class="footer">Generated by LiAuthority · ${new Date().toLocaleDateString()}</div>
<script>setTimeout(()=>{window.focus();window.print()},400)</script></body></html>`;

        const win = window.open('', '_blank');
        if (win) { win.document.write(html); win.document.close(); }
        setDownloadingPdf(false);
    };

    // ── Tabs ──────────────────────────────────────────────────────────────────
    const TABS = [
        { id: 'overview', label: 'Overview', icon: Calendar },
        { id: 'category', label: 'Category', icon: LayoutGrid },
        { id: 'tags', label: 'Tags', icon: Tag },
        { id: 'archive', label: 'Archive', icon: Archive },
    ] as const;

    return (
        <div className="flex gap-0 min-h-screen -m-8">
            {/* ─── Left Sidebar ─────────────────────────────────────────── */}
            <aside className="w-52 shrink-0 flex flex-col gap-6 p-5 border-r"
                style={{ background: 'rgba(18,9,28,0.95)', borderColor: 'rgba(124,58,237,0.15)' }}>

                {/* Indicators */}
                <div>
                    <div className="text-sm font-black text-white mb-3 tracking-tight">Indicators</div>
                    <div className="space-y-2">
                        {CONTENT_TYPES.map(ct => (
                            <button
                                key={ct.id}
                                onClick={() => setActiveFilter(activeFilter === ct.id ? null : ct.id)}
                                className="flex items-center gap-2.5 w-full text-left rounded-lg px-2 py-1.5 transition-all"
                                style={{
                                    background: activeFilter === ct.id ? `${ct.color}18` : 'transparent',
                                    border: activeFilter === ct.id ? `1px solid ${ct.color}44` : '1px solid transparent',
                                }}
                            >
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: ct.color }} />
                                <span className="text-xs font-semibold"
                                    style={{ color: activeFilter === ct.id ? ct.color : 'rgba(255,255,255,0.6)' }}>
                                    {ct.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    {activeFilter && (
                        <button onClick={() => setActiveFilter(null)}
                            className="mt-2 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-all"
                            style={{ color: 'rgba(147,112,219,0.6)', background: 'rgba(124,58,237,0.08)' }}>
                            <X size={9} /> Clear filter
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px" style={{ background: 'rgba(124,58,237,0.15)' }} />

                {/* Quick Button */}
                <div>
                    <div className="text-sm font-black text-white mb-3 tracking-tight">Quick Button</div>
                    <div className="space-y-1.5">
                        {CONTENT_TYPES.map(ct => (
                            <button
                                key={ct.id}
                                onClick={() => router.push(`/dashboard/create?category=${ct.id}`)}
                                className="flex items-center gap-2.5 w-full text-left rounded-lg px-2 py-1.5 transition-all hover:bg-white/5 group"
                            >
                                <Plus size={10} style={{ color: ct.color }} className="shrink-0" />
                                <span className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition-colors truncate">
                                    New {ct.label.replace('Thought Leadership', 'Thought Post')}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px mt-auto" style={{ background: 'rgba(124,58,237,0.15)' }} />

                {/* Download */}
                <button onClick={downloadPdf} disabled={downloadingPdf || scheduledPosts.length === 0}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl font-black text-xs transition-all disabled:opacity-40 w-full justify-center"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff' }}>
                    {downloadingPdf ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    Export PDF
                </button>
            </aside>

            {/* ─── Main Content ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Tab Bar */}
                <div className="flex items-center justify-between px-6 py-3 border-b"
                    style={{ background: 'rgba(18,9,28,0.8)', borderColor: 'rgba(124,58,237,0.12)' }}>
                    <div className="flex items-center gap-1">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const active = activeTab === (tab.id as any) || (tab.id === 'archive' && activeTab === 'archive');
                            return (
                                <button key={tab.id}
                                    onClick={() => setActiveTab(tab.id === 'archive' ? 'overview' : tab.id as any)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    style={activeTab === tab.id
                                        ? { background: 'rgba(124,58,237,0.2)', color: '#c084fc', border: '1px solid rgba(124,58,237,0.3)' }
                                        : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}>
                                    <Icon size={12} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Month nav (only for overview) */}
                    {activeTab === 'overview' && (
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                                style={{ color: '#9370db' }}><ChevronLeft size={15} /></button>
                            <button onClick={goToday} className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5"
                                style={{ color: 'rgba(255,255,255,0.6)' }}>Today</button>
                            <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                                style={{ color: '#9370db' }}><ChevronRight size={15} /></button>
                        </div>
                    )}
                </div>

                {/* ── OVERVIEW TAB ───────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="flex flex-col flex-1">
                        {/* Month heading */}
                        <div className="px-6 py-3 flex items-center gap-3 border-b"
                            style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
                            <span className="text-base font-black text-white">{MONTHS[month]} {year}</span>
                            {activeFilter && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                                    style={{ background: `${getTypeInfo(activeFilter).color}22`, color: getTypeInfo(activeFilter).color, border: `1px solid ${getTypeInfo(activeFilter).color}44` }}>
                                    {getTypeInfo(activeFilter).label}
                                </span>
                            )}
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
                            {DAYS.map(d => (
                                <div key={d} className="py-2.5 text-center text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: 'rgba(147,112,219,0.45)' }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 flex-1">
                            {calendarDays.map((day, idx) => {
                                const dayPosts = day ? getPostsForDay(day) : [];
                                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                const isSel = selectedDay && day === selectedDay.getDate() && selectedDay.getMonth() === month && selectedDay.getFullYear() === year;

                                return (
                                    <div key={idx}
                                        onClick={() => day && setSelectedDay(new Date(year, month, day))}
                                        className="min-h-[100px] p-1.5 border-r border-b transition-all"
                                        style={{
                                            borderColor: 'rgba(124,58,237,0.07)',
                                            background: isSel ? 'rgba(124,58,237,0.12)' : isToday ? 'rgba(236,72,153,0.05)' : day ? 'transparent' : 'rgba(0,0,0,0.12)',
                                            cursor: day ? 'pointer' : 'default',
                                        }}>
                                        {day && (
                                            <>
                                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black mb-1"
                                                    style={isToday
                                                        ? { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff' }
                                                        : { color: 'rgba(255,255,255,0.55)' }}>
                                                    {day}
                                                </div>
                                                <div className="space-y-0.5">
                                                    {dayPosts.slice(0, 3).map(sp => {
                                                        const ct = getTypeInfo(sp.posts?.category ?? '');
                                                        return (
                                                            <div key={sp.id}
                                                                className="text-[8px] font-bold px-1 py-0.5 rounded truncate flex items-center gap-1"
                                                                style={{ background: `${ct.color}1a`, color: ct.color, border: `1px solid ${ct.color}33` }}>
                                                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ct.color }} />
                                                                {new Date(sp.scheduled_for).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        );
                                                    })}
                                                    {dayPosts.length > 3 && (
                                                        <div className="text-[8px] font-black" style={{ color: '#9370db' }}>+{dayPosts.length - 3}</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Selected day panel */}
                        {selectedDay && (
                            <div className="border-t" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(20,10,35,0.97)' }}>
                                <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
                                    <div className="font-black text-white text-sm">
                                        {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        <span className="ml-2 text-xs font-normal" style={{ color: '#9370db' }}>{selectedDayPosts.length} posts</span>
                                    </div>
                                    <button onClick={() => setSelectedDay(null)} className="text-white/30 hover:text-white/60 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar">
                                    {selectedDayPosts.length > 0 ? selectedDayPosts.map(sp => {
                                        const ct = getTypeInfo(sp.posts?.category ?? '');
                                        const ap = APPROVAL_COLORS[sp.approval_status] || APPROVAL_COLORS.not_started;
                                        return (
                                            <div key={sp.id} className="min-w-[220px] max-w-[260px] rounded-xl p-3 border shrink-0"
                                                style={{ background: 'rgba(30,15,50,0.8)', borderColor: 'rgba(124,58,237,0.2)' }}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                                        style={{ background: `${ct.color}22`, color: ct.color, border: `1px solid ${ct.color}44` }}>
                                                        {ct.label}
                                                    </span>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                                        style={{ background: ap.bg, color: ap.text, border: `1px solid ${ap.border}` }}>
                                                        {ap.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/70 leading-relaxed line-clamp-3">{sp.posts?.content || 'No content'}</p>
                                                <div className="flex items-center gap-1 mt-2" style={{ color: '#9370db' }}>
                                                    <Clock size={10} />
                                                    <span className="text-[9px]">{new Date(sp.scheduled_for).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="py-6 px-4 text-sm text-white/30">No posts scheduled on this day.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── CATEGORY TAB ───────────────────────────────────────── */}
                {activeTab === 'category' && (
                    <div className="flex gap-4 p-5 overflow-x-auto no-scrollbar flex-1">
                        {postsByCategory.map(col => (
                            <div key={col.id} className="min-w-[220px] w-56 shrink-0 flex flex-col gap-3">
                                {/* Column header */}
                                <div className="flex items-center gap-2 pb-1">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                                    <span className="text-xs font-black text-white">{col.label}</span>
                                    <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full"
                                        style={{ background: `${col.color}22`, color: col.color }}>{col.posts.length}</span>
                                </div>
                                {/* Cards */}
                                {col.posts.length > 0 ? col.posts.map(post => {
                                    const status = post.status === 'published' ? 'approved' : post.status === 'scheduled' ? 'pending' : 'not_started';
                                    const ap = APPROVAL_COLORS[status];
                                    return (
                                        <div key={post.id} className="rounded-xl p-3 border transition-all hover:-translate-y-0.5"
                                            style={{ background: 'rgba(25,12,40,0.9)', borderColor: 'rgba(124,58,237,0.18)' }}>
                                            <p className="text-xs text-white/75 leading-relaxed line-clamp-3 mb-2">{post.content}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                                    style={{ background: ap.bg, color: ap.text, border: `1px solid ${ap.border}` }}>
                                                    {ap.label}
                                                </span>
                                                {post.tags?.length > 0 && (
                                                    <span className="text-[9px]" style={{ color: 'rgba(147,112,219,0.5)' }}>
                                                        #{post.tags[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="rounded-xl p-4 text-center border border-dashed"
                                        style={{ borderColor: 'rgba(124,58,237,0.15)' }}>
                                        <p className="text-[10px] text-white/20">No {col.label.toLowerCase()} yet</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── TAGS TAB ───────────────────────────────────────────── */}
                {activeTab === 'tags' && (
                    <div className="p-5 space-y-6 overflow-y-auto">
                        {postsByTag.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Tag size={32} style={{ color: 'rgba(147,112,219,0.3)' }} />
                                <p className="text-sm text-white/30 font-bold">No tags found</p>
                                <p className="text-xs" style={{ color: 'rgba(147,112,219,0.3)' }}>Add tags to your posts to see them categorised here</p>
                            </div>
                        ) : postsByTag.map(({ tag, posts }) => (
                            <div key={tag}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black text-white/50">#</span>
                                    <span className="text-sm font-black text-white">{tag}</span>
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                                        style={{ background: 'rgba(124,58,237,0.15)', color: '#c084fc' }}>{posts.length}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {posts.map(post => {
                                        const ct = getTypeInfo(post.category);
                                        return (
                                            <div key={post.id} className="rounded-xl p-3 border"
                                                style={{ background: 'rgba(25,12,40,0.9)', borderColor: `${ct.color}33` }}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: ct.color }} />
                                                    <span className="text-[9px] font-black" style={{ color: ct.color }}>{ct.label}</span>
                                                </div>
                                                <p className="text-xs text-white/70 leading-relaxed line-clamp-3">{post.content}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
