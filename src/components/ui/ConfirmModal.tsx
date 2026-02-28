'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { GradientButton } from './GradientButton';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'info';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info'
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md z-10"
                    >
                        <GlassCard className="p-6 md:p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'
                                    }`}>
                                    <AlertTriangle size={24} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white">{title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {description}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm"
                                    >
                                        {cancelText}
                                    </button>
                                    <GradientButton
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                        className={`flex-1 ${variant === 'danger' ? 'from-red-600 to-orange-600' : ''}`}
                                    >
                                        {confirmText}
                                    </GradientButton>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
