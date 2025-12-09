'use client';

import { Suspense, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Lazy load heavy 3D background
const SceneContainer = dynamic(() => import('@/components/Three/SceneContainer'), { ssr: false });
const AuroraBackground = dynamic(() => import('@/components/Three/AuroraBackground'), { ssr: false });

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
    showAurora?: boolean;
}

export default function PageWrapper({ children, className = '', showAurora = true }: PageWrapperProps) {
    const t = useTranslations('common');

    return (
        <div className={`min-h-screen bg-[#0f172a] text-white overflow-x-hidden ${className}`}>

            {/* 🌌 GLOBAL AURORA LAYER */}
            {showAurora && (
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <Suspense fallback={<div className="w-full h-full bg-[#0f172a]" />}>
                        <SceneContainer className="w-full h-full">
                            <AuroraBackground />
                        </SceneContainer>
                    </Suspense>
                </div>
            )}

            {/* Navigation (Shared) with Language Switcher */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-[#0f172a]/20">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl group-hover:animate-spin">🔮</span>
                        <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            {t('brand')}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                        <Link href="/" className="hover:text-cyan-400 transition">{t('dashboard')}</Link>
                        <Link href="/pricing" className="hover:text-cyan-400 transition">{t('pricing')}</Link>
                        <Link href="/affiliate" className="hover:text-cyan-400 transition">{t('affiliate')}</Link>
                        <Link href="/beta" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                            {t('beta')}
                        </Link>

                        {/* 🌐 WOW Language Switcher */}
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-24 pb-12 container mx-auto px-6">
                {children}
            </main>

            {/* Footer (Shared) */}
            <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-sm py-8">
                <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
                    <div className="flex justify-center gap-6 mb-4">
                        <Link href="/terms" className="hover:text-white transition">{t('terms')}</Link>
                        <Link href="/privacy" className="hover:text-white transition">{t('privacy')}</Link>
                        <Link href="#" className="hover:text-white transition">{t('support')}</Link>
                    </div>
                    © 2026 VN30-Quantum
                </div>
            </footer>
        </div>
    );
}
