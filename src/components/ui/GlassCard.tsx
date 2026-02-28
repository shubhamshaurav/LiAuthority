
import React from 'react';
import clsx from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
    return (
        <div
            className={clsx('glass-panel rounded-2xl p-4 md:p-6 transition-all duration-300 hover:bg-[rgba(var(--glass-border))]', className)}
            {...props}
        >
            {children}
        </div>
    );
}
