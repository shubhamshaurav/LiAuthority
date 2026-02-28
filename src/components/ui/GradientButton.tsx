
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: ButtonProps) {
    const baseStyles = "relative overflow-hidden rounded-full font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

    const variants = {
        primary: "text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105",
        secondary: "text-[var(--text-primary)] bg-black/5 dark:bg-white/10 backdrop-blur-sm border border-black/10 dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/20 shadow-md",
        outline: "text-[var(--text-primary)] bg-transparent backdrop-blur-sm border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 shadow-md"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-3.5 md:py-4 text-base md:text-lg h-12 md:h-14"
    };

    // Primary gets gradient, secondary/outline are transparent
    const gradientStyle = variant === 'primary' ? {
        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
    } : {};

    return (
        <button
            type="button"
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            style={gradientStyle}
            {...props}
        >
            {children}
        </button>
    );
}
