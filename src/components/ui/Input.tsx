
import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-sm font-bold text-[hsl(var(--text-primary))] ml-1">
                    {label}
                </label>
            )}
            <input
                className={clsx(
                    "w-full rounded-xl px-4 py-3.5 text-base md:text-sm transition-all duration-200",
                    "bg-white/5 dark:bg-white/5 bg-black/5",
                    "border border-[rgba(var(--glass-border))]",
                    "text-[hsl(var(--text-primary))]",
                    "placeholder:text-[hsl(var(--text-secondary))] placeholder:opacity-50",
                    "focus:outline-none focus:border-purple-500/50",
                    "focus:bg-white/10 dark:focus:bg-white/10 focus:bg-purple-50/50",
                    "focus:ring-1 focus:ring-purple-500/20",
                    "hover:border-purple-500/30",
                    error && "border-red-500/50 focus:border-red-500",
                    className
                )}
                {...props}
            />
            {error && (
                <span className="text-xs text-red-600 dark:text-red-400 ml-1 font-medium">{error}</span>
            )}
        </div>
    );
}
